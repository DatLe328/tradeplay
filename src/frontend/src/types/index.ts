import type { GameAttributes } from './gameSchemas';
import { AccountStatus, OrderStatus, SystemRole, OrderType } from '@/constants/enums'; // Import enum

export interface GameAccount {
  id: string;
  game_name?: string;
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
}

export interface AccountCredentials {
    account_id: number;
    username: string;
    password: string;
    extra_data?: string;
}

export interface ApiResponse<T> {
  data: T;
  paging?: {
    page: number;
    limit: number;
    total: number;
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

export interface AdminStats {
  totalAccounts: number;
  availableAccounts: number;
  soldAccounts: number;
  pendingOrders: number;
  totalRevenue: number;
}