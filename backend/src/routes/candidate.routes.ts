import { Router } from 'express';
import * as candidateController from '../controllers/candidate.controller';

const router = Router();

router.post('/', candidateController.create);
router.get('/', candidateController.getAll);
router.get('/:id', candidateController.getById);
router.put('/:id', candidateController.update);
router.delete('/:id', candidateController.remove);

export default router;
