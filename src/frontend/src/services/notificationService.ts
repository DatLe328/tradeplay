import { apiRequest } from "./api";
import type { Notification } from "@/stores/notificationStore";

interface ApiResponse<T> {
	code: number;
	data: T;
	message?: string;
}

interface NotificationListData {
	items: Notification[];
	total: number;
	limit: number;
	offset: number;
}

interface UnreadCountData {
	unread_count: number;
}

export const notificationService = {
	async listNotifications(
		limit: number = 20,
		offset: number = 0,
	): Promise<ApiResponse<NotificationListData>> {
		return apiRequest(`/notifications?limit=${limit}&offset=${offset}`, {
			method: "GET",
		});
	},

	async getNotification(id: number): Promise<ApiResponse<Notification>> {
		return apiRequest(`/notifications/${id}`, {
			method: "GET",
		});
	},

	async getUnreadCount(): Promise<ApiResponse<UnreadCountData>> {
		return apiRequest(`/notifications/unread/count`, {
			method: "GET",
		});
	},

	async markAsRead(id: number): Promise<ApiResponse<any>> {
		return apiRequest(`/notifications/${id}/read`, {
			method: "PATCH",
		});
	},

	async markAllAsRead(): Promise<ApiResponse<any>> {
		return apiRequest(`/notifications/read-all`, {
			method: "POST",
		});
	},

	async deleteNotification(id: number): Promise<ApiResponse<any>> {
		return apiRequest(`/notifications/${id}`, {
			method: "DELETE",
		});
	},
};