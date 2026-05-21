import { useState, useCallback } from 'react';
import { candidateService } from '@/services/candidate.service';

export type StepStatus = 'pending' | 'running' | 'success' | 'failed';

export interface VerificationStep {
  label: string;
  status: StepStatus;
}

const INITIAL_STEPS: VerificationStep[] = [
  { label: 'Submitting candidate details...', status: 'pending' },
  { label: 'Running Aadhaar verification...', status: 'pending' },
  { label: 'Running PAN verification...', status: 'pending' },
];

export const useVerification = (onComplete: () => void) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [steps, setSteps] = useState<VerificationStep[]>(INITIAL_STEPS);
  const [overallStatus, setOverallStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const updateStep = (index: number, status: StepStatus) => {
    setSteps((prev) =>
      prev.map((step, i) => (i === index ? { ...step, status } : step))
    );
  };

  const reset = () => {
    setSteps(INITIAL_STEPS.map((s) => ({ ...s, status: 'pending' })));
    setOverallStatus(null);
    setError(null);
  };

  const startVerification = useCallback(async (candidateId: string) => {
    reset();
    setIsVerifying(true);
    setError(null);

    try {
      // Step 1: Mark "Submitting" as running, then immediately success
      updateStep(0, 'running');
      await new Promise((r) => setTimeout(r, 300)); // Brief visual pause
      updateStep(0, 'success');

      // Step 2 & 3: Mark both as running while the API call is in flight
      updateStep(1, 'running');
      updateStep(2, 'running');

      // Fire the actual API call
      const result = await candidateService.startVerification(candidateId);

      // Step 2: Aadhaar result
      const aadhaarStatus = result?.aadhaarResult?.status === 'VERIFIED' ? 'success' : 'failed';
      updateStep(1, aadhaarStatus);

      // Brief stagger so steps don't resolve simultaneously
      await new Promise((r) => setTimeout(r, 200));

      // Step 3: PAN result
      const panStatus = result?.panResult?.status === 'VERIFIED' ? 'success' : 'failed';
      updateStep(2, panStatus);

      // Set overall status for the final banner
      setOverallStatus(result?.overallStatus ?? 'FAILED');

      // Refresh parent after a short delay so the user can read the result
      setTimeout(() => {
        onComplete();
        setIsVerifying(false);
      }, 2000);
    } catch (err: any) {
      const message = err?.response?.data?.error || err?.message || 'Verification failed';
      setError(message);

      // Mark any still-running steps as failed
      setSteps((prev) =>
        prev.map((s) => (s.status === 'running' ? { ...s, status: 'failed' } : s))
      );
      setOverallStatus('FAILED');
      setIsVerifying(false);
    }
  }, [onComplete]);

  return {
    isVerifying,
    steps,
    overallStatus,
    error,
    startVerification,
    resetVerification: reset,
  };
};
