import express from "express";
import User from "../models/user.js"; // Import User model
import { addFriend, removeFriend } from "../controllers/user.controller.js";

const router = express.Router();

// Register a new user
router.post("/register", async (req, res) => {
  const { name, username, gender, bio, profile } = req.body;

  try {
    const newUser = new User({ name, username, gender, bio, profile });
    await newUser.save();
    res.status(201).json(newUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error registering user" });
  }
});

// Checking for username
router.post("/check", async (req, res) => {
  const { username } = req.body;

  try {
    const user = await User.findOne({ username });
    if (user) {
      return res.json({ exists: true });
    } else {
      return res.json({ exists: false });
    }
  } catch (error) {
    return res.status(500).json({ error: "Server error" });
  }
});

// Add friend route
router.post("/add-friend", addFriend);

// Remove friend route
router.post("/remove-friend", removeFriend);

// fetch friend list
router.get("/:username/friends", async (req, res) => {
  const { username } = req.params;

  try {
    // Find the user by username
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Fetch the friends using the array of friend IDs
    const friends = await User.find({ _id: { $in: user.friends } });
    res.json(friends);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching friend list" });
  }
});

//fetch all users
router.get("/", async (req, res) => {
  try {
    // Fetch all users
    const users = await User.find({}, "username name profile");
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching users" });
  }
});

//fetch single user with username
router.get("/:username", async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username });
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching user" });
  }
});

//update user data
router.put("/:username", async (req, res) => {
  const { username } = req.params;
  const updatedData = req.body;

  try {
    const user = await User.findOneAndUpdate({ username }, updatedData, {
      new: true,
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "Profile updated successfully", user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating profile" });
  }
});

// delete account
router.delete("/:username", async (req, res) => {
  const { username } = req.params;

  try {
    // Find the user to be deleted
    const userToDelete = await User.findOne({ username });
    if (!userToDelete) {
      return res.status(404).json({ error: "User not found" });
    }

    // Remove the user from all friends' friend lists
    await User.updateMany(
      { friends: userToDelete._id },
      { $pull: { friends: userToDelete._id } }
    );

    // Delete the user account
    await User.deleteOne({ _id: userToDelete._id });

    res.status(200).json({ message: "User account deleted successfully" });
  } catch (err) {
    console.error("Error deleting user account:", err);
    res
      .status(500)
      .json({ error: "An error occurred while deleting the account" });
  }
});

export default router;
