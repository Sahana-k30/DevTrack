// services/leetcodeService.js
const { GraphQLClient, gql } = require('graphql-request');
const LeetCodeData = require('../models/LeetCodeData');

// Safe Redis import — if redis config is broken, still works
let redisCache = null;
try {
  const redis = require('../config/redis');
  redisCache = redis.cache;
} catch (_) {}

const LEETCODE_GQL = 'https://leetcode.com/graphql';
const client = new GraphQLClient(LEETCODE_GQL, {
  headers: { 'Content-Type': 'application/json' },
});

const USER_STATS_QUERY = gql`
  query getUserProfile($username: String!) {
    matchedUser(username: $username) {
      username
      submitStats: submitStatsGlobal {
        acSubmissionNum { difficulty count submissions }
      }
      profile { ranking reputation starRating }
    }
  }
`;

const RECENT_PROBLEMS_QUERY = gql`
  query recentAcSubmissions($username: String!, $limit: Int!) {
    recentAcSubmissionList(username: $username, limit: $limit) {
      id title titleSlug timestamp
    }
  }
`;

const SKILL_STATS_QUERY = gql`
  query skillStats($username: String!) {
    matchedUser(username: $username) {
      tagProblemCounts {
        advanced { tagName problemsSolved }
        intermediate { tagName problemsSolved }
        fundamental { tagName problemsSolved }
      }
    }
  }
`;

const CALENDAR_QUERY = gql`
  query userActivityCalendar($username: String!, $year: Int) {
    matchedUser(username: $username) {
      userCalendar(year: $year) {
        streak totalActiveDays submissionCalendar
      }
    }
  }
`;

const fetchAndStoreLeetCodeData = async (userId, username) => {
  const [statsRes, recentRes, skillRes, calendarRes] = await Promise.allSettled([
    client.request(USER_STATS_QUERY, { username }),
    client.request(RECENT_PROBLEMS_QUERY, { username, limit: 50 }),
    client.request(SKILL_STATS_QUERY, { username }),
    client.request(CALENDAR_QUERY, { username, year: new Date().getFullYear() }),
  ]);

  // If user not found on LeetCode, statsRes will be rejected or matchedUser null
  if (statsRes.status === 'rejected' || !statsRes.value?.matchedUser) {
    throw new Error('LeetCode user not found. Please check your username.');
  }

  const stats = statsRes.value.matchedUser.submitStats?.acSubmissionNum || [];
  const totalSolved   = stats.find(s => s.difficulty === 'All')?.count    || 0;
  const easySolved    = stats.find(s => s.difficulty === 'Easy')?.count   || 0;
  const mediumSolved  = stats.find(s => s.difficulty === 'Medium')?.count || 0;
  const hardSolved    = stats.find(s => s.difficulty === 'Hard')?.count   || 0;

  const recent = recentRes.status === 'fulfilled'
    ? (recentRes.value?.recentAcSubmissionList || []) : [];

  const recentSubmissions = recent.map(p => ({
    title: p.title,
    titleSlug: p.titleSlug,
    timestamp: new Date(parseInt(p.timestamp) * 1000),
    statusDisplay: 'Accepted',
    lang: 'N/A',
  }));

  // Weekly progress from recent submissions
  const weeklyMap = {};
  recentSubmissions.forEach(p => {
    const week = getWeekKey(p.timestamp);
    weeklyMap[week] = (weeklyMap[week] || 0) + 1;
  });
  const weeklyProgress = Object.entries(weeklyMap)
    .map(([week, solved]) => ({ week, solved }))
    .sort((a, b) => a.week.localeCompare(b.week));

  // Topic distribution
  const skillData = skillRes.status === 'fulfilled'
    ? skillRes.value?.matchedUser?.tagProblemCounts : null;
  const topicWiseStats = [];
  if (skillData) {
    for (const group of ['advanced', 'intermediate', 'fundamental']) {
      for (const tag of skillData[group] || []) {
        topicWiseStats.push({ topicName: tag.tagName, problemsSolved: tag.problemsSolved });
      }
    }
  }

  const calendar = calendarRes.status === 'fulfilled'
    ? calendarRes.value?.matchedUser?.userCalendar : null;
  const streak    = calendar?.streak || 0;
  const maxStreak = calendar?.totalActiveDays || 0;

  // Parse submission calendar for heatmap
  let submissionCalendar = {};
  if (calendar?.submissionCalendar) {
    try { submissionCalendar = JSON.parse(calendar.submissionCalendar); } catch (_) {}
  }

  const data = await LeetCodeData.findOneAndUpdate(
    { userId },
    {
      userId,
      leetcodeUsername: username,
      totalSolved,
      easySolved,
      mediumSolved,
      hardSolved,
      ranking:              statsRes.value.matchedUser.profile?.ranking || 0,
      contributionPoints:   statsRes.value.matchedUser.profile?.reputation || 0,
      streak,
      maxStreak,
      submissionCalendar,
      recentSubmissions:    recentSubmissions.slice(0, 20),
      topicWiseStats,
      weeklyProgress,
      lastUpdated: new Date(),
    },
    { upsert: true, new: true }
  );

  return data;
};

const getLeetCodeData = async (userId) => {
  // Safe Redis cache — falls back to DB if Redis is unavailable
  if (redisCache) {
    try {
      return await redisCache(`leetcode:${userId}`, 3600, async () => {
        return LeetCodeData.findOne({ userId }).lean();
      });
    } catch (_) {
      // Redis failed — fall through to direct DB query
    }
  }
  return LeetCodeData.findOne({ userId }).lean();
};

const getWeekKey = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  return monday.toISOString().split('T')[0];
};

module.exports = { fetchAndStoreLeetCodeData, getLeetCodeData };