import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { useTranslation } from "@/stores/languageStore";
import { useAuthStore } from "@/stores/authStore";
import { useWalletStore } from "@/stores/walletStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Wallet,
	Building2,
	CreditCard,
	QrCode,
	Clock,
	AlertCircle,
	Loader2,
} from "lucide-react";
import { formatCurrency } from "@/utils/format";
import { useNavigate } from "react-router-dom";
import { OrderStatus } from "@/constants/enums";
import { useToast } from "@/hooks/use-toast";
import { orderService } from "@/services/orderService";

const PRESET_AMOUNTS = [10000, 20000, 50000, 100000, 200000, 500000];
const QR_EXPIRY_SECONDS = 300;

export default function DepositPage() {
	const { t } = useTranslation();
	const { isAuthenticated } = useAuthStore();
	const {
		balance,
		fetchBalance,
		isLoading: isBalanceLoading,
	} = useWalletStore();
	const navigate = useNavigate();

	const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
	const [showQRModal, setShowQRModal] = useState(false);
	const [amount, setAmount] = useState<number>(10000);
	const [customAmount, setCustomAmount] = useState<string>("");
	const [timeLeft, setTimeLeft] = useState(QR_EXPIRY_SECONDS);
	const [qrExpired, setQrExpired] = useState(false);

	const [transactionCode, setTransactionCode] = useState("");
	const [isCreatingOrder, setIsCreatingOrder] = useState(false);

	const { toast } = useToast();

	useEffect(() => {
		if (isAuthenticated) {
			fetchBalance();
		} else {
			navigate("/auth");
		}
	}, [isAuthenticated, navigate, fetchBalance]);

	useEffect(() => {
		if (!showQRModal) return;
		const interval = setInterval(() => {
			fetchBalance();
		}, 5000);
		return () => clearInterval(interval);
	}, [showQRModal, fetchBalance]);

	useEffect(() => {
		let timer: ReturnType<typeof setInterval>;
		if (showQRModal && timeLeft > 0 && !qrExpired) {
			timer = setInterval(() => {
				setTimeLeft((prev) => {
					if (prev <= 1) {
						setQrExpired(true);
						return 0;
					}
					return prev - 1;
				});
			}, 1000);
		}
		return () => clearInterval(timer);
	}, [showQRModal, timeLeft, qrExpired]);
	useEffect(() => {
		let intervalId: ReturnType<typeof setInterval>;

		if (showQRModal && transactionCode) {
			const checkOrderStatus = async () => {
				try {
					// Gọi API lấy chi tiết đơn hàng hiện tại
					const res =
						await orderService.getOrderDetail(transactionCode);
					const order = res.data;

					// Nếu trạng thái đã là Paid hoặc Completed
					if (
						order &&
						(order.status === OrderStatus.Paid ||
							order.status === OrderStatus.Completed)
					) {
						// 1. Thông báo thành công
						toast({
							title: t("success"),
							description:
								t("depositSuccessDesc") ||
								"Nạp tiền thành công!",
							className: "bg-green-500 text-white border-none",
						});

						// 2. Đóng Modal
						setShowQRModal(false);

						// 3. Cập nhật lại số dư mới nhất ngay lập tức
						fetchBalance();

						// 4. Reset form (nếu cần)
						setTransactionCode("");
					}
				} catch (error) {
					// Lỗi polling thì bỏ qua, đợi lần sau check tiếp
					console.log("Polling error", error);
				}
			};

			// Chạy ngay lần đầu
			checkOrderStatus();

			// Set interval chạy mỗi 3 giây (hoặc 2 giây)
			intervalId = setInterval(checkOrderStatus, 3000);
		}

		// Cleanup khi component unmount hoặc đóng modal
		return () => {
			if (intervalId) clearInterval(intervalId);
		};
	}, [showQRModal, transactionCode, toast, t, fetchBalance]);

	const formatTime = (seconds: number) => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins}:${secs.toString().padStart(2, "0")}`;
	};

	const handleMethodSelect = (method: string) => {
		setSelectedMethod(method);
	};

	const handleAmountSelect = (value: number) => {
		setAmount(value);
		setCustomAmount("");
	};

	const handleCustomAmountChange = (
		e: React.ChangeEvent<HTMLInputElement>,
	) => {
		const value = e.target.value.replace(/\D/g, "");
		setCustomAmount(value);
		if (value) {
			setAmount(parseInt(value, 10));
		}
	};

	const handleGenerateQR = async () => {
		if (import.meta.env.VITE_UNDER_MAINTENANCE === "true") {
			toast({
				title: "Hệ thống bảo trì",
				description:
					"Vui lòng liên hệ qua zalo/telegram để mua acc game",
				variant: "destructive",
			});
			return;
		}
		if (amount < 10000) return;

		setIsCreatingOrder(true);
		try {
			const res = await orderService.createDeposit(amount);

			if (res.data && res.data.id) {
				const orderId = res.data.id;
				setTransactionCode(`${orderId}`);

				setTimeLeft(QR_EXPIRY_SECONDS);
				setQrExpired(false);
				setShowQRModal(true);
			}
		} catch (error) {
			console.error("Lỗi tạo đơn nạp:", error);
			toast({
				title: t("error"),
				description: t("createOrderFailed"),
				variant: "destructive",
			});
		} finally {
			setIsCreatingOrder(false);
		}
	};

	const handleCloseQR = () => {
		setShowQRModal(false);
		setSelectedMethod(null);
		fetchBalance();
	};

	const paymentMethods = [
		{
			id: "bank_transfer",
			name: t("bankTransfer"),
			icon: Building2,
			description: t("depositBankTransferDesc"),
		},
		{
			id: "momo",
			name: "MoMo",
			icon: Wallet,
			description: t("depositMomoDesc"),
			disabled: true,
		},
		{
			id: "card",
			name: t("phoneScratchCard"),
			icon: CreditCard,
			description: t("phoneScratchCardDesc"),
			disabled: true,
		},
	];

	const generateQRUrl = () => {
		const bankId = "MB";
		const accountNo = "0368142412";
		const accountName = "LE VAN DAT";
		const template = "compact2";

		const content = `${transactionCode}`;

		return `https://img.vietqr.io/image/${bankId}-${accountNo}-${template}.png?amount=${amount}&addInfo=${encodeURIComponent(content)}&accountName=${encodeURIComponent(accountName)}`;
	};

	if (!isAuthenticated) return null;

	return (
		<Layout>
			<div className="container mx-auto px-4 py-8">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
				>
					{/* ... (Phần UI chọn phương thức và nhập tiền giữ nguyên) ... */}
					<div className="text-center mb-8">
						<h1 className="text-3xl font-bold font-gaming text-gradient mb-2">
							{t("deposit")}
						</h1>
						<p className="text-muted-foreground">
							{t("depositSubtitle")}
						</p>
					</div>

					<Card className="mb-8 border-2 border-primary/20">
						<CardContent className="py-6">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-3">
									<div className="p-3 rounded-full bg-primary/10">
										<Wallet className="h-6 w-6 text-primary" />
									</div>
									<div>
										<p className="text-sm text-muted-foreground">
											{t("currentBalance")}
										</p>
										<div className="flex items-center gap-2">
											<p className="text-2xl font-bold text-primary">
												{formatCurrency(balance)}
											</p>
											{isBalanceLoading && (
												<Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
											)}
										</div>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>

					<div className="mb-8">
						<h2 className="text-xl font-semibold mb-4">
							{t("selectPaymentMethod")}
						</h2>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							{paymentMethods.map((method) => (
								<Card
									key={method.id}
									className={`cursor-pointer transition-all duration-200 ${
										method.disabled
											? "opacity-50 cursor-not-allowed"
											: selectedMethod === method.id
												? "border-2 border-primary ring-2 ring-primary/20"
												: "hover:border-primary/50"
									}`}
									onClick={() =>
										!method.disabled &&
										handleMethodSelect(method.id)
									}
								>
									<CardContent className="p-6">
										<div className="flex items-center gap-4">
											<div className="p-3 rounded-full bg-primary/10">
												<method.icon className="h-6 w-6 text-primary" />
											</div>
											<div>
												<h3 className="font-semibold">
													{method.name}
												</h3>
												<p className="text-sm text-muted-foreground">
													{method.description}
												</p>
												{method.disabled && (
													<span className="text-xs text-orange-500">
														{t("comingSoon")}
													</span>
												)}
											</div>
										</div>
									</CardContent>
								</Card>
							))}
						</div>
					</div>

					<AnimatePresence>
						{selectedMethod === "bank_transfer" && (
							<motion.div
								initial={{ opacity: 0, height: 0 }}
								animate={{ opacity: 1, height: "auto" }}
								exit={{ opacity: 0, height: 0 }}
								transition={{ duration: 0.3 }}
							>
								<Card className="mb-8">
									<CardHeader>
										<CardTitle className="flex items-center gap-2">
											<Wallet className="h-5 w-5" />
											{t("selectAmount")}
										</CardTitle>
									</CardHeader>
									<CardContent>
										<div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
											{PRESET_AMOUNTS.map((preset) => (
												<Button
													key={preset}
													variant={
														amount === preset &&
														!customAmount
															? "default"
															: "outline"
													}
													className={`h-12 ${amount === preset && !customAmount ? "btn-gaming" : ""}`}
													onClick={() =>
														handleAmountSelect(
															preset,
														)
													}
												>
													{formatCurrency(preset)}
												</Button>
											))}
										</div>

										<div className="space-y-2">
											<Label htmlFor="customAmount">
												{t("orEnterAmount")}
											</Label>
											<div className="relative">
												<Input
													id="customAmount"
													type="text"
													placeholder={t("minAmount")}
													value={customAmount}
													onChange={
														handleCustomAmountChange
													}
													className="pr-12"
												/>
												<span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
													VNĐ
												</span>
											</div>
											{amount < 10000 && customAmount && (
												<p className="text-sm text-destructive flex items-center gap-1">
													<AlertCircle className="h-4 w-4" />
													{t("minAmountError")}
												</p>
											)}
										</div>

										<div className="mt-6 p-4 bg-secondary/50 rounded-lg">
											<div className="flex justify-between items-center">
												<span className="text-muted-foreground">
													{t("depositAmount")}:
												</span>
												<span className="text-xl font-bold text-primary">
													{formatCurrency(amount)}
												</span>
											</div>
										</div>

										<Button
											className="w-full mt-6 btn-gaming"
											onClick={handleGenerateQR}
											disabled={
												amount < 10000 ||
												isCreatingOrder
											}
										>
											{isCreatingOrder ? (
												<Loader2 className="h-4 w-4 animate-spin mr-2" />
											) : (
												<QrCode className="h-4 w-4 mr-2" />
											)}
											{t("generateQR")}
										</Button>
									</CardContent>
								</Card>
							</motion.div>
						)}
					</AnimatePresence>
				</motion.div>
			</div>

			{/* QR Code Modal */}
			<Dialog open={showQRModal} onOpenChange={setShowQRModal}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2">
							<QrCode className="h-5 w-5" />
							{t("scanQRToPay")}
						</DialogTitle>

						{/* 2. THÊM COMPONENT DESCRIPTION VÀO ĐÂY */}
						<DialogDescription>
							{t("qrExpiredDesc")
								? t("qrExpiredDesc").replace(
										"hết hạn",
										"bên dưới",
									)
								: "Vui lòng quét mã QR bên dưới để thanh toán."}
						</DialogDescription>
					</DialogHeader>

					<div className="flex flex-col items-center space-y-4">
						{!qrExpired ? (
							<>
								<div
									className={`flex items-center gap-2 px-4 py-2 rounded-full ${
										timeLeft <= 60
											? "bg-destructive/10 text-destructive"
											: "bg-primary/10 text-primary"
									}`}
								>
									<Clock className="h-4 w-4" />
									<span className="font-mono font-bold">
										{formatTime(timeLeft)}
									</span>
								</div>

								<div className="p-4 bg-white rounded-xl border">
									<img
										key={transactionCode}
										src={generateQRUrl()}
										alt="Payment QR Code"
										className="w-64 h-64 object-contain"
									/>
								</div>

								<div className="w-full space-y-2 text-sm">
									<div className="flex justify-between p-2 bg-secondary/50 rounded">
										<span className="text-muted-foreground">
											{t("amount")}:
										</span>
										<span className="font-semibold">
											{formatCurrency(amount)}
										</span>
									</div>
									<div className="flex justify-between p-2 bg-secondary/50 rounded">
										<span className="text-muted-foreground">
											{t("transactionCode")}:
										</span>
										<span className="font-mono font-bold text-lg text-primary">
											{transactionCode}
										</span>
									</div>
									<p className="text-xs text-center text-muted-foreground italic">
										Lưu ý: Chuyển khoản đúng nội dung để
										được cộng tiền tự động
									</p>
								</div>
							</>
						) : (
							<div className="flex flex-col items-center py-8 space-y-4">
								<div className="p-4 rounded-full bg-destructive/10">
									<AlertCircle className="h-12 w-12 text-destructive" />
								</div>
								<h3 className="text-lg font-semibold">
									{t("qrExpired")}
								</h3>
								<p className="text-sm text-muted-foreground text-center">
									{t("qrExpiredDesc")}
								</p>
								<Button
									onClick={handleGenerateQR}
									className="btn-gaming"
								>
									{t("generateNewQR")}
								</Button>
							</div>
						)}
					</div>

					{!qrExpired && (
						<div className="flex justify-center">
							<Button variant="outline" onClick={handleCloseQR}>
								{t("cancel")}
							</Button>
						</div>
					)}
				</DialogContent>
			</Dialog>
		</Layout>
	);
}
