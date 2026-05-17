import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model';
import { signupSchema, loginSchema } from '../validators';
import { AuthRequest } from '../middleware/auth.middleware';

const signToken = (userId: string): string =>
  jwt.sign({ userId }, process.env.JWT_SECRET!, { expiresIn: '7d' });

export const signup = async (req: Request, res: Response): Promise<void> => {
  const parsed = signupSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, errors: parsed.error.flatten() });
    return;
  }

  const { name, email, password } = parsed.data;
  const existing = await User.findOne({ email });
  if (existing) {
    res.status(409).json({ success: false, message: 'Email already in use' });
    return;
  }

  const user = await User.create({ name, email, password });
  const token = signToken(user._id.toString());

  res.status(201).json({
    success: true,
    token,
    user: { _id: user._id, name: user.name, email: user.email },
  });
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, errors: parsed.error.flatten() });
    return;
  }

  const { email, password } = parsed.data;
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
    return;
  }

  const token = signToken(user._id.toString());
  res.json({
    success: true,
    token,
    user: { _id: user._id, name: user.name, email: user.email },
  });
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  const user = await User.findById(req.userId).select('-password');
  if (!user) {
    res.status(404).json({ success: false, message: 'User not found' });
    return;
  }
  res.json({ success: true, user });
};
