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
	Filter,
} from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PaginationWrapper } from "@/components/ui/pagination-wrapper";
import { useAuthStore } from "@/stores/authStore";
import { orderService } from "@/services/orderService";
import { formatCurrency, formatDateTime } from "@/utils/format";
import { useEffect, useState } from "react";
import type { Order } from "@/types";
import { useTranslation } from "@/stores/languageStore";
import { OrderStatus, OrderType, OrderStatusLabel } from "@/constants/enums";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

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
	const [_isLoading, setIsLoading] = useState(false);
	const { t } = useTranslation();

	// 2. STATE PHÂN TRANG & BỘ LỌC
	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [totalItems, setTotalItems] = useState(0);
	
	const [filterType, setFilterType] = useState<string>("all"); // "all" | "0" | "1"
	const [filterStatus, setFilterStatus] = useState<string>("all"); // "all" | "0" | "1"...

	const pageSize = 10;

	useEffect(() => {
		if (isAuthenticated) {
			loadOrders(currentPage);
		}
	}, [isAuthenticated, currentPage, filterType, filterStatus]);

	const loadOrders = async (page: number) => {
		setIsLoading(true);
		try {
			const typeParam = filterType === "all" ? undefined : Number(filterType) as OrderType;
			const statusParam = filterStatus === "all" ? undefined : Number(filterStatus) as OrderStatus;

			const res = await orderService.getMyOrders(page, pageSize, typeParam, statusParam);
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
		return OrderStatusLabel[status] || t("unknown");
	};

	const handleTypeChange = (value: string) => {
		setFilterType(value);
		setCurrentPage(1);
	};

	const handleStatusChange = (value: string) => {
		setFilterStatus(value);
		setCurrentPage(1);
	};

	if (!isAuthenticated) {
		return (
			<Layout>
				<div className="container mx-auto px-4 py-20 text-center">
					<div className="p-4 rounded-full bg-secondary w-fit mx-auto mb-4">
						<Package className="h-12 w-12 text-muted-foreground" />
					</div>
					<h1 className="font-gaming text-2xl font-bold mb-4">
						{t("loginToViewOrders")}
					</h1>
					<p className="text-muted-foreground mb-6">
						{t("loginToViewOrdersDesc")}
					</p>
					<Link to="/auth">
						<Button className="btn-gaming">{t("loginNow")}</Button>
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
						{t("myOrders")}{" "}
						<span className="text-gradient">{t("ofMe")}</span>
					</h1>
					<p className="text-muted-foreground">{t("trackOrders")}</p>
				</motion.div>

				{/* FILTER BAR */}
				<div className="flex flex-col sm:flex-row gap-4 mb-8">
					<div className="w-full sm:w-[180px]">
						<Select value={filterType} onValueChange={handleTypeChange}>
							<SelectTrigger>
								<div className="flex items-center gap-2">
									<Filter className="h-4 w-4 text-muted-foreground" />
									<SelectValue placeholder="Loại đơn hàng" />
								</div>
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">Tất cả loại</SelectItem>
								<SelectItem value={OrderType.BuyAcc.toString()}>Mua Tài Khoản</SelectItem>
								<SelectItem value={OrderType.Deposit.toString()}>Nạp Tiền</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div className="w-full sm:w-[180px]">
						<Select value={filterStatus} onValueChange={handleStatusChange}>
							<SelectTrigger>
								<SelectValue placeholder="Trạng thái" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">Tất cả trạng thái</SelectItem>
								{Object.entries(OrderStatusLabel).map(([key, label]) => (
									<SelectItem key={key} value={key}>
										{label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</div>

				{orders.length > 0 ? (
					<>
						<div className="space-y-4">
							{orders.map((order) => {
								const config =
									statusConfigMap[order.status] ||
									statusConfigMap[OrderStatus.Pending];
								const StatusIcon = config.icon;
								
								// 5. Kiểm tra loại đơn để hiển thị icon phù hợp
								const isDeposit = order.type === OrderType.Deposit;

								return (
									<motion.div
										key={order.id}
										className="p-6 rounded-xl bg-card border border-border"
									>
										<div className="flex flex-col md:flex-row md:items-center gap-4">
											{/* Thumbnail */}
											<div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-secondary flex items-center justify-center border border-border/50">
												{isDeposit ? (
													<Wallet className="h-8 w-8 text-primary" />
												) : order.account?.images?.[0] ? (
													<img
														src={order.account.images[0]}
														alt={order.account?.title}
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
													<span className="font-mono text-sm text-muted-foreground">
														#{order.id}
													</span>
													<Badge className={config.className}>
														<StatusIcon className="h-3 w-3 mr-1" />
														{getStatusLabel(order.status)}
													</Badge>
													<Badge variant="outline" className="text-xs">
														{isDeposit ? "Nạp tiền" : "Mua Acc"}
													</Badge>
												</div>
												<h3 className="font-gaming font-semibold">
													{isDeposit 
														? "Nạp tiền vào tài khoản" 
														: (order.account?.title || t("accountNotFound"))
													}
												</h3>
												<div className="text-sm text-muted-foreground">
													{formatDateTime(order.created_at)}
												</div>
											</div>

											{/* Price & Actions */}
											<div className="flex flex-col items-end gap-2">
												<span className="font-gaming text-xl font-bold text-primary">
													{formatCurrency(order.total_price)}
												</span>
												<div className="flex gap-2">
													{/* Chỉ hiện nút thanh toán nếu Pending */}
													{order.status === OrderStatus.Pending && (
														<Link to={`/payment/${order.id}`}>
															<Button size="sm" className="btn-gaming">
																{t("pay")}
															</Button>
														</Link>
													)}
													
													{/* Chỉ hiện nút chi tiết nếu là đơn Mua Acc */}
													{!isDeposit && order.account && (
														<Link to={`/accounts/${order.account.id}`}>
															<Button
																size="sm"
																variant="outline"
																className="gap-1"
															>
																<Eye className="h-4 w-4" />
																{t("details")}
															</Button>
														</Link>
													)}
												</div>
											</div>
										</div>
									</motion.div>
								);
							})}
						</div>
						
						{/* Component Phân Trang */}
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
						className="text-center py-20"
					>
						<div className="p-4 rounded-full bg-secondary w-fit mx-auto mb-4">
							<Package className="h-12 w-12 text-muted-foreground" />
						</div>
						<h3 className="font-gaming text-xl font-semibold mb-2">
							{t("noOrders")}
						</h3>
						<p className="text-muted-foreground mb-6">
							{t("tryChangeFilter")}
						</p>
						
						{/* Nút reset filter nếu đang lọc */}
						{(filterType !== "all" || filterStatus !== "all") && (
							<Button 
								variant="outline" 
								onClick={() => {
									setFilterType("all");
									setFilterStatus("all");
									setCurrentPage(1);
								}}
								className="mr-2"
							>
								Xóa bộ lọc
							</Button>
						)}

						<Link to="/accounts">
							<Button className="btn-gaming">
								{t("viewAccGame")}
							</Button>
						</Link>
					</motion.div>
				)}
			</div>
		</Layout>
	);
}