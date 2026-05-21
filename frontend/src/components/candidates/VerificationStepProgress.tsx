'use client';

import React from 'react';
import { Loader2, CheckCircle, XCircle, Circle } from 'lucide-react';
import { VerificationStep } from '@/hooks/useVerification';

interface VerificationStepProgressProps {
  steps: VerificationStep[];
  overallStatus: string | null;
  error?: string | null;
}

const StepIcon: React.FC<{ status: VerificationStep['status'] }> = ({ status }) => {
  switch (status) {
    case 'running':
      return <Loader2 className="w-5 h-5 text-blue-600 animate-spin shrink-0" />;
    case 'success':
      return <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />;
    case 'failed':
      return <XCircle className="w-5 h-5 text-red-500 shrink-0" />;
    default:
      return <Circle className="w-5 h-5 text-slate-300 shrink-0" />;
  }
};

const stepTextColor = (status: VerificationStep['status']): string => {
  switch (status) {
    case 'running': return 'text-slate-800 font-medium';
    case 'success': return 'text-green-700 font-medium';
    case 'failed':  return 'text-red-700 font-medium';
    default:        return 'text-slate-400';
  }
};

const overallBg = (status: string | null): string => {
  switch (status) {
    case 'VERIFIED': return 'bg-green-50 border-green-200 text-green-800';
    case 'FAILED':   return 'bg-red-50 border-red-200 text-red-800';
    case 'PARTIAL':  return 'bg-orange-50 border-orange-200 text-orange-800';
    default:         return 'bg-slate-50 border-slate-200 text-slate-800';
  }
};

export const VerificationStepProgress: React.FC<VerificationStepProgressProps> = ({
  steps,
  overallStatus,
  error,
}) => {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
      {steps.map((step, i) => (
        <div
          key={i}
          className="flex items-center gap-3 transition-all duration-300"
          style={{ animationDelay: `${i * 100}ms` }}
        >
          <StepIcon status={step.status} />
          <span className={`text-sm transition-colors duration-300 ${stepTextColor(step.status)}`}>
            {step.label}
          </span>
        </div>
      ))}

      {/* Overall result banner — fades in once overallStatus is set */}
      {overallStatus && (
        <div
          className={`flex items-center gap-3 mt-4 pt-3 border-t border-slate-200 rounded-b-lg px-2 py-2 animate-in fade-in duration-500 ${overallBg(overallStatus)}`}
        >
          {overallStatus === 'VERIFIED' ? (
            <CheckCircle className="w-5 h-5 shrink-0" />
          ) : (
            <XCircle className="w-5 h-5 shrink-0" />
          )}
          <span className="text-sm font-bold">
            Verification complete — {overallStatus}
          </span>
        </div>
      )}

      {/* API-level error (e.g. 403, 500) */}
      {error && !overallStatus && (
        <div className="flex items-center gap-3 mt-4 pt-3 border-t border-red-100 bg-red-50 rounded-b-lg px-2 py-2 animate-in fade-in duration-300">
          <XCircle className="w-5 h-5 text-red-500 shrink-0" />
          <span className="text-sm font-medium text-red-700">{error}</span>
        </div>
      )}
    </div>
  );
};
