"use client";

import React, { useEffect, useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useSelector } from 'react-redux';
import { Eye, EyeClosed, Trash2 } from "lucide-react";
import { AppDispatch, RootState } from "@/store/store";
import { useDispatch } from "react-redux";
import { logout } from "@/features/userSlice";


// Zod schema for email validation
const deleteAccountSchema = z.object({
    password: z.string().min(1, "Password is required.")
});

const DeleteAccount: React.FC = () => {
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();
    const currentUserData = useSelector((state: RootState) => state.user.currentUserData)
    const accessToken = useSelector((state: RootState) => state.user.accessToken);
    const [showPassword, setShowPassword] = useState(false);
    const dispatch = useDispatch<AppDispatch>()

    const form = useForm({
        resolver: zodResolver(deleteAccountSchema),
        defaultValues: {
            password: ''
        },
    });

    useEffect(() => {
        if (!currentUserData) {
            router.push("/user/auth/login");
            return
        }
    }, [currentUserData])

    const onSubmit = async (data: { password: string }) => {
        setSuccess('');
        setError('');

        try {
            const response = await api.delete(
                '/api/v1/users/delete-user',
                {
                    data: {
                        password: data.password,
                    },
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );
            dispatch(logout())
            setSuccess(response.data.message);
            form.reset(); // Reset form fields
            router.push('/');
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Failed to delete user. Please try again.');
            setSuccess('');
        }
    };

    return (
        <div className="flex items-center justify-center h-auto px-4">
            <div className="w-full max-w-md">
                <div className="bg-white/80 dark:bg-[#0f2a35]/80 backdrop-blur-xl border border-red-200/60 dark:border-red-900/30 rounded-2xl shadow-xl dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)] p-8 md:p-10 transition-all duration-300">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500/10 to-rose-600/10 dark:from-red-400/10 dark:to-rose-500/10 mb-4">
                            <Trash2 className="w-7 h-7 text-red-500 dark:text-red-400" />
                        </div>
                        <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-red-500 to-rose-600 dark:from-red-400 dark:to-rose-400 bg-clip-text text-transparent">
                            Delete Account
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5">
                            This action is permanent and cannot be undone
                        </p>
                    </div>

                    {/* Warning */}
                    <div className="mb-6 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/15 border border-red-200/80 dark:border-red-800/30">
                        <p className="text-sm text-red-700 dark:text-red-300 leading-relaxed">
                            Deleting your account will permanently remove all your data, including saved tweets, playlists, and uploaded videos. This action cannot be undone.
                        </p>
                    </div>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                            {/* Password Field */}
                            <FormField
                                name="password"
                                control={form.control}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Confirm Password
                                        </FormLabel>
                                        <div className="relative">
                                            <FormControl>
                                                <Input
                                                    className="h-11 rounded-xl bg-gray-50 dark:bg-[#0b1e28] border-gray-200 dark:border-[#1a3d4d] placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-red-500 dark:focus:border-red-400 focus:ring-2 focus:ring-red-500/20 dark:focus:ring-red-400/20 transition-all duration-200 pr-11"
                                                    type={showPassword ? "text" : "password"}
                                                    placeholder="Enter your password to proceed"
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
                                                {showPassword ? (
                                                    <EyeClosed className="w-4 h-4" />
                                                ) : (
                                                    <Eye className="w-4 h-4" />
                                                )}
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

                            {/* Delete Button */}
                            <Button
                                type="submit"
                                className="w-full h-11 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-medium shadow-lg shadow-red-500/20 dark:shadow-red-500/10 transition-all duration-200 hover:shadow-xl hover:shadow-red-500/30"
                            >
                                Delete My Account
                            </Button>

                            {/* Back to settings */}
                            <div className="text-center pt-2">
                                <button
                                    onClick={() => router.push('/settings')}
                                    type='button'
                                    className="text-sm text-gray-500 dark:text-gray-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors duration-200"
                                >
                                    Changed your mind? <span className="font-medium">Go back to settings</span>
                                </button>
                            </div>
                        </form>
                    </Form>
                </div>
            </div>
        </div>
    );
};

export default DeleteAccount;
