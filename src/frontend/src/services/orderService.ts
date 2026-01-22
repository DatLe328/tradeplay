import { apiRequest } from "./api";
import type { Order } from "@/types";
import type { ApiResponse } from "@/types";
import { OrderStatus, OrderType } from "@/constants/enums";

export const orderService = {
	createOrder: async (accountId: string) => {
		const payload = { account_id: String(accountId) };
		return apiRequest<ApiResponse<Order>>("/orders", {
			method: "POST",
			data: JSON.stringify(payload),
		});
	},
	createDeposit: async (amount: number) => {
        return apiRequest<ApiResponse<Order>>("/orders", {
            method: "POST",
            data: JSON.stringify({
                total_price: amount,
                type: OrderType.Deposit,
            }),
        });
    },

	getMyOrders: async (
		page = 1,
		limit = 10,
		type?: OrderType,
		status?: OrderStatus
	) => {
		const query = new URLSearchParams();
		query.append("page", page.toString());
		query.append("limit", limit.toString());

		if (type !== undefined) {
			query.append("type", type.toString());
		}
		if (status !== undefined) {
			query.append("status", status.toString());
		}

		return apiRequest<ApiResponse<Order[]>>(
			`/orders?${query.toString()}`
		);
	},

	getOrderDetail: async (id: string) => {
		return apiRequest<ApiResponse<Order>>(`/orders/${id}`);
	},

	getAdminOrders: async (page = 1, limit = 10, type?: OrderType) => {
	let url = `/orders?page=${page}&limit=${limit}`;
        if (type !== undefined) {
            url += `&type=${type}`;
        }
        return apiRequest<ApiResponse<Order[]>>(url);
	},

	updateStatus: async (orderId: string, status: OrderStatus) => {
		return apiRequest<ApiResponse<boolean>>(`/admin/orders/${orderId}`, {
			method: "PATCH",
			data: JSON.stringify({ status }), 
		});
	},
};