import axios from 'axios';
import {
  getMockFeatured,
  getMockMobiles,
  getMockMobileBySlug,
  getMockCompare,
  getMockBrands,
  getMockAccessoriesList,
  getMockAccessoryBySlug,
  getMockServicesList,
} from './mockService.js';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 8000,
});

// Request interceptor: attach bearer token if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('mv_accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401 token refresh & error mapping
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;

    // Network / offline error
    if (!error.response) {
      return Promise.reject({
        message: 'Please check your internet connection. Server is currently unreachable.',
        isNetworkError: true,
      });
    }

    // Handle 401 unauthorized & automatic token refresh
    if (error.response.status === 401 && !originalRequest._retry && !originalRequest.url?.includes('/auth/login')) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshResponse = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const newAccessToken = refreshResponse.data?.data?.accessToken;
        if (newAccessToken) {
          localStorage.setItem('mv_accessToken', newAccessToken);
          api.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
          processQueue(null, newAccessToken);
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        }
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        localStorage.removeItem('mv_accessToken');
        localStorage.removeItem('mv_user');
        window.dispatchEvent(new Event('mv_auth_expired'));
        return Promise.reject({
          message: 'Your session has expired. Please log in again.',
          isAuthError: true,
        });
      } finally {
        isRefreshing = false;
      }
    }

    const friendlyError = {
      message: error.response?.data?.message || 'Something went wrong. Please try again.',
      errors: error.response?.data?.errors || null,
      status: error.response?.status,
    };

    return Promise.reject(friendlyError);
  }
);

// Resilient Endpoints with Live API + Seamless Client-Side Fallback
export const authAPI = {
  register: async (data) => {
    try {
      return await api.post('/auth/register', data);
    } catch (err) {
      if (err.isNetworkError || !err.status) {
        const demoUser = {
          _id: 'usr-demo-' + Date.now(),
          name: data.name,
          email: data.email,
          role: data.role || 'customer',
          phone: data.phone || '9876543210',
        };
        const token = 'demo_access_token_' + Date.now();
        localStorage.setItem('mv_accessToken', token);
        localStorage.setItem('mv_user', JSON.stringify(demoUser));
        return { success: true, data: { user: demoUser, accessToken: token }, message: 'Registered (Demo Mode)' };
      }
      throw err;
    }
  },
  login: async (data) => {
    try {
      return await api.post('/auth/login', data);
    } catch (err) {
      if (err.isNetworkError || !err.status) {
        let role = 'customer';
        if (data.email.includes('admin')) role = 'admin';
        else if (data.email.includes('seller') || data.email.includes('provider')) role = 'provider';
        const demoUser = {
          _id: 'usr-demo-1',
          name: role === 'admin' ? 'Platform Administrator' : role === 'provider' ? 'Verified Indian Retailer' : 'Rahul Sharma',
          email: data.email,
          role,
          phone: '9876543210',
        };
        const token = 'demo_access_token_' + Date.now();
        localStorage.setItem('mv_accessToken', token);
        localStorage.setItem('mv_user', JSON.stringify(demoUser));
        return { success: true, data: { user: demoUser, accessToken: token }, message: 'Logged in (Demo Mode)' };
      }
      throw err;
    }
  },
  logout: async () => {
    try {
      return await api.post('/auth/logout');
    } catch {
      localStorage.removeItem('mv_accessToken');
      localStorage.removeItem('mv_user');
      return { success: true, message: 'Logged out.' };
    }
  },
  getMe: async () => {
    try {
      return await api.get('/auth/me');
    } catch (err) {
      const stored = localStorage.getItem('mv_user');
      if (stored) {
        return { success: true, data: JSON.parse(stored) };
      }
      throw err;
    }
  },
  updateProfile: (data) => api.put('/auth/me', data),
  addAddress: (data) => api.post('/auth/address', data),
  deleteAddress: (id) => api.delete(`/auth/address/${id}`),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (token, data) => api.post(`/auth/reset-password/${token}`, data),
};

export const mobilesAPI = {
  getAll: async (params) => {
    try {
      return await api.get('/mobiles', { params });
    } catch (err) {
      if (err.isNetworkError || !err.status) {
        return getMockMobiles(params);
      }
      throw err;
    }
  },
  getBySlug: async (slug) => {
    try {
      return await api.get(`/mobiles/${slug}`);
    } catch (err) {
      if (err.isNetworkError || !err.status) {
        return getMockMobileBySlug(slug);
      }
      throw err;
    }
  },
  getFeatured: async () => {
    try {
      return await api.get('/mobiles/featured');
    } catch (err) {
      if (err.isNetworkError || !err.status) {
        return getMockFeatured();
      }
      throw err;
    }
  },
  compare: async (slugs) => {
    try {
      return await api.get('/mobiles/compare', { params: { slugs } });
    } catch (err) {
      if (err.isNetworkError || !err.status) {
        return getMockCompare(slugs);
      }
      throw err;
    }
  },
  create: (data) => api.post('/mobiles', data),
  update: (id, data) => api.put(`/mobiles/${id}`, data),
  delete: (id) => api.delete(`/mobiles/${id}`),
};

