/**
 * Admin Panel Layout Component - Orange/Green Theme
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Head from 'next/head';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
}

export default function Layout({ children, title = 'Admin Panel' }: LayoutProps) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/admin/users', label: 'Users', icon: '👥' },
    { href: '/admin/jobs', label: 'Jobs', icon: '🎬' },
    { href: '/admin/payments', label: 'Payments', icon: '💸' },
    { href: '/admin/chats', label: 'Chats', icon: '💬' },
  ];

  const systemItems = [
    { href: '/admin/settings', label: 'Settings', icon: '⚙️' },
    { href: '/admin/sandbox', label: 'Sandbox', icon: '🧪' },
  ];

  const isActive = (path: string) => router.pathname === path;

  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [sidebarOpen]);

  return (
    <>
      <Head>
        <title>{title} - SHIB2BOT</title>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </Head>
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-black font-['Inter',sans-serif]">
        {/* Sidebar Backdrop */}
        <div
          className={`fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-30 transition-opacity duration-200 lg:hidden ${
            sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
          onClick={() => setSidebarOpen(false)}
        />

        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-64 bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 border-r border-slate-700/30 p-4 flex flex-col transition-transform duration-200 lg:translate-x-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Brand */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 shadow-lg shadow-orange-500/60 flex items-center justify-center text-lg">
              🔥
            </div>
            <div className="flex flex-col">
              <div className="text-lg font-bold text-white uppercase tracking-wider">SHIB2BOT</div>
              <div className="text-[11px] text-slate-500 uppercase tracking-widest">Video Agent Console</div>
            </div>
          </div>

          {/* Main Navigation */}
          <div className="text-[11px] text-slate-500 uppercase tracking-widest mb-2 mt-2">Main</div>
          <nav className="flex flex-col gap-1 mb-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-sm transition-all duration-150 ${
                  isActive(item.href)
                    ? 'bg-gradient-to-br from-orange-600 via-orange-600 to-slate-900 text-yellow-50 border border-white/10 shadow-lg -translate-y-px'
                    : 'text-slate-400 hover:bg-slate-900/90 hover:text-slate-200 hover:border-slate-700/50 border border-transparent'
                }`}
              >
                <span className="w-5 h-5 rounded-lg bg-slate-950/90 border border-slate-700/50 flex items-center justify-center text-xs">
                  {item.icon}
                </span>
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* System Navigation */}
          <div className="text-[11px] text-slate-500 uppercase tracking-widest mb-2">System</div>
          <nav className="flex flex-col gap-1 mb-auto">
            {systemItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-sm transition-all duration-150 ${
                  isActive(item.href)
                    ? 'bg-gradient-to-br from-orange-600 via-orange-600 to-slate-900 text-yellow-50 border border-white/10 shadow-lg -translate-y-px'
                    : 'text-slate-400 hover:bg-slate-900/90 hover:text-slate-200 hover:border-slate-700/50 border border-transparent'
                }`}
              >
                <span className="w-5 h-5 rounded-lg bg-slate-950/90 border border-slate-700/50 flex items-center justify-center text-xs">
                  {item.icon}
                </span>
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* Footer */}
          <div className="pt-3 border-t border-slate-900/90">
            <div className="text-[11px] text-slate-500 mb-2">Version 1.0.0</div>
            <div className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 bg-green-500/18 text-green-200 text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_0_4px_rgba(34,197,94,0.25)]"></span>
              <span>System Online</span>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="lg:pl-64">
          {/* Top Bar (Mobile) */}
          <header className="lg:hidden flex items-center justify-between p-4 border-b border-slate-800/50">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">SHIB2BOT Admin</div>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="w-8 h-8 rounded-full border border-slate-700/50 bg-slate-900/90 text-slate-200 flex items-center justify-center"
            >
              ☰
            </button>
          </header>

          {/* Page Content - Centered */}
          <main className="p-4 lg:p-6 max-w-7xl mx-auto">
            {children}
          </main>
        </div>
      </div>
    </>
  );
}
