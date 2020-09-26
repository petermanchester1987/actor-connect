const express = require("express");
//const axios = require("axios");
const router = express.Router();
const auth = require("../../middleware/auth");
const { check, validationResult } = require("express-validator");
const request = require("request");
const config = require("config");
const normalize = require("normalize-url");
const checkObjectId = require("../../middleware/checkObjectId");

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
    const profileFields = {
      user: req.user.id,
      company,
      location,
      website:
        website && website !== ""
          ? normalize(website, { forceHttps: true })
          : "",
      bio,
      status,
      spotlightpin,
      //splits the comma seperated list from a string to an array
      //then map through the items and trim them off

      skills: Array.isArray(skills)
        ? skills
        : skills.split(",").map((skill) => " " + skill.trim()),
    };

    //build social object

    // Build social object and add to profileFields
    const socialfields = { youtube, twitter, instagram, linkedin, facebook };

    for (const [key, value] of Object.entries(socialfields)) {
      if (value && value.length > 0)
        socialfields[key] = normalize(value, { forceHttps: true });
    }
    profileFields.social = socialfields;

    try {
      // Using upsert option (creates new doc if no match is found):
      let profile = await Profile.findOneAndUpdate(
        { user: req.user.id },
        { $set: profileFields },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );
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
router.get(
  "/user/:user_id",
  checkObjectId("user_id"),
  async ({ params: { user_id } }, res) => {
    try {
      const profile = await Profile.findOne({
        user: user_id,
      }).populate("user", ["name", "avatar"]);

      if (!profile) return res.status(400).json({ msg: "Profile not found" });

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
      check("from", "From date is required and needs to be from the past'")
        .not()
        .isEmpty()
        .custom((value, { req }) => (req.body.to ? value < req.body.to : true)),
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
    const foundProfile = await Profile.findOne({ user: req.user.id });

    //Get the remove index

    // const removeIndex = profile.experience.map((item) =>
    //   item.id.indexOf(req.params.exp_id)
    // );

    // profile.experience.splice(removeIndex, 1);

    // better way to remove

    foundProfile.experience = foundProfile.experience.filter(
      (exp) => exp._id.toString() !== req.params.exp_id
    );

    await foundProfile.save();
    return res.status(200).json(foundProfile);

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
      check("from", "From date is required  and needs to be from the past")
        .not()
        .isEmpty()
        .custom((value, { req }) => (req.body.to ? value < req.body.to : true)),
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
    const foundProfile = await Profile.findOne({ user: req.user.id });

    //Get the remove index

    // const removeIndex = profile.education.map((item) =>
    //   item.id.indexOf(req.params.edu_id)
    // );

    // profile.education.splice(removeIndex, 1);

    // BETTER removal method
    foundProfile.education = foundProfile.education.filter(
      (edu) => edu._id.toString() !== req.params.edu_id
    );
    await foundProfile.save();
    return res.status(200).json(foundProfile);

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

// // @route    GET api/profile/github/:username
// // @desc     Get user repos from Github
// // @access   Public
// router.get('/github/:username', async (req, res) => {
//   try {
//     const uri = encodeURI(
//       `https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created:asc`
//     );
//     const headers = {
//       'user-agent': 'node.js',
//       Authorization: `token ${config.get('githubToken')}`
//     };

//     const gitHubResponse = await axios.get(uri, { headers });
//     return res.json(gitHubResponse.data);
//   } catch (err) {
//     console.error(err.message);
//     return res.status(404).json({ msg: 'No Github profile found' });
//   }
// });

module.exports = router;
