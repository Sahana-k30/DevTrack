const express = require('express');
const router = express.Router();
const isAuthenticated = require('../middleware/auth');
const {
  getCodeforcesData,
  updateCodeforcesData,
  setCodeforcesUsername
} = require('../services/codeforcesService');

router.use(isAuthenticated);

// Set Codeforces username
router.post('/username', async (req, res) => {
  try {
    const { username } = req.body;
    if (!username) return res.status(400).json({ message: 'Username required' });
    const data = await setCodeforcesUsername(req.user._id, username);
    res.json({ message: 'Codeforces username saved', data });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get analytics
router.get('/analytics', async (req, res) => {
  try {
    const data = await getCodeforcesData(req.user._id);
    if (!data) return res.status(404).json({ message: 'No Codeforces data found. Please set your username first.' });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Manual refresh
router.post('/refresh', async (req, res) => {
  try {
    const data = await updateCodeforcesData(req.user._id);
    res.json({ message: 'Codeforces data refreshed', data });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;