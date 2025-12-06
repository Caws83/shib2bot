/**
 * Admin Panel - Jobs Management
 */

import Layout from '../../components/Layout';

export default function AdminJobs() {
  return (
    <Layout title="Jobs">
      {/* Page Header */}
      <header className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-white">Jobs Management</h1>
          <p className="text-sm text-slate-400">Monitor video generation jobs and their status</p>
        </div>
        <div className="flex gap-2">
          <button className="rounded-full px-3 py-1.5 bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-700/45 text-xs text-slate-300 hover:border-slate-600 transition-all">
            Filter
          </button>
          <button className="rounded-full px-3 py-1.5 bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-700/45 text-xs text-slate-300 hover:border-slate-600 transition-all">
            Export
          </button>
        </div>
      </header>

      {/* Main Content Card */}
      <section className="bg-gradient-to-br from-slate-900/90 to-slate-950 rounded-[18px] border border-slate-700/35 p-4 shadow-[0_18px_45px_rgba(15,23,42,0.8)]">
        <div className="flex items-center gap-2.5 mb-4">
          <span className="text-xl">🎬</span>
          <h2 className="text-sm font-semibold text-white">Video Generation Jobs</h2>
        </div>
        <div className="bg-gradient-to-br from-orange-500/8 to-slate-950 rounded-lg p-6 border border-slate-700/30">
          <p className="text-slate-300 mb-2">Jobs management interface coming soon.</p>
          <p className="text-xs text-slate-500">
            This will show all video generation jobs, their status, and allow monitoring.
          </p>
        </div>
      </section>
    </Layout>
  );
}

