// services/analyticsService.js
const GitHubData = require('../models/GitHubData');
const LeetCodeData = require('../models/LeetCodeData');
const CodeforcesData = require('../models/CodeforcesData');
const User = require('../models/User');

const getSkillRadar = async (userId) => {
  const [gh, lc, cf] = await Promise.all([
    GitHubData.findOne({ userId }).lean(),
    LeetCodeData.findOne({ userId }).lean(),
    CodeforcesData.findOne({ userId }).lean(),
  ]);

  return {
    consistency:            Math.min(100, (gh?.contributionStreak?.current || 0) * 5 + (lc?.streak || 0) * 3),
    problemSolving:         Math.min(100, Math.round(((lc?.totalSolved || 0) / 500) * 100)),
    algorithmDepth:         Math.min(100, Math.round(((lc?.hardSolved || 0) * 3 + (lc?.mediumSolved || 0)) / 5)),
    projectBuilding:        Math.min(100, Math.round(((gh?.repos?.length || 0) / 30) * 100)),
    competitiveProgramming: Math.min(100, Math.round(((cf?.rating || 0) / 3000) * 100)),
    openSourceContrib:      Math.min(100, Math.round(((gh?.totalPRs || 0) / 50) * 100)),
  };
};

const getProductivityScore = async (userId) => {
  const [gh, lc, cf] = await Promise.all([
    GitHubData.findOne({ userId }).lean(),
    LeetCodeData.findOne({ userId }).lean(),
    CodeforcesData.findOne({ userId }).lean(),
  ]);

  const now = new Date();
  const fourWeeksAgo  = new Date(now - 28 * 86400000);
  const eightWeeksAgo = new Date(now - 56 * 86400000);

  const recentCommits = gh?.commits?.filter(c => new Date(c.date) > fourWeeksAgo).length || 0;
  const prevCommits   = gh?.commits?.filter(c => {
    const d = new Date(c.date);
    return d > eightWeeksAgo && d <= fourWeeksAgo;
  }).length || 0;

  const commitTrend = prevCommits
    ? (((recentCommits - prevCommits) / prevCommits) * 100).toFixed(1)
    : recentCommits > 0 ? '100.0' : '0.0';

  return {
    score: Math.min(100, Math.round(
      (recentCommits * 2 + (lc?.totalSolved || 0) * 0.5 + (cf?.totalSolved || 0) * 0.3) / 10
    )),
    commitTrend,
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

  // GitHub repos
  const repos = gh?.repos || [];
  if (repos.length) {
    const oldest = [...repos].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))[0];
    if (oldest?.createdAt) {
      events.push({
        date: oldest.createdAt,
        type: 'repo',
        platform: 'github',
        title: `First repo: ${oldest.name}`,
        description: oldest.description || '',
      });
    }

    // Top starred repos
    [...repos].sort((a, b) => b.stars - a.stars).slice(0, 3).forEach(repo => {
      if (repo.stars > 0 && repo.createdAt) {
        events.push({
          date: repo.createdAt,
          type: 'repo',
          platform: 'github',
          title: `${repo.name} ⭐ ${repo.stars}`,
          description: repo.description || '',
        });
      }
    });
  }

  // LeetCode milestones — use recentSubmissions (sorted by timestamp)
  // recentSubmissions are the last 20 accepted, so we use totalSolved for milestone badges
  const milestones = [10, 50, 100, 200, 300, 500];
  if (lc?.recentSubmissions?.length) {
    const sorted = [...lc.recentSubmissions].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    milestones.forEach(m => {
      if ((lc.totalSolved || 0) >= m) {
        // Use earliest known submission date as an approximation
        const approxEntry = sorted[0];
        if (approxEntry?.timestamp) {
          events.push({
            date: approxEntry.timestamp,
            type: 'milestone',
            platform: 'leetcode',
            title: `${m}+ LeetCode problems solved`,
            description: `Currently at ${lc.totalSolved} total`,
          });
        }
      }
    });
  }

  // Codeforces rating milestones
  const ratingMilestones = [800, 1200, 1400, 1600, 1900, 2100];
  ratingMilestones.forEach(rm => {
    const reached = cf?.ratingHistory?.find(r => r.rating >= rm);
    if (reached?.date) {
      events.push({
        date: reached.date,
        type: 'rating',
        platform: 'codeforces',
        title: `Reached ${rm} on Codeforces`,
        description: reached.contestName || '',
      });
    }
  });

  return events.sort((a, b) => new Date(a.date) - new Date(b.date));
};

const getInsights = async (userId) => {
  const [gh, lc, cf] = await Promise.all([
    GitHubData.findOne({ userId }).lean(),
    LeetCodeData.findOne({ userId }).lean(),
    CodeforcesData.findOne({ userId }).lean(),
  ]);

  const insights = [];

  if (gh) {
    if ((gh.contributionStreak?.current || 0) < 3)
      insights.push('Your commit streak is low — try to commit daily to build consistency');
    if (gh.totalCommits < 50)
      insights.push('Increase your commit frequency to show active development');
    if (Object.keys(gh.languageDistribution || {}).length < 3)
      insights.push('Consider learning a new language to diversify your skills');
  } else {
    insights.push('GitHub data loading — click Refresh on the GitHub page to load your data');
  }

  if (lc) {
    if ((lc.hardSolved || 0) < 10)
      insights.push('Practice more Hard problems on LeetCode to strengthen problem-solving');
    const mediumRatio = (lc.mediumSolved || 0) / (lc.totalSolved || 1);
    if (mediumRatio < 0.4)
      insights.push('Focus on Medium difficulty problems — they appear most in interviews');
  } else {
    insights.push('Add your LeetCode username to track problem-solving progress');
  }

  if (cf) {
    if ((cf.rating || 0) < 1200)
      insights.push('Solve more Codeforces Div.2 A and B problems to increase your rating');
  } else {
    insights.push('Add your Codeforces handle to track competitive programming progress');
  }

  return insights;
};

module.exports = { getSkillRadar, getProductivityScore, getTimeline, getInsights };