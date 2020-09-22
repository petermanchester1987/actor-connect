const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");

//have to bring in User model
const User = require("../../models/User");

// @route   GET api/auth
// @desc    Test route
// @access  Private
router.get("/", auth, async (req, res) => {
  try {
    //so you're making a request to the database and then finding by Id, using
    //the previously auth user id, but not sending the password back!!
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
