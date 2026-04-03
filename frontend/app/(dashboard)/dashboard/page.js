// -*- coding: utf-8 -*-
// File: page.js
// Created: 2026-03-30
// Author: zhuimeng
// Description: 仪表板页面

'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui';
import { StatusBadge } from '@/components/ui';
import { STATUS } from '@/lib/constants';
import { formatDateTime } from '@/lib/utils';
import api from '@/lib/api';

export default function Dashboard() {
  const [instruments, setInstruments] = useState([]);
  const [labs, setLabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [instrumentsRes, labsRes] = await Promise.all([
        api.get('/instruments', { params: { page: 1, page_size: 100 } }),
        api.get('/labs', { params: { page: 1, page_size: 100 } }),
      ]);

      const instrumentsData = (instrumentsRes.data?.items || []).filter(i => i.status !== 3);
      const labsData = (labsRes.data?.items || []).filter(l => l.status !== 3);

      setInstruments(instrumentsData);
      setLabs(labsData);
      setError(null);
    } catch (err) {
      setError(err.message || '获取数据失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const stats = {
    deviceTotal: instruments.length,
    labCount: labs.length,
  };

  const deviceStatus = {
    available: instruments.filter(i => i.status === 0).length,
    reserved: 0,
    maintenance: instruments.filter(i => i.status === 1).length,
    fault: instruments.filter(i => i.status === 2).length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-80px)]">
        <div className="text-lg text-gray-600">加载中...</div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-[calc(100vh-80px)]">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">仪表板</h1>
        <p className="text-gray-600 mt-2">实验室管理系统概览</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card title="实验室概览">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">设备总数</span>
              <span className="text-2xl font-bold text-gray-800">{stats.deviceTotal}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">实验室总数</span>
              <span className="text-2xl font-bold text-gray-800">{stats.labCount}</span>
            </div>
          </div>
        </Card>

        <Card title="设备状态">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">正常</span>
              <span className="text-2xl font-bold text-green-600">{deviceStatus.available}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">维修中</span>
              <span className="text-2xl font-bold text-yellow-600">{deviceStatus.maintenance}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">停用</span>
              <span className="text-2xl font-bold text-gray-600">{deviceStatus.fault}</span>
            </div>
          </div>
        </Card>
      </div>

      <Card title="仪器列表">
        <div className="grid grid-cols-1 gap-4">
          {instruments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">暂无仪器数据</div>
          ) : (
            instruments.slice(0, 5).map((device) => (
              <div
                key={device.id}
                className={`bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-shadow ${
                  device.status === STATUS.INSTRUMENT.DISABLED ? 'opacity-75' : ''
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-base font-semibold text-gray-800">{device.name}</h3>
                      <StatusBadge status={device.status} type="INSTRUMENT" />
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-gray-600">
                      <div>型号：{device.model || '-'}</div>
                      <div>厂商：{device.manufacturer || '-'}</div>
                      <div>实验室：{device.lab?.name || device.lab_id || '-'}</div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatDateTime(device.created_at)}
                  </div>
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
      </Card>
    </div>
  );
}
