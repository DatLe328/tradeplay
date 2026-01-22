import { apiRequest } from "./api";
import type { AccountCredentials, GameAccount } from "@/types";
import type { ApiResponse } from "@/types";
import { uploadService } from "./uploadService";
import type { AccountStatus } from "@/constants/enums";

export interface GetAccountsParams {
	page?: number;
	limit?: number;
	game_name?: string;
	min_price?: number;
	max_price?: number;
	status?: AccountStatus | AccountStatus[];
	search?: string;
	sort?: string;
}

export const accountService = {
	getAll: async (params: GetAccountsParams) => {
		const query = new URLSearchParams();

		if (params.page) query.append("page", params.page.toString());
		if (params.limit) query.append("limit", params.limit.toString());
		if (params.game_name) query.append("game_name", params.game_name);

		if (params.min_price !== undefined)
			query.append("min_price", params.min_price.toString());
		if (params.max_price !== undefined)
			query.append("max_price", params.max_price.toString());

		if (params.status !== undefined) {
			if (Array.isArray(params.status)) {
				params.status.forEach((s) => 
                    query.append("status", s.toString())
                );
			} else {
				query.append("status", params.status.toString());
			}
		}
		if (params.sort) query.append("sort", params.sort);
		
		if (params.search) query.append("search", params.search);

		return apiRequest<ApiResponse<GameAccount[]>>(
			`/accounts?${query.toString()}`
		);
	},

	getCredentials: async (id: string | number) => {
        return apiRequest<ApiResponse<AccountCredentials>>(`/accounts/${id}/credentials`);
    },

	create: async (data: any) => {
		return apiRequest<ApiResponse<number>>("/admin/accounts", {
			method: "POST",
			data: data,
		});
	},

	update: async (id: string, data: any) => {
		return apiRequest<ApiResponse<boolean>>(`/admin/accounts/${id}`, {
			method: "PATCH",
			data: data,
		});
	},

	delete: async (id: string) => {
		return apiRequest<ApiResponse<boolean>>(`/admin/accounts/${id}`, {
			method: "DELETE",
		});
	},

	getById: async (id: string) => {
		return apiRequest<ApiResponse<GameAccount>>(`/accounts/${id}`);
	},

	uploadImageDirect: async (
		file: File,
		onProgress?: (percent: number) => void
	) => {
		return uploadService.uploadImage(file, onProgress);
	},
};