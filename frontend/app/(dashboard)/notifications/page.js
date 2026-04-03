// -*- coding: utf-8 -*-
// File: page.js
// Description: 通知列表页面

'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { NOTIFICATION_TYPE_TEXT } from '@/lib/constants';
import { formatDateTime } from '@/lib/utils';
import { useToast } from '@/components/Toast';

const NOTIFICATION_TYPE_CLASS = {
  1: 'bg-blue-100 text-blue-700',
  2: 'bg-yellow-100 text-yellow-700',
  3: 'bg-gray-100 text-gray-700',
  4: 'bg-purple-100 text-purple-700',
  5: 'bg-indigo-100 text-indigo-700',
};

export default function NotificationsPage() {
  const router = useRouter();
  const toast = useToast();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 0,
  });
  const [filter, setFilter] = useState('all');

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        page_size: pagination.pageSize,
      };
      const res = await api.get('/notifications', { params });
      let items = res.data?.items || [];
      
      if (filter === 'unread') {
        items = items.filter(n => n.is_read === 0);
      }
      
      setNotifications(items);
      setPagination(prev => ({
        ...prev,
        total: res.data?.pagination?.total || items.length,
        totalPages: res.data?.pagination?.total_pages || 1,
      }));
    } catch (err) {
      toast.error(err.message || '获取通知失败');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.pageSize, filter]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAsRead = async (notificationId) => {
    try {
      await api.put(`/notifications/${notificationId}/read`);
      fetchNotifications();
      toast.success('已标记为已读');
      window.dispatchEvent(new Event('notification:refresh'));
    } catch (err) {
      toast.error(err.message || '操作失败');
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      await api.delete(`/notifications/${notificationId}`);
      fetchNotifications();
      toast.success('通知已删除');
      window.dispatchEvent(new Event('notification:refresh'));
    } catch (err) {
      toast.error(err.message || '删除失败');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      fetchNotifications();
      toast.success('已全部标记为已读');
      window.dispatchEvent(new Event('notification:refresh'));
    } catch (err) {
      toast.error(err.message || '操作失败');
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };

  return (
    <div className="p-4 lg:p-6 min-h-[calc(100vh-80px)]">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">通知</h1>
        <button
          onClick={handleMarkAllRead}
          className="px-4 py-2 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
        >
          全部标为已读
        </button>
      </div>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => { setFilter('all'); setPagination(prev => ({ ...prev, page: 1 })); }}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'all'
              ? 'bg-blue-100 text-blue-700'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          全部
        </button>
        <button
          onClick={() => { setFilter('unread'); setPagination(prev => ({ ...prev, page: 1 })); }}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'unread'
              ? 'bg-blue-100 text-blue-700'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          未读
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        {loading ? (
          <div className="p-8 text-center text-gray-500">加载中...</div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {filter === 'unread' ? '暂无未读通知' : '暂无通知'}
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                  notification.is_read === 0 ? 'bg-blue-50/30' : ''
                }`}
                onClick={() => router.push(`/notifications/${notification.id}`)}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        NOTIFICATION_TYPE_CLASS[notification.type] || NOTIFICATION_TYPE_CLASS[3]
                      }`}>
                        {NOTIFICATION_TYPE_TEXT[notification.type] || '系统通知'}
                      </span>
                      <span className="text-xs text-gray-400">
                        {formatDateTime(notification.created_at)}
                      </span>
                    </div>
                    <h3 className="text-base font-medium text-gray-800 mb-1">
                      {notification.title}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {notification.content}
                    </p>
                    <div className="flex gap-3 mt-2">
                      {notification.is_read === 0 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkAsRead(notification.id);
                          }}
                          className="text-xs text-blue-600 hover:text-blue-800"
                        >
                          标为已读
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(notification.id);
                        }}
                        className="text-xs text-gray-400 hover:text-red-600"
                      >
                        删除
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-6">
          <button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
            className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            上一页
          </button>
          <span className="text-sm text-gray-600">
            第 {pagination.page} / {pagination.totalPages} 页
          </span>
          <button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.totalPages}
            className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            下一页
          </button>
        </div>
      )}
    </div>
  );
}
