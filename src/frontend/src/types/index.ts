import type { GameAttributes } from './gameSchemas';
import { AccountStatus, OrderStatus, SystemRole, OrderType } from '@/constants/enums'; // Import enum

export interface Category {
  id: number;
  name: string;
  slug: string;
  image?: string;
  description?: string;
  display_order: number;
  status: number;
}

export interface GameAccount {
  id: number;
  category_id: number; 
  category?: Category; 
  
  title: string;
  price: number;
  original_price?: number;
  images: string[];
  thumbnail: string;
  status: AccountStatus; 
  description: string;
  features: string[];
  createdAt: string;
  created_at?: string;
  attributes?: GameAttributes;
  view_count?: number; 
  
  version: number; 
}

export interface AccountCredentials {
    account_id: number;
    username: string;
    password: string;
    extra_data?: string;
}

export interface AuditLog {
    id: number;
    user_id: number;
    action: string;
    method: string;
    path: string;
    payload: any;     // JSON data
    prev_state?: any; // JSON data
    new_state?: any;  // JSON data
    ip_address: string;
    user_agent: string;
    status_code: number;
    error_msg?: string;
    created_at: string;
    duration: number;
}

export interface AuditLogFilter {
    page: number;
    limit: number;
    user_id?: string;
    action?: string;
    status_code?: string;
    date_from?: string;
    date_to?: string;
}

export interface ApiResponse<T> {
  data: T;
  paging?: {
    limit?: number;
    // cursor-based
    cursor?: string;
    next_cursor?: string;
    has_more?: boolean;
    // page-based (AuditLogs)
    total?: number;
    page?: number;
  };
  filter?: any;
}

export interface Order {
  id: string;
  user_id: string;
  account_id: string;
  
  account?: GameAccount; 
  
  total_price: number;
  
  status: OrderStatus;
  
  type: OrderType;
  payment_method?: string;
  payment_ref?: string;
  notes?: string;

  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  
  system_role: SystemRole;
  
  status?: number;
  
  created_at: string;
}

export interface ChartData {
    date: string;
    success: number;
    error: number;
    revenue: number;
}

export interface TopIP {
    ip: string;
    count: number;
    failCount: number;
}

export interface AdminStats {
    totalAccounts: number;
    availableAccounts: number;
    soldAccounts: number;
    pendingOrders: number;
    totalRevenue: number;
    // Thêm mới
    chartData: ChartData[];
    topIPs: TopIP[];
}