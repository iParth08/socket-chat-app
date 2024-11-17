import { useEffect, useState } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { useRouter } from "next/navigation";

type User = {
  name: string;
  username: string;
  bio: string;
  gender: string;
  profile: string;
};

const UserProfile = ({ username }: { username: string }) => {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const { register, handleSubmit, reset } = useForm<User>();

  // Fetch user details on mount
  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3333/api/users/${username}`
        );
        setUserProfile(response.data);
        reset(response.data); // Populate form fields with user data
      } catch (error) {
        console.error("Error fetching user details:", error);
        alert("Failed to fetch user details.");
      }
    };

    fetchUserDetails();
  }, [username, reset]);

  //handle Delete Account
  const handleDeleteAccount = async () => {
    try {
      await axios.delete(`http://localhost:3333/api/users/${username}`);
      setUserProfile(null);
      //   alert("Account deleted successfully!");
      router.push("/");
    } catch (error) {
      console.error("Error deleting account:", error);
      alert("Failed to delete account. Please try again.");
    }
  };

  // Submit updated profile to the database
  const onSubmit = async (data: User) => {
    try {
      await axios.put(`http://localhost:3333/api/users/${username}`, data);
      setUserProfile(data);
      setIsEditing(false);
      //   alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile. Please try again.");
    }
  };

  return (
    <div className="flex flex-col items-center p-8 border rounded-lg shadow-lg bg-white max-w-lg mx-auto">
      <div className="flex items-center space-x-4 mb-4">
        {/* Profile Picture */}
        <img
          src={userProfile?.profile || "https://via.placeholder.com/150"}
          alt={userProfile?.name || "Profile Picture"}
          className="w-20 h-20 rounded-full object-cover object-center border-2 border-gray-300"
        />

        {/* User Information */}
        <div>
          <h1 className="text-2xl font-bold">
            {userProfile?.name || "Name not available"}
          </h1>
          <p className="text-gray-500">
            @{userProfile?.username || "Username not available"}
          </p>
        </div>
      </div>

      {/* Form */}
      <form className="space-y-4 w-full" noValidate>
        {/* Name */}
        <div>
          <label className="block font-semibold text-gray-600">Name:</label>
          <input
            type="text"
            {...register("name")}
            className="w-full border p-2 rounded-md"
            disabled={!isEditing}
          />
        </div>

        {/* Username */}
        <div>
          <label className="block font-semibold text-gray-600">Username:</label>
          <input
            type="text"
            {...register("username")}
            className="w-full border p-2 rounded-md"
            disabled
          />
        </div>

        {/* Bio */}
        <div>
          <label className="block font-semibold text-gray-600">Bio:</label>
          <textarea
            {...register("bio")}
            className="w-full border p-2 rounded-md"
            disabled={!isEditing}
          />
        </div>

        {/* Profile Picture */}
        <div>
          <label className="block font-semibold text-gray-600">Profile:</label>
          <input
            type="text"
            {...register("profile")}
            className="w-full border p-2 rounded-md"
            disabled={!isEditing}
          />
        </div>

        {/* Gender */}
        <div>
          <label className="block font-semibold text-gray-600">Gender:</label>
          <select
            id="gender"
            {...register("gender")}
            className="mt-2 w-full text-center border-2 p-2 rounded-sm"
          >
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Buttons */}
        <div className="mt-4 flex justify-between">
          {isEditing ? (
            <>
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded-md"
                onClick={handleSubmit(onSubmit)} // Submit form on click
              >
                Save
              </button>
              <button
                type="button"
                className="bg-gray-500 text-white px-4 py-2 rounded-md"
                onClick={() => {
                  setIsEditing(false);
                  reset(userProfile || {}); // Reset form to original values
                }}
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className="bg-green-500 text-white px-4 py-2 rounded-md"
                onClick={(e) => {
                  e.preventDefault(); // Prevent default action
                  setIsEditing(true);
                }}
              >
                Update
              </button>

              <AlertDialog>
                <AlertDialogTrigger className="bg-red-500 text-white px-4 py-2 rounded-md">
                  Delete Account
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete
                      your account and remove your data from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteAccount}
                      className="bg-red-500"
                    >
                      Yes, I Agree
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}
        </div>
      </form>
    </div>
  );
};

export default UserProfile;
