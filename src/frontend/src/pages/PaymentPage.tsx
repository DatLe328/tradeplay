import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Copy, Clock, AlertCircle } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { useOrderStore } from "@/stores/orderStore";
import { formatCurrency } from "@/utils/format";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import { genVietQR } from "@/utils/qr";

export default function PaymentPage() {
	const { orderId } = useParams();
	const { fetchOrderDetail, currentOrder, isLoading } = useOrderStore();
	const { toast } = useToast();
	useEffect(() => {
		if (orderId) {
			fetchOrderDetail(orderId);
		}
	}, [orderId]);

	const order = currentOrder;
	if (isLoading)
		return (
			<Layout>
				<div>Loading...</div>
			</Layout>
		);
	if (!order) {
		return (
			<Layout>
				<div className="container mx-auto px-4 py-20 text-center">
					<h1 className="font-gaming text-2xl font-bold mb-4">
						Không tìm thấy đơn hàng
					</h1>
					<Link to="/orders">
						<Button variant="outline">Xem đơn hàng của tôi</Button>
					</Link>
				</div>
			</Layout>
		);
	}

	const copyToClipboard = (text: string) => {
		navigator.clipboard.writeText(text);
		toast({
			title: "Đã sao chép",
			description: text,
		});
	};

	const transferContent = `${order.id}`;

	const qrImg = genVietQR({
		bankCode: "BIDV",
		accountNo: "0368142412",
		amount: order.total_price,
		orderId: transferContent,
		accountName: "LE VAN DAT",
	});
	return (
		<Layout>
			<div className="container mx-auto px-4 py-8 max-w-2xl">
				{/* Back Button */}
				<motion.div
					initial={{ opacity: 0, x: -20 }}
					animate={{ opacity: 1, x: 0 }}
					className="mb-6"
				>
					<Link to="/orders">
						<Button variant="ghost" className="gap-2">
							<ArrowLeft className="h-4 w-4" />
							Đơn hàng của tôi
						</Button>
					</Link>
				</motion.div>

				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					className="space-y-6"
				>
					{/* Header */}
					<div className="text-center space-y-2">
						<div className="p-4 rounded-full bg-warning/10 w-fit mx-auto">
							<Clock className="h-10 w-10 text-warning" />
						</div>
						<h1 className="font-gaming text-2xl font-bold">
							Chờ Thanh Toán
						</h1>
						<p className="text-muted-foreground">
							Vui lòng chuyển khoản theo thông tin bên dưới
						</p>
					</div>

					{/* Order Info */}
					<div className="p-6 rounded-xl bg-card border border-border space-y-4">
						<div className="flex justify-between items-center">
							<span className="text-muted-foreground">
								Order ID
							</span>
							<div className="flex items-center gap-2">
								<span className="font-mono font-semibold">
									{order.id}
								</span>
								<Button
									variant="ghost"
									size="icon"
									className="h-8 w-8"
									onClick={() => copyToClipboard(order.id)}
								>
									<Copy className="h-4 w-4" />
								</Button>
							</div>
						</div>
						<div className="flex justify-between items-center">
							<span className="text-muted-foreground">
								Acc Game
							</span>
							<span className="font-semibold">
								{order.account?.title}
							</span>
						</div>
						<div className="flex justify-between items-center">
							<span className="text-muted-foreground">
								Tổng tiền
							</span>
							<span className="font-gaming text-xl font-bold text-primary">
								{formatCurrency(order.total_price)}
							</span>
						</div>
					</div>

					{/* QR Code */}
					<div className="p-6 rounded-xl bg-card border border-border space-y-4">
						<h3 className="font-gaming font-semibold text-center">
							Quét mã QR thanh toán
						</h3>
						<div className="aspect-square max-w-[260px] mx-auto bg-white p-3 rounded-xl border">
							<img
								src={qrImg}
								alt="VietQR Thanh Toán"
								className="w-full h-full object-contain"
							/>
						</div>
						<p className="text-sm text-muted-foreground text-center">
							Hoặc chuyển khoản theo thông tin bên dưới
						</p>
					</div>

					{/* Transfer Info */}
					<div className="p-6 rounded-xl bg-card border border-border space-y-4">
						<h3 className="font-gaming font-semibold">
							Thông tin chuyển khoản
						</h3>

						<div className="space-y-3">
							<div className="flex justify-between items-center p-3 rounded-lg bg-secondary">
								<span className="text-muted-foreground">
									Ngân hàng
								</span>
								<div className="flex items-center gap-2">
									<span className="font-mono font-semibold">
										BIDV
									</span>
								</div>
							</div>
							<div className="flex justify-between items-center p-3 rounded-lg bg-secondary">
								<span className="text-muted-foreground">
									Số tài khoản
								</span>
								<div className="flex items-center gap-2">
									<span className="font-mono font-semibold">
										0368 142 412
									</span>
									<Button
										variant="ghost"
										size="icon"
										className="h-8 w-8"
										onClick={() =>
											copyToClipboard("0368142412")
										}
									>
										<Copy className="h-4 w-4" />
									</Button>
								</div>
							</div>

							<div className="flex justify-between items-center p-3 rounded-lg bg-secondary">
								<span className="text-muted-foreground">
									Tên tài khoản
								</span>
								<span className="font-semibold">LE VAN DAT</span>
							</div>

							<div className="flex justify-between items-center p-3 rounded-lg bg-primary/10 border border-primary/30">
								<span className="text-muted-foreground">
									Nội dung chuyển khoản
								</span>
								<div className="flex items-center gap-2">
									<span className="font-mono font-bold text-primary">
										{transferContent}
									</span>
									<Button
										variant="ghost"
										size="icon"
										className="h-8 w-8"
										onClick={() =>
											copyToClipboard(transferContent)
										}
									>
										<Copy className="h-4 w-4" />
									</Button>
								</div>
							</div>
						</div>
					</div>

					{/* Notice */}
					<div className="p-4 rounded-xl bg-warning/10 border border-warning/30 flex gap-3">
						<AlertCircle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
						<div className="space-y-1">
							<p className="font-semibold text-warning">
								Lưu ý quan trọng
							</p>
							<p className="text-sm text-muted-foreground">
								Sau khi chuyển khoản, vui lòng chờ admin xác
								nhận. Thông tin acc game sẽ được gửi qua email
								của bạn trong vòng 5-15 phút.
								Tuy nhiên, khi không trong giờ hành chính, thời gian
								xử lý có thể lâu hơn. Nếu có thắc mắc, vui lòng
								liên hệ qua zalo/telegram.
							</p>
						</div>
					</div>

					{/* Actions */}
					<div className="flex gap-4">
						<Link to="/orders" className="flex-1">
							<Button variant="outline" className="w-full">
								Xem đơn hàng
							</Button>
						</Link>
						<Link to="/accounts" className="flex-1">
							<Button className="btn-gaming w-full">
								Tiếp tục mua sắm
							</Button>
						</Link>
					</div>
				</motion.div>
			</div>
		</Layout>
	);
}
