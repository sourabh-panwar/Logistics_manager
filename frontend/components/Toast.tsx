'use client';

import React, {useEffect} from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({message, type, onClose, duration = 5000}) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const bgColor = {
    success: 'bg-emerald-50 border-emerald-200 text-emerald-900',
    error: 'bg-rose-50 border-rose-200 text-rose-900',
    info: 'bg-stone-50 border-stone-200 text-stone-900',
  }[type];

  const icon = {
    success: '✓',
    error: '!',
    info: 'i',
  }[type];

  return (
    <div className={`fixed right-5 top-5 z-50 flex max-w-sm items-center gap-3 rounded-md border p-4 text-sm shadow-lg ${bgColor}`}>
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-current text-xs font-semibold">
        {icon}
      </span>
      <span>{message}</span>
    </div>
  );
};

export default Toast;
