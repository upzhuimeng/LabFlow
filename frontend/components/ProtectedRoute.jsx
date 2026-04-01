// -*- coding: utf-8 -*-
// File: ProtectedRoute.jsx
// Description: 路由保护组件 - 未登录用户重定向到登录页

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function ProtectedRoute({ children, requiredAdmin = false }) {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/user/login');
    } else if (!loading && requiredAdmin && user?.role > 1) {
      router.push('/dashboard');
    }
  }, [loading, isAuthenticated, user, requiredAdmin, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-80px)]">
        <div className="text-lg text-gray-600">加载中...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (requiredAdmin && user?.role > 1) {
    return null;
  }

  return children;
}
