const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const { check, validationResult } = require("express-validator");
const request = require("request");
const config = require("config");

const Profile = require("../../models/Profile");
const User = require("../../models/User");
const Post = require("../../models/Post");

// @route   GET api/profile/me
// @desc    Get current users profile
// @access  Private
router.get("/me", auth, async (req, res) => {
  try {
    // setting variable equal to promise of the profile model finding
    // a user with the req.param that comes in
    //then populating it with the user model
    // the second argument is an array of what you want to bring in
    const profile = await Profile.findOne({
      user: req.user.id,
    }).populate("user", ["name", "avatar"]);

    if (!profile) {
      return res.status(400).json({ msg: "There is no profile for this user" });
    }

    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});
//
//
//
//
// @route   POST api/profile/
// @desc    Create or update a user profile
// @access  Private
//
router.post(
  "/",
  [
    auth,
    [
      check("status", "Status is required").not().isEmpty(),
      check("skills", "Skills are required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    //destructure from req.body
    const {
      company,
      location,
      website,
      bio,
      skills,
      status,
      spotlightpin,
      youtube,
      twitter,
      instagram,
      linkedin,
      facebook,
    } = req.body;

    //build profile object
    const profileFields = {};
    profileFields.user = req.user.id;
    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (bio) profileFields.bio = bio;
    if (status) profileFields.status = status;
    if (spotlightpin) profileFields.spotlightpin = spotlightpin;
    if (skills) {
      //splits the comma seperated list from a string to an array
      //then map through the items and trim them off

      profileFields.skills = skills.split(",").map((skill) => skill.trim());
    }

    //build social object

    profileFields.social = {};
    if (youtube) profileFields.social.youtube = youtube;
    if (twitter) profileFields.social.twitter = twitter;
    if (facebook) profileFields.social.facebook = facebook;
    if (linkedin) profileFields.social.linkedin = linkedin;
    if (instagram) profileFields.social.instagram = instagram;

    try {
      let profile = await Profile.findOne({ user: req.user.id });

      if (profile) {
        //update if there is one

        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        );

        await profile.save();

        return res.json(profile);
      }

      //create if not found!

      profile = await new Profile(profileFields);

      await profile.save();

      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

//
//
//
//
// @route   GET api/profile/
// @desc    get all user profiles
// @access  Public
//
router.get("/", async (req, res) => {
  try {
    const profiles = await Profile.find().populate("user", ["name", "avatar"]);
    res.json(profiles);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

//
//
//
//
// @route   GET api/profile/user/:user_id
// @desc    get profile by user id
// @access  Public
//
router.get("/user/:user_id", async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.params.user_id,
    }).populate("user", ["name", "avatar"]);

    if (!profile) return res.status(400).json({ msg: "Profile not found" });

    res.json(profile);
  } catch (err) {
    console.error(err.message);
    if (err.kind == "ObjectId") {
      return res.status(400).json({ msg: "Profile not found" });
    }
    res.status(500).send("Server Error");
  }
});

//
//
//
//
// @route   DELETE api/profile
// @desc    delete profile, user and posts
// @access  Private
//
router.delete("/", auth, async (req, res) => {
  try {
    //Remove users posts
    await Post.deleteMany({ user: req.user.id });

    //will remove profile
    await Profile.findOneAndRemove({ user: req.user.id });
    //will remove user
    await User.findOneAndRemove({ _id: req.user.id });

    res.json({ msg: "User deleted" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

//
//
//
//
// @route   PUT api/profile/experience
// @desc    Add profile experience
// @access  Private
//
router.put(
  "/experience",
  [
    auth,
    [
      check("title", "Title is required").not().isEmpty(),
      check("company", "Company is required").not().isEmpty(),
      check("from", "From date is required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      role,
      company,
      director,
      location,
      from,
      to,
      current,
      description,
    } = req.body;

    const newExp = {
      title,
      role,
      company,
      director,
      location,
      from,
      to,
      current,
      description,
    };

    try {
      const profile = await Profile.findOne({ user: req.user.id });

      profile.experience.unshift(newExp);

      await profile.save();

      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

//
//
//
//
// @route   Delete api/profile/experience/:exp_id
// @desc    delete experience from profile
// @access  Private

router.delete("/experience/:exp_id", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });

    //Get the remove index

    const removeIndex = profile.experience.map((item) =>
      item.id.indexOf(req.params.exp_id)
    );

    profile.experience.splice(removeIndex, 1);

    await profile.save();

    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

//
//
//
//
// @route   PUT api/profile/education
// @desc    Add profile education
// @access  Private
//
router.put(
  "/education",
  [
    auth,
    [
      check("school", "School is required").not().isEmpty(),
      check("degree", "Qualificaton is required").not().isEmpty(),
      check("fieldofstudy", "Field of study is required").not().isEmpty(),
      check("from", "From date is required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description,
    } = req.body;

    const newEdu = {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description,
    };

    try {
      const profile = await Profile.findOne({ user: req.user.id });

      profile.education.unshift(newEdu);

      await profile.save();

      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

//
//
//
//
// @route   Delete api/profile/education/:edu_id
// @desc    delete education from profile
// @access  Private

router.delete("/education/:edu_id", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });

    //Get the remove index

    const removeIndex = profile.education.map((item) =>
      item.id.indexOf(req.params.edu_id)
    );

    profile.education.splice(removeIndex, 1);

    await profile.save();

    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

//
//
//
// //
// // @route   GET api/profile/spotlight/:username
// // @desc    get user spotlight link
// // @access  Public
// //
// router.get("/spotlight/:username", (req, res) => {
//   try {
//     /* IF WE WERE GETTING A REAL API

//       IT would be

//       const options = {
//       uri: `https://api.github.com/
//       users/${req.params.username}/
//       repos?
//       per_page=5&
//       sort=created:asc&
//       client_id=${config.get('githubClientId)}&
//       client_secret=${config.get('githubSecret)}`,
//       method: 'GET',

//       sometime this may be needed..check docs
//       headers: { 'user-agent': 'node.js' }
//         };

//         request(options, (error, response, body) => {
//           if(error) console.error(error);

//           if(response.statusCode !== 200) {
//             res.status(404).json({ msg: 'No Spotlight Profile Found'})
//           }
//       })

//       */
//     const options = {
//       uri: `https://www.spotlight.com/${req.params.username}`,
//     };

//     request(options, (error, response, body) => {
//       if (error) console.error(error);

//       if (response.statusCode !== 200) {
//         res.status(404).json({ msg: "No Spotlight Profile Found" });
//       }

//       res.json(JSON.parse(body));
//     });
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send("Server Error");
//   }
// });

module.exports = router;
