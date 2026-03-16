const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const isAuthenticated = require('../middleware/auth');

// Initiate GitHub OAuth
router.get('/github', passport.authenticate('github', {
  scope: ['user:email', 'read:user', 'repo']
}));

// GitHub OAuth callback
router.get('/github/callback',
  passport.authenticate('github', { failureRedirect: `${process.env.CLIENT_URL}/login?error=auth_failed` }),
  (req, res) => {
    try {
      // Generate JWT token
      const token = jwt.sign(
        { id: req.user._id },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Redirect to frontend with token
      res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${token}`);
    } catch (err) {
      console.error('Callback error:', err);
      res.redirect(`${process.env.CLIENT_URL}/login?error=token_failed`);
    }
  }
);

// Get current user
router.get('/me', isAuthenticated, (req, res) => {
  res.json({
    id: req.user._id,
    githubProfile: req.user.githubProfile,
    email: req.user.email,
    leetcodeUsername: req.user.leetcodeUsername,
    codeforcesUsername: req.user.codeforcesUsername,
  });
});

// Logout
router.post('/logout', isAuthenticated, (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).json({ message: 'Logout failed' });
    res.json({ message: 'Logged out successfully' });
  });
});

module.exports = router;