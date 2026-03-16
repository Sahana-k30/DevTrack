const cron = require('node-cron');
const User = require('../models/User');
const { fetchAndStoreGitHubData } = require('../services/githubService');
const { fetchAndStoreLeetCodeData } = require('../services/leetcodeService');
const { fetchAndStoreCodeforcesData } = require('../services/codeforcesService');

const refreshAllUsers = async () => {
  console.log('[Cron] Starting scheduled data refresh...');
  const users = await User.find({});

  for (const user of users) {
    try {
      // GitHub (always, since we have their token)
      await fetchAndStoreGitHubData(user._id, user.githubProfile.username, user.githubAccessToken);
      console.log(`[Cron] GitHub refreshed for ${user.githubProfile.username}`);

      // LeetCode (only if username set)
      if (user.leetcodeUsername) {
        await fetchAndStoreLeetCodeData(user._id, user.leetcodeUsername);
        console.log(`[Cron] LeetCode refreshed for ${user.leetcodeUsername}`);
      }

      // Codeforces (only if handle set)
      if (user.codeforcesHandle) {
        await fetchAndStoreCodeforcesData(user._id, user.codeforcesHandle);
        console.log(`[Cron] Codeforces refreshed for ${user.codeforcesHandle}`);
      }

      // Update lastRefreshed
      await User.findByIdAndUpdate(user._id, { lastRefreshed: new Date() });
    } catch (err) {
      console.error(`[Cron] Error refreshing user ${user._id}:`, err.message);
    }
  }

  console.log('[Cron] Refresh complete.');
};

const startCronJobs = () => {
  // Every 6 hours
  cron.schedule('0 */6 * * *', refreshAllUsers);
  console.log('[Cron] Data refresh job scheduled every 6 hours');
};

module.exports = { startCronJobs, refreshAllUsers };