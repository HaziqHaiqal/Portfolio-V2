'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserSupabase } from '@lib/supabase/browser';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const supabase = createBrowserSupabase();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(`Error: ${error.message}`);
      setLoading(false);
    } else {
      router.push('/admin');
      router.refresh();
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900 text-white">
      <div className="w-full max-w-md rounded-2xl bg-gray-800 p-8 shadow-lg">
        <h1 className="mb-6 text-center text-3xl font-bold">Admin Login</h1>
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-400"
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-2 w-full rounded-lg border border-gray-600 bg-gray-700 px-4 py-3 focus:border-blue-500 focus:ring-blue-500"
              placeholder="your-email@example.com"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-400"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-2 w-full rounded-lg border border-gray-600 bg-gray-700 px-4 py-3 focus:border-blue-500 focus:ring-blue-500"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-800"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        {message && (
          <p className="mt-6 text-center text-sm text-gray-400">{message}</p>
        )}
      </div>
    </div>
  );
}
