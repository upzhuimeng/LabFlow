'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useToast } from './Toast';

export default function ReservationAssistant({ onSuggestionAccepted }) {
  const router = useRouter();
  const toast = useToast();
  const toastRef = useRef(toast);
  toastRef.current = toast;
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const generatingTimerRef = useRef(null);
  const [result, setResult] = useState(null);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    return () => {
      if (generatingTimerRef.current) {
        clearTimeout(generatingTimerRef.current);
      }
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() || generating) return;

    setLoading(true);
    setResult(null);
    setShowResult(false);
    setGenerating(true);

    toastRef.current.success('正在分析您的需求，无需停留在此页面，结果将发送到您的消息通知');

    if (generatingTimerRef.current) {
      clearTimeout(generatingTimerRef.current);
    }
    generatingTimerRef.current = setTimeout(() => {
      setGenerating(false);
    }, 30000);

    try {
      const res = await api.post('/agent/reservation/assist', { message });
      const data = res.data;

      if (data?.success) {
        setMessage('');
      } else {
      }
    } catch (err) {
      toastRef.current.error(err.message || '智能助手出错');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = () => {
    if (result?.suggestion) {
      const { lab_id, start_time, end_time } = result.suggestion;
      
      if (onSuggestionAccepted) {
        onSuggestionAccepted(result.suggestion);
      }
      
      const params = new URLSearchParams({
        lab_id: lab_id.toString(),
        start_time: start_time,
        end_time: end_time,
        from_assistant: 'true',
      });
      
      router.push(`/reservation/my?${params}`);
    }
  };

  const handleReject = () => {
    setShowResult(false);
    setResult(null);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <div>
          <h3 className="font-semibold text-gray-800">智能预约助手</h3>
          <p className="text-xs text-gray-500">AI 帮您找到合适的实验室和时间</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="描述您的预约需求，如：我想预约一个化学实验室做有机合成实验，明天下午2点到5点"
          className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
          rows={3}
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || generating || !message.trim()}
          className="mt-3 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {generating ? (
            <>
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>分析中...</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span>帮我找实验室</span>
            </>
          )}
        </button>
      </form>

      {showResult && result?.suggestion && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <h4 className="font-medium text-green-800 mb-2">推荐结果</h4>
              <div className="text-sm text-green-700 space-y-1">
                <p><span className="font-medium">实验室：</span>{result.suggestion.lab_name}</p>
                <p><span className="font-medium">地址：</span>{result.suggestion.address || '未提供'}</p>
                <p><span className="font-medium">时间：</span>{result.suggestion.start_time} ~ {result.suggestion.end_time}</p>
                <p><span className="font-medium">理由：</span>{result.suggestion.reason}</p>
              </div>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={handleAccept}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
            >
              确认预约
            </button>
            <button
              onClick={handleReject}
              className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-100 text-sm"
            >
              取消
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
