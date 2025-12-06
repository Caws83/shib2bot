/**
 * Admin Panel - Payments Management
 */

import Layout from '../../components/Layout';

export default function AdminPayments() {
  return (
    <Layout title="Payments">
      {/* Page Header */}
      <header className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-white">Payments Management</h1>
          <p className="text-sm text-slate-400">Track and manage crypto payment invoices</p>
        </div>
        <button className="rounded-full px-4 py-2 bg-gradient-to-br from-orange-500/35 to-slate-950 border border-orange-500 text-sm text-orange-200 hover:from-orange-500/45 transition-all duration-150 hover:-translate-y-px">
          View Reports
        </button>
      </header>

      {/* Main Content Card */}
      <section className="bg-gradient-to-br from-slate-900/90 to-slate-950 rounded-[18px] border border-slate-700/35 p-4 shadow-[0_18px_45px_rgba(15,23,42,0.8)]">
        <div className="flex items-center gap-2.5 mb-4">
          <span className="text-xl">💸</span>
          <h2 className="text-sm font-semibold text-white">Payment Invoices</h2>
        </div>
        <div className="bg-gradient-to-br from-orange-500/8 to-slate-950 rounded-lg p-6 border border-slate-700/30">
          <p className="text-slate-300 mb-2">Payments management interface coming soon.</p>
          <p className="text-xs text-slate-500">
            This will show all payment invoices and allow manual confirmation.
          </p>
        </div>
      </section>
    </Layout>
  );
}

