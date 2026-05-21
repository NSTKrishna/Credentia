import { Router } from 'express';
import * as verificationController from '../controllers/verification.controller';

const router = Router();

router.post('/:id/start', verificationController.startVerification);

export default router;
