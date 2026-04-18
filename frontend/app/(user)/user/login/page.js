// -*- coding: utf-8 -*-
// File: page.js
// Created: 2026-03-29
// Author: zhuimeng
// Description: 登录页面

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import config from '@/config';

export default function LoginPage() {
    const router = useRouter();
    const [form, setForm] = useState({
        identifier: '',
        password: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [localError, setLocalError] = useState('');
    const [loading, setLoading] = useState(false);
    const [systemStatus, setSystemStatus] = useState({ ok: false, message: '检测中...' });

    useEffect(() => {
        const checkHealth = async () => {
            try {
                const res = await fetch(config.LOGIN_HEALTH_URL);
                const data = await res.json();
                if (data.status === 'ok' && data.database === 'ok') {
                    setSystemStatus({ ok: true, message: '系统运行正常' });
                } else if (data.status === 'error' && data.database) {
                    setSystemStatus({ ok: false, message: '数据库连接失败' });
                } else {
                    setSystemStatus({ ok: false, message: '后端服务异常' });
                }
            } catch {
                setSystemStatus({ ok: false, message: '后端服务连接失败' });
            }
        };
        checkHealth();
        const interval = setInterval(checkHealth, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
        setLocalError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (!form.identifier || !form.password) {
            setLocalError('请输入手机号/邮箱和密码');
            return;
        }
        
        setLocalError('');
        setLoading(true);

        try {
            const result = await api.post('/auth/login', {
                identifier: form.identifier,
                password: form.password,
            });

            if (result?.code === 200 && result?.data?.access_token) {
                localStorage.setItem('access_token', result.data.access_token);
                
                try {
                    const userData = await api.get('/users/me');
                    if (userData?.code === 200) {
                        localStorage.setItem('user', JSON.stringify(userData.data));
                    }
                } catch (userErr) {
                    console.error('Failed to fetch user data:', userErr);
                }
                
                router.push('/dashboard');
            } else {
                setLocalError(result?.message || '登录失败');
            }
        } catch (err) {
            console.error('Login error:', err);
            const errorMessage = err?.message || err?.data?.message || '登录失败，请检查手机号/邮箱和密码';
            setLocalError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gradient-to-br from-slate-100 to-blue-50 min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-xl shadow-blue-100/50 p-8">
                    <div className="flex items-center justify-center mb-6">
                        <div className="flex items-center">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mr-3">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/>
                                </svg>
                            </div>
                            <span className="text-2xl font-bold text-gray-800 tracking-tight">LabFlow</span>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">手机号/邮箱</label>
                            <input
                                type="text"
                                name="identifier"
                                placeholder="请输入手机号或邮箱"
                                value={form.identifier}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-800 placeholder-gray-400"
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">密码</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    placeholder="请输入密码"
                                    value={form.password}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-800 placeholder-gray-400 pr-12"
                                    onChange={handleChange}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    {showPassword ? (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        {localError && (
                            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
                                {localError}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 active:bg-blue-800 transition-all text-base disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? '登录中...' : '登录'}
                        </button>
                    </form>


                </div>

                <div className="mt-6 text-center">
                    <div className={`inline-flex items-center space-x-2 text-xs ${systemStatus.ok ? 'text-gray-400' : 'text-red-500'}`}>
                        <span className={`w-2 h-2 rounded-full ${systemStatus.ok ? 'bg-green-500' : 'bg-red-500'}`}></span>
                        <span>{systemStatus.message}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
