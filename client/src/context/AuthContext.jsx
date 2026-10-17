import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api.js';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('mv_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = useCallback(async () => {
    const token = localStorage.getItem('mv_accessToken');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await authAPI.getMe();
      if (res?.data?.user) {
        setUser(res.data.user);
        localStorage.setItem('mv_user', JSON.stringify(res.data.user));
      }
    } catch (err) {
      if (err.isAuthError) {
        localStorage.removeItem('mv_accessToken');
        localStorage.removeItem('mv_user');
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();

    const handleAuthExpired = () => {
      setUser(null);
      localStorage.removeItem('mv_user');
      localStorage.removeItem('mv_accessToken');
    };

    window.addEventListener('mv_auth_expired', handleAuthExpired);
    return () => window.removeEventListener('mv_auth_expired', handleAuthExpired);
  }, [fetchCurrentUser]);

  const login = async (credentials) => {
    const res = await authAPI.login(credentials);
    const { user: userData, accessToken } = res.data;
    localStorage.setItem('mv_accessToken', accessToken);
    localStorage.setItem('mv_user', JSON.stringify(userData));
    setUser(userData);
    return res;
  };

  const register = async (userData) => {
    const res = await authAPI.register(userData);
    const { user: newUser, accessToken } = res.data;
    localStorage.setItem('mv_accessToken', accessToken);
    localStorage.setItem('mv_user', JSON.stringify(newUser));
    setUser(newUser);
    return res;
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch {
      // Continue client cleanup even if network fails
    } finally {
      localStorage.removeItem('mv_accessToken');
      localStorage.removeItem('mv_user');
      setUser(null);
    }
  };

  const updateUserState = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('mv_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || 'guest',
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        isProvider: user?.role === 'provider',
        loading,
        login,
        register,
        logout,
        updateUserState,
        refreshProfile: fetchCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
