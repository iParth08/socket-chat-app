import User from "../models/user.js"; // Import User model
import { socketMap } from "../index.js";

export const addFriend = async (req, res) => {
  console.log("addFriend called"); // !flag1
  console.log(" Addfriend->socketMap ::", socketMap); // !flag2
  const { username, friendUsername } = req.body;
  const io = req.io; // Access io from the request object

  try {
    const user = await User.findOne({ username });
    const friend = await User.findOne({ username: friendUsername });

    if (!user || !friend) {
      return res.status(404).json({ error: "User or friend not found" });
    }

    // Avoid adding the user as their own friend
    if (user._id.toString() === friend._id.toString()) {
      return res
        .status(400)
        .json({ error: "You cannot add yourself as a friend" });
    }

    // Add friend to the user's friends array and vice versa
    if (!user.friends.includes(friend._id)) {
      user.friends.push(friend._id);
      await user.save();
    }

    if (!friend.friends.includes(user._id)) {
      friend.friends.push(user._id);
      await friend.save();
    }
    console.log("Friends Updated"); // !flag2
    // Emit real-time event : [userId : username]
    const userSocket = socketMap.get(user._id.toString());
    const friendSocket = socketMap.get(friend._id.toString());

    console.table([userSocket, friendSocket]); // !flag3

    // Emit real-time event
    if (userSocket) {
      io.to(userSocket).emit("friend_list_updated", { updated: true });
      console.log("Present to recieve event : ", userSocket);
    }

    if (friendSocket) {
      io.to(friendSocket).emit("friend_list_updated", { updated: true });
      console.log("Present to recieve event : ", friendSocket);
    }

    res.status(200).json({ message: "Friend added successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add friend" });
  }
};

export const removeFriend = async (req, res) => {
  console.log("RemoveFriend called"); // !flag1
  console.log("RemoveFriend->socketMap ::", socketMap); // !flag2
  const { username, friendUsername } = req.body;
  const io = req.io; // Access io from the request object

  console.log("io", io._path); // !flag1.1

  try {
    const user = await User.findOne({ username });
    const friend = await User.findOne({ username: friendUsername });

    if (!user || !friend) {
      return res.status(404).json({ error: "User or friend not found" });
    }

    // Check if they are actually friends
    if (
      !user.friends.includes(friend._id) ||
      !friend.friends.includes(user._id)
    ) {
      return res.status(400).json({ error: "They are not friends" });
    }

    // Remove friend from user's friends array and vice versa
    user.friends = user.friends.filter(
      (friendId) => friendId.toString() !== friend._id.toString()
    );
    friend.friends = friend.friends.filter(
      (friendId) => friendId.toString() !== user._id.toString()
    );

    await user.save();
    await friend.save();

    console.log("Friend Removed"); // !flag2
    // Emit real-time event
    const userSocket = socketMap.get(user._id.toString());
    const friendSocket = socketMap.get(friend._id.toString());

    console.table([userSocket, friendSocket]); // !flag3

    if (userSocket) {
      io.to(userSocket).emit("friend_list_updated", { updated: true });
      console.log("Present to recieve event : ", userSocket);
    }

    if (friendSocket) {
      io.to(friendSocket).emit("friend_list_updated", { updated: true });
      console.log("Present to recieve event : ", friendSocket);
    }

    res.status(200).json({ message: "Friend removed successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to remove friend" });
  }
};
