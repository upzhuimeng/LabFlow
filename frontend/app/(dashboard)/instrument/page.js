// -*- coding: utf-8 -*-
// File: page.js
// Created: 2026-03-30
// Author: zhuimeng
// Description: 设备管理页面

'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { STATUS, STATUS_TEXT } from '@/lib/constants';
import { formatDate } from '@/lib/utils';
import api from '@/lib/api';
import { useToast } from '@/components/Toast';
import { useAuth } from '@/contexts/AuthContext';
import { SearchableSelect } from '@/components/ui';

const EMPTY_FORM = {
  name: '',
  model: '',
  manufacturer: '',
  supplier: '',
  purchase_date: '',
  price: '',
  status: 0,
  lab_id: '',
  remark: '',
};

const STATUS_BADGE_CLASS = {
  0: 'bg-green-100 text-green-700',
  1: 'bg-yellow-100 text-yellow-700',
  2: 'bg-gray-100 text-gray-700',
  3: 'bg-red-100 text-red-700',
};

export default function InstrumentPage() {
  const router = useRouter();
  const toast = useToast();
  const { isAdmin } = useAuth();
  const [instruments, setInstruments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showMaintenanceAndDisabled, setShowMaintenanceAndDisabled] = useState(false);
  const [showDeleted, setShowDeleted] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingInstrument, setEditingInstrument] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [labs, setLabs] = useState([]);

  const fetchInstruments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { 
        page: pagination.page, 
        page_size: pagination.pageSize,
      };
      if (activeSearch && activeSearch.trim()) {
        params.keyword = activeSearch.trim();
      }
      if (showDeleted) {
        params.status = 3;
      } else if (!showMaintenanceAndDisabled) {
        params.status = 0;
      }
      const res = await api.get('/instruments', { params });
      const data = res.data?.items || [];
      setInstruments(data);
      setPagination(prev => ({
        ...prev,
        total: data.length,
        totalPages: 1,
      }));
    } catch (err) {
      setError(err.message || '获取数据失败');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.pageSize, activeSearch, showMaintenanceAndDisabled, showDeleted]);

  const fetchLabs = async () => {
    try {
      const res = await api.get('/labs', { params: { page: 1, page_size: 100, status: 0 } });
      setLabs(res.data?.items || []);
    } catch (err) {
      console.error('获取实验室失败:', err);
    }
  };

  useEffect(() => {
    fetchInstruments();
    fetchLabs();
  }, [fetchInstruments]);

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    setActiveSearch(searchTerm);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleAdd = () => {
    setEditingInstrument(null);
    setFormData(EMPTY_FORM);
    setModalOpen(true);
  };

  const handleEdit = (instrument) => {
    setEditingInstrument(instrument);
    setFormData({
      name: instrument.name || '',
      model: instrument.model || '',
      manufacturer: instrument.manufacturer || '',
      supplier: instrument.supplier || '',
      purchase_date: instrument.purchase_date ? instrument.purchase_date.split('T')[0] : '',
      price: instrument.price || '',
      status: instrument.status ?? 0,
      lab_id: instrument.lab_id || '',
      remark: instrument.remark || '',
    });
    setModalOpen(true);
  };

  const handleReserve = (instrument) => {
    router.push(`/reservation/my?instrument_id=${instrument.id}&lab_id=${instrument.lab_id}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = {
        ...formData,
        lab_id: formData.lab_id ? parseInt(formData.lab_id) : null,
        price: formData.price ? parseFloat(formData.price) : null,
      };

      if (editingInstrument) {
        await api.put(`/instruments/${editingInstrument.id}`, submitData);
      } else {
        await api.post('/instruments', submitData);
      }
      setModalOpen(false);
      fetchInstruments();
      fetchLabs();
    } catch (err) {
      toast.error(err.message || '保存失败');
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await api.delete(`/instruments/${deleteConfirm.id}`);
      setDeleteConfirm(null);
      fetchInstruments();
    } catch (err) {
      toast.error(err.message || '删除失败');
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };

  const getStatusBadge = (status) => {
    const s = status ?? 0;
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_BADGE_CLASS[s] || STATUS_BADGE_CLASS[0]}`}>
        {STATUS_TEXT.INSTRUMENT[s] || '未知'}
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
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">设备管理</h1>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 gap-3 mb-6">
        <input
          type="text"
          placeholder="搜索设备名称..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
          }}
          onKeyDown={handleKeyDown}
          className="w-full sm:flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm"
        />
        <button
          onClick={handleSearch}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
        >
          搜索
        </button>
        <label className={`flex items-center space-x-2 text-sm text-gray-600 ${showDeleted ? 'opacity-50' : ''}`}>
          <input
            type="checkbox"
            checked={showMaintenanceAndDisabled}
            disabled={showDeleted}
            onChange={(e) => {
              setShowMaintenanceAndDisabled(e.target.checked);
              setPagination(prev => ({ ...prev, page: 1 }));
            }}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-300"
          />
          <span>显示维护和停用</span>
        </label>
        {isAdmin && (
          <label className="flex items-center space-x-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={showDeleted}
              onChange={(e) => {
                setShowDeleted(e.target.checked);
                if (e.target.checked) {
                  setShowMaintenanceAndDisabled(false);
                }
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-300"
            />
            <span>只看已删除</span>
          </label>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4">
        {instruments.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center text-gray-500">
            暂无设备数据
          </div>
        ) : (
          instruments.map((instrument) => (
            <div
              key={instrument.id}
              onClick={() => router.push(`/instrument/${instrument.id}`)}
              className={`border border-gray-200 rounded-lg shadow-sm p-4 hover:shadow-lg hover:-translate-y-1.5 transition-all duration-300 cursor-pointer ${
                instrument.status === STATUS.INSTRUMENT.DISABLED ? 'opacity-75' : ''
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <h2 className="text-lg font-semibold text-blue-600">{instrument.name}</h2>
                {getStatusBadge(instrument.status)}
              </div>

              <div className="space-y-1 text-sm text-gray-700">
                <p>
                  <span className="font-medium">型号：</span>
                  {instrument.model || '未知'}
                </p>
                <p>
                  <span className="font-medium">厂商：</span>
                  {instrument.manufacturer || '未知'}
                </p>
                <p>
                  <span className="font-medium">购买日期：</span>
                  {formatDate(instrument.purchase_date) || '未填写'}
                </p>
                <p>
                  <span className="font-medium">价格：</span>
                  {instrument.price ? `¥${instrument.price}` : '未填写'}
                </p>
                <p>
                  <span className="font-medium">实验室：</span>
                  {instrument.lab_name || instrument.lab_id || '未填写'}
                </p>
                {instrument.remark && (
                  <p>
                    <span className="font-medium">备注：</span>
                    {instrument.remark}
                  </p>
                )}
              </div>

              <div className="border-t border-gray-300/70 my-6"></div>

              <div className="mt-3 flex justify-end">
                {isAdmin ? (
                  <>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleEdit(instrument); }}
                      className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors"
                    >
                      编辑
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setDeleteConfirm(instrument); }}
                      className="ml-2 px-3 py-1.5 text-sm border border-red-200 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                    >
                      删除
                    </button>
                  </>
                ) : (
                  <button
                    onClick={(e) => { e.stopPropagation(); handleReserve(instrument); }}
                    className="px-3 py-1.5 text-sm border border-blue-200 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
                  >
                    预约
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {pagination.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-4 mt-6 text-sm">
          <button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
            className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            上一页
          </button>
          <span className="text-gray-600">
            第 <span className="font-medium">{pagination.page}</span> / <span className="font-medium">{pagination.totalPages}</span> 页
          </span>
          <button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.totalPages}
            className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            下一页
          </button>
          <span className="text-gray-400 hidden sm:inline">共 {pagination.total} 条</span>
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30">
          <div className="relative w-full max-w-xl bg-white rounded-xl shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">
                  {editingInstrument ? '编辑设备' : '新增设备'}
                </h3>
                <button
                  onClick={() => setModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    设备名称 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">型号</label>
                  <input
                    type="text"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">厂商</label>
                  <input
                    type="text"
                    value={formData.manufacturer}
                    onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">供应商</label>
                  <input
                    type="text"
                    value={formData.supplier}
                    onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">购买日期</label>
                  <input
                    type="date"
                    value={formData.purchase_date}
                    onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">价格</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">状态</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm"
                  >
                    <option value={0}>正常</option>
                    <option value={1}>维修</option>
                    <option value={2}>停用</option>
                  </select>
                </div>
                <div>
                  <SearchableSelect
                    label="实验室"
                    name="lab_id"
                    value={formData.lab_id || ''}
                    onChange={(e) => {
                      const { name, value } = e.target;
                      setFormData(prev => ({ ...prev, [name]: value ? parseInt(value) : '' }));
                    }}
                    options={labs.map(lab => ({ value: lab.id, label: lab.name }))}
                    placeholder="请选择实验室"
                    searchPlaceholder="搜索实验室..."
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">备注</label>
                  <textarea
                    value={formData.remark}
                    onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm"
                  />
                </div>
              </div>
              <div className="border-t border-gray-200 px-6 py-4 flex justify-end gap-3 bg-gray-50 mt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 text-sm"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                >
                  保存
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 text-center mb-2">确认删除</h3>
            <p className="text-gray-500 text-sm text-center mb-6">
              确定要删除设备「{deleteConfirm.name}」吗？此操作无法撤销。
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 text-sm"
              >
                取消
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
