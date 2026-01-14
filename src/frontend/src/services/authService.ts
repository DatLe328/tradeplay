import { apiRequest } from "./api";
import type { User } from "@/types";
import type { ApiResponse } from "@/types";

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
		return apiRequest<ApiResponse<LoginResponse>>(
			"/auth/authenticate",
			{
				method: "POST",
				data: { email, password },
			},
			captchaToken
		);
	},

	register: async (
		email: string,
		password: string,
    firstName: string,
    lastName: string,
		captchaToken: string
	) => {
		return apiRequest<ApiResponse<boolean>>(
			"/auth/register",
			{
				method: "POST",
				data: {
					email,
					password,
					first_name: firstName,
					last_name: lastName,
				},
			},
			captchaToken
		);
	},

	getMe: async () => {
		const res = await apiRequest<ApiResponse<User>>("/user/me");
		return res.data;
	},

	logout: async () => {
		return apiRequest<ApiResponse<boolean>>("/auth/logout", {
			method: "POST",
		});
	},
	updateProfile: async (data: {
		first_name: string;
		last_name: string;
		phone_number: string;
	}) => {
		return apiRequest<ApiResponse<User>>("/user/me", {
			method: "PATCH",
			data: data,
		});
	},
  changePassword: async (data: { old_password: string; new_password: string }) => {
        return apiRequest("/auth/change-password", {
            method: "PATCH",
            data: data,
        });
    },
};
