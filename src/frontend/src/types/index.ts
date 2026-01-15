import type { GameAttributes } from './gameSchemas';

export interface GameAccount {
  id: string;
  game_name?: string;
  title: string;
  price: number;
  original_price?: number;
  images: string[];
  thumbnail: string;
  status: 'available' | 'reserved' | 'delivered' | 'deleted';
  description: string;
  features: string[];
  createdAt: string;
  created_at?: string;
  attributes?: GameAttributes;
  rank?: string;
  level?: number;
  server?: string;
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
  status: 'pending' | 'paid' | 'cancelled' | 'refunded' | 'delivered';
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  system_role: 'user' | 'admin';
  created_at: string;
}

export interface AdminStats {
  totalAccounts: number;
  availableAccounts: number;
  soldAccounts: number;
  pendingOrders: number;
  totalRevenue: number;
}
