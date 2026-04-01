// -*- coding: utf-8 -*-
// File: page.js
// Created: 2026-03-30
// Author: zhuimeng
// Description: 我的预约页面

'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { STATUS_TEXT } from '@/lib/constants';
import api from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { useToast } from '@/components/Toast';
import { useAuth } from '@/contexts/AuthContext';

const STATUS_BADGE_CLASS = {
  0: 'bg-blue-100 text-blue-700',
  1: 'bg-green-100 text-green-700',
  2: 'bg-red-100 text-red-700',
  3: 'bg-gray-100 text-gray-700',
};

function ReservationForm({ labId, instrumentId, onSuccess, onCancel }) {
  const toast = useToast();
  const [form, setForm] = useState({
    start_time: '',
    end_time: '',
    purpose: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.start_time || !form.end_time) {
      toast.error('请填写预约时间');
      return;
    }
    if (form.start_time >= form.end_time) {
      toast.error('结束时间必须晚于开始时间');
      return;
    }

    setSubmitting(true);
    try {
      const formatdatetimeForApi = (datetimeStr) => {
        const date = new Date(datetimeStr);
        return date.toISOString();
      };
      const payload = {
        lab_id: labId ? parseInt(labId) : null,
        start_time: formatdatetimeForApi(form.start_time),
        end_time: formatdatetimeForApi(form.end_time),
        purpose: form.purpose || null,
      };
      await api.post('/reservations', payload);
      toast.success('预约提交成功');
      onSuccess();
    } catch (err) {
      toast.error(err.message || '预约提交失败');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">填写预约信息</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              开始时间 <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              name="start_time"
              value={form.start_time}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              结束时间 <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              name="end_time"
              value={form.end_time}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">用途说明</label>
          <textarea
            name="purpose"
            value={form.purpose}
            onChange={handleChange}
            rows={3}
            placeholder="请输入预约用途"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm"
          />
        </div>
        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 text-sm"
          >
            取消
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm disabled:opacity-50"
          >
            {submitting ? '提交中...' : '提交预约'}
          </button>
        </div>
      </form>
    </div>
  );
}

function MyReservationsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const toast = useToast();
  const { isAdmin } = useAuth();
  
  const labId = searchParams.get('lab_id');
  const instrumentId = searchParams.get('instrument_id');
  const showReservationForm = labId || instrumentId;

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
    if (!showReservationForm) {
      fetchReservations();
    } else {
      setLoading(false);
    }
  }, [showReservationForm, fetchReservations]);

  const handleReservationSuccess = () => {
    router.replace('/reservation/my');
  };

  const handleReservationCancel = () => {
    router.replace('/reservation/my');
  };

  const handleCancel = async (reservationId) => {
    try {
      await api.delete(`/reservations/${reservationId}`);
      toast.success('预约已取消');
      fetchReservations();
    } catch (err) {
      toast.error(err.message || '取消失败');
    }
  };

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

      {showReservationForm ? (
        <ReservationForm
          labId={labId}
          instrumentId={instrumentId}
          onSuccess={handleReservationSuccess}
          onCancel={handleReservationCancel}
        />
      ) : (
        <>
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
                        onClick={() => handleCancel(reservation.id)}
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
        </>
      )}
    </div>
  );
}

export default function MyReservationsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-[calc(100vh-80px)]">
        <div className="text-gray-600">加载中...</div>
      </div>
    }>
      <MyReservationsContent />
    </Suspense>
  );
}