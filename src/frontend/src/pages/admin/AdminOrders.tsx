import { motion } from "framer-motion";
import {
	Check,
	Mail,
	Clock,
	CheckCircle,
	Truck,
	X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PaginationWrapper } from "@/components/ui/pagination-wrapper";
import { formatCurrency, formatDateTime } from "@/utils/format";
import { useToast } from "@/hooks/use-toast";
import { orderService } from "@/services/orderService";
import { useEffect, useState } from "react";
import type { Order } from "@/types";

const statusConfig: any = {
	pending: {
		label: "Chờ thanh toán",
		icon: Clock,
		className: "badge-pending",
	},
	paid: {
		label: "Đã thanh toán",
		icon: CheckCircle,
		className: "badge-available",
	},
	delivered: {
		label: "Đã gửi acc",
		icon: Truck,
		className: "badge-completed",
	},
	cancelled: {
		label: "Đã hủy",
		icon: X,
		className: "bg-destructive/10 text-destructive",
	},
};

export default function AdminOrders() {
	const [orders, setOrders] = useState<Order[]>([]);
	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const pageSize = 10;

	const { toast } = useToast();

	const loadOrders = async (page: number) => {
		try {
			const res = await orderService.getAdminOrders(page, pageSize);
			setOrders(res.data);
			if (res.paging) {
				setTotalPages(Math.ceil(Number(res.paging.total) / pageSize));
			}
		} catch (error) {
			toast({ title: "Lỗi tải đơn hàng", variant: "destructive" });
		}
	};

	useEffect(() => {
		loadOrders(currentPage);
	}, [currentPage]);

	const handleUpdateStatus = async (orderId: string, status: string) => {
		try {
			await orderService.updateStatus(orderId, status);
			toast({ title: `Đã cập nhật trạng thái: ${status}` });
			loadOrders(currentPage);
		} catch (error) {
			toast({ title: "Cập nhật thất bại", variant: "destructive" });
		}
	};

	return (
		<div className="p-6 space-y-6">
			{/* Header */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
			>
				<h1 className="font-gaming text-3xl font-bold mb-2">
					Quản Lý Order
				</h1>
				<p className="text-muted-foreground">
					Xác nhận thanh toán và gửi acc cho khách hàng
				</p>
			</motion.div>

			{/* Stats */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.1 }}
				className="grid grid-cols-3 gap-4"
			>
				<div className="p-4 rounded-xl bg-warning/10 border border-warning/30">
					<div className="flex items-center gap-3">
						<Clock className="h-8 w-8 text-warning" />
						<div>
							<div className="font-gaming text-2xl font-bold">
								{
									orders.filter((o) => o.status === "pending")
										.length
								}
							</div>
							<div className="text-sm text-muted-foreground">
								Chờ thanh toán
							</div>
						</div>
					</div>
				</div>
				<div className="p-4 rounded-xl bg-success/10 border border-success/30">
					<div className="flex items-center gap-3">
						<CheckCircle className="h-8 w-8 text-success" />
						<div>
							<div className="font-gaming text-2xl font-bold">
								{
									orders.filter((o) => o.status === "paid")
										.length
								}
							</div>
							<div className="text-sm text-muted-foreground">
								Đã thanh toán
							</div>
						</div>
					</div>
				</div>
				<div className="p-4 rounded-xl bg-primary/10 border border-primary/30">
					<div className="flex items-center gap-3">
						<Truck className="h-8 w-8 text-primary" />
						<div>
							<div className="font-gaming text-2xl font-bold">
								{
									orders.filter(
										(o) => o.status === "delivered"
									).length
								}
							</div>
							<div className="text-sm text-muted-foreground">
								Đã gửi acc
							</div>
						</div>
					</div>
				</div>
			</motion.div>

			{orders.length > 0 ? (
				<>
					<div className="space-y-4">
						{orders.map((order) => {
							const status =
								statusConfig[order.status] ||
								statusConfig.pending;
							const StatusIcon = status.icon;

							return (
								<motion.div
									key={order.id}
									className="p-6 rounded-xl bg-card border border-border"
								>
									<div className="flex flex-col lg:flex-row lg:items-center gap-4">
										{/* Thumbnail */}
										<div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
											<img
												src={order.account?.thumbnail}
												alt=""
												className="w-full h-full object-cover"
											/>
										</div>

										{/* Info */}
										<div className="flex-1 space-y-2">
											<div className="flex items-center gap-2">
												<span className="font-mono font-bold">
													{order.id}
												</span>
												<Badge
													className={status.className}
												>
													<StatusIcon className="h-3 w-3 mr-1" />
													{status.label}
												</Badge>
											</div>
											<h3 className="font-semibold">
												{order.account?.title ||
													"Unknown Account"}
											</h3>
											<div className="text-sm text-muted-foreground">
												User ID: {order.user_id} •{" "}
												{formatDateTime(
													order.created_at
												)}
											</div>
										</div>

										{/* Price */}
										<div className="text-right font-bold text-primary text-xl">
											{formatCurrency(order.total_price)}
										</div>

										{/* Actions */}
										<div className="flex gap-2 justify-end min-w-[180px]">
											{order.status === "pending" && (
												<Button
													onClick={() =>
														handleUpdateStatus(
															order.id,
															"paid"
														)
													}
													className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
												>
													<Check className="h-4 w-4" />{" "}
													Xác nhận tiền
												</Button>
											)}

											{order.status === "paid" && (
												<Button
													onClick={() =>
														handleUpdateStatus(
															order.id,
															"delivered"
														)
													}
													className="btn-gaming gap-2"
												>
													<Mail className="h-4 w-4" />{" "}
													Gửi Acc
												</Button>
											)}

											{order.status === "delivered" && (
												<div className="flex items-center gap-2 text-success bg-success/10 px-3 py-2 rounded-lg border border-success/20">
													<CheckCircle className="h-5 w-5" />
													<span className="font-medium">
														Hoàn thành
													</span>
												</div>
											)}

											{order.status === "cancelled" && (
												<span className="text-muted-foreground italic px-3 py-2">
													Đã hủy bỏ
												</span>
											)}
										</div>
									</div>
								</motion.div>
							);
						})}
					</div>

					<PaginationWrapper
						currentPage={currentPage}
						totalPages={totalPages}
						onPageChange={setCurrentPage}
						totalItems={0}
					/>
				</>
			) : (
				<div className="text-center py-20">Chưa có đơn hàng nào</div>
			)}
		</div>
	);
}
