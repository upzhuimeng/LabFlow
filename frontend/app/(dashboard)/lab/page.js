// -*- coding: utf-8 -*-
// File: page.js
// Created: 2026-03-30
// Author: zhuimeng
// Description: 实验室管理页面

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { STATUS, STATUS_TEXT } from '@/lib/constants';
import api from '@/lib/api';
import { useToast } from '@/components/Toast';
import { useAuth } from '@/contexts/AuthContext';
import { SearchableSelect } from '@/components/ui';

const EMPTY_FORM = {
  name: '',
  address: '',
  capacity: '',
  status: 0,
  manager_user_id: '',
  phone: '',
  description: '',
};

const STATUS_BADGE_CLASS = {
  0: 'bg-green-100 text-green-700',
  1: 'bg-yellow-100 text-yellow-700',
  2: 'bg-orange-100 text-orange-700',
  3: 'bg-red-100 text-red-700',
};

export default function LabPage() {
  const router = useRouter();
  const toast = useToast();
  const { isAdmin } = useAuth();
  const [labs, setLabs] = useState([]);
  const [users, setUsers] = useState([]);
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
  const [modalOpen, setModalOpen] = useState(false);
  const [editingLab, setEditingLab] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleteInstruments, setDeleteInstruments] = useState([]);
  const [deleteReservations, setDeleteReservations] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [showMaintenanceAndDisabled, setShowMaintenanceAndDisabled] = useState(false);
  const [showDeleted, setShowDeleted] = useState(false);

  const fetchLabs = useCallback(async () => {
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
      const res = await api.get('/labs', { params });
      let data = res.data?.items || [];
      
      if (showDeleted) {
        data = data.filter(lab => lab.status === 3);
      } else if (showMaintenanceAndDisabled) {
        data = data.filter(lab => lab.status !== 3);
      } else {
        data = data.filter(lab => lab.status === 0);
      }
      
      setLabs(data);
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
  }, [pagination.page, pagination.pageSize, activeSearch, showMaintenanceAndDisabled, showDeleted, isAdmin]);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await api.get('/users', { params: { page: 1, page_size: 100 } });
      setUsers(res.data?.items || []);
    } catch (err) {
      console.error('获取用户失败:', err);
    }
  }, []);

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    setActiveSearch(searchTerm);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  useEffect(() => {
    fetchLabs();
    if (isAdmin) {
      fetchUsers();
    }
  }, [fetchLabs, fetchUsers, isAdmin]);

  const handleAdd = () => {
    setEditingLab(null);
    setFormData(EMPTY_FORM);
    setModalOpen(true);
  };

  const handleEdit = (lab) => {
    setEditingLab(lab);
    setFormData({
      name: lab.name || '',
      address: lab.address || '',
      capacity: lab.capacity || '',
      status: lab.status ?? 0,
      manager_user_id: lab.manager_user_id || '',
      phone: lab.phone || '',
      description: lab.description || '',
    });
    setModalOpen(true);
  };

  const handleReserve = (lab) => {
    router.push(`/reservation/my?lab_id=${lab.id}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      toast.error('请输入实验室名称');
      return;
    }
    if (!formData.address?.trim()) {
      toast.error('请输入实验室地址');
      return;
    }
    if (!formData.capacity || parseInt(formData.capacity) < 1) {
      toast.error('请输入有效的容纳人数');
      return;
    }
    if (!formData.phone?.trim()) {
      toast.error('请输入联系电话');
      return;
    }
    try {
      const { manager_user_id, ...rest } = formData;
      const submitData = {
        ...rest,
        capacity: formData.capacity ? parseInt(formData.capacity) : null,
        manager_user_id: manager_user_id ? parseInt(manager_user_id) : null,
      };

      if (editingLab) {
        await api.put(`/labs/${editingLab.id}`, submitData);
      } else {
        await api.post('/labs', submitData);
      }
      setModalOpen(false);
      fetchLabs();
    } catch (err) {
      toast.error(err.message || '保存失败');
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    const hasReservations = deleteReservations.length > 0;
    try {
      const url = hasReservations 
        ? `/labs/${deleteConfirm.id}?force=true` 
        : `/labs/${deleteConfirm.id}`;
      await api.delete(url);
      setDeleteConfirm(null);
      setDeleteInstruments([]);
      setDeleteReservations([]);
      fetchLabs();
      toast.success('实验室删除成功');
    } catch (err) {
      toast.error(err.message || '删除失败');
      setDeleteConfirm(null);
      setDeleteInstruments([]);
      setDeleteReservations([]);
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
        {STATUS_TEXT.LAB[s] || '未知'}
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
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">实验室管理</h1>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 gap-3 mb-6">
        {/* {isAdmin && (
          <button
            onClick={handleAdd}
            className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium flex items-center justify-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            新增实验室
          </button>
        )} */}
        <input
          type="text"
          placeholder="搜索实验室名称或地址..."
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
        {labs.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center text-gray-500">
            暂无实验室数据
          </div>
        ) : (
          labs.map((lab) => (
            <div
              key={lab.id}
              onClick={() => router.push(`/lab/${lab.id}`)}
              className="border border-gray-200 rounded-lg shadow-sm p-4 hover:shadow-lg hover:-translate-y-1.5 transition-all duration-300 cursor-pointer"
            >
              <div className="flex justify-between items-start mb-2">
                <h2 className="text-lg font-semibold text-blue-600">{lab.name}</h2>
                {getStatusBadge(lab.status)}
              </div>

              <div className="space-y-1 text-sm text-gray-700">
                <p>
                  <span className="font-medium">实验室 ID：</span>
                  {lab.id}
                </p>
                <p>
                  <span className="font-medium">地址：</span>
                  {lab.address || '-'}
                </p>
                <p>
                  <span className="font-medium">可容纳人数：</span>
                  {lab.capacity ? `${lab.capacity} 人` : '-'}
                </p>
                <p>
                  <span className="font-medium">负责人：</span>
                  {lab.manager_name || '未填写'}
                </p>
                <p>
                  <span className="font-medium">联系电话：</span>
                  {lab.phone || '未填写'}
                </p>
                {lab.description && (
                  <p>
                    <span className="font-medium">描述：</span>
                    {lab.description}
                  </p>
                )}
              </div>

              <div className="border-t border-gray-300/70 my-6"></div>

              <div className="mt-3 flex justify-end gap-2">
                {isAdmin && lab.status !== 3 ? (
                  <>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleEdit(lab); }}
                      className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors"
                    >
                      编辑
                    </button>
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        try {
                          const [instRes, res0Res, res1Res] = await Promise.all([
                            api.get('/instruments', { params: { lab_id: lab.id, page: 1, page_size: 100 } }),
                            api.get('/reservations', { params: { lab_id: lab.id, page: 1, page_size: 100, status: 0 } }),
                            api.get('/reservations', { params: { lab_id: lab.id, page: 1, page_size: 100, status: 1 } }),
                          ]);
                          const instruments = instRes.data?.items || [];
                          const pending = res0Res.data?.items || [];
                          const approved = res1Res.data?.items || [];
                          const allReservations = [...pending, ...approved];
                          setDeleteInstruments(instruments);
                          setDeleteReservations(allReservations);
                        } catch (err) {
                          setDeleteInstruments([]);
                          setDeleteReservations([]);
                        }
                        setDeleteConfirm(lab);
                      }}
                      className="px-3 py-1.5 text-sm border border-red-200 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                    >
                      删除
                    </button>
                  </>
                ) : lab.status === 3 ? (
                  <span className="text-sm text-gray-400">已删除</span>
                ) : null}
                {lab.status === 0 && !isAdmin && (
                  <button
                    onClick={() => handleReserve(lab)}
                    className="px-3 py-1.5 text-sm border border-blue-200 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
                  >
                    预约
                  </button>
                )}
                {lab.status !== 0 && !isAdmin && (
                  <span className="text-sm text-gray-400">不可预约</span>
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
                  {editingLab ? '编辑实验室' : '新增实验室'}
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
                    实验室名称 <span className="text-red-500">*</span>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    地址 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    required
                    placeholder="例如：A 栋 301 室"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    可容纳人数 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    required
                    min="1"
                    placeholder="例如：20"
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
                    <option value={1}>维护</option>
                    <option value={2}>停用</option>
                  </select>
                </div>
                <div>
                  <SearchableSelect
                    label="负责人"
                    name="manager_user_id"
                    value={formData.manager_user_id || ''}
                    onChange={(e) => {
                      const { name, value } = e.target;
                      setFormData(prev => ({ ...prev, [name]: value ? parseInt(value) : '' }));
                    }}
                    options={users.filter(u => u.role === 1 || u.role === 2).map(user => ({
                      value: user.id,
                      label: `${user.name} (${user.role === 1 ? '管理员' : '实验员'})`
                    }))}
                    placeholder="请选择负责人"
                    searchPlaceholder="搜索用户..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    联系电话 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                    placeholder="请输入联系电话"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">描述</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={2}
                    placeholder="请输入实验室描述信息"
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
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 text-center mb-2">确认删除</h3>
            <p className="text-gray-500 text-sm text-center mb-4">
              确定要删除实验室「{deleteConfirm.name}」吗？此操作无法撤销。
            </p>
            {deleteInstruments.length > 0 && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-700 text-sm font-medium mb-2">
                  ⚠️ 该实验室下有 {deleteInstruments.length} 台仪器，删除后这些仪器也将被标记为删除：
                </p>
                <ul className="text-sm text-yellow-600 space-y-1">
                  {deleteInstruments.slice(0, 5).map(inst => (
                    <li key={inst.id}>• {inst.name}（{inst.model || '无型号'}）</li>
                  ))}
                  {deleteInstruments.length > 5 && (
                    <li>...还有 {deleteInstruments.length - 5} 台</li>
                  )}
                </ul>
              </div>
            )}
            {deleteReservations.length > 0 && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm font-medium mb-2">
                  ⚠️ 该实验室存在 {deleteReservations.length} 个有效预约，删除后将导致以下预约失效：
                </p>
                <ul className="text-sm text-red-600 space-y-1">
                  {deleteReservations.slice(0, 5).map(res => (
                    <li key={res.id}>• {res.user_name || '未知'}（{res.user_phone || '无联系方式'}）| {res.start_time ? new Date(res.start_time).toLocaleString('zh-CN', {month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit'}) : '未知时间'} | {res.status === 0 ? '审批中' : '已通过'}</li>
                  ))}
                  {deleteReservations.length > 5 && (
                    <li>...还有 {deleteReservations.length - 5} 个</li>
                  )}
                </ul>
              </div>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => { setDeleteConfirm(null); setDeleteInstruments([]); setDeleteReservations([]); }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 text-sm"
              >
                取消
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
              >
                {deleteReservations.length > 0 ? '强制删除' : '删除'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
