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

interface FilterState {
	search: string;
	game: string;
	priceRange: string;
	status: string;
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
	const games = [allGamesValue, "Play Together"];

	const [filters, setFilters] = useState<FilterState>(() => {
		if (initialFilters) {
			return initialFilters;
		}

		const priceRange = searchParams.get("priceRange") || "all";
		const search = searchParams.get("search") || "";
		const game = searchParams.get("game") || allGamesValue;

		return {
			search,
			game,
			priceRange,
			status: "all",
		};
	});

	useEffect(() => {
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
		};
		setFilters(defaultFilters);
		onFilterChange(defaultFilters);
	};

	const hasActiveFilters =
		filters.search ||
		filters.game !== allGamesValue ||
		filters.priceRange !== "all";

	return (
		<div className="space-y-4">
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
					<Filter className="h-4 w-4" />
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

			{/* Mobile Filters */}
			{showMobileFilters && (
				<div className="md:hidden space-y-3 p-4 rounded-lg bg-card border border-border animate-fade-in">
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
				</div>
			)}
		</div>
	);
}
