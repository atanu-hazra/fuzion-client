"use client";

import React, { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Eye, EyeClosed, Lock } from 'lucide-react';

// Zod schema for email validation
const newPasswordSchema = z.object({
    newPassword: z
        .string()
        .min(8, "Password must be at least 8 characters long")
        .regex(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/, "Password must include uppercase, lowercase, number, and special character."),
});

const SetNewPassword: React.FC = () => {
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();
    const [showNewPassword, setShowNewPassword] = useState(false);

    const form = useForm({
        resolver: zodResolver(newPasswordSchema),
        defaultValues: {
            newPassword: '',
        },
    });

    const onSubmit = async (data: { newPassword: string }) => {
        setSuccess('');
        setError('');

        try {
            const token = localStorage.getItem('verifiedEmailToken');
            const response = await api.post(
                '/api/v1/users/forgot-password',
                { newPassword: data.newPassword },
                {
                    headers: {
                        Authorization: `Bearer ${token}`, // Send token in Authorization header
                    },
                }
            );
            setSuccess(response.data.message);
            localStorage.removeItem('verifiedEmailToken');
            form.reset();
            router.push('/user/auth/login');
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Failed to register email. Please try again.');
            setSuccess('');
        }
    };

    return (
        <div className="flex items-center justify-center h-auto px-4">
            <div className="w-full max-w-md">
                <div className="bg-white/80 dark:bg-[#0f2a35]/80 backdrop-blur-xl border border-gray-200/60 dark:border-[#1a3d4d]/60 rounded-2xl shadow-xl dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)] p-8 md:p-10 transition-all duration-300">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-blue-600/10 dark:from-cyan-400/10 dark:to-blue-500/10 mb-4">
                            <Lock className="w-7 h-7 text-cyan-600 dark:text-cyan-400" />
                        </div>
                        <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-400 dark:to-blue-400 bg-clip-text text-transparent">
                            Reset Password
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5">
                            Choose a strong password for your account
                        </p>
                    </div>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                            {/* Password Field */}
                            <FormField
                                name="newPassword"
                                control={form.control}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            New Password
                                        </FormLabel>
                                        <div className="relative">
                                            <FormControl>
                                                <Input
                                                    className="h-11 rounded-xl bg-gray-50 dark:bg-[#0b1e28] border-gray-200 dark:border-[#1a3d4d] placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-cyan-500 dark:focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 dark:focus:ring-cyan-400/20 transition-all duration-200 pr-11"
                                                    type={showNewPassword ? "text" : "password"}
                                                    placeholder="Enter your new password"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="absolute right-1 top-1/2 -translate-y-1/2 h-9 w-9 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                                                onClick={() => setShowNewPassword(!showNewPassword)}
                                            >
                                                {showNewPassword ? (
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

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                disabled={form.formState.isSubmitting}
                                className="w-full h-11 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-medium shadow-lg shadow-cyan-500/20 dark:shadow-cyan-500/10 transition-all duration-200 hover:shadow-xl hover:shadow-cyan-500/30"
                            >
                                {form.formState.isSubmitting ? "Setting Password..." : "Set New Password"}
                            </Button>
                        </form>
                    </Form>
                </div>
            </div>
        </div>
    );
};

export default SetNewPassword;
