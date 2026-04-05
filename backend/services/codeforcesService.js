const axios = require('axios');
const CodeforcesData = require('../models/CodeforcesData');
const User = require('../models/User');

const CF_API = 'https://codeforces.com/api';

async function setCodeforcesUsername(userId, username) {
  // Validate username exists on Codeforces
  const response = await axios.get(`${CF_API}/user.info?handles=${username}`);
  if (response.data.status !== 'OK') {
    throw new Error('Invalid Codeforces username');
  }

  await User.findByIdAndUpdate(userId, { codeforcesUsername: username });
  return await updateCodeforcesData(userId, username);
}

async function updateCodeforcesData(userId, usernameOverride = null) {
  const user = await User.findById(userId);
  const username = usernameOverride || user.codeforcesUsername;
  if (!username) return null;

  // Fetch user info
  const [infoRes, ratingRes, submissionsRes] = await Promise.all([
    axios.get(`${CF_API}/user.info?handles=${username}`),
    axios.get(`${CF_API}/user.rating?handle=${username}`),
    axios.get(`${CF_API}/user.status?handle=${username}&from=1&count=100`)
  ]);

  const userInfo = infoRes.data.result[0];
  const ratingHistory = ratingRes.data.result || [];
  const submissions = submissionsRes.data.result || [];

  // Process submissions
  const solvedProblems = new Set();
  const verdictCount = { AC: 0, WA: 0, TLE: 0, OTHER: 0 };
  const languageCount = {};
  const ratingBuckets = {};

  submissions.forEach(sub => {
    const verdict = sub.verdict;
    if (verdict === 'OK') {
      solvedProblems.add(`${sub.problem.contestId}-${sub.problem.index}`);
      verdictCount.AC++;
    } else if (verdict === 'WRONG_ANSWER') verdictCount.WA++;
    else if (verdict === 'TIME_LIMIT_EXCEEDED') verdictCount.TLE++;
    else verdictCount.OTHER++;

    // Language distribution
    languageCount[sub.programmingLanguage] = (languageCount[sub.programmingLanguage] || 0) + 1;

    // Rating bucket distribution
    if (sub.verdict === 'OK' && sub.problem.rating) {
      const bucket = `${Math.floor(sub.problem.rating / 200) * 200}`;
      ratingBuckets[bucket] = (ratingBuckets[bucket] || 0) + 1;
    }
  });

  // Weekly activity (last 12 weeks)
  const weeklyActivity = buildWeeklyActivity(submissions);

  const cfData = await CodeforcesData.findOneAndUpdate(
    { userId },
    {
      userId,
      codeforcesUsername: username,
      handle: userInfo.handle,
      rating: userInfo.rating || 0,
      maxRating: userInfo.maxRating || 0,
      rank: userInfo.rank || 'unrated',
      maxRank: userInfo.maxRank || 'unrated',
      contribution: userInfo.contribution || 0,
      friendOfCount: userInfo.friendOfCount || 0,
      totalSolved: solvedProblems.size,
      totalSubmissions: submissions.length,
      verdictStats: verdictCount,
      languageDistribution: languageCount,
      ratingDistribution: ratingBuckets,
      ratingHistory: ratingHistory.slice(-20).map(r => ({
        contestName: r.contestName,
        rating: r.newRating,
        rank: r.rank,
        date: new Date(r.ratingUpdateTimeSeconds * 1000)
      })),
      weeklyActivity,
      lastUpdated: new Date()
    },
    { upsert: true, new: true }
  );

  return cfData;
}

function buildWeeklyActivity(submissions) {
  const weeks = {};
  const now = Date.now();
  const msPerWeek = 7 * 24 * 60 * 60 * 1000;

  submissions.forEach(sub => {
    const subTime = sub.creationTimeSeconds * 1000;
    const weeksAgo = Math.floor((now - subTime) / msPerWeek);
    if (weeksAgo < 12) {
      const key = `week-${weeksAgo}`;
      if (!weeks[key]) weeks[key] = { total: 0, solved: 0 };
      weeks[key].total++;
      if (sub.verdict === 'OK') weeks[key].solved++;
    }
  });

  return Object.entries(weeks).map(([week, data]) => ({ week, ...data }));
}

async function getCodeforcesData(userId) {
  return await CodeforcesData.findOne({ userId });
}

module.exports = { setCodeforcesUsername, updateCodeforcesData, getCodeforcesData };