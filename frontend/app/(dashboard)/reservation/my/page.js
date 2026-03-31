// -*- coding: utf-8 -*-
// File: page.js
// Created: 2026-03-30
// Author: zhuimeng
// Description: 我的预约页面

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { STATUS_TEXT } from '@/lib/constants';
import api from '@/lib/api';
import { formatDate } from '@/lib/utils';

const STATUS_BADGE_CLASS = {
  0: 'bg-blue-100 text-blue-700',
  1: 'bg-green-100 text-green-700',
  2: 'bg-red-100 text-red-700',
  3: 'bg-gray-100 text-gray-700',
};

export default function MyReservationsPage() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
  });

  const fetchReservations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page: pagination.page, page_size: pagination.pageSize };
      if (filter !== 'all') params.status = parseInt(filter);

      const res = await api.get('/reservations', { params });
      const data = res.data;
      setReservations(data.items || []);
      setPagination(prev => ({
        ...prev,
        total: data.pagination?.total || 0,
        totalPages: data.pagination?.total_pages || 0,
      }));
    } catch (err) {
      setError(err.message || '获取数据失败');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.pageSize, filter]);

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  const filteredReservations = filter === 'all'
    ? reservations
    : reservations.filter(r => r.status === parseInt(filter));

  const getStatusBadge = (status) => {
    const s = status ?? 0;
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_BADGE_CLASS[s] || STATUS_BADGE_CLASS[0]}`}>
        {STATUS_TEXT.RESERVATION[s] || '未知'}
      </span>
    );
  };

  const getApprovalLevelText = (currentLevel) => {
    switch (currentLevel) {
      case 0: return '未申请';
      case 1: return '一级审批中';
      case 2: return '二级审批中';
      case 3: return '已通过';
      default: return '未知';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-80px)]">
        <div className="text-gray-600">加载中...</div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 min-h-[calc(100vh-80px)]">
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">我的预约</h1>
      </div>

      <div className="mb-4 flex items-center space-x-2">
        <span className="text-sm text-gray-600">筛选：</span>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
          <option value="all">全部</option>
          <option value="0">审批中</option>
          <option value="1">已通过</option>
          <option value="2">已拒绝</option>
          <option value="3">已取消</option>
        </select>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredReservations.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center text-gray-500">
            暂无预约记录
          </div>
        ) : (
          filteredReservations.map((reservation) => (
            <div
              key={reservation.id}
              className="border border-gray-200 rounded-lg shadow-sm p-4 hover:shadow-lg hover:-translate-y-1.5 transition-all duration-300"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h2 className="text-lg font-semibold text-blue-600">{reservation.instrument_name}</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    预约人：{reservation.user_name}
                  </p>
                </div>
                {getStatusBadge(reservation.status)}
              </div>

              <div className="space-y-1 text-sm text-gray-700">
                <p>
                  <span className="font-medium">预约时间：</span>
                  {formatDate(reservation.start_time)} ~ {formatDate(reservation.end_time)}
                </p>
                <p>
                  <span className="font-medium">用途：</span>
                  {reservation.purpose || '-'}
                </p>
                <p>
                  <span className="font-medium">审批进度：</span>
                  {getApprovalLevelText(reservation.current_level)}
                </p>
              </div>

              <div className="border-t border-gray-300/70 my-4"></div>

              <div className="mt-3 flex justify-end">
                {reservation.status === 0 && (
                  <button
                    className="px-3 py-1.5 text-sm border border-red-200 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                  >
                    取消预约
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}
    </div>
  );
}
