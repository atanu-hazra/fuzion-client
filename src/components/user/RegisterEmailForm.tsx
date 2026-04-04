"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from "@/store/store";
import { logout, setCurrentUserData, setAccessToken, setRefreshToken } from "@/features/userSlice";
import { CurrentUserData } from "@/types";
import { GoogleLogin } from '@react-oauth/google';

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
    <div className="flex flex-col items-center justify-center">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="p-6 rounded md:shadow-md w-[100%] md:w-[50%] lg:w-[45%]"
        >
          <h2 className="text-2xl font-bold text-center mb-4 text-blue-500">Register Your Email</h2>

          {/* Email Field */}
          <FormField
            name="email"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                {/* <FormLabel>Email:</FormLabel> */}
                <FormControl>
                  <Input
                    className='placeholder:text-slate-400'
                    type="email"
                    placeholder="Enter your email"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-red-500" />
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
            {isRegistering ? "Registering..." : "Register"}
          </Button>

          <div className="flex justify-center my-4">
              <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => setError('Google Login Failed')}
              />
          </div>

          <Button
            onClick={() => router.push('/user/auth/login')}
            type='button'
            className="w-full text-center text-sm text-blue-500 hover:underline hover:text-blue-600"
          >
            Already have an account? Sign in.
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

export default RegisterEmailForm;
