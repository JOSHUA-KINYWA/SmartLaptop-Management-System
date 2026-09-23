import React, { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authcontext';
import { Chart, ArcElement, Tooltip as ChartTooltip } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import Notifications from '../components/Notifications';

Chart.register(ArcElement, ChartTooltip);

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444'];

const styles = {
  layout: {
    display: 'flex',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f8fbff 0%, #eef4ff 100%)',
    fontFamily: 'Inter, Segoe UI, sans-serif',
    color: '#0f172a',
  },
  sidebar: {
    width: '260px',
    background: 'linear-gradient(180deg, #0f172a 0%, #111827 100%)',
    padding: '1.8rem 1.2rem',
    color: '#fff',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '18px 0 45px rgba(15, 23, 42, 0.12)',
    position: 'relative',
    zIndex: 2,
  },
  branding: { fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.06em', margin: '0.3rem 0 1rem' },
  userInfo: { padding: '0.9rem 0.95rem', borderRadius: '14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', marginTop: '0.5rem' },
  userInfoText: { margin: '0.35rem 0', fontSize: '0.9rem', color: '#dfe8ff', wordBreak: 'break-word' },
  nav: { marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '0.7rem' },
  navLink: {
    padding: '0.8rem 0.9rem',
    borderRadius: '12px',
    background: 'rgba(148, 163, 184, 0.08)',
    color: '#f8fbff',
    textAlign: 'left',
    fontWeight: 600,
    textDecoration: 'none',
    border: '1px solid rgba(148, 163, 184, 0.16)',
    transition: 'all 0.2s ease',
  },
  contentArea: { flex: 1, padding: '2rem', overflowY: 'auto' },
  topBar: {
    background: 'rgba(255,255,255,0.9)',
    border: '1px solid rgba(148,163,184,0.18)',
    borderRadius: '20px',
    padding: '1.25rem 1.5rem',
    boxShadow: '0 18px 36px rgba(15, 23, 42, 0.06)',
    marginBottom: '1.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '1rem',
    flexWrap: 'wrap',
  },
  headerTitle: { fontSize: '2rem', fontWeight: 800, margin: 0, color: '#0f172a', letterSpacing: '-0.04em' },
  subHeader: { fontSize: '0.95rem', color: '#475569', margin: '0.35rem 0 0' },
  logoutBtn: {
    padding: '0.7rem 1.1rem',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
    border: 'none',
    color: '#fff',
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 12px 24px rgba(37, 99, 235, 0.2)',
  },
  adminGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' },
  card: {
    background: 'rgba(255,255,255,0.96)',
    borderRadius: '20px',
    boxShadow: '0 18px 36px rgba(15, 23, 42, 0.06)',
    border: '1px solid rgba(148, 163, 184, 0.18)',
    padding: '1.4rem',
    minHeight: '260px',
  },
  cardTitle: { fontSize: '1.15rem', fontWeight: 700, marginBottom: '1rem', color: '#0f172a' },
  statsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', width: '100%' },
  statBox: { borderRadius: '16px', padding: '1rem', textAlign: 'center', minHeight: '110px', display: 'flex', flexDirection: 'column', justifyContent: 'center' },
  statLabel: { fontSize: '0.86rem', fontWeight: 700, margin: 0, color: '#334155' },
  statValue: { fontSize: '1.6rem', fontWeight: 800, margin: '0.45rem 0 0', color: '#0f172a' },
  userGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' },
  userCard: { borderRadius: '20px', padding: '1.5rem', boxShadow: '0 18px 36px rgba(15, 23, 42, 0.08)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '220px' },
  userCardTitle: { margin: '0 0 0.7rem', fontSize: '1.15rem', fontWeight: 700 },
  userCardLink: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: '1rem',
    padding: '0.7rem 1rem',
    borderRadius: '12px',
    color: '#fff',
    fontWeight: 700,
    textDecoration: 'none',
    background: 'rgba(255,255,255,0.18)',
    border: '1px solid rgba(255,255,255,0.2)',
  },
};

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isUser = user?.role === 'student' || user?.role === 'user';
  const [stats, setStats] = useState(null);
  const [paymentProgress, setPaymentProgress] = useState(0);
  const [clearanceStatus, setClearanceStatus] = useState('Pending');
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:5000/api/dashboard/summary')
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setClearanceStatus(data.clearanceStatus || 'In Progress');

        const paymentMade = data.paymentMade || 0;
        const totalPrice = data.totalPrice || 0;
        const deposit = totalPrice * 0.4;
        const progress = totalPrice > 0 ? ((deposit + paymentMade) / totalPrice) * 100 : 0;

        setPaymentProgress(progress);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showNotifications && !event.target.closest('.notifications-container')) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications]);

  if (!user) return <Navigate to="/" />;

  const doughnutData = {
    labels: ['Daily', 'Weekly', 'Monthly', 'Rented'],
    datasets: [{
      data: stats ? [stats.subscriptions.daily, stats.subscriptions.weekly, stats.subscriptions.monthly, stats.subscriptions.rented] : [],
      backgroundColor: COLORS,
      hoverOffset: 6,
    }],
  };

  const laptopStatsData = {
    labels: ['Total Laptops', 'Available', 'Rented'],
    datasets: [{
      label: 'Laptop Stats',
      data: stats ? [stats.totalLaptops, stats.availableLaptops, stats.rentedLaptops] : [],
      backgroundColor: ['#2563eb', '#10b981', '#ef4444'],
      hoverOffset: 6,
    }],
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div style={styles.layout}>
      <aside style={styles.sidebar}>
        <h1 style={styles.branding}>💻 SLFS</h1>

        <div style={styles.userInfo}>
          <p style={styles.userInfoText}><strong>👤</strong> {user.email}</p>
          <p style={styles.userInfoText}><strong>🛡</strong> {user.role}</p>
        </div>

        <nav style={styles.nav}>
          {isAdmin && (
            <>
              <Link to="/add-laptop" style={styles.navLink}>➕ Add Laptop</Link>
              <Link to="/manage-payment" style={styles.navLink}>💳 Manage Payment</Link>
              <Link to="/Manage-Inventory" style={styles.navLink}>📦 Manage Inventory</Link>
              <Link to="/admin/available-laptops" style={styles.navLink}>🖥️ Manage Laptop</Link>
              <Link to="/analytics" style={styles.navLink}>📊 Analytics</Link>
            </>
          )}

          {isUser && (
            <>
              <Link to="/user-stats" style={styles.navLink}>📈 User Stats</Link>
              <Link to="/available-laptops" style={styles.navLink}>💻 Available Laptops</Link>
              <div
                className="notifications-container"
                onClick={() => setShowNotifications(!showNotifications)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.8rem 0.9rem',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  cursor: 'pointer',
                  marginTop: '0.1rem',
                }}
              >
                <span style={{ color: '#fff', fontWeight: 700 }}>🔔 Notifications</span>
                <Notifications isOpen={showNotifications} onToggle={() => {}} />
              </div>
            </>
          )}
        </nav>
      </aside>

      <main style={styles.contentArea}>
        <header style={styles.topBar}>
          <div>
            <h1 style={styles.headerTitle}>Dashboard Overview</h1>
            <p style={styles.subHeader}>Welcome back, {user.email}</p>
          </div>
          <button onClick={handleLogout} style={styles.logoutBtn}>Log out</button>
        </header>

        {isAdmin ? (
          <section style={styles.adminGrid}>
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>Subscription Stats</h2>
              <Doughnut data={doughnutData} />
            </div>

            <div style={styles.card}>
              <h2 style={styles.cardTitle}>Laptop Stats</h2>
              <Doughnut data={laptopStatsData} />
            </div>

            <div style={styles.card}>
              <h2 style={styles.cardTitle}>Summary</h2>
              <div style={styles.statsGrid}>
                <div style={{ ...styles.statBox, background: '#e0f2fe' }}>
                  <p style={styles.statLabel}>💻 Laptops</p>
                  <p style={styles.statValue}>{stats?.totalLaptops ?? '--'}</p>
                </div>
                <div style={{ ...styles.statBox, background: '#dcfce7' }}>
                  <p style={styles.statLabel}>Applications</p>
                  <p style={styles.statValue}>{stats?.applications ?? '--'}</p>
                </div>
              </div>
            </div>
          </section>
        ) : (
          <section style={styles.userGrid}>
            <div style={{ ...styles.userCard, background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', color: '#fff' }}>
              <div>
                <h2 style={styles.userCardTitle}>📱 Available Laptops</h2>
                <p style={{ margin: 0, opacity: 0.9 }}>Browse the latest devices and apply in minutes.</p>
              </div>
              <Link to="/available-laptops" style={styles.userCardLink}>Browse →</Link>
            </div>

            <div style={{ ...styles.userCard, background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#fff' }}>
              <div>
                <h2 style={styles.userCardTitle}>📝 Apply for a Laptop</h2>
                <p style={{ margin: 0, opacity: 0.9 }}>Submit your application and track progress in real time.</p>
              </div>
              <Link to="/available-laptops" style={styles.userCardLink}>Apply →</Link>
            </div>

            <div style={{ ...styles.userCard, background: 'linear-gradient(135deg, #334155 0%, #1f2937 100%)', color: '#fff' }}>
              <div>
                <h2 style={styles.userCardTitle}>✅ Apply for Clearance</h2>
                <p style={{ margin: 0, opacity: 0.9 }}>Complete your clearance process without delays.</p>
              </div>
              <Link to="/clearance" style={styles.userCardLink}>Apply →</Link>
            </div>

            <div style={{ ...styles.userCard, background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: '#fff' }}>
              <div>
                <h2 style={styles.userCardTitle}>📄 Clearance Status</h2>
                <p style={{ margin: 0, opacity: 0.9 }}>{clearanceStatus}</p>
              </div>
              <div style={{ width: '100%', height: '10px', background: 'rgba(255,255,255,0.32)', borderRadius: '999px', marginTop: '0.7rem' }}>
                <div style={{ width: `${Math.min(100, Math.max(0, paymentProgress))}%`, height: '100%', background: '#ffffff', borderRadius: '999px' }}></div>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

