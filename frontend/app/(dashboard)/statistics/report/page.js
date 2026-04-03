// -*- coding: utf-8 -*-
// File: page.js
// Description: 统计报表页面

'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card } from '@/components/ui';
import api from '@/lib/api';
import { useToast } from '@/components/Toast';

const REPORT_TYPES = {
  weekly: { label: '周报', days: 7 },
  monthly: { label: '月报', days: 30 },
};

const STATUS_TEXT = {
  total: '预约总数',
  approved: '已通过',
  rejected: '已拒绝',
  cancelled: '已取消',
  pending: '待审批',
};

function ChangeIndicator({ change }) {
  const isPositive = change >= 0;
  const colorClass = isPositive ? 'text-green-600' : 'text-red-600';
  const arrow = isPositive ? '↑' : '↓';

  return (
    <span className={`ml-2 text-sm font-medium ${colorClass}`}>
      {arrow} {Math.abs(change).toFixed(1)}%
    </span>
  );
}

function StatsCard({ title, value, change, color = 'gray' }) {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    gray: 'bg-gray-50 text-gray-600',
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="text-sm text-gray-500 mb-1">{title}</div>
      <div className="flex items-baseline gap-2">
        <span className={`text-2xl font-bold ${colorMap[color].split(' ')[1]}`}>
          {value}
        </span>
        {change !== undefined && <ChangeIndicator change={change} />}
      </div>
    </div>
  );
}

