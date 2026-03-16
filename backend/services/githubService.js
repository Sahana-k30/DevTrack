const axios = require('axios');
const GitHubData = require('../models/GitHubData');

const GITHUB_API = 'https://api.github.com';

const githubAxios = (token) => axios.create({
  baseURL: GITHUB_API,
  headers: {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github.v3+json',
  },
});

const fetchAndStoreGitHubData = async (userId, username, accessToken) => {
  const User = require('../models/User');
  const user = await User.findById(userId);
  const token = accessToken || user.githubAccessToken;
  const uname = username || user.githubProfile.username;

  if (!token) throw new Error('No GitHub access token found');

  const api = githubAxios(token);
  console.log(`Fetching GitHub data for ${uname}...`);

  // Fetch repos
  const { data: repos } = await api.get(`/user/repos?per_page=100&sort=updated&type=owner`);

  // Build language distribution
  const languageDistribution = {};
  for (const repo of repos) {
    if (repo.language) {
      languageDistribution[repo.language] = (languageDistribution[repo.language] || 0) + 1;
    }
  }

  // Fetch commits for each repo (last 90 days)
  const since = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
  const allCommits = [];

  for (const repo of repos.slice(0, 20)) {
    try {
      const { data: commits } = await api.get(
        `/repos/${repo.full_name}/commits?author=${uname}&since=${since}&per_page=100`
      );
      for (const c of commits) {
        allCommits.push({
          sha: c.sha,
          message: c.commit.message,
          date: new Date(c.commit.author.date),
          repo: repo.name,
        });
      }
    } catch {
      // repo may be empty or inaccessible
    }
  }

  // Compute weekly commits
  const weeklyMap = {};
  for (const commit of allCommits) {
    const weekKey = getWeekKey(commit.date);
    weeklyMap[weekKey] = (weeklyMap[weekKey] || 0) + 1;
  }
  const weeklyCommits = Object.entries(weeklyMap)
    .map(([week, count]) => ({ week, count }))
    .sort((a, b) => a.week.localeCompare(b.week));

  // PR analytics
  let allPRs = [];
  try {
    const { data: searchResults } = await api.get(
      `/search/issues?q=author:${uname}+type:pr&per_page=50&sort=created`
    );
    allPRs = searchResults.items.map(pr => ({
      title: pr.title,
      repo: pr.repository_url.split('/').slice(-1)[0],
      state: pr.pull_request?.merged_at ? 'merged' : pr.state,
      createdAt: new Date(pr.created_at),
      mergedAt: pr.pull_request?.merged_at ? new Date(pr.pull_request.merged_at) : null,
    }));
  } catch (e) {
    console.log('PR fetch skipped:', e.message);
  }

  const streak = calculateCommitStreak(allCommits);

  // ✅ Fixed: returnDocument instead of new: true
  const githubData = await GitHubData.findOneAndUpdate(
    { userId },
    {
      userId,
      username: uname,
      repos: repos.slice(0, 50).map(r => ({
        name: r.name,
        description: r.description,
        url: r.html_url,
        language: r.language,
        stars: r.stargazers_count,
        forks: r.forks_count,
        isPrivate: r.private,
        createdAt: new Date(r.created_at),
        updatedAt: new Date(r.updated_at),
        topics: r.topics || [],
      })),
      commits: allCommits.slice(0, 200),
      pullRequests: allPRs,
      languageDistribution,
      weeklyCommits,
      contributionStreak: streak,
      totalCommits: allCommits.length,
      totalPRs: allPRs.length,
      totalStars: repos.reduce((s, r) => s + r.stargazers_count, 0),
      updatedAt: new Date(),
    },
    { upsert: true, returnDocument: 'after' } // ✅ fixed deprecation
  );

  console.log(`✅ GitHub data saved for ${uname}: ${allCommits.length} commits, ${repos.length} repos`);
  return githubData;
};

// ✅ Fixed: removed Redis cache — was returning stale null and causing infinite loop
const getGitHubData = async (userId) => {
  return GitHubData.findOne({ userId }).lean();
};

const calculateCommitStreak = (commits) => {
  if (!commits.length) return { current: 0, longest: 0 };
  const days = [...new Set(commits.map(c => c.date.toISOString().split('T')[0]))].sort().reverse();
  let current = 1, longest = 1, streak = 1;
  for (let i = 0; i < days.length - 1; i++) {
    const diff = (new Date(days[i]) - new Date(days[i + 1])) / 86400000;
    if (diff === 1) {
      streak++;
      if (i === 0) current = streak;
    } else {
      if (i === 0) current = 1;
      longest = Math.max(longest, streak);
      streak = 1;
    }
  }
  return { current, longest: Math.max(longest, streak) };
};

const getWeekKey = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  return monday.toISOString().split('T')[0];
};

module.exports = { fetchAndStoreGitHubData, getGitHubData };