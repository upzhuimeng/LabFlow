// -*- coding: utf-8 -*-
// File: page.js
// Description: 通知详情页

'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { STATUS_TEXT } from '@/lib/constants';
import { formatDateTime } from '@/lib/utils';
import { useToast } from '@/components/Toast';

const NOTIFICATION_TYPE_CLASS = {
  1: 'bg-blue-100 text-blue-700',
  2: 'bg-yellow-100 text-yellow-700',
  3: 'bg-gray-100 text-gray-700',
  4: 'bg-purple-100 text-purple-700',
  5: 'bg-indigo-100 text-indigo-700',
};

const TYPE_TEXT = {
  1: '审批结果',
  2: '预约失效',
  3: '系统通知',
  4: '智能推荐',
  5: 'AI总结',
};

const RESERVATION_STATUS_TEXT = {
  0: '审批中',
  1: '已通过',
  2: '已拒绝',
  3: '已取消',
  4: '草稿',
  5: '已失效',
};

const STATUS_BADGE_CLASS = {
  0: 'bg-blue-100 text-blue-700',
  1: 'bg-green-100 text-green-700',
  2: 'bg-red-100 text-red-700',
  3: 'bg-gray-100 text-gray-700',
  4: 'bg-yellow-100 text-yellow-700',
};

function AgentRecommendationCard({ data }) {
  const router = useRouter();

  const handleAccept = () => {
    if (data.lab_id && data.start_time && data.end_time) {
      const params = new URLSearchParams({
        lab_id: data.lab_id.toString(),
        start_time: data.start_time,
        end_time: data.end_time,
        from_assistant: 'true',
      });
      if (data.purpose) {
        params.set('purpose', data.purpose);
      }
      router.push(`/reservation/my?${params}`);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-purple-200 p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-medium text-purple-800">{data.lab_name || '未知实验室'}</h4>
          <p className="text-sm text-gray-500">{data.address || '地址未提供'}</p>
        </div>
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
          智能推荐
        </span>
      </div>
      {data.start_time && data.end_time && (
        <p className="text-sm text-gray-600 mb-2">
          <span className="font-medium">推荐时间：</span>
          {data.start_time} ~ {data.end_time}
        </p>
      )}
      {data.reason && (
        <p className="text-sm text-gray-600 mb-2">
          <span className="font-medium">推荐理由：</span>
          {data.reason}
        </p>
      )}
      {data.purpose && (
        <p className="text-sm text-gray-600 mb-2">
          <span className="font-medium">用途说明：</span>
          {data.purpose}
        </p>
      )}
      {data.equipment && data.equipment.length > 0 && (
        <p className="text-sm text-gray-600 mb-2">
          <span className="font-medium">设备：</span>
          {Array.isArray(data.equipment) ? data.equipment.join('、') : data.equipment}
        </p>
      )}
      <div className="mt-4 flex gap-2">
        <button
          onClick={handleAccept}
          className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
        >
          确认预约
        </button>
      </div>
    </div>
  );
}

function ApprovalResultCard({ data }) {
  const isApproved = data.approval_result === 'approved';

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-medium text-gray-800">{data.lab_name || '未知实验室'}</h4>
          <p className="text-sm text-gray-500">
            {data.start_time} ~ {data.end_time}
          </p>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          isApproved ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {isApproved ? '已通过' : '已拒绝'}
        </span>
      </div>
      {data.purpose && (
        <p className="text-sm text-gray-600 mb-2">
          <span className="font-medium">使用目的：</span>
          {data.purpose}
        </p>
      )}
      <p className="text-sm text-gray-600 mb-2">
        <span className="font-medium">审批人：</span>
        {data.approver_name || '未知'}
      </p>
      {data.comment && (
        <p className="text-sm text-gray-600 mb-2">
          <span className="font-medium">审批意见：</span>
          {data.comment}
        </p>
      )}
      {!isApproved && (
        <div className="mt-4">
          <Link
            href={`/reservation/my?reapply=${data.lab_id}`}
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
          >
            修改后重新申请
          </Link>
        </div>
      )}
    </div>
  );
}

export default function NotificationDetailPage() {
  const { id } = useParams();
  const toast = useToast();
  const toastRef = useRef(toast);
  toastRef.current = toast;
  const [notification, setNotification] = useState(null);
  const [reservation, setReservation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [marking, setMarking] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/notifications/${id}`);
        if (!cancelled) {
          setNotification(res.data);
          if (res.data.type === 1 && res.data.related_id) {
            fetchReservation(res.data.related_id);
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
          toastRef.current.error(err.message || '获取通知详情失败');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };
    const fetchReservation = async (reservationId) => {
      try {
        const res = await api.get(`/reservations/${reservationId}`);
        if (!cancelled) {
          setReservation(res.data);
        }
      } catch (err) {
        // ignore
      }
    };
    fetchDetail();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleMarkAsRead = async () => {
    if (!notification || notification.is_read === 1) return;
    setMarking(true);
    try {
      await api.put(`/notifications/${notification.id}/read`);
      setNotification(prev => ({ ...prev, is_read: 1 }));
      toast.success('已标记为已读');
      window.dispatchEvent(new Event('notification:refresh'));
    } catch (err) {
      toast.error(err.message || '操作失败');
    } finally {
      setMarking(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[calc(100vh-80px)]">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  if (error || !notification) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[calc(100vh-80px)]">
        <div className="text-red-500 mb-4">{error || '通知不存在'}</div>
        <Link href="/notifications" className="text-blue-600 hover:text-blue-800">
          返回通知列表
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 min-h-[calc(100vh-80px)]">
      <div className="mb-6">
        <Link
          href="/notifications"
          className="inline-flex items-center text-gray-600 hover:text-gray-800 transition-colors"
        >
          <span className="mr-1">←</span>
          <span>返回通知列表</span>
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                NOTIFICATION_TYPE_CLASS[notification.type] ||
                NOTIFICATION_TYPE_CLASS[3]
              }`}
            >
              {TYPE_TEXT[notification.type] || '系统通知'}
            </span>
            <span className="text-sm text-gray-400">
              {formatDateTime(notification.created_at)}
            </span>
            {notification.is_read === 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                未读
              </span>
            )}
          </div>
          <h1 className="text-xl lg:text-2xl font-bold text-gray-800">
            {notification.title}
          </h1>
        </div>

        <div className="p-6">
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
              {notification.content}
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100 flex justify-between items-center">
            <div className="text-sm text-gray-400">
              收到时间：{formatDateTime(notification.created_at)}
            </div>
            {notification.is_read === 0 && (
              <button
                onClick={handleMarkAsRead}
                disabled={marking}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {marking ? '标记中...' : '标为已读'}
              </button>
            )}
          </div>
        </div>

        <div className="border-t border-gray-100 p-6 bg-gray-50/50">
          <h3 className="text-sm font-medium text-gray-700 mb-3">附件</h3>
          {notification.type === 4 && notification.attachment ? (
            (() => {
              let attachmentData;
              try {
                attachmentData = typeof notification.attachment === 'string' 
                  ? JSON.parse(notification.attachment) 
                  : notification.attachment;
              } catch {
                return null;
              }
              if (!attachmentData.lab_id) {
                return (
                  <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 text-center">
                    <p className="text-gray-500 text-sm">
                      {attachmentData.reason || '未找到合适的实验室推荐'}
                    </p>
                  </div>
                );
              }
              return <AgentRecommendationCard data={attachmentData} />;
            })()
          ) : notification.type === 1 && notification.attachment ? (
            (() => {
              let attachmentData;
              try {
                attachmentData = typeof notification.attachment === 'string' 
                  ? JSON.parse(notification.attachment) 
                  : notification.attachment;
              } catch {
                return null;
              }
              return <ApprovalResultCard data={attachmentData} />;
            })()
          ) : notification.type === 5 && notification.attachment ? (
            (() => {
              let attachmentData;
              try {
                attachmentData = typeof notification.attachment === 'string' 
                  ? JSON.parse(notification.attachment) 
                  : notification.attachment;
              } catch {
                return null;
              }
              const stats = attachmentData.stats || {};
              const labStats = attachmentData.lab_stats || [];
              return (
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <span className="text-sm font-medium text-indigo-700">
                        {attachmentData.report_type === 'daily' ? '日报' : attachmentData.report_type === 'weekly' ? '周报' : '月报'} AI 总结
                      </span>
                    </div>
                    <p className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">
                      {attachmentData.summary}
                    </p>
                    <div className="mt-3 pt-3 border-t border-indigo-200 text-xs text-gray-500">
                      统计周期：{attachmentData.period}
                    </div>
                  </div>

                  {Object.keys(stats).length > 0 && (
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">数据概览</h4>
                      <div className="grid grid-cols-5 gap-2">
                        <div className="text-center">
                          <div className="text-lg font-bold text-blue-600">{stats.total || 0}</div>
                          <div className="text-xs text-gray-500">总数</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-green-600">{stats.approved || 0}</div>
                          <div className="text-xs text-gray-500">已通过</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-red-600">{stats.rejected || 0}</div>
                          <div className="text-xs text-gray-500">已拒绝</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-yellow-600">{stats.cancelled || 0}</div>
                          <div className="text-xs text-gray-500">已取消</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-gray-600">{stats.pending || 0}</div>
                          <div className="text-xs text-gray-500">待审批</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {labStats.length > 0 && (
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">实验室使用排名 TOP 3</h4>
                      <div className="space-y-2">
                        {labStats.slice(0, 3).map((lab, index) => (
                          <div key={lab.lab_id} className="flex items-center justify-between text-sm">
                            <span className="flex items-center gap-2">
                              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                                index === 0 ? 'bg-yellow-100 text-yellow-700' :
                                index === 1 ? 'bg-gray-100 text-gray-700' :
                                'bg-orange-100 text-orange-700'
                              }`}>
                                {index + 1}
                              </span>
                              <span className="text-gray-700">{lab.lab_name}</span>
                            </span>
                            <span className="text-gray-500">{lab.reservation_count} 次预约</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()
          ) : reservation ? (
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-medium text-gray-800">{reservation.lab_name}</h4>
                  <p className="text-sm text-gray-500">
                    {formatDateTime(reservation.start_time)} - {formatDateTime(reservation.end_time)}
                  </p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  STATUS_BADGE_CLASS[reservation.status] || STATUS_BADGE_CLASS[0]
                }`}>
                  {RESERVATION_STATUS_TEXT[reservation.status] || '未知'}
                </span>
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-medium">使用目的：</span>
                {reservation.purpose || '未填写'}
              </div>
            </div>
          ) : (
            <div className="min-h-[100px] border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center text-gray-400 text-sm">
              暂无附件
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
