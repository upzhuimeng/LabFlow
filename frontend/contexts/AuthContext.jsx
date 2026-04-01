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

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLabManager, setIsLabManager] = useState(false);
  const [isTagManager, setIsTagManager] = useState(false);

  const fetchPermissions = useCallback(async () => {
    try {
      const res = await fetch(`${config.API_BASE_URL}/users/me/permissions`, {
        credentials: 'include',
      });
      const data = await res.json();
      if (data.code === 200) {
        setIsLabManager(data.data.is_lab_manager);
        setIsTagManager(data.data.is_tag_manager);
        localStorage.setItem('permissions', JSON.stringify({
          is_lab_manager: data.data.is_lab_manager,
          is_tag_manager: data.data.is_tag_manager,
        }));
      }
    } catch (err) {
      console.error('获取权限失败:', err);
    }
  }, []);

  const isAdmin = user && (user.role === ROLE.SUPER_ADMIN || user.role === ROLE.ADMIN);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user');
      const storedToken = localStorage.getItem('access_token');
      const storedPermissions = localStorage.getItem('permissions');
      
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
      if (storedToken) {
        setToken(storedToken);
      }
      if (storedPermissions) {
        const perms = JSON.parse(storedPermissions);
        setIsLabManager(perms.is_lab_manager);
        setIsTagManager(perms.is_tag_manager);
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (user) {
      fetchPermissions();
    }
  }, [user, fetchPermissions]);

  const logout = useCallback(async (shouldRedirect = true) => {
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
      setIsLabManager(false);
      setIsTagManager(false);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        localStorage.removeItem('permissions');
        if (shouldRedirect) {
          window.location.href = '/user/login';
        }
      }
    }
  }, []);

  useEffect(() => {
    const handleAuthExpired = () => {
      logout(false);
      if (typeof window !== 'undefined') {
        window.location.href = '/user/login';
      }
    };
    window.addEventListener('auth:expired', handleAuthExpired);
    return () => window.removeEventListener('auth:expired', handleAuthExpired);
  }, [logout]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        logout,
        isAuthenticated: !!user,
        isAdmin,
        isLabManager,
        isTagManager,
        hasPermission: (permission) => {
          if (!user) return false;
          if (isAdmin) return true;

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
              return isLabManager || isTagManager;
            default:
              return false;
          }
        },
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
