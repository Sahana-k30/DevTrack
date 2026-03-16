const { GraphQLClient, gql } = require('graphql-request');
const LeetCodeData = require('../models/LeetCodeData');
const { cache } = require('../config/redis');

const LEETCODE_GQL = 'https://leetcode.com/graphql';
const client = new GraphQLClient(LEETCODE_GQL, {
  headers: { 'Content-Type': 'application/json' },
});

const USER_STATS_QUERY = gql`
  query getUserProfile($username: String!) {
    matchedUser(username: $username) {
      username
      submitStats: submitStatsGlobal {
        acSubmissionNum {
          difficulty
          count
          submissions
        }
      }
      profile {
        ranking
        reputation
        starRating
      }
    }
    userContestRanking(username: $username) {
      attendedContestsCount
      rating
      globalRanking
    }
  }
`;

const RECENT_PROBLEMS_QUERY = gql`
  query recentAcSubmissions($username: String!, $limit: Int!) {
    recentAcSubmissionList(username: $username, limit: $limit) {
      id
      title
      titleSlug
      timestamp
    }
  }
`;

const SKILL_STATS_QUERY = gql`
  query skillStats($username: String!) {
    matchedUser(username: $username) {
      tagProblemCounts {
        advanced {
          tagName
          problemsSolved
        }
        intermediate {
          tagName
          problemsSolved
        }
        fundamental {
          tagName
          problemsSolved
        }
      }
    }
  }
`;

const CALENDAR_QUERY = gql`
  query userActivityCalendar($username: String!, $year: Int) {
    matchedUser(username: $username) {
      userCalendar(year: $year) {
        streak
        totalActiveDays
        submissionCalendar
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

  const stats = statsRes.value?.matchedUser?.submitStats?.acSubmissionNum || [];
  const totalSolved = stats.find(s => s.difficulty === 'All')?.count || 0;
  const easySolved = stats.find(s => s.difficulty === 'Easy')?.count || 0;
  const mediumSolved = stats.find(s => s.difficulty === 'Medium')?.count || 0;
  const hardSolved = stats.find(s => s.difficulty === 'Hard')?.count || 0;

  const recent = recentRes.value?.recentAcSubmissionList || [];
  const solvedProblems = recent.map(p => ({
    title: p.title,
    titleSlug: p.titleSlug,
    solvedAt: new Date(parseInt(p.timestamp) * 1000),
  }));

  // Build weekly progress from recent submissions
  const weeklyMap = {};
  for (const p of solvedProblems) {
    const week = getWeekKey(p.solvedAt);
    weeklyMap[week] = (weeklyMap[week] || 0) + 1;
  }
  const weeklyProgress = Object.entries(weeklyMap)
    .map(([week, solved]) => ({ week, solved }))
    .sort((a, b) => a.week.localeCompare(b.week));

  // Topic distribution
  const skillData = skillRes.value?.matchedUser?.tagProblemCounts;
  const topicProgress = [];
  if (skillData) {
    for (const group of ['advanced', 'intermediate', 'fundamental']) {
      for (const tag of skillData[group] || []) {
        topicProgress.push({ topic: tag.tagName, solved: tag.problemsSolved, total: tag.problemsSolved });
      }
    }
  }

  const calendar = calendarRes.value?.matchedUser?.userCalendar;
  const streak = { current: calendar?.streak || 0, longest: calendar?.totalActiveDays || 0 };

  const data = await LeetCodeData.findOneAndUpdate(
    { userId },
    {
      userId,
      solvedProblems,
      totalSolved,
      easySolved,
      mediumSolved,
      hardSolved,
      ranking: statsRes.value?.matchedUser?.profile?.ranking || 0,
      streak,
      weeklyProgress,
      topicProgress,
      recentSubmissions: solvedProblems.slice(0, 10).map(p => ({
        title: p.title,
        difficulty: 'N/A',
        status: 'Accepted',
        timestamp: p.solvedAt,
      })),
      updatedAt: new Date(),
    },
    { upsert: true, new: true }
  );

  return data;
};

const getLeetCodeData = async (userId) => {
  return cache(`leetcode:${userId}`, 3600, async () => {
    return LeetCodeData.findOne({ userId }).lean();
  });
};

const getWeekKey = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  return monday.toISOString().split('T')[0];
};

module.exports = { fetchAndStoreLeetCodeData, getLeetCodeData };