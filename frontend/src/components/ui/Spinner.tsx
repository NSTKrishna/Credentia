import React from 'react';
import { Loader2 } from 'lucide-react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ size = 'md', className = '' }) => {
  let sizeClasses = '';
  switch (size) {
    case 'sm':
      sizeClasses = 'w-4 h-4';
      break;
    case 'md':
      sizeClasses = 'w-6 h-6';
      break;
    case 'lg':
      sizeClasses = 'w-8 h-8';
      break;
  }

  return (
    <Loader2 className={`animate-spin text-blue-600 ${sizeClasses} ${className}`} />
  );
};
