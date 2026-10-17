import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { KeyRound, CheckCircle2 } from 'lucide-react';
import { Input } from '../../components/common/Input.jsx';
import { Button } from '../../components/common/Button.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { authAPI } from '../../services/api.js';

export const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!password) {
      errs.password = 'Password is required';
    } else if (
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_-])[A-Za-z\d@$!%*?&#^()_-]{8,}$/.test(password)
    ) {
      errs.password = 'Must be min 8 chars with uppercase, lowercase, number, and special character';
    }

    if (password !== confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      await authAPI.resetPassword(token, { password });
      setSuccess(true);
      addToast('Password reset successfully! You can now log in.', 'success');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      addToast(err.response?.data?.message || 'Invalid or expired password reset link', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Reset Password | MobiVerse India</title>
      </Helmet>

      <div
        className="container"
        style={{
          minHeight: '70vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem 1rem'
        }}
      >
        <div
          className="card"
          style={{
            width: '100%',
            maxWidth: '460px',
            padding: '2rem'
          }}
        >
          {success ? (
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <CheckCircle2 size={56} color="var(--color-success)" style={{ margin: '0 auto 1rem auto' }} />
              <h2 style={{ fontSize: 'var(--font-size-xl)', marginBottom: '0.5rem' }}>Password Updated!</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                Your password has been reset successfully. Redirecting you to login...
              </p>
              <Link to="/login">
                <Button variant="primary" style={{ width: '100%' }}>
                  Go to Login Now
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: 'var(--color-primary-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1rem auto',
                    color: 'var(--color-primary)'
                  }}
                >
                  <KeyRound size={24} />
                </div>
                <h1 style={{ fontSize: 'var(--font-size-xl)', marginBottom: '0.5rem' }}>Set New Password</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                  Please choose a strong, unique password for your MobiVerse account.
                </p>
              </div>

              <form onSubmit={handleSubmit}>
                <Input
                  label="New Password"
                  type="password"
                  placeholder="Min 8 chars (e.g. Secret@123)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  error={errors.password}
                  required
                />

                <Input
                  label="Confirm New Password"
                  type="password"
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  error={errors.confirmPassword}
                  required
                />

                <Button
                  type="submit"
                  variant="primary"
                  loading={loading}
                  style={{ width: '100%', marginTop: '0.5rem' }}
                >
                  Update Password
                </Button>
              </form>

              <div style={{ textAlign: 'center', marginTop: '1.25rem' }}>
                <Link
                  to="/login"
                  style={{ fontSize: '0.875rem', color: 'var(--color-primary)', fontWeight: 500 }}
                >
                  Back to Login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default ResetPasswordPage;
