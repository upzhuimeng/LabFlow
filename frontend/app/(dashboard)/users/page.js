// -*- coding: utf-8 -*-
// File: page.js
// Created: 2026-03-30
// Author: zhuimeng
// Description: 用户管理页面（管理员专用）

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { STATUS_TEXT, ROLE_TEXT } from '@/lib/constants';
import api from '@/lib/api';
import { useToast } from '@/components/Toast';

const STATUS_BADGE_CLASS = {
  0: 'bg-green-100 text-green-700',
  1: 'bg-red-100 text-red-700',
  2: 'bg-gray-100 text-gray-700',
};

const ROLE_BADGE_CLASS = {
  0: 'bg-purple-100 text-purple-700',
  1: 'bg-blue-100 text-blue-700',
  2: 'bg-gray-100 text-gray-700',
};

const EMPTY_USER_FORM = {
  name: '',
  phone: '',
  password: '',
  email: '',
  role: 2,
};

export default function UserPage() {
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState(EMPTY_USER_FORM);
  const [submitting, setSubmitting] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: pagination.page,
        page_size: pagination.pageSize,
      };
      if (filterRole !== 'all') params.role = parseInt(filterRole);
      if (filterStatus !== 'all') params.is_active = parseInt(filterStatus);
      if (activeSearch) params.keyword = activeSearch;

      const res = await api.get('/users', { params });
      const data = res.data;
      setUsers(data.items || []);
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
  }, [pagination.page, pagination.pageSize, filterRole, filterStatus, activeSearch]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filteredUsers = users.filter(user => {
    const matchSearch = activeSearch === '' ||
      user.name?.toLowerCase().includes(activeSearch.toLowerCase()) ||
      user.username?.toLowerCase().includes(activeSearch.toLowerCase()) ||
      user.email?.toLowerCase().includes(activeSearch.toLowerCase());
    
    const matchRole = filterRole === 'all' || user.role === parseInt(filterRole);
    const matchStatus = filterStatus === 'all' || user.is_active === parseInt(filterStatus);
    
    return matchSearch && matchRole && matchStatus;
  });

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    setActiveSearch(searchTerm);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const getStatusBadge = (status) => {
    const s = status ?? 0;
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_BADGE_CLASS[s] || STATUS_BADGE_CLASS[0]}`}>
        {STATUS_TEXT.USER[s] || '未知'}
      </span>
    );
  };

  const getRoleBadge = (role) => {
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${ROLE_BADGE_CLASS[role] || ROLE_BADGE_CLASS[2]}`}>
        {ROLE_TEXT[role] || '未知'}
      </span>
    );
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };

  const handleAddUser = () => {
    setEditingUser(null);
    setFormData(EMPTY_USER_FORM);
    setModalOpen(true);
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name || '',
      phone: user.phone || '',
      password: '',
      email: user.email || '',
      role: user.role ?? 2,
    });
    setModalOpen(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingUser) {
        await api.put(`/users/${editingUser.id}`, formData);
        toast.success('用户更新成功');
      } else {
        await api.post('/users', formData);
        toast.success('用户创建成功');
      }
      setModalOpen(false);
      fetchUsers();
    } catch (err) {
      toast.error(err.message || (editingUser ? '更新用户失败' : '创建用户失败'));
    } finally {
      setSubmitting(false);
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
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">用户管理</h1>
        <p className="text-gray-500 text-sm mt-1">管理系统用户账户和角色</p>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 gap-3 mb-4">
        <button
          onClick={handleAddUser}
          className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium flex items-center justify-center"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          添加用户
        </button>
        <input
          type="text"
          placeholder="搜索用户名、姓名或邮箱..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full sm:flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm"
        />
        <button
          onClick={handleSearch}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
        >
          搜索
        </button>
        <select
          value={filterRole}
          onChange={(e) => {
            setFilterRole(e.target.value);
            setPagination(prev => ({ ...prev, page: 1 }));
          }}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
          <option value="all">全部角色</option>
          <option value="0">超级管理员</option>
          <option value="1">管理员</option>
          <option value="2">实验员</option>
        </select>
        <select
          value={filterStatus}
          onChange={(e) => {
            setFilterStatus(e.target.value);
            setPagination(prev => ({ ...prev, page: 1 }));
          }}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
          <option value="all">全部状态</option>
          <option value="0">正常</option>
          <option value="1">封禁</option>
          <option value="2">注销</option>
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">用户</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">角色</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">手机</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">创建时间</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                    暂无用户数据
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-gray-800">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {getRoleBadge(user.role)}
                    </td>
                    <td className="px-4 py-3">
                      {getStatusBadge(user.is_active)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {user.phone || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {user.created_at?.split('T')[0] || '-'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleEdit(user)}
                        className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors"
                      >
                        编辑
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
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
          <div className="relative w-full max-w-md bg-white rounded-xl shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">
                  {editingUser ? '编辑用户' : '添加用户'}
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
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    用户名 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm"
                    placeholder="请输入用户名"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    手机号 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleFormChange}
                    required
                    disabled={!!editingUser}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm bg-gray-50"
                    placeholder="请输入11位手机号"
                    maxLength={11}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    密码 {editingUser ? '' : <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleFormChange}
                    required={!editingUser}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm"
                    placeholder="8-30位，需包含符号+字母+数字"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    邮箱
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm"
                    placeholder="请输入邮箱（可选）"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    角色
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm"
                  >
                    <option value={2}>实验员</option>
                    <option value={1}>管理员</option>
                    <option value={0}>超级管理员</option>
                  </select>
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
                  disabled={submitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm disabled:opacity-50"
                >
                  {submitting ? '创建中...' : '创建'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
