import prisma from '../prisma/client';
import { maskAadhaar } from '../utils/masks';
import { VerificationStatus, Prisma } from '@prisma/client';

export const createCandidate = async (data: any, userId: string) => {
  const candidate = await prisma.candidate.create({
    data: {
      ...data,
      createdById: userId,
    },
  });

  return {
    ...candidate,
    aadhaarNumber: maskAadhaar(candidate.aadhaarNumber),
  };
};

export const getCandidates = async (
  userId: string,
  options: { page?: number; limit?: number; search?: string; status?: VerificationStatus }
) => {
  const page = options.page || 1;
  const limit = options.limit || 10;
  const skip = (page - 1) * limit;

  const where: Prisma.CandidateWhereInput = {
    createdById: userId,
  };

  if (options.status) {
    where.status = options.status;
  }

  if (options.search) {
    where.OR = [
      { fullName: { contains: options.search, mode: 'insensitive' } },
      { email: { contains: options.search, mode: 'insensitive' } },
    ];
  }

  const [total, candidates] = await Promise.all([
    prisma.candidate.count({ where }),
    prisma.candidate.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  const data = candidates.map((candidate) => ({
    ...candidate,
    aadhaarNumber: maskAadhaar(candidate.aadhaarNumber),
  }));

  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

export const getCandidateById = async (id: string, userId: string) => {
  const candidate = await prisma.candidate.findFirst({
    where: { id, createdById: userId },
    include: {
      verificationLogs: {
        orderBy: { verifiedAt: 'desc' },
      },
      report: true,
    },
  });

  if (!candidate) return null;

  return {
    ...candidate,
    aadhaarNumber: maskAadhaar(candidate.aadhaarNumber),
  };
};

export const updateCandidate = async (id: string, data: any, userId: string) => {
  const existing = await prisma.candidate.findFirst({
    where: { id, createdById: userId },
  });

  if (!existing) return null;

  const updated = await prisma.candidate.update({
    where: { id },
    data,
  });

  return {
    ...updated,
    aadhaarNumber: maskAadhaar(updated.aadhaarNumber),
  };
};

export const deleteCandidate = async (id: string, userId: string) => {
  const existing = await prisma.candidate.findFirst({
    where: { id, createdById: userId },
  });

  if (!existing) return null;

  return await prisma.candidate.delete({
    where: { id },
  });
};
