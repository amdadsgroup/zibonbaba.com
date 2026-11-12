'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LegacyVendorRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/seller');
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="text-center text-slate-400 text-xs font-bold animate-pulse">
        Redirecting to Seller Portal...
      </div>
    </div>
  );
}
