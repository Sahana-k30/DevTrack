const mongoose = require('mongoose');

const codeforcesDataSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  codeforcesUsername: { type: String, required: true },
  handle: String,
  rating: { type: Number, default: 0 },
  maxRating: { type: Number, default: 0 },
  rank: { type: String, default: 'unrated' },
  maxRank: { type: String, default: 'unrated' },
  contribution: { type: Number, default: 0 },
  friendOfCount: { type: Number, default: 0 },
  totalSolved: { type: Number, default: 0 },
  totalSubmissions: { type: Number, default: 0 },
  verdictStats: {
    AC: { type: Number, default: 0 },
    WA: { type: Number, default: 0 },
    TLE: { type: Number, default: 0 },
    OTHER: { type: Number, default: 0 }
  },
  languageDistribution: { type: Map, of: Number, default: {} },
  ratingDistribution: { type: Map, of: Number, default: {} },
  ratingHistory: [{
    contestName: String,
    rating: Number,
    rank: Number,
    date: Date
  }],
  weeklyActivity: [{
    week: String,
    total: Number,
    solved: Number
  }],
  lastUpdated: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('CodeforcesData', codeforcesDataSchema);