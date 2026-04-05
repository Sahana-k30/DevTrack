const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    githubId: { type: String, required: true, unique: true },
    githubAccessToken: { type: String, default: '' },
    email: { type: String, default: '' },
    leetcodeUsername: { type: String, default: '' },
    codeforcesUsername: { type: String, default: '' },
    lastRefreshed:       { type: Date, default: null },
    githubProfile: {
      username:     { type: String, default: '' },
      displayName:  { type: String, default: '' },
      avatarUrl:    { type: String, default: '' },
      profileUrl:   { type: String, default: '' },
      bio:          { type: String, default: '' },
      location:     { type: String, default: '' },
      company:      { type: String, default: '' },
      blog:         { type: String, default: '' },
      publicRepos:  { type: Number, default: 0 },
      followers:    { type: Number, default: 0 },
      following:    { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);