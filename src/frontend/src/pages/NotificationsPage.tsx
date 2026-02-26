import { useEffect, useState } from "react";
import {
	Trash2,
	CheckCheck,
	Bell,
	Filter,
	Search,
	X,
	Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNotificationStore } from "@/stores/notificationStore";
import { notificationService } from "@/services/notificationService";
import { useTranslation } from "@/stores/languageStore";
import { formatTimeAgo } from "@/utils/format";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { NotificationType } from "@/constants/enums";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuTrigger,
	DropdownMenuCheckboxItem,
	DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Layout } from "@/components/layout/Layout";

// Enhanced color mapping
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

// Icon mapping
const notificationTypeIcons: Record<number, string> = {
	[NotificationType.OrderStatus]: "📦",
	[NotificationType.AccountSold]: "💰",
	[NotificationType.Promotion]: "🎉",
	[NotificationType.System]: "⚙️",
	[NotificationType.Message]: "💬",
};

export function NotificationsPage() {
	const {
		notifications,
		isLoading,
		setNotifications,
		setLoading,
		markAsRead,
		markAllAsRead,
		deleteNotification,
	} = useNotificationStore();

	const { t } = useTranslation();
	const [limit] = useState(50);
	const [offset] = useState(0);
	const [searchQuery, setSearchQuery] = useState("");
	const [filterTypes, setFilterTypes] = useState<number[]>([]);
	const [showUnreadOnly, setShowUnreadOnly] = useState(false);
	const [deletingId, setDeletingId] = useState<number | null>(null);

	useEffect(() => {
		fetchNotifications();
	}, [offset]);

	const fetchNotifications = async () => {
		try {
			setLoading(true);
			const response = await notificationService.listNotifications(
				limit,
				offset,
			);
			setNotifications(response.data.items, response.data.total);
		} catch (error) {
			console.error("Failed to fetch notifications:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleMarkAsRead = async (id: number) => {
		try {
			await notificationService.markAsRead(id);
			markAsRead(id);
		} catch (error) {
			console.error("Failed to mark as read:", error);
		}
	};

	const handleMarkAllAsRead = async () => {
		try {
			await notificationService.markAllAsRead();
			markAllAsRead();
		} catch (error) {
			console.error("Failed to mark all as read:", error);
		}
	};

	const handleDelete = async (id: number) => {
		setDeletingId(id);
		try {
			await notificationService.deleteNotification(id);
			setTimeout(() => {
				deleteNotification(id);
				setDeletingId(null);
			}, 200);
		} catch (error) {
			console.error("Failed to delete notification:", error);
			setDeletingId(null);
		}
	};

	const getNotificationLabel = (type: number) => {
		const labels: Record<number, string> = {
			[NotificationType.OrderStatus]: t("notification.notifOrder"),
			[NotificationType.AccountSold]: t("notification.notifSold"),
			[NotificationType.Promotion]: t("notification.notifPromo"),
			[NotificationType.System]: t("notification.notifSystem"),
			[NotificationType.Message]: t("notification.notifMsg"),
		};
		return labels[type] || "Info";
	};

	const toggleFilterType = (type: number) => {
		setFilterTypes((prev) =>
			prev.includes(type)
				? prev.filter((t) => t !== type)
				: [...prev, type],
		);
	};

	// Filter notifications
	const filteredNotifications = notifications.filter((notif) => {
		// Search filter
		if (
			searchQuery &&
			!notif.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
			!notif.message.toLowerCase().includes(searchQuery.toLowerCase())
		) {
			return false;
		}
		// Type filter
		if (filterTypes.length > 0 && !filterTypes.includes(notif.type)) {
			return false;
		}
		// Unread filter
		if (showUnreadOnly && notif.is_read) {
			return false;
		}
		return true;
	});

	const unreadCount = notifications.filter((n) => !n.is_read).length;
	const hasActiveFilters =
		searchQuery || filterTypes.length > 0 || showUnreadOnly;

	return (
		<Layout>
			<div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
				<div className="container mx-auto px-4 py-8 max-w-5xl">
					{/* Enhanced Header */}
					<div className="mb-8">
						<div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 mb-6">
							<div>
								<div className="flex items-center gap-3 mb-2">
									<div className="p-3 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 shadow-lg shadow-primary/10">
										<Bell className="h-6 w-6 text-primary" />
									</div>
									<h1 className="text-3xl sm:text-4xl font-bold text-foreground">
										{t("notification.notifications")}
									</h1>
								</div>
								<p className="text-muted-foreground ml-1">
									{unreadCount > 0
										? `${unreadCount} ${t("notification.unreadNotifications")}`
										: t("notification.noNewNotifications")}
								</p>
							</div>

							{notifications.length > 0 && unreadCount > 0 && (
								<Button
									variant="outline"
									size="default"
									onClick={handleMarkAllAsRead}
									className="flex items-center gap-2 border-primary/20 hover:bg-primary/5 hover:border-primary/30 transition-all shadow-sm"
								>
									<CheckCheck className="h-4 w-4" />
									{t("notification.markAllRead")}
								</Button>
							)}
						</div>

						{/* Search and Filter Bar */}
						<div className="flex flex-col sm:flex-row gap-3 bg-card/50 backdrop-blur-sm p-4 rounded-2xl border border-border/50 shadow-sm">
							{/* Search */}
							<div className="relative flex-1">
								<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
								<Input
									placeholder={t(
										"notification.searchNotifications",
									)}
									value={searchQuery}
									onChange={(e) =>
										setSearchQuery(e.target.value)
									}
									className="pl-10 pr-10 bg-background border-border/50 focus:border-primary/50 transition-colors"
								/>
								{searchQuery && (
									<Button
										variant="ghost"
										size="icon"
										className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 rounded-md"
										onClick={() => setSearchQuery("")}
									>
										<X className="h-3.5 w-3.5" />
									</Button>
								)}
							</div>

							{/* Filter Dropdown */}
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button
										variant="outline"
										className={`flex items-center gap-2 min-w-[140px] ${
											hasActiveFilters
												? "border-primary/30 bg-primary/5"
												: ""
										}`}
									>
										<Filter className="h-4 w-4" />
										{t("notification.filters")}
										{(filterTypes.length > 0 ||
											showUnreadOnly) && (
											<span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold bg-primary/20 text-primary rounded-full">
												{filterTypes.length +
													(showUnreadOnly ? 1 : 0)}
											</span>
										)}
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent
									align="end"
									className="w-56"
								>
									<div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
										{t("notification.filterByType")}
									</div>
									<DropdownMenuCheckboxItem
										checked={filterTypes.includes(
											NotificationType.OrderStatus,
										)}
										onCheckedChange={() =>
											toggleFilterType(
												NotificationType.OrderStatus,
											)
										}
									>
										<span className="mr-2">📦</span>
										{getNotificationLabel(
											NotificationType.OrderStatus,
										)}
									</DropdownMenuCheckboxItem>
									<DropdownMenuCheckboxItem
										checked={filterTypes.includes(
											NotificationType.AccountSold,
										)}
										onCheckedChange={() =>
											toggleFilterType(
												NotificationType.AccountSold,
											)
										}
									>
										<span className="mr-2">💰</span>
										{getNotificationLabel(
											NotificationType.AccountSold,
										)}
									</DropdownMenuCheckboxItem>
									<DropdownMenuCheckboxItem
										checked={filterTypes.includes(
											NotificationType.Promotion,
										)}
										onCheckedChange={() =>
											toggleFilterType(
												NotificationType.Promotion,
											)
										}
									>
										<span className="mr-2">🎉</span>
										{getNotificationLabel(
											NotificationType.Promotion,
										)}
									</DropdownMenuCheckboxItem>
									<DropdownMenuCheckboxItem
										checked={filterTypes.includes(
											NotificationType.System,
										)}
										onCheckedChange={() =>
											toggleFilterType(
												NotificationType.System,
											)
										}
									>
										<span className="mr-2">⚙️</span>
										{getNotificationLabel(
											NotificationType.System,
										)}
									</DropdownMenuCheckboxItem>
									<DropdownMenuCheckboxItem
										checked={filterTypes.includes(
											NotificationType.Message,
										)}
										onCheckedChange={() =>
											toggleFilterType(
												NotificationType.Message,
											)
										}
									>
										<span className="mr-2">💬</span>
										{getNotificationLabel(
											NotificationType.Message,
										)}
									</DropdownMenuCheckboxItem>

									<DropdownMenuSeparator />

									<div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
										{t("notification.filterByStatus")}
									</div>
									<DropdownMenuCheckboxItem
										checked={showUnreadOnly}
										onCheckedChange={setShowUnreadOnly}
									>
										{t("notification.unreadOnly")}
									</DropdownMenuCheckboxItem>

									{hasActiveFilters && (
										<>
											<DropdownMenuSeparator />
											<Button
												variant="ghost"
												size="sm"
												className="w-full justify-center text-xs"
												onClick={() => {
													setFilterTypes([]);
													setShowUnreadOnly(false);
													setSearchQuery("");
												}}
											>
												{t("notification.clearFilters")}
											</Button>
										</>
									)}
								</DropdownMenuContent>
							</DropdownMenu>
						</div>

						{/* Active Filters Display */}
						{hasActiveFilters && (
							<div className="mt-3 flex items-center gap-2 flex-wrap">
								<span className="text-xs text-muted-foreground">
									{t("notification.activeFilters")}:
								</span>
								{searchQuery && (
									<span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full border border-primary/20">
										Search: "{searchQuery}"
										<X
											className="h-3 w-3 cursor-pointer hover:text-primary/70"
											onClick={() => setSearchQuery("")}
										/>
									</span>
								)}
								{showUnreadOnly && (
									<span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full border border-primary/20">
										{t("notification.unreadOnly")}
										<X
											className="h-3 w-3 cursor-pointer hover:text-primary/70"
											onClick={() =>
												setShowUnreadOnly(false)
											}
										/>
									</span>
								)}
								{filterTypes.map((type) => (
									<span
										key={type}
										className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full border border-primary/20"
									>
										{notificationTypeIcons[type]}{" "}
										{getNotificationLabel(type)}
										<X
											className="h-3 w-3 cursor-pointer hover:text-primary/70"
											onClick={() =>
												toggleFilterType(type)
											}
										/>
									</span>
								))}
							</div>
						)}
					</div>

					{/* Notifications List */}
					{isLoading && notifications.length === 0 ? (
						<div className="flex flex-col items-center justify-center h-96 gap-4">
							<div className="relative">
								<div className="h-16 w-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
							</div>
							<p className="text-muted-foreground animate-pulse">
								{t("loading") || "Loading..."}
							</p>
						</div>
					) : filteredNotifications.length === 0 ? (
						<div className="rounded-3xl border-2 border-dashed border-border/50 bg-gradient-to-br from-muted/5 to-muted/20 p-16 text-center">
							<div className="max-w-md mx-auto">
								{hasActiveFilters ? (
									<>
										<div className="p-4 rounded-full bg-muted/50 w-fit mx-auto mb-4">
											<Search className="h-10 w-10 text-muted-foreground" />
										</div>
										<h3 className="text-lg font-semibold text-foreground mb-2">
											{t(
												"notification.noMatchingNotifications",
											)}
										</h3>
										<p className="text-sm text-muted-foreground mb-4">
											{t(
												"notification.tryAdjustingFilters",
											)}
										</p>
										<Button
											variant="outline"
											onClick={() => {
												setFilterTypes([]);
												setShowUnreadOnly(false);
												setSearchQuery("");
											}}
										>
											{t("notification.clearFilters")}
										</Button>
									</>
								) : (
									<>
										<div className="p-4 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 w-fit mx-auto mb-4 shadow-lg shadow-primary/10">
											<Sparkles className="h-10 w-10 text-primary" />
										</div>
										<h3 className="text-lg font-semibold text-foreground mb-2">
											{t("notification.noNotifications")}
										</h3>
										<p className="text-sm text-muted-foreground mb-6">
											{t(
												"notification.notificationEmptyDesc",
											)}
										</p>
										<Link to="/">
											<Button className="btn-gaming">
												{t("notification.backToHome")}
											</Button>
										</Link>
									</>
								)}
							</div>
						</div>
					) : (
						<div className="space-y-3">
							<AnimatePresence mode="popLayout">
								{filteredNotifications.map((notification) => (
									<motion.div
										key={notification.id}
										layout
										initial={{ opacity: 0, y: 20 }}
										animate={{
											opacity:
												deletingId === notification.id
													? 0.5
													: 1,
											y: 0,
											scale:
												deletingId === notification.id
													? 0.98
													: 1,
										}}
										exit={{ opacity: 0, x: -20, height: 0 }}
										transition={{ duration: 0.2 }}
										className={`relative rounded-2xl border transition-all p-5 group hover:shadow-lg hover:scale-[1.01] ${
											!notification.is_read
												? "border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10 shadow-md shadow-primary/5"
												: "border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card/80"
										}`}
									>
										{/* Unread indicator */}
										{!notification.is_read && (
											<div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-primary via-primary/70 to-primary/30 rounded-l-2xl" />
										)}

										<div className="flex items-start gap-4 pl-1">
											{/* Type Badge with Icon */}
											<div
												className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold uppercase tracking-wider flex-shrink-0 shadow-sm ${notificationTypeColors[notification.type]}`}
											>
												<span className="text-lg">
													{
														notificationTypeIcons[
															notification.type
														]
													}
												</span>
												<span>
													{getNotificationLabel(
														notification.type,
													)}
												</span>
											</div>

											{/* Content */}
											<div className="flex-1 min-w-0">
												<div
													className="cursor-pointer"
													onClick={() =>
														!notification.is_read &&
														handleMarkAsRead(
															notification.id,
														)
													}
												>
													<h3
														className={`text-base font-bold mb-2 transition-colors ${
															!notification.is_read
																? "text-foreground"
																: "text-muted-foreground"
														}`}
													>
														{notification.title}
													</h3>
													<p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
														{notification.message}
													</p>
												</div>

												<div className="flex items-center justify-between mt-4 pt-3 border-t border-border/30">
													<span className="text-xs text-muted-foreground/80 font-medium flex items-center gap-2">
														<span className="inline-block w-1.5 h-1.5 rounded-full bg-muted-foreground/40"></span>
														{formatTimeAgo(
															notification.created_at,
														)}
													</span>

													{notification.action_url && (
														<Link
															to={
																notification.action_url
															}
															className="text-xs text-primary hover:text-primary/80 font-bold uppercase tracking-wider flex items-center gap-1.5 group/link transition-all"
														>
															{t(
																"notification.viewDetails",
															)}
															<span className="group-hover/link:translate-x-1 transition-transform">
																→
															</span>
														</Link>
													)}
												</div>
											</div>

											{/* Actions */}
											<div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200">
												{!notification.is_read && (
													<Button
														size="icon"
														variant="ghost"
														className="h-9 w-9 hover:bg-primary/10 hover:scale-110 transition-all rounded-xl"
														onClick={() =>
															handleMarkAsRead(
																notification.id,
															)
														}
														title={t(
															"notification.markAsRead",
														)}
													>
														<CheckCheck className="h-4 w-4 text-primary" />
													</Button>
												)}
												<Button
													size="icon"
													variant="ghost"
													className="h-9 w-9 hover:bg-destructive/10 text-destructive hover:scale-110 transition-all rounded-xl"
													onClick={() =>
														handleDelete(
															notification.id,
														)
													}
													disabled={
														deletingId ===
														notification.id
													}
													title={t(
														"notification.delete",
													)}
												>
													<Trash2 className="h-4 w-4" />
												</Button>
											</div>
										</div>
									</motion.div>
								))}
							</AnimatePresence>
						</div>
					)}
				</div>
			</div>
		</Layout>
	);
}
