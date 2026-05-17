import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { connectDB } from '../config/database';
import { User } from '../models/user.model';
import { Note } from '../models/note.model';

const seed = async () => {
  await connectDB();

  await User.deleteMany({});
  await Note.deleteMany({});

  const user = await User.create({
    name: 'Demo User',
    email: 'demo@noteflow.ai',
    password: 'password123',
  });

  const notes = [
    {
      userId: user._id,
      title: 'Sprint Planning Notes',
      content: '<p>Discussed Q3 roadmap. Need to prioritize auth refactor and AI features. Team agreed on 2-week sprints.</p>',
      tags: ['work', 'planning', 'sprint'],
      category: 'Work',
      aiSummary: 'Team met to plan Q3 roadmap with focus on auth refactor and AI feature integration.',
      aiActionItems: ['Refactor authentication module', 'Implement AI summary feature', 'Set up bi-weekly sprint reviews'],
    },
    {
      userId: user._id,
      title: 'Ideas for Side Project',
      content: '<p>Build a tool that automatically organizes bookmarks using AI. Could use embeddings to cluster similar URLs.</p>',
      tags: ['ideas', 'personal', 'ai'],
      category: 'Personal',
    },
    {
      userId: user._id,
      title: 'Reading List',
      content: '<ul><li>Deep Work - Cal Newport</li><li>The Pragmatic Programmer</li><li>Designing Data-Intensive Applications</li></ul>',
      tags: ['books', 'learning'],
      category: 'Learning',
    },
    {
      userId: user._id,
      title: 'Meeting Notes - Product Review',
      content: '<p>Stakeholders want dark mode and mobile improvements. Deadline end of month.</p>',
      tags: ['work', 'meeting'],
      category: 'Work',
      isArchived: true,
    },
  ];

  await Note.insertMany(notes);

  console.log('✅ Seed complete — demo@noteflow.ai / password123');
  await mongoose.disconnect();
};

seed().catch(console.error);
