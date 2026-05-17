import api from './api';
import { DashboardStats } from '../types';

export const dashboardService = {
  getStats: async () => {
    const res = await api.get('/dashboard/stats');
    return res.data.stats as DashboardStats;
  },
};
