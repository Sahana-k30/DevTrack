const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middleware/auth');

// Step 1: Redirect to GitHub — always force the account picker screen
// This ensures that after logout, a different user can log in on the same device
router.get('/github', (req, res, next) => {
  // Destroy any leftover server-side session before starting a fresh OAuth flow
  if (req.session) {
    req.session.destroy(() => {});
  }

  passport.authenticate('github', {
    scope: ['user:email', 'read:user', 'repo'],
    // Forces GitHub to always show "Which account?" screen
    // Without this, GitHub silently reuses the last logged-in account
    prompt: 'select_account',
  })(req, res, next);
});

// Step 2: GitHub redirects back here after user approves
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

      // Issue a fresh JWT for this user
      const token = jwt.sign(
        { id: req.user._id },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Destroy the OAuth session immediately — we use JWT, not sessions
      if (req.session) {
        req.session.destroy(() => {});
      }

      res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${token}`);
    } catch (err) {
      console.error('Auth callback error:', err);
      res.redirect(`${process.env.CLIENT_URL}/login?error=token_failed`);
    }
  }
);

// Get currently logged-in user info
router.get('/me', authMiddleware, (req, res) => {
  res.json({
    id: req.user._id,
    email: req.user.email,
    githubProfile: req.user.githubProfile,
    leetcodeUsername: req.user.leetcodeUsername,
    codeforcesUsername: req.user.codeforcesUsername,
  });
});

// Logout — clears server session and tells the client to drop its JWT
router.post('/logout', authMiddleware, (req, res) => {
  // Destroy passport session if it somehow exists
  if (req.session) {
    req.session.destroy(() => {});
  }

  // Clear the session cookie from the browser
  res.clearCookie('connect.sid', { path: '/' });

  // The frontend must also delete its JWT from localStorage/sessionStorage
  // We return a flag so the frontend knows to wipe it
  res.json({
    message: 'Logged out successfully',
    clearToken: true, // frontend should delete JWT on seeing this
  });
});

module.exports = router;