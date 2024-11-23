"use client";

import React, { useState, useEffect } from "react";
import socket from "../utils/socket";

// Type for a User
type Friend = {
  _id?: string;
  username: string;
  name: string;
  profile: string;
};

const Sidebar = ({
  username,
  friends,
  onlineFriends,
  showChatArea,
  showDashboard,
}: {
  username: string;
  friends: Friend[];
  onlineFriends: Set<string>;
  showChatArea: (friend: Friend) => void;
  showDashboard: boolean;
}) => {
  const [selectedFriend, setSelectedFriend] = useState<string | null>(null);

  return (
    <div className="w-1/4 bg-gray-100 p-4 border-r">
      <h2 className="text-xl font-bold border-b-4 mb-8 pb-4">
        {username}'s Friends
      </h2>
      {/* Placeholder for friends */}
      <ul className="mt-4">
        {/* Add more friends or dynamic rendering */}
        {friends.length > 0 &&
          friends.map((friend) => (
            <li
              className={`flex items-center cursor-pointer p-2 ${
                selectedFriend === friend.username && showDashboard === false
                  ? "border-l-8 border-blue-400 text-blue-500"
                  : ""
              }`}
              key={friend.username}
              onClick={() => {
                setSelectedFriend(friend.username);
                showChatArea(friend);
              }}
            >
              {friend.profile !== "" ? (
                <img
                  src={friend.profile}
                  alt={friend.name}
                  className="w-12 h-12 rounded-full mr-3 object-cover object-center"
                />
              ) : (
                <img
                  src={"https://via.placeholder.com/150"}
                  alt={friend.name}
                  className="w-12 h-12 rounded-full mr-2 object-cover object-center"
                />
              )}
              <section>
                <h2 className="text-md font-bold">{friend.name}</h2>
                <span className="text-sm text-gray-600">
                  @{friend.username}
                </span>
              </section>

              <div
                className={`ml-auto h-[10px] w-[10px] rounded-full flex-shrink-0 ${
                  onlineFriends.has(friend.username)
                    ? "bg-green-500"
                    : "bg-gray-500"
                }`}
              ></div>
            </li>
          ))}
      </ul>
    </div>
  );
};

export default Sidebar;
