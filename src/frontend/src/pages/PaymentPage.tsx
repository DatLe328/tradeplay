import { useParams, Link } from "react-router";
import { motion } from "framer-motion";
import {
	ArrowLeft,
	Copy,
	CheckCircle,
	Loader2,
	Package,
	Wallet,
	Calendar,
	ShoppingBag,
	AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOrderStore } from "@/stores/orderStore";
import { formatCurrency, formatDateTime } from "@/utils/format";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import { useTranslation } from "@/stores/languageStore";
import { getGameName, OrderStatus } from "@/constants/enums";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function PaymentPage() {
	const { orderId } = useParams();
	const { fetchOrderDetail, currentOrder, isLoading } = useOrderStore();
	const { toast } = useToast();
	const { t } = useTranslation();

	useEffect(() => {
		if (orderId) {
			fetchOrderDetail(orderId);
		}
	}, [orderId, fetchOrderDetail]);

	const copyToClipboard = (text: string) => {
		navigator.clipboard.writeText(text);
		toast({
			title: t("paymentPage.copied"),
			description: text,
		});
	};

	if (isLoading) {
		return (
			<div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
				<Loader2 className="h-10 w-10 animate-spin text-primary" />
				<p className="text-muted-foreground animate-pulse">
					{t("paymentPage.processing")}
				</p>
			</div>
		);
	}

	if (!currentOrder) {
		return (
			<>
				<div className="container mx-auto px-4 py-20 text-center">
					<div className="p-4 rounded-full bg-secondary w-fit mx-auto mb-4">
						<Package className="h-12 w-12 text-muted-foreground" />
					</div>
					<h1 className="font-gaming text-2xl font-bold mb-4">
						{t("paymentPage.orderNotFound")}
					</h1>
					<Link to="/accounts">
						<Button variant="outline">
							{t("paymentPage.backToList")}
						</Button>
					</Link>
				</div>
			</>
		);
	}

	const isSuccess =
		currentOrder.status === OrderStatus.Paid ||
		currentOrder.status === OrderStatus.Completed;

	const isCancelled =
		currentOrder.status === OrderStatus.Cancelled ||
		currentOrder.status === OrderStatus.Refunded;

	return (
		<>
			<div className="container mx-auto px-4 py-8 max-w-2xl">
				{/* Back Button */}
				<motion.div
					initial={{ opacity: 0, x: -20 }}
					animate={{ opacity: 1, x: 0 }}
					className="mb-6"
				>
					<Link to="/accounts">
						<Button variant="ghost" className="gap-2">
							<ArrowLeft className="h-4 w-4" />
							{t("paymentPage.continueShopping")}
						</Button>
					</Link>
				</motion.div>

				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					className="space-y-6"
				>
					{/* Status Header */}
					<Card
						className={`border-2 ${isSuccess ? "border-green-500/20 bg-green-500/5" : isCancelled ? "border-red-500/20 bg-red-500/5" : "border-yellow-500/20 bg-yellow-500/5"}`}
					>
						<CardContent className="pt-6 pb-6 text-center space-y-4">
							<div
								className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto ${isSuccess ? "bg-green-500/10 text-green-500" : isCancelled ? "bg-red-500/10 text-red-500" : "bg-yellow-500/10 text-yellow-500"}`}
							>
								{isSuccess ? (
									<CheckCircle className="h-10 w-10" />
								) : isCancelled ? (
									<AlertTriangle className="h-10 w-10" />
								) : (
									<Loader2 className="h-10 w-10 animate-spin" />
								)}
							</div>

							<div>
								<h1
									className={`font-gaming text-2xl font-bold mb-2 ${isSuccess ? "text-green-500" : isCancelled ? "text-red-500" : "text-yellow-500"}`}
								>
									{isSuccess
										? t("paymentPage.paymentSuccess")
										: isCancelled
											? t("paymentPage.paymentFailed")
											: t("paymentPage.processing")}
								</h1>
								<p className="text-muted-foreground">
									{isSuccess
										? t("paymentPage.paymentSuccessDesc")
										: isCancelled
											? t("paymentPage.paymentFailedDesc")
											: t("paymentPage.processingDesc")}
								</p>
							</div>
						</CardContent>
					</Card>

					{/* Order Details Receipt */}
					<Card>
						<CardContent className="p-6 space-y-6">
							<h3 className="font-semibold text-lg flex items-center gap-2">
								<ShoppingBag className="h-5 w-5 text-primary" />
								{t("paymentPage.orderDetails")}
							</h3>

							{/* Product Info */}
							<div className="flex gap-4 p-4 rounded-lg bg-secondary/30">
								<div className="w-16 h-16 rounded-md overflow-hidden bg-muted flex-shrink-0">
									{currentOrder.account?.thumbnail ||
									currentOrder.account?.images?.[0] ? (
										<img
											src={
												currentOrder.account
													.thumbnail ||
												currentOrder.account.images[0]
											}
											alt="Thumbnail"
											className="w-full h-full object-cover"
										/>
									) : (
										<div className="w-full h-full flex items-center justify-center">
											<Package className="h-8 w-8 text-muted-foreground" />
										</div>
									)}
								</div>
								<div className="flex-1 min-w-0">
									<h4 className="font-semibold truncate">
										{currentOrder.account?.title ||
											"Account Game"}
									</h4>
									<div className="flex items-center gap-2 mt-1">
										<Badge
											variant="outline"
											className="text-xs"
										>
											{currentOrder.account?.category
												?.name ||
												getGameName(
													currentOrder.account
														?.category_id,
												)}
										</Badge>
										<span className="text-xs text-muted-foreground">
											MS: {currentOrder.account_id}
										</span>
									</div>
								</div>
							</div>

							{/* Transaction Info Grid */}
							<div className="grid gap-4 py-4 border-t border-b border-border">
								<div className="flex justify-between items-center">
									<span className="text-sm text-muted-foreground flex items-center gap-2">
										<Package className="h-4 w-4" /> Mã đơn
										hàng
									</span>
									<div className="flex items-center gap-2">
										<span className="font-mono font-medium">
											{currentOrder.id}
										</span>
										<Button
											variant="ghost"
											size="icon"
											className="h-6 w-6"
											onClick={() =>
												copyToClipboard(
													currentOrder.id.toString(),
												)
											}
										>
											<Copy className="h-3 w-3" />
										</Button>
									</div>
								</div>

								<div className="flex justify-between items-center">
									<span className="text-sm text-muted-foreground flex items-center gap-2">
										<Calendar className="h-4 w-4" /> Thời
										gian
									</span>
									<span className="text-sm">
										{formatDateTime(
											currentOrder.created_at,
										)}
									</span>
								</div>

								<div className="flex justify-between items-center">
									<span className="text-sm text-muted-foreground flex items-center gap-2">
										<Wallet className="h-4 w-4" /> Phương
										thức
									</span>
									<span className="text-sm font-medium">
										Ví tài khoản
									</span>
								</div>
							</div>

							{/* Total */}
							<div className="flex justify-between items-center">
								<span className="font-semibold">
									Tổng thanh toán
								</span>
								<span className="font-gaming text-xl font-bold text-primary">
									{formatCurrency(currentOrder.total_price)}
								</span>
							</div>
						</CardContent>
					</Card>

					{/* Actions */}
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<Link to="/orders">
							<Button variant="outline" className="w-full h-12">
								{t("paymentPage.viewOrders")}
							</Button>
						</Link>

						{isSuccess && (
							<Link to={`/orders`}>
								{" "}
								<Button className="btn-gaming w-full h-12 gap-2">
									<Package className="h-5 w-5" />
									Nhận tài khoản ngay
								</Button>
							</Link>
						)}

						{!isSuccess && (
							<Button variant="secondary" className="w-full h-12">
								Liên hệ hỗ trợ
							</Button>
						)}
					</div>
				</motion.div>
			</div>
		</>
	);
}
