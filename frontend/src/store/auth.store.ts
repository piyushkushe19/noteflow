import { create } from 'zustand';
import { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  setLoading: (v: boolean) => void;
}

const storedUser = localStorage.getItem('nf_user');
const storedToken = localStorage.getItem('nf_token');

export const useAuthStore = create<AuthState>((set) => ({
  user: storedUser ? JSON.parse(storedUser) : null,
  token: storedToken,
  isLoading: false,
  setAuth: (user, token) => {
    localStorage.setItem('nf_token', token);
    localStorage.setItem('nf_user', JSON.stringify(user));
    set({ user, token });
  },
  logout: () => {
    localStorage.removeItem('nf_token');
    localStorage.removeItem('nf_user');
    set({ user: null, token: null });
  },
  setLoading: (isLoading) => set({ isLoading }),
}));
