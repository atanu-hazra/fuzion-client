"use client";

import React, { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Eye, EyeClosed, UserPlus } from "lucide-react";
import api from "@/lib/api";
import { useDispatch } from "react-redux";
import { setCurrentUserData, setAccessToken, setRefreshToken } from "@/features/userSlice";
import { CurrentUserData } from "@/types";
import { AppDispatch } from "@/store/store";

// Zod schema for validation
const registrationSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters long")
    .regex(/^[a-zA-Z0-9-_]+$/, "Invalid username: only letters, numbers, hyphens, and underscores are allowed."),
  bio: z
    .string()
    .max(100, "Bio must not exceed 100 characters"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .regex(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/, "Password must include uppercase, lowercase, number, and special character."),
});

const RegistrationForm: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isRegistering, setIsRegistering] = useState(false)

  const form = useForm({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      fullName: "",
      bio: "",
      username: "",
      password: "",
    },
  });

  const onSubmit = async (data: any) => {
    setSuccessMessage("");
    setErrorMessage("");

    const formData = new FormData();
    formData.append("fullName", data.fullName);
    formData.append("bio", data.bio);
    formData.append("username", data.username);
    formData.append("password", data.password);
    setIsRegistering(true)

    try {
      const verifiedEmailToken = localStorage.getItem("verifiedEmailToken");
      if (!verifiedEmailToken) {
        throw new Error("No token found. Please register your email again.");
      }
      const response = await api.post("/api/v1/users/register", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${verifiedEmailToken}`,
        },
      });
      const createdUserData: CurrentUserData = response.data?.data
      setSuccessMessage(response.data.message || "Registration successful!");
      // auto-login the user
      try {
        const response = await api.post('/api/v1/users/login', { usernameOrEmail: createdUserData.username, password: data.password });
        form.reset(); // Reset form fields
        const userData: CurrentUserData = response.data?.data.user || null
        dispatch(setCurrentUserData(userData))
        const accessToken: string = response.data?.data.accessToken
        const refreshToken: string = response.data?.data.refreshToken
        dispatch(setCurrentUserData(userData))
        dispatch(setAccessToken(accessToken))
        dispatch(setRefreshToken(refreshToken))
        router.push('/')
      } catch (err: any) {
        console.error(err.response?.data?.message || err.message || 'Something went wrong while auto logging in the user.');
      }
      form.reset()
      router.push("/user/settings/add-avatar-cover")
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || err.message || "Something went wrong.");
    } finally {
      setIsRegistering(true)
    }
  };

  const inputClasses = "h-11 rounded-xl bg-gray-50 dark:bg-[#0b1e28] border-gray-200 dark:border-[#1a3d4d] placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-cyan-500 dark:focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 dark:focus:ring-cyan-400/20 transition-all duration-200";

  return (
    <div className="flex items-center justify-center h-auto px-4">
      <div className="w-full max-w-md">
        <div className="bg-white/80 dark:bg-[#0f2a35]/80 backdrop-blur-xl border border-gray-200/60 dark:border-[#1a3d4d]/60 rounded-2xl shadow-xl dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)] p-8 md:p-10 transition-all duration-300">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-blue-600/10 dark:from-cyan-400/10 dark:to-blue-500/10 mb-4">
              <UserPlus className="w-7 h-7 text-cyan-600 dark:text-cyan-400" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-400 dark:to-blue-400 bg-clip-text text-transparent">
              Create Account
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5">
              Set up your profile to get started
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              {/* Full Name */}
              <FormField
                name="fullName"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</FormLabel>
                    <FormControl>
                      <Input
                        className={inputClasses}
                        placeholder="Enter your full name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-red-500 dark:text-red-400 text-xs" />
                  </FormItem>
                )}
              />

              {/* Username */}
              <FormField
                name="username"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">Username</FormLabel>
                    <FormControl>
                      <Input
                        className={inputClasses}
                        placeholder="Choose a username"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-red-500 dark:text-red-400 text-xs" />
                  </FormItem>
                )}
              />

              {/* Bio */}
              <FormField
                name="bio"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">Bio</FormLabel>
                    <FormControl>
                      <Input
                        className={inputClasses}
                        placeholder="Tell us a little about yourself"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-red-500 dark:text-red-400 text-xs" />
                  </FormItem>
                )}
              />

              {/* Password */}
              <FormField
                name="password"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">Password</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input
                          className={`${inputClasses} pr-11`}
                          type={showPassword ? "text" : "password"}
                          placeholder="Create a strong password"
                          {...field}
                        />
                      </FormControl>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-9 w-9 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeClosed className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                    <FormMessage className="text-red-500 dark:text-red-400 text-xs" />
                  </FormItem>
                )}
              />

              {/* Feedback Messages */}
              {errorMessage && (
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40">
                  <p className="text-sm text-red-600 dark:text-red-400">{errorMessage}</p>
                </div>
              )}
              {successMessage && (
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/40">
                  <p className="text-sm text-green-600 dark:text-green-400">{successMessage}</p>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isRegistering}
                className="w-full h-11 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-medium shadow-lg shadow-cyan-500/20 dark:shadow-cyan-500/10 transition-all duration-200 hover:shadow-xl hover:shadow-cyan-500/30"
              >
                {isRegistering ? "Creating Account..." : "Create Account"}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default RegistrationForm;
