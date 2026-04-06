"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from "@/store/store";
import { logout, setCurrentUserData, setAccessToken, setRefreshToken } from "@/features/userSlice";
import { CurrentUserData } from "@/types";
import { GoogleLogin } from '@react-oauth/google';
import { Mail } from 'lucide-react';

// Zod schema for email validation
const registrationSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email format"),
});

const RegisterEmailForm: React.FC = () => {
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>()
  const currentUserData = useSelector((state: RootState) => state.user.currentUserData);
  const accessToken = useSelector((state: RootState) => state.user.accessToken);
  const isLoggedIn = useMemo(() => !!currentUserData, [currentUserData]);
  const [isRegistering, setIsRegistering] = useState(false)

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
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: { email: string }) => {
    setSuccess('');
    setError('');
    setIsRegistering(true)

    try {
      const response = await api.post('/api/v1/users/register-email', { email: data.email });
      setSuccess(response.data.message);
      const token = response.data.data.token;
      localStorage.setItem('emailToken', token);
      localStorage.setItem('email', data.email);
      form.reset();
      router.push('/user/auth/verify-email');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to register email. Please try again.');
      setSuccess('');
    } finally {
      setIsRegistering(false)
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setSuccess('');
    setError('');
    setIsRegistering(true);
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
      setIsRegistering(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-auto px-4">
      <div className="w-full max-w-md">
        <div className="bg-white/80 dark:bg-[#0f2a35]/80 backdrop-blur-xl border border-gray-200/60 dark:border-[#1a3d4d]/60 rounded-2xl shadow-xl dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)] p-8 md:p-10 transition-all duration-300">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-blue-600/10 dark:from-cyan-400/10 dark:to-blue-500/10 mb-4">
              <Mail className="w-7 h-7 text-cyan-600 dark:text-cyan-400" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-400 dark:to-blue-400 bg-clip-text text-transparent">
              Join Fuzion
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5">
              Enter your email to get started
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              {/* Email Field */}
              <FormField
                name="email"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Email Address
                    </FormLabel>
                    <FormControl>
                      <Input
                        className="h-11 rounded-xl bg-gray-50 dark:bg-[#0b1e28] border-gray-200 dark:border-[#1a3d4d] placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-cyan-500 dark:focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 dark:focus:ring-cyan-400/20 transition-all duration-200"
                        type="email"
                        placeholder="Enter your email"
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
                disabled={isRegistering}
                className="w-full h-11 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-medium shadow-lg shadow-cyan-500/20 dark:shadow-cyan-500/10 transition-all duration-200 hover:shadow-xl hover:shadow-cyan-500/30"
              >
                {isRegistering ? "Registering..." : "Continue with Email"}
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
              <div className="flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => setError('Google Login Failed')}
                />
              </div>

              {/* Bottom Links */}
              <div className="pt-4 space-y-2 border-t border-gray-100 dark:border-[#1a3d4d]/50">
                <button
                  onClick={() => router.push('/user/auth/login')}
                  type='button'
                  className="w-full text-center text-sm text-gray-500 dark:text-gray-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors duration-200"
                >
                  Already have an account? <span className="font-medium">Sign in</span>
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

export default RegisterEmailForm;
