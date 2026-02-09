import { apiRequest } from './api';
import type { ApiResponse, AdminStats } from '@/types';

export const adminService = {
  getStats: async (range: string = '7d') => {
    return apiRequest<ApiResponse<AdminStats>>(`/admin/stats?range=${range}`);
  }
};