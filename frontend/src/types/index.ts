export interface User {
  _id: string;
  name: string;
  email: string;
}

export interface Note {
  _id: string;
  title: string;
  content: string;
  tags: string[];
  category: string;
  isArchived: boolean;
  isPublic: boolean;
  shareId: string | null;
  aiSummary: string | null;
  aiActionItems: string[];
  aiGeneratedCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AIResult {
  summary: string;
  action_items: string[];
  suggested_title: string;
}

export interface DashboardStats {
  totalNotes: number;
  archivedNotes: number;
  weeklyNotes: number;
  aiUsageCount: number;
  recentNotes: Pick<Note, '_id' | 'title' | 'updatedAt' | 'category' | 'tags'>[];
  topTags: { tag: string; count: number }[];
  weeklyActivity: { date: string; count: number }[];
}

export interface SharedNote {
  title: string;
  content: string;
  tags: string[];
  category: string;
  updatedAt: string;
  authorName: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}
