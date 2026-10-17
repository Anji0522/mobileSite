import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Package, Truck, CheckCircle2, Clock, XCircle, ArrowLeft, ShieldCheck } from 'lucide-react';
import { ordersAPI } from '../services/api.js';
import { formatINR } from '../components/common/PriceTag.jsx';
import { Button } from '../components/common/Button.jsx';
import { Spinner } from '../components/common/Spinner.jsx';
import { EmptyState } from '../components/common/EmptyState.jsx';
import { ErrorState } from '../components/common/ErrorState.jsx';
import { Breadcrumbs } from '../components/common/Breadcrumbs.jsx';
import { useToast } from '../context/ToastContext.jsx';

export const OrdersPage = () => {
  const { id } = useParams();
  const toast = useToast();

  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      if (id) {
        const res = await ordersAPI.getById(id);
        setSelectedOrder(res.data);
      } else {
        const res = await ordersAPI.getMyOrders();
        setOrders(res.data || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      await ordersAPI.cancel(orderId, 'Cancelled by customer');
      toast.info('Order has been cancelled.');
      fetchOrders();
    } catch (err) {
      toast.error(err.message || 'Failed to cancel order.');
    }
  };

  if (loading) return <Spinner label="Loading your orders & tracking status..." />;
  if (error) return <ErrorState message={error} onRetry={fetchOrders} />;

  // Single Order Detail View
  if (id && selectedOrder) {
    const o = selectedOrder;
    const canCancel = ['created', 'paid', 'confirmed'].includes(o.orderStatus);

    return (
      <>
        <Helmet>
          <title>Order #{o.orderNumber} | MobiVerse India</title>
        </Helmet>

        <div className="container" style={{ paddingTop: '1.5rem', maxWidth: '850px' }}>
          <Breadcrumbs
            items={[
              { label: 'My Orders', to: '/orders' },
              { label: o.orderNumber },
            ]}
          />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 0', borderBottom: '1px solid var(--border-color)', marginBottom: '2rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h1 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800 }}>Order #{o.orderNumber}</h1>
                <span className={`badge badge-${o.orderStatus === 'delivered' ? 'success' : o.orderStatus === 'cancelled' ? 'danger' : 'primary'}`} style={{ textTransform: 'uppercase' }}>
                  {o.orderStatus}
                </span>
              </div>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginTop: '4px' }}>
                Placed on {new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>

            {canCancel && (
              <Button variant="danger" size="sm" onClick={() => handleCancelOrder(o._id)}>
                Cancel Order
              </Button>
            )}
          </div>

          {/* Tracking Timeline */}
          <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', marginBottom: '2rem' }}>
            <h3 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700, marginBottom: '1rem' }}>
              Delivery Timeline • {o.courierPartner}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {o.statusHistory?.map((h, i) => (
                <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'var(--color-primary-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                    <CheckCircle2 size={14} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 'var(--font-size-xs)', textTransform: 'capitalize' }}>
                      {h.status}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {new Date(h.timestamp).toLocaleString('en-IN')} — {h.comment}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ordered Items */}
          <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', marginBottom: '2rem' }}>
            <h3 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700, marginBottom: '1rem' }}>
              Items in this Shipment
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {o.items?.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                  <img src={item.productImage} alt={item.productName} style={{ width: '50px', height: '50px', objectFit: 'contain' }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 'var(--font-size-xs)' }}>{item.productName}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Qty: {item.quantity} • Unit Price: {formatINR(item.price)}</div>
                  </div>
                  <div style={{ fontWeight: 800, fontSize: 'var(--font-size-sm)' }}>{formatINR(item.total)}</div>
                </div>
              ))}
            </div>

            {/* Total breakup */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: 'var(--font-size-xs)', marginTop: '1rem', paddingTop: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Subtotal</span>
                <span>{formatINR(o.pricing?.itemsTotal)}</span>
              </div>
              {o.pricing?.discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-success)' }}>
                  <span>Discount</span>
                  <span>- {formatINR(o.pricing?.discount)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Shipping</span>
                <span>{o.pricing?.shippingFee === 0 ? 'FREE' : formatINR(o.pricing?.shippingFee)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 'var(--font-size-base)', borderTop: '1px solid var(--border-color)', paddingTop: '8px' }}>
                <span>Grand Total (Paid)</span>
                <span>{formatINR(o.pricing?.grandTotal)}</span>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Orders List View
  return (
    <>
      <Helmet>
        <title>My Orders | MobiVerse India</title>
      </Helmet>

      <div className="container" style={{ paddingTop: '1.5rem', maxWidth: '900px' }}>
        <Breadcrumbs items={[{ label: 'My Orders' }]} />

        <div style={{ padding: '1rem 0 2rem 0', borderBottom: '1px solid var(--border-color)', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800 }}>Order History</h1>
          <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
            Track and manage your smartphone & accessory deliveries
          </p>
        </div>

        {orders.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No orders yet"
            message="You haven't placed any orders with MobiVerse yet. Browse through our catalogue of 100+ smartphones to get started!"
            actionText="Browse Mobiles"
            onAction={() => (window.location.href = '/mobiles')}
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {orders.map((order) => (
              <div
                key={order._id}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.5rem',
                }}
              >
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', gap: '8px', marginBottom: '12px' }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 'var(--font-size-sm)' }}>Order #{order.orderNumber}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      Placed {new Date(order.createdAt).toLocaleDateString('en-IN')}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span className={`badge badge-${order.orderStatus === 'delivered' ? 'success' : order.orderStatus === 'cancelled' ? 'danger' : 'primary'}`} style={{ textTransform: 'uppercase' }}>
                      {order.orderStatus}
                    </span>
                    <span style={{ fontWeight: 800, fontSize: 'var(--font-size-sm)' }}>
                      {formatINR(order.pricing?.grandTotal)}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>
                    {order.items?.length} item{order.items?.length > 1 ? 's' : ''} • Deliver to: {order.shippingAddress?.city}, {order.shippingAddress?.pincode}
                  </div>

                  <Button as={Link} to={`/orders/${order._id}`} variant="secondary" size="sm">
                    View Details & Tracking →
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};
