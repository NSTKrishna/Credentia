import axios from 'axios';
import prisma from '../prisma/client';
import { maskAadhaar, maskPAN } from '../utils/masks';
import { VerificationStatus } from '@prisma/client';

export const verifyAadhaar = async (aadhaarNumber: string, candidateId: string) => {
  const url = process.env.AADHAAR_API_URL || 'http://localhost:5000/mock-api/aadhaar/verify';
  const payload = { aadhaarNumber };
  
  let result;
  let statusStr = 'FAILED';

  try {
    const response = await axios.post(url, payload);
    result = response.data;
    statusStr = result.status === 'verified' ? 'VERIFIED' : 'FAILED';
  } catch (error: any) {
    result = error.response?.data || { error: 'Network or server error' };
  }

  await prisma.verificationLog.create({
    data: {
      candidateId,
      verificationType: 'AADHAAR',
      requestPayload: { aadhaarNumber: maskAadhaar(aadhaarNumber) },
      responsePayload: result,
      verificationStatus: statusStr,
    },
  });

  if (statusStr === 'FAILED') {
    throw new Error('Aadhaar verification failed');
  }
  
  return result;
};

export const verifyPAN = async (panNumber: string, candidateId: string) => {
  const url = process.env.PAN_API_URL || 'http://localhost:5000/mock-api/pan/verify';
  const payload = { panNumber };
  
  let result;
  let statusStr = 'FAILED';

  try {
    const response = await axios.post(url, payload);
    result = response.data;
    statusStr = result.status === 'verified' ? 'VERIFIED' : 'FAILED';
  } catch (error: any) {
    result = error.response?.data || { error: 'Network or server error' };
  }

  await prisma.verificationLog.create({
    data: {
      candidateId,
      verificationType: 'PAN',
      requestPayload: { panNumber: maskPAN(panNumber) },
      responsePayload: result,
      verificationStatus: statusStr,
    },
  });

  if (statusStr === 'FAILED') {
    throw new Error('PAN verification failed');
  }

  return result;
};

export const startVerification = async (candidateId: string, userId: string) => {
  const candidate = await prisma.candidate.findFirst({
    where: { id: candidateId, createdById: userId },
  });

  if (!candidate) {
    const err = new Error('Candidate not found');
    (err as any).status = 404;
    throw err;
  }

  await prisma.candidate.update({
    where: { id: candidateId },
    data: { status: 'PENDING' },
  });

  const [aadhaarResult, panResult] = await Promise.allSettled([
    verifyAadhaar(candidate.aadhaarNumber, candidateId),
    verifyPAN(candidate.panNumber, candidateId),
  ]);

  const aadhaarVerified = aadhaarResult.status === 'fulfilled';
  const panVerified = panResult.status === 'fulfilled';

  let overallStatus: VerificationStatus = 'PENDING';

  if (aadhaarVerified && panVerified) {
    overallStatus = 'VERIFIED';
  } else if (!aadhaarVerified && !panVerified) {
    overallStatus = 'FAILED';
  } else {
    overallStatus = 'PARTIAL';
  }

  await prisma.candidate.update({
    where: { id: candidateId },
    data: { status: overallStatus },
  });

  return {
    aadhaarResult: aadhaarResult.status === 'fulfilled' ? aadhaarResult.value : aadhaarResult.reason.message,
    panResult: panResult.status === 'fulfilled' ? panResult.value : panResult.reason.message,
    overallStatus,
  };
};
