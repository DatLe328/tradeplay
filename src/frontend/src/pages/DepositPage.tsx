import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { useTranslation } from "@/stores/languageStore";
import { useAuthStore } from "@/stores/authStore";
import { useWalletStore } from "@/stores/walletStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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

	const [amount, setAmount] = useState<number>(0);
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
			}, 3000);
		}
		return () => clearInterval(timer);
	}, [showQRModal, timeLeft, qrExpired]);

	useEffect(() => {
		let intervalId: ReturnType<typeof setInterval>;

		if (showQRModal && transactionCode) {
			const checkOrderStatus = async () => {
				try {
					const res =
						await orderService.getOrderDetail(transactionCode);
					const order = res.data;

					if (
						order &&
						(order.status === OrderStatus.Paid ||
							order.status === OrderStatus.Completed)
					) {
						toast({
							title: t("success"),
							description:
								t("depositSuccessDesc") ||
								"Nạp tiền thành công!",
							className: "bg-green-500 text-white border-none",
						});

						setShowQRModal(false);
						fetchBalance();
						setTransactionCode("");
					}
				} catch (error) {
					// console.log("Polling error", error);
				}
			};

			checkOrderStatus();
			intervalId = setInterval(checkOrderStatus, 3000);
		}

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

	const handleCustomAmountChange = (
		e: React.ChangeEvent<HTMLInputElement>,
	) => {
		const rawValue = e.target.value.replace(/\D/g, "");

		if (rawValue) {
			setAmount(parseInt(rawValue, 10));
		} else {
			setAmount(0);
		}

		const formattedValue = rawValue.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

		setCustomAmount(formattedValue);
	};

	const handleGenerateQR = async () => {
		if (import.meta.env.VITE_UNDER_MAINTENANCE === "true") {
			toast({
				title: "Hệ thống bảo trì",
				description:
					"Vui lòng liên hệ qua zalo/instagram để mua acc game",
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
		const bankId = "BIDV";
		const accountNo = "96247C7Y40";
		const content = `DH${transactionCode}`;
		return `https://qr.sepay.vn/img?acc=${accountNo}&bank=${bankId}&amount=${amount}&des=${encodeURIComponent(content)}`;
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
					{/* --- HEADER --- */}
					<div className="text-center mb-8">
						<h1 className="text-3xl font-bold font-gaming text-gradient mb-2">
							{t("deposit")}
						</h1>
						<p className="text-muted-foreground">
							{t("depositSubtitle")}
						</p>
					</div>

					{/* --- BALANCE CARD --- */}
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

					{/* --- PAYMENT METHODS GRID (EXPANDABLE) --- */}
					<div className="mb-8">
						<h2 className="text-xl font-semibold mb-4">
							{t("selectPaymentMethod")}
						</h2>

						{/* Grid Container */}
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							{paymentMethods.map((method) => {
								const isSelected = selectedMethod === method.id;

								return (
									<Card
										key={method.id}
										className={`cursor-pointer transition-all duration-300 ease-in-out ${
											method.disabled
												? "opacity-50 cursor-not-allowed"
												: isSelected
													? "border-2 border-primary ring-2 ring-primary/20 md:col-span-3 bg-card shadow-lg"
													: "hover:border-primary/50"
										}`}
										onClick={() =>
											!method.disabled &&
											handleMethodSelect(method.id)
										}
									>
										<CardContent className="p-6">
											<div className="flex items-center gap-4">
												<div
													className={`p-3 rounded-full transition-colors shrink-0 ${isSelected ? "bg-primary text-primary-foreground" : "bg-primary/10"}`}
												>
													<method.icon
														className={`h-6 w-6 ${isSelected ? "text-white" : "text-primary"}`}
													/>
												</div>
												<div>
													<h3 className="font-semibold text-lg">
														{method.name}
													</h3>
													{!isSelected && (
														<p className="text-sm text-muted-foreground line-clamp-1">
															{method.description}
														</p>
													)}
													{method.disabled && (
														<span className="text-xs text-orange-500 font-bold bg-orange-100 px-2 py-0.5 rounded-full mt-1 inline-block">
															{t("comingSoon")}
														</span>
													)}
												</div>
											</div>

											<AnimatePresence>
												{isSelected && (
													<motion.div
														initial={{
															opacity: 0,
															height: 0,
														}}
														animate={{
															opacity: 1,
															height: "auto",
														}}
														exit={{
															opacity: 0,
															height: 0,
														}}
														transition={{
															duration: 0.3,
														}}
														className="overflow-hidden"
														onClick={(e) =>
															e.stopPropagation()
														}
													>
														<div className="pt-6 mt-4 border-t border-border px-1">
															<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
																<div className="space-y-4">
																	<Label
																		htmlFor="customAmount"
																		className="text-base font-medium"
																	>
																		{t(
																			"enterAmount",
																		)}
																	</Label>
																	<div className="relative">
																		<Input
																			id="customAmount"
																			type="text"
																			placeholder="Ví dụ: 50.000"
																			value={
																				customAmount
																			}
																			onChange={
																				handleCustomAmountChange
																			}
																			className="pr-12 text-lg h-12 border-primary/30 focus-visible:ring-primary"
																			autoFocus
																			autoComplete="off"
																		/>
																		<span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">
																			VNĐ
																		</span>
																	</div>

																	{amount >
																		0 &&
																		amount <
																			10000 && (
																			<p className="text-sm text-destructive flex items-center gap-1 animate-pulse">
																				<AlertCircle className="h-4 w-4" />
																				{t(
																					"minAmountError",
																				) ||
																					"Số tiền nạp tối thiểu là 10.000đ"}
																			</p>
																		)}

																	<p className="text-xs text-muted-foreground italic">
																		* Nội
																		dung
																		chuyển
																		khoản sẽ
																		được tạo
																		tự động
																		ở bước
																		tiếp
																		theo.
																	</p>
																</div>

																<div className="flex flex-col justify-end space-y-4">
																	<div className="p-4 bg-secondary/50 rounded-lg border border-secondary flex justify-between items-center">
																		<span className="text-muted-foreground font-medium">
																			{t(
																				"depositAmount",
																			)}
																			:
																		</span>
																		<span className="text-2xl font-bold text-primary">
																			{customAmount ||
																				"0"}{" "}
																			đ
																		</span>
																	</div>

																	<Button
																		className="w-full btn-gaming h-12 text-lg shadow-md"
																		onClick={
																			handleGenerateQR
																		}
																		disabled={
																			amount <
																				10000 ||
																			isCreatingOrder
																		}
																	>
																		{isCreatingOrder ? (
																			<Loader2 className="h-5 w-5 animate-spin mr-2" />
																		) : (
																			<QrCode className="h-5 w-5 mr-2" />
																		)}
																		{t(
																			"generateQR",
																		)}
																	</Button>
																</div>
															</div>
														</div>
													</motion.div>
												)}
											</AnimatePresence>
										</CardContent>
									</Card>
								);
							})}
						</div>
					</div>
				</motion.div>
			</div>

			<Dialog open={showQRModal} onOpenChange={setShowQRModal}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2">
							<QrCode className="h-5 w-5" />
							{t("scanQRToPay")}
						</DialogTitle>
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

								<div className="p-4 bg-white rounded-xl border shadow-sm">
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
										<span className="font-mono font-bold text-lg text-primary select-all">
											{transactionCode}
										</span>
									</div>
									<p className="text-xs text-center text-muted-foreground italic mt-2">
										Lưu ý: Không được chỉnh sửa nội dung
										chuyển khoản để được cộng tiền tự động.
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
