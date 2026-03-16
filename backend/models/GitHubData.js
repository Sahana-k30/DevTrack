const mongoose = require('mongoose');

const commitSchema = new mongoose.Schema({
  sha: String,
  message: String,
  date: Date,
  repo: String,
  additions: Number,
  deletions: Number,
});

const repoSchema = new mongoose.Schema({
  name: String,
  description: String,
  url: String,
  language: String,
  stars: Number,
  forks: Number,
  isPrivate: Boolean,
  createdAt: Date,
  updatedAt: Date,
  topics: [String],
});

const prSchema = new mongoose.Schema({
  title: String,
  repo: String,
  state: String, // open | closed | merged
  createdAt: Date,
  mergedAt: Date,
  additions: Number,
  deletions: Number,
});

const githubDataSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  repos: [repoSchema],
  commits: [commitSchema],
  pullRequests: [prSchema],
  languageDistribution: { type: Map, of: Number }, // { JavaScript: 45, Python: 30, ... }
  weeklyCommits: [{ week: String, count: Number }],  // last 52 weeks
  contributionStreak: { current: Number, longest: Number },
  totalCommits: { type: Number, default: 0 },
  totalPRs: { type: Number, default: 0 },
  totalStars: { type: Number, default: 0 },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('GitHubData', githubDataSchema);