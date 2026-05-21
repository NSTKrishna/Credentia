import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import * as verificationService from '../services/verification.service';
import { candidateIdSchema } from '../validations/candidate.validation';

export const startVerification = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const idValidation = candidateIdSchema.safeParse(req.params);
    if (!idValidation.success) {
      return res.status(400).json({ errors: idValidation.error.flatten().fieldErrors });
    }

    const userId = req.user!.userId;
    const result = await verificationService.startVerification(idValidation.data.id, userId);

    return res.status(200).json(result);
  } catch (error: any) {
    if (error.status === 404) {
      return res.status(404).json({ error: 'Candidate not found' });
    }
    if (error.status === 403) {
      return res.status(403).json({ error: 'You do not have permission to verify this candidate' });
    }
    console.error('Error starting verification:', error.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
