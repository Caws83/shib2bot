/**
 * Telegram Mini App - User Dashboard
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

interface Job {
  id: string;
  prompt: string;
  status: string;
  videoUrl: string | null;
  errorMessage: string | null;
  createdAt: string;
}

export default function MiniUserDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Get Telegram WebApp init data
    const initData = (window as any).Telegram?.WebApp?.initData || '';
    
    if (!initData) {
      console.error('No Telegram WebApp init data found');
      setLoading(false);
      return;
    }

    // Authenticate with backend
    fetch('/auth/telegram-webapp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ initData }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.token) {
          setToken(data.token);
          setUser(data.user);
          loadUserData(data.token);
        } else {
          console.error('Authentication failed:', data);
          setLoading(false);
        }
      })
      .catch((error) => {
        console.error('Auth error:', error);
        setLoading(false);
      });
  }, []);

  const loadUserData = async (authToken: string) => {
    try {
      const [userRes, jobsRes] = await Promise.all([
        fetch('/mini-api/me', {
          headers: { Authorization: `Bearer ${authToken}` },
        }),
        fetch('/mini-api/me/jobs?limit=10', {
          headers: { Authorization: `Bearer ${authToken}` },
        }),
      ]);

      const userData = await userRes.json();
      const jobsData = await jobsRes.json();

      if (userData.user) setUser(userData.user);
      if (jobsData.jobs) setJobs(jobsData.jobs);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createInvoice = async () => {
    if (!token) return;

    try {
      const res = await fetch('/mini-api/payments/create-invoice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ packageId: 'starter' }),
      });

      const data = await res.json();
      if (data.paymentUrl) {
        window.open(data.paymentUrl, '_blank');
      }
    } catch (error) {
      console.error('Error creating invoice:', error);
    }
  };

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

  return (
    <>
      <Head>
        <title>SHIB2BOT Dashboard</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">🐕 SHIB2BOT Dashboard</h1>

          {user && (
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Your Account</h2>
              <div className="space-y-2">
                <p><strong>Username:</strong> {user.telegramUsername || 'N/A'}</p>
                <p><strong>Credits:</strong> <span className="text-green-600 font-bold">{user.creditBalance}</span></p>
                <button
                  onClick={createInvoice}
                  className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  💳 Buy Credits (Crypto)
                </button>
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Jobs</h2>
            {jobs.length === 0 ? (
              <p className="text-gray-500">No jobs yet. Use /video command in Telegram to generate videos!</p>
            ) : (
              <div className="space-y-4">
                {jobs.map((job) => (
                  <div key={job.id} className="border-b pb-4 last:border-0">
                    <p className="font-medium">{job.prompt}</p>
                    <p className="text-sm text-gray-500">
                      Status: <span className={job.status === 'COMPLETED' ? 'text-green-600' : 'text-yellow-600'}>
                        {job.status}
                      </span>
                    </p>
                    {job.videoUrl && (
                      <a href={job.videoUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 text-sm">
                        View Video
                      </a>
                    )}
                    {job.errorMessage && (
                      <p className="text-red-500 text-sm">{job.errorMessage}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