function LabRankingTable({ labs }) {
  if (!labs || labs.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">暂无数据</div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-2 px-3 text-sm font-medium text-gray-600">排名</th>
            <th className="text-left py-2 px-3 text-sm font-medium text-gray-600">实验室</th>
            <th className="text-right py-2 px-3 text-sm font-medium text-gray-600">预约次数</th>
            <th className="text-right py-2 px-3 text-sm font-medium text-gray-600">通过次数</th>
          </tr>
        </thead>
        <tbody>
          {labs.map((lab, index) => (
            <tr key={lab.lab_id} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="py-2 px-3">
                <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium ${
                  index === 0 ? 'bg-yellow-100 text-yellow-700' :
                  index === 1 ? 'bg-gray-100 text-gray-700' :
                  index === 2 ? 'bg-orange-100 text-orange-700' :
                  'bg-gray-50 text-gray-600'
                }`}>
                  {index + 1}
                </span>
              </td>
              <td className="py-2 px-3 text-sm text-gray-800">{lab.lab_name}</td>
              <td className="py-2 px-3 text-sm text-gray-600 text-right">{lab.reservation_count}</td>
              <td className="py-2 px-3 text-sm text-gray-600 text-right">{lab.approved_count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function UserRankingTable({ users }) {
  if (!users || users.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">暂无数据</div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-2 px-3 text-sm font-medium text-gray-600">排名</th>
            <th className="text-left py-2 px-3 text-sm font-medium text-gray-600">用户</th>
            <th className="text-left py-2 px-3 text-sm font-medium text-gray-600">手机号</th>
            <th className="text-right py-2 px-3 text-sm font-medium text-gray-600">预约次数</th>
            <th className="text-right py-2 px-3 text-sm font-medium text-gray-600">通过次数</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, index) => (
            <tr key={user.user_id} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="py-2 px-3">
                <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium ${
                  index === 0 ? 'bg-yellow-100 text-yellow-700' :
                  index === 1 ? 'bg-gray-100 text-gray-700' :
                  index === 2 ? 'bg-orange-100 text-orange-700' :
                  'bg-gray-50 text-gray-600'
                }`}>
                  {index + 1}
                </span>
              </td>
              <td className="py-2 px-3 text-sm text-gray-800">{user.user_name}</td>
              <td className="py-2 px-3 text-sm text-gray-600">{user.user_phone}</td>
              <td className="py-2 px-3 text-sm text-gray-600 text-right">{user.reservation_count}</td>
              <td className="py-2 px-3 text-sm text-gray-600 text-right">{user.approved_count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TimeSlotChart({ timeSlots }) {
  if (!timeSlots || Object.keys(timeSlots).length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">暂无数据</div>
    );
  }

  const maxCount = Math.max(...Object.values(timeSlots), 1);

  return (
    <div className="space-y-2">
      {Object.entries(timeSlots)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([hour, count]) => {
          const percentage = (count / maxCount) * 100;
          return (
            <div key={hour} className="flex items-center gap-3">
              <span className="text-sm text-gray-600 w-12">{hour}</span>
              <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                <div
                  className="bg-blue-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="text-sm text-gray-600 w-8 text-right">{count}</span>
            </div>
          );
        })}
    </div>
  );
}

export default function StatisticsReportPage() {
  const toast = useToast();
  const toastRef = useRef(toast);
  toastRef.current = toast;

  const [reportType, setReportType] = useState('weekly');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [aiSummary, setAiSummary] = useState(null);

  const fetchReport = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/statistics/report', {
        params: { type: reportType },
      });
      setReport(res.data);
    } catch (err) {
      setError(err.message || '获取报表失败');
      toastRef.current.error(err.message || '获取报表失败');
    } finally {
      setLoading(false);
    }
  }, [reportType, toastRef]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const handleAISummary = async () => {
    if (!report) return;
    try {
      await api.post('/agent/statistics/summarize', {
        report_data: report,
        report_type: reportType,
      });
      toastRef.current.success(`${reportType === 'weekly' ? '周报' : '月报'}正在生成中，完成后将发送到您的信箱`);
      setAiSummary(null);
    } catch (err) {
      toastRef.current.error(err.message || '生成总结失败');
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[calc(100vh-80px)]">
        <div className="text-lg text-gray-600">加载中...</div>
      </div>
    );
  }

  const stats = report?.current_period || {};
  const changes = report?.changes || {};

  return (
    <div className="p-6 bg-gray-50 min-h-[calc(100vh-80px)]">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">统计报表</h1>
        <p className="text-gray-600 mt-1">查看实验室使用情况统计</p>
      </div>

      <div className="mb-6 flex gap-2 items-center">
        <button
          onClick={() => setReportType('weekly')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            reportType === 'weekly'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          周报
        </button>
        <button
          onClick={() => setReportType('monthly')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            reportType === 'monthly'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          月报
        </button>
        <div className="flex-1" />
        <button
          onClick={handleAISummary}
          disabled={!report}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
            !report
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-purple-600 text-white hover:bg-purple-700'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          AI 总结
        </button>
      </div>

      {error ? (
        <Card>
          <div className="text-center py-8">
            <div className="text-red-500 mb-4">{error}</div>
            <button
              onClick={fetchReport}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              重试
            </button>
          </div>
        </Card>
      ) : report ? (
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">
                {reportType === 'weekly' ? '本周' : '本月'}概况
              </h2>
              <span className="text-sm text-gray-500">
                {report.start_date} ~ {report.end_date}
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <StatsCard
                title="预约总数"
                value={stats.total}
                change={changes.total_change}
                color="blue"
              />
              <StatsCard
                title="已通过"
                value={stats.approved}
                change={changes.approved_change}
                color="green"
              />
              <StatsCard
                title="已拒绝"
                value={stats.rejected}
                change={changes.rejected_change}
                color="red"
              />
              <StatsCard title="已取消" value={stats.cancelled} color="yellow" />
              <StatsCard title="待审批" value={stats.pending} color="gray" />
            </div>
          </div>

          {aiSummary && (
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200 p-4">
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <h3 className="text-lg font-semibold text-purple-800">AI 数据总结</h3>
              </div>
              <div className="prose prose-sm max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{aiSummary}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card title="实验室使用排名">
              <LabRankingTable labs={report.lab_stats} />
            </Card>

            <Card title="用户活跃度排名">
              <UserRankingTable users={report.user_stats} />
            </Card>
          </div>

          <Card title="预约时段分布">
            <TimeSlotChart timeSlots={report.time_slot_stats} />
          </Card>

          {reportType === 'monthly' && report.abnormal_users && report.abnormal_users.length > 0 && (
            <Card title="异常用户提醒">
              <div className="space-y-2">
                {report.abnormal_users.map((user) => (
                  <div
                    key={user.user_id}
                    className="flex items-center justify-between py-2 px-3 bg-yellow-50 rounded-lg"
                  >
                    <span className="text-sm text-gray-800">{user.user_name}</span>
                    <span className="text-sm text-yellow-700">
                      取消次数: {user.cancel_count}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      ) : (
        <Card>
          <div className="text-center py-8 text-gray-500">暂无数据</div>
        </Card>
      )}
    </div>
  );
}