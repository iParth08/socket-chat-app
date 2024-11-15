import mongoose from "mongoose";

// Define User schema
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"], // You can modify this as needed
    },
    bio: {
      type: String,
      default: "",
    },
    profile: {
      type: String, // URL to the profile picture
      default: "",
    },
    friends: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    blocked: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    online: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // Auto-generate createdAt and updatedAt timestamps
  }
);

// Create User model from the schema
const User = mongoose.model("User", userSchema);

export default User;
