import { Link } from "react-router";
import { motion } from "framer-motion";
import { type GameAccount } from "@/types";
import { formatCurrency } from "@/utils/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, ShoppingCart, Image as ImageIcon, Sparkles } from "lucide-react";
import { useTranslation } from "@/stores/languageStore";
import {
	AccountStatus,
	AccountStatusLabelKey,
	getGameName,
} from "@/constants/enums";
import { cn } from "@/lib/utils";

interface AccountCardProps {
	account: GameAccount;
	index?: number;
}

export function AccountCard({ account, index = 0 }: AccountCardProps) {
	const { t } = useTranslation();
	const isAvailable = account.status === AccountStatus.Available;

	const hasDiscount =
		account.original_price && account.original_price > account.price;
	const discountPercent = hasDiscount
		? Math.round(
				((account.original_price! - account.price) /
					account.original_price!) *
					100,
			)
		: 0;
	const labelKey = `account.status.${AccountStatusLabelKey[account.status]}`;

	const getStatusColor = (status: number) => {
		switch (status) {
			case AccountStatus.Available:
				return "bg-green-500/90 hover:bg-green-500";
			case AccountStatus.Reserved:
				return "bg-amber-500/90 hover:bg-amber-500";
			case AccountStatus.Sold:
				return "bg-red-500/90 hover:bg-red-500";
			case AccountStatus.Deleted:
				return "bg-gray-500/90 hover:bg-gray-500";
			default:
				return "bg-primary/90";
		}
	};

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.4, delay: index * 0.1 }}
			className="card-gaming group"
		>
			<div className="relative aspect-video overflow-hidden bg-secondary/50">
				{account.thumbnail ? (
					<>
						<img
							src={account.thumbnail}
							className={cn(
								"w-full h-full object-cover transition-transform duration-500 group-hover:scale-110",
								account.status === AccountStatus.Sold &&
									"grayscale brightness-[0.5]",
							)}
						/>
						{/* {account.status === AccountStatus.Sold && (
							<div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[1px] z-10">
								<span className="text-white/90 font-gaming font-bold text-xl uppercase tracking-widest border-2 border-white/40 px-4 py-1 rotate-[-15deg] shadow-lg">
									{t(labelKey)}
								</span>
							</div>
						)} */}
					</>
				) : (
					<div className="flex h-full w-full items-center justify-center text-muted-foreground/30">
						<ImageIcon className="h-12 w-12" />
					</div>
				)}

				<div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

				<div className="absolute top-3 left-3 flex flex-col gap-2 items-start">
					<Badge
						variant="secondary"
						className="bg-background/80 backdrop-blur-sm shadow-sm"
					>
						{account.category?.name ||
							getGameName(account.category_id)}
					</Badge>

					{hasDiscount && (
						<Badge className="bg-red-600/90 text-white border-none backdrop-blur-sm shadow-sm animate-pulse font-bold">
							<Sparkles className="w-3 h-3 mr-1" /> -
							{discountPercent}%
						</Badge>
					)}
				</div>

				{/* ID Badge (Top Right) */}
				<div className="absolute top-3 right-3">
					<Badge
						variant="secondary"
						className="bg-background/80 backdrop-blur-sm font-mono shadow-sm"
					>
						MS: {account.id}
					</Badge>
				</div>

				<div className="absolute bottom-3 right-3 z-20">
					<Badge
						className={cn(
							// text-xs cho điện thoại (12px), md:text-sm cho máy tính (14px)
							"text-xs md:text-sm font-bold px-3 py-1 uppercase tracking-wider",
							"text-white border-none backdrop-blur-md shadow-lg transition-all",
							getStatusColor(account.status),
						)}
					>
						{t(labelKey)}
					</Badge>
				</div>

				{/* Overlay on hover */}
				<div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
			</div>

			<div className="p-4 space-y-3">
				<h3 className="font-gaming font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">
					{account.title}
				</h3>

				{/* Price Section */}
				<div className="flex items-baseline gap-2">
					<span className="font-gaming text-xl font-bold text-primary">
						{formatCurrency(account.price)}
					</span>
					{hasDiscount && (
						<span className="text-sm text-muted-foreground line-through decoration-destructive/50">
							{formatCurrency(account.original_price!)}
						</span>
					)}
				</div>

				{/* Actions */}
				<div className="flex gap-2 pt-2">
					<Link to={`/accounts/${account.id}`} className="flex-1">
						<Button variant="outline" className="w-full gap-2">
							<Eye className="h-4 w-4" />
							{t("account.details")}
						</Button>
					</Link>
					{isAvailable ? (
						<Link to={`/accounts/${account.id}`}>
							<Button className="btn-gaming gap-2">
								<ShoppingCart className="h-4 w-4" />
							</Button>
						</Link>
					) : (
						<Button
							disabled
							className="gap-2 opacity-50 cursor-not-allowed"
						>
							<ShoppingCart className="h-4 w-4" />
						</Button>
					)}
				</div>
			</div>
		</motion.div>
	);
}
