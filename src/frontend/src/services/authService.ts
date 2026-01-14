import { apiRequest } from './api';
import type { User } from '@/types';
import type { ApiResponse } from '@/types';

interface LoginResponse {
  access_token: {
    token: string;
    expire_in: number;
  };
  refresh_token?: {
    token: string;
    expire_in: number;
  };
}

export const authService = {
login: async (email: string, password: string, captchaToken: string) => {
    return apiRequest<ApiResponse<LoginResponse>>('/auth/authenticate', {
        method: 'POST',
        data: { email, password },
    }, captchaToken);
},

register: async (email: string, password: string, name: string, captchaToken: string) => {
    const nameParts = name.trim().split(' ');
    const firstName = nameParts.length > 1 ? nameParts.slice(0, -1).join(' ') : name;
    const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';

    return apiRequest<ApiResponse<boolean>>('/auth/register', {
        method: 'POST',
        data: {
            email, 
            password, 
            first_name: firstName, 
            last_name: lastName
        },
    }, captchaToken);
},

  getMe: async () => {
    const res = await apiRequest<ApiResponse<User>>('/user/me');
    return res.data; 
  },

  logout: async () => {
    return apiRequest<ApiResponse<boolean>>('/auth/logout', {
      method: 'POST',
    });
  }
};
