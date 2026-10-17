import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 20000,
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
    if (error.response.status === 401 && !originalRequest._retry && !originalRequest.url.includes('/auth/login')) {
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

// Endpoints definitions
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/me', data),
  addAddress: (data) => api.post('/auth/address', data),
  deleteAddress: (id) => api.delete(`/auth/address/${id}`),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (token, data) => api.post(`/auth/reset-password/${token}`, data),
};

export const mobilesAPI = {
  getAll: (params) => api.get('/mobiles', { params }),
  getBySlug: (slug) => api.get(`/mobiles/${slug}`),
  getFeatured: () => api.get('/mobiles/featured'),
  compare: (slugs) => api.get('/mobiles/compare', { params: { slugs } }),
  create: (data) => api.post('/mobiles', data),
  update: (id, data) => api.put(`/mobiles/${id}`, data),
  delete: (id) => api.delete(`/mobiles/${id}`),
};

export const accessoriesAPI = {
  getAll: (params) => api.get('/accessories', { params }),
  getBySlug: (slug) => api.get(`/accessories/${slug}`),
  create: (data) => api.post('/accessories', data),
  update: (id, data) => api.put(`/accessories/${id}`, data),
  delete: (id) => api.delete(`/accessories/${id}`),
};

export const brandsAPI = {
  getAll: () => api.get('/brands'),
  getBySlug: (slug) => api.get(`/brands/${slug}`),
};

export const servicesAPI = {
  getAll: (params) => api.get('/services', { params }),
  getById: (id) => api.get(`/services/${id}`),
  book: (data) => api.post('/services/book', data),
  getMyBookings: () => api.get('/services/my/bookings'),
  getProviderBookings: () => api.get('/services/provider/bookings'),
  updateBookingStatus: (id, data) => api.patch(`/services/bookings/${id}/status`, data),
  create: (data) => api.post('/services', data),
  update: (id, data) => api.put(`/services/${id}`, data),
  delete: (id) => api.delete(`/services/${id}`),
};

export const cartAPI = {
  get: () => api.get('/cart'),
  add: (data) => api.post('/cart/add', data),
  updateQty: (itemId, quantity) => api.put(`/cart/items/${itemId}`, { quantity }),
  remove: (itemId) => api.delete(`/cart/items/${itemId}`),
  applyCoupon: (couponCode) => api.post('/cart/apply-coupon', { couponCode }),
  clear: () => api.delete('/cart'),
};

export const ordersAPI = {
  create: (data) => api.post('/orders', data),
  getMyOrders: () => api.get('/orders/my'),
  getById: (id) => api.get(`/orders/${id}`),
  cancel: (id, reason) => api.post(`/orders/${id}/cancel`, { reason }),
  updateStatus: (id, data) => api.patch(`/orders/${id}/status`, data),
};

export const paymentsAPI = {
  createRazorpayOrder: (orderId) => api.post('/payments/create-order', { orderId }),
  verifyPayment: (data) => api.post('/payments/verify', data),
};

export const reviewsAPI = {
  getFor: (itemType, itemId) => api.get(`/reviews/${itemType}/${itemId}`),
  create: (data) => api.post('/reviews', data),
  delete: (id) => api.delete(`/reviews/${id}`),
};

export const contactAPI = {
  submit: (data) => api.post('/contact', data),
};

export const adminAPI = {
  getStats: () => api.get('/admin/dashboard'),
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
