import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  Shield,
  Users,
  Briefcase,
  Smartphone,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  ArrowDownRight,
  TrendingDown,
  Layers,
  Sparkles,
} from 'lucide-react';
import { adminAPI } from '../../services/api.js';
import { formatINR } from '../../components/common/PriceTag.jsx';
import { Button } from '../../components/common/Button.jsx';
import { Spinner } from '../../components/common/Spinner.jsx';
import { ErrorState } from '../../components/common/ErrorState.jsx';
import { Breadcrumbs } from '../../components/common/Breadcrumbs.jsx';
import { useToast } from '../../context/ToastContext.jsx';

export const AdminDashboardPage = () => {
  const toast = useToast();

  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [pendingListings, setPendingListings] = useState([]);
  const [priceHistory, setPriceHistory] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [statsRes, pendingRes, histRes] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getPendingListings(),
        adminAPI.getPriceHistory(),
      ]);
      setStats(statsRes.data);
      setPendingListings(pendingRes.data || []);
      setPriceHistory(histRes.data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch admin data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleTriggerPriceSync = async () => {
    try {
      setIsSyncing(true);
      const res = await adminAPI.triggerPriceSync();
      toast.success(
        `Price sync completed! ${res.data?.updatedCount || 0} prices updated, ${res.data?.priceDropsCount || 0} price drops detected.`
      );
      fetchAdminData();
    } catch (err) {
      toast.error(err.message || 'Price sync failed');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleApproveListing = async (mobileId) => {
    try {
      await adminAPI.approveListing(mobileId, { status: 'available' });
      toast.success('Mobile listing approved and published to live catalogue!');
      fetchAdminData();
    } catch (err) {
      toast.error(err.message || 'Failed to approve listing');
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await adminAPI.getUsers();
      setUsersList(res.data || []);
    } catch {
      // Ignore
    }
  };

  useEffect(() => {
    if (activeTab === 'users' && usersList.length === 0) {
      fetchUsers();
    }
  }, [activeTab]);

  if (loading) return <Spinner label="Loading administrator dashboard & marketplace analytics..." />;
  if (error) return <ErrorState message={error} onRetry={fetchAdminData} />;

  return (
    <>
      <Helmet>
        <title>Admin Dashboard & Marketplace Control | MobiVerse India</title>
      </Helmet>

      <div className="container" style={{ paddingTop: '1.5rem', maxWidth: '1100px' }}>
        <Breadcrumbs items={[{ label: 'Admin Console' }]} />

        {/* Header */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            padding: '1rem 0 2rem 0',
            borderBottom: '1px solid var(--border-color)',
            marginBottom: '1.5rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Shield size={24} color="var(--color-primary)" />
              <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800 }}>Admin Master Console</h1>
            </div>
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
              Marketplace metrics, catalogue moderation, live price sync, and seller controls
            </p>
          </div>

          <Button
            variant="primary"
            size="sm"
            icon={RefreshCw}
            isLoading={isSyncing}
            onClick={handleTriggerPriceSync}
          >
            Trigger Price Sync Now
          </Button>
        </div>

        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '2rem', overflowX: 'auto' }}>
          {[
            { id: 'overview', label: '📊 Metrics Overview' },
            { id: 'pricesync', label: `🔄 Live Price Sync (${priceHistory.length})` },
            { id: 'catalogue', label: `📱 Pending Listings (${pendingListings.length})` },
            { id: 'users', label: '👥 Registered Accounts' },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '8px 16px',
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  background: isActive ? 'var(--color-primary-light)' : 'transparent',
                  color: isActive ? 'var(--color-primary)' : 'var(--text-secondary)',
                  fontWeight: 700,
                  fontSize: 'var(--font-size-xs)',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div>
            {/* KPI Cards */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '1rem',
                marginBottom: '2rem',
              }}
            >
              <div style={{ background: 'var(--bg-card)', padding: '1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>Total Gross Revenue</span>
                <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, color: 'var(--color-success)', marginTop: '4px' }}>
                  {formatINR(stats?.totalRevenue || 0)}
                </div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>From paid orders</span>
              </div>

              <div style={{ background: 'var(--bg-card)', padding: '1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>Live Indian Mobiles</span>
                <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, marginTop: '4px' }}>
                  {stats?.totalMobiles}
                </div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>In active marketplace</span>
              </div>

              <div style={{ background: 'var(--bg-card)', padding: '1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>Registered Customers</span>
                <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, marginTop: '4px' }}>
                  {stats?.totalUsers}
                </div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Across India</span>
              </div>

              <div style={{ background: 'var(--bg-card)', padding: '1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>Price Drops Tracked</span>
                <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, color: 'var(--color-accent)', marginTop: '4px' }}>
                  {stats?.priceDropsCount}
                </div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Auto-flagged as Deals</span>
              </div>
            </div>

            {/* Recent Orders Table */}
            <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', padding: '1.5rem', marginBottom: '2rem' }}>
              <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 800, marginBottom: '1rem' }}>
                Recent Marketplace Orders
              </h3>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 'var(--font-size-xs)' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '8px' }}>Order #</th>
                      <th style={{ padding: '8px' }}>Customer</th>
                      <th style={{ padding: '8px' }}>Amount</th>
                      <th style={{ padding: '8px' }}>Payment</th>
                      <th style={{ padding: '8px' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats?.recentOrders?.map((ord) => (
                      <tr key={ord._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '10px 8px', fontWeight: 700 }}>{ord.orderNumber}</td>
                        <td style={{ padding: '10px 8px' }}>{ord.user?.name || 'Customer'}</td>
                        <td style={{ padding: '10px 8px', fontWeight: 700 }}>{formatINR(ord.pricing?.grandTotal)}</td>
                        <td style={{ padding: '10px 8px' }}>
                          <span className={`badge badge-${ord.payment?.status === 'paid' ? 'success' : 'neutral'}`}>
                            {ord.payment?.status}
                          </span>
                        </td>
                        <td style={{ padding: '10px 8px' }}>
                          <span className={`badge badge-${ord.orderStatus === 'delivered' ? 'success' : 'primary'}`}>
                            {ord.orderStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Live Price Sync Console */}
        {activeTab === 'pricesync' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 800 }}>
                    Automated Price Sync Engine & Cron Status
                  </h3>
                  <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Runs node-cron job periodically to pull licensed brand feeds, flags price drops, stores historical drops, and flags new phones as "pending_review".
                  </p>
                </div>
                <Button variant="primary" size="sm" icon={RefreshCw} isLoading={isSyncing} onClick={handleTriggerPriceSync}>
                  Run Sync Now
                </Button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', background: 'var(--bg-secondary)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Configured Data Source Adapter:</div>
                  <strong style={{ fontSize: 'var(--font-size-xs)' }}>Official Licensed Market Feed</strong>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Cron Schedule:</div>
                  <strong style={{ fontSize: 'var(--font-size-xs)' }}>0 */4 * * * (Every 4 Hours)</strong>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Scraping Policy:</div>
                  <strong style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-success)' }}>Strictly Prohibits Unauthorized Scraping</strong>
                </div>
              </div>
            </div>

            {/* Historical Price Records */}
            <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
              <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 800, marginBottom: '1rem' }}>
                Recorded Price Changes & Drops
              </h3>

              {priceHistory.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: 'var(--font-size-xs)' }}>
                  No price history records yet. Click "Run Sync Now" to trigger a sync cycle.
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 'var(--font-size-xs)' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)' }}>
                        <th style={{ padding: '8px' }}>Timestamp</th>
                        <th style={{ padding: '8px' }}>Mobile Phone</th>
                        <th style={{ padding: '8px' }}>Old Price</th>
                        <th style={{ padding: '8px' }}>New Price</th>
                        <th style={{ padding: '8px' }}>Change</th>
                        <th style={{ padding: '8px' }}>Source</th>
                      </tr>
                    </thead>
                    <tbody>
                      {priceHistory.map((h) => (
                        <tr key={h._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                          <td style={{ padding: '10px 8px', color: 'var(--text-muted)' }}>
                            {new Date(h.recordedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </td>
                          <td style={{ padding: '10px 8px', fontWeight: 600 }}>{h.mobileName}</td>
                          <td style={{ padding: '10px 8px', textDecoration: 'line-through', color: 'var(--text-muted)' }}>
                            {formatINR(h.oldPrice)}
                          </td>
                          <td style={{ padding: '10px 8px', fontWeight: 800, color: h.isPriceDrop ? 'var(--color-success)' : 'var(--text-primary)' }}>
                            {formatINR(h.newPrice)}
                          </td>
                          <td style={{ padding: '10px 8px' }}>
                            {h.isPriceDrop ? (
                              <span className="badge badge-success">
                                <TrendingDown size={12} /> {h.dropPercentage}% Drop
                              </span>
                            ) : (
                              <span className="badge badge-neutral">+₹{h.difference}</span>
                            )}
                          </td>
                          <td style={{ padding: '10px 8px', color: 'var(--text-muted)' }}>{h.source}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Catalogue Moderation */}
        {activeTab === 'catalogue' && (
          <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
            <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 800, marginBottom: '1rem' }}>
              Pending Mobile Listings for Admin Moderation
            </h3>

            {pendingListings.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)', fontSize: 'var(--font-size-xs)' }}>
                ✓ No pending listings waiting for review. All products are verified.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {pendingListings.map((p) => (
                  <div
                    key={p._id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '1.25rem',
                      background: 'var(--bg-secondary)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-color)',
                      gap: '1rem',
                      flexWrap: 'wrap',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 'var(--font-size-sm)' }}>{p.name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        Brand: {p.brandName} • Price: {formatINR(p.price?.current)} • Status: <span className="badge badge-accent">Pending Review</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <Button size="sm" variant="primary" onClick={() => handleApproveListing(p._id)}>
                        Approve & Publish
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Users Management */}
        {activeTab === 'users' && (
          <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
            <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 800, marginBottom: '1rem' }}>
              Registered Marketplace Accounts
            </h3>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 'var(--font-size-xs)' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '8px' }}>User</th>
                    <th style={{ padding: '8px' }}>Email</th>
                    <th style={{ padding: '8px' }}>Role</th>
                    <th style={{ padding: '8px' }}>Status</th>
                    <th style={{ padding: '8px' }}>Phone</th>
                  </tr>
                </thead>
                <tbody>
                  {usersList.map((u) => (
                    <tr key={u._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '10px 8px', fontWeight: 600 }}>{u.name}</td>
                      <td style={{ padding: '10px 8px' }}>{u.email}</td>
                      <td style={{ padding: '10px 8px' }}>
                        <span className={`badge badge-${u.role === 'admin' ? 'primary' : u.role === 'provider' ? 'accent' : 'neutral'}`} style={{ textTransform: 'uppercase' }}>
                          {u.role}
                        </span>
                      </td>
                      <td style={{ padding: '10px 8px' }}>
                        <span className={`badge badge-${u.status === 'active' ? 'success' : 'danger'}`}>
                          {u.status}
                        </span>
                      </td>
                      <td style={{ padding: '10px 8px' }}>{u.phone || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
