import { Router } from 'express';
import { getSharedNote } from '../controllers/shared.controller';

const router = Router();
router.get('/:shareId', getSharedNote);
export default router;
