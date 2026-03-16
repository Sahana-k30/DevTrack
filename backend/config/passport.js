const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const User = require('../models/User');

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: `${process.env.SERVER_URL}/api/auth/github/callback`,
  scope: ['user:email', 'read:user', 'repo'],
},
async (accessToken, refreshToken, profile, done) => {
  try {
    // Find or create user
    let user = await User.findOne({ githubId: profile.id });

    if (!user) {
      user = await User.create({
        githubId: profile.id,
        githubAccessToken: accessToken,
        githubProfile: {
          username: profile.username,
          displayName: profile.displayName || profile.username,
          avatarUrl: profile.photos?.[0]?.value || '',
          profileUrl: profile.profileUrl || '',
          bio: profile._json?.bio || '',
          location: profile._json?.location || '',
          company: profile._json?.company || '',
          blog: profile._json?.blog || '',
          publicRepos: profile._json?.public_repos || 0,
          followers: profile._json?.followers || 0,
          following: profile._json?.following || 0,
        },
        email: profile.emails?.[0]?.value || '',
      });
    } else {
      // Update access token and profile on each login
      user.githubAccessToken = accessToken;
      user.githubProfile.avatarUrl = profile.photos?.[0]?.value || user.githubProfile.avatarUrl;
      user.githubProfile.publicRepos = profile._json?.public_repos || user.githubProfile.publicRepos;
      user.githubProfile.followers = profile._json?.followers || user.githubProfile.followers;
      await user.save();
    }

    return done(null, user);
  } catch (err) {
    console.error('GitHub strategy error:', err);
    return done(err, null);
  }
}));

module.exports = passport;