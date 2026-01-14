import { apiRequest } from "./api";
import type { Order } from "@/types";
import type { ApiResponse } from "@/types";

export const orderService = {
	createOrder: async (accountId: string) => {
		const payload = { account_id: String(accountId) };
		return apiRequest<ApiResponse<Order>>("/orders", {
			method: "POST",
			data: JSON.stringify(payload),
		});
	},

	getMyOrders: async (page = 1, limit = 10) => {
		return apiRequest<ApiResponse<Order[]>>(
			`/orders?page=${page}&limit=${limit}`
		);
	},

	getOrderDetail: async (id: string) => {
		return apiRequest<ApiResponse<Order>>(`/orders/${id}`);
	},
	getAdminOrders: async (page = 1, limit = 10) => {
		return apiRequest<ApiResponse<Order[]>>(
			`/orders?page=${page}&limit=${limit}`
		);
	},

	updateStatus: async (orderId: string, status: string) => {
		return apiRequest<ApiResponse<boolean>>(`/orders/${orderId}`, {
			method: "PATCH",
			data: JSON.stringify({ status }),
		});
	},
};
