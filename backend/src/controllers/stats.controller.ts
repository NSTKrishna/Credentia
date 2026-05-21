import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import prisma from '../prisma/client';
import { VerificationStatus } from '@prisma/client';

export const getDashboardStats = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const userId = req.user!.userId;

    const [total, grouped] = await Promise.all([
      prisma.candidate.count({ where: { createdById: userId } }),
      prisma.candidate.groupBy({
        by: ['status'],
        where: { createdById: userId },
        _count: {
          status: true,
        },
      }),
    ]);

    let verified = 0;
    let pending = 0;
    let failed = 0;
    let partial = 0;

    grouped.forEach((group) => {
      if (group.status === VerificationStatus.VERIFIED) verified = group._count.status;
      if (group.status === VerificationStatus.PENDING) pending = group._count.status;
      if (group.status === VerificationStatus.FAILED) failed = group._count.status;
      if (group.status === VerificationStatus.PARTIAL) partial = group._count.status;
    });

    return res.status(200).json({
      total,
      verified,
      pending,
      failed,
      partial,
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
