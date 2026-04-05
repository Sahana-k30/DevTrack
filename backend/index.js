require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const session = require('express-session');
const passport = require('passport');
const connectDB = require('./config/db');
const { connectRedis } = require('./config/redis');
const { startCronJob } = require('./jobs/dataRefreshJob');  // line 1

require('./config/passport');

const authRoutes       = require('./routes/auth');
const githubRoutes     = require('./routes/github');
const leetcodeRoutes   = require('./routes/leetcode');
const codeforcesRoutes = require('./routes/codeforces');
const analyticsRoutes  = require('./routes/analytics');

const app = express();

const start = async () => {
  await connectDB();
  connectRedis();

  app.use(helmet());
  app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24, httpOnly: true, secure: false },
  }));

  app.use(passport.initialize());
  app.use(passport.session());

  app.use('/api/auth',       authRoutes);
  app.use('/api/github',     githubRoutes);
  app.use('/api/leetcode',   leetcodeRoutes);
  app.use('/api/codeforces', codeforcesRoutes);
  app.use('/api/analytics',  analyticsRoutes);

  app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

  app.use((err, req, res, next) => {
    console.error('Server error:', err.message);
    res.status(500).json({ message: 'Internal server error' });
  });

  startCronJob();

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
};

start().catch((err) => {
  console.error('Failed to start:', err);
  process.exit(1);
});