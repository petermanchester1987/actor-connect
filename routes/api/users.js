const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator/check");

//bring in model schema
const User = require("../../models/User");

// @route   POST api/users
// @desc    register user
// @access  Public
router.post(
  "/",
  [
    check("name", "Name is required").not().isEmpty(),
    check("email", "Please include a valid Email").isEmail(),
    check(
      "password",
      "Please enter a password with 6 or more characters"
    ).isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    //destructure the object
    const { name, email, password } = req.body;

    try {
      //see if user exists
      let user = await User.findOne({ email });

      if (user) {
        res.status(400).json({ errors: [{ msg: "User already exists" }] });
      }

      // get users gravatar

      //encrypt password

      //return jsonwebtoken

      res.send("user route");
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  }
);

module.exports = router;
