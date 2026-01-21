import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
	ArrowLeft,
	ShoppingCart,
	Check,
	Loader2,
	Info,
	X,
	Sparkles,
	Wallet,
	AlertCircle,
	Clock,
	Banknote,
	CheckCircle2,
	Image as ImageIcon,
	Shield,
	Zap,
} from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { AccountGallery } from "@/components/accounts/AccountGallery";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/utils/format";
import { useOrderStore } from "@/stores/orderStore";
import { useToast } from "@/hooks/use-toast";
import { accountService } from "@/services/accountService";
import type { GameAccount } from "@/types";
import { useTranslation } from "@/stores/languageStore";
import { getGameSchema } from "@/types/gameSchemas";
import { useAuthStore } from "@/stores/authStore";
import { AccountStatus } from "@/constants/enums";
import { useWalletStore } from "@/stores/walletStore";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const formatValue = (value: any) => {
	if (value === true) return "Có";
	if (value === false) return "Không";
	if (Array.isArray(value)) return value.join(", ");
	return value;
};

export default function AccountDetailPage() {
	const { id } = useParams();
	const navigate = useNavigate();
	const { isAuthenticated } = useAuthStore();
	const { createOrder, isLoading: isOrderLoading } = useOrderStore();
	const { t } = useTranslation();
	const { toast } = useToast();
	const { balance, fetchBalance } = useWalletStore();
	const [showBuyModal, setShowBuyModal] = useState(false);
	const [account, setAccount] = useState<GameAccount | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	// Improved AttributeCard với better responsive và overflow handling
	const AttributeCard = ({ label, value }: { label: string; value: any }) => {
		const formattedValue = formatValue(value);
		const isBoolean = typeof value === "boolean";
		const isArray = Array.isArray(value);

		return (
			<div className="group relative p-4 rounded-lg bg-gradient-to-br from-card to-card/50 border border-border/60 hover:border-primary/50 transition-all duration-300 hover:shadow-md hover:shadow-primary/5 hover:-translate-y-0.5">
				<div className="flex flex-col items-center justify-center text-center h-full gap-2">
					<div className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground/80 line-clamp-1">
						{label}
					</div>

					<div
						className={cn(
							"font-bold text-base transition-colors duration-300 w-full",
							isBoolean && value
								? "text-emerald-500"
								: isBoolean && !value
									? "text-orange-500"
									: "text-foreground group-hover:text-primary",
						)}
					>
						{isBoolean ? (
							<div className="inline-flex items-center gap-1.5 bg-secondary/50 px-3 py-1.5 rounded-full">
								{value ? (
									<Check className="h-4 w-4" />
								) : (
									<X className="h-4 w-4" />
								)}
								<span className="text-sm">
									{value ? t("yes") : t("no")}
								</span>
							</div>
						) : isArray ? (
							<div className="flex flex-wrap gap-1.5 justify-center">
								{value.map((item: string, idx: number) => (
									<Badge
										key={idx}
										variant="secondary"
										className="text-xs px-2 py-0.5"
									>
										{item}
									</Badge>
								))}
							</div>
						) : (
							<span className="line-clamp-2 break-words text-sm">
								{formattedValue}
							</span>
						)}
					</div>
				</div>
			</div>
		);
	};

	useEffect(() => {
		const fetchAccount = async () => {
			if (!id) return;
			try {
				setIsLoading(true);
				const res = await accountService.getById(id);
				setAccount(res.data);
			} catch (error) {
				toast({
					title: t("error"),
					description: "Không thể tải thông tin tài khoản",
					variant: "destructive",
				});
			} finally {
				setIsLoading(false);
			}
		};

		fetchAccount();
		if (isAuthenticated) {
			fetchBalance();
		}
	}, [id, isAuthenticated, fetchBalance]);

	if (isLoading) {
		return (
			<Layout>
				<div className="flex flex-col justify-center items-center min-h-[60vh] gap-4">
					<Loader2 className="h-10 w-10 animate-spin text-primary" />
					<p className="text-sm text-muted-foreground">
						Đang tải thông tin...
					</p>
				</div>
			</Layout>
		);
	}

	if (!account) {
		return (
			<Layout>
				<div className="container mx-auto px-4 py-20 text-center space-y-4">
					<AlertCircle className="h-16 w-16 text-muted-foreground mx-auto" />
					<h1 className="font-gaming text-2xl font-bold">
						{t("accountNotFound")}
					</h1>
					<p className="text-muted-foreground">
						Tài khoản không tồn tại hoặc đã bị xóa
					</p>
					<Link to="/accounts">
						<Button variant="outline" className="gap-2">
							<ArrowLeft className="h-4 w-4" />
							{t("backToList")}
						</Button>
					</Link>
				</div>
			</Layout>
		);
	}

	const getStatusDisplay = (status: number) => {
		switch (status) {
			case AccountStatus.Available:
				return {
					label: "Còn hàng",
					className:
						"bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20",
					icon: CheckCircle2,
					canBuy: true,
				};
			case AccountStatus.Reserved:
				return {
					label: "Đã đặt cọc",
					className:
						"bg-orange-500/10 text-orange-600 border-orange-500/20 hover:bg-orange-500/20",
					icon: Clock,
					canBuy: false,
				};
			case AccountStatus.Sold:
				return {
					label: "Đã bán",
					className:
						"bg-blue-600/10 text-blue-600 border-blue-600/20 hover:bg-blue-600/20",
					icon: Banknote,
					canBuy: false,
				};
			default:
				return {
					label: "Ngừng bán",
					className:
						"bg-gray-500/10 text-gray-500 border-gray-500/20 hover:bg-gray-500/20",
					icon: AlertCircle,
					canBuy: false,
				};
		}
	};

	const statusInfo = getStatusDisplay(account.status);
	const StatusIcon = statusInfo.icon;

	const handleBuyClick = () => {
		if (import.meta.env.VITE_UNDER_MAINTENANCE === "true") {
			toast({
				title: "Hệ thống bảo trì",
				description:
					"Vui lòng liên hệ qua zalo/telegram để mua acc game",
				variant: "destructive",
			});
			return;
		}

		if (!isAuthenticated) {
			toast({
				title: t("loginRequired"),
				description: t("loginToBuy"),
				variant: "destructive",
			});
			navigate("/auth");
			return;
		}

		fetchBalance();
		setShowBuyModal(true);
	};

	const handleConfirmPurchase = async () => {
		if (!account) return;

		const order = await createOrder(account.id);
		if (order && order.id) {
			toast({
				title: t("orderCreated"),
				description: `${t("orderCreated")}: ${order.id}`,
			});
			setShowBuyModal(false);
			navigate(`/payment/${order.id}`);
		} else {
			toast({
				title: t("error"),
				description: t("orderFailed"),
				variant: "destructive",
			});
		}
	};

	const gameSchema = getGameSchema(account.game_name || "");
	const getLabel = (key: string) => {
		const field = gameSchema.find((f) => f.key === key);
		return field ? field.label : key;
	};

	const attributesEntries = account.attributes
		? Object.entries(account.attributes).filter(
				([_, v]) =>
					v !== null &&
					v !== "" &&
					(Array.isArray(v) ? v.length > 0 : true),
			)
		: [];

	const isBalanceEnough = balance >= account.price;
	const missingAmount = account.price - balance;

	return (
		<Layout>
			<div className="container mx-auto px-4 py-6 md:py-8 max-w-7xl">
				{/* Back Button */}
				<motion.div
					initial={{ opacity: 0, x: -20 }}
					animate={{ opacity: 1, x: 0 }}
					className="mb-4 md:mb-6"
				>
					<Link to="/accounts">
						<Button
							variant="ghost"
							className="gap-2 pl-0 hover:bg-transparent hover:text-primary transition-colors"
						>
							<ArrowLeft className="h-4 w-4" />
							<span className="hidden sm:inline">
								{t("back")}
							</span>
							<span className="sm:hidden">Quay lại</span>
						</Button>
					</Link>
				</motion.div>

				<div className="grid lg:grid-cols-12 gap-6 lg:gap-8">
					{/* Gallery Column */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.1 }}
						className="lg:col-span-7 xl:col-span-8 space-y-6"
					>
						<AccountGallery
							images={account.images}
							title={account.title}
						/>

						{/* Description Section */}
						<div className="space-y-4">
							<h3 className="font-gaming font-semibold text-lg md:text-xl flex items-center gap-2">
								<Info className="h-5 w-5 text-primary" />
								<span>{t("description")}</span>
							</h3>
							<div className="p-4 md:p-5 rounded-xl bg-secondary/20 border border-border/50 hover:border-border transition-colors">
								<p className="text-muted-foreground leading-relaxed whitespace-pre-line text-sm md:text-base">
									{account.description || "Không có mô tả"}
								</p>
							</div>
						</div>

						{/* Features Section */}
						{account.features && account.features.length > 0 && (
							<div className="space-y-4">
								<h3 className="font-gaming font-semibold text-lg md:text-xl flex items-center gap-2">
									<Sparkles className="h-5 w-5 text-primary" />
									<span>{t("highlights")}</span>
								</h3>
								<ul className="grid sm:grid-cols-2 gap-3">
									{account.features.map((feature, index) => (
										<motion.li
											key={index}
											initial={{ opacity: 0, x: -10 }}
											animate={{ opacity: 1, x: 0 }}
											transition={{ delay: index * 0.05 }}
											className="flex items-start gap-2.5 text-sm md:text-base p-3 md:p-4 rounded-lg bg-secondary/30 border border-border/30 hover:border-primary/30 hover:bg-secondary/40 transition-all"
										>
											<Check className="h-4 w-4 md:h-5 md:w-5 text-emerald-500 mt-0.5 shrink-0" />
											<span className="leading-relaxed">
												{feature}
											</span>
										</motion.li>
									))}
								</ul>
							</div>
						)}
					</motion.div>

					{/* Info Sidebar Column */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.2 }}
						className="lg:col-span-5 xl:col-span-4 space-y-6"
					>
						{/* Header Info */}
						<div className="space-y-4">
							<div className="flex items-center gap-2 flex-wrap">
								<Badge
									variant="outline"
									className="text-muted-foreground font-mono bg-background text-xs md:text-sm"
								>
									#{account.id}
								</Badge>
								<Badge
									variant="secondary"
									className="bg-primary/10 text-primary hover:bg-primary/20 text-xs md:text-sm"
								>
									{account.game_name}
								</Badge>
								<Badge
									variant="outline"
									className={cn(
										"gap-1.5 pl-1.5 pr-2.5 text-xs md:text-sm font-medium",
										statusInfo.className,
									)}
								>
									<StatusIcon className="w-3.5 h-3.5" />
									{statusInfo.label}
								</Badge>
							</div>
							<h1 className="font-gaming text-xl md:text-2xl lg:text-3xl font-bold leading-tight">
								{account.title}
							</h1>
						</div>
						{/* Attributes Grid */}
						{attributesEntries.length > 0 && (
							<div className="space-y-4 pt-2">
								<h3 className="font-gaming font-semibold text-lg md:text-xl flex items-center gap-2">
									<Sparkles className="h-5 w-5 text-primary" />
									<span>{t("accountInfomation")}</span>
								</h3>

								<div className="grid grid-cols-2 gap-3">
									{attributesEntries.map(([key, value]) => (
										<AttributeCard
											key={key}
											label={getLabel(key)}
											value={value}
										/>
									))}
								</div>
							</div>
						)}

						{/* Price & Action Box - Sticky on desktop only */}
						<div className="p-5 md:p-6 rounded-xl bg-gradient-to-br from-card to-card/50 border border-border shadow-lg space-y-5 lg:sticky lg:top-24">
							<div className="space-y-2">
								<p className="text-xs md:text-sm text-muted-foreground font-medium">
									Giá bán
								</p>
								<div className="flex items-baseline gap-3 flex-wrap">
									<span className="font-gaming text-3xl md:text-4xl font-bold text-primary">
										{formatCurrency(account.price)}
									</span>
									{account.original_price &&
										account.original_price >
											account.price && (
											<span className="text-base md:text-lg text-muted-foreground line-through decoration-muted-foreground/50">
												{formatCurrency(
													account.original_price,
												)}
											</span>
										)}
								</div>
								{account.original_price &&
									account.original_price > account.price && (
										<Badge
											variant="destructive"
											className="text-xs"
										>
											Giảm{" "}
											{Math.round(
												((account.original_price -
													account.price) /
													account.original_price) *
													100,
											)}
											%
										</Badge>
									)}
							</div>

							{/* Action Button */}
							{statusInfo.canBuy ? (
								<Button
									onClick={handleBuyClick}
									disabled={isOrderLoading}
									className="btn-gaming w-full text-base md:text-lg h-12 md:h-14 gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all"
								>
									{isOrderLoading ? (
										<>
											<Loader2 className="h-5 w-5 animate-spin" />
											<span>{t("processing")}</span>
										</>
									) : (
										<>
											<ShoppingCart className="h-5 w-5" />
											<span>{t("buyNow")}</span>
										</>
									)}
								</Button>
							) : (
								<Button
									disabled
									variant="secondary"
									className="w-full text-base md:text-lg h-12 md:h-14 gap-2 opacity-90 cursor-not-allowed"
								>
									<StatusIcon className="h-5 w-5" />
									{statusInfo.label}
								</Button>
							)}

							{/* Trust Badges */}
							<div className="space-y-2 pt-2 border-t border-border/50">
								<div className="flex items-center gap-2 text-xs text-muted-foreground">
									<Zap className="h-4 w-4 text-green-500 shrink-0" />
									<span>Giao dịch tự động 24/7</span>
								</div>
								<div className="flex items-center gap-2 text-xs text-muted-foreground">
									<Shield className="h-4 w-4 text-blue-500 shrink-0" />
									<span>
										Bảo hành uy tín - Hỗ trợ tận tâm
									</span>
								</div>
								<div className="flex items-center gap-2 text-xs text-muted-foreground">
									<Clock className="h-4 w-4 text-orange-500 shrink-0" />
									<span>
										Muốn đặt cọc? Liên hệ Zalo/Telegram
									</span>
								</div>
							</div>
						</div>
					</motion.div>
				</div>
			</div>

			{/* Buy Confirmation Modal - Improved */}
			<Dialog open={showBuyModal} onOpenChange={setShowBuyModal}>
				<DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle className="text-lg md:text-xl">
							Xác nhận mua tài khoản
						</DialogTitle>
						<DialogDescription className="text-sm">
							Vui lòng kiểm tra kỹ thông tin trước khi thanh toán.
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-4 py-4">
						{/* Account Preview */}
						<div className="flex items-start gap-3 md:gap-4 p-4 rounded-lg bg-secondary/50 border border-border/50 hover:bg-secondary/60 transition-colors">
							<div className="w-16 h-16 md:w-20 md:h-20 rounded-md overflow-hidden bg-background shrink-0 flex items-center justify-center border border-border">
								{account.thumbnail ? (
									<img
										src={account.thumbnail}
										alt={account.title}
										className="w-full h-full object-cover"
										onError={(e) => {
											e.currentTarget.style.display =
												"none";
											e.currentTarget.nextElementSibling?.classList.remove(
												"hidden",
											);
										}}
									/>
								) : null}
								<ImageIcon
									className={cn(
										"w-8 h-8 text-muted-foreground/30",
										account.thumbnail && "hidden",
									)}
								/>
							</div>
							<div className="flex-1 min-w-0">
								<h4 className="font-semibold line-clamp-2 text-sm md:text-base mb-1">
									{account.title}
								</h4>
								<p className="text-xs md:text-sm text-muted-foreground">
									Mã số: #{account.id}
								</p>
								<div className="font-bold text-primary mt-2 text-base md:text-lg">
									{formatCurrency(account.price)}
								</div>
							</div>
						</div>

						{/* Wallet Info */}
						<div className="space-y-3 p-4 rounded-lg bg-muted/30 border border-border/50">
							<div className="flex justify-between items-center text-sm">
								<span className="text-muted-foreground">
									Số dư hiện tại:
								</span>
								<span className="font-semibold">
									{formatCurrency(balance)}
								</span>
							</div>
							<div className="flex justify-between items-center text-sm">
								<span className="text-muted-foreground">
									Giá tài khoản:
								</span>
								<span className="font-semibold text-primary">
									-{formatCurrency(account.price)}
								</span>
							</div>
							<div className="border-t border-border/50 pt-3 flex justify-between items-center">
								<span className="font-medium text-sm md:text-base">
									Số dư sau khi mua:
								</span>
								<span
									className={cn(
										"font-bold text-base md:text-lg",
										isBalanceEnough
											? "text-green-500"
											: "text-red-500",
									)}
								>
									{isBalanceEnough
										? formatCurrency(
												balance - account.price,
											)
										: "Không đủ tiền"}
								</span>
							</div>
						</div>

						{/* Warning if insufficient balance */}
						{!isBalanceEnough && (
							<div className="flex items-start gap-2 p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-200 dark:border-red-900/20">
								<AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
								<span>
									Bạn còn thiếu{" "}
									<b className="font-bold">
										{formatCurrency(missingAmount)}
									</b>
									. Vui lòng nạp thêm tiền để tiếp tục.
								</span>
							</div>
						)}
					</div>

					<DialogFooter className="flex-col sm:flex-row gap-2">
						{isBalanceEnough ? (
							<>
								<Button
									variant="outline"
									onClick={() => setShowBuyModal(false)}
									className="w-full sm:w-auto"
								>
									Hủy bỏ
								</Button>
								<Button
									className="btn-gaming w-full sm:w-auto"
									onClick={handleConfirmPurchase}
									disabled={isOrderLoading}
								>
									{isOrderLoading && (
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									)}
									Xác nhận thanh toán
								</Button>
							</>
						) : (
							<>
								<Button
									variant="outline"
									onClick={() => setShowBuyModal(false)}
									className="w-full sm:w-auto order-2 sm:order-1"
								>
									Đóng
								</Button>
								<Link
									to="/deposit"
									className="w-full sm:w-auto order-1 sm:order-2"
								>
									<Button className="w-full bg-green-600 hover:bg-green-700 text-white gap-2">
										<Wallet className="h-4 w-4" />
										Nạp tiền ngay
									</Button>
								</Link>
							</>
						)}
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</Layout>
	);
}
