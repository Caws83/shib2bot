/**
 * Admin Panel - Main Dashboard (Exact HTML Match)
 */

import Head from 'next/head';
import Link from 'next/link';

export default function AdminDashboard() {
  return (
    <>
      <Head>
        <title>SHIB2BOT Dashboard</title>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <div className="dashboard-wrapper">
        <div className="page">
          {/* HEADER */}
          <header className="header">
            <div className="logo-wrap">
              <div className="logo">🔥</div>
              <div className="brand">
                <div className="brand-name">SHIB2BOT</div>
                <div className="brand-sub">Video agent console</div>
              </div>
            </div>
            <div className="header-actions">
              <div className="chip green">
                <span className="dot"></span>
                Live on Telegram
              </div>
              <div className="chip orange">
                Early access · Video v1
              </div>
              <div className="chip">
                <span className="dot" style={{ background: 'var(--accent-orange)' }}></span>
                UTC · Auto-sync
              </div>
            </div>
          </header>

          {/* HERO */}
          <section className="hero">
            <div className="hero-title">
              Welcome back <span>👋</span>
            </div>
            <p className="hero-sub">Here's what's happening with your bot today.</p>
          </section>

          {/* CARDS */}
          <section className="grid">
            <article className="card">
              <div className="card-label">Total users</div>
              <div className="card-main">
                <div className="card-value">0</div>
                <div className="pill-trend">+0 today</div>
              </div>
              <p className="card-foot">First users will appear as soon as they start your bot.</p>
            </article>

            <article className="card">
              <div className="card-label">Active members</div>
              <div className="card-main">
                <div className="card-value">0</div>
                <div className="pill-trend">0 in last 24h</div>
              </div>
              <p className="card-foot">Track engaged users who return to generate videos.</p>
            </article>

            <article className="card">
              <div className="card-label">Total jobs</div>
              <div className="card-main">
                <div className="card-value">0</div>
                <div className="pill-trend">Waiting for first run</div>
              </div>
              <p className="card-foot">Every video, image or render counts as a job.</p>
            </article>

            <article className="card">
              <div className="card-label">Total earnings</div>
              <div className="card-main">
                <div className="card-value">$0.00</div>
                <div className="pill-trend negative">No revenue yet</div>
              </div>
              <p className="card-foot">Set up payments to start collecting from premium users.</p>
            </article>
          </section>

          {/* ROW */}
          <section className="row">
            <section className="panel">
              <div className="panel-head">
                <div>
                  <div className="panel-title">Quick actions</div>
                  <div className="panel-sub">Jump into the most common admin tasks.</div>
                </div>
                <span className="badge-soft">Today · 0 events</span>
              </div>
              <div className="actions">
                <Link href="/admin/users" className="action">
                  <span className="icon">👥</span><span>View users</span>
                </Link>
                <Link href="/admin/jobs" className="action">
                  <span className="icon">🎬</span><span>View jobs</span>
                </Link>
                <Link href="/admin/payments" className="action">
                  <span className="icon">💸</span><span>Payments</span>
                </Link>
                <Link href="/admin/chats" className="action">
                  <span className="icon">💬</span><span>Open chats</span>
                </Link>
              </div>
              <p className="panel-note">
                Once users start creating videos you'll see live stats for queue health and error rates here.
              </p>
            </section>

            <section className="panel">
              <div className="panel-head">
                <div>
                  <div className="panel-title">Recent activity</div>
                  <div className="panel-sub">Activity will appear here as your users interact with SHIB2BOT.</div>
                </div>
              </div>
              <p className="feed-empty">
                🕒 No recent activity to display yet. Invite a few users to your bot to see this feed light up.
              </p>
            </section>
          </section>

          {/* FOOTER */}
          <footer className="footer">
            <span>Built for <strong>Shib2</strong> · zk video dashboard</span>
            <span>Tip: wire your video provider & payments in <strong>Settings</strong> to go live.</span>
          </footer>
        </div>
      </div>
    </>
  );
}
