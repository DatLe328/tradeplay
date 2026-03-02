import { create } from 'zustand';
import { orderService } from '@/services/orderService';
import type { Order } from '@/types';

interface OrderStore {
  orders: Order[];
  currentOrder: Order | null;
  isLoading: boolean;
  error: string | null;

  createOrder: (accountId: number) => Promise<Order | null>;
  fetchMyOrders: (cursor?: string) => Promise<void>;
  fetchOrderDetail: (id: string) => Promise<void>;
}

export const useOrderStore = create<OrderStore>((set) => ({
  orders: [],
  currentOrder: null,
  isLoading: false,
  error: null,

  createOrder: async (accountId: number) => {
    set({ isLoading: true, error: null });
    try {
      const res = await orderService.createOrder(accountId);
      const newOrder = res.data;
      
      set((state) => ({ 
        orders: [newOrder, ...state.orders],
        currentOrder: newOrder 
      }));
      
      return newOrder;
    } catch (err: any) {
      console.error(err);
      set({ error: err.message || 'Failed to create order' });
      return null;
    } finally {
      set({ isLoading: false });
    }
  },

  fetchMyOrders: async (cursor = "") => {
    set({ isLoading: true, error: null });
    try {
      const res = await orderService.getMyOrders(cursor);
      set({ orders: res.data });
    } catch (err: any) {
      set({ error: err.message });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchOrderDetail: async (id: string) => {
     set({ isLoading: true, error: null });
     try {
       const res = await orderService.getOrderDetail(id);
       set({ currentOrder: res.data });
     } catch (err: any) {
        set({ error: err.message });
     } finally {
        set({ isLoading: false });
     }
  }
}));