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
    console.error('Error starting verification:', error);
    if (error.status === 404) {
      return res.status(404).json({ error: 'Candidate not found' });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
};
