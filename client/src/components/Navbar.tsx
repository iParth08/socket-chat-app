import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserPlus, UserRoundCheck } from "lucide-react";
import { Button } from "./ui/button";

// type friend
type Friend = {
  _id?: string;
  username: string;
  name: string;
  profile: string;
};

const Navbar = ({
  currentUser,
  friends,
  handleAddFriend,
  handleRemoveFriend,
  setShowDashboard,
  filteredUsers,
  searchQuery,
  handleSearch,
}: {
  currentUser: Friend | null;
  friends: Friend[];
  handleAddFriend: (username: string) => void;
  handleRemoveFriend: (username: string) => void;
  setShowDashboard: React.Dispatch<React.SetStateAction<boolean>>;
  filteredUsers: any[];
  searchQuery: string;
  handleSearch: (event: React.ChangeEvent<HTMLInputElement>) => void;
}) => {
  return (
    <header className="bg-gray-800 text-white p-4 flex justify-between items-center">
      <h1 className="text-xl font-bold">ChatterBox</h1>
      <div className="flex items-center space-x-4">
        {currentUser?.profile === "" ? (
          <img
            src={"https://via.placeholder.com/150"}
            alt={currentUser?.username}
            className="w-10 h-10 rounded-full"
          />
        ) : (
          <img
            src={currentUser?.profile}
            alt={currentUser?.username}
            className="w-10 h-10 rounded-full"
          />
        )}
        <Button onClick={() => setShowDashboard(true)}>
          {currentUser?.username}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
            Update Friendlist
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[320px]">
            <DropdownMenuLabel>Search Friend</DropdownMenuLabel>
            {/* add search query */}
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={handleSearch}
              className="w-full border h-[40px] border-gray-300 rounded-md px-4 py-1 mb-2"
            />
            <DropdownMenuSeparator />
            <div className="max-h-[500px] overflow-y-auto">
              {filteredUsers.map((user) => (
                <div
                  key={user.username}
                  className="flex justify-between items-center p-4 border rounded-lg shadow-md"
                >
                  {user.profile === "" ? (
                    <img
                      src={"https://via.placeholder.com/150"}
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover object-center"
                    />
                  ) : (
                    <img
                      src={user.profile}
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover object-center"
                    />
                  )}
                  <div>
                    <h3 className="text-center">{user.name}</h3>
                    <p className="text-center text-gray-500">
                      @{user.username}
                    </p>
                  </div>

                  {friends.some(
                    (friend) => friend.username === user.username
                  ) ? (
                    <Button
                      className="bg-green-600 hover:bg-red-500"
                      onClick={(e) => handleRemoveFriend(user.username)}
                    >
                      <UserRoundCheck />
                    </Button>
                  ) : (
                    <Button
                      className="hover:bg-green-500"
                      onClick={(e) => handleAddFriend(user.username)}
                    >
                      <UserPlus />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Navbar;
