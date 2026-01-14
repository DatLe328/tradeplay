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

const games = [
	"Tất cả",
	"Play Together",
];

const priceRanges = [
	{ value: "all", label: "Tất cả giá" },
	{ value: "0-1000000", label: "Dưới 1 Triệu" },
	{ value: "1000000-5000000", label: "1 - 5 Triệu" },
	{ value: "5000000-10000000", label: "5 - 10 Triệu" },
	{ value: "10000000-20000000", label: "10 - 20 Triệu" },
	{ value: "20000000-999999999", label: "Trên 20 Triệu" },
];


export function AccountFilter({ onFilterChange, initialFilters }: AccountFilterProps) {
	const [searchParams] = useSearchParams();

	const [filters, setFilters] = useState<FilterState>(() => {
		if (initialFilters) {
			return initialFilters;
		}

		const priceRange = searchParams.get("priceRange") || "all";
		const search = searchParams.get("search") || "";
		const game = searchParams.get("game") || "Tất cả";

		return {
			search,
			game,
			priceRange,
			status: "all",
		};
	});

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
			game: "Tất cả",
			priceRange: "all",
			status: "all",
		};
		setFilters(defaultFilters);
		onFilterChange(defaultFilters);
	};

	const hasActiveFilters =
		filters.search ||
		filters.game !== "Tất cả" ||
		filters.priceRange !== "all"

	return (
		<div className="space-y-4">
			{/* Search and mobile filter toggle */}
			<div className="flex gap-2">
				<div className="relative flex-1">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
					<Input
						placeholder="Tìm kiếm acc game có mã số, tựa đề..."
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
						<SelectValue placeholder="Chọn game" />
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
						<SelectValue placeholder="Khoảng giá" />
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
						Xóa bộ lọc
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
							<SelectValue placeholder="Chọn game" />
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
							<SelectValue placeholder="Khoảng giá" />
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
							Xóa bộ lọc
						</Button>
					)}
				</div>
			)}
		</div>
	);
}
