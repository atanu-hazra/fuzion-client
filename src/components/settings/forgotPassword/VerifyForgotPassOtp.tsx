"use client";

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { maskEmail } from '@/lib/helpers';
import { ShieldCheck } from 'lucide-react';

const VerifyForgotPassOtp: React.FC = () => {
    const [forgotPasswordOTP, setForgotPasswordOTP] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isResendDisabled, setIsResendDisabled] = useState(true);
    const [resendTimeLeft, setResendTimeLeft] = useState(60);
    const [isVerifying, setIsVerifying] = useState(false)
    const router = useRouter();
    const forgotPassEmail = localStorage.getItem('forgotPassEmail'); // use it to show where the otp has been sent
    const maskedEmail = maskEmail(String(forgotPassEmail))

    const form = useForm({
        defaultValues: {
            forgotPasswordOTP: '',
        },
    });

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (forgotPasswordOTP === "") {
            setError('OTP is required');
            return;
        }

        setIsVerifying(true)
        try {
            const token = localStorage.getItem('forgotPassEmailToken');
            if (!token) {
                console.error('No token found.');
                router.push('/settings/forgot-password/send-otp')
            }
            const response = await api.post(
                '/api/v1/users/verify-forgot-password-otp',
                { forgotPasswordOTP: Number(forgotPasswordOTP) },
                {
                    headers: {
                        Authorization: `Bearer ${token}`, // Send token in Authorization header
                    },
                    withCredentials: true,
                }
            );
            setSuccess(response.data.message);
            // After successful verification, clearing token
            localStorage.removeItem('forgotPassEmailToken');
            const verifiedEmailToken = response.data.data.token;
            localStorage.setItem("verifiedEmailToken", verifiedEmailToken);
            localStorage.removeItem("usernameOrEmail");
            setError('');
            setForgotPasswordOTP('');
            router.push('/settings/forgot-password/set-new-password');
        } catch (err: any) {
            setError(err.response?.data?.message || "OTP verification failed.");
            setSuccess('');
        }
    };

    // Function to handle Resend OTP
    const handleResendOTP = async () => {
        const usernameOrEmail = localStorage.getItem('usernameOrEmail');
        if (!usernameOrEmail) {
            setError('Unauthorized request 2!');
            return;
        }

        try {
            const response = await api.post(
                '/api/v1/users/send-forgot-password-otp',
                { usernameOrEmail }
            );
            setSuccess(response.data.message);
            const token = response.data.data.token;
            const forgotPassEmail = response.data.data.email
            localStorage.setItem('forgotPassEmailToken', token);
            localStorage.setItem('forgotPassEmail', forgotPassEmail);
            setError('');
            resetTimers();
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Failed to register email. Please try again.');
            setSuccess('');;
            resetTimers();
        } finally {
            setIsVerifying(false)
        }
    };

    // Function to reset timers
    const resetTimers = () => {
        setResendTimeLeft(60);
        setIsResendDisabled(true);

        const countdown = (time: number) => {
            if (time > 0) {
                setResendTimeLeft(time);
                setTimeout(() => countdown(time - 1), 1000);
            } else {
                setIsResendDisabled(false);
            }
        };

        countdown(60); // Start countdown from 60 seconds
    };

    useEffect(() => {
        resetTimers();
    }, []);

    return (
        <div className="flex items-center justify-center h-auto px-4">
            <div className="w-full max-w-md">
                <div className="bg-white/80 dark:bg-[#0f2a35]/80 backdrop-blur-xl border border-gray-200/60 dark:border-[#1a3d4d]/60 rounded-2xl shadow-xl dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)] p-8 md:p-10 transition-all duration-300">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-blue-600/10 dark:from-cyan-400/10 dark:to-blue-500/10 mb-4">
                            <ShieldCheck className="w-7 h-7 text-cyan-600 dark:text-cyan-400" />
                        </div>
                        <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-400 dark:to-blue-400 bg-clip-text text-transparent">
                            Verify Your Identity
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                            OTP sent to <span className="font-medium text-cyan-600 dark:text-cyan-400">{maskedEmail}</span>
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            Please check your spam folder if you haven&apos;t received it
                        </p>
                    </div>
                    
                    <Form {...form}>
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* OTP Input */}
                            <FormField
                                name="forgotPasswordOTP"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <Input
                                                className="h-12 rounded-xl bg-gray-50 dark:bg-[#0b1e28] border-gray-200 dark:border-[#1a3d4d] placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-cyan-500 dark:focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 dark:focus:ring-cyan-400/20 transition-all duration-200 text-center text-lg tracking-widest font-mono"
                                                type="number"
                                                {...field}
                                                value={forgotPasswordOTP}
                                                onChange={(e) => setForgotPasswordOTP(e.target.value)}
                                                placeholder="Enter OTP"
                                                required
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
                                disabled={isVerifying}
                                className="w-full h-11 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-medium shadow-lg shadow-cyan-500/20 dark:shadow-cyan-500/10 transition-all duration-200 hover:shadow-xl hover:shadow-cyan-500/30"
                            >
                                {isVerifying ? "Verifying..." : "Verify OTP"}
                            </Button>

                            {/* Resend */}
                            <div className="text-center pt-2">
                                <button
                                    type='button'
                                    onClick={handleResendOTP}
                                    className="text-sm text-gray-500 dark:text-gray-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={isResendDisabled}
                                >
                                    {!isResendDisabled
                                        ? <>Didn&apos;t get code? <span className="font-medium">Resend OTP</span></>
                                        : <span className="tabular-nums">Resend OTP in <span className="font-medium text-cyan-600 dark:text-cyan-400">{resendTimeLeft}s</span></span>}
                                </button>
                            </div>
                        </form>
                    </Form>
                </div>
            </div>
        </div>
    );
};

export default VerifyForgotPassOtp;
