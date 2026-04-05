// ============================================================
// FILE: server/jobs/dataRefreshJob.js
// Refreshes all user data from GitHub, LeetCode, and Codeforces
// Runs every day at 9:00 AM IST (3:30 AM UTC)
// ============================================================

const cron = require('node-cron');
const User = require('../models/User');
const { fetchAndStoreGitHubData } = require('../services/githubService');
const { fetchAndStoreLeetCodeData } = require('../services/leetcodeService');
const { updateCodeforcesData } = require('../services/codeforcesService');

// ──────────────────────────────────────────────────────────────
// REFRESH ONE USER
// ──────────────────────────────────────────────────────────────
async function refreshUserData(user) {
  const results = { github: null, leetcode: null, codeforces: null };

  // 1. GitHub — uses stored access token + username from githubProfile
  if (user.githubAccessToken && user.githubProfile?.username) {
    try {
      await fetchAndStoreGitHubData(
        user._id,
        user.githubProfile.username,   // ✅ correct field name
        user.githubAccessToken
      );
      results.github = 'ok';
      console.log(`  ✅ GitHub refreshed for ${user.githubProfile.username}`);
    } catch (err) {
      results.github = 'error';
      console.error(`  ❌ GitHub failed for ${user.githubProfile.username}:`, err.message);
    }
  }

  // 2. LeetCode — only if username is set
  if (user.leetcodeUsername) {
    try {
      await fetchAndStoreLeetCodeData(user._id, user.leetcodeUsername); // ✅ correct function name
      results.leetcode = 'ok';
      console.log(`  ✅ LeetCode refreshed for ${user.leetcodeUsername}`);
    } catch (err) {
      results.leetcode = 'error';
      console.error(`  ❌ LeetCode failed for ${user.leetcodeUsername}:`, err.message);
    }
  }

  // 3. Codeforces — only if handle is set
  if (user.codeforcesUsername) {
    try {
      await updateCodeforcesData(user._id, user.codeforcesUsername); // ✅ correct function name
      results.codeforces = 'ok';
      console.log(`  ✅ Codeforces refreshed for ${user.codeforcesUsername}`);
    } catch (err) {
      results.codeforces = 'error';
      console.error(`  ❌ Codeforces failed for ${user.codeforcesUsername}:`, err.message);
    }
  }

  // Stamp the refresh time on the user document
  await User.findByIdAndUpdate(user._id, { lastRefreshed: new Date() });

  return results;
}

// ──────────────────────────────────────────────────────────────
// REFRESH ALL USERS
// ──────────────────────────────────────────────────────────────
async function refreshAllUsers() {
  console.log('\n🔄 [CronJob] Starting daily data refresh —', new Date().toISOString());

  let users;
  try {
    // Select only fields needed — keeps the query light
    users = await User.find({}).select(
      'githubProfile githubAccessToken leetcodeUsername codeforcesUsername'
    );
  } catch (err) {
    console.error('❌ [CronJob] Could not load users from DB:', err.message);
    return;
  }

  console.log(`📋 [CronJob] Found ${users.length} user(s) to refresh`);

  let success = 0;
  let failed = 0;

  for (const user of users) {
    try {
      console.log(`\n👤 Refreshing: ${user.githubProfile?.username || user._id}`);
      await refreshUserData(user);
      success++;

      // 1.5s delay between users — avoids hammering external APIs
      await new Promise(resolve => setTimeout(resolve, 1500));
    } catch (err) {
      failed++;
      console.error(`  ❌ Unexpected error for user ${user._id}:`, err.message);
    }
  }

  console.log(`\n✅ [CronJob] Done — ${success} succeeded, ${failed} failed\n`);
}

// ──────────────────────────────────────────────────────────────
// SCHEDULE — 9:00 AM IST every day
//
// Cron syntax:  minute  hour  dom  month  dow
//                  0     9     *     *     *
//
// timezone: 'Asia/Kolkata' ensures this fires at 9 AM IST
// regardless of where your server is hosted.
//
// If your users are in a different timezone, change it:
//   'America/New_York'  → 9 AM EST
//   'Europe/London'     → 9 AM GMT/BST
//   'UTC'               → 9 AM UTC
// ──────────────────────────────────────────────────────────────
function startCronJob() {
  console.log('⏰ [CronJob] Scheduled — daily refresh at 9:00 AM IST');

  cron.schedule(
    '0 9 * * *',
    async () => {
      await refreshAllUsers();
    },
    {
      timezone: 'Asia/Kolkata', // ← change this to your timezone
    }
  );
}

module.exports = { startCronJob, refreshAllUsers, refreshUserData };