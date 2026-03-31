// -*- coding: utf-8 -*-
// File: page.js
// Created: 2026-03-29
// Author: zhuimeng
// Description: 登录页面

'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';

export default function LoginPage() {
    const canvasRef = useRef(null);
    const { login, loading, error } = useAuth();
    const [form, setForm] = useState({
        username: '',
        password: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [localError, setLocalError] = useState('');

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
        setLocalError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLocalError('');

        try {
            const data = await api.post('/auth/login', {
                username: form.username,
                password: form.password,
            });

            if (data.code === 200) {
                window.location.href = '/dashboard';
            } else {
                setLocalError(data.message || '登录失败');
            }
        } catch (err) {
            setLocalError(err.message || '登录失败，请检查用户名和密码');
        }
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const particles = [];

        for (let i = 0; i < 120; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                r: Math.random() * 2,
                dx: (Math.random() - 0.5) * 0.3,
                dy: (Math.random() - 0.5) * 0.3,
            });
        }

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = 'rgba(255,255,255,0.5)';

            particles.forEach((p) => {
                p.x += p.dx;
                p.y += p.dy;

                if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
                if (p.y < 0 || p.y > canvas.height) p.dy *= -1;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fill();
            });

            requestAnimationFrame(animate);
        }

        animate();
    }, []);

    const displayError = localError || error;

    return (
        <div className="relative flex items-center justify-center h-screen w-screen bg-black overflow-hidden">
            <div className="absolute w-[800px] h-[800px] bg-white opacity-10 blur-[200px] rounded-full"></div>

            <canvas ref={canvasRef} className="absolute inset-0"></canvas>

            <div className="relative z-10 w-[380px] p-10 rounded-2xl
      bg-white/10 backdrop-blur-xl
      border border-white/20
      shadow-[0_0_40px_rgba(255,255,255,0.1)]">

                <h1 className="text-3xl font-bold text-white text-center">
                    LabFlow
                </h1>

                <p className="text-gray-400 text-center mb-8">
                    实验室管理系统
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        name="username"
                        placeholder="用户名"
                        value={form.username}
                        className="w-full p-3 rounded-lg bg-black/40 border border-gray-600
            text-white placeholder-gray-400
            focus:outline-none focus:border-white transition"
                        onChange={handleChange}
                    />

                    <div className="relative">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            value={form.password}
                            placeholder="密码"
                            className="w-full p-3 rounded-lg bg-black/40 border border-gray-600
        text-white placeholder-gray-400
        focus:outline-none focus:border-white transition"
                            onChange={handleChange}
                        />

                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                        >
                            {showPassword ? (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            )}
                        </button>
                    </div>

                    {displayError && (
                        <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/50 text-red-200 text-sm">
                            {displayError}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-white text-black font-semibold p-3 rounded-lg
            hover:bg-gray-200 hover:scale-[1.02] active:scale-[0.98]
            transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? '登录中...' : '登录'}
                    </button>
                </form>

                <p className="text-center text-sm text-gray-400 mt-6">
                    没有账号？
                    <Link
                        href="/user/register"
                        className="text-white ml-1 hover:underline"
                    >
                        注册
                    </Link>
                </p>
            </div>
        </div>
    );
}
