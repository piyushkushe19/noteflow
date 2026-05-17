import { Request, Response } from 'express';
import { Note } from '../models/note.model';
import { User } from '../models/user.model';

export const getSharedNote = async (req: Request, res: Response): Promise<void> => {
  const { shareId } = req.params;

  const note = await Note.findOne({ shareId, isPublic: true }).lean();
  if (!note) {
    res.status(404).json({ success: false, message: 'Note not found or no longer shared' });
    return;
  }

  const author = await User.findById(note.userId).select('name').lean();

  res.json({
    success: true,
    note: {
      title: note.title,
      content: note.content,
      tags: note.tags,
      category: note.category,
      updatedAt: note.updatedAt,
      authorName: author?.name || 'Anonymous',
    },
  });
};
