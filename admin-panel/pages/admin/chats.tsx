/**
 * Admin Panel - Chats Management
 */

import Layout from '../../components/Layout';

export default function AdminChats() {
  return (
    <Layout title="Chats">
      {/* Page Header */}
      <header className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-white">Chats Management</h1>
          <p className="text-sm text-slate-400">Manage Telegram chats, bans, and daily limits</p>
        </div>
        <button className="rounded-full px-4 py-2 bg-gradient-to-br from-green-500/35 to-slate-950 border border-green-500 text-sm text-green-200 hover:from-green-500/45 transition-all duration-150 hover:-translate-y-px">
          Refresh
        </button>
      </header>

      {/* Main Content Card */}
      <section className="bg-gradient-to-br from-slate-900/90 to-slate-950 rounded-[18px] border border-slate-700/35 p-4 shadow-[0_18px_45px_rgba(15,23,42,0.8)]">
        <div className="flex items-center gap-2.5 mb-4">
          <span className="text-xl">💬</span>
          <h2 className="text-sm font-semibold text-white">Telegram Chats</h2>
        </div>
        <div className="bg-gradient-to-br from-orange-500/8 to-slate-950 rounded-lg p-6 border border-slate-700/30">
          <p className="text-slate-300 mb-2">Chats management interface coming soon.</p>
          <p className="text-xs text-slate-500">
            This will show all Telegram chats, allow banning/unbanning, and setting daily limits.
          </p>
        </div>
      </section>
    </Layout>
  );
}

