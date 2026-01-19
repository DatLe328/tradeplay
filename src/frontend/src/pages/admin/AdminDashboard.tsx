import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
	Gamepad2,
	Package,
	ShoppingCart,
	DollarSign,
	TrendingUp,
	Clock,
} from "lucide-react";
import { formatCurrency } from "@/utils/format";
import { adminService } from "@/services/adminService";
import { orderService } from "@/services/orderService";
import { useToast } from "@/hooks/use-toast";
import type { AdminStats, Order } from "@/types";
import { OrderStatus, OrderStatusLabel } from "@/constants/enums"; // 1. IMPORT ENUM

export default function AdminDashboard() {
	const [stats, setStats] = useState<AdminStats>({
		totalAccounts: 0,
		availableAccounts: 0,
		soldAccounts: 0,
		pendingOrders: 0,
		totalRevenue: 0,
	});
	const [recentOrders, setRecentOrders] = useState<Order[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const { toast } = useToast();

	useEffect(() => {
		const fetchData = async () => {
			try {
				setIsLoading(true);
				const [statsRes, ordersRes] = await Promise.all([
					adminService.getStats(),
					orderService.getAdminOrders(1, 5),
				]);

				setStats(statsRes.data);
				setRecentOrders(ordersRes.data);
			} catch (error) {
				console.error("Dashboard error:", error);
				toast({
					title: "Lỗi",
					description: "Không thể tải dữ liệu dashboard",
					variant: "destructive",
				});
			} finally {
				setIsLoading(false);
			}
		};

		fetchData();
	}, []);

	const statCards = [
		{
			title: "Tổng Acc",
			value: stats.totalAccounts,
			icon: Gamepad2,
			color: "text-primary",
			bgColor: "bg-primary/10",
		},
		{
			title: "Còn Hàng",
			value: stats.availableAccounts,
			icon: Package,
			color: "text-green-500",
			bgColor: "bg-green-500/10",
		},
		{
			title: "Đã Bán",
			value: stats.soldAccounts,
			icon: TrendingUp,
			color: "text-yellow-500", 
			bgColor: "bg-yellow-500/10",
		},
		{
			title: "Chờ Xử Lý",
			value: stats.pendingOrders,
			icon: Clock,
			color: "text-red-500",
			bgColor: "bg-red-500/10",
		},
	];

    const getStatusColorClass = (status: number) => {
        switch (status) {
            case OrderStatus.Pending:
                return "bg-yellow-100 text-yellow-800 border-yellow-200";
            case OrderStatus.Paid:
                return "bg-green-100 text-green-800 border-green-200";
            case OrderStatus.Completed:
            case OrderStatus.Refunded:
            case OrderStatus.Cancelled:
                return "bg-gray-100 text-gray-800 border-gray-200";
            default:
                return "bg-secondary text-secondary-foreground";
        }
    };

	if (isLoading) {
		return <div className="p-6">Đang tải dữ liệu...</div>;
	}

	return (
		<div className="p-6 space-y-8">
			{/* Header */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
			>
				<h1 className="font-gaming text-3xl font-bold mb-2">
					Dashboard
				</h1>
				<p className="text-muted-foreground">
					Tổng quan về shop của bạn
				</p>
			</motion.div>

			{/* Stats Grid */}
			<div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
				{statCards.map((stat, index) => (
					<motion.div
						key={stat.title}
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: index * 0.1 }}
						className="p-6 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors"
					>
						<div className="flex items-center justify-between mb-4">
							<div className={`p-3 rounded-lg ${stat.bgColor}`}>
								<stat.icon
									className={`h-6 w-6 ${stat.color}`}
								/>
							</div>
						</div>
						<div className="font-gaming text-3xl font-bold mb-1">
							{stat.value}
						</div>
						<div className="text-sm text-muted-foreground">
							{stat.title}
						</div>
					</motion.div>
				))}
			</div>

			{/* Revenue Card */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.4 }}
				className="p-6 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20"
			>
				<div className="flex items-center gap-4">
					<div className="p-4 rounded-xl bg-primary/20">
						<DollarSign className="h-8 w-8 text-primary" />
					</div>
					<div>
						<div className="text-sm text-muted-foreground mb-1">
							Tổng Doanh Thu
						</div>
						<div className="font-gaming text-3xl font-bold text-primary">
							{formatCurrency(stats.totalRevenue)}
						</div>
					</div>
				</div>
			</motion.div>

			{/* Recent Orders Preview */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.5 }}
				className="space-y-4"
			>
				<h2 className="font-gaming text-xl font-semibold">
					Đơn Hàng Gần Đây
				</h2>
				{recentOrders.length > 0 ? (
					<div className="rounded-xl border border-border overflow-hidden">
						<table className="w-full">
							<thead className="bg-secondary">
								<tr>
									<th className="px-4 py-3 text-left text-sm font-medium">
										Order ID
									</th>
									<th className="px-4 py-3 text-left text-sm font-medium hidden md:table-cell">
										User ID
									</th>
									<th className="px-4 py-3 text-left text-sm font-medium">
										Acc Game
									</th>
									<th className="px-4 py-3 text-left text-sm font-medium">
										Giá
									</th>
									<th className="px-4 py-3 text-left text-sm font-medium">
										Trạng thái
									</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-border">
								{recentOrders.map((order) => (
									<tr
										key={order.id}
										className="bg-card hover:bg-secondary/50 transition-colors"
									>
										<td className="px-4 py-3 font-mono text-sm">
											{order.id}
										</td>
										<td className="px-4 py-3 text-sm hidden md:table-cell">
											{order.user_id}
										</td>
										<td className="px-4 py-3 text-sm">
											{order.account?.title || "Unknown"}
										</td>
										<td className="px-4 py-3 text-sm font-bold">
											{formatCurrency(order.total_price)}
										</td>
										<td className="px-4 py-3">
                                            {/* 2. SỬA LOGIC HIỂN THỊ TRẠNG THÁI */}
											<span
												className={`inline-flex px-2 py-1 rounded text-xs font-medium border ${getStatusColorClass(order.status)}`}
											>
                                                {/* Hiển thị label từ Enum thay vì hardcode */}
												{OrderStatusLabel[order.status] || "Unknown"}
											</span>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				) : (
					<div className="p-8 rounded-xl bg-card border border-border text-center">
						<ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
						<p className="text-muted-foreground">
							Chưa có đơn hàng nào
						</p>
					</div>
				)}
			</motion.div>
		</div>
	);
}