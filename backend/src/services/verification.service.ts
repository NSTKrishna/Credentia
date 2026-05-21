import axios from 'axios';
import prisma from '../prisma/client';
import { maskAadhaar, maskPAN } from '../utils/masks';
import { VerificationStatus } from '@prisma/client';

// Structured result shape returned for each check
interface VerificationResult {
  status: 'VERIFIED' | 'FAILED';
  payload: Record<string, any>;
}

/**
 * Run a single external verification call with a 5-second AbortController timeout.
 * Always creates a VerificationLog — even on timeout/network error.
 * Returns a structured { status, payload } object. Never throws.
 */
const runWithTimeout = async (
  fn: (signal: AbortSignal) => Promise<{ status: string; [key: string]: any }>,
  timeout: number = 5000
): Promise<{ data: Record<string, any>; timedOut: boolean; error?: string }> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const data = await fn(controller.signal);
    clearTimeout(timer);
    return { data, timedOut: false };
  } catch (err: any) {
    clearTimeout(timer);
    if (controller.signal.aborted) {
      return { data: {}, timedOut: true, error: 'Verification timed out after 5 seconds' };
    }
    return {
      data: err.response?.data || {},
      timedOut: false,
      error: err.message || 'External API error',
    };
  }
};

export const verifyAadhaar = async (
  aadhaarNumber: string,
  candidateId: string
): Promise<VerificationResult> => {
  const url = process.env.AADHAAR_API_URL || 'http://localhost:5000/mock-api/aadhaar/verify';

  console.log(`[Aadhaar] Starting verification for candidate ${candidateId} (${maskAadhaar(aadhaarNumber)})`);

  const { data, timedOut, error } = await runWithTimeout(async (signal) => {
    const response = await axios.post(url, { aadhaarNumber }, { signal });
    return response.data;
  });

  const isVerified = !timedOut && !error && data?.status === 'verified';
  const statusStr: 'VERIFIED' | 'FAILED' = isVerified ? 'VERIFIED' : 'FAILED';

  const responsePayload = timedOut || error
    ? { error: error, timedOut }
    : data;

  await prisma.verificationLog.create({
    data: {
      candidateId,
      verificationType: 'AADHAAR',
      requestPayload: { aadhaarNumber: maskAadhaar(aadhaarNumber) },
      responsePayload,
      verificationStatus: statusStr,
    },
  });

  if (timedOut) {
    console.error(`[Aadhaar] TIMEOUT for candidate ${candidateId} (${maskAadhaar(aadhaarNumber)})`);
  } else if (error) {
    console.error(`[Aadhaar] ERROR for candidate ${candidateId} (${maskAadhaar(aadhaarNumber)}): ${error}`);
  } else {
    console.log(`[Aadhaar] Result for candidate ${candidateId} (${maskAadhaar(aadhaarNumber)}): ${statusStr}`);
  }

  return { status: statusStr, payload: responsePayload };
};

export const verifyPAN = async (
  panNumber: string,
  candidateId: string
): Promise<VerificationResult> => {
  const url = process.env.PAN_API_URL || 'http://localhost:5000/mock-api/pan/verify';

  console.log(`[PAN] Starting verification for candidate ${candidateId} (${maskPAN(panNumber)})`);

  const { data, timedOut, error } = await runWithTimeout(async (signal) => {
    const response = await axios.post(url, { panNumber }, { signal });
    return response.data;
  });

  const isVerified = !timedOut && !error && data?.status === 'verified';
  const statusStr: 'VERIFIED' | 'FAILED' = isVerified ? 'VERIFIED' : 'FAILED';

  const responsePayload = timedOut || error
    ? { error: error, timedOut }
    : data;

  await prisma.verificationLog.create({
    data: {
      candidateId,
      verificationType: 'PAN',
      requestPayload: { panNumber: maskPAN(panNumber) },
      responsePayload,
      verificationStatus: statusStr,
    },
  });

  if (timedOut) {
    console.error(`[PAN] TIMEOUT for candidate ${candidateId} (${maskPAN(panNumber)})`);
  } else if (error) {
    console.error(`[PAN] ERROR for candidate ${candidateId} (${maskPAN(panNumber)}): ${error}`);
  } else {
    console.log(`[PAN] Result for candidate ${candidateId} (${maskPAN(panNumber)}): ${statusStr}`);
  }

  return { status: statusStr, payload: responsePayload };
};

export const startVerification = async (candidateId: string, userId: string) => {
  // Step 1: Fetch by ID only — distinguish 404 vs 403
  const candidate = await prisma.candidate.findUnique({
    where: { id: candidateId },
  });

  if (!candidate) {
    const err = new Error('Candidate not found');
    (err as any).status = 404;
    throw err;
  }

  if (candidate.createdById !== userId) {
    const err = new Error('You do not have permission to verify this candidate');
    (err as any).status = 403;
    throw err;
  }

  // Step 2: Immediately set to PENDING so UI shows "in progress"
  await prisma.candidate.update({
    where: { id: candidateId },
    data: { status: 'PENDING' },
  });

  console.log(
    `[Verification] Starting for candidate ${candidateId} ` +
    `(Aadhaar: ${maskAadhaar(candidate.aadhaarNumber)}, PAN: ${maskPAN(candidate.panNumber)})`
  );

  // Step 3: Run both checks in parallel — neither blocks the other
  const [aadhaarSettled, panSettled] = await Promise.allSettled([
    verifyAadhaar(candidate.aadhaarNumber, candidateId),
    verifyPAN(candidate.panNumber, candidateId),
  ]);

  // Step 4: Extract structured results from settled promises
  const aadhaarResult: VerificationResult =
    aadhaarSettled.status === 'fulfilled'
      ? aadhaarSettled.value
      : { status: 'FAILED', payload: { error: aadhaarSettled.reason?.message || 'Unknown error' } };

  const panResult: VerificationResult =
    panSettled.status === 'fulfilled'
      ? panSettled.value
      : { status: 'FAILED', payload: { error: panSettled.reason?.message || 'Unknown error' } };

  // Step 5: If a rejection happened BEFORE the VerificationLog was created inside
  // verifyAadhaar/verifyPAN, write a fallback log here to ensure auditability.
  // (verifyAadhaar/verifyPAN now never throw, so this is a safety net only.)
  if (aadhaarSettled.status === 'rejected') {
    console.error(`[Verification] Unexpected rejection for Aadhaar (${maskAadhaar(candidate.aadhaarNumber)}):`, aadhaarSettled.reason);
    await prisma.verificationLog.create({
      data: {
        candidateId,
        verificationType: 'AADHAAR',
        requestPayload: { aadhaarNumber: maskAadhaar(candidate.aadhaarNumber) },
        responsePayload: { error: aadhaarSettled.reason?.message || 'Unexpected error' },
        verificationStatus: 'FAILED',
      },
    }).catch(() => {}); // Best-effort; don't crash if duplicate
  }

  if (panSettled.status === 'rejected') {
    console.error(`[Verification] Unexpected rejection for PAN (${maskPAN(candidate.panNumber)}):`, panSettled.reason);
    await prisma.verificationLog.create({
      data: {
        candidateId,
        verificationType: 'PAN',
        requestPayload: { panNumber: maskPAN(candidate.panNumber) },
        responsePayload: { error: panSettled.reason?.message || 'Unexpected error' },
        verificationStatus: 'FAILED',
      },
    }).catch(() => {}); // Best-effort
  }

  // Step 6: Determine overall status
  const aadhaarVerified = aadhaarResult.status === 'VERIFIED';
  const panVerified = panResult.status === 'VERIFIED';

  let overallStatus: VerificationStatus;
  if (aadhaarVerified && panVerified) {
    overallStatus = 'VERIFIED';
  } else if (!aadhaarVerified && !panVerified) {
    overallStatus = 'FAILED';
  } else {
    overallStatus = 'PARTIAL';
  }

  // Step 7: Persist final status
  const updatedCandidate = await prisma.candidate.update({
    where: { id: candidateId },
    data: { status: overallStatus },
  });

  console.log(`[Verification] Complete for candidate ${candidateId}: ${overallStatus}`);

  // Step 8: Return structured result the frontend hook can consume
  return {
    aadhaarResult,
    panResult,
    overallStatus,
    candidate: {
      ...updatedCandidate,
      aadhaarNumber: maskAadhaar(updatedCandidate.aadhaarNumber),
    },
  };
};
