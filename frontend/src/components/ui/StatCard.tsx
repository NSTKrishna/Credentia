import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color: 'blue' | 'green' | 'amber' | 'red';
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, icon: Icon, color }) => {
  let colorClasses = '';

  switch (color) {
    case 'blue':
      colorClasses = 'bg-blue-50 text-blue-600';
      break;
    case 'green':
      colorClasses = 'bg-green-50 text-green-600';
      break;
    case 'amber':
      colorClasses = 'bg-amber-50 text-amber-600';
      break;
    case 'red':
      colorClasses = 'bg-red-50 text-red-600';
      break;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex items-center">
      <div className={`p-3 rounded-lg ${colorClasses} mr-4`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
      </div>
    </div>
  );
};
