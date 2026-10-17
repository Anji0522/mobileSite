import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

// Context Providers
import { ThemeProvider } from './context/ThemeContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { CartProvider } from './context/CartContext.jsx';
import { CompareProvider } from './context/CompareContext.jsx';

// Layout & Route Guards
import { MainLayout } from './layouts/MainLayout.jsx';
import { ProtectedRoute, RoleRoute } from './routes/ProtectedRoute.jsx';

// Public Pages
import { HomePage } from './pages/HomePage.jsx';
import { MobilesPage } from './pages/MobilesPage.jsx';
import { MobileDetailPage } from './pages/MobileDetailPage.jsx';
import { AccessoriesPage } from './pages/AccessoriesPage.jsx';
import { AccessoryDetailPage } from './pages/AccessoryDetailPage.jsx';
import { ComparePage } from './pages/ComparePage.jsx';
import { BrandsPage } from './pages/BrandsPage.jsx';
import { ServicesPage } from './pages/ServicesPage.jsx';
import { ContactPage } from './pages/ContactPage.jsx';
import { AboutPage } from './pages/AboutPage.jsx';
import { NotFoundPage } from './pages/NotFoundPage.jsx';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage.jsx';
import { RegisterPage } from './pages/auth/RegisterPage.jsx';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage.jsx';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage.jsx';

// Customer Protected Pages
import { CartPage } from './pages/CartPage.jsx';
import { CheckoutPage } from './pages/CheckoutPage.jsx';
import { OrdersPage } from './pages/OrdersPage.jsx';
import { ProfilePage } from './pages/ProfilePage.jsx';
import { BookingsPage } from './pages/BookingsPage.jsx';

// Provider Protected Pages
import { ProviderDashboardPage } from './pages/provider/ProviderDashboardPage.jsx';

// Admin Protected Pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage.jsx';

function App() {
  return (
    <HelmetProvider>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <CartProvider>
              <CompareProvider>
                <BrowserRouter>
                  <Routes>
                    <Route element={<MainLayout />}>
                      {/* Public Storefront Routes */}
                      <Route path="/" element={<HomePage />} />
                      <Route path="/mobiles" element={<MobilesPage />} />
                      <Route path="/mobiles/:slug" element={<MobileDetailPage />} />
                      <Route path="/accessories" element={<AccessoriesPage />} />
                      <Route path="/accessories/:slug" element={<AccessoryDetailPage />} />
                      <Route path="/compare" element={<ComparePage />} />
                      <Route path="/brands" element={<BrandsPage />} />
                      <Route path="/brands/:brand" element={<BrandsPage />} />
                      <Route path="/services" element={<ServicesPage />} />
                      <Route path="/contact" element={<ContactPage />} />
                      <Route path="/about" element={<AboutPage />} />

                      {/* Authentication Routes */}
                      <Route path="/login" element={<LoginPage />} />
                      <Route path="/register" element={<RegisterPage />} />
                      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                      <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

                      {/* Customer Routes (Protected) */}
                      <Route
                        path="/cart"
                        element={
                          <ProtectedRoute>
                            <CartPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/checkout"
                        element={
                          <ProtectedRoute>
                            <CheckoutPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/orders"
                        element={
                          <ProtectedRoute>
                            <OrdersPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/orders/:id"
                        element={
                          <ProtectedRoute>
                            <OrdersPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/profile"
                        element={
                          <ProtectedRoute>
                            <ProfilePage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/bookings"
                        element={
                          <ProtectedRoute>
                            <BookingsPage />
                          </ProtectedRoute>
                        }
                      />

                      {/* Provider Routes (Protected - Role: provider, admin) */}
                      <Route
                        path="/provider/dashboard"
                        element={
                          <RoleRoute allowedRoles={['provider', 'admin']}>
                            <ProviderDashboardPage />
                          </RoleRoute>
                        }
                      />
                      <Route
                        path="/provider/services"
                        element={
                          <RoleRoute allowedRoles={['provider', 'admin']}>
                            <ProviderDashboardPage />
                          </RoleRoute>
                        }
                      />
                      <Route
                        path="/provider/products"
                        element={
                          <RoleRoute allowedRoles={['provider', 'admin']}>
                            <ProviderDashboardPage />
                          </RoleRoute>
                        }
                      />
                      <Route
                        path="/provider/orders"
                        element={
                          <RoleRoute allowedRoles={['provider', 'admin']}>
                            <ProviderDashboardPage />
                          </RoleRoute>
                        }
                      />
                      <Route
                        path="/provider/profile"
                        element={
                          <RoleRoute allowedRoles={['provider', 'admin']}>
                            <ProviderDashboardPage />
                          </RoleRoute>
                        }
                      />

                      {/* Admin Routes (Protected - Role: admin) */}
                      <Route
                        path="/admin/dashboard"
                        element={
                          <RoleRoute allowedRoles={['admin']}>
                            <AdminDashboardPage />
                          </RoleRoute>
                        }
                      />
                      <Route
                        path="/admin/users"
                        element={
                          <RoleRoute allowedRoles={['admin']}>
                            <AdminDashboardPage />
                          </RoleRoute>
                        }
                      />
                      <Route
                        path="/admin/providers"
                        element={
                          <RoleRoute allowedRoles={['admin']}>
                            <AdminDashboardPage />
                          </RoleRoute>
                        }
                      />
                      <Route
                        path="/admin/catalogue"
                        element={
                          <RoleRoute allowedRoles={['admin']}>
                            <AdminDashboardPage />
                          </RoleRoute>
                        }
                      />
                      <Route
                        path="/admin/orders"
                        element={
                          <RoleRoute allowedRoles={['admin']}>
                            <AdminDashboardPage />
                          </RoleRoute>
                        }
                      />
                      <Route
                        path="/admin/price-sync"
                        element={
                          <RoleRoute allowedRoles={['admin']}>
                            <AdminDashboardPage />
                          </RoleRoute>
                        }
                      />

                      {/* Fallback 404 Route */}
                      <Route path="*" element={<NotFoundPage />} />
                    </Route>
                  </Routes>
                </BrowserRouter>
              </CompareProvider>
            </CartProvider>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </HelmetProvider>
  );
}

export default App;
