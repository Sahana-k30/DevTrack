const passport = require('passport');
const { Strategy: GitHubStrategy } = require('passport-github2');
const User = require('../models/User');

// ─── WHY serializeUser/deserializeUser are REMOVED ───────────────────────────
// These two functions store the user in the server-side session (cookie-based).
// Your app uses JWT — not sessions — for auth after the OAuth handshake.
// Keeping them meant passport was silently restoring the last logged-in user
// from the session cookie on every request, bypassing the logout entirely.
// Without them, passport only authenticates during the GitHub callback,
// then hands off to JWT for everything else. This is the correct flow.
// ─────────────────────────────────────────────────────────────────────────────

passport.use(
  new GitHubStrategy(
    {
      clientID:     process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL:  process.env.GITHUB_CALLBACK_URL,
      scope: ['user:email', 'read:user', 'repo'],
      // Forces GitHub to show account picker every time instead of
      // silently reusing the last authorized account in the browser
      authorizationURL: 'https://github.com/login/oauth/authorize',
      tokenURL: 'https://github.com/login/oauth/access_token',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const emails = profile.emails || [];
        const primaryEmail =
          emails.find((e) => e.primary)?.value ||
          emails[0]?.value ||
          '';

        const user = await User.findOneAndUpdate(
          { githubId: profile.id },
          {
            $set: {
              githubId:          profile.id,
              githubAccessToken: accessToken,
              email:             primaryEmail,
              githubProfile: {
                username:    profile.username,
                displayName: profile.displayName || profile.username,
                avatarUrl:   profile._json.avatar_url   || '',
                profileUrl:  profile.profileUrl         || '',
                bio:         profile._json.bio          || '',
                location:    profile._json.location     || '',
                company:     profile._json.company      || '',
                blog:        profile._json.blog         || '',
                publicRepos: profile._json.public_repos || 0,
                followers:   profile._json.followers    || 0,
                following:   profile._json.following    || 0,
              },
            },
          },
          { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
        );

        return done(null, user);
      } catch (err) {
        console.error('Passport GitHub strategy error:', err);
        return done(err, null);
      }
    }
  )
);

module.exports = passport;