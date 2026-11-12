'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';

export default function CustomerPageRedirect() {
  const router = useRouter();
  const isLoggedIn = useStore((s) => s.isLoggedIn);

  useEffect(() => {
    if (isLoggedIn) {
      router.replace('/dashboard');
    } else {
      router.replace('/customer/login');
    }
  }, [router, isLoggedIn]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}
