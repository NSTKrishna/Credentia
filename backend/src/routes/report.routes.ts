import { Router } from 'express';
import * as reportController from '../controllers/report.controller';

const router = Router();

// GET  /api/reports — list all reports for the current user
router.get('/', reportController.listReports);

// POST /api/reports/:candidateId/generate
router.post('/:candidateId/generate', reportController.generateReport);

// GET  /api/reports/:candidateId — stream PDF download
router.get('/:candidateId', reportController.downloadReport);

export default router;
