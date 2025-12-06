/**
 * Admin Panel - Home (redirects to dashboard)
 */

import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push('/admin/dashboard');
  }, [router]);

  return (
    <>
      <Head>
        <title>SHIB2BOT Admin</title>
      </Head>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <div className="inline-block bg-gradient-to-r from-purple-600 to-blue-600 p-6 rounded-full mb-4 animate-pulse">
            <span className="text-5xl">🐕</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">SHIB2BOT</h1>
          <p className="text-purple-200">Loading admin panel...</p>
        </div>
      </div>
    </>
  );
}

