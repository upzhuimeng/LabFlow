// -*- coding: utf-8 -*-
// File: layout.js
// Created: 2026-03-30
// Author: zhuimeng
// Description: Dashboard 布局

import './globals.css';
import Sidebar from '@/components/Sidebar';
import { MockAuthProvider } from '@/contexts/MockAuthProvider';

export const metadata = {
  title: { default: 'LabFlow', template: '%s | LabFlow' },
  description: '实验室管理系统',
};

export default function DashboardLayout({ children }) {
  return (
    <MockAuthProvider>
      <div className="min-h-screen bg-gray-50">
        <Sidebar />
        <main className="lg:ml-64 min-h-screen">
          {children}
        </main>
      </div>
    </MockAuthProvider>
  );
}
