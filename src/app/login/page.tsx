'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn } from 'lucide-react';
import toast from 'react-hot-toast';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import BokehAnimation from '@/components/ui/BokehAnimation';
import { authAPI } from '@/API/auth';
import { useAuthStore } from '@/context/authStore';

type ServerErrorData = { message?: string; error?: string; code?: string };

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
  totpCode: z
    .string()
    .optional()
    .refine((val) => !val || /^\d{6}$/.test(val), {
      message: 'Two-factor code must be 6 digits',
    }),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [showTotp, setShowTotp] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const { email, password, rememberMe } = data;

      // If we're not showing TOTP yet, first attempt login WITHOUT totpCode.
      if (!showTotp) {
        try {
          const auth = await authAPI.login({ email, password });
          setAuth(auth.user, auth.token);
          if (!rememberMe) {
            // Optional: use session storage in future
          }
          toast.success('Login successful!');
          router.push('/dashboard');
          return; // done
        } catch (err: unknown) {
          // Inspect if server indicates TOTP is required; if so, reveal TOTP field
          let handledAsTotpRequired = false;
          if (typeof err === 'object' && err && 'response' in err) {
            type AxiosLikeError = { response?: { status?: number; data?: unknown } };
            const axiosErr = err as AxiosLikeError;
            const status = axiosErr.response?.status;
            const rawData = axiosErr.response?.data as ServerErrorData | string | undefined;
            const serverErrorCode: string | undefined =
              typeof rawData === 'object' && rawData ? (rawData.error ?? rawData.code) : undefined;
            if (status === 401 && serverErrorCode === 'TOTP_REQUIRED') {
              handledAsTotpRequired = true;
              setShowTotp(true);
              toast('Two-factor authentication is enabled for this account. Enter your 6-digit code.');
            }
          }
          if (!handledAsTotpRequired) {
            // Not a TOTP-required case; rethrow to generic error handler below
            throw err;
          }
        } finally {
          setIsLoading(false);
        }
        return; // Wait for user to input TOTP and resubmit
      }

      // If we are showing TOTP, validate and attempt login WITH totpCode
      if (showTotp) {
        if (!data.totpCode || !/^\d{6}$/.test(data.totpCode)) {
          toast.error('Please enter a valid 6-digit code');
          return;
        }
        const auth = await authAPI.login({ email, password, totpCode: data.totpCode });
        setAuth(auth.user, auth.token);
        if (!rememberMe) {
          // Optional: use session storage in future
        }
        toast.success('Login successful!');
        router.push('/dashboard');
        return;
      }
    } catch (err: unknown) {
      let message = 'Login failed. Please check your credentials.';
      if (typeof err === 'object' && err && 'response' in err) {
        type AxiosLikeError = { response?: { status?: number; data?: unknown } };
        const axiosErr = err as AxiosLikeError;
        const status = axiosErr.response?.status;
        const rawData = axiosErr.response?.data as ServerErrorData | string | undefined;
        const serverMsg: string | undefined =
          typeof rawData === 'string'
            ? rawData
            : (rawData && typeof rawData === 'object' && typeof rawData.message === 'string')
              ? rawData.message
              : undefined;
        const serverErrorCode: string | undefined =
          typeof rawData === 'object' && rawData ? (rawData.error ?? rawData.code) : undefined;
        if (status === 401) {
          if (serverErrorCode === 'TOTP_INVALID') {
            message = 'Invalid two-factor code. Please try again.';
          } else if (serverErrorCode === 'TOTP_REQUIRED') {
            // Show TOTP input if not already visible
            if (!showTotp) setShowTotp(true);
            message = 'Two-factor code required. Please enter the 6-digit code.';
          } else {
            message = 'Invalid email or password.';
          }
        } else if (serverMsg) message = serverMsg;
      } else if (err instanceof Error) {
        if (err.message === 'Malformed login response') {
          message = 'Unexpected server response. Please try again later.';
        }
      }
      toast.error(message);
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Bokeh Animation Background */}
      <BokehAnimation />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
            className="inline-block mb-4"
          >
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-2xl shadow-lg flex items-center justify-center transform hover:scale-105 transition-transform duration-300">
              <span className="text-3xl font-bold text-black">TV</span>
            </div>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl font-display font-bold text-black mb-2"
          >
            Tutor<span className="text-yellow-500">Verse</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-gray-600 font-medium"
          >
            Admin Panel - Sign in to continue
          </motion.p>
        </div>

        {/* Login Form */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100 backdrop-blur-sm"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Input
              label="Email Address"
              type="email"
              placeholder="admin@tutorverse.com"
              leftIcon={<Mail size={20} />}
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
              leftIcon={<Lock size={20} />}
              error={errors.password?.message}
              {...register('password')}
            />

            {(showTotp) && (
              <Input
                label="Two-factor code"
                type="text"
                placeholder="6-digit code"
                leftIcon={<Lock size={20} />}
                error={errors.totpCode?.message}
                {...register('totpCode')}
              />
            )}

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-gray-300 text-yellow-500 focus:ring-yellow-400 focus:ring-2 transition-all"
                  {...register('rememberMe')}
                />
                <span className="text-sm text-gray-700 group-hover:text-black transition-colors font-medium">Remember me</span>
              </label>

              <a
                href="#"
                className="text-sm text-yellow-600 hover:text-yellow-700 transition-colors font-semibold hover:underline"
              >
                Forgot password?
              </a>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
              isLoading={isLoading}
              rightIcon={<LogIn size={20} />}
            >
              {showTotp ? 'Verify & Sign In' : 'Continue'}
            </Button>
          </form>

          {/* Demo Credentials */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-6 p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-xl border-2 border-yellow-200 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
              <p className="text-sm font-bold text-black">Demo Credentials:</p>
            </div>
            <p className="text-xs text-gray-700 font-medium">Email: <span className="text-black">admin@tutorverse.com</span></p>
            <p className="text-xs text-gray-700 font-medium">Password: <span className="text-black">admin123</span></p>
          </motion.div>
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-center text-sm text-gray-600 mt-8 font-medium"
        >
          © 2025 TutorVerse. All rights reserved.
        </motion.p>
      </motion.div>
    </div>
  );
}
