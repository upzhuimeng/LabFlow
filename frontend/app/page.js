'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function Home() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (isAuthenticated) {
        router.push('/dashboard');
      } else {
        router.push('/user/login');
      }
    }
  }, [loading, isAuthenticated, router]);

  return (
    <div className="flex items-center justify-center h-[calc(100vh-80px)]">
      <div className="text-lg text-gray-600">跳转中...</div>
    </div>
  );
}
