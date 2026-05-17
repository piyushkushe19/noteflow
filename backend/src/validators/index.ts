import { z } from 'zod';

export const signupSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(6),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const createNoteSchema = z.object({
  title: z.string().max(300).optional(),
  content: z.string().optional(),
  tags: z.array(z.string()).optional(),
  category: z.string().optional(),
});

export const updateNoteSchema = z.object({
  title: z.string().max(300).optional(),
  content: z.string().optional(),
  tags: z.array(z.string()).optional(),
  category: z.string().optional(),
  isArchived: z.boolean().optional(),
  isPublic: z.boolean().optional(),
});
