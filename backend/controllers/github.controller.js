// controllers/github.controller.js
const axios = require('axios');

exports.getGithubAnalytics = async (req, res) => {
  try {
    // ← was req.user.username — fixed to correct path
    const username = req.user.githubProfile?.username;
    const token    = req.user.githubAccessToken;

    if (!username) return res.status(400).json({ error: 'GitHub profile not found' });

    const headers = token
      ? { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github.v3+json' }
      : { Accept: 'application/vnd.github.v3+json' };

    const [userData, repos] = await Promise.all([
      axios.get(`https://api.github.com/users/${username}`,             { headers }),
      axios.get(`https://api.github.com/users/${username}/repos?per_page=50`, { headers }),
    ]);

    res.json({ profile: userData.data, repos: repos.data });
  } catch (error) {
    console.error('GitHub controller error:', error.message);
    res.status(500).json({ error: 'Failed to fetch GitHub data' });
  }
};