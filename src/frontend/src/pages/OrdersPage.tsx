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

type OrderStatus = "pending" | "paid" | "cancelled" | "refunded" | "delivered";

type StatusConfig = {
	icon: React.ElementType;
	className: string;
};

const statusConfigMap: Record<OrderStatus, StatusConfig> = {
	pending: {
		icon: Clock,
		className: "text-yellow-500",
	},
	paid: {
		icon: CheckCircle,
		className: "text-green-500",
	},
	delivered: {
		icon: Truck,
		className: "text-blue-500",
	},
	cancelled: {
		icon: XCircle,
		className: "text-red-500",
	},
	refunded: {
		icon: RotateCcw,
		className: "text-gray-500",
	},
};

export default function OrdersPage() {
	const { isAuthenticated } = useAuthStore();
	const [orders, setOrders] = useState<Order[]>([]);
	const [_isLoading, setIsLoading] = useState(false);
	const { t } = useTranslation();

	// Server-side pagination state
	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [totalItems, setTotalItems] = useState(0);
	const pageSize = 10;

	useEffect(() => {
		if (isAuthenticated) {
			loadOrders(currentPage);
		}
	}, [isAuthenticated, currentPage]);

	const loadOrders = async (page: number) => {
		setIsLoading(true);
		try {
			const res = await orderService.getMyOrders(page, pageSize);
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

	// Hàm helper để lấy text hiển thị dựa trên status
	const getStatusLabel = (status: OrderStatus) => {
		switch (status) {
			case "pending":
				return t("statusPending");
			case "paid":
				return t("statusPaid");
			case "delivered":
				return t("statusDelivered");
			case "cancelled":
				return t("statusCancelled");
			case "refunded":
				return t("statusRefunded");
			default:
				return status;
		}
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
					className="mb-8"
				>
					<h1 className="font-gaming text-3xl md:text-4xl font-bold mb-2">
						{t("myOrders")} <span className="text-gradient">{t("ofMe")}</span>
					</h1>
					<p className="text-muted-foreground">
						{t("trackOrders")}
					</p>
				</motion.div>

				{orders.length > 0 ? (
					<>
						<div className="space-y-4">
							{orders.map((order) => {
								const config =
									statusConfigMap[order.status] ||
									statusConfigMap.pending;
								const StatusIcon = config.icon;

								return (
									<motion.div
										key={order.id}
										className="p-6 rounded-xl bg-card border border-border"
									>
										<div className="flex flex-col md:flex-row md:items-center gap-4">
											{/* Thumbnail */}
											<div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
												{order.account?.images?.[0] ? (
													<img
														src={order.account.images[0]}
														alt={order.account?.title}
														className="w-full h-full object-cover"
													/>
												) : (
													<div className="w-full h-full flex items-center justify-center text-muted-foreground">
														<Package className="h-8 w-8" />
													</div>
												)}
											</div>

											{/* Info */}
											<div className="flex-1 space-y-2">
												<div className="flex items-center gap-2 flex-wrap">
													<span className="font-mono text-sm text-muted-foreground">
														{order.id}
													</span>
													<Badge
														className={
															config.className
														}
													>
														<StatusIcon className="h-3 w-3 mr-1" />
														{getStatusLabel(order.status)}
													</Badge>
												</div>
												<h3 className="font-gaming font-semibold">
													{order.account?.title ||
														t("accountNotFound")}
												</h3>
												<div className="text-sm text-muted-foreground">
													{formatDateTime(
														order.created_at
													)}
												</div>
											</div>

											{/* Price & Actions */}
											<div className="flex flex-col items-end gap-2">
												<span className="font-gaming text-xl font-bold text-primary">
													{formatCurrency(
														order.total_price
													)}
												</span>
												<div className="flex gap-2">
													{order.status ===
														"pending" && (
														<Link
															to={`/payment/${order.id}`}
														>
															<Button
																size="sm"
																className="btn-gaming"
															>
																{t("pay")}
															</Button>
														</Link>
													)}
													{order.account && (
														<Link
															to={`/accounts/${order.account.id}`}
														>
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
							{t("startBuying")}
						</p>
						<Link to="/accounts">
							<Button className="btn-gaming">{t("viewAccGame")}</Button>
						</Link>
					</motion.div>
				)}
			</div>
		</Layout>
	);
}