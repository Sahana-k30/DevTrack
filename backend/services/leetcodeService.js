// services/leetcodeService.js
const { GraphQLClient, gql } = require('graphql-request');
const LeetCodeData = require('../models/LeetCodeData');

const LEETCODE_GQL = 'https://leetcode.com/graphql';
const client = new GraphQLClient(LEETCODE_GQL, {
  headers: { 'Content-Type': 'application/json' },
});

// ── Fetches solved counts AND total available questions per difficulty ──
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
      }
    }
    allQuestionsCount {
      difficulty
      count
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
        advanced     { tagName problemsSolved }
        intermediate { tagName problemsSolved }
        fundamental  { tagName problemsSolved }
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
  console.log(`[LeetCode] Fetching data for: ${username}`);

  const [statsRes, recentRes, skillRes, calendarRes] = await Promise.allSettled([
    client.request(USER_STATS_QUERY, { username }),
    client.request(RECENT_PROBLEMS_QUERY, { username, limit: 50 }),
    client.request(SKILL_STATS_QUERY, { username }),
    client.request(CALENDAR_QUERY, { username, year: new Date().getFullYear() }),
  ]);

  // ── Validate user exists ──
  if (statsRes.status === 'rejected' || !statsRes.value?.matchedUser) {
    console.error('[LeetCode] User not found:', statsRes.reason?.message);
    throw new Error('LeetCode user not found. Please check your username.');
  }

  const matchedUser = statsRes.value.matchedUser;
  const allQCounts  = statsRes.value.allQuestionsCount || [];

  // ── Solved counts (from user's accepted submissions) ──
  const acStats     = matchedUser.submitStats?.acSubmissionNum || [];
  const totalSolved  = acStats.find(s => s.difficulty === 'All')?.count    || 0;
  const easySolved   = acStats.find(s => s.difficulty === 'Easy')?.count   || 0;
  const mediumSolved = acStats.find(s => s.difficulty === 'Medium')?.count || 0;
  const hardSolved   = acStats.find(s => s.difficulty === 'Hard')?.count   || 0;

  // ── Total available questions on LeetCode ──
  const totalQuestions = allQCounts.find(q => q.difficulty === 'All')?.count    || 0;
  const easyTotal      = allQCounts.find(q => q.difficulty === 'Easy')?.count   || 0;
  const mediumTotal    = allQCounts.find(q => q.difficulty === 'Medium')?.count || 0;
  const hardTotal      = allQCounts.find(q => q.difficulty === 'Hard')?.count   || 0;

  console.log(`[LeetCode] Solved: ${totalSolved} | Easy: ${easySolved}/${easyTotal} | Medium: ${mediumSolved}/${mediumTotal} | Hard: ${hardSolved}/${hardTotal}`);

  // ── Recent accepted submissions ──
  const recentRaw = recentRes.status === 'fulfilled'
    ? (recentRes.value?.recentAcSubmissionList || []) : [];

  const recentSubmissions = recentRaw.map(p => ({
    title:         p.title,
    titleSlug:     p.titleSlug,
    timestamp:     new Date(parseInt(p.timestamp) * 1000),
    statusDisplay: 'Accepted',
    lang:          'N/A',
  }));

  // ── Weekly progress from recent submissions ──
  const weeklyMap = {};
  recentSubmissions.forEach(p => {
    const week = getWeekKey(p.timestamp);
    weeklyMap[week] = (weeklyMap[week] || 0) + 1;
  });
  const weeklyProgress = Object.entries(weeklyMap)
    .map(([week, solved]) => ({ week, solved }))
    .sort((a, b) => a.week.localeCompare(b.week));

  // ── Topic distribution ──
  const skillData    = skillRes.status === 'fulfilled'
    ? skillRes.value?.matchedUser?.tagProblemCounts : null;
  const topicWiseStats = [];
  if (skillData) {
    for (const group of ['advanced', 'intermediate', 'fundamental']) {
      for (const tag of skillData[group] || []) {
        topicWiseStats.push({
          topicName:      tag.tagName,
          problemsSolved: tag.problemsSolved,
        });
      }
    }
    // Sort by most solved first
    topicWiseStats.sort((a, b) => b.problemsSolved - a.problemsSolved);
  }

  // ── Streak & calendar ──
  const calendar  = calendarRes.status === 'fulfilled'
    ? calendarRes.value?.matchedUser?.userCalendar : null;
  const streak    = calendar?.streak           || 0;
  const maxStreak = calendar?.totalActiveDays  || 0;

  let submissionCalendar = {};
  if (calendar?.submissionCalendar) {
    try { submissionCalendar = JSON.parse(calendar.submissionCalendar); } catch (_) {}
  }

  // ── Save to DB ──
  const data = await LeetCodeData.findOneAndUpdate(
    { userId },
    {
      userId,
      leetcodeUsername:   username,
      totalSolved,
      easySolved,
      mediumSolved,
      hardSolved,
      totalQuestions,   // ✅ now saved
      easyTotal,        // ✅ now saved
      mediumTotal,      // ✅ now saved
      hardTotal,        // ✅ now saved
      ranking:            matchedUser.profile?.ranking     || 0,
      contributionPoints: matchedUser.profile?.reputation  || 0,
      streak,           // ✅ flat number matching schema
      maxStreak,        // ✅ flat number matching schema
      submissionCalendar,
      recentSubmissions:  recentSubmissions.slice(0, 20),
      topicWiseStats,
      weeklyProgress,
      lastUpdated: new Date(),
    },
    { upsert: true, new: true }
  );

  console.log(`[LeetCode] ✅ Saved for ${username}: ${totalSolved} solved, rank ${data.ranking}`);
  return data;
};

const getLeetCodeData = async (userId) => {
  return LeetCodeData.findOne({ userId }).lean();
};

const getWeekKey = (date) => {
  const d   = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  return monday.toISOString().split('T')[0];
};

module.exports = { fetchAndStoreLeetCodeData, getLeetCodeData };