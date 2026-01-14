import { apiRequest } from './api';
import type { ApiResponse, AdminStats } from '@/types';

export const adminService = {
  getStats: async () => {
    return apiRequest<ApiResponse<AdminStats>>('/admin/stats');
  }
};