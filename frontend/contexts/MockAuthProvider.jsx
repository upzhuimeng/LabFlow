// -*- coding: utf-8 -*-
// File: MockAuthProvider.jsx
// Created: 2026-03-30
// Author: zhuimeng
// Description: Mock AuthProvider 用于预览

'use client';

import React from 'react';
import { MOCK_USER } from '@/lib/mockData';

export const MockAuthContext = React.createContext(null);

export function MockAuthProvider({ children }) {
  const user = MOCK_USER;
  const isAdmin = true;
  const isLabManager = false;
  const isTagManager = false;

  const logout = () => {
    console.log('Mock logout');
  };

  return (
    <MockAuthContext.Provider
      value={{
        user,
        token: 'mock-token',
        loading: false,
        error: null,
        login: async () => {},
        register: async () => {},
        logout,
        getToken: () => 'mock-token',
        isAuthenticated: true,
        isAdmin,
        isLabManager,
        isTagManager,
        hasPermission: () => true,
      }}
    >
      {children}
    </MockAuthContext.Provider>
  );
}

export function useMockAuth() {
  const context = React.useContext(MockAuthContext);
  if (!context) {
    throw new Error('useMockAuth must be used within a MockAuthProvider');
  }
  return context;
}
