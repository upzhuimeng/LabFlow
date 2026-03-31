// -*- coding: utf-8 -*-
// File: AuthContext.jsx
// Created: 2026-03-29
// Author: zhuimeng
// Description: 认证状态管理 Context

'use client';

import { createContext, useContext, useState, useCallback } from 'react';
import config from '@/config';
import { ROLE, PERMISSION } from '@/lib/constants';

const AuthContext = createContext();

/**
 * 权限检查函数集合
 * 根据用户角色判断权限
 * 
 * 注意: 实验室管理员和标签管理员的判断需要后端 API 支持
 * 当前仅基于 user.role 进行基础判断
 */
const checkPermissions = {
  // 是否为管理员（超级管理员或普通管理员）
  isAdmin: (user) => {
    if (!user) return false;
    return user.role === ROLE.SUPER_ADMIN || user.role === ROLE.ADMIN;
  },

  // 是否为实验室管理员（需后端 API 返回 lab_user 关联数据）
  isLabManager: (user) => {
    if (!user) return false;
    // TODO: 后续通过 /users/me API 返回 is_lab_manager 字段判断
    // 临时方案: 管理员角色也可访问
    return user.role === ROLE.SUPER_ADMIN || user.role === ROLE.ADMIN;
  },

  // 是否为标签管理员（需后端 API 返回 tag_user 关联数据）
  isTagManager: (user) => {
    if (!user) return false;
    // TODO: 后续通过 /users/me API 返回 is_tag_manager 字段判断
    // 临时方案: 管理员角色也可访问
    return user.role === ROLE.SUPER_ADMIN || user.role === ROLE.ADMIN;
  },

  // 检查用户是否拥有特定权限
  hasPermission: (user, permission) => {
    if (!user) return false;
    
    // 管理员拥有所有权限
    if (checkPermissions.isAdmin(user)) return true;

    // 根据权限类型判断
    switch (permission) {
      case PERMISSION.CAN_VIEW_INSTRUMENT:
      case PERMISSION.CAN_VIEW_LAB:
        // 所有登录用户都可查看
        return true;

      case PERMISSION.CAN_CREATE_INSTRUMENT:
      case PERMISSION.CAN_EDIT_INSTRUMENT:
      case PERMISSION.CAN_DELETE_INSTRUMENT:
      case PERMISSION.CAN_CREATE_LAB:
      case PERMISSION.CAN_EDIT_LAB:
      case PERMISSION.CAN_DELETE_LAB:
      case PERMISSION.CAN_MANAGE_USER:
        // 仅管理员可操作
        return false;

      case PERMISSION.CAN_CREATE_RESERVATION:
        // 所有登录用户都可创建预约
        return true;

      case PERMISSION.CAN_APPROVE_RESERVATION:
        // 管理员或实验室/标签管理员可审批
        return checkPermissions.isLabManager(user) || checkPermissions.isTagManager(user);

      default:
        return false;
    }
  },
};

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const login = useCallback(async (username, password) => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${config.API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ username, password }),
            });
            const data = await res.json();
            if (data.code !== 200) {
                throw new Error(data.message || '登录失败');
            }
            setUser(data.data.user);
            setToken(data.data.access_token);
            if (typeof window !== 'undefined') {
                localStorage.setItem(config.TOKEN_KEY, data.data.access_token);
            }
            return data.data;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const register = useCallback(async (userData) => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${config.API_BASE_URL}/users`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(userData),
            });
            const data = await res.json();
            if (data.code !== 200) {
                throw new Error(data.message || '注册失败');
            }
            return data.data;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const logout = useCallback(async () => {
        setLoading(true);
        try {
            if (token) {
                await fetch(`${config.API_BASE_URL}/auth/logout`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    credentials: 'include',
                });
            }
        } catch (err) {
            console.error('登出请求失败:', err);
        } finally {
            setUser(null);
            setToken(null);
            if (typeof window !== 'undefined') {
                localStorage.removeItem(config.TOKEN_KEY);
            }
            setLoading(false);
        }
    }, [token]);

    const getToken = useCallback(() => {
        if (token) return token;
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem(config.TOKEN_KEY);
            if (stored) setToken(stored);
            return stored;
        }
        return null;
    }, [token]);

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                loading,
                error,
                login,
                register,
                logout,
                getToken,
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
