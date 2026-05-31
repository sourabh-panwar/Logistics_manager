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
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  }[type];

  const icon = {
    success: '✓',
    error: '⚠️',
    info: 'ℹ️',
  }[type];

  return (
    <div className={`fixed top-4 right-4 max-w-sm border rounded-lg p-4 shadow-lg ${bgColor}`}>
      {icon} {message}
    </div>
  );
};

export default Toast;