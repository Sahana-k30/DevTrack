const passport = require('passport');
const { Strategy: GitHubStrategy } = require('passport-github2');
const User = require('../models/User');

passport.serializeUser((user, done) => {
  done(null, user._id.toString());
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user || false);
  } catch (err) {
    done(err, null);
  }
});

passport.use(
  new GitHubStrategy(
    {
      clientID:     process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL:  process.env.GITHUB_CALLBACK_URL,
      scope: ['user:email', 'read:user', 'repo'],
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
              githubId:         profile.id,
              githubAccessToken: accessToken,
              email:            primaryEmail,
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
          { upsert: true, new: true, setDefaultsOnInsert: true }
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