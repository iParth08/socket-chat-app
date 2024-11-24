"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { burl } from "@/utils/socket";

type FormData = {
  username: string;
  name?: string;
  gender?: string;
  bio?: string;
  profile?: string;
};

const Home = () => {
  console.log("Present At:", `Home Page`); //!route flag
  const [isLogin, setIsLogin] = useState(true); // Toggle between login and registration form
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  // Use react-hook-form for form management
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  // Function to handle form submission for login (check if user exists)
  const handleLogin = async (data: FormData) => {
    setError(null);

    try {
      const response = await axios.post(`${burl}/api/users/check`, {
        username: data.username,
      });
      if (response.data.exists) {
        toast({
          title: "Login successful",
          description: "Welcome back!",
        });
        console.log("After login:", `/chat/${data.username}`); //!route flag
        router.replace(`/chat/${data.username}`);

        // Redirect to the chat room for the logged-in user
      } else {
        setError("User not found. Please create a new profile.");
        toast({
          title: "User not found",
          description: "Please create a new profile.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while checking user.",
        variant: "destructive",
      });
      setError("Error occurred while checking user.");
      console.error(error);
    }
  };

  // Function to handle form submission for creating a new profile
  const handleRegister = async (data: FormData) => {
    setError(null);

    try {
      const response = await axios.post(`${burl}/api/users/register`, {
        name: data.name,
        username: data.username,
        gender: data.gender,
        bio: data.bio,
        profile: data.profile,
      });
      toast({
        title: "Registration successful",
        description: "Welcome to the ChatterBox!",
      });
      console.log("After Register:", `/chat/${data.username}`); //!route flag
      router.push(`/chat/${data.username}`); // Redirect to the chat room after successful registration
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while creating the profile.",
        variant: "destructive",
      });
      setError("Error occurred while creating the profile.");
      console.error(error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen text-center">
      <h1 className="text-3xl font-bold mb-8">Welcome to the Chat App</h1>

      {/* Form to login or create a profile */}
      <div className="w-full max-w-sm p-8 border rounded-lg bg-white shadow-lg">
        {isLogin ? (
          <>
            <h2 className="text-2xl font-semibold mb-4">Join the Server</h2>
            <form onSubmit={handleSubmit(handleLogin)}>
              <div className="mb-4">
                <Label htmlFor="username">Username</Label>
                <Input
                  type="text"
                  id="username"
                  {...register("username", {
                    required: "Username is required",
                  })}
                  className="w-full mt-2"
                />
                {errors.username && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.username.message}
                  </p>
                )}
              </div>
              {error && <Alert variant="destructive">{error}</Alert>}
              <Button type="submit" className="w-full mt-4">
                Join
              </Button>
            </form>
            <p className="mt-4">
              Don’t have an account?{" "}
              <a
                onClick={() => {
                  setIsLogin(false);
                  setError(null);
                }}
                className="text-blue-500 hover:underline cursor-pointer"
              >
                Create a new profile
              </a>
            </p>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-semibold mb-4">Create New Profile</h2>
            <form onSubmit={handleSubmit(handleRegister)}>
              <div className="mb-4">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  type="text"
                  id="name"
                  {...register("name", { required: "Name is required" })}
                  className="w-full mt-2"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.name.message}
                  </p>
                )}
              </div>
              <div className="mb-4">
                <Label htmlFor="username">Username</Label>
                <Input
                  type="text"
                  id="username"
                  {...register("username", {
                    required: "Username is required",
                  })}
                  className="w-full mt-2"
                />
                {errors.username && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.username.message}
                  </p>
                )}
              </div>
              <div className="mb-4">
                <Label htmlFor="gender">Gender:</Label> <br />
                <select
                  id="gender"
                  {...register("gender")}
                  className="mt-2 w-full text-center border-2 p-2 rounded-sm"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                {errors.gender && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.gender.message}
                  </p>
                )}
              </div>
              <div className="mb-4">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  {...register("bio", { required: "Bio is required" })}
                  className="w-full mt-2"
                />
                {errors.bio && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.bio.message}
                  </p>
                )}
              </div>
              <div className="mb-4">
                <Label htmlFor="profile">Profile Picture URL</Label>
                <Input
                  type="text"
                  id="profile"
                  {...register("profile")}
                  className="w-full mt-2"
                />
              </div>
              {error && <Alert variant="destructive">{error}</Alert>}
              <Button type="submit" className="w-full mt-4">
                Create Profile
              </Button>
            </form>
            <p className="mt-4">
              Already have an account?{" "}
              <a
                onClick={() => {
                  setIsLogin(true);
                  setError(null);
                }}
                className="text-blue-500 hover:underline cursor-pointer"
              >
                Login
              </a>
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default Home;
