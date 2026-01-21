import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { AccountCard } from "@/components/accounts/AccountCard";
import { AccountFilter } from "@/components/accounts/AccountFilter";
import { PaginationWrapper } from "@/components/ui/pagination-wrapper";
import {
	accountService,
	type GetAccountsParams,
} from "@/services/accountService";
import { Gamepad2 } from "lucide-react";
import type { GameAccount } from "@/types";
import { useLocation, useSearchParams } from "react-router-dom";
import { useTranslation } from "@/stores/languageStore";
import { AccountStatus } from "@/constants/enums";

interface FilterState {
	search: string;
	game: string;
	priceRange: string;
	status: string;
	sort: string;
}

export default function AccountsPage() {
	const { t, language } = useTranslation();
	const [searchParams] = useSearchParams();
	const location = useLocation();

	const [filters, setFilters] = useState<FilterState>(() => {
		const hiddenPrice = location.state?.priceRange;
		const urlPrice = searchParams.get("priceRange");

		return {
			search: searchParams.get("search") || "",
			game:
				searchParams.get("game") ||
				(language === "vi" ? "Tất cả" : "All Games"),
			priceRange: hiddenPrice || urlPrice || "all",
			status: searchParams.get("status") || "all",
			sort: searchParams.get("sort") || "newest",
		};
	});

	const [accounts, setAccounts] = useState<GameAccount[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	const [currentPage, setCurrentPage] = useState(1);
	const [pageSize, setPageSize] = useState(12);
	const [totalPages, setTotalPages] = useState(1);
	const [totalItems, setTotalItems] = useState(0);
	const [debouncedSearch, setDebouncedSearch] = useState(filters.search);

	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedSearch(filters.search);
		}, 700);

		return () => clearTimeout(timer);
	}, [filters.search]);

	useEffect(() => {
		setCurrentPage(1);
	}, [filters]);

	useEffect(() => {
		const fetchAccounts = async () => {
			try {
				setIsLoading(true);

				let minPrice: number | undefined;
				let maxPrice: number | undefined;

				if (filters.priceRange && filters.priceRange !== "all") {
					const [minStr, maxStr] = filters.priceRange.split("-");
					minPrice = Number(minStr);
					maxPrice = Number(maxStr);
				}

				let statusParam: AccountStatus | AccountStatus[] | undefined;

				if (filters.status && filters.status !== "all") {
					statusParam = Number(filters.status) as AccountStatus;
				} else {
					statusParam = [
						AccountStatus.Available,
						AccountStatus.Reserved,
						AccountStatus.Sold,
					];
				}

				const params: GetAccountsParams = {
					page: currentPage,
					limit: pageSize,
					game_name:
						filters.game === "Tất cả" ||
						filters.game === "All Games"
							? undefined
							: filters.game,
					min_price: minPrice,
					max_price: maxPrice,
					search: debouncedSearch,
					status: statusParam,
					sort: filters.sort,
				};

				const res = await accountService.getAll(params);

				setAccounts(res.data);

				if (res.paging) {
					setTotalItems(Number(res.paging.total));
					setTotalPages(
						Math.ceil(Number(res.paging.total) / pageSize),
					);
				}
			} catch (error) {
				// console.error("Failed to fetch accounts", error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchAccounts();
	}, [
		currentPage,
		pageSize,
		filters.game,
		filters.priceRange,
		filters.status,
		filters.sort,
		debouncedSearch,
	]);

	return (
		<Layout>
			<div className="container mx-auto px-4 py-8">
				{/* Header */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					className="mb-8"
				>
					<h1 className="font-gaming text-3xl md:text-4xl font-bold mb-2">
						{t("accountsList")}{" "}
						<span className="text-gradient">{t("accGame")}</span>
					</h1>
					<p className="text-muted-foreground">{t("accountsDesc")}</p>
				</motion.div>

				{/* Filters */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.1 }}
					className="sticky top-16 z-30 mb-6 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-2 -mx-4 px-4 md:mx-0 md:px-0"
				>
					<AccountFilter
						onFilterChange={setFilters}
						initialFilters={filters}
					/>
				</motion.div>

				{/* Results count */}
				<div className="mb-6 text-muted-foreground">
					{t("found")}{" "}
					<span className="text-primary font-semibold">
						{isLoading ? "..." : totalItems}
					</span>{" "}
					{t("accGameCount")}
				</div>

				{/* Content */}
				{isLoading ? (
					// --- SKELETON LOADING EFFECT ---
					<div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
						{Array.from({ length: pageSize }).map((_, index) => (
							<div
								key={index}
								className="rounded-xl border border-border bg-card overflow-hidden flex flex-col h-full"
							>
								{/* Image Skeleton */}
								<div className="aspect-video w-full bg-secondary/50 animate-pulse" />

								<div className="p-4 flex flex-col flex-1 gap-4">
									{/* Title & Tags */}
									<div className="space-y-2">
										<div className="flex gap-2">
											<div className="h-5 w-16 bg-secondary/50 rounded animate-pulse" />
											<div className="h-5 w-20 bg-secondary/50 rounded animate-pulse" />
										</div>
										<div className="h-6 w-3/4 bg-secondary/50 rounded animate-pulse" />
									</div>

									{/* Info Grid Skeleton (giống 4 thuộc tính game) */}
									<div className="grid grid-cols-2 gap-2 mt-auto">
										<div className="h-4 w-full bg-secondary/50 rounded animate-pulse" />
										<div className="h-4 w-full bg-secondary/50 rounded animate-pulse" />
										<div className="h-4 w-full bg-secondary/50 rounded animate-pulse" />
										<div className="h-4 w-full bg-secondary/50 rounded animate-pulse" />
									</div>

									{/* Footer: Price & Button */}
									<div className="mt-4 pt-3 flex items-center justify-between border-t border-border/50">
										<div className="h-7 w-28 bg-secondary/50 rounded animate-pulse" />
										<div className="h-9 w-24 bg-secondary/50 rounded-lg animate-pulse" />
									</div>
								</div>
							</div>
						))}
					</div>
				) : accounts.length > 0 ? (
					<>
						{/* Accounts Grid */}
						<div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
							{accounts.map((account, index) => (
								<AccountCard
									key={account.id}
									account={account}
									index={index}
								/>
							))}
						</div>

						{/* Pagination Wrapper */}
						<PaginationWrapper
							currentPage={currentPage}
							totalPages={totalPages}
							totalItems={totalItems}
							onPageChange={setCurrentPage}
							pageSize={pageSize}
							onPageSizeChange={setPageSize}
							pageSizeOptions={[8, 12, 24, 48]}
						/>
					</>
				) : (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						className="text-center py-20"
					>
						<div className="p-4 rounded-full bg-secondary w-fit mx-auto mb-4">
							<Gamepad2 className="h-12 w-12 text-muted-foreground" />
						</div>
						<h3 className="font-gaming text-xl font-semibold mb-2">
							{t("noAccountsFound")}
						</h3>
						<p className="text-muted-foreground">
							{t("tryChangeFilter")}
						</p>
					</motion.div>
				)}
			</div>
		</Layout>
	);
}