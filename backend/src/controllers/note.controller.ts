import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Note } from '../models/note.model';
import { AIUsage } from '../models/aiusage.model';
import { AuthRequest } from '../middleware/auth.middleware';
import { createNoteSchema, updateNoteSchema } from '../validators';
import { generateAIContent } from '../services/ai.service';

export const getNotes = async (req: AuthRequest, res: Response): Promise<void> => {
  const { search, tag, category, archived } = req.query;

  const filter: Record<string, unknown> = {
    userId: req.userId,
    isArchived: archived === 'true',
  };

  if (tag) filter.tags = tag;
  if (category) filter.category = category;

  let query = Note.find(filter);

  if (search) {
    const searchStr = search as string;
    query = Note.find({
      ...filter,
      $or: [
        { title: { $regex: searchStr, $options: 'i' } },
        { content: { $regex: searchStr, $options: 'i' } },
        { tags: { $regex: searchStr, $options: 'i' } },
      ],
    });
  }

  const notes = await query.sort({ updatedAt: -1 }).lean();
  res.json({ success: true, notes });
};

export const createNote = async (req: AuthRequest, res: Response): Promise<void> => {
  const parsed = createNoteSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, errors: parsed.error.flatten() });
    return;
  }

  const note = await Note.create({ userId: req.userId, ...parsed.data });
  res.status(201).json({ success: true, note });
};

export const updateNote = async (req: AuthRequest, res: Response): Promise<void> => {
  const parsed = updateNoteSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, errors: parsed.error.flatten() });
    return;
  }

  const note = await Note.findOneAndUpdate(
    { _id: req.params.id, userId: req.userId },
    { ...parsed.data },
    { new: true, runValidators: true }
  );

  if (!note) {
    res.status(404).json({ success: false, message: 'Note not found' });
    return;
  }

  res.json({ success: true, note });
};

export const deleteNote = async (req: AuthRequest, res: Response): Promise<void> => {
  const note = await Note.findOneAndDelete({ _id: req.params.id, userId: req.userId });
  if (!note) {
    res.status(404).json({ success: false, message: 'Note not found' });
    return;
  }
  res.json({ success: true, message: 'Note deleted' });
};

export const generateShareLink = async (req: AuthRequest, res: Response): Promise<void> => {
  const note = await Note.findOne({ _id: req.params.id, userId: req.userId });
  if (!note) {
    res.status(404).json({ success: false, message: 'Note not found' });
    return;
  }

  if (!note.shareId) note.shareId = uuidv4();
  note.isPublic = true;
  await note.save();

  res.json({ success: true, shareId: note.shareId });
};

export const revokeShareLink = async (req: AuthRequest, res: Response): Promise<void> => {
  const note = await Note.findOneAndUpdate(
    { _id: req.params.id, userId: req.userId },
    { isPublic: false, shareId: null },
    { new: true }
  );
  if (!note) {
    res.status(404).json({ success: false, message: 'Note not found' });
    return;
  }
  res.json({ success: true, message: 'Share link revoked' });
};

export const generateAI = async (req: AuthRequest, res: Response): Promise<void> => {
  const note = await Note.findOne({ _id: req.params.id, userId: req.userId });
  if (!note) {
    res.status(404).json({ success: false, message: 'Note not found' });
    return;
  }

  if (!note.content || note.content.replace(/<[^>]+>/g, '').trim().length < 10) {
    res.status(400).json({ success: false, message: 'Note content is too short to analyze' });
    return;
  }

  const result = await generateAIContent(note.title, note.content);

  note.aiSummary = result.summary;
  note.aiActionItems = result.action_items;
  note.aiGeneratedCount += 1;
  await note.save();

  await AIUsage.create({
    userId: req.userId,
    noteId: note._id,
    type: 'summary',
    tokensUsed: result.tokensUsed || 0,
  });

  res.json({
    success: true,
    summary: result.summary,
    action_items: result.action_items,
    suggested_title: result.suggested_title,
  });
};
