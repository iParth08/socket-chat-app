"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import UserProfile from "@/components/Profile";
import ChatBox from "@/components/ChatBox";

import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";

import socket from "@/utils/socket";

// Type for a User
type Friend = {
  _id?: string;
  username: string;
  name: string;
  profile: string;
};

const Profile = ({ params }: { params: { username: string } }) => {
  const router = useRouter();
  const { username } = params; // Access the username from the URL parameter

  const [showDashboard, setShowDashboard] = useState(true);
  const [currentUser, setCurrentUser] = useState<Friend | null>(null);
  const [allUsers, setAllUsers] = useState<Friend[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<Friend[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const [userId, setUserId] = useState<string>("null");
  const [friendId, setFriendId] = useState<string>("null");

  useEffect(() => {
    // Fetch all users when the component mounts
    const fetchUserData = async () => {
      try {
        const currentUserResponse = await axios.get(
          `http://localhost:3333/api/users/${username}`
        );
        const allUsersResponse = await axios.get(
          "http://localhost:3333/api/users"
        );
        const friendsResponse = await axios.get(
          `http://localhost:3333/api/users/${username}/friends`
        );

        setCurrentUser(currentUserResponse.data);
        setAllUsers(allUsersResponse.data);
        setFriends(friendsResponse.data);
        setFilteredUsers(allUsersResponse.data); // Initially, show all users
      } catch (err) {
        console.error("Error fetching users.");
        console.error(err);
      }
    };

    fetchUserData();
  }, [username]);

  // handle filter by name or username
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);

    const filtered = allUsers.filter(
      (user) =>
        user.username.toLowerCase().includes(e.target.value.toLowerCase()) ||
        user.name.toLowerCase().includes(e.target.value.toLowerCase())
    );

    setFilteredUsers(filtered);
  };

  // Add to friend list
  const handleAddFriend = async (friendUsername: string) => {
    console.log("Adding friend:", friendUsername, "username:", username);
    try {
      await axios.post(`http://localhost:3333/api/users/add-friend`, {
        username,
        friendUsername,
      });

      // Fetch updated friend list
      const friendsResponse = await axios.get(
        `http://localhost:3333/api/users/${username}/friends`
      );
      setFriends(friendsResponse.data);
    } catch (err) {
      console.error("Error adding friend.");
      console.error(err);
    }
  };

  // remove friend
  const handleRemoveFriend = async (friendUsername: string) => {
    console.log("Removing friend:", friendUsername, "username:", username);
    try {
      await axios.post(`http://localhost:3333/api/users/remove-friend`, {
        username,
        friendUsername,
      });

      // Fetch updated friend list
      const friendsResponse = await axios.get(
        `http://localhost:3333/api/users/${username}/friends`
      );
      setFriends(friendsResponse.data);
    } catch (err) {
      console.error("Error removing friend.");
      console.error(err);
    }
  };

  //go to chatArea
  const showChatArea = (friend: Friend) => {
    if (currentUser && friend) {
      setShowDashboard(false);
      console.log(
        "Current Username : ",
        currentUser?.username,
        " UserID :",
        currentUser?._id
      );
      console.log(
        "Selected Friend : ",
        friend.username,
        " FriendId :",
        friend._id
      );

      setUserId(currentUser._id || "null");
      setFriendId(friend._id || "null");
    } else {
      console.error("Error: Current user or friend is missing");
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      {/* Navbar */}
      <Navbar
        currentUser={currentUser}
        friends={friends}
        handleAddFriend={handleAddFriend}
        handleRemoveFriend={handleRemoveFriend}
        setShowDashboard={setShowDashboard}
        filteredUsers={filteredUsers}
        searchQuery={searchQuery}
        handleSearch={handleSearch}
      />

      <div className="flex flex-1">
        {/* Sidebar for Friends (Placeholder for now) */}

        <Sidebar
          username={username}
          friends={friends}
          showChatArea={showChatArea}
          showDashboard={showDashboard}
        />

        {/* Main Content Area */}
        <div className="flex-1 p-8">
          {showDashboard && <UserProfile username={username} />}
          {!showDashboard && <ChatBox userId={userId} friendId={friendId} />}
        </div>
      </div>
    </div>
  );
};

export default Profile;
