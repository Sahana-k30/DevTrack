// services/githubService.js
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
  console.log(`[GitHub] Fetching data for ${uname}...`);

  // ── Fetch ALL repos (paginate through all pages) ──
  let allRepos = [];
  let page = 1;
  while (true) {
    const { data: pageRepos } = await api.get(
      `/user/repos?per_page=100&sort=updated&type=owner&page=${page}`
    );
    allRepos = allRepos.concat(pageRepos);
    if (pageRepos.length < 100) break; // last page
    page++;
  }
  console.log(`[GitHub] Found ${allRepos.length} repos`);

  // ── Language distribution across all repos ──
  const languageDistribution = {};
  for (const repo of allRepos) {
    if (repo.language) {
      languageDistribution[repo.language] = (languageDistribution[repo.language] || 0) + 1;
    }
  }

  // ── Fetch commits for last 1 YEAR (not just 90 days) ──
  const since = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString();
  const allCommits = [];

  // Fetch commits from top 30 most recently updated repos
  const reposToScan = allRepos
    .filter(r => !r.archived && !r.fork) // skip archived and forked repos
    .slice(0, 30);

  for (const repo of reposToScan) {
    try {
      const { data: commits } = await api.get(
        `/repos/${repo.full_name}/commits?author=${uname}&since=${since}&per_page=100`
      );
      for (const c of commits) {
        allCommits.push({
          sha:     c.sha,
          message: c.commit.message,
          date:    new Date(c.commit.author.date),
          repo:    repo.name,
          additions: c.stats?.additions || 0,
          deletions: c.stats?.deletions || 0,
        });
      }
    } catch {
      // repo may be empty or inaccessible — skip silently
    }
  }

  // Sort commits newest first
  allCommits.sort((a, b) => new Date(b.date) - new Date(a.date));
  console.log(`[GitHub] Found ${allCommits.length} commits in the last year`);

  // ── Weekly commits map ──
  const weeklyMap = {};
  for (const commit of allCommits) {
    const weekKey = getWeekKey(commit.date);
    weeklyMap[weekKey] = (weeklyMap[weekKey] || 0) + 1;
  }
  const weeklyCommits = Object.entries(weeklyMap)
    .map(([week, count]) => ({ week, count }))
    .sort((a, b) => a.week.localeCompare(b.week));

  // ── Pull Requests ──
  let allPRs = [];
  try {
    const { data: searchResults } = await api.get(
      `/search/issues?q=author:${uname}+type:pr&per_page=50&sort=created&order=desc`
    );
    allPRs = searchResults.items.map(pr => ({
      title:     pr.title,
      repo:      pr.repository_url.split('/').slice(-1)[0],
      state:     pr.pull_request?.merged_at ? 'merged' : pr.state,
      createdAt: new Date(pr.created_at),
      mergedAt:  pr.pull_request?.merged_at ? new Date(pr.pull_request.merged_at) : null,
    }));
  } catch (e) {
    console.log('[GitHub] PR fetch skipped:', e.message);
  }

  // ── Contribution streak ──
  const streak = calculateCommitStreak(allCommits);
  console.log(`[GitHub] Streak — current: ${streak.current}, longest: ${streak.longest}`);

  // ── Total stars across all repos ──
  const totalStars = allRepos.reduce((s, r) => s + r.stargazers_count, 0);

  // ── Save to DB ──
  const githubData = await GitHubData.findOneAndUpdate(
    { userId },
    {
      userId,
      username: uname,
      repos: allRepos.slice(0, 100).map(r => ({  // store up to 100 repos
        name:        r.name,
        description: r.description,
        url:         r.html_url,
        language:    r.language,
        stars:       r.stargazers_count,
        forks:       r.forks_count,
        isPrivate:   r.private,
        createdAt:   new Date(r.created_at),
        updatedAt:   new Date(r.updated_at),
        topics:      r.topics || [],
      })),
      commits:              allCommits.slice(0, 500),  // store last 500 commits
      pullRequests:         allPRs,
      languageDistribution,
      weeklyCommits,
      contributionStreak:   streak,
      totalCommits:         allCommits.length,
      totalPRs:             allPRs.length,
      totalStars,
      updatedAt: new Date(),
    },
    { upsert: true, returnDocument: 'after' }
  );

  console.log(`[GitHub] ✅ Saved for ${uname}: ${allCommits.length} commits, ${allRepos.length} repos, ${totalStars} stars`);
  return githubData;
};

const getGitHubData = async (userId) => {
  return GitHubData.findOne({ userId }).lean();
};

const calculateCommitStreak = (commits) => {
  if (!commits.length) return { current: 0, longest: 0 };

  // Get unique days with commits, sorted newest first
  const days = [...new Set(
    commits.map(c => new Date(c.date).toISOString().split('T')[0])
  )].sort().reverse();

  if (!days.length) return { current: 0, longest: 0 };

  // Check if streak is still active (committed today or yesterday)
  const today     = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  const streakActive = days[0] === today || days[0] === yesterday;

  let current = streakActive ? 1 : 0;
  let longest = 1;
  let streak  = 1;

  for (let i = 0; i < days.length - 1; i++) {
    const diff = (new Date(days[i]) - new Date(days[i + 1])) / 86400000;
    if (diff === 1) {
      streak++;
      if (streakActive && i < current) current = streak;
      longest = Math.max(longest, streak);
    } else {
      if (streakActive && current === i + 1) current = streak;
      longest = Math.max(longest, streak);
      streak = 1;
    }
  }

  // Final update in case the whole array is one streak
  if (streakActive) current = Math.max(current, streak);
  longest = Math.max(longest, streak);

  return { current, longest };
};

const getWeekKey = (date) => {
  const d    = new Date(date);
  const day  = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  return monday.toISOString().split('T')[0];
};

module.exports = { fetchAndStoreGitHubData, getGitHubData };