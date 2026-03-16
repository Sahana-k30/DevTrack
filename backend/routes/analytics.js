const express = require('express');
const router = express.Router();
const isAuthenticated = require('../middleware/auth');
const GitHubData = require('../models/GitHubData');
const LeetCodeData = require('../models/LeetCodeData');
const CodeforcesData = require('../models/CodeforcesData');

router.use(isAuthenticated);

// Skill radar
router.get('/skill-radar', async (req, res) => {
  try {
    const [gh, lc, cf] = await Promise.all([
      GitHubData.findOne({ userId: req.user._id }),
      LeetCodeData.findOne({ userId: req.user._id }),
      CodeforcesData.findOne({ userId: req.user._id }),
    ]);

    const radar = {
      github: gh ? Math.min(100, Math.round((gh.totalCommits / 500) * 100)) : 0,
      leetcode: lc ? Math.min(100, Math.round((lc.totalSolved / 500) * 100)) : 0,
      codeforces: cf ? Math.min(100, Math.round((cf.rating / 2000) * 100)) : 0,
      consistency: gh ? Math.min(100, (gh.contributionStreak?.current || 0) * 5) : 0,
      problemSolving: lc ? Math.min(100, Math.round(((lc.mediumSolved * 2 + lc.hardSolved * 3) / 300) * 100)) : 0,
      competitive: cf ? Math.min(100, Math.round((cf.totalSolved / 300) * 100)) : 0,
    };

    res.json(radar);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Productivity
router.get('/productivity', async (req, res) => {
  try {
    const gh = await GitHubData.findOne({ userId: req.user._id });
    if (!gh) return res.json({ score: 0, recentCommits: 0, commitTrend: 0 });

    const fourWeeksAgo = new Date(Date.now() - 28 * 24 * 60 * 60 * 1000);
    const eightWeeksAgo = new Date(Date.now() - 56 * 24 * 60 * 60 * 1000);

    const recentCommits = gh.commits?.filter(c => new Date(c.date) > fourWeeksAgo).length || 0;
    const prevCommits = gh.commits?.filter(c => {
      const d = new Date(c.date);
      return d > eightWeeksAgo && d <= fourWeeksAgo;
    }).length || 0;

    const commitTrend = prevCommits > 0
      ? Math.round(((recentCommits - prevCommits) / prevCommits) * 100)
      : recentCommits > 0 ? 100 : 0;

    const score = Math.min(100, Math.round(
      (recentCommits / 50) * 40 +
      (gh.contributionStreak?.current || 0) * 2 +
      Math.max(0, 20 - Math.abs(commitTrend))
    ));

    res.json({ score, recentCommits, commitTrend });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Insights
router.get('/insights', async (req, res) => {
  try {
    const [gh, lc, cf] = await Promise.all([
      GitHubData.findOne({ userId: req.user._id }),
      LeetCodeData.findOne({ userId: req.user._id }),
      CodeforcesData.findOne({ userId: req.user._id }),
    ]);

    const insights = [];

    if (gh) {
      if ((gh.contributionStreak?.current || 0) < 3)
        insights.push('Your commit streak is low — try to commit daily to build consistency');
      if (gh.totalCommits < 50)
        insights.push('Increase your commit frequency to show active development');
      const langs = Object.keys(gh.languageDistribution || {});
      if (langs.length < 3)
        insights.push('Consider learning a new language to diversify your skills');
    } else {
      insights.push('GitHub data loading — refresh the GitHub page to load your data');
    }

    if (lc) {
      if ((lc.hardSolved || 0) < 10)
        insights.push('Practice more Hard problems on LeetCode to strengthen problem-solving');
      if ((lc.streak?.current || 0) < 3)
        insights.push('Maintain a daily LeetCode streak to improve consistency');
      const mediumRatio = (lc.mediumSolved || 0) / (lc.totalSolved || 1);
      if (mediumRatio < 0.4)
        insights.push('Focus on Medium difficulty problems — they appear most in interviews');
    } else {
      insights.push('Add your LeetCode username to track problem-solving progress');
    }

    if (cf) {
      if ((cf.rating || 0) < 1200)
        insights.push('Solve more Codeforces Div.2 A and B problems to increase your rating');
      if ((cf.totalSolved || 0) < 50)
        insights.push('Try to solve at least 3 Codeforces problems per week');
    } else {
      insights.push('Add your Codeforces handle to track competitive programming progress');
    }

    res.json(insights);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Timeline
router.get('/timeline', async (req, res) => {
  try {
    const [gh, cf] = await Promise.all([
      GitHubData.findOne({ userId: req.user._id }),
      CodeforcesData.findOne({ userId: req.user._id }),
    ]);

    const events = [];

    gh?.repos?.slice(0, 10).forEach(repo => {
      if (repo.createdAt) {
        events.push({
          date: repo.createdAt,
          platform: 'github',
          type: 'repo',
          title: `Created: ${repo.name}`,
          description: repo.description || repo.language || '',
        });
      }
    });

    cf?.ratingHistory?.forEach(r => {
      if (r.date) {
        events.push({
          date: r.date,
          platform: 'codeforces',
          type: 'rating',
          title: r.contestName || 'Contest',
          description: `Rating: ${r.rating} · Rank: ${r.rank}`,
        });
      }
    });

    events.sort((a, b) => new Date(b.date) - new Date(a.date));
    res.json(events.slice(0, 50));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;