import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { NotificationType } from "@/constants/enums";

export interface Notification {
	id: number;
	user_id: number;
	type: NotificationType;
	title: string;
	message: string;
	data?: Record<string, any>;
	action_url?: string;
	is_read: boolean;
	read_at?: string;
	created_at: string;
	updated_at: string;
}

export interface NotificationState {
	notifications: Notification[];
	unreadCount: number;
	total: number;
	isLoading: boolean;
	error: string | null;

	// Actions
	setNotifications: (notifications: Notification[], total?: number) => void;
	addNotification: (notification: Notification) => void;
	markAsRead: (id: number) => void;
	markAllAsRead: () => void;
	deleteNotification: (id: number) => void;
	setUnreadCount: (count: number) => void;
	setLoading: (loading: boolean) => void;
	setError: (error: string | null) => void;
	clearNotifications: () => void;
}

export const useNotificationStore = create<NotificationState>()(
	subscribeWithSelector((set) => ({
		notifications: [],
		unreadCount: 0,
		total: 0,
		isLoading: false,
		error: null,

		setNotifications: (notifications, total = 0) => 
			set({ 
				notifications, 
				total: total || notifications.length 
			}),

		addNotification: (notification) =>
			set((state) => ({
				notifications: [notification, ...state.notifications],
				unreadCount: !notification.is_read
					? state.unreadCount + 1
					: state.unreadCount,
				total: state.total + 1
			})),

		markAsRead: (id) =>
			set((state) => ({
				notifications: state.notifications.map((n) =>
					n.id === id ? { ...n, is_read: true } : n,
				),
				unreadCount: Math.max(0, state.unreadCount - 1),
			})),

		markAllAsRead: () =>
			set((state) => ({
				notifications: state.notifications.map((n) => ({ ...n, is_read: true })),
				unreadCount: 0,
			})),

		deleteNotification: (id) =>
			set((state) => {
				const notification = state.notifications.find(
					(n) => n.id === id,
				);
				return {
					notifications: state.notifications.filter(
						(n) => n.id !== id,
					),
					unreadCount:
						notification && !notification.is_read
							? Math.max(0, state.unreadCount - 1)
							: state.unreadCount,
					total: Math.max(0, state.total - 1)
				};
			}),

		setUnreadCount: (count) => set({ unreadCount: count }),
		setLoading: (loading) => set({ isLoading: loading }),
		setError: (error) => set({ error }),
		clearNotifications: () =>
			set({ notifications: [], unreadCount: 0, total: 0, error: null }),
	})),
);