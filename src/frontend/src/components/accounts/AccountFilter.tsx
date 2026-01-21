import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "@/stores/languageStore";
import { AccountStatus, AccountStatusLabel } from "@/constants/enums";
import { motion, AnimatePresence } from "framer-motion";

interface FilterState {
	search: string;
	game: string;
	priceRange: string;
	status: string;
	sort: string;
}

interface AccountFilterProps {
	onFilterChange: (filters: FilterState) => void;
	initialFilters?: FilterState;
}

export function AccountFilter({
	onFilterChange,
	initialFilters,
}: AccountFilterProps) {
	const { t, language } = useTranslation();
	const [searchParams] = useSearchParams();
	const allGamesValue = language === "vi" ? "Tất cả" : "All Games";
	const priceRanges = [
		{ value: "all", label: t("allPrices") },
		{ value: "0-1000000", label: t("priceUnder1m") },
		{ value: "1000000-5000000", label: t("price1mTo5m") },
		{ value: "5000000-10000000", label: t("price5mTo10m") },
		{ value: "10000000-20000000", label: t("price10mTo20m") },
		{ value: "20000000-999999999", label: t("priceAbove20m") },
	];
	const statusOptions = [
		{ value: "all", label: t("allStatuses") },
		{
			value: AccountStatus.Available.toString(),
			label: AccountStatusLabel[AccountStatus.Available],
		},
		{
			value: AccountStatus.Sold.toString(),
			label: AccountStatusLabel[AccountStatus.Sold],
		},
		{
			value: AccountStatus.Reserved.toString(),
			label: AccountStatusLabel[AccountStatus.Reserved],
		},
	];
	const sortOptions = [
		{ value: "newest", label: language === "vi" ? "Mới nhất" : "Newest" },
		{
			value: "price_asc",
			label:
				language === "vi" ? "Giá: Thấp đến Cao" : "Price: Low to High",
		},
		{
			value: "price_desc",
			label:
				language === "vi" ? "Giá: Cao đến Thấp" : "Price: High to Low",
		},
	];
	const games = [allGamesValue, "Play Together"];

	const [filters, setFilters] = useState<FilterState>(() => {
		const defaultSort = "newest";

		if (initialFilters) {
			return {
				...initialFilters,
				sort: initialFilters.sort || defaultSort, 
				status: initialFilters.status || "all",
				priceRange: initialFilters.priceRange || "all",
				game: initialFilters.game || allGamesValue,
				search: initialFilters.search || "",
			};
		}

		const priceRange = searchParams.get("priceRange") || "all";
		const search = searchParams.get("search") || "";
		const game = searchParams.get("game") || allGamesValue;
		const sort = searchParams.get("sort") || defaultSort;

		return {
			search,
			game,
			priceRange,
			status: "all",
			sort: sort,
		};
	});

	useEffect(() => {
		const sort = searchParams.get("sort");
		if (sort && sort !== filters.sort) {
			const newFilters = { ...filters, sort };
			setFilters(newFilters);
			onFilterChange(newFilters);
		}
		const oldAllGames = language === "vi" ? "All Games" : "Tất cả";
		if (filters.game === oldAllGames) {
			const newFilters = { ...filters, game: allGamesValue };
			setFilters(newFilters);
			onFilterChange(newFilters);
		}
	}, [language]);

	// Sync filter when URL changes
	useEffect(() => {
		const priceRange = searchParams.get("priceRange");
		if (priceRange && priceRange !== filters.priceRange) {
			const newFilters = { ...filters, priceRange };
			setFilters(newFilters);
			onFilterChange(newFilters);
		}
	}, [searchParams]);
	const [showMobileFilters, setShowMobileFilters] = useState(false);

	const updateFilter = (key: keyof FilterState, value: string) => {
		const newFilters = { ...filters, [key]: value };
		setFilters(newFilters);
		onFilterChange(newFilters);
	};

	const clearFilters = () => {
		const defaultFilters = {
			search: "",
			game: allGamesValue,
			priceRange: "all",
			status: "all",
			sort: "newest",
		};
		setFilters(defaultFilters);
		onFilterChange(defaultFilters);
	};

	const hasActiveFilters =
		filters.search ||
		filters.game !== allGamesValue ||
		filters.priceRange !== "all" ||
		filters.sort !== "newest";

	return (
		// Thêm relative và z-index để dropdown nổi lên trên các element khác
		<div className="space-y-4 relative z-40">
			{/* Search and mobile filter toggle */}
			<div className="flex gap-2">
				<div className="relative flex-1">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
					<Input
						placeholder={t("searchPlaceholder")}
						value={filters.search}
						onChange={(e) => updateFilter("search", e.target.value)}
						className="pl-10 input-gaming"
					/>
				</div>
				<Button
					variant="outline"
					className="md:hidden"
					onClick={() => setShowMobileFilters(!showMobileFilters)}
				>
					{showMobileFilters ? <X className="h-4 w-4" /> : <Filter className="h-4 w-4" />}
				</Button>
			</div>

			{/* Desktop Filters */}
			<div className="hidden md:flex flex-wrap gap-3 items-center">
				<Select
					value={filters.game}
					onValueChange={(value) => updateFilter("game", value)}
				>
					<SelectTrigger className="w-[180px]">
						<SelectValue placeholder={t("allGames")} />
					</SelectTrigger>
					<SelectContent>
						{games.map((game) => (
							<SelectItem key={game} value={game}>
								{game}
							</SelectItem>
						))}
					</SelectContent>
				</Select>

				<Select
					value={filters.priceRange}
					onValueChange={(value) => updateFilter("priceRange", value)}
				>
					<SelectTrigger className="w-[180px]">
						<SelectValue placeholder={t("allPrices")} />
					</SelectTrigger>
					<SelectContent>
						{priceRanges.map((range) => (
							<SelectItem key={range.value} value={range.value}>
								{range.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				<Select
					value={filters.status}
					onValueChange={(value) => updateFilter("status", value)}
				>
					<SelectTrigger className="w-[180px]">
						<SelectValue placeholder="Trạng thái" />
					</SelectTrigger>
					<SelectContent>
						{statusOptions.map((option) => (
							<SelectItem key={option.value} value={option.value}>
								{option.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				<Select
					value={filters.sort}
					onValueChange={(value) => updateFilter("sort", value)}
				>
					<SelectTrigger className="w-[180px]">
						<SelectValue placeholder={t("sortBy")} />
					</SelectTrigger>
					<SelectContent>
						{sortOptions.map((option) => (
							<SelectItem key={option.value} value={option.value}>
								{option.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>

				{hasActiveFilters && (
					<Button
						variant="ghost"
						onClick={clearFilters}
						className="gap-2"
					>
						<X className="h-4 w-4" />
						{t("clearFilters")}
					</Button>
				)}
			</div>

			{/* Mobile Filters Dropdown */}
			<AnimatePresence>
				{showMobileFilters && (
					<motion.div
						initial={{ opacity: 0, y: -10 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -10 }}
						transition={{ duration: 0.2, ease: "easeOut" }}
						className="absolute top-[calc(100%+0.5rem)] left-0 right-0 z-50 md:hidden p-4 rounded-xl border border-border/50 bg-background/95 backdrop-blur-xl shadow-xl space-y-3"
					>
						<Select
							value={filters.game}
							onValueChange={(value) => updateFilter("game", value)}
						>
							<SelectTrigger>
								<SelectValue placeholder={t("allGames")} />
							</SelectTrigger>
							<SelectContent>
								{games.map((game) => (
									<SelectItem key={game} value={game}>
										{game}
									</SelectItem>
								))}
							</SelectContent>
						</Select>

						<Select
							value={filters.priceRange}
							onValueChange={(value) =>
								updateFilter("priceRange", value)
							}
						>
							<SelectTrigger>
								<SelectValue placeholder={t("allPrices")} />
							</SelectTrigger>
							<SelectContent>
								{priceRanges.map((range) => (
									<SelectItem
										key={range.value}
										value={range.value}
									>
										{range.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						<Select
							value={filters.status}
							onValueChange={(value) => updateFilter("status", value)}
						>
							<SelectTrigger>
								<SelectValue placeholder="Trạng thái" />
							</SelectTrigger>
							<SelectContent>
								{statusOptions.map((option) => (
									<SelectItem
										key={option.value}
										value={option.value}
									>
										{option.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						<Select
							value={filters.sort}
							onValueChange={(value) => updateFilter("sort", value)}
						>
							<SelectTrigger>
								<SelectValue placeholder={t("sortBy")} />
							</SelectTrigger>
							<SelectContent>
								{sortOptions.map((option) => (
									<SelectItem
										key={option.value}
										value={option.value}
									>
										{option.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>

						{hasActiveFilters && (
							<Button
								variant="outline"
								onClick={clearFilters}
								className="w-full gap-2"
							>
								<X className="h-4 w-4" />
								{t("clearFilters")}
							</Button>
						)}
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}