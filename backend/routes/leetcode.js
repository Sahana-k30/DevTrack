// routes/leetcode.js
const express = require('express');
const router  = express.Router();
const isAuthenticated = require('../middleware/auth');
const User = require('../models/User');
const { fetchAndStoreLeetCodeData, getLeetCodeData } = require('../services/leetcodeService');

router.use(isAuthenticated);

// ── Set LeetCode username + immediately fetch data ──
router.post('/username', async (req, res) => {
  try {
    const { username } = req.body;
    if (!username) return res.status(400).json({ message: 'Username required' });

    await User.findByIdAndUpdate(req.user._id, { leetcodeUsername: username.trim() });
    const data = await fetchAndStoreLeetCodeData(req.user._id, username.trim());
    res.json({ message: 'LeetCode username saved', data });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Get stored analytics ──
router.get('/analytics', async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user.leetcodeUsername) {
      return res.status(404).json({ message: 'LeetCode username not set' });
    }
    const data = await getLeetCodeData(req.user._id);
    if (!data) {
      return res.status(404).json({ message: 'No data yet — click Refresh to load' });
    }
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Manual refresh — NO rate limiter so the button always works ──
router.post('/refresh', async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user.leetcodeUsername) {
      return res.status(400).json({ message: 'LeetCode username not set' });
    }
    const data = await fetchAndStoreLeetCodeData(req.user._id, user.leetcodeUsername);
    res.json({ message: 'LeetCode data refreshed', data });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;