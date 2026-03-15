const express = require("express");
const passport = require("passport");

const router = express.Router();

const {logout}= require("../controllers/auth.controller");

/* Step 1: Redirect to GitHub login */
router.get(
  "/github",
  passport.authenticate("github", { scope: ["user:email"] })
);

/* Step 2: GitHub redirects here after login */
router.get(
  "/github/callback",
  passport.authenticate("github", { failureRedirect: "/" }),
  (req, res) => {
    res.redirect("http://localhost:5174/dashboard");
  }
);

router.get("/logout", logout);


module.exports = router;