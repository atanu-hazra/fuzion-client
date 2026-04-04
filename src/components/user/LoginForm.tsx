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
import { Eye, EyeClosed } from "lucide-react";
import { useDispatch, useSelector } from 'react-redux';
import { setAccessToken, setCurrentUserData, setRefreshToken } from '@/features/userSlice';
import { CurrentUserData } from '@/types';
import { AppDispatch, RootState } from "@/store/store";
import { logout } from "@/features/userSlice";
import { GoogleLogin } from '@react-oauth/google';

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

    const handleGoogleSuccess = async (credentialResponse: any) => {
        setSuccess('');
        setError('');
        setIsLogging(true);
        try {
            const response = await api.post('/api/v1/users/google-auth', { credential: credentialResponse.credential });
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
    };

    return (
        <div className="flex flex-col items-center min-h-screen">
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="p-6 rounded md:shadow-md w-[100%] md:w-[50%] lg:w-[45%]"
                >
                    <h2 className="text-2xl font-bold text-center mb-4 text-blue-500">Login</h2>

                    {/* Email Field */}
                    <FormField
                        name="usernameOrEmail"
                        control={form.control}
                        render={({ field }) => (
                            <FormItem
                                className='my-2'
                            >
                                <FormLabel>Email or Username:</FormLabel>
                                <FormControl>
                                    <Input
                                        className='placeholder:text-slate-400'
                                        type="text"
                                        placeholder="Enter your email or username"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage className="text-red-500" />
                            </FormItem>
                        )}
                    />

                    <FormField
                        name="password"
                        control={form.control}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Password:</FormLabel>
                                <div className="relative">
                                    <FormControl>
                                        <Input
                                            className='placeholder:text-slate-400'
                                            type={showPassword ? "text" : "password"} placeholder="Enter your password" {...field}
                                        />
                                    </FormControl>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="absolute inset-y-0 right-2"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeClosed className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </Button>
                                </div>
                                <FormMessage className="text-red-300" />
                            </FormItem>
                        )}
                    />

                    {/* Success and Error Messages */}
                    {error && <p className="text-red-500 mb-2">{error}</p>}
                    {success && <p className="text-green-500 mb-2">{success}</p>}

                    {/* Submit Button */}
                    <Button
                        type="submit"
                        className="bg-blue-500 text-white rounded my-5 p-2 w-full hover:bg-blue-600"
                    >
                        {isLogging ? "Logging In..." : "Log in"}
                    </Button>

                    <div className="flex justify-center my-4">
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={() => setError('Google Login Failed')}
                        />
                    </div>

                    <Button
                        onClick={() => router.push('/user/auth/register-email')}
                        type='button'
                        className="w-full text-center text-sm text-blue-500 hover:underline hover:text-blue-600"
                    >
                        New to Fuzion? Join now.
                    </Button>

                    <Button
                        onClick={() => router.push('/settings/forgot-password/send-otp')}
                        type='button'
                        className="w-full text-center text-sm text-blue-500 hover:underline hover:text-blue-600"
                    >
                        Forgot your password? Reset it here.
                    </Button>

                </form>

            </Form>



        </div>
    );
};

export default LoginForm;
