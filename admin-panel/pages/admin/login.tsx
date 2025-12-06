/**
 * Admin Panel - Login Page
 */

import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function AdminLogin() {
  const [telegramId, setTelegramId] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // In production, implement proper admin login
    // For now, this is a placeholder
    try {
      // TODO: Implement admin login logic
      alert('Admin login not yet implemented. Use Telegram Mini App for now.');
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Admin Login - SHIB2BOT</title>
      </Head>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="bg-slate-800/90 backdrop-blur-sm p-10 rounded-2xl shadow-2xl w-full max-w-md border border-purple-500/30">
          <div className="text-center mb-8">
            <div className="inline-block bg-gradient-to-r from-purple-600 to-blue-600 p-4 rounded-full mb-4">
              <span className="text-4xl">🐕</span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">SHIB2BOT</h1>
            <p className="text-purple-200">Admin Login</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-purple-200 mb-2">
                Telegram ID
              </label>
              <input
                type="text"
                value={telegramId}
                onChange={(e) => setTelegramId(e.target.value)}
                className="w-full px-4 py-3 bg-slate-700/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="Enter your Telegram ID"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white py-3 px-4 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></span>
                  Logging in...
                </span>
              ) : (
                'Login'
              )}
            </button>
          </form>
          <p className="mt-6 text-sm text-purple-300 text-center">
            💡 Use Telegram Mini App for admin access
          </p>
        </div>
      </div>
    </>
  );
}

