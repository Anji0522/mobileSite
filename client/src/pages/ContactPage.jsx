import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Mail, Phone, MapPin, Send, MessageSquare } from 'lucide-react';
import { contactAPI } from '../services/api.js';
import { Input } from '../components/common/Input.jsx';
import { Button } from '../components/common/Button.jsx';
import { Breadcrumbs } from '../components/common/Breadcrumbs.jsx';
import { useToast } from '../context/ToastContext.jsx';

export const ContactPage = () => {
  const toast = useToast();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Full name is required';
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'A valid email address is required';
    }
    if (formData.phone && !/^(?:(?:\+91)|(?:91)|0)?[6-9]\d{9}$/.test(formData.phone.trim())) {
      newErrors.phone = 'Please enter a valid 10-digit Indian phone number (starting with 6-9)';
    }
    if (!formData.subject.trim()) newErrors.subject = 'Subject is required';
    if (!formData.message.trim() || formData.message.length < 10) {
      newErrors.message = 'Message must be at least 10 characters long';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setIsSubmitting(true);
      await contactAPI.submit(formData);
      setIsSubmitted(true);
      toast.success('Your message has been sent to our customer care team!');
    } catch (err) {
      toast.error(err.message || 'Failed to submit message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Contact MobiVerse India - Customer Support & Seller Inquiries</title>
        <meta
          name="description"
          content="Get in touch with MobiVerse India. 24/7 customer support for smartphone orders, doorstep repair bookings, seller onboarding, and warranty claims."
        />
      </Helmet>

      <div className="container" style={{ paddingTop: '1.5rem' }}>
        <Breadcrumbs items={[{ label: 'Contact Us' }]} />

        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '1rem 0' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <span className="badge badge-primary" style={{ marginBottom: '8px' }}>
              We're Here to Help
            </span>
            <h1 style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 800 }}>Contact MobiVerse India</h1>
            <p style={{ fontSize: 'var(--font-size-base)', color: 'var(--text-secondary)', marginTop: '8px' }}>
              Have questions about an upcoming phone launch, your delivery, or doorstep repair? Send us a message and our team in Bengaluru will reply within 24 hours.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '2.5rem',
            }}
          >
            {/* Direct Contact Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', color: 'var(--color-primary)' }}>
                  <Phone size={20} />
                  <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 700 }}>Toll-Free Helpline</h3>
                </div>
                <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: 800 }}>1800-MOBIVERSE</div>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>Monday to Saturday, 9:00 AM – 8:00 PM IST</div>
              </div>

              <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', color: 'var(--color-primary)' }}>
                  <Mail size={20} />
                  <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 700 }}>Email Support</h3>
                </div>
                <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700 }}>support@mobiverse.in</div>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>Response within 24 business hours guaranteed</div>
              </div>

              <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', color: 'var(--color-primary)' }}>
                  <MapPin size={20} />
                  <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 700 }}>Headquarters</h3>
                </div>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  MobiVerse India Private Limited<br />
                  100 Feet Road, HAL 2nd Stage, Indiranagar<br />
                  Bengaluru, Karnataka - 560038, India
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
              {isSubmitted ? (
                <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--color-success-light)', color: 'var(--color-success)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
                    ✓
                  </div>
                  <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 800 }}>Message Received!</h3>
                  <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', margin: '8px 0 1.5rem 0' }}>
                    Thank you, {formData.name}. Our customer success specialist will review your inquiry and reach out shortly.
                  </p>
                  <Button variant="secondary" onClick={() => setIsSubmitted(false)}>
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <Input
                    label="Your Full Name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    error={errors.name}
                    placeholder="e.g. Aditi Sharma"
                  />

                  <Input
                    label="Email Address"
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    error={errors.email}
                    placeholder="aditi@example.com"
                  />

                  <Input
                    label="Mobile Number (Optional)"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    error={errors.phone}
                    placeholder="10-digit Indian mobile (e.g. 9876543210)"
                  />

                  <Input
                    label="Subject"
                    name="subject"
                    required
                    value={formData.subject}
                    onChange={handleChange}
                    error={errors.subject}
                    placeholder="e.g. Order Inquiry / Doorstep Repair Slot"
                  />

                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: '6px' }}>
                      Message <span style={{ color: 'var(--color-danger)' }}>*</span>
                    </label>
                    <textarea
                      rows={4}
                      name="message"
                      required
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Please describe how we can assist you..."
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        fontSize: 'var(--font-size-sm)',
                        borderRadius: 'var(--radius-md)',
                        border: `1.5px solid ${errors.message ? 'var(--color-danger)' : 'var(--border-color)'}`,
                        background: 'var(--bg-input)',
                        color: 'var(--text-primary)',
                        outline: 'none',
                      }}
                    />
                    {errors.message && (
                      <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-danger)', fontWeight: 500 }}>
                        {errors.message}
                      </span>
                    )}
                  </div>

                  <Button type="submit" variant="primary" style={{ width: '100%' }} isLoading={isSubmitting} icon={Send}>
                    Send Message
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
