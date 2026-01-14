import { useParams, Link } from "react-router-dom";
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

import { getGameSchema } from "@/types/gameSchemas";

const formatValue = (value: any) => {
	if (value === true) return "Có";
	if (value === false) return "Không";
	if (Array.isArray(value)) return value.join(", ");
	return value;
};

const AttributeCard = ({ label, value }: { label: string; value: any }) => {
	const formattedValue = formatValue(value);
	const isBoolean = typeof value === "boolean";
	const isArray = Array.isArray(value);

	return (
		<div className="group relative p-2.5 rounded-xl bg-gradient-to-br from-card to-card/50 border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
			<div className="absolute top-0 right-0 w-6 h-6 bg-primary/5 rounded-bl-xl transition-all duration-300 group-hover:bg-primary/10" />

			<div className="flex flex-col items-center justify-center text-center min-h-[45px] gap-1">
				<div className="text-[10px] uppercase tracking-wider font-medium text-muted-foreground">
					{label}
				</div>

				<div
					className={`font-bold text-sm transition-colors duration-300 ${
						isBoolean
							? value
								? "text-green-500"
								: "text-orange-500"
							: "text-foreground group-hover:text-primary"
					}`}
				>
					{isBoolean ? (
						<div className="flex items-center gap-1">
							{value ? (
								<>
									<Check className="h-3.5 w-3.5" />
									<span>Có</span>
								</>
							) : (
								<>
									<X className="h-3.5 w-3.5" />
									<span>Không</span>
								</>
							)}
						</div>
					) : isArray ? (
						<div className="flex flex-wrap gap-1 justify-center">
							{value.map((item: string, idx: number) => (
								<Badge
									key={idx}
									variant="secondary"
									className="text-[10px] px-1.5 h-5"
								>
									{item}
								</Badge>
							))}
						</div>
					) : (
						<span className="line-clamp-2">{formattedValue}</span>
					)}
				</div>
			</div>
		</div>
	);
};

export default function AccountDetailPage() {
	const { id } = useParams();
	// const navigate = useNavigate();
	// const { isAuthenticated } = useAuthStore();
	// const { createOrder, isLoading: isOrderLoading } = useOrderStore();

	const { isLoading: isOrderLoading } = useOrderStore();
	const { toast } = useToast();

	const [account, setAccount] = useState<GameAccount | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const fetchAccount = async () => {
			if (!id) return;
			try {
				setIsLoading(true);
				const res = await accountService.getById(id);
				setAccount(res.data);
			} catch (error) {
				toast({
					title: "Lỗi",
					description: "Không thể tải thông tin tài khoản",
					variant: "destructive",
				});
			} finally {
				setIsLoading(false);
			}
		};

		fetchAccount();
	}, [id]);

	if (isLoading) {
		return (
			<Layout>
				<div className="flex justify-center items-center min-h-[60vh]">
					<Loader2 className="h-8 w-8 animate-spin text-primary" />
				</div>
			</Layout>
		);
	}

	if (!account) {
		return (
			<Layout>
				<div className="container mx-auto px-4 py-20 text-center">
					<h1 className="font-gaming text-2xl font-bold mb-4">
						Không tìm thấy acc game
					</h1>
					<Link to="/accounts">
						<Button variant="outline">Quay lại danh sách</Button>
					</Link>
				</div>
			</Layout>
		);
	}

	const isAvailable = ["available", "reserved"].includes(account.status);

	const handleBuyNow = async () => {
		toast({
			title: "Hệ thống bảo trì",
			description: "Vui lòng liên hệ qua zalo/telegram để mua acc game",
			variant: "destructive",
		});
		// if (!isAuthenticated) {
		// 	toast({
		// 		title: "Yêu cầu đăng nhập",
		// 		description: "Vui lòng đăng nhập để mua acc game",
		// 		variant: "destructive",
		// 	});
		// 	navigate("/auth");
		// 	return;
		// }

		// const order = await createOrder(account.id);
		// if (order && order.id) {
		// 	toast({
		// 		title: "Tạo đơn hàng thành công",
		// 		description: `Mã đơn: ${order.id}`,
		// 	});
		// 	navigate(`/payment/${order.id}`);
		// } else {
		// 	toast({
		// 		title: "Lỗi",
		// 		description: "Không thể tạo đơn hàng, vui lòng thử lại",
		// 		variant: "destructive",
		// 	});
		// }
	};

	const gameSchema = getGameSchema(account.game_name || "");

	const getLabel = (key: string) => {
		const field = gameSchema.find((f) => f.key === key);
		return field ? field.label : key;
	};

	const formatValue = (value: any) => {
		if (value === true) return "Có";
		if (value === false) return "Không";
		if (Array.isArray(value)) return value.join(", ");
		return value;
	};

	const attributesEntries = account.attributes
		? Object.entries(account.attributes).filter(
				([_, v]) =>
					v !== null &&
					v !== "" &&
					(Array.isArray(v) ? v.length > 0 : true)
		  )
		: [];

	return (
		<Layout>
			<div className="container mx-auto px-4 py-8">
				{/* Back Button */}
				<motion.div
					initial={{ opacity: 0, x: -20 }}
					animate={{ opacity: 1, x: 0 }}
					className="mb-6"
				>
					<Link to="/accounts">
						<Button variant="ghost" className="gap-2">
							<ArrowLeft className="h-4 w-4" />
							Quay lại
						</Button>
					</Link>
				</motion.div>

				<div className="grid lg:grid-cols-6 gap-8">
					{/* Gallery */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.1 }}
						className="lg:col-span-4"
					>
						<AccountGallery
							images={account.images}
							title={account.title}
						/>
					</motion.div>

					{/* Info */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.2 }}
						className="lg:col-span-2 space-y-6"
					>
						{/* Header */}
						<div className="space-y-3">
							<div className="flex items-center gap-2 flex-wrap">
								<Badge
									variant="outline"
									className="text-primary font-mono"
								>
									MS: {account.id}
								</Badge>
								<Badge variant="secondary">
									{account.game_name}
								</Badge>
								<Badge
									className={
										isAvailable
											? "badge-available"
											: "badge-sold"
									}
								>
									{isAvailable ? "Còn hàng" : "Đã bán"}
								</Badge>
							</div>
							<h1 className="font-gaming text-2xl md:text-3xl font-bold">
								{account.title}
							</h1>
						</div>

						{/* --- ATTRIBUTES DYNAMIC --- */}
						{attributesEntries.length > 0 && (
							<div className="space-y-4">
								<h3 className="font-gaming font-semibold text-lg flex items-center gap-2">
									<Sparkles className="h-5 w-5 text-primary" />
									Thông số tài khoản
								</h3>

								<div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
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
						{/* ----------------------------------- */}

						{/* Description */}
						<div className="space-y-3">
							<h3 className="font-gaming font-semibold flex items-center gap-2">
								<Info className="h-4 w-4" /> Mô tả
							</h3>
							<p className="text-muted-foreground leading-relaxed whitespace-pre-line">
								{account.description}
							</p>
						</div>

						{/* Features */}
						{account.features && account.features.length > 0 && (
							<div className="space-y-3">
								<h3 className="font-gaming font-semibold">
									Đặc điểm nổi bật
								</h3>
								<ul className="grid grid-cols-2 gap-2">
									{account.features.map((feature, index) => (
										<li
											key={index}
											className="flex items-center gap-2 text-sm"
										>
											<Check className="h-4 w-4 text-success" />
											<span>{feature}</span>
										</li>
									))}
								</ul>
							</div>
						)}

						{/* Price & Action */}
						<div className="p-6 rounded-xl bg-card border border-border space-y-4">
							<div className="flex items-baseline gap-3">
								<span className="font-gaming text-3xl font-bold text-primary">
									{formatCurrency(account.price)}
								</span>
								{account.original_price && (
									<span className="text-lg text-muted-foreground line-through">
										{formatCurrency(account.original_price)}
									</span>
								)}
							</div>

							{isAvailable ? (
								<Button
									onClick={handleBuyNow}
									disabled={isOrderLoading}
									className="btn-gaming w-full text-lg py-6 gap-2"
								>
									<ShoppingCart className="h-5 w-5" />
									{isOrderLoading
										? "Đang xử lý..."
										: "Mua ngay"}
								</Button>
							) : (
								<Button
									disabled
									className="w-full text-lg py-6"
								>
									Đã bán
								</Button>
							)}
						</div>
					</motion.div>
				</div>
			</div>
		</Layout>
	);
}
