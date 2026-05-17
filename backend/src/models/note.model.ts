import mongoose, { Document, Schema } from 'mongoose';

export interface INote extends Document {
  userId: mongoose.Types.ObjectId;
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
  createdAt: Date;
  updatedAt: Date;
}

const noteSchema = new Schema<INote>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, default: 'Untitled Note', trim: true, maxlength: 300 },
    content: { type: String, default: '' },
    tags: { type: [String], default: [] },
    category: { type: String, default: 'General', trim: true },
    isArchived: { type: Boolean, default: false },
    isPublic: { type: Boolean, default: false },
    shareId: { type: String, default: null, sparse: true, index: true },
    aiSummary: { type: String, default: null },
    aiActionItems: { type: [String], default: [] },
    aiGeneratedCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

noteSchema.index({ userId: 1, isArchived: 1 });
noteSchema.index({ userId: 1, tags: 1 });
noteSchema.index({ userId: 1, category: 1 });
noteSchema.index({ title: 'text', content: 'text', tags: 'text' });

export const Note = mongoose.model<INote>('Note', noteSchema);
