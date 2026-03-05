import { useState, useEffect } from "react";
import { useSearchParams } from "react-router";
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
import {
	AccountStatus,
	AccountStatusLabelKey,
	GameList,
} from "@/constants/enums";
import { motion, AnimatePresence } from "framer-motion";

interface FilterState {
	search: string;
	categoryId: string;
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
	const { t } = useTranslation();
	const [searchParams] = useSearchParams();
	const allGamesValue = "all";

	const priceRanges = [
		{ value: "all", label: t("filter.allPrices") },
		{ value: "0-1000000", label: t("filter.priceUnder1m") },
		{ value: "1000000-5000000", label: t("filter.price1mTo5m") },
		{ value: "5000000-10000000", label: t("filter.price5mTo10m") },
		{ value: "10000000-20000000", label: t("filter.price10mTo20m") },
		{ value: "20000000-999999999", label: t("filter.priceAbove20m") },
	];

	const statusOptions = [
		{ value: "all", label: t("filter.allStatuses") },
		{
			value: AccountStatus.Available.toString(),
			label: t(`account.status.${AccountStatusLabelKey[AccountStatus.Available]}`),
		},
		{
			value: AccountStatus.Sold.toString(),
			label: t(`account.status.${AccountStatusLabelKey[AccountStatus.Sold]}`),
		},
		{
			value: AccountStatus.Reserved.toString(),
			label: t(`account.status.${AccountStatusLabelKey[AccountStatus.Reserved]}`),
		},
	];

	const sortOptions = [
		{ value: "newest", label: t("filter.newest") },
		{
			value: "price_asc",
			label: t("filter.priceLowToHigh"),
		},
		{
			value: "price_desc",
			label: t("filter.priceHighToLow"),
		},
	];

	const gameOptions = [
		{ value: "all", label: t("filter.allGames") },
		...GameList.map((game) => ({
			value: game.id.toString(),
			label: game.name,
		})),
	];

	const [filters, setFilters] = useState<FilterState>(() => {
		const defaultSort = "newest";

		if (initialFilters) {
			return {
				...initialFilters,
				sort: initialFilters.sort || defaultSort,
				status: initialFilters.status || "all",
				priceRange: initialFilters.priceRange || "all",
				categoryId: initialFilters.categoryId || allGamesValue,
				search: initialFilters.search || "",
			};
		}

		return {
			search: searchParams.get("search") || "",
			categoryId: searchParams.get("category_id") || allGamesValue,
			priceRange: searchParams.get("priceRange") || "all",
			status: "all",
			sort: searchParams.get("sort") || defaultSort,
		};
	});

	useEffect(() => {
		const sort = searchParams.get("sort");
		if (sort && sort !== filters.sort) {
			updateFilter("sort", sort);
		}
	}, [searchParams.get("sort")]);

	const [showMobileFilters, setShowMobileFilters] = useState(false);

	const updateFilter = (key: keyof FilterState, value: string) => {
		const newFilters = { ...filters, [key]: value };
		setFilters(newFilters);
		onFilterChange(newFilters);
	};

	const clearFilters = () => {
		const defaultFilters = {
			search: "",
			categoryId: allGamesValue,
			priceRange: "all",
			status: "all",
			sort: "newest",
		};
		setFilters(defaultFilters);
		onFilterChange(defaultFilters);
	};

	const hasActiveFilters =
		filters.search ||
		filters.categoryId !== allGamesValue ||
		filters.priceRange !== "all" ||
		filters.sort !== "newest";

	const activeFilterCount = [
		filters.search,
		filters.categoryId !== allGamesValue,
		filters.priceRange !== "all",
		filters.status !== "all",
		filters.sort !== "newest",
	].filter(Boolean).length;

	return (
		<div className="space-y-4 relative z-40">
			<div className="flex gap-2">
				<div className="relative flex-1">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
					<Input
						placeholder={t("filter.searchPlaceholder")}
						value={filters.search}
						onChange={(e) => updateFilter("search", e.target.value)}
						className="pl-10 input-gaming"
					/>
				</div>

				<Button
					variant={hasActiveFilters ? "default" : "outline"}
					size="default"
					className={`md:hidden gap-2 min-w-[100px] relative ${
						hasActiveFilters ? "animate-pulse shadow-lg" : ""
					}`}
					onClick={() => setShowMobileFilters(!showMobileFilters)}
				>
					{showMobileFilters ? (
						<>
							<X className="h-4 w-4" />
							<span className="text-sm font-medium">
								{t("common.close")}
							</span>
						</>
					) : (
						<>
							<Filter className="h-4 w-4" />
							<span className="text-sm font-medium">
								{t("filter.filter")}
							</span>
							{activeFilterCount > 0 && (
								<span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold border-2 border-background">
									{activeFilterCount}
								</span>
							)}
						</>
					)}
				</Button>
			</div>

			{/* Desktop Filters */}
			<div className="hidden md:flex flex-wrap gap-3 items-center">
				<Select
					value={filters.categoryId}
					onValueChange={(value) => updateFilter("categoryId", value)}
				>
					<SelectTrigger className="w-[180px]">
						<SelectValue placeholder={t("filter.allGames")} />
					</SelectTrigger>
					<SelectContent>
						{gameOptions.map((opt) => (
							<SelectItem key={opt.value} value={opt.value}>
								{opt.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>

				<Select
					value={filters.priceRange}
					onValueChange={(value) => updateFilter("priceRange", value)}
				>
					<SelectTrigger className="w-[180px]">
						<SelectValue placeholder={t("filter.allPrices")} />
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
						<SelectValue placeholder={t("filter.statuses")} />
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
						<SelectValue placeholder={t("filter.sortBy")} />
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
						{t("filter.clearFilters")}
					</Button>
				)}
			</div>

			{/* Mobile Filters */}
			<AnimatePresence>
				{showMobileFilters && (
					<motion.div
						initial={{ opacity: 0, y: -10 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -10 }}
						className="absolute top-[calc(100%+0.5rem)] left-0 right-0 z-50 md:hidden p-4 rounded-xl border border-border/50 bg-background/95 backdrop-blur-xl shadow-xl space-y-3"
					>
						<Select
							value={filters.categoryId}
							onValueChange={(value) =>
								updateFilter("categoryId", value)
							}
						>
							<SelectTrigger>
								<SelectValue placeholder={t("filter.allGames")} />
							</SelectTrigger>
							<SelectContent>
								{gameOptions.map((opt) => (
									<SelectItem
										key={opt.value}
										value={opt.value}
									>
										{opt.label}
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
								<SelectValue placeholder={t("filter.allPrices")} />
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
							onValueChange={(value) =>
								updateFilter("status", value)
							}
						>
							<SelectTrigger>
								<SelectValue placeholder={t("filter.statuses")} />
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
							onValueChange={(value) =>
								updateFilter("sort", value)
							}
						>
							<SelectTrigger>
								<SelectValue placeholder={t("filter.sortBy")} />
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
								{t("filter.clearFilters")}
							</Button>
						)}
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}
