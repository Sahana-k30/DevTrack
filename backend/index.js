require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const session = require('express-session');
const mongoose = require('mongoose');// CORRECT - destructure the default export
const { default: MongoStore } = require('connect-mongo');
const passport = require('passport');

const connectDB = require('./config/db');
const { connectRedis } = require('./config/redis');
require('./config/passport');

const authRoutes = require('./routes/auth');
const githubRoutes = require('./routes/github');
const leetcodeRoutes = require('./routes/leetcode');
const codeforcesRoutes = require('./routes/codeforces');
const analyticsRoutes = require('./routes/analytics');
const { startCronJobs } = require('./jobs/dataRefresh');

const app = express();

const start = async () => {
  try {
    // 1. Connect MongoDB Atlas FIRST before anything else
    await connectDB();

    // 2. Connect Redis
    connectRedis();

    // 3. Security middleware
    app.use(helmet());
    app.use(cors({
      origin: process.env.CLIENT_URL,
      credentials: true,
    }));
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // 4. Session using same Atlas connection — avoids BSON conflict
    app.use(session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      store: MongoStore.create({
        client: mongoose.connection.getClient(),
        collectionName: 'sessions',
        ttl: 24 * 60 * 60, // 1 day
      }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24,
        httpOnly: true,
        secure: false, // set true in production with HTTPS
      },
    }));

    // 5. Passport
    app.use(passport.initialize());
    app.use(passport.session());

    // 6. Routes
    app.use('/api/auth', authRoutes);
    app.use('/api/github', githubRoutes);
    app.use('/api/leetcode', leetcodeRoutes);
    app.use('/api/codeforces', codeforcesRoutes);
    app.use('/api/analytics', analyticsRoutes);

    // 7. Health check
    app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

    // 8. Global error handler
    app.use((err, req, res, next) => {
      console.error('❌ Server error:', err.message);
      res.status(500).json({ message: 'Internal server error' });
    });

    // 9. Start cron jobs
    startCronJobs();

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`🚀 DevTracker server running on port ${PORT}`));

  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
};

start();

module.exports = app;