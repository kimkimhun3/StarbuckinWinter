'use client'

import { useEffect, useState } from 'react';

export default function LoadingScreen() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#F5F1E8] animate-fadeOut" style={{ animationDelay: '1.5s', animationFillMode: 'forwards' }}>
      <svg
        viewBox="0 0 100 100"
        className="w-24 h-24 animate-spin-slow"
        style={{ animation: 'spin 2s linear infinite' }}
      >
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="#3D3D3D"
          strokeWidth="2"
          strokeDasharray="70 200"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

