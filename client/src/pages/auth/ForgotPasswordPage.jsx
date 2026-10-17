import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { KeyRound, Check } from 'lucide-react';
import { authAPI } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import { Input } from '../../components/common/Input.jsx';
import { Button } from '../../components/common/Button.jsx';

export const ForgotPasswordPage = () => {
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resetInfo, setResetInfo] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    try {
      setIsLoading(true);
      const res = await authAPI.forgotPassword({ email });
      setResetInfo(res.data);
      toast.success('Reset link generated!');
    } catch (err) {
      toast.error(err.message || 'Failed to request reset link.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Forgot Password - MobiVerse India</title>
      </Helmet>

      <div className="container" style={{ padding: '3.5rem 1rem', display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: '420px', background: 'var(--bg-card)', padding: '2.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
          <h1 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800, marginBottom: '8px' }}>Reset Password</h1>
          <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Enter your registered email address and we'll send you instructions to reset your account password.
          </p>

          {resetInfo ? (
            <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
              <div style={{ color: 'var(--color-success)', fontWeight: 700, fontSize: 'var(--font-size-sm)', marginBottom: '6px' }}>
                ✓ Reset Link Ready
              </div>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                Click below to simulate opening your reset link:
              </p>
              <Link to={resetInfo.resetLink} style={{ fontWeight: 700, fontSize: 'var(--font-size-xs)', color: 'var(--color-primary)' }}>
                Open Reset Link →
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <Input
                label="Registered Email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
              />
              <Button type="submit" variant="primary" style={{ width: '100%', marginTop: '0.5rem' }} isLoading={isLoading}>
                Send Reset Link
              </Button>
            </form>
          )}

          <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: 'var(--font-size-xs)' }}>
            <Link to="/login" style={{ color: 'var(--text-muted)' }}>← Back to Login</Link>
          </div>
        </div>
      </div>
    </>
  );
};

export const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    try {
      setIsLoading(true);
      await authAPI.resetPassword(token, { password });
      toast.success('Password updated successfully! You can now log in.');
      navigate('/login');
    } catch (err) {
      toast.error(err.message || 'Failed to reset password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Set New Password - MobiVerse India</title>
      </Helmet>

      <div className="container" style={{ padding: '3.5rem 1rem', display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: '420px', background: 'var(--bg-card)', padding: '2.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
          <h1 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800, marginBottom: '8px' }}>Set New Password</h1>
          <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Enter a strong new password for your MobiVerse account.
          </p>

          <form onSubmit={handleSubmit}>
            <Input
              label="New Password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min 8 characters"
            />
            <Input
              label="Confirm New Password"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
            />
            <Button type="submit" variant="primary" style={{ width: '100%', marginTop: '0.5rem' }} isLoading={isLoading}>
              Update Password
            </Button>
          </form>
        </div>
      </div>
    </>
  );
};
