// -*- coding: utf-8 -*-
// File: AuthContext.jsx
// Created: 2026-03-29
// Author: zhuimeng
// Description: 认证状态管理 Context

'use client';

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import config from '@/config';
import { ROLE, PERMISSION } from '@/lib/constants';

const AuthContext = createContext();

const checkPermissions = {
  isAdmin: (user) => {
    if (!user) return false;
    return user.role === ROLE.SUPER_ADMIN || user.role === ROLE.ADMIN;
  },

  isLabManager: (user) => {
    if (!user) return false;
    return user.role === ROLE.SUPER_ADMIN || user.role === ROLE.ADMIN;
  },

  isTagManager: (user) => {
    if (!user) return false;
    return user.role === ROLE.SUPER_ADMIN || user.role === ROLE.ADMIN;
  },

  hasPermission: (user, permission) => {
    if (!user) return false;
    
    if (checkPermissions.isAdmin(user)) return true;

    switch (permission) {
      case PERMISSION.CAN_VIEW_INSTRUMENT:
      case PERMISSION.CAN_VIEW_LAB:
        return true;
      case PERMISSION.CAN_CREATE_INSTRUMENT:
      case PERMISSION.CAN_EDIT_INSTRUMENT:
      case PERMISSION.CAN_DELETE_INSTRUMENT:
      case PERMISSION.CAN_CREATE_LAB:
      case PERMISSION.CAN_EDIT_LAB:
      case PERMISSION.CAN_DELETE_LAB:
      case PERMISSION.CAN_MANAGE_USER:
        return false;
      case PERMISSION.CAN_CREATE_RESERVATION:
        return true;
      case PERMISSION.CAN_APPROVE_RESERVATION:
        return checkPermissions.isLabManager(user) || checkPermissions.isTagManager(user);
      default:
        return false;
    }
  },
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user');
      const storedToken = localStorage.getItem('access_token');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
      if (storedToken) {
        setToken(storedToken);
      }
    }
    setLoading(false);
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch(`${config.API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
    } catch (err) {
      console.error('登出请求失败:', err);
    } finally {
      setUser(null);
      setToken(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
      }
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        logout,
        isAuthenticated: !!user,
        isAdmin: checkPermissions.isAdmin(user),
        isLabManager: checkPermissions.isLabManager(user),
        isTagManager: checkPermissions.isTagManager(user),
        hasPermission: (permission) => checkPermissions.hasPermission(user, permission),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
