const mongoose = require('mongoose');

const leetCodeDataSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  leetcodeUsername: {
    type: String,
    required: true,
    trim: true
  },
  totalSolved: { type: Number, default: 0 },
  easySolved: { type: Number, default: 0 },
  mediumSolved: { type: Number, default: 0 },
  hardSolved: { type: Number, default: 0 },
  totalQuestions: { type: Number, default: 0 },
  easyTotal: { type: Number, default: 0 },
  mediumTotal: { type: Number, default: 0 },
  hardTotal: { type: Number, default: 0 },
  acceptanceRate: { type: Number, default: 0 },
  ranking: { type: Number, default: 0 },
  contributionPoints: { type: Number, default: 0 },
  streak: { type: Number, default: 0 },
  maxStreak: { type: Number, default: 0 },
  submissionCalendar: {
    type: Map,
    of: Number,
    default: {}
  },
  recentSubmissions: [
    {
      title: String,
      titleSlug: String,
      timestamp: String,
      statusDisplay: String,
      lang: String
    }
  ],
  topicWiseStats: [
    {
      topicName: String,
      problemsSolved: Number
    }
  ],
  weeklyProgress: [
    {
      week: String,
      solved: Number,
      easy: Number,
      medium: Number,
      hard: Number
    }
  ],
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('LeetCodeData', leetCodeDataSchema);