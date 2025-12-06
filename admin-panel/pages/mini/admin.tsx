/**
 * Telegram Mini App - Admin Dashboard
 */

import { useEffect, useState } from 'react';
import Head from 'next/head';

interface User {
  id: string;
  telegramId: string;
  telegramUsername: string | null;
  role: string;
  creditBalance: number;
}

export default function MiniAdminDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const initData = (window as any).Telegram?.WebApp?.initData || '';
    
    if (!initData) {
      setLoading(false);
      return;
    }

    fetch('/auth/telegram-webapp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ initData }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.token && data.user) {
          if (data.user.role !== 'ADMIN') {
            alert('Admin access required');
            return;
          }
          setToken(data.token);
          setUser(data.user);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error('Auth error:', error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-red-600">Admin access required</p>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>SHIB2BOT Admin</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">🔧 Admin Panel</h1>

          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <a
                href="/admin/dashboard"
                target="_blank"
                className="block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-center"
              >
                Open Full Admin Panel
              </a>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Admin Info</h2>
            <p><strong>Username:</strong> {user.telegramUsername || 'N/A'}</p>
            <p><strong>Role:</strong> {user.role}</p>
            <p><strong>Credits:</strong> {user.creditBalance}</p>
          </div>
        </div>
      </div>
    </>
  );
}

