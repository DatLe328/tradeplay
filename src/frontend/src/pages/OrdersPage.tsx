import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
	Package,
	Clock,
	CheckCircle,
	Truck,
	Eye,
	XCircle,
	RotateCcw,
	Wallet,
	Gamepad2,
	Lock,
	Copy,
	Loader2,
	History,
	CreditCard,
} from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PaginationWrapper } from "@/components/ui/pagination-wrapper";
import { useAuthStore } from "@/stores/authStore";
import { orderService } from "@/services/orderService";
import { accountService } from "@/services/accountService";
import { formatCurrency, formatDateTime } from "@/utils/format";
import { useEffect, useState } from "react";
import type { Order, AccountCredentials } from "@/types";
import { useTranslation } from "@/stores/languageStore";
import {
	OrderStatus,
	OrderType,
	OrderStatusLabel,
	getGameName,
} from "@/constants/enums";
import { useToast } from "@/hooks/use-toast";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type StatusConfig = {
	icon: React.ElementType;
	className: string;
};

const statusConfigMap: Record<number, StatusConfig> = {
	[OrderStatus.Pending]: {
		icon: Clock,
		className: "text-yellow-500",
	},
	[OrderStatus.Paid]: {
		icon: CheckCircle,
		className: "text-green-500",
	},
	[OrderStatus.Completed]: {
		icon: Truck,
		className: "text-blue-500",
	},
	[OrderStatus.Cancelled]: {
		icon: XCircle,
		className: "text-red-500",
	},
	[OrderStatus.Refunded]: {
		icon: RotateCcw,
		className: "text-gray-500",
	},
};

export default function OrdersPage() {
	const { isAuthenticated } = useAuthStore();
	const [orders, setOrders] = useState<Order[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const { t } = useTranslation();
	const { toast } = useToast();

	const [currentPage, setCurrentPage] = useState(1);
	useEffect(() => {
		window.scrollTo({ top: 0, behavior: "smooth" });
	}, [currentPage]);

	const [totalPages, setTotalPages] = useState(1);
	const [totalItems, setTotalItems] = useState(0);
	const [activeTab, setActiveTab] = useState<"accounts" | "deposits">(
		"accounts",
	);

	const [filterStatus, setFilterStatus] = useState<string>("all");

	const [showCredsModal, setShowCredsModal] = useState(false);
	const [selectedCreds, setSelectedCreds] =
		useState<AccountCredentials | null>(null);
	const [isFetchingCreds, setIsFetchingCreds] = useState(false);

	const pageSize = 10;

	useEffect(() => {
		if (isAuthenticated) {
			loadOrders(currentPage);
		}
	}, [isAuthenticated, currentPage, activeTab, filterStatus]); // Thêm activeTab vào dependency

	const loadOrders = async (page: number) => {
		setIsLoading(true);
		try {
			const typeParam =
				activeTab === "accounts" ? OrderType.BuyAcc : OrderType.Deposit;
			const statusParam =
				filterStatus === "all"
					? undefined
					: (Number(filterStatus) as OrderStatus);

			const res = await orderService.getMyOrders(
				page,
				pageSize,
				typeParam,
				statusParam,
			);
			setOrders(res.data);
			if (res.paging) {
				setTotalItems(Number(res.paging.total));
				setTotalPages(Math.ceil(Number(res.paging.total) / pageSize));
			}
		} catch (error) {
			// console.error(error);
		} finally {
			setIsLoading(false);
		}
	};

	const getStatusLabel = (status: number) => {
		return OrderStatusLabel[status] || t("ordersPage.unknown");
	};

	const handleTabChange = (tab: "accounts" | "deposits") => {
		if (activeTab !== tab) {
			setActiveTab(tab);
			setCurrentPage(1);
			setFilterStatus("all");
		}
	};

	const handleStatusChange = (value: string) => {
		setFilterStatus(value);
		setCurrentPage(1);
	};

	const handleViewCredentials = async (accountId: string | number) => {
		setIsFetchingCreds(true);
		try {
			const res = await accountService.getCredentials(accountId);
			if (res.data) {
				setSelectedCreds(res.data);
				setShowCredsModal(true);
			}
		} catch (error: any) {
			toast({
				title: "Lỗi",
				description:
					error.message || "Không thể lấy thông tin tài khoản",
				variant: "destructive",
			});
		} finally {
			setIsFetchingCreds(false);
		}
	};

	const copyToClipboard = (text: string) => {
		navigator.clipboard.writeText(text);
		toast({
			title: "Đã sao chép",
			description: "Đã lưu vào bộ nhớ tạm",
		});
	};

	if (!isAuthenticated) {
		return (
			<Layout>
				<div className="container mx-auto px-4 py-20 text-center">
					<div className="p-4 rounded-full bg-secondary w-fit mx-auto mb-4">
						<Package className="h-12 w-12 text-muted-foreground" />
					</div>
					<h1 className="font-gaming text-2xl font-bold mb-4">
						{t("ordersPage.loginToViewOrders")}
					</h1>
					<p className="text-muted-foreground mb-6">
						{t("ordersPage.loginToViewOrdersDesc")}
					</p>
					<Link to="/auth">
						<Button className="btn-gaming">{t("ordersPage.loginNow")}</Button>
					</Link>
				</div>
			</Layout>
		);
	}

	return (
		<Layout>
			<div className="container mx-auto px-4 py-8">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					className="mb-6"
				>
					<h1 className="font-gaming text-3xl md:text-4xl font-bold mb-2">
						{t("ordersPage.myOrders")}{" "}
						<span className="text-gradient">{t("ordersPage.ofMe")}</span>
					</h1>
					<p className="text-muted-foreground">{t("ordersPage.trackOrders")}</p>
				</motion.div>

				<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
					{/* Tabs Buttons */}
					<div className="flex p-1 bg-secondary/50 rounded-lg border border-border">
						<button
							onClick={() => handleTabChange("accounts")}
							className={cn(
								"flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
								activeTab === "accounts"
									? "bg-background text-primary shadow-sm"
									: "text-muted-foreground hover:text-foreground",
							)}
						>
							<History className="h-4 w-4" />
							{t("ordersPage.accountHistory")}
						</button>
						<button
							onClick={() => handleTabChange("deposits")}
							className={cn(
								"flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
								activeTab === "deposits"
									? "bg-background text-primary shadow-sm"
									: "text-muted-foreground hover:text-foreground",
							)}
						>
							<CreditCard className="h-4 w-4" />
							{t("ordersPage.depositHistory")}
						</button>
					</div>

					<div className="w-full sm:w-[200px]">
						<Select
							value={filterStatus}
							onValueChange={handleStatusChange}
						>
							<SelectTrigger>
								<SelectValue placeholder="Trạng thái đơn" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">
									Tất cả trạng thái
								</SelectItem>
								{Object.entries(OrderStatusLabel).map(
									([key, label]) => (
										<SelectItem key={key} value={key}>
											{label}
										</SelectItem>
									),
								)}
							</SelectContent>
						</Select>
					</div>
				</div>

				{isLoading ? (
					<div className="space-y-4">
						{[1, 2, 3].map((i) => (
							<div
								key={i}
								className="h-24 bg-card/50 rounded-xl animate-pulse"
							/>
						))}
					</div>
				) : orders.length > 0 ? (
					<>
						<div className="space-y-4">
							{orders.map((order) => {
								const config =
									statusConfigMap[order.status] ||
									statusConfigMap[OrderStatus.Pending];
								const StatusIcon = config.icon;

								const isDeposit = activeTab === "deposits";
								const isSuccess =
									order.status === OrderStatus.Paid ||
									order.status === OrderStatus.Completed;

								return (
									<motion.div
										key={order.id}
										initial={{ opacity: 0 }}
										animate={{ opacity: 1 }}
										className="p-6 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors"
									>
										<div className="flex flex-col md:flex-row md:items-center gap-4">
											{/* Thumbnail */}
											<div className="w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden flex-shrink-0 bg-secondary flex items-center justify-center border border-border/50">
												{isDeposit ? (
													<Wallet className="h-8 w-8 text-primary" />
												) : order.account?.thumbnail ||
												  order.account?.images?.[0] ? (
													<img
														src={
															order.account
																.thumbnail ||
															order.account
																.images[0]
														}
														alt={
															order.account?.title
														}
														className="w-full h-full object-cover"
													/>
												) : (
													<div className="w-full h-full flex items-center justify-center text-muted-foreground">
														<Gamepad2 className="h-8 w-8" />
													</div>
												)}
											</div>

											{/* Info */}
											<div className="flex-1 space-y-2">
												<div className="flex items-center gap-2 flex-wrap">
													<span className="font-mono text-xs text-muted-foreground">
														#{order.id}
													</span>
													{!isDeposit &&
														order.account && (
															<Badge
																variant="outline"
																className="text-[10px] h-5 bg-background/50"
															>
																{order.account
																	.category
																	?.name ||
																	getGameName(
																		order
																			.account
																			.category_id,
																	)}
															</Badge>
														)}
													<Badge
														className={cn(
															"text-xs",
															config.className,
														)}
														variant="secondary"
													>
														<StatusIcon className="h-3 w-3 mr-1" />
														{getStatusLabel(
															order.status,
														)}
													</Badge>
												</div>

												<h3 className="font-gaming font-semibold line-clamp-1">
													{isDeposit
														? `Nạp tiền qua ${order.payment_method || "Ngân hàng"}`
														: order.account
																?.title ||
															t(
																"ordersPage.accountNotFound",
															)}
												</h3>

												<div className="text-sm text-muted-foreground flex gap-4">
													<span>
														{formatDateTime(
															order.created_at,
														)}
													</span>
												</div>
											</div>

											{/* Price & Actions */}
											<div className="flex flex-col items-end gap-2 mt-2 md:mt-0">
												<span className="font-gaming text-lg md:text-xl font-bold text-primary">
													{formatCurrency(
														order.total_price,
													)}
												</span>

												<div className="flex gap-2 flex-wrap justify-end">
													{order.status ===
														OrderStatus.Pending && (
														<Link
															to={`/payment/${order.id}`}
														>
															<Button
																size="sm"
																className="btn-gaming h-8"
															>
																{t("ordersPage.pay")}
															</Button>
														</Link>
													)}

													{!isDeposit && (
														<>
															{isSuccess &&
																order.account && (
																	<Button
																		size="sm"
																		className="bg-green-600 hover:bg-green-700 text-white gap-1 h-8"
																		onClick={() =>
																			handleViewCredentials(
																				order
																					.account!
																					.id,
																			)
																		}
																		disabled={
																			isFetchingCreds
																		}
																	>
																		{isFetchingCreds ? (
																			<Loader2 className="h-3 w-3 animate-spin" />
																		) : (
																			<Lock className="h-3 w-3" />
																		)}
																		<span className="hidden sm:inline">
																			Xem
																			Thông
																			Tin
																		</span>
																	</Button>
																)}

															{order.account && (
																<Link
																	to={`/accounts/${order.account.id}`}
																>
																	<Button
																		size="sm"
																		variant="outline"
																		className="gap-1 h-8"
																	>
																		<Eye className="h-3 w-3" />
																		Chi tiết
																	</Button>
																</Link>
															)}
														</>
													)}
												</div>
											</div>
										</div>
									</motion.div>
								);
							})}
						</div>

						<PaginationWrapper
							currentPage={currentPage}
							totalPages={totalPages}
							totalItems={totalItems}
							onPageChange={setCurrentPage}
							pageSize={pageSize}
						/>
					</>
				) : (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						className="text-center py-20 bg-card/30 rounded-xl border border-dashed border-border"
					>
						<div className="p-4 rounded-full bg-secondary w-fit mx-auto mb-4">
							{activeTab === "deposits" ? (
								<Wallet className="h-10 w-10 text-muted-foreground" />
							) : (
								<Package className="h-10 w-10 text-muted-foreground" />
							)}
						</div>
						<h3 className="font-gaming text-xl font-semibold mb-2">
							{activeTab === "deposits"
								? t("ordersPage.noDeposits")
								: t("ordersPage.noOrders")}
						</h3>
						<p className="text-muted-foreground mb-6 max-w-sm mx-auto">
							{activeTab === "deposits"
								? t("ordersPage.noDepositsDesc")
								: t("ordersPage.noOrdersDesc")}
						</p>

						{filterStatus !== "all" ? (
							<Button
								variant="outline"
								onClick={() => setFilterStatus("all")}
							>
								{t("ordersPage.clearFilters")}
							</Button>
						) : activeTab === "accounts" ? (
							<Link to="/accounts">
								<Button className="btn-gaming">
									{t("ordersPage.viewAccGame")}
								</Button>
							</Link>
						) : (
							<Link to="/profile">
								<Button variant="outline">
									{t("ordersPage.topUpNow")}
								</Button>
							</Link>
						)}
					</motion.div>
				)}
			</div>

			<Dialog open={showCredsModal} onOpenChange={setShowCredsModal}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2">
							<Lock className="h-5 w-5 text-primary" />
							{t("ordersPage.accountCredentials")}
						</DialogTitle>
						<DialogDescription>
							{t("ordersPage.accountCredentialsDesc")}
						</DialogDescription>
					</DialogHeader>

					{selectedCreds && (
						<div className="space-y-4 py-2">
							<div className="space-y-2">
								<Label>
									{t("ordersPage.username")}
									</Label>
								<div className="flex gap-2">
									<Input
										readOnly
										value={selectedCreds.username}
										className="bg-secondary/50 font-mono"
									/>
									<Button
										variant="outline"
										size="icon"
										onClick={() =>
											copyToClipboard(
												selectedCreds.username,
											)
										}
									>
										<Copy className="h-4 w-4" />
									</Button>
								</div>
							</div>

							<div className="space-y-2">
								<Label>Mật khẩu</Label>
								<div className="flex gap-2">
									<Input
										readOnly
										value={selectedCreds.password}
										className="bg-secondary/50 font-mono text-primary font-bold"
									/>
									<Button
										variant="outline"
										size="icon"
										onClick={() =>
											copyToClipboard(
												selectedCreds.password,
											)
										}
									>
										<Copy className="h-4 w-4" />
									</Button>
								</div>
							</div>

							{selectedCreds.extra_data && (
								<div className="space-y-2">
									<Label>{t("ordersPage.extraData")}</Label>
									<div className="p-3 rounded-md bg-secondary/50 border border-border text-sm font-mono break-all">
										{selectedCreds.extra_data}
									</div>
									<Button
										variant="link"
										size="sm"
										className="p-0 h-auto"
										onClick={() =>
											copyToClipboard(
												selectedCreds.extra_data!,
											)
										}
									>
										<Copy className="h-4 w-4" />
									</Button>
								</div>
							)}
						</div>
					)}
				</DialogContent>
			</Dialog>
		</Layout>
	);
}
