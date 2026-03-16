const express = require('express');
const router = express.Router();
const isAuthenticated = require('../middleware/auth');
const { fetchAndStoreGitHubData, getGitHubData } = require('../services/githubService');

router.use(isAuthenticated);

router.get('/analytics', async (req, res) => {
  try {
    let data = await getGitHubData(req.user._id);

    if (!data) {
      console.log('No GitHub data found — fetching now for:', req.user.githubProfile.username);
      data = await fetchAndStoreGitHubData(
        req.user._id,
        req.user.githubProfile.username,
        req.user.githubAccessToken
      );
    }

    if (!data) return res.status(404).json({ message: 'No GitHub data found' });
    res.json(data);
  } catch (err) {
    console.error('GitHub analytics error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

router.post('/refresh', async (req, res) => {
  try {
    console.log('Refreshing GitHub data for:', req.user.githubProfile.username);
    const data = await fetchAndStoreGitHubData(
      req.user._id,
      req.user.githubProfile.username,
      req.user.githubAccessToken
    );
    res.json({ message: 'GitHub data refreshed', data });
  } catch (err) {
    console.error('GitHub refresh error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;