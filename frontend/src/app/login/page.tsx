'use client';

import type { AxiosError } from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { api } from '@/lib/api';
import { loginSchema, type LoginFormData } from '@/lib/validation/auth';
import { useAuthStore } from '@/store/authStore';
import { AuthResponse } from '@/types/auth';

interface LoginErrorResponse {
  message?: string;
}

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);

  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setServerError(null);
    setIsSubmitting(true);

    try {
      const response = await api.post<AuthResponse>('/api/Auth/login', data);

      const { token, ...user } = response.data;

      login(user, token);

      router.replace(`/${user.role.toLowerCase()}`);
    } catch (error) {
      const axiosError = error as AxiosError<LoginErrorResponse>;

      setServerError(
        axiosError.response?.data?.message ??
          'Unable to sign in. Please check your credentials.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-(--background) px-4 py-8">
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <section className="w-full max-w-100">
          <div className="mb-6 text-center">
            <div
              className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg border 
            border-(--border) bg-(--surface) text-sm font-semibold text-(--text-primary)"
            >
              L
            </div>

            <div className=" text-sm font-medium tracking-tight text-(--text-primary)">
              Learnova
            </div>
          </div>

          {/* Auth card */}
          <div className="rounded-[10px] border border-(--border) bg-(--surface) p-6">
            <div className="mb-6">
              <h1 className="text-[24px]  font-semibold tracking-[-0.02em]">
                Sign in
              </h1>

              <p className="mt-1.5 text-sm leading-5 text-(--text-secondary)">
                Access your assignments and submissions.
              </p>
            </div>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-4"
              noValidate
            >
              <div>
                <label
                  htmlFor="email"
                  className="mb-1.5 block text-[13px] font-medium text-(--text-primary)"
                >
                  Email
                </label>

                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  {...register('email')}
                  className={`h-10 w-full rounded-md border bg-(--surface) px-3 text-sm text-(--text-primary) outline-none transition-colors duration-150 placeholder:text-[var(--text-placeholder)] ${
                    errors.email
                      ? 'border-(--danger) focus:border-(--danger) focus:ring-2 focus:ring-red-100'
                      : 'border-(--border) focus:border-(--accent) focus:ring-2 focus:ring-indigo-100'
                  }`}
                />

                {errors.email && (
                  <p className="mt-1.5 text-xs text-(--danger)">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-1.5 block text-[13px] font-medium text-(--text-primary)"
                >
                  Password
                </label>

                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  {...register('password')}
                  className={`h-10 w-full rounded-md border bg-(--surface) px-3 text-sm text-(--text-primary)
                outline-none transition-colors duration-150 placeholder:text-(--text-placeholder) ${
                  errors.password
                    ? 'border-(--danger) focus:border-(--danger) focus:ring-2 focus:ring-red-100'
                    : 'border-(--border) focus:border-(--accent) focus:ring-2 focus:ring-indigo-100'
                }`}
                />

                {errors.password && (
                  <p className="mt-1.5 text-xs text-(--danger)">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {serverError && (
                <div
                  role="alert"
                  className="rounded-md border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-(--danger)"
                >
                  {serverError}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-2 h-10 w-full cursor-pointer rounded-md bg-(--accent) px-4 text-sm font-medium text-white transition-colors duration-150 
                hover:bg-(--accent-hover) focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? 'Signing in...' : 'Sign in'}
              </button>
            </form>

            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-(--border)" />
              <span className="text-xs text-(--text-placeholder)">or</span>
              <div className="h-px flex-1 bg-(--border)" />
            </div>

            <p className="text-center text-sm text-(--text-secondary)">
              Don&apos;t have an account?{' '}
              <Link
                href="/register"
                className="font-medium text-(--accent) transition-colors duration-150 hover:text-(--accent-hover)"
              >
                Register
              </Link>
            </p>
          </div>

          <p className="mt-5 text-center text-xs text-(--text-placeholder)">
            Assignment &amp; Submission Management System
          </p>
        </section>
      </div>
    </main>
  );
}
