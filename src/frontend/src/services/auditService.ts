import { apiRequest } from './api';
import type { AuditLog, AuditLogFilter, ApiResponse } from '@/types';

export const auditService = {
  getLogs: async (params: AuditLogFilter) => {
    const queryParams: any = { ...params };
    Object.keys(queryParams).forEach(key => 
      (queryParams[key] === undefined || queryParams[key] === '') && delete queryParams[key]
    );

    return apiRequest<ApiResponse<AuditLog[]>>('/admin/audit-logs', {
      params: queryParams
    });
  }
};