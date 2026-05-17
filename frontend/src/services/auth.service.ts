import api from './api';
import { User } from '../types';

export const authService = {
  signup: async (data: { name: string; email: string; password: string }) => {
    const res = await api.post('/auth/signup', data);
    return res.data as { token: string; user: User };
  },
  login: async (data: { email: string; password: string }) => {
    const res = await api.post('/auth/login', data);
    return res.data as { token: string; user: User };
  },
  getMe: async () => {
    const res = await api.get('/auth/me');
    return res.data.user as User;
  },
};
