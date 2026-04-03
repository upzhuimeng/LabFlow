// -*- coding: utf-8 -*-
// File: page.js
// Description: 仪器详情页

'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/Toast';
import { STATUS_TEXT } from '@/lib/constants';

const STATUS_BADGE_CLASS = {
  0: 'bg-green-100 text-green-700',
  1: 'bg-yellow-100 text-yellow-700',
  2: 'bg-gray-100 text-gray-700',
  3: 'bg-red-100 text-red-700',
};

export default function InstrumentDetailPage() {
  const { id } = useParams();
  const { user, isAdmin } = useAuth();
  const toast = useToast();
  const [instrument, setInstrument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(0);

  useEffect(() => {
    if (!id) return;
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/instruments/${id}`);
        setInstrument(res.data);
        setSelectedStatus(res.data.status);
      } catch (err) {
        setError(err.message);
        toast.error(err.message || '获取仪器详情失败');
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  const handleStatusUpdate = async () => {
    try {
      await api.put(`/instruments/${instrument.id}`, { status: selectedStatus });
      const res = await api.get(`/instruments/${instrument.id}`);
      setInstrument(res.data);
      setIsStatusModalOpen(false);
      toast.success('状态更新成功');
    } catch (err) {
      toast.error(err.message || '更新状态失败');
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

  if (loading) return <div className="p-6">加载中...</div>;
  if (error) return <div className="p-6 text-red-500">错误: {error}</div>;
  if (!instrument) return <div className="p-6">仪器不存在</div>;

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <Link href="/instrument" className="flex items-center border border-gray-300 bg-white hover:bg-gray-300 text-gray-600 py-3 px-3 rounded">
          <span className="mr-1 leading-none">← 返回</span>
        </Link>
        <h1 className="text-2xl font-bold mt-3">{instrument.name}</h1>
        <div className="w-20"></div>
      </div>

      <div className="bg-white shadow rounded-lg border border-gray-200 p-6 my-8 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
        <h2 className="text-lg font-semibold mb-4">设备信息</h2>
        <div className="border-t border-gray-300/70 my-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
          <div><span className="font-medium">设备名称：</span>{instrument.name}</div>
          <div><span className="font-medium">型号：</span>{instrument.model || '未知'}</div>
          <div><span className="font-medium">厂商：</span>{instrument.manufacturer || '未知'}</div>
          <div><span className="font-medium">供应商：</span>{instrument.supplier || '未填写'}</div>
          <div><span className="font-medium">购买日期：</span>{instrument.purchase_date || '未填写'}</div>
          <div><span className="font-medium">价格：</span>{instrument.price ? `¥${instrument.price}` : '未填写'}</div>
          <div><span className="font-medium">所属实验室：</span>{instrument.lab_name || instrument.lab_id || '未填写'}</div>
          <div><span className="font-medium">备注：</span>{instrument.remark || '无'}</div>
          <div className="md:col-span-2 flex items-center">
            <span className="font-medium mr-2">状态：</span>
            {getStatusBadge(instrument.status)}
          </div>
        </div>
        <div className="border-t border-gray-300/50 my-6"></div>
        <div className="flex gap-3 mt-6 justify-end">
          {!isAdmin && instrument.status === 0 && (
            <Link
              href={`/reservation/my?instrument_id=${instrument.id}&lab_id=${instrument.lab_id}`}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              预约
            </Link>
          )}
          {isAdmin && instrument.status !== 3 && (
            <button
              onClick={() => {
                setSelectedStatus(instrument.status);
                setIsStatusModalOpen(true);
              }}
              className="bg-orange-400 text-white px-4 py-2 rounded hover:bg-orange-600"
            >
              修改状态
            </button>
          )}
        </div>
      </div>

      {isStatusModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black/30 transition-opacity"></div>
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative w-full max-w-md rounded-lg bg-white shadow-xl">
              <div className="border-b px-6 py-4">
                <h3 className="text-xl font-semibold">修改状态</h3>
              </div>
              <div className="px-6 py-4">
                <label className="block mb-2 text-sm font-medium">选择新状态</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                >
                  <option value={0}>正常</option>
                  <option value={1}>维修</option>
                  <option value={2}>停用</option>
                </select>
              </div>
              <div className="border-t px-6 py-4 flex justify-end gap-3">
                <button onClick={() => setIsStatusModalOpen(false)} className="px-4 py-2 border rounded hover:bg-gray-50">取消</button>
                <button onClick={handleStatusUpdate} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">确认</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}