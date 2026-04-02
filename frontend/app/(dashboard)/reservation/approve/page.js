// -*- coding: utf-8 -*-
// File: page.js
// Created: 2026-03-30
// Author: zhuimeng
// Description: 审批预约页面（管理员用）

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { STATUS_TEXT } from '@/lib/constants';
import api from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { useToast } from '@/components/Toast';

const STATUS_BADGE_CLASS = {
  0: 'bg-blue-100 text-blue-700',
  1: 'bg-green-100 text-green-700',
  2: 'bg-red-100 text-red-700',
  3: 'bg-gray-100 text-gray-700',
};

export default function ApproveReservationsPage() {
  const toast = useToast();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('pending');
  const [selectedItem, setSelectedItem] = useState(null);
  const [actionType, setActionType] = useState(null);

  const fetchPendingApprovals = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/approvals/pending');
      const data = res.data || {};
      // API returns flat list directly in data
      setReservations(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || '获取数据失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPendingApprovals();
  }, [fetchPendingApprovals]);

  const filteredReservations = filter === 'all'
    ? reservations
    : filter === 'pending'
    ? reservations.filter(r => r.status === 0)
    : reservations.filter(r => r.status === parseInt(filter));

  const getStatusBadge = (status) => {
    const s = status ?? 0;
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_BADGE_CLASS[s] || STATUS_BADGE_CLASS[0]}`}>
        {STATUS_TEXT.RESERVATION[s] || '未知'}
      </span>
    );
  };

  const handleApprove = (item) => {
    setSelectedItem(item);
    setActionType('approve');
  };

  const confirmApprove = async () => {
    if (!selectedItem) return;
    try {
      await api.post(`/approvals/reservations/${selectedItem.id}/approve`);
      setSelectedItem(null);
      setActionType(null);
      fetchPendingApprovals();
    } catch (err) {
      toast.error(err.message || '操作失败');
    }
  };

  const handleReject = (item) => {
    setSelectedItem(item);
    setActionType('reject');
  };

  const confirmReject = async () => {
    if (!selectedItem) return;
    try {
      await api.post(`/approvals/reservations/${selectedItem.id}/reject`);
      setSelectedItem(null);
      setActionType(null);
      fetchPendingApprovals();
    } catch (err) {
      toast.error(err.message || '操作失败');
    }
  };

  const getButtonClass = (status) => {
    const baseClass = 'flex-1 px-4 py-2 text-white rounded-lg text-sm';
    if (status === 2) {
      return `${baseClass} bg-red-600 hover:bg-red-700`;
    }
    return `${baseClass} bg-green-600 hover:bg-green-700`;
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
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">审批预约</h1>
        <p className="text-gray-500 text-sm mt-1">处理用户的仪器预约申请</p>
      </div>

      <div className="mb-4 flex items-center space-x-2">
        <span className="text-sm text-gray-600">筛选：</span>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
          <option value="pending">待审批</option>
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
            暂无待审批预约
          </div>
        ) : (
          filteredReservations.map((reservation) => (
            <div
              key={reservation.id}
              className="border border-gray-200 rounded-lg shadow-sm p-4 hover:shadow-lg hover:-translate-y-1.5 transition-all duration-300"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h2 className="text-lg font-semibold text-blue-600">{reservation.lab_name}</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    申请人：{reservation.user_name}
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
              </div>

              <div className="border-t border-gray-300/70 my-4"></div>

              <div className="mt-3 flex justify-end space-x-2">
                {reservation.status === 0 && (
                  <>
                    <button
                      onClick={() => handleApprove(reservation)}
                      className="px-3 py-1.5 text-sm border border-green-200 rounded-lg hover:bg-green-50 text-green-600 transition-colors"
                    >
                      通过
                    </button>
                    <button
                      onClick={() => handleReject(reservation)}
                      className="px-3 py-1.5 text-sm border border-red-200 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                    >
                      拒绝
                    </button>
                  </>
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

      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="text-lg font-semibold text-gray-800 text-center mb-4">
              确认操作
            </h3>
            <p className="text-gray-500 text-sm text-center mb-6">
              确定要{selectedItem.status === 2 ? '拒绝' : '通过'}预约「{selectedItem.lab_name}」吗？
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setSelectedItem(null)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 text-sm"
              >
                取消
              </button>
              <button
                onClick={selectedItem.status === 2 ? confirmReject : confirmApprove}
                className={getButtonClass(selectedItem.status)}
              >
                确认
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}