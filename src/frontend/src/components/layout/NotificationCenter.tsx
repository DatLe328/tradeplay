import { useEffect, useState } from "react";
import { Bell, CheckCheck, Trash2, ExternalLink } from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useNotificationStore } from "@/stores/notificationStore";
import { notificationService } from "@/services/notificationService";
import { useTranslation } from "@/stores/languageStore";
import { formatTimeAgo } from "@/utils/format";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { NotificationType } from "@/constants/enums";

// Enhanced color mapping với consistent design
const notificationTypeColors: Record<number, string> = {
	[NotificationType.OrderStatus]:
		"bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
	[NotificationType.AccountSold]:
		"bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
	[NotificationType.Promotion]:
		"bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
	[NotificationType.System]:
		"bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20",
	[NotificationType.Message]:
		"bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
};

// Icon mapping for better visual hierarchy
const notificationTypeIcons: Record<number, string> = {
	[NotificationType.OrderStatus]: "📦",
	[NotificationType.AccountSold]: "💰",
	[NotificationType.Promotion]: "🎉",
	[NotificationType.System]: "⚙️",
	[NotificationType.Message]: "💬",
};

export function NotificationCenter() {
	const {
		notifications,
		unreadCount,
		isLoading,
		setLoading,
		setNotifications,
		setUnreadCount,
		markAsRead,
		deleteNotification,
	} = useNotificationStore();

	const { t } = useTranslation();
	const [open, setOpen] = useState(false);
	const [deletingId, setDeletingId] = useState<number | null>(null);

	// Fetch notifications on mount
	useEffect(() => {
		fetchInitialData();
	}, []);

	// Fetch unread count every 30 seconds
	useEffect(() => {
		const interval = setInterval(() => {
			fetchUnreadCount();
		}, 30000);

		return () => clearInterval(interval);
	}, []);

	const fetchInitialData = async () => {
		try {
			setLoading(true);
			const [listRes, countRes] = await Promise.all([
				notificationService.listNotifications(10, 0),
				notificationService.getUnreadCount(),
			]);

			setNotifications(listRes.data.items, listRes.data.total);
			setUnreadCount(countRes.data.unread_count);
		} catch (error) {
			console.error("Failed to fetch initial notifications:", error);
		} finally {
			setLoading(false);
		}
	};

	const fetchUnreadCount = async () => {
		try {
			const response = await notificationService.getUnreadCount();
			setUnreadCount(response.data.unread_count);
		} catch (error) {
			console.error("Failed to fetch unread count:", error);
		}
	};

	const handleMarkAsRead = async (e: React.MouseEvent, id: number) => {
		e.stopPropagation();
		try {
			await notificationService.markAsRead(id);
			markAsRead(id);
		} catch (error) {
			console.error("Failed to mark notification as read:", error);
		}
	};

	const handleDelete = async (e: React.MouseEvent, id: number) => {
		e.stopPropagation();
		setDeletingId(id);
		try {
			await notificationService.deleteNotification(id);
			// Small delay for animation
			setTimeout(() => {
				deleteNotification(id);
				setDeletingId(null);
			}, 200);
		} catch (error) {
			console.error("Failed to delete notification:", error);
			setDeletingId(null);
		}
	};

	const getLabel = (type: number) => {
		const labels: Record<number, string> = {
			[NotificationType.OrderStatus]: t("notifOrder") || "Order",
			[NotificationType.AccountSold]: t("notifSold") || "Sold",
			[NotificationType.Promotion]: t("notifPromo") || "Promo",
			[NotificationType.System]: t("notifSystem") || "System",
			[NotificationType.Message]: t("notifMsg") || "Message",
		};
		return labels[type] || "Info";
	};

	return (
		<DropdownMenu open={open} onOpenChange={setOpen}>
			<DropdownMenuTrigger asChild>
				<Button
					variant="ghost"
					size="icon"
					className="relative rounded-lg hover:bg-secondary transition-all duration-200"
				>
					<Bell className="h-5 w-5" />

					{unreadCount > 0 && (
						<motion.div
							initial={{ scale: 0 }}
							animate={{ scale: 1 }}
							className="absolute -top-1 -right-1"
						>
							<div className="relative">
								<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
								<span className="relative inline-flex items-center justify-center rounded-full h-5 w-5 bg-red-500 text-white text-[10px] font-bold border-2 border-background shadow-lg">
									{unreadCount > 9 ? "9+" : unreadCount}
								</span>
							</div>
						</motion.div>
					)}
				</Button>
			</DropdownMenuTrigger>

			<DropdownMenuContent
				align="end"
				className="w-[380px] sm:w-[420px] max-h-[580px] overflow-hidden p-0 bg-background/95 backdrop-blur-xl border border-border/50 shadow-2xl rounded-2xl"
			>
				{/* Enhanced Header */}
				<div className="sticky top-0 z-10 px-5 py-4 border-b border-border/50 bg-gradient-to-r from-primary/5 to-primary/10 backdrop-blur-xl">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<div className="p-2 rounded-lg bg-primary/10">
								<Bell className="h-4 w-4 text-primary" />
							</div>
							<div>
								<h2 className="text-sm font-bold text-foreground">
									{t("notifications") || "Notifications"}
								</h2>
								{unreadCount > 0 && (
									<p className="text-xs text-muted-foreground">
										{unreadCount} {t("unreadNotifications") || "unread"}
									</p>
								)}
							</div>
						</div>
						<Link
							to="/notifications"
							onClick={() => setOpen(false)}
							className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 font-semibold uppercase tracking-wider transition-colors group"
						>
							{t("viewAll") || "View All"}
							<ExternalLink className="h-3 w-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
						</Link>
					</div>
				</div>

				{/* Notifications List */}
				<div className="overflow-y-auto max-h-[450px] custom-scrollbar">
					{isLoading && notifications.length === 0 ? (
						<div className="flex flex-col items-center justify-center h-48 gap-3">
							<div className="relative">
								<div className="h-12 w-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
							</div>
							<p className="text-sm text-muted-foreground animate-pulse">
								{t("loading") || "Loading..."}
							</p>
						</div>
					) : notifications.length === 0 ? (
						<div className="flex flex-col items-center justify-center h-56 opacity-60 px-6">
							<div className="p-4 rounded-full bg-muted/50 mb-4">
								<Bell className="h-10 w-10 text-muted-foreground stroke-[1.5]" />
							</div>
							<h3 className="text-sm font-semibold text-foreground mb-1">
								{t("noNotifications") || "No notifications yet"}
							</h3>
							<p className="text-xs text-muted-foreground text-center">
								{t("notificationEmptyDesc") || "You're all caught up! Check back later for updates."}
							</p>
						</div>
					) : (
						<div className="py-2">
							<AnimatePresence mode="popLayout">
								{notifications.map((notification, _index) => (
									<motion.div
										key={notification.id}
										layout
										initial={{ opacity: 0, x: -20 }}
										animate={{ 
											opacity: deletingId === notification.id ? 0.5 : 1, 
											x: 0,
											scale: deletingId === notification.id ? 0.95 : 1
										}}
										exit={{ opacity: 0, x: 20, height: 0 }}
										transition={{ duration: 0.2 }}
										className={`relative px-4 py-3.5 border-b border-border/30 cursor-pointer hover:bg-secondary/30 transition-all group ${
											!notification.is_read
												? "bg-primary/[0.04] hover:bg-primary/[0.07]"
												: "hover:bg-secondary/20"
										}`}
										onClick={(e) => {
											if (!notification.is_read) {
												handleMarkAsRead(e, notification.id);
											}
										}}
									>
										{/* Unread indicator */}
										{!notification.is_read && (
											<div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-primary/50 rounded-r-full" />
										)}

										<div className="flex items-start gap-3 pl-1">
											{/* Icon & Type Badge */}
											<div className="flex-shrink-0">
												<div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10px] font-bold uppercase tracking-wider ${notificationTypeColors[notification.type]}`}>
													<span className="text-sm">
														{notificationTypeIcons[notification.type]}
													</span>
													<span>{getLabel(notification.type)}</span>
												</div>
											</div>

											{/* Content */}
											<div className="flex-1 min-w-0">
												<h3
													className={`text-sm font-semibold line-clamp-1 mb-1 ${
														!notification.is_read
															? "text-foreground"
															: "text-muted-foreground"
													}`}
												>
													{notification.title}
												</h3>
												<p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-2">
													{notification.message}
												</p>

												<div className="flex items-center justify-between">
													<span className="text-[10px] text-muted-foreground/70 font-medium flex items-center gap-1">
														<span className="inline-block w-1 h-1 rounded-full bg-muted-foreground/40"></span>
														{formatTimeAgo(notification.created_at)}
													</span>

													{notification.action_url && (
														<Link
															to={notification.action_url}
															onClick={(e) => {
																e.stopPropagation();
																setOpen(false);
															}}
															className="text-[10px] text-primary hover:text-primary/80 font-bold uppercase tracking-wider flex items-center gap-1 group/link"
														>
															{t("viewDetails") || "Details"}
															<ExternalLink className="h-2.5 w-2.5 group-hover/link:translate-x-0.5 transition-transform" />
														</Link>
													)}
												</div>
											</div>

											{/* Quick Actions */}
											<div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 ml-1">
												{!notification.is_read && (
													<Button
														size="icon"
														variant="ghost"
														className="h-7 w-7 rounded-lg hover:bg-primary/10 transition-all hover:scale-110"
														onClick={(e) => handleMarkAsRead(e, notification.id)}
														title={t("markAsRead") || "Mark as read"}
													>
														<CheckCheck className="h-3.5 w-3.5 text-primary" />
													</Button>
												)}
												<Button
													size="icon"
													variant="ghost"
													className="h-7 w-7 rounded-lg hover:bg-destructive/10 text-destructive transition-all hover:scale-110"
													onClick={(e) => handleDelete(e, notification.id)}
													disabled={deletingId === notification.id}
													title={t("delete") || "Delete"}
												>
													<Trash2 className="h-3.5 w-3.5" />
												</Button>
											</div>
										</div>
									</motion.div>
								))}
							</AnimatePresence>
						</div>
					)}
				</div>

				{/* Enhanced Footer */}
				{notifications.length > 0 && (
					<Link
						to="/notifications"
						onClick={() => setOpen(false)}
						className="sticky bottom-0 block py-3.5 text-center text-xs font-bold text-primary bg-gradient-to-r from-primary/5 to-primary/10 hover:from-primary/10 hover:to-primary/15 transition-all border-t border-border/50 backdrop-blur-xl group"
					>
						<span className="flex items-center justify-center gap-2">
							{t("viewAllNotifications") || "See all notifications"}
							<ExternalLink className="h-3 w-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
						</span>
					</Link>
				)}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}