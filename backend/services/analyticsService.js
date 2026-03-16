const GitHubData = require('../models/GitHubData');
const LeetCodeData = require('../models/LeetCodeData');
const CodeforcesData = require('../models/CodeforcesData');
const User = require('../models/User');
const { generateInsights } = require('../utils/insightsEngine');

const getSkillRadar = async (userId) => {
  const [gh, lc, cf] = await Promise.all([
    GitHubData.findOne({ userId }).lean(),
    LeetCodeData.findOne({ userId }).lean(),
    CodeforcesData.findOne({ userId }).lean(),
  ]);

  return {
    consistency: Math.min(100, (gh?.contributionStreak?.current || 0) * 5 + (lc?.streak?.current || 0) * 3),
    problemSolving: Math.min(100, ((lc?.totalSolved || 0) / 500) * 100),
    algorithmDepth: Math.min(100, ((lc?.hardSolved || 0) * 3 + (lc?.mediumSolved || 0)) / 5),
    projectBuilding: Math.min(100, ((gh?.repos?.length || 0) / 30) * 100),
    competitiveProgramming: Math.min(100, ((cf?.rating || 0) / 3000) * 100),
    openSourceContrib: Math.min(100, ((gh?.totalPRs || 0) / 50) * 100),
  };
};

const getProductivityScore = async (userId) => {
  const [gh, lc, cf] = await Promise.all([
    GitHubData.findOne({ userId }).lean(),
    LeetCodeData.findOne({ userId }).lean(),
    CodeforcesData.findOne({ userId }).lean(),
  ]);

  // Score last 4 weeks vs 4 weeks before that
  const now = new Date();
  const fourWeeksAgo = new Date(now - 28 * 86400000);
  const eightWeeksAgo = new Date(now - 56 * 86400000);

  const recentCommits = gh?.commits?.filter(c => new Date(c.date) > fourWeeksAgo).length || 0;
  const prevCommits = gh?.commits?.filter(c => {
    const d = new Date(c.date);
    return d > eightWeeksAgo && d <= fourWeeksAgo;
  }).length || 0;

  const commitTrend = prevCommits ? ((recentCommits - prevCommits) / prevCommits) * 100 : 0;

  return {
    score: Math.min(100, Math.round(
      (recentCommits * 2 + (lc?.totalSolved || 0) * 0.5 + (cf?.totalSolved || 0) * 0.3) / 10
    )),
    commitTrend: commitTrend.toFixed(1),
    recentCommits,
    prevCommits,
    weeklyBreakdown: gh?.weeklyCommits?.slice(-8) || [],
  };
};

const getTimeline = async (userId) => {
  const [user, gh, lc, cf] = await Promise.all([
    User.findById(userId).lean(),
    GitHubData.findOne({ userId }).lean(),
    LeetCodeData.findOne({ userId }).lean(),
    CodeforcesData.findOne({ userId }).lean(),
  ]);

  const events = [];

  // GitHub account creation
  if (user?.githubProfile?.createdAt) {
    events.push({
      date: user.githubProfile.createdAt,
      type: 'milestone',
      platform: 'github',
      title: 'Joined GitHub',
      description: `GitHub profile created for @${user.githubProfile.username}`,
    });
  }

  // First repo
  const repos = gh?.repos || [];
  if (repos.length) {
    const oldest = [...repos].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))[0];
    events.push({
      date: oldest.createdAt,
      type: 'repo',
      platform: 'github',
      title: `First repo: ${oldest.name}`,
      description: oldest.description || '',
    });
  }

  // Most starred repos
  const topRepos = [...repos].sort((a, b) => b.stars - a.stars).slice(0, 3);
  for (const repo of topRepos) {
    if (repo.stars > 0) {
      events.push({
        date: repo.createdAt,
        type: 'repo',
        platform: 'github',
        title: `${repo.name} ⭐ ${repo.stars}`,
        description: repo.description || '',
      });
    }
  }

  // LeetCode milestones
  const milestones = [10, 50, 100, 200, 300, 500];
  const sorted = [...(lc?.solvedProblems || [])].sort((a, b) => new Date(a.solvedAt) - new Date(b.solvedAt));
  for (const m of milestones) {
    if (sorted.length >= m) {
      events.push({
        date: sorted[m - 1].solvedAt,
        type: 'milestone',
        platform: 'leetcode',
        title: `${m} LeetCode problems solved`,
        description: '',
      });
    }
  }

  // Codeforces rating milestones
  const ratingMilestones = [800, 1200, 1400, 1600, 1900, 2100];
  for (const rm of ratingMilestones) {
    const reached = cf?.ratingHistory?.find(r => r.rating >= rm);
    if (reached) {
      events.push({
        date: reached.date,
        type: 'rating',
        platform: 'codeforces',
        title: `Reached ${rm} on Codeforces`,
        description: reached.contestName,
      });
    }
  }

  return events.sort((a, b) => new Date(a.date) - new Date(b.date));
};

const getInsights = async (userId) => {
  const [gh, lc, cf] = await Promise.all([
    GitHubData.findOne({ userId }).lean(),
    LeetCodeData.findOne({ userId }).lean(),
    CodeforcesData.findOne({ userId }).lean(),
  ]);
  return generateInsights(gh, lc, cf);
};

module.exports = { getSkillRadar, getProductivityScore, getTimeline, getInsights };