const express = require("express");
const axios = require("axios");

const router = express.Router();

router.get("/analytics/:username", async (req, res) => {
  try {
    const username = req.params.username;

    const userRes = await axios.get(`https://api.github.com/users/${username}`);
    const repoRes = await axios.get(
      `https://api.github.com/users/${username}/repos`
    );

    const user = userRes.data;
    const repos = repoRes.data;

    const totalStars = repos.reduce((sum, repo) => sum + repo.stargazers_count, 0);

    const languages = {};
    repos.forEach((repo) => {
      if (repo.language) {
        languages[repo.language] = (languages[repo.language] || 0) + 1;
      }
    });

    res.json({
      username: user.login,
      avatar: user.avatar_url,
      profile: user.html_url,
      followers: user.followers,
      following: user.following,
      publicRepos: user.public_repos,
      totalStars,
      languages,
    });

  } catch (error) {
    res.status(500).json({ error: "Failed to fetch GitHub data" });
  }
});

module.exports = router;