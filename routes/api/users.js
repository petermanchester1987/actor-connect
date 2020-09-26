const express = require("express");
const router = express.Router();
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");
const { check, validationResult } = require("express-validator");
const normalize = require("normalize-url");

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
        return res
          .status(400)
          .json({ errors: [{ msg: "User already exists" }] });
      }

      // get users gravatar
      const avatar = normalize(
        gravatar.url(email, {
          s: "200",
          r: "pg",
          d: "mm",
        }),
        { forceHttps: true }
      );

      //making a new user instance - have to save it later
      user = new User({
        name,
        email,
        avatar,
        password,
      });

      // NOW TO encrypt password
      // you have to create a variable called salt to do the hashing with
      const salt = await bcrypt.genSalt(10);

      //then you pass in the object to the hash function with the plain text password and the salt
      user.password = await bcrypt.hash(password, salt);

      //this returns a promise saving the user instance that you can use
      //like on the line beneath
      await user.save();

      //return jsonwebtoken
      const payload = {
        user: {
          id: user.id,
        },
      };
      //call the jwt function with the payload with the id from the promise
      //the secret hidden in the config folder
      //and options for when it expires
      //
      //NEED TO MAKE IT expiresIn: 3600  OTHERWISE ITLL LAST FAR TOO LONG!

      jwt.sign(
        payload,
        config.get("jwtSecret"),
        { expiresIn: "5 days" },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  }
);

module.exports = router;
