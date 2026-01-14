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

type OrderStatus = "pending" | "paid" | "cancelled" | "refunded" | "delivered";

type StatusConfig = {
	label: string;
	icon: React.ElementType;
	className: string;
};

const statusMap: Record<OrderStatus, StatusConfig> = {
	pending: {
		label: "Pending",
		icon: Clock,
		className: "text-yellow-500",
	},
	paid: {
		label: "Paid",
		icon: CheckCircle,
		className: "text-green-500",
	},
	delivered: {
		label: "Delivered",
		icon: Truck,
		className: "text-blue-500",
	},
	cancelled: {
		label: "Cancelled",
		icon: XCircle,
		className: "text-red-500",
	},
	refunded: {
		label: "Refunded",
		icon: RotateCcw,
		className: "text-gray-500",
	},
};

export default function OrdersPage() {
	const { isAuthenticated } = useAuthStore();
	const [orders, setOrders] = useState<Order[]>([]);
	const [_isLoading, setIsLoading] = useState(false);

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

	if (!isAuthenticated) {
		return (
			<Layout>
				<div className="container mx-auto px-4 py-20 text-center">
					<div className="p-4 rounded-full bg-secondary w-fit mx-auto mb-4">
						<Package className="h-12 w-12 text-muted-foreground" />
					</div>
					<h1 className="font-gaming text-2xl font-bold mb-4">
						Đăng nhập để xem đơn hàng
					</h1>
					<p className="text-muted-foreground mb-6">
						Bạn cần đăng nhập để xem lịch sử đơn hàng của mình
					</p>
					<Link to="/auth">
						<Button className="btn-gaming">Đăng nhập ngay</Button>
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
						Đơn Hàng <span className="text-gradient">Của Tôi</span>
					</h1>
					<p className="text-muted-foreground">
						Theo dõi trạng thái các đơn hàng của bạn
					</p>
				</motion.div>

				{orders.length > 0 ? (
					<>
						<div className="space-y-4">
							{orders.map((order) => {
								const status =
									statusMap[order.status] ||
									statusMap.pending;
								const StatusIcon = status.icon;

								return (
									<motion.div
										key={order.id}
										// ... animation props
										className="p-6 rounded-xl bg-card border border-border ..."
									>
										<div className="flex flex-col md:flex-row md:items-center gap-4">
											{/* Thumbnail: Cần check optional chaining vì account có thể null nếu backend chưa preload */}
											<div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
												<img
													src={
														order.account
															?.thumbnail ||
														"/placeholder.png"
													}
													alt={order.account?.title}
													className="w-full h-full object-cover"
												/>
											</div>

											{/* Info */}
											<div className="flex-1 space-y-2">
												<div className="flex items-center gap-2 flex-wrap">
													<span className="font-mono text-sm text-muted-foreground">
														{order.id}
													</span>
													<Badge
														className={
															status.className
														}
													>
														<StatusIcon className="h-3 w-3 mr-1" />
														{status.label}
													</Badge>
												</div>
												<h3 className="font-gaming font-semibold">
													{order.account?.title ||
														"Account không tồn tại"}
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
																Thanh toán
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
																Chi tiết
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
				) : orders.length > 0 ? null : (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						className="text-center py-20"
					>
						<div className="p-4 rounded-full bg-secondary w-fit mx-auto mb-4">
							<Package className="h-12 w-12 text-muted-foreground" />
						</div>
						<h3 className="font-gaming text-xl font-semibold mb-2">
							Chưa có đơn hàng nào
						</h3>
						<p className="text-muted-foreground mb-6">
							Bắt đầu mua acc game đầu tiên của bạn ngay!
						</p>
						<Link to="/accounts">
							<Button className="btn-gaming">Xem Acc Game</Button>
						</Link>
					</motion.div>
				)}
			</div>
		</Layout>
	);
}
