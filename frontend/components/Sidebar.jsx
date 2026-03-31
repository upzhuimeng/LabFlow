// -*- coding: utf-8 -*-
// File: Sidebar.jsx
// Created: 2026-03-30
// Author: zhuimeng
// Description: 侧边栏导航组件（根据用户角色动态显示菜单）

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMockAuth } from '@/contexts/MockAuthProvider';
import { ROLE_TEXT } from '@/lib/constants';

/**
 * 导航菜单配置
 * - public: 所有登录用户可见
 * - admin: 管理员可见（设备管理、实验室管理、用户管理）
 * - approval: 审批功能可见（实验室管理员、标签管理员、管理员）
 */
const NAV_ITEMS = {
  public: [
    {
      href: '/dashboard',
      label: '仪表板',
      icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
    },
    {
      href: '/instrument',
      label: '设备管理',
      icon: 'M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z',
    },
    {
      href: '/lab',
      label: '实验室管理',
      icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10',
    },
    {
      href: '/reservation/my',
      label: '我的预约',
      icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
    },
  ],
  admin: [
    {
      href: '/entry',
      label: '信息录入',
      icon: 'M12 4v16m8-8H4',
      badge: '管理员',
    },
    {
      href: '/reservation/approve',
      label: '审批预约',
      icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
    },
    {
      href: '/users',
      label: '用户管理',
      icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
    },
  ],
};

/**
 * 获取用户角色显示名称
 */
function getRoleDisplayName(role) {
  return ROLE_TEXT[role] || '未知角色';
}

/**
 * 获取用户头像文字
 */
function getAvatarText(user) {
  if (!user) return '?';
  return user.name?.charAt(0).toUpperCase() || '?';
}

export default function Sidebar() {
  const pathname = usePathname();
  const { user, isAdmin, isLabManager, isTagManager, logout } = useMockAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard' || pathname === '/';
    }
    if (href === '/reservation/my') {
      return pathname.startsWith('/reservation/my');
    }
    if (href === '/reservation/approve') {
      return pathname.startsWith('/reservation/approve');
    }
    return pathname.startsWith(href);
  };

  const showAdminMenu = isAdmin || isLabManager || isTagManager;

  return (
    <>
      {/* 移动端汉堡菜单按钮 */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-100"
      >
        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {mobileOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* 移动端遮罩层 */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* 侧边栏主体 */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 flex flex-col z-40 transition-transform duration-300 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-4 pt-16 lg:pt-4 flex-1 overflow-y-auto">
          {/* Logo 区域 */}
          <div className="mb-8">
            <h1 className="text-xl font-bold text-blue-600">LabFlow</h1>
            <p className="text-gray-500 text-sm">实验室管理系统</p>
          </div>

          {/* 基础菜单（所有用户可见） */}
          <nav className="space-y-1 mb-6">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2 px-3">
              导航
            </p>
            {NAV_ITEMS.public.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center p-3 rounded-lg transition-colors ${
                  isActive(item.href)
                    ? 'bg-blue-50 text-blue-600 font-medium'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                </svg>
                <span className="ml-3 text-sm">{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* 管理菜单（管理员/审批者可见） */}
          {showAdminMenu && (
            <nav className="space-y-1 mb-6">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2 px-3">
                管理
              </p>
              {NAV_ITEMS.admin.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                    isActive(item.href)
                      ? 'bg-blue-50 text-blue-600 font-medium'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center">
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                    </svg>
                    <span className="ml-3 text-sm">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-600 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              ))}
            </nav>
          )}
        </div>

        {/* 用户信息区域 */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {/* 用户头像 */}
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium">
                {getAvatarText(user)}
              </div>
              {/* 用户信息 */}
              <div className="text-sm">
                <p className="text-gray-800 font-medium">
                  {user?.name || '未登录'}
                </p>
                <p className="text-gray-500 text-xs">
                  {getRoleDisplayName(user?.role)}
                </p>
              </div>
            </div>
            {/* 退出登录按钮 */}
            <button
              onClick={logout}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="退出登录"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
