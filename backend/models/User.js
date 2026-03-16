const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  githubId: { type: String, required: true, unique: true },
  githubAccessToken: { type: String },
  email: { type: String },
  leetcodeUsername: { type: String, default: '' },
  codeforcesUsername: { type: String, default: '' },
  githubProfile: {
    username: String,
    displayName: String,
    avatarUrl: String,
    profileUrl: String,
    bio: String,
    location: String,
    company: String,
    blog: String,
    publicRepos: { type: Number, default: 0 },
    followers: { type: Number, default: 0 },
    following: { type: Number, default: 0 },
  },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);