import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import * as candidateService from '../services/candidate.service';
import {
  createCandidateSchema,
  updateCandidateSchema,
  candidateIdSchema,
} from '../validations/candidate.validation';
import { VerificationStatus } from '@prisma/client';

export const create = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const validation = createCandidateSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ errors: validation.error.flatten().fieldErrors });
    }

    const userId = req.user!.userId;
    const candidate = await candidateService.createCandidate(validation.data, userId);

    return res.status(201).json(candidate);
  } catch (error) {
    console.error('Error creating candidate:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAll = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const userId = req.user!.userId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const status = req.query.status as VerificationStatus;

    const result = await candidateService.getCandidates(userId, { page, limit, search, status });

    return res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching candidates:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getById = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const idValidation = candidateIdSchema.safeParse(req.params);
    if (!idValidation.success) {
      return res.status(400).json({ errors: idValidation.error.flatten().fieldErrors });
    }

    const userId = req.user!.userId;
    const candidate = await candidateService.getCandidateById(idValidation.data.id, userId);

    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    return res.status(200).json(candidate);
  } catch (error) {
    console.error('Error fetching candidate:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const update = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const idValidation = candidateIdSchema.safeParse(req.params);
    if (!idValidation.success) {
      return res.status(400).json({ errors: idValidation.error.flatten().fieldErrors });
    }

    const bodyValidation = updateCandidateSchema.safeParse(req.body);
    if (!bodyValidation.success) {
      return res.status(400).json({ errors: bodyValidation.error.flatten().fieldErrors });
    }

    const userId = req.user!.userId;
    const updated = await candidateService.updateCandidate(
      idValidation.data.id,
      bodyValidation.data,
      userId
    );

    if (!updated) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    return res.status(200).json(updated);
  } catch (error) {
    console.error('Error updating candidate:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const remove = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const idValidation = candidateIdSchema.safeParse(req.params);
    if (!idValidation.success) {
      return res.status(400).json({ errors: idValidation.error.flatten().fieldErrors });
    }

    const userId = req.user!.userId;
    const deleted = await candidateService.deleteCandidate(idValidation.data.id, userId);

    if (!deleted) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    return res.status(204).send();
  } catch (error) {
    console.error('Error deleting candidate:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
