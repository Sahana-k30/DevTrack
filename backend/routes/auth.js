const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middleware/auth');

router.get('/github', passport.authenticate('github', {
  scope: ['user:email', 'read:user', 'repo'],
}));

router.get(
  '/github/callback',
  passport.authenticate('github', {
    session: false,
    failureRedirect: `${process.env.CLIENT_URL}/login?error=auth_failed`,
  }),
  (req, res) => {
    try {
      if (!req.user) {
        return res.redirect(`${process.env.CLIENT_URL}/login?error=no_user`);
      }

      const token = jwt.sign(
        { id: req.user._id },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${token}`);
    } catch (err) {
      console.error('Auth callback error:', err);
      res.redirect(`${process.env.CLIENT_URL}/login?error=token_failed`);
    }
  }
);

router.get('/me', authMiddleware, (req, res) => {
  res.json({
    id: req.user._id,
    email: req.user.email,
    githubProfile: req.user.githubProfile,
    leetcodeUsername: req.user.leetcodeUsername,
    codeforcesUsername: req.user.codeforcesUsername,
  });
});

router.post('/logout', authMiddleware, (req, res) => {
  res.json({ message: 'Logged out' });
});

module.exports = router;