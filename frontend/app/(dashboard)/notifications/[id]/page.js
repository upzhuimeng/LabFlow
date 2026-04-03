// -*- coding: utf-8 -*-
// File: page.js
// Description: 通知详情页

'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { NOTIFICATION_TYPE_TEXT } from '@/lib/constants';
import { formatDateTime } from '@/lib/utils';
import { useToast } from '@/components/Toast';

const NOTIFICATION_TYPE_CLASS = {
  1: 'bg-blue-100 text-blue-700',
  2: 'bg-yellow-100 text-yellow-700',
  3: 'bg-gray-100 text-gray-700',
};

export default function NotificationDetailPage() {
  const { id } = useParams();
  const toast = useToast();
  const toastRef = useRef(toast);
  toastRef.current = toast;
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [marking, setMarking] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/notifications/${id}`);
        if (!cancelled) {
          setNotification(res.data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
          toastRef.current.error(err.message || '获取通知详情失败');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };
    fetchDetail();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleMarkAsRead = async () => {
    if (!notification || notification.is_read === 1) return;
    setMarking(true);
    try {
      await api.put(`/notifications/${notification.id}/read`);
      setNotification(prev => ({ ...prev, is_read: 1 }));
      toast.success('已标记为已读');
      window.dispatchEvent(new Event('notification:refresh'));
    } catch (err) {
      toast.error(err.message || '操作失败');
    } finally {
      setMarking(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[calc(100vh-80px)]">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  if (error || !notification) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[calc(100vh-80px)]">
        <div className="text-red-500 mb-4">{error || '通知不存在'}</div>
        <Link href="/notifications" className="text-blue-600 hover:text-blue-800">
          返回通知列表
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 min-h-[calc(100vh-80px)]">
      <div className="mb-6">
        <Link
          href="/notifications"
          className="inline-flex items-center text-gray-600 hover:text-gray-800 transition-colors"
        >
          <span className="mr-1">←</span>
          <span>返回通知列表</span>
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                NOTIFICATION_TYPE_CLASS[notification.type] ||
                NOTIFICATION_TYPE_CLASS[3]
              }`}
            >
              {NOTIFICATION_TYPE_TEXT[notification.type] || '系统通知'}
            </span>
            <span className="text-sm text-gray-400">
              {formatDateTime(notification.created_at)}
            </span>
            {notification.is_read === 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                未读
              </span>
            )}
          </div>
          <h1 className="text-xl lg:text-2xl font-bold text-gray-800">
            {notification.title}
          </h1>
        </div>

        <div className="p-6">
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
              {notification.content}
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100 flex justify-between items-center">
            <div className="text-sm text-gray-400">
              收到时间：{formatDateTime(notification.created_at)}
            </div>
            {notification.is_read === 0 && (
              <button
                onClick={handleMarkAsRead}
                disabled={marking}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {marking ? '标记中...' : '标为已读'}
              </button>
            )}
          </div>
        </div>

        <div className="border-t border-gray-100 p-6 bg-gray-50/50">
          <h3 className="text-sm font-medium text-gray-700 mb-3">附件</h3>
          <div className="min-h-[100px] border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center text-gray-400 text-sm">
            暂无附件
          </div>
        </div>
      </div>
    </div>
  );
}
