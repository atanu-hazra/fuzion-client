"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { logout } from "@/features/userSlice";
import { KeyRound } from 'lucide-react';

// Zod schema for email validation
const forgotPasswordSchema = z.object({
    usernameOrEmail: z.string().min(1, "Email or username is required"),
});

const SendForgotPassOtp: React.FC = () => {
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();
    const dispatch = useDispatch<AppDispatch>()
    const currentUserData = useSelector((state: RootState) => state.user.currentUserData)
    const accessToken = useSelector((state: RootState) => state.user.accessToken);
    const isLoggedIn = useMemo(() => !!currentUserData, [currentUserData]);
    const [isSubmitting, setIsSubmitting] = useState(false)

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
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: {
            usernameOrEmail: '',
        },
    });

    const onSubmit = async (data: { usernameOrEmail: string }) => {
        setSuccess('');
        setError('');
        setIsSubmitting(true)

        try {
            const response = await api.post(
                '/api/v1/users/send-forgot-password-otp',
                { usernameOrEmail: data.usernameOrEmail }
            );
            setSuccess(response.data.message);
            const token = response.data.data.token;
            const forgotPassEmail = response.data.data.email
            localStorage.setItem('forgotPassEmailToken', token);
            localStorage.setItem('forgotPassEmail', forgotPassEmail);
            localStorage.setItem('usernameOrEmail', data.usernameOrEmail);
            form.reset(); // Reset form fields
            router.push('/settings/forgot-password/verify-otp'); // Redirect to verification page
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Failed to register email. Please try again.');
            setSuccess('');
        } finally {
            setIsSubmitting(false)
        }
    };

    return (
        <div className="flex items-center justify-center h-auto px-4">
            <div className="w-full max-w-md">
                <div className="bg-white/80 dark:bg-[#0f2a35]/80 backdrop-blur-xl border border-gray-200/60 dark:border-[#1a3d4d]/60 rounded-2xl shadow-xl dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)] p-8 md:p-10 transition-all duration-300">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-blue-600/10 dark:from-cyan-400/10 dark:to-blue-500/10 mb-4">
                            <KeyRound className="w-7 h-7 text-cyan-600 dark:text-cyan-400" />
                        </div>
                        <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-400 dark:to-blue-400 bg-clip-text text-transparent">
                            Forgot Password
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5">
                            Enter your email or username to receive a reset code
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
                                disabled={isSubmitting}
                                className="w-full h-11 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-medium shadow-lg shadow-cyan-500/20 dark:shadow-cyan-500/10 transition-all duration-200 hover:shadow-xl hover:shadow-cyan-500/30"
                            >
                                {isSubmitting ? "Sending Code..." : "Send Reset Code"}
                            </Button>

                            {/* Back to login */}
                            <div className="text-center pt-2">
                                <button
                                    onClick={() => router.push('/user/auth/login')}
                                    type='button'
                                    className="text-sm text-gray-500 dark:text-gray-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors duration-200"
                                >
                                    Remember your password? <span className="font-medium">Sign in</span>
                                </button>
                            </div>
                        </form>
                    </Form>
                </div>
            </div>
        </div>
    );
};

export default SendForgotPassOtp;
