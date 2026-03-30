// models/GitHubData.js
const mongoose = require('mongoose');

const commitSchema = new mongoose.Schema({
  sha: String,
  message: String,
  date: Date,
  repo: String,
  additions: { type: Number, default: 0 },
  deletions: { type: Number, default: 0 },
});

const repoSchema = new mongoose.Schema({
  name: String,
  description: String,
  url: String,
  language: String,
  stars: { type: Number, default: 0 },
  forks: { type: Number, default: 0 },
  isPrivate: { type: Boolean, default: false },
  createdAt: Date,
  updatedAt: Date,
  topics: [String],
});

const prSchema = new mongoose.Schema({
  title: String,
  repo: String,
  state: String,
  createdAt: Date,
  mergedAt: Date,
  additions: { type: Number, default: 0 },
  deletions: { type: Number, default: 0 },
});

const githubDataSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  username: { type: String, default: '' }, // ← was missing, caused save to silently drop it
  repos: [repoSchema],
  commits: [commitSchema],
  pullRequests: [prSchema],
  languageDistribution: { type: Map, of: Number, default: {} },
  weeklyCommits: [{ week: String, count: { type: Number, default: 0 } }],
  contributionStreak: {
    current: { type: Number, default: 0 },
    longest: { type: Number, default: 0 },
  },
  totalCommits: { type: Number, default: 0 },
  totalPRs: { type: Number, default: 0 },
  totalStars: { type: Number, default: 0 },
  updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('GitHubData', githubDataSchema);