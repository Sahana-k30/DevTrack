const User = require("../models/user.model");

exports.home = (req, res) => {

  res.json({
    message: "Welcome to DevTrack API"
  });

};


exports.dashboard = async (req, res) => {

  try {

    const user = await User.findById(req.user._id);

    res.json({
      message: "Dashboard data",
      user
    });

  } catch (error) {

    res.status(500).json({
      error: "Server error"
    });

  }

};

exports.logout = async (req, res) => {
  req.logout(() => {
    req.session.destroy();
    res.json({ message: "Logged out successfully" });
  });
};