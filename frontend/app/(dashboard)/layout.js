// -*- coding: utf-8 -*-
// File: layout.js
// Created: 2026-03-30
// Author: zhuimeng
// Description: Dashboard 布局

import Sidebar from '@/components/Sidebar';
import { AuthProvider } from '@/contexts/AuthContext';
import { ToastProvider } from '@/components/Toast';
import ProtectedRoute from '@/components/ProtectedRoute';

export const metadata = {
  title: { default: 'LabFlow', template: '%s | LabFlow' },
  description: '实验室管理系统',
};

export default function DashboardLayout({ children }) {
  return (
    <AuthProvider>
      <ToastProvider>
        <ProtectedRoute>
          <div className="min-h-screen bg-gray-50">
            <Sidebar />
            <main className="lg:ml-64 min-h-screen">
              {children}
            </main>
          </div>
        </ProtectedRoute>
      </ToastProvider>
    </AuthProvider>
  );
}
