const express = require('express');
const router = express.Router();
const isAuthenticated = require('../middleware/auth');
const { refreshLimiter } = require('../middleware/rateLimiter');
const User = require('../models/User');
const { fetchAndStoreLeetCodeData, getLeetCodeData } = require('../services/leetcodeService');

router.use(isAuthenticated);

// Set LeetCode username
router.post('/username', async (req, res) => {
  try {
    const { username } = req.body;
    if (!username) return res.status(400).json({ message: 'Username required' });
    await User.findByIdAndUpdate(req.user._id, { leetcodeUsername: username });
    const data = await fetchAndStoreLeetCodeData(req.user._id, username);
    res.json({ message: 'LeetCode username saved', data });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get analytics
router.get('/analytics', async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user.leetcodeUsername) return res.status(404).json({ message: 'LeetCode username not set' });
    const data = await getLeetCodeData(req.user._id);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Manual refresh
router.post('/refresh', refreshLimiter, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user.leetcodeUsername) return res.status(400).json({ message: 'LeetCode username not set' });
    const data = await fetchAndStoreLeetCodeData(req.user._id, user.leetcodeUsername);
    res.json({ message: 'LeetCode data refreshed', data });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;