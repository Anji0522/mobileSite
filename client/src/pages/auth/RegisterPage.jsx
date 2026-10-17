import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Smartphone, UserPlus, UserCheck, Briefcase } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { Input } from '../../components/common/Input.jsx';
import { Button } from '../../components/common/Button.jsx';

export const RegisterPage = () => {
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const defaultRole = searchParams.get('role') === 'provider' ? 'provider' : 'customer';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: defaultRole,
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim() || formData.name.length < 2) {
      newErrors.name = 'Full name must be at least 2 characters';
    }
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Valid email address is required';
    }
    // Password complexity check
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&^#()[\]{}+=\-_`~|:;"'<>,./]).{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      newErrors.password =
        'Password must be at least 8 chars with uppercase, lowercase, number & special character';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (formData.phone && !/^(?:(?:\+91)|(?:91)|0)?[6-9]\d{9}$/.test(formData.phone.trim())) {
      newErrors.phone = 'Please enter a valid 10-digit Indian phone number (starting with 6-9)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setIsLoading(true);
      await register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        phone: formData.phone.trim(),
        role: formData.role,
      });
      toast.success('Registration successful! Welcome to MobiVerse India.');
      navigate('/');
    } catch (err) {
      toast.error(err.message || 'Registration failed. Please check form fields.');
      if (err.errors) {
        const fieldErrors = {};
        err.errors.forEach((e) => {
          fieldErrors[e.field] = e.message;
        });
        setErrors(fieldErrors);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Create Account - MobiVerse India</title>
      </Helmet>

      <div
        className="container"
        style={{
          padding: '2.5rem 1rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '460px',
            background: 'var(--bg-card)',
            padding: '2.5rem',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(135deg, #2563EB 0%, #1E40AF 100%)',
                color: '#fff',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '10px',
              }}
            >
              <Smartphone size={24} />
            </div>
            <h1 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800 }}>Join MobiVerse India</h1>
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
              Create an account to track orders, save wishlists, or list repair services
            </p>
          </div>

          {/* Account Role Selector Tabs */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '8px',
              marginBottom: '1.5rem',
              background: 'var(--bg-secondary)',
              padding: '4px',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <button
              type="button"
              onClick={() => setFormData((prev) => ({ ...prev, role: 'customer' }))}
              style={{
                padding: '8px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: formData.role === 'customer' ? 'var(--bg-card)' : 'transparent',
                color: formData.role === 'customer' ? 'var(--color-primary)' : 'var(--text-muted)',
                fontWeight: 700,
                fontSize: 'var(--font-size-xs)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                boxShadow: formData.role === 'customer' ? 'var(--shadow-sm)' : 'none',
                cursor: 'pointer',
              }}
            >
              <UserCheck size={14} /> Customer
            </button>

            <button
              type="button"
              onClick={() => setFormData((prev) => ({ ...prev, role: 'provider' }))}
              style={{
                padding: '8px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: formData.role === 'provider' ? 'var(--bg-card)' : 'transparent',
                color: formData.role === 'provider' ? 'var(--color-primary)' : 'var(--text-muted)',
                fontWeight: 700,
                fontSize: 'var(--font-size-xs)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                boxShadow: formData.role === 'provider' ? 'var(--shadow-sm)' : 'none',
                cursor: 'pointer',
              }}
            >
              <Briefcase size={14} /> Seller / Provider
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <Input
              label="Full Name"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
              placeholder="e.g. Rahul Sharma"
            />

            <Input
              label="Email Address"
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              placeholder="rahul@example.com"
            />

            <Input
              label="Indian Mobile Number"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              error={errors.phone}
              placeholder="10-digit mobile (e.g. 9876543210)"
            />

            <Input
              label="Password"
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              placeholder="Min 8 chars, 1 Upper, 1 Lower, 1 Num, 1 Symbol"
            />

            <Input
              label="Confirm Password"
              type="password"
              name="confirmPassword"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              placeholder="Re-type password"
            />

            <Button
              type="submit"
              variant="primary"
              style={{ width: '100%', marginTop: '0.5rem' }}
              isLoading={isLoading}
              icon={UserPlus}
            >
              {formData.role === 'provider' ? 'Register as Seller' : 'Create Customer Account'}
            </Button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ fontWeight: 700, color: 'var(--color-primary)' }}>
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};
