'use client';

import React, { useState, useEffect } from 'react';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

interface VerificationStepProgressProps {
  isVerifying: boolean;
  result: any;
}

export const VerificationStepProgress: React.FC<VerificationStepProgressProps> = ({ isVerifying, result }) => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (isVerifying) {
      setStep(1); // Start the process
      
      // Step 2: Aadhaar (after 800ms)
      const timer1 = setTimeout(() => setStep(2), 800);
      
      // Step 3: PAN (after 1800ms)
      const timer2 = setTimeout(() => setStep(3), 1800);
      
      // Step 4: Complete (after 2800ms or when result arrives)
      const timer3 = setTimeout(() => {
        if (result) setStep(4);
      }, 2800);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    } else if (result) {
      // If result arrives without isVerifying being active, jump to end
      setStep(4);
    } else {
      setStep(0);
    }
  }, [isVerifying, result]);

  if (step === 0) return null;

  const renderIcon = (currentStep: number, targetStep: number, isFinalStatus: boolean = false, isFailed: boolean = false) => {
    if (currentStep < targetStep) return <div className="w-5 h-5 rounded-full border-2 border-slate-200" />;
    if (currentStep === targetStep && !isFinalStatus) return <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />;
    if (isFailed) return <XCircle className="w-5 h-5 text-red-500" />;
    return <CheckCircle className="w-5 h-5 text-green-500" />;
  };

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="flex items-center gap-3">
        {renderIcon(step, 1)}
        <span className={`text-sm ${step >= 1 ? 'text-slate-800 font-medium' : 'text-slate-400'}`}>
          Submitting candidate details...
        </span>
      </div>
      
      <div className="flex items-center gap-3">
        {renderIcon(step, 2, step >= 3, result?.aadhaarResult === 'FAILED' || result?.aadhaarResult?.status === 'failed')}
        <span className={`text-sm ${step >= 2 ? 'text-slate-800 font-medium' : 'text-slate-400'}`}>
          Running Aadhaar verification...
        </span>
      </div>

      <div className="flex items-center gap-3">
        {renderIcon(step, 3, step >= 4, result?.panResult === 'FAILED' || result?.panResult?.status === 'failed')}
        <span className={`text-sm ${step >= 3 ? 'text-slate-800 font-medium' : 'text-slate-400'}`}>
          Running PAN verification...
        </span>
      </div>

      {step === 4 && result && (
        <div className="flex items-center gap-3 pt-2 border-t border-slate-200 animate-in fade-in duration-500">
          {renderIcon(step, 4, true, result?.overallStatus === 'FAILED')}
          <span className="text-sm font-bold text-slate-900">
            Verification complete — {result.overallStatus}
          </span>
        </div>
      )}
    </div>
  );
};