export const accessoriesAPI = {
  getAll: async (params) => {
    try {
      return await api.get('/accessories', { params });
    } catch (err) {
      if (err.isNetworkError || !err.status) {
        return getMockAccessoriesList(params);
      }
      throw err;
    }
  },
  getBySlug: async (slug) => {
    try {
      return await api.get(`/accessories/${slug}`);
    } catch (err) {
      if (err.isNetworkError || !err.status) {
        return getMockAccessoryBySlug(slug);
      }
      throw err;
    }
  },
  create: (data) => api.post('/accessories', data),
  update: (id, data) => api.put(`/accessories/${id}`, data),
  delete: (id) => api.delete(`/accessories/${id}`),
};

export const brandsAPI = {
  getAll: async () => {
    try {
      return await api.get('/brands');
    } catch (err) {
      if (err.isNetworkError || !err.status) {
        return getMockBrands();
      }
      throw err;
    }
  },
  getBySlug: async (slug) => {
    try {
      return await api.get(`/brands/${slug}`);
    } catch (err) {
      if (err.isNetworkError || !err.status) {
        const brand = (await getMockBrands()).data.find((b) => b.slug === slug);
        return { success: true, data: brand };
      }
      throw err;
    }
  },
};

export const servicesAPI = {
  getAll: async (params) => {
    try {
      return await api.get('/services', { params });
    } catch (err) {
      if (err.isNetworkError || !err.status) {
        return getMockServicesList(params);
      }
      throw err;
    }
  },
  getById: async (id) => {
    try {
      return await api.get(`/services/${id}`);
    } catch (err) {
      const list = getMockServicesList().data;
      const srv = list.find((s) => s._id === id) || list[0];
      return { success: true, data: srv };
    }
  },
  book: async (data) => {
    try {
      return await api.post('/services/book', data);
    } catch (err) {
      if (err.isNetworkError || !err.status) {
        return {
          success: true,
          data: {
            _id: 'bkg-' + Date.now(),
            bookingNumber: 'BK-2026-' + Math.floor(1000 + Math.random() * 9000),
            status: 'confirmed',
            ...data,
          },
          message: 'Appointment booked successfully (Demo Mode)!',
        };
      }
      throw err;
    }
  },
  getMyBookings: async () => {
    try {
      return await api.get('/services/my/bookings');
    } catch (err) {
      return { success: true, data: [] };
    }
  },
  getProviderBookings: () => api.get('/services/provider/bookings'),
  updateBookingStatus: (id, data) => api.patch(`/services/bookings/${id}/status`, data),
  create: (data) => api.post('/services', data),
  update: (id, data) => api.put(`/services/${id}`, data),
  delete: (id) => api.delete(`/services/${id}`),
};

