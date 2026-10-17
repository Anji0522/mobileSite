import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { User, MapPin, Plus, Trash2, Shield, Phone, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { authAPI } from '../services/api.js';
import { Button } from '../components/common/Button.jsx';
import { Input } from '../components/common/Input.jsx';
import { Modal } from '../components/common/Modal.jsx';
import { Breadcrumbs } from '../components/common/Breadcrumbs.jsx';

export const ProfilePage = () => {
  const { user, updateUserState, refreshProfile } = useAuth();
  const toast = useToast();

  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [addressForm, setAddressForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    street: '',
    landmark: '',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '',
    isDefault: false,
  });
  const [isSavingAddress, setIsSavingAddress] = useState(false);

  const handleAddressChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAddressForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    if (!addressForm.street.trim() || !addressForm.city.trim() || !addressForm.pincode.trim()) {
      toast.error('Please complete street address, city, and 6-digit PIN code.');
      return;
    }
    if (!/^[1-9][0-9]{5}$/.test(addressForm.pincode.trim())) {
      toast.error('Please enter a valid 6-digit Indian PIN code.');
      return;
    }

    try {
      setIsSavingAddress(true);
      const res = await authAPI.addAddress(addressForm);
      if (res.data?.addresses) {
        updateUserState({ ...user, addresses: res.data.addresses });
      }
      toast.success('Address saved to your address book!');
      setIsAddressModalOpen(false);
      setAddressForm({
        name: user?.name || '',
        phone: user?.phone || '',
        street: '',
        landmark: '',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '',
        isDefault: false,
      });
      refreshProfile();
    } catch (err) {
      toast.error(err.message || 'Failed to save address.');
    } finally {
      setIsSavingAddress(false);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    try {
      const res = await authAPI.deleteAddress(addressId);
      if (res.data?.addresses) {
        updateUserState({ ...user, addresses: res.data.addresses });
      }
      toast.info('Address removed.');
      refreshProfile();
    } catch (err) {
      toast.error(err.message || 'Failed to remove address.');
    }
  };

  return (
    <>
      <Helmet>
        <title>My Profile - MobiVerse India</title>
      </Helmet>

      <div className="container" style={{ paddingTop: '1.5rem', maxWidth: '850px' }}>
        <Breadcrumbs items={[{ label: 'My Account' }]} />

        <div style={{ padding: '1rem 0 2rem 0', borderBottom: '1px solid var(--border-color)', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800 }}>Account Profile</h1>
          <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
            Manage your personal information and saved Indian delivery addresses
          </p>
        </div>

        {/* User Card */}
        <div
          style={{
            background: 'var(--bg-card)',
            padding: '2rem',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-color)',
            marginBottom: '2.5rem',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '1.5rem',
          }}
        >
          <img
            src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
            alt={user?.name}
            style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--color-primary-light)' }}
          />
          <div style={{ flex: 1, minWidth: '220px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 800 }}>{user?.name}</h2>
              <span className="badge badge-primary" style={{ textTransform: 'uppercase' }}>{user?.role}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginTop: '4px' }}>
              <Mail size={14} /> {user?.email}
            </div>
            {user?.phone && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginTop: '2px' }}>
                <Phone size={14} /> +91 {user?.phone}
              </div>
            )}
          </div>
        </div>

        {/* Saved Addresses Section */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div>
              <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 800 }}>Saved Delivery Addresses</h2>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                Addresses used for fast delivery and doorstep smartphone repairs
              </p>
            </div>
            <Button variant="primary" size="sm" icon={Plus} onClick={() => setIsAddressModalOpen(true)}>
              Add Address
            </Button>
          </div>

          {!user?.addresses || user.addresses.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border-color)' }}>
              <MapPin size={28} color="var(--text-muted)" style={{ margin: '0 auto 8px auto' }} />
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>
                No delivery address saved yet. Add your home or office address for 1-click checkout.
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
              {user.addresses.map((addr) => (
                <div
                  key={addr._id}
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1.25rem',
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 700, fontSize: 'var(--font-size-sm)' }}>{addr.name}</span>
                    {addr.isDefault && <span className="badge badge-success">Default</span>}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Phone: {addr.phone}</div>
                  <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', marginTop: '6px', lineHeight: 1.4 }}>
                    {addr.street}, {addr.landmark && `${addr.landmark}, `}{addr.city}, {addr.state} - <strong>{addr.pincode}</strong>
                  </p>
                  <div style={{ marginTop: 'auto', paddingTop: '10px', display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => handleDeleteAddress(addr._id)}
                      style={{ color: 'var(--color-danger)', fontSize: '11px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
                    >
                      <Trash2 size={12} /> Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Address Modal */}
      <Modal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        title="Add New Indian Delivery Address"
      >
        <form onSubmit={handleAddAddress}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <Input
              label="Recipient Name"
              name="name"
              required
              value={addressForm.name}
              onChange={handleAddressChange}
            />
            <Input
              label="Phone Number"
              name="phone"
              required
              value={addressForm.phone}
              onChange={handleAddressChange}
            />
          </div>

          <Input
            label="Street / Flat / House No."
            name="street"
            required
            value={addressForm.street}
            onChange={handleAddressChange}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <Input
              label="City"
              name="city"
              required
              value={addressForm.city}
              onChange={handleAddressChange}
            />
            <Input
              label="State"
              name="state"
              required
              value={addressForm.state}
              onChange={handleAddressChange}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <Input
              label="PIN Code (6 Digits)"
              name="pincode"
              required
              maxLength={6}
              value={addressForm.pincode}
              onChange={handleAddressChange}
            />
            <Input
              label="Landmark"
              name="landmark"
              value={addressForm.landmark}
              onChange={handleAddressChange}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '1rem' }}>
            <Button variant="ghost" onClick={() => setIsAddressModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSavingAddress}>
              Save Address
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
};
