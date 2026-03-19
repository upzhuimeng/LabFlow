"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

export default function RegisterPage() {
    const canvasRef = useRef(null);
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const [form, setForm] = useState({
        username: "",
        name: "",
        cla: "",
        email: "",
        password: "",
        confirmPassword: ""
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (form.password !== form.confirmPassword) {
            alert("两次密码不一致");
            return;
        }

        try {
            await fetch("/users", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username: form.username,
                    name: form.name,
                    cla: form.cla,
                    email: form.email,
                    password: form.password,
                }),
            });
            alert("注册成功");
        } catch {
            alert("注册失败");
        }
    };

    // 粒子背景
    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

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

            ctx.fillStyle = "rgba(255,255,255,0.5)";

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

    return (
        <div className="relative flex items-center justify-center h-screen w-screen bg-black overflow-hidden">

            {/* 光晕 */}
            <div className="absolute w-[800px] h-[800px] bg-white opacity-10 blur-[200px] rounded-full"></div>

            {/* 粒子 */}
            <canvas ref={canvasRef} className="absolute inset-0"></canvas>

            {/* 注册卡片 */}
            <div className="relative z-10 w-[420px] p-10 rounded-2xl
            bg-white/10 backdrop-blur-xl
            border border-white/20
            shadow-[0_0_40px_rgba(255,255,255,0.1)]">

                <h1 className="text-3xl font-bold text-white text-center">
                    LabFlow
                </h1>

                <p className="text-gray-400 text-center mb-8">
                    创建你的实验室账号
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">

{/*                    <input
                        name="username"
                        placeholder="用户名"
                        className="w-full p-3 rounded-lg bg-black/40 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-white"
                        onChange={handleChange}
                    />*/}

                    <input
                        name="name"
                        placeholder="姓名"
                        className="w-full p-3 rounded-lg bg-black/40 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-white"
                        onChange={handleChange}
                    />

                    <input
                        name="phone"
                        placeholder="手机号"
                        className="w-full p-3 rounded-lg bg-black/40 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-white"
                        onChange={handleChange}
                    />

                    <input
                        name="email"
                        placeholder="邮箱"
                        className="w-full p-3 rounded-lg bg-black/40 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-white"

                        onChange={handleChange}
                    />

                    {/* 密码 */}
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            placeholder="密码"
                            className="w-full p-3 rounded-lg bg-black/40 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-white"
                            onChange={handleChange}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2"
                        >
                            <img
                                src={showPassword ? "/eye-off-line.svg" : "/eye-line.svg"}
                                className="w-5 h-5 opacity-70 hover:opacity-100"
                            />
                        </button>
                    </div>

                    {/* 确认密码 */}
                    <div className="relative">
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            name="confirmPassword"
                            placeholder="确认密码"
                            className="w-full p-3 rounded-lg bg-black/40 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-white"
                            onChange={handleChange}
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2"
                        >
                            <img
                                src={showConfirmPassword ? "/eye-off-line.svg" : "/eye-line.svg"}
                                className="w-5 h-5 opacity-70 hover:opacity-100"
                            />
                        </button>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-white text-black font-semibold p-3 rounded-lg
                        hover:bg-gray-200 hover:scale-[1.02] active:scale-[0.98]
                        transition duration-200"
                    >
                        注册
                    </button>

                </form>

                <p className="text-center text-sm text-gray-400 mt-6">
                    已有账号？
                    <Link href="/user/login" className="text-white ml-1 hover:underline">
                        去登录
                    </Link>
                </p>

            </div>
        </div>
    );
}