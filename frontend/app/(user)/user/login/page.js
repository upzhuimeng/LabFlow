"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";


export default function LoginPage() {
    const canvasRef = useRef(null);

    const [form, setForm] = useState({
        username: "",
        password: ""
    });

    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const res = await fetch("/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(form),
            });

            const data = await res.json();

            if (data.code === 200) {
                window.location.href = "/dashboard";
            } else {
                alert(data.message);
            }
        } catch {
            alert("登录失败");
        }
    };

    // 鼠标粒子背景
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

            {/* 背景光晕 */}
            <div className="absolute w-[800px] h-[800px] bg-white opacity-10 blur-[200px] rounded-full"></div>

            {/* 粒子动画 */}
            <canvas ref={canvasRef} className="absolute inset-0"></canvas>

            {/* 登录卡片 */}
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
                        className="w-full p-3 rounded-lg bg-black/40 border border-gray-600
            text-white placeholder-gray-400
            focus:outline-none focus:border-white transition"
                        onChange={handleChange}
                    />

                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
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
                            className="absolute right-3 top-1/2 -translate-y-1/2"
                        >
                            <img
                                src={showPassword ? "/eye-off-line.svg" : "/eye-line.svg"}
                                alt="toggle password"
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
                        登录
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