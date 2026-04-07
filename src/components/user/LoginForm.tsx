"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Eye, EyeClosed, LogIn } from "lucide-react";
import { useDispatch, useSelector } from 'react-redux';
import { setAccessToken, setCurrentUserData, setRefreshToken } from '@/features/userSlice';
import { CurrentUserData } from '@/types';
import { AppDispatch, RootState } from "@/store/store";
import { logout } from "@/features/userSlice";
import { useGoogleLogin } from '@react-oauth/google';

// Zod schema for email validation
const loginSchema = z.object({
    usernameOrEmail: z.
        string()
        .min(1, "Username or Email is required"),
    password: z
        .string()
        .min(1, "Password is required.")
});

const LoginForm: React.FC = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();
    const dispatch = useDispatch<AppDispatch>()
    const currentUserData = useSelector((state: RootState) => state.user.currentUserData);
    const accessToken = useSelector((state: RootState) => state.user.accessToken);
    const isLoggedIn = useMemo(() => !!currentUserData, [currentUserData]);
    const [isLogging, setIsLogging] = useState(false)

    const googleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            setSuccess('');
            setError('');
            setIsLogging(true);
            try {
                const response = await api.post('/api/v1/users/google-auth', { access_token: tokenResponse.access_token });
                setSuccess(response.data.message);
                const userData: CurrentUserData = response.data?.data.user || null;
                const accessToken: string = response.data?.data.accessToken;
                const refreshToken: string = response.data?.data.refreshToken;
                dispatch(setCurrentUserData(userData));
                dispatch(setAccessToken(accessToken));
                dispatch(setRefreshToken(refreshToken));
                router.push('/');
            } catch (err: any) {
                setError(err.response?.data?.message || 'Failed to authenticate with Google.');
            } finally {
                setIsLogging(false);
            }
        },
        onError: () => setError('Google Login Failed'),
        flow: 'implicit',
    });

    // Automatically log out the user if they are already logged in
    useEffect(() => {
        const handleLogout = async () => {
            if (isLoggedIn) {
                try {
                    await api.post('/api/v1/users/logout', {
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                        },
                    });
                    dispatch(logout());
                } catch (error: any) {
                    console.error(
                        error.response?.data?.message || 'Failed to log out from the previous account.'
                    );
                }
            }
        };

        handleLogout();
    }, []);

    const form = useForm({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            usernameOrEmail: "",
            password: ""
        },
    });

    const onSubmit = async (data: { usernameOrEmail: string, password: string }) => {
        setSuccess('');
        setError('');
        setIsLogging(true)

        try {
            const response = await api.post('/api/v1/users/login', { usernameOrEmail: data.usernameOrEmail, password: data.password });
            setSuccess(response.data.message);
            form.reset();
            const userData: CurrentUserData = response.data?.data.user || null
            const accessToken: string = response.data?.data.accessToken
            const refreshToken: string = response.data?.data.refreshToken
            dispatch(setCurrentUserData(userData))
            dispatch(setAccessToken(accessToken))
            dispatch(setRefreshToken(refreshToken))
            router.push('/')
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Failed to register email. Please try again.');
            setSuccess('');
        } finally {
            setIsLogging(false)
        }
    };


    return (
        <div className="flex items-center justify-center h-auto px-4">
            <div className="w-full max-w-md">
                <div className="bg-white/80 dark:bg-[#0f2a35]/80 backdrop-blur-xl border border-gray-200/60 dark:border-[#1a3d4d]/60 rounded-2xl shadow-xl dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)] p-8 md:p-10 transition-all duration-300">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-blue-600/10 dark:from-cyan-400/10 dark:to-blue-500/10 mb-4">
                            <LogIn className="w-7 h-7 text-cyan-600 dark:text-cyan-400" />
                        </div>
                        <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-400 dark:to-blue-400 bg-clip-text text-transparent">
                            Welcome Back
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5">
                            Sign in to your Fuzion account
                        </p>
                    </div>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                            {/* Email/Username Field */}
                            <FormField
                                name="usernameOrEmail"
                                control={form.control}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Email or Username
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                className="h-11 rounded-xl bg-gray-50 dark:bg-[#0b1e28] border-gray-200 dark:border-[#1a3d4d] placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-cyan-500 dark:focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 dark:focus:ring-cyan-400/20 transition-all duration-200"
                                                type="text"
                                                placeholder="Enter your email or username"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage className="text-red-500 dark:text-red-400 text-xs" />
                                    </FormItem>
                                )}
                            />

                            {/* Password Field */}
                            <FormField
                                name="password"
                                control={form.control}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Password
                                        </FormLabel>
                                        <div className="relative">
                                            <FormControl>
                                                <Input
                                                    className="h-11 rounded-xl bg-gray-50 dark:bg-[#0b1e28] border-gray-200 dark:border-[#1a3d4d] placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-cyan-500 dark:focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 dark:focus:ring-cyan-400/20 transition-all duration-200 pr-11"
                                                    type={showPassword ? "text" : "password"}
                                                    placeholder="Enter your password"
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
                            {error && (
                                <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40">
                                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                                </div>
                            )}
                            {success && (
                                <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/40">
                                    <p className="text-sm text-green-600 dark:text-green-400">{success}</p>
                                </div>
                            )}

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                disabled={isLogging}
                                className="w-full h-11 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-medium shadow-lg shadow-cyan-500/20 dark:shadow-cyan-500/10 transition-all duration-200 hover:shadow-xl hover:shadow-cyan-500/30"
                            >
                                {isLogging ? "Signing In..." : "Sign In"}
                            </Button>

                            {/* Divider */}
                            <div className="relative my-6">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-200 dark:border-[#1a3d4d]"></div>
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-white dark:bg-[#0f2a35] px-3 text-gray-400 dark:text-gray-500">
                                        or continue with
                                    </span>
                                </div>
                            </div>

                            {/* Google Login */}
                            <button
                                type="button"
                                onClick={() => googleLogin()}
                                disabled={isLogging}
                                className="w-full flex items-center justify-center gap-3 h-11 rounded-xl border border-gray-200 dark:border-[#1a3d4d] bg-white dark:bg-[#0b1e28] hover:bg-gray-50 dark:hover:bg-[#0f2a35] text-gray-700 dark:text-gray-300 font-medium text-sm transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <svg width="18" height="18" viewBox="0 0 48 48">
                                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                                    <path fill="none" d="M0 0h48v48H0z"/>
                                </svg>
                                Continue with Google
                            </button>

                            {/* Bottom Links */}
                            <div className="pt-4 space-y-2 border-t border-gray-100 dark:border-[#1a3d4d]/50">
                                <button
                                    onClick={() => router.push('/user/auth/register-email')}
                                    type='button'
                                    className="w-full text-center text-sm text-gray-500 dark:text-gray-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors duration-200"
                                >
                                    New to Fuzion? <span className="font-medium">Join now</span>
                                </button>
                                <button
                                    onClick={() => router.push('/settings/forgot-password/send-otp')}
                                    type='button'
                                    className="w-full text-center text-sm text-gray-500 dark:text-gray-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors duration-200"
                                >
                                    Forgot your password? <span className="font-medium">Reset it here</span>
                                </button>
                            </div>
                        </form>
                    </Form>
                </div>
            </div>
        </div>
    );
};

export default LoginForm;
