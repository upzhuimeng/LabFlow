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
import { formatDateTime } from '@/lib/utils';
import { useToast } from '@/components/Toast';
import { useAuth } from '@/contexts/AuthContext';
import { SearchableSelect } from '@/components/ui';

const STATUS_BADGE_CLASS = {
  0: 'bg-blue-100 text-blue-700',
  1: 'bg-green-100 text-green-700',
  2: 'bg-red-100 text-red-700',
  3: 'bg-gray-100 text-gray-700',
};

function ReservationForm({ labId, instrumentId, onSuccess, onCancel }) {
  const toast = useToast();
  const [labInfo, setLabInfo] = useState(null);
  const [instrumentInfo, setInstrumentInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    start_time: '',
    end_time: '',
    purpose: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchInfo = async () => {
      setLoading(true);
      try {
        if (labId) {
          const labRes = await api.get(`/labs/${labId}`);
          setLabInfo(labRes.data);
        }
        if (instrumentId) {
          const instRes = await api.get(`/instruments/${instrumentId}`);
          setInstrumentInfo(instRes.data);
          if (instRes.data.lab_id && !labId) {
            const labRes = await api.get(`/labs/${instRes.data.lab_id}`);
            setLabInfo(labRes.data);
          }
        }
      } catch (err) {
        toast.error('获取信息失败');
      } finally {
        setLoading(false);
      }
    };
    fetchInfo();
  }, [labId, instrumentId]);

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
        return datetimeStr.replace('T', ' ') + ':00';
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

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="text-center text-gray-500 py-8">加载中...</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">填写预约信息</h2>
      
      {labInfo && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
          <h3 className="font-medium text-blue-800 mb-2">实验室信息</h3>
          <div className="grid grid-cols-2 gap-2 text-sm text-blue-700">
            <p><span className="font-medium">名称：</span>{labInfo.name}</p>
            <p><span className="font-medium">地址：</span>{labInfo.address}</p>
            <p><span className="font-medium">容量：</span>{labInfo.capacity}人</p>
            {labInfo.manager && <p><span className="font-medium">负责人：</span>{labInfo.manager}</p>}
          </div>
        </div>
      )}

      {instrumentInfo && (
        <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-100">
          <h3 className="font-medium text-green-800 mb-2">仪器信息</h3>
          <div className="grid grid-cols-2 gap-2 text-sm text-green-700">
            <p><span className="font-medium">名称：</span>{instrumentInfo.name}</p>
            <p><span className="font-medium">型号：</span>{instrumentInfo.model || '-'}</p>
            <p><span className="font-medium">厂商：</span>{instrumentInfo.manufacturer || '-'}</p>
          </div>
        </div>
      )}

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
  const [showForm, setShowForm] = useState(false);
  const [labs, setLabs] = useState([]);
  const [selectedLabId, setSelectedLabId] = useState('');

  const fetchLabs = useCallback(async () => {
    try {
      const res = await api.get('/labs', { params: { page: 1, page_size: 100, status: 0 } });
      setLabs(res.data?.items || []);
    } catch (err) {
      console.error('获取实验室失败:', err);
    }
  }, []);

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
    if (!showReservationForm && !showForm) {
      fetchReservations();
    } else {
      setLoading(false);
    }
  }, [showReservationForm, showForm, fetchReservations]);

  const handleReservationSuccess = () => {
    setShowForm(false);
    setSelectedLabId('');
    fetchReservations();
  };

  const handleReservationCancel = () => {
    setShowForm(false);
    setSelectedLabId('');
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-80px)]">
        <div className="text-gray-600">加载中...</div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 min-h-[calc(100vh-80px)]">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">我的预约</h1>
        <button
          onClick={() => {
            setSelectedLabId('');
            fetchLabs();
            setShowForm(true);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
        >
          新建预约
        </button>
      </div>

      {showReservationForm || showForm ? (
        <>
          {showForm && !labId && (
            <div className="mb-4">
              <SearchableSelect
                label="选择实验室"
                name="lab_id"
                value={selectedLabId}
                onChange={(e) => setSelectedLabId(e.target.value)}
                options={labs.map(lab => ({ value: lab.id, label: lab.name }))}
                placeholder="请选择实验室"
                searchPlaceholder="搜索实验室..."
              />
            </div>
          )}
          {(!showForm || labId || selectedLabId) && (
            <ReservationForm
              labId={labId || (selectedLabId ? selectedLabId : null)}
              instrumentId={instrumentId}
              onSuccess={handleReservationSuccess}
              onCancel={handleReservationCancel}
            />
          )}
        </>
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
                      {formatDateTime(reservation.start_time)} ~ {formatDateTime(reservation.end_time)}
                    </p>
                    <p>
                      <span className="font-medium">用途：</span>
                      {reservation.purpose || '-'}
                    </p>
                    {reservation.approval_comment && (
                      <p>
                        <span className="font-medium">审批意见：</span>
                        {reservation.approval_comment}
                      </p>
                    )}
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