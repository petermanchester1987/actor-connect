const express = require("express");
const router = express.Router();

const User = require("../../models/User");
const Post = require("../../models/Post");

const auth = require("../../middleware/auth");
const checkObjectId = require("../../middleware/checkObjectId");

const { check, validationResult } = require("express-validator");

// @route   POST api/posts
// @desc    create a post
// @access  Private
router.post(
  "/",
  [auth, [check("text", "Text is required").not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findById(req.user.id).select("-password");

      const newPost = new Post({
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id,
      });

      const post = await newPost.save();

      res.json(post);
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
//
//
// @route   GET api/posts
// @desc    Get all posts
// @access  Private
//
router.get("/", auth, async (req, res) => {
  try {
    const posts = await Post.find().sort({ date: -1 });
    res.json(posts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});
//
//
//
//
//
//
// @route   GET api/posts/:id
// @desc    Get a post by id
// @access  Private
//
router.get("/:id", [auth, checkObjectId("id")], async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ msg: "Post not found" });
    }
    res.json(post);
  } catch (err) {
    console.error(err.message);

    res.status(500).send("Server Error");
  }
});
//
//
//
//
//
// @route   DELETE api/posts/:id
// @desc    Delete a post by id
// @access  Private
//
router.delete("/:id", [auth, checkObjectId("id")], async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    //check post exists
    if (!post) {
      return res.status(404).json({ msg: "Post Not Found" });
    }

    //check user is owner of post
    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "User not authorized" });
    }

    await post.remove();

    res.json({ msg: "Post removed " });
  } catch (err) {
    console.error(err.message);

    res.status(500).send("Server Error");
  }
});
//
//
//
//
//
// @route   PUT api/posts/like/:id
// @desc    like a post by id
// @access  Private
//
router.put("/like/:id", [auth, checkObjectId("id")], async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    //check if post has already been liked by this user
    if (post.likes.some((like) => like.user.toString() === req.user.id)) {
      return res.status(400).json({ msg: "Post already liked" });
    }

    // add to the front of the post array if new like
    post.likes.unshift({ user: req.user.id });

    await post.save();

    res.json(post.likes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});
//
//
//
//
// @route   PUT api/posts/unlike/:id
// @desc    unlike a post a user has previously liked
// @access  Private
//
router.put("/unlike/:id", [auth, checkObjectId("id")], async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    //check if post has already been liked by this user
    if (post.likes.some((like) => like.user.toString() === req.user.id)) {
      return res.status(400).json({ msg: "Post has not yet been liked" });
    }

    // Get the index of the post to remove
    // by mapping through the likes array
    // and making it into a string
    // then getting the index of that like object in the array
    // const removeIndex = post.likes
    //   .map((like) => like.user.toString())
    //   .indexOf(req.user.id);

    // //and removing it from the array
    // post.likes.splice(removeIndex, 1);

    // BETTER WAY TO remove the like
    post.likes = post.likes.filter(
      ({ user }) => user.toString() !== req.user.id
    );

    await post.save();

    res.json(post.likes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});
//
//
//
//
//
//
// @route   POST api/posts/comment/:id
// @desc    comment on a post
// @access  Private
router.post(
  "/comment/:id",
  [
    auth,
    checkObjectId("id"),
    [check("text", "Text is required").not().isEmpty()],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // get user
      const user = await User.findById(req.user.id).select("-password");
      // get post from request
      const post = await Post.findById(req.params.id);

      //makes the request into an object
      const newComment = {
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id,
      };
      //adds the request to the front of the comments array
      post.comments.unshift(newComment);

      await post.save();

      res.json(post.comments);
    } catch (err) {
      console.error(err.message);
      if (err.kind === "ObjectId") {
        return res.status(404).json({ msg: "Post not found" });
      }
      res.status(500).send("Server Error");
    }
  }
);
//
//
//
//
//
// @route   DELETE api/posts/comment/:id/:comment_id
// @desc    Delete a comment on a post
// @access  Private
//
router.delete("/comment/:id/:comment_id", auth, async (req, res) => {
  try {
    // get post from request
    const post = await Post.findById(req.params.id);
    // Pull out comment from post
    const comment = post.comments.find(
      (comment) => comment.id === req.params.comment_id
    );

    // make sure comment exists
    if (!comment) {
      return res.status(404).json({ msg: "Comment does not exist" });
    }

    //check user
    if (comment.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "User Not Authorised" });
    }

    // Get the index of the post to remove
    // by mapping through the likes array
    // and making it into a string
    // then getting the index of that like object in the array
    // const removeIndex = post.comments
    //   .map((comment) => comment.user.toString())
    //   .indexOf(req.user.id);

    // //and removing it from the array
    // post.comments.splice(removeIndex, 1);

    // Better way of removing post comment
    post.comments = post.comments.filter(
      ({ id }) => id !== req.params.comment_id
    );

    await post.save();

    res.json(post.comments);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Post not found" });
    }
    res.status(500).send("Server Error");
  }
});

module.exports = router;
