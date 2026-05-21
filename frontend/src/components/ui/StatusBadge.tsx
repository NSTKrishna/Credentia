import React from 'react';

type Status = 'PENDING' | 'VERIFIED' | 'FAILED' | 'PARTIAL';

interface StatusBadgeProps {
  status: Status;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  let bgColor = '';
  let textColor = '';
  let label = status;

  switch (status) {
    case 'VERIFIED':
      bgColor = 'bg-green-100';
      textColor = 'text-green-700';
      break;
    case 'FAILED':
      bgColor = 'bg-red-100';
      textColor = 'text-red-700';
      break;
    case 'PENDING':
      bgColor = 'bg-amber-100';
      textColor = 'text-amber-700';
      break;
    case 'PARTIAL':
      bgColor = 'bg-orange-100';
      textColor = 'text-orange-700';
      break;
    default:
      bgColor = 'bg-slate-100';
      textColor = 'text-slate-700';
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor} ${textColor}`}
    >
      {label}
    </span>
  );
};
