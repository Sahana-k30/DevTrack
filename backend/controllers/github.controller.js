const axios = require("axios");

exports.getGithubAnalytics = async (req, res) => {

  try {

    const username = req.user.username;

    const userData = await axios.get(
      `https://api.github.com/users/${username}`
    );

    const repos = await axios.get(
      `https://api.github.com/users/${username}/repos`
    );

    res.json({
      profile: userData.data,
      repos: repos.data
    });

  } catch (error) {
    res.status(500).json({ error: "Failed to fetch GitHub data" });
  }

};