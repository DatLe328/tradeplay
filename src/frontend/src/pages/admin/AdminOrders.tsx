import { motion } from "framer-motion";
import {
	Check,
	Mail,
	Clock,
	CheckCircle,
	Truck,
	X,
	Filter,
	Wallet,
	Gamepad2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PaginationWrapper } from "@/components/ui/pagination-wrapper";
import { formatCurrency, formatDateTime } from "@/utils/format";
import { useToast } from "@/hooks/use-toast";
import { orderService } from "@/services/orderService";
import { useEffect, useState } from "react";
import type { Order } from "@/types";
import { OrderStatus, OrderType } from "@/constants/enums";

const statusConfig: Record<number, any> = {
	[OrderStatus.Pending]: {
		label: "Chờ thanh toán",
		icon: Clock,
		className: "badge-pending",
	},
	[OrderStatus.Paid]: {
		label: "Đã thanh toán",
		icon: CheckCircle,
		className: "badge-available",
	},
	[OrderStatus.Completed]: {
		label: "Hoàn thành",
		icon: Truck,
		className: "badge-completed",
	},
	[OrderStatus.Cancelled]: {
		label: "Đã hủy",
		icon: X,
		className: "bg-destructive/10 text-destructive",
	},
	[OrderStatus.Refunded]: {
		label: "Đã hoàn tiền",
		icon: X,
		className: "bg-gray-500/10 text-gray-500",
	},
};

export default function AdminOrders() {
	const [orders, setOrders] = useState<Order[]>([]);
	
	// State cho phân trang & filter
	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [totalItems, setTotalItems] = useState(0); // Tổng số items thực tế
	const [filterType, setFilterType] = useState<OrderType | "all">("all"); // State filter
	const pageSize = 10;

	const { toast } = useToast();

	const loadOrders = async (page: number) => {
		try {
			// Truyền filterType vào service (nếu khác "all")
			const typeParam = filterType === "all" ? undefined : filterType;
			
			const res = await orderService.getAdminOrders(page, pageSize, typeParam);
			setOrders(res.data);
			
			// Cập nhật thông tin phân trang từ API response
			if (res.paging) {
				setTotalItems(Number(res.paging.total));
				setTotalPages(Math.ceil(Number(res.paging.total) / pageSize));
			}
		} catch (error) {
			toast({ title: "Lỗi tải đơn hàng", variant: "destructive" });
		}
	};

	// Reload khi page hoặc filter thay đổi
	useEffect(() => {
		loadOrders(currentPage);
	}, [currentPage, filterType]);

	// Reset về trang 1 khi đổi filter
	const handleFilterChange = (type: OrderType | "all") => {
		setFilterType(type);
		setCurrentPage(1);
	};

	const handleUpdateStatus = async (orderId: string, status: OrderStatus) => {
		try {
			await orderService.updateStatus(orderId, status);
			const statusLabel = statusConfig[status]?.label || "Trạng thái mới";
			toast({ title: `Đã cập nhật: ${statusLabel}` });
			loadOrders(currentPage);
		} catch (error) {
			toast({ title: "Cập nhật thất bại", variant: "destructive" });
		}
	};

	return (
		<div className="p-6 space-y-6">
			{/* Header & Filter */}
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
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

				{/* Bộ lọc loại đơn hàng */}
				<div className="flex items-center gap-2 bg-secondary/50 p-1 rounded-lg border border-border">
					<Button
						variant={filterType === "all" ? "default" : "ghost"}
						size="sm"
						onClick={() => handleFilterChange("all")}
						className="gap-2"
					>
						<Filter className="h-4 w-4" /> Tất cả
					</Button>
					<Button
						variant={filterType === OrderType.BuyAcc ? "default" : "ghost"}
						size="sm"
						onClick={() => handleFilterChange(OrderType.BuyAcc)}
						className="gap-2"
					>
						<Gamepad2 className="h-4 w-4" /> Mua Acc
					</Button>
					<Button
						variant={filterType === OrderType.Deposit ? "default" : "ghost"}
						size="sm"
						onClick={() => handleFilterChange(OrderType.Deposit)}
						className="gap-2"
					>
						<Wallet className="h-4 w-4" /> Nạp tiền
					</Button>
				</div>
			</div>

			{orders.length > 0 ? (
				<>
					<div className="space-y-4">
						{orders.map((order) => {
							const status =
								statusConfig[order.status] ||
								statusConfig[OrderStatus.Pending];
							const StatusIcon = status.icon;

							const isDeposit = order.type === OrderType.Deposit;

							return (
								<motion.div
									key={order.id}
									className="p-6 rounded-xl bg-card border border-border"
								>
									<div className="flex flex-col lg:flex-row lg:items-center gap-4">
										{/* Thumbnail */}
										<div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-secondary flex items-center justify-center">
											{isDeposit ? (
												// Icon ví cho đơn nạp tiền
												<Wallet className="h-8 w-8 text-primary" />
											) : order.account?.thumbnail ? (
												// Ảnh acc cho đơn mua acc
												<img
													src={order.account.thumbnail}
													alt=""
													className="w-full h-full object-cover"
												/>
											) : (
												<Gamepad2 className="h-8 w-8 text-muted-foreground" />
											)}
										</div>

										{/* Info */}
										<div className="flex-1 space-y-2">
											<div className="flex items-center gap-2">
												<span className="font-mono font-bold">
													#{order.id}
												</span>
												<Badge className={status.className}>
													<StatusIcon className="h-3 w-3 mr-1" />
													{status.label}
												</Badge>
												{/* Badge loại đơn hàng */}
												<Badge variant="outline" className="ml-2">
													{isDeposit ? "Nạp tiền" : "Mua Acc"}
												</Badge>
											</div>
											
											{/* Tên Acc hoặc Nội dung nạp tiền */}
											<h3 className="font-semibold text-lg">
												{isDeposit 
													? "Nạp tiền vào tài khoản" 
													: (order.account?.title || "Account không tồn tại")}
											</h3>
											
											<div className="text-sm text-muted-foreground">
												User ID: {order.user_id} •{" "}
												{formatDateTime(order.created_at)}
												{/* Hiển thị thêm ghi chú nếu có */}
												{order.notes && (
													<span className="block mt-1 text-xs italic">
														Note: {order.notes}
													</span>
												)}
											</div>
										</div>

										{/* Price */}
										<div className="text-right font-bold text-primary text-xl min-w-[100px]">
											{formatCurrency(order.total_price)}
										</div>

										{/* Actions */}
										<div className="flex gap-2 justify-end min-w-[180px]">
											{order.status === OrderStatus.Pending && (
												<Button
													onClick={() =>
														handleUpdateStatus(
															order.id,
															OrderStatus.Paid
														)
													}
													className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
												>
													<Check className="h-4 w-4" />{" "}
													Xác nhận tiền
												</Button>
											)}

											{/* Nút gửi acc chỉ hiện khi là đơn Mua Acc và đã thanh toán */}
											{order.status === OrderStatus.Paid && !isDeposit && (
												<Button
													onClick={() =>
														handleUpdateStatus(
															order.id,
															OrderStatus.Completed
														)
													}
													className="btn-gaming gap-2"
												>
													<Mail className="h-4 w-4" />{" "}
													Gửi Acc
												</Button>
											)}
											
											{/* Đơn nạp tiền Paid thì có thể Complete luôn */}
											{order.status === OrderStatus.Paid && isDeposit && (
												<Button
													onClick={() =>
														handleUpdateStatus(
															order.id,
															OrderStatus.Completed
														)
													}
													variant="outline"
													className="gap-2"
												>
													<CheckCircle className="h-4 w-4" />{" "}
													Hoàn tất
												</Button>
											)}

											{order.status === OrderStatus.Completed && (
												<div className="flex items-center gap-2 text-success bg-success/10 px-3 py-2 rounded-lg border border-success/20">
													<CheckCircle className="h-5 w-5" />
													<span className="font-medium">
														Hoàn thành
													</span>
												</div>
											)}

											{order.status === OrderStatus.Cancelled && (
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

					{/* Pagination Wrapper đầy đủ props */}
					<PaginationWrapper
						currentPage={currentPage}
						totalPages={totalPages}
						totalItems={totalItems}
						onPageChange={setCurrentPage}
						pageSize={pageSize}
					/>
				</>
			) : (
				<div className="text-center py-20">
					<div className="p-4 rounded-full bg-secondary w-fit mx-auto mb-4">
						<Filter className="h-12 w-12 text-muted-foreground" />
					</div>
					<p className="text-muted-foreground">
						Không tìm thấy đơn hàng nào
					</p>
				</div>
			)}
		</div>
	);
}