import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Briefcase, Wrench, Package, Clock, CheckCircle2, Plus, DollarSign } from 'lucide-react';
import { servicesAPI } from '../../services/api.js';
import { formatINR } from '../../components/common/PriceTag.jsx';
import { Button } from '../../components/common/Button.jsx';
import { Spinner } from '../../components/common/Spinner.jsx';
import { ErrorState } from '../../components/common/ErrorState.jsx';
import { Breadcrumbs } from '../../components/common/Breadcrumbs.jsx';
import { Modal } from '../../components/common/Modal.jsx';
import { Input } from '../../components/common/Input.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';

export const ProviderDashboardPage = () => {
  const { user } = useAuth();
  const toast = useToast();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // New Service Modal
  const [isAddServiceOpen, setIsAddServiceOpen] = useState(false);
  const [serviceForm, setServiceForm] = useState({
    title: '',
    category: 'screen_repair',
    description: '',
    basePrice: '',
    estimatedHours: 2,
    warrantyDays: 90,
    city: 'Bengaluru',
  });
  const [isCreatingService, setIsCreatingService] = useState(false);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await servicesAPI.getProviderBookings();
      setBookings(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      await servicesAPI.updateBookingStatus(bookingId, { status: newStatus });
      toast.success(`Booking status marked as ${newStatus}`);
      fetchBookings();
    } catch (err) {
      toast.error(err.message || 'Failed to update status');
    }
  };

  const handleCreateService = async (e) => {
    e.preventDefault();
    if (!serviceForm.title.trim() || !serviceForm.basePrice) {
      toast.error('Please enter title and base price');
      return;
    }

    try {
      setIsCreatingService(true);
      await servicesAPI.create({
        ...serviceForm,
        basePrice: Number(serviceForm.basePrice),
        estimatedHours: Number(serviceForm.estimatedHours),
        warrantyDays: Number(serviceForm.warrantyDays),
      });
      toast.success('New service listed successfully!');
      setIsAddServiceOpen(false);
      setServiceForm({
        title: '',
        category: 'screen_repair',
        description: '',
        basePrice: '',
        estimatedHours: 2,
        warrantyDays: 90,
        city: 'Bengaluru',
      });
    } catch (err) {
      toast.error(err.message || 'Failed to create service');
    } finally {
      setIsCreatingService(false);
    }
  };

  if (loading) return <Spinner label="Loading seller portal..." />;
  if (error) return <ErrorState message={error} onRetry={fetchBookings} />;

  return (
    <>
      <Helmet>
        <title>Provider & Seller Portal - MobiVerse India</title>
      </Helmet>

      <div className="container" style={{ paddingTop: '1.5rem', maxWidth: '1000px' }}>
        <Breadcrumbs items={[{ label: 'Provider Portal' }]} />

        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', padding: '1rem 0 2rem 0', borderBottom: '1px solid var(--border-color)', marginBottom: '2rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800 }}>Provider & Seller Portal</h1>
              <span className="badge badge-primary">Authorized Partner</span>
            </div>
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
              Manage assigned doorstep repairs, listings, and service status
            </p>
          </div>

          <Button variant="primary" size="sm" icon={Plus} onClick={() => setIsAddServiceOpen(true)}>
            Add New Service Listing
          </Button>
        </div>

        {/* Stats Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
          <div style={{ background: 'var(--bg-card)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>Total Assigned Bookings</div>
            <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800 }}>{bookings.length}</div>
          </div>
          <div style={{ background: 'var(--bg-card)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>Completed Repairs</div>
            <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, color: 'var(--color-success)' }}>
              {bookings.filter((b) => b.status === 'completed').length}
            </div>
          </div>
          <div style={{ background: 'var(--bg-card)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>Pending Appointments</div>
            <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, color: 'var(--color-accent)' }}>
              {bookings.filter((b) => b.status === 'pending').length}
            </div>
          </div>
        </div>

        {/* Bookings Queue */}
        <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 800, marginBottom: '1rem' }}>
          Assigned Doorstep Repair Requests
        </h2>

        {bookings.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)' }}>
            <Wrench size={32} color="var(--text-muted)" style={{ margin: '0 auto 8px auto' }} />
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>
              No service bookings assigned to your shop yet.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {bookings.map((b) => (
              <div
                key={b._id}
                style={{
                  background: 'var(--bg-card)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border-color)',
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                  <div>
                    <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 700 }}>{b.service?.title}</h3>
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                      Customer: <strong>{b.customer?.name}</strong> • Phone: <strong>{b.customer?.phone}</strong>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span className={`badge badge-${b.status === 'completed' ? 'success' : 'primary'}`} style={{ textTransform: 'uppercase' }}>
                      {b.status}
                    </span>
                    <span style={{ fontWeight: 800 }}>{formatINR(b.finalPrice || b.estimatedPrice)}</span>
                  </div>
                </div>

                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>
                  <strong>Device:</strong> {b.deviceModel} • <strong>Reported Issue:</strong> {b.issueDescription}
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '10px', gap: '8px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Slot: {new Date(b.appointmentDate).toLocaleDateString('en-IN')} ({b.appointmentSlot}) • Address: {b.serviceAddress?.street}, {b.serviceAddress?.city}
                  </div>

                  {/* Status Action Buttons */}
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {b.status === 'pending' && (
                      <Button size="sm" variant="outline" onClick={() => handleStatusChange(b._id, 'confirmed')}>
                        Confirm
                      </Button>
                    )}
                    {b.status === 'confirmed' && (
                      <Button size="sm" variant="accent" onClick={() => handleStatusChange(b._id, 'in_progress')}>
                        Start Repair
                      </Button>
                    )}
                    {b.status === 'in_progress' && (
                      <Button size="sm" variant="primary" onClick={() => handleStatusChange(b._id, 'completed')}>
                        Mark Completed
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Service Modal */}
      <Modal
        isOpen={isAddServiceOpen}
        onClose={() => setIsAddServiceOpen(false)}
        title="List New Repair Service"
      >
        <form onSubmit={handleCreateService}>
          <Input
            label="Service Title"
            required
            placeholder="e.g. AMOLED Display Replacement"
            value={serviceForm.title}
            onChange={(e) => setServiceForm({ ...serviceForm, title: e.target.value })}
          />

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: '6px' }}>
              Category
            </label>
            <select
              value={serviceForm.category}
              onChange={(e) => setServiceForm({ ...serviceForm, category: e.target.value })}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-input)',
                color: 'var(--text-primary)',
              }}
            >
              <option value="screen_repair">Screen Repair</option>
              <option value="battery_replacement">Battery Replacement</option>
              <option value="water_damage">Water Damage</option>
              <option value="software_recovery">Motherboard / Chip-Level</option>
              <option value="charging_port">Charging Port</option>
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <Input
              label="Starting Price (INR)"
              type="number"
              required
              placeholder="e.g. 2499"
              value={serviceForm.basePrice}
              onChange={(e) => setServiceForm({ ...serviceForm, basePrice: e.target.value })}
            />
            <Input
              label="City"
              required
              value={serviceForm.city}
              onChange={(e) => setServiceForm({ ...serviceForm, city: e.target.value })}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: '6px' }}>
              Description
            </label>
            <textarea
              rows={3}
              required
              placeholder="Details about technician qualifications, OEM parts, and warranty..."
              value={serviceForm.description}
              onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-input)',
                color: 'var(--text-primary)',
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <Button variant="ghost" onClick={() => setIsAddServiceOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isCreatingService}>
              Save Service Listing
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
};
