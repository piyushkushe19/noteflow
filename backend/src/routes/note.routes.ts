import { Router } from 'express';
import {
  getNotes,
  createNote,
  updateNote,
  deleteNote,
  generateAI,
  generateShareLink,
  revokeShareLink,
} from '../controllers/note.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', getNotes);
router.post('/', createNote);
router.patch('/:id', updateNote);
router.delete('/:id', deleteNote);
router.post('/:id/generate-ai', generateAI);
router.post('/:id/share', generateShareLink);
router.delete('/:id/share', revokeShareLink);

export default router;
