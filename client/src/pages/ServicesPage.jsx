import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Wrench, ShieldCheck, Clock, MapPin, CheckCircle2 } from 'lucide-react';
import { servicesAPI } from '../services/api.js';
import { ServiceCard } from '../components/common/ServiceCard.jsx';
import { Spinner } from '../components/common/Spinner.jsx';
import { ErrorState } from '../components/common/ErrorState.jsx';
import { Breadcrumbs } from '../components/common/Breadcrumbs.jsx';
import { Modal } from '../components/common/Modal.jsx';
import { Button } from '../components/common/Button.jsx';
import { Input } from '../components/common/Input.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

const CITIES = ['All Cities', 'Bengaluru', 'Mumbai', 'Delhi-NCR', 'Hyderabad', 'Pune'];

export const ServicesPage = () => {
  const { isAuthenticated, user } = useAuth();
  const toast = useToast();

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCity, setSelectedCity] = useState('');

  // Booking Modal
  const [selectedService, setSelectedService] = useState(null);
  const [deviceModel, setDeviceModel] = useState('');
  const [issueDescription, setIssueDescription] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentSlot, setAppointmentSlot] = useState('10:00 AM - 01:00 PM');
  const [street, setStreet] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchServices = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await servicesAPI.getAll({
        city: selectedCity === 'All Cities' ? '' : selectedCity,
      });
      setServices(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load repair services.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [selectedCity]);

  const handleOpenBooking = (service) => {
    if (!isAuthenticated) {
      toast.warning('Please log in or register to book a doorstep repair appointment.');
      return;
    }
    setSelectedService(service);
    setStreet(user?.addresses?.[0]?.street || '');
    // Default appointment to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setAppointmentDate(tomorrow.toISOString().split('T')[0]);
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!deviceModel.trim() || !issueDescription.trim() || !appointmentDate) {
      toast.error('Please fill in your phone model, issue description, and preferred date.');
      return;
    }

    try {
      setIsSubmitting(true);
      await servicesAPI.book({
        serviceId: selectedService._id,
        deviceModel: deviceModel.trim(),
        issueDescription: issueDescription.trim(),
        appointmentDate,
        appointmentSlot,
        serviceAddress: {
          street: street || 'Customer Address Provided',
          city: selectedService.city,
          pincode: user?.addresses?.[0]?.pincode || '560001',
          phone: user?.phone || '9876543210',
        },
      });

      toast.success('🎉 Doorstep repair scheduled! A certified engineer will reach out.');
      setSelectedService(null);
      setDeviceModel('');
      setIssueDescription('');
    } catch (err) {
      toast.error(err.message || 'Failed to book repair.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Doorstep Mobile Repair & Maintenance Services in India | MobiVerse Care</title>
        <meta
          name="description"
          content="Book certified doorstep smartphone repairs across Bengaluru, Mumbai, Delhi-NCR, Hyderabad, and Pune. Screen replacement, original battery swap, and motherboard repairs with up to 180 days warranty."
        />
      </Helmet>

      <div className="container" style={{ paddingTop: '1.5rem' }}>
        <Breadcrumbs items={[{ label: 'Repair Services' }]} />

        {/* Hero Banner */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.08) 0%, rgba(22, 163, 74, 0.06) 100%)',
            borderRadius: 'var(--radius-lg)',
            padding: '2.5rem',
            border: '1px solid var(--border-color)',
            marginBottom: '2rem',
          }}
        >
          <span className="badge badge-success" style={{ marginBottom: '8px' }}>
            <ShieldCheck size={14} /> Certified Technicians
          </span>
          <h1 style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 800 }}>
            Doorstep Mobile Repair & Maintenance
          </h1>
          <p style={{ fontSize: 'var(--font-size-base)', color: 'var(--text-secondary)', maxWidth: '650px', marginTop: '8px', lineHeight: 1.5 }}>
            Don't leave your phone at risky unverified repair stalls. Book IPC-certified technicians to fix your phone right at your home or office with genuine parts and up to 180 days warranty.
          </p>

          {/* City Selection Pills */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '1.5rem', alignItems: 'center' }}>
            <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, color: 'var(--text-secondary)' }}>
              Select City:
            </span>
            {CITIES.map((city) => {
              const isActive = (selectedCity || 'All Cities') === city;
              return (
                <button
                  key={city}
                  onClick={() => setSelectedCity(city === 'All Cities' ? '' : city)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 'var(--radius-full)',
                    border: `1px solid ${isActive ? 'var(--color-primary)' : 'var(--border-color)'}`,
                    background: isActive ? 'var(--color-primary)' : 'var(--bg-card)',
                    color: isActive ? '#FFFFFF' : 'var(--text-primary)',
                    fontSize: 'var(--font-size-xs)',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {city}
                </button>
              );
            })}
          </div>
        </div>

        {loading && <Spinner label="Loading certified repair services..." />}
        {error && <ErrorState message={error} onRetry={fetchServices} />}

        {!loading && !error && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {services.map((service) => (
              <ServiceCard
                key={service._id}
                service={service}
                onBook={handleOpenBooking}
              />
            ))}
          </div>
        )}
      </div>

      {/* Booking Appointment Modal */}
      <Modal
        isOpen={!!selectedService}
        onClose={() => setSelectedService(null)}
        title={`Book ${selectedService?.title || 'Repair'}`}
      >
        <form onSubmit={handleBookingSubmit}>
          <div style={{ marginBottom: '1rem', background: 'var(--bg-secondary)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>Service Cost:</div>
            <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: 800, color: 'var(--color-primary)' }}>
              Starts at ₹{selectedService?.basePrice?.toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--color-success)', fontWeight: 600, marginTop: '2px' }}>
              ✓ Includes {selectedService?.warrantyDays} days replacement warranty & doorstep inspection
            </div>
          </div>

          <Input
            label="Smartphone Model"
            required
            placeholder="e.g. Samsung Galaxy S24 Ultra, iPhone 15 Pro, OnePlus 12"
            value={deviceModel}
            onChange={(e) => setDeviceModel(e.target.value)}
          />

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: '6px' }}>
              Issue Description <span style={{ color: 'var(--color-danger)' }}>*</span>
            </label>
            <textarea
              rows={3}
              required
              placeholder="e.g. Glass cracked at top right corner, touch is responding but black bleed visible..."
              value={issueDescription}
              onChange={(e) => setIssueDescription(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                fontSize: 'var(--font-size-sm)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-input)',
                color: 'var(--text-primary)',
                outline: 'none',
              }}
            />
          </div>

          <Input
            label="Preferred Date"
            type="date"
            required
            value={appointmentDate}
            onChange={(e) => setAppointmentDate(e.target.value)}
          />

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: '6px' }}>
              Preferred Time Window
            </label>
            <select
              value={appointmentSlot}
              onChange={(e) => setAppointmentSlot(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                fontSize: 'var(--font-size-sm)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-input)',
                color: 'var(--text-primary)',
                outline: 'none',
              }}
            >
              <option value="10:00 AM - 01:00 PM">Morning (10:00 AM - 01:00 PM)</option>
              <option value="02:00 PM - 05:00 PM">Afternoon (02:00 PM - 05:00 PM)</option>
              <option value="05:00 PM - 08:00 PM">Evening (05:00 PM - 08:00 PM)</option>
            </select>
          </div>

          <Input
            label="Doorstep Service Street Address"
            required
            placeholder="Flat No, Building, Landmark, Street"
            value={street}
            onChange={(e) => setStreet(e.target.value)}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '1.5rem' }}>
            <Button variant="ghost" onClick={() => setSelectedService(null)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Confirm Booking
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
};
