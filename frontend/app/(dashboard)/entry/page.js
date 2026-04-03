// -*- coding: utf-8 -*-
// File: page.js
// Created: 2026-03-30
// Author: zhuimeng
// Description: 信息录入页面（管理员专用）

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { useToast } from '@/components/Toast';
import { SearchableSelect } from '@/components/ui';

const EMPTY_INSTRUMENT_FORM = {
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

const EMPTY_LAB_FORM = {
  name: '',
  address: '',
  capacity: '',
  status: 0,
  manager_user_id: '',
  description: '',
};

export default function EntryPage() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('instrument');
  const [labs, setLabs] = useState([]);
  const [users, setUsers] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [instrumentForm, setInstrumentForm] = useState(EMPTY_INSTRUMENT_FORM);
  const [labForm, setLabForm] = useState(EMPTY_LAB_FORM);
  const [labFormErrors, setLabFormErrors] = useState({});

  const fetchLabs = useCallback(async () => {
    try {
      const res = await api.get('/labs', { params: { page: 1, page_size: 100 } });
      setLabs(res.data?.items || []);
    } catch (err) {
      console.error('获取实验室失败:', err);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await api.get('/users', { params: { page: 1, page_size: 100 } });
      setUsers(res.data?.items || []);
    } catch (err) {
      console.error('获取用户失败:', err);
    }
  }, []);

  useEffect(() => {
    fetchLabs();
    fetchUsers();
  }, [fetchLabs, fetchUsers]);

  const showSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleInstrumentSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = {
        ...instrumentForm,
        lab_id: instrumentForm.lab_id ? parseInt(instrumentForm.lab_id) : null,
        price: instrumentForm.price ? parseFloat(instrumentForm.price) : null,
      };
      await api.post('/instruments', submitData);
      toast.success('仪器添加成功！');
      setInstrumentForm(EMPTY_INSTRUMENT_FORM);
    } catch (err) {
      toast.error(err.message || '提交失败');
    }
  };

  const handleLabSubmit = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!labForm.manager_user_id) {
      errors.manager_user_id = '请选择负责人';
    }
    if (Object.keys(errors).length > 0) {
      setLabFormErrors(errors);
      return;
    }
    setLabFormErrors({});
    try {
      const { manager_user_id, ...rest } = labForm;
      const submitData = {
        ...rest,
        capacity: labForm.capacity ? parseInt(labForm.capacity) : null,
        manager_user_id: manager_user_id ? parseInt(manager_user_id) : null,
      };
      await api.post('/labs', submitData);
      toast.success('实验室添加成功！');
      setLabForm(EMPTY_LAB_FORM);
      fetchLabs();
    } catch (err) {
      toast.error(err.message || '提交失败');
    }
  };

  const handleInstrumentChange = (e) => {
    const { name, value } = e.target;
    setInstrumentForm(prev => ({ ...prev, [name]: value }));
  };

  const handleLabChange = (e) => {
    const { name, value } = e.target;
    if (name === 'manager_user_id') {
      setLabForm(prev => ({ ...prev, [name]: value ? parseInt(value) : '' }));
      if (value) {
        setLabFormErrors(prev => ({ ...prev, manager_user_id: undefined }));
      }
    } else {
      setLabForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const tabs = [
    { id: 'instrument', label: '录入仪器' },
    { id: 'lab', label: '录入实验室' },
  ];

  return (
    <div className="p-4 lg:p-6 min-h-[calc(100vh-80px)]">
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">信息录入</h1>
        <p className="text-gray-500 text-sm mt-1">快速录入仪器或实验室信息</p>
      </div>

      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm">
          {successMessage}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'instrument' && (
            <form onSubmit={handleInstrumentSubmit} className="max-w-3xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    仪器名称 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={instrumentForm.name}
                    onChange={handleInstrumentChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">型号</label>
                  <input
                    type="text"
                    name="model"
                    value={instrumentForm.model}
                    onChange={handleInstrumentChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">厂商</label>
                  <input
                    type="text"
                    name="manufacturer"
                    value={instrumentForm.manufacturer}
                    onChange={handleInstrumentChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">供应商</label>
                  <input
                    type="text"
                    name="supplier"
                    value={instrumentForm.supplier}
                    onChange={handleInstrumentChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">购买日期</label>
                  <input
                    type="date"
                    name="purchase_date"
                    value={instrumentForm.purchase_date}
                    onChange={handleInstrumentChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">价格</label>
                  <input
                    type="number"
                    step="0.01"
                    name="price"
                    value={instrumentForm.price}
                    onChange={handleInstrumentChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">状态</label>
                  <select
                    name="status"
                    value={instrumentForm.status}
                    onChange={handleInstrumentChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm"
                  >
                    <option value={0}>正常</option>
                    <option value={1}>维修</option>
                    <option value={2}>停用</option>
                  </select>
                </div>
                <SearchableSelect
                  label="实验室"
                  name="lab_id"
                  value={instrumentForm.lab_id || ''}
                  onChange={handleInstrumentChange}
                  options={labs.map(lab => ({ value: lab.id, label: lab.name }))}
                  placeholder="请选择实验室"
                  searchPlaceholder="搜索实验室..."
                />
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">备注</label>
                  <textarea
                    name="remark"
                    value={instrumentForm.remark}
                    onChange={handleInstrumentChange}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={() => setInstrumentForm(EMPTY_INSTRUMENT_FORM)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 text-sm mr-3"
                >
                  重置
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                >
                  提交仪器
                </button>
              </div>
            </form>
          )}

          {activeTab === 'lab' && (
            <form onSubmit={handleLabSubmit} className="max-w-3xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    实验室名称 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={labForm.name}
                    onChange={handleLabChange}
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
                    name="address"
                    value={labForm.address}
                    onChange={handleLabChange}
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
                    name="capacity"
                    value={labForm.capacity}
                    onChange={handleLabChange}
                    required
                    min="1"
                    placeholder="例如：20"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">状态</label>
                  <select
                    name="status"
                    value={labForm.status}
                    onChange={handleLabChange}
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
                    value={labForm.manager_user_id || ''}
                    onChange={handleLabChange}
                    options={users.filter(u => u.role === 1 || u.role === 2).map(user => ({
                      value: user.id,
                      label: `${user.name} (${user.role === 1 ? '管理员' : '实验员'})`
                    }))}
                    placeholder="请选择负责人"
                    searchPlaceholder="搜索用户..."
                    required
                    error={labFormErrors.manager_user_id}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">描述</label>
                  <textarea
                    name="description"
                    value={labForm.description}
                    onChange={handleLabChange}
                    rows={2}
                    placeholder="请输入实验室描述信息"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={() => setLabForm(EMPTY_LAB_FORM)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 text-sm mr-3"
                >
                  重置
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                >
                  提交实验室
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