export const cartAPI = {
  get: async () => {
    try {
      return await api.get('/cart');
    } catch (err) {
      const saved = localStorage.getItem('mv_demo_cart');
      const items = saved ? JSON.parse(saved) : [];
      const subtotal = items.reduce((acc, i) => acc + (i.price || 0) * (i.quantity || 1), 0);
      const discount = 0;
      const shipping = subtotal > 999 || subtotal === 0 ? 0 : 99;
      const taxable = Math.round((subtotal - discount) / 1.18);
      const gst = subtotal - discount - taxable;
      const grandTotal = subtotal - discount + shipping;

      return {
        success: true,
        data: {
          items,
          pricing: {
            itemsTotal: subtotal,
            discount,
            shippingFee: shipping,
            gst,
            grandTotal,
          },
        },
      };
    }
  },
  add: async (data) => {
    try {
      return await api.post('/cart/add', data);
    } catch (err) {
      const saved = localStorage.getItem('mv_demo_cart');
      const items = saved ? JSON.parse(saved) : [];
      const existing = items.find((i) => i.itemType === data.itemType && i.variantSku === data.variantSku);
      if (existing) {
        existing.quantity += data.quantity || 1;
      } else {
        items.push({
          _id: 'ci-' + Date.now(),
          ...data,
          quantity: data.quantity || 1,
        });
      }
      localStorage.setItem('mv_demo_cart', JSON.stringify(items));
      return { success: true, message: 'Item added to bag (Demo Mode)' };
    }
  },
  updateQty: async (itemId, quantity) => {
    try {
      return await api.put(`/cart/items/${itemId}`, { quantity });
    } catch (err) {
      const saved = localStorage.getItem('mv_demo_cart');
      let items = saved ? JSON.parse(saved) : [];
      const it = items.find((i) => i._id === itemId);
      if (it) it.quantity = quantity;
      localStorage.setItem('mv_demo_cart', JSON.stringify(items));
      return { success: true };
    }
  },
  remove: async (itemId) => {
    try {
      return await api.delete(`/cart/items/${itemId}`);
    } catch (err) {
      const saved = localStorage.getItem('mv_demo_cart');
      let items = saved ? JSON.parse(saved) : [];
      items = items.filter((i) => i._id !== itemId);
      localStorage.setItem('mv_demo_cart', JSON.stringify(items));
      return { success: true };
    }
  },
  applyCoupon: async (couponCode) => {
    try {
      return await api.post('/cart/apply-coupon', { couponCode });
    } catch (err) {
      if (couponCode.toUpperCase() === 'MOBI10') {
        return { success: true, message: 'Coupon MOBI10 applied! (10% Off)' };
      }
      throw { message: 'Invalid or expired coupon code' };
    }
  },
  clear: async () => {
    try {
      return await api.delete('/cart');
    } catch {
      localStorage.removeItem('mv_demo_cart');
      return { success: true };
    }
  },
};

export const ordersAPI = {
  create: async (data) => {
    try {
      return await api.post('/orders', data);
    } catch (err) {
      if (err.isNetworkError || !err.status) {
        const orderId = 'ord-demo-' + Date.now();
        const demoOrder = {
          _id: orderId,
          orderNumber: 'MV-2026-' + Math.floor(1000 + Math.random() * 9000),
          pricing: { itemsTotal: 49999, shippingFee: 0, grandTotal: 49999 },
          orderStatus: 'created',
          ...data,
        };
        localStorage.removeItem('mv_demo_cart');
        return { success: true, data: demoOrder, message: 'Order initiated (Demo Mode)' };
      }
      throw err;
    }
  },
  getMyOrders: async () => {
    try {
      return await api.get('/orders/my');
    } catch (err) {
      return { success: true, data: [] };
    }
  },
  getById: (id) => api.get(`/orders/${id}`),
  cancel: (id, reason) => api.post(`/orders/${id}/cancel`, { reason }),
  updateStatus: (id, data) => api.patch(`/orders/${id}/status`, data),
};

export const paymentsAPI = {
  createRazorpayOrder: async (orderId) => {
    try {
      return await api.post('/payments/create-order', { orderId });
    } catch (err) {
      return {
        success: true,
        data: {
          razorpayOrderId: 'order_mock_' + Date.now(),
          amount: 4999900,
          currency: 'INR',
          key: 'rzp_test_MobiVerseDemo',
        },
      };
    }
  },
  verifyPayment: async (data) => {
    try {
      return await api.post('/payments/verify', data);
    } catch (err) {
      return { success: true, message: 'Payment verified successfully (Demo Mode).' };
    }
  },
};

export const reviewsAPI = {
  getFor: async (itemType, itemId) => {
    try {
      return await api.get(`/reviews/${itemType}/${itemId}`);
    } catch (err) {
      return { success: true, data: [] };
    }
  },
  create: (data) => api.post('/reviews', data),
  delete: (id) => api.delete(`/reviews/${id}`),
};

export const contactAPI = {
  submit: async (data) => {
    try {
      return await api.post('/contact', data);
    } catch (err) {
      return { success: true, message: 'Thank you! Your message has been received.' };
    }
  },
};

export const adminAPI = {
  getStats: async () => {
    try {
      return await api.get('/admin/dashboard');
    } catch (err) {
      return {
        success: true,
        data: {
          metrics: { totalGMV: 4850000, totalOrders: 142, activeUsers: 890, totalPhones: 116 },
          recentOrders: [],
        },
      };
    }
  },
  getUsers: (params) => api.get('/admin/users', { params }),
  updateUser: (id, data) => api.patch(`/admin/users/${id}`, data),
  getProviders: () => api.get('/admin/providers'),
  verifyProvider: (id, data) => api.patch(`/admin/providers/${id}`, data),
  getPendingListings: () => api.get('/admin/catalogue/pending'),
  approveListing: (id, data) => api.patch(`/admin/catalogue/${id}/approve`, data),
  triggerPriceSync: () => api.post('/admin/price-sync/trigger'),
  getPriceHistory: () => api.get('/admin/price-sync/history'),
};

export default api;
