import { Response } from 'express';
import { Note } from '../models/note.model';
import { AIUsage } from '../models/aiusage.model';
import { AuthRequest } from '../middleware/auth.middleware';

export const getDashboardStats = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId;

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const [
    totalNotes,
    archivedNotes,
    recentNotes,
    weeklyNotes,
    aiUsageCount,
    allNotes,
  ] = await Promise.all([
    Note.countDocuments({ userId, isArchived: false }),
    Note.countDocuments({ userId, isArchived: true }),
    Note.find({ userId, isArchived: false })
      .sort({ updatedAt: -1 })
      .limit(5)
      .select('title updatedAt category tags')
      .lean(),
    Note.countDocuments({ userId, createdAt: { $gte: weekAgo } }),
    AIUsage.countDocuments({ userId }),
    Note.find({ userId }).select('tags createdAt updatedAt').lean(),
  ]);

  // Most-used tags
  const tagMap: Record<string, number> = {};
  allNotes.forEach((n) => n.tags.forEach((t) => { tagMap[t] = (tagMap[t] || 0) + 1; }));
  const topTags = Object.entries(tagMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([tag, count]) => ({ tag, count }));

  // Weekly activity (last 7 days)
  const activityMap: Record<string, number> = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    activityMap[d.toISOString().slice(0, 10)] = 0;
  }
  allNotes.forEach((n) => {
    const day = new Date(n.updatedAt).toISOString().slice(0, 10);
    if (activityMap[day] !== undefined) activityMap[day]++;
  });
  const weeklyActivity = Object.entries(activityMap).map(([date, count]) => ({ date, count }));

  res.json({
    success: true,
    stats: {
      totalNotes,
      archivedNotes,
      weeklyNotes,
      aiUsageCount,
      recentNotes,
      topTags,
      weeklyActivity,
    },
  });
};
