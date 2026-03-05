import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { AccountCard } from "@/components/accounts/AccountCard";
import { AccountFilter } from "@/components/accounts/AccountFilter";
import { CursorPaginationWrapper } from "@/components/ui/cursor-pagination-wrapper";
import {
	accountService,
	type GetAccountsParams,
} from "@/services/accountService";
import { Gamepad2 } from "lucide-react";
import type { GameAccount } from "@/types";
import { useLocation, useSearchParams } from "react-router";
import { useTranslation } from "@/stores/languageStore";
import { AccountStatus } from "@/constants/enums";

interface FilterState {
	search: string;
	categoryId: string;
	priceRange: string;
	status: string;
	sort: string;
}

export default function AccountsPage() {
	const { t } = useTranslation();
	const [searchParams] = useSearchParams();
	const location = useLocation();

	const [filters, setFilters] = useState<FilterState>(() => {
		const hiddenPrice = location.state?.priceRange;
		const urlPrice = searchParams.get("priceRange");

		return {
			search: searchParams.get("search") || "",
			categoryId: searchParams.get("category_id") || "all",
			priceRange: hiddenPrice || urlPrice || "all",
			status: searchParams.get("status") || "all",
			sort: searchParams.get("sort") || "newest",
		};
	});

	const [accounts, setAccounts] = useState<GameAccount[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	const [currentCursor, setCurrentCursor] = useState("");
	const [allCursors, setAllCursors] = useState<string[]>([""]);
	const [pageNum, setPageNum] = useState(1);
	const pageNumRef = useRef(1);
	const [hasMoreBeyondKnown, setHasMoreBeyondKnown] = useState(false);
	const [pageSize, setPageSize] = useState(12);
	const [debouncedSearch, setDebouncedSearch] = useState(filters.search);

	const navigateTo = (page: number) => {
		const c = allCursors[page - 1] ?? "";
		pageNumRef.current = page;
		setPageNum(page);
		setCurrentCursor(c);
	};

	useEffect(() => {
		window.scrollTo({ top: 0, behavior: "smooth" });
	}, [currentCursor]);

	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedSearch(filters.search);
		}, 700);

		return () => clearTimeout(timer);
	}, [filters.search]);

	useEffect(() => {
		pageNumRef.current = 1;
		setPageNum(1);
		setCurrentCursor("");
		setAllCursors([""]);
		setHasMoreBeyondKnown(false);
	}, [filters]);

	useEffect(() => {
		const buildParams = (c: string): GetAccountsParams => {
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

			return {
				cursor: c,
				limit: pageSize,
				category_id:
					filters.categoryId === "all"
						? undefined
						: Number(filters.categoryId),
				min_price: minPrice,
				max_price: maxPrice,
				search: debouncedSearch,
				status: statusParam,
				sort: filters.sort,
			};
		};

		const fetchAccounts = async () => {
			try {
				setIsLoading(true);
				const pn = pageNumRef.current;

				const res = await accountService.getAll(
					buildParams(currentCursor),
				);
				setAccounts(res.data ?? []);

				const nc = res.paging?.next_cursor ?? "";
				const hm = res.paging?.has_more ?? false;

				if (hm && nc) {
					setAllCursors((prev) => {
						if (prev.length > pn) return prev;
						return [...prev, nc];
					});
					// Prefetch next page silently to discover cursor for pn+2
					accountService
						.getAll(buildParams(nc))
						.then((pr) => {
							const pnc = pr.paging?.next_cursor ?? "";
							const phm = pr.paging?.has_more ?? false;
							if (phm && pnc) {
								setAllCursors((prev) => {
									if (prev.length > pn + 1) return prev;
									return [...prev.slice(0, pn + 1), pnc];
								});
								setHasMoreBeyondKnown(true);
							} else {
								setHasMoreBeyondKnown(false);
							}
						})
						.catch(() => {});
				} else {
					setAllCursors((prev) => prev.slice(0, pn));
					setHasMoreBeyondKnown(false);
				}
			} catch (error) {
				// console.error("Failed to fetch accounts", error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchAccounts();
	}, [
		currentCursor,
		pageSize,
		filters.categoryId,
		filters.priceRange,
		filters.status,
		filters.sort,
		debouncedSearch,
	]);

	return (
		<>
			<div className="container mx-auto px-4 py-8">
				{/* Header */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					className="mb-8"
				>
					<h1 className="font-gaming text-3xl md:text-4xl font-bold mb-2">
						{t("accountPage.accountsList")}{" "}
						<span className="text-gradient">
							{t("accountPage.accGame")}
						</span>
					</h1>
					<p className="text-muted-foreground">
						{t("accountPage.accountsDesc")}
					</p>
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
						<CursorPaginationWrapper
							hasMore={allCursors.length > pageNum}
							hasPrev={pageNum > 1}
							onNext={() => navigateTo(pageNum + 1)}
							onPrev={() => navigateTo(pageNum - 1)}
							currentPage={pageNum}
							onGoToPage={navigateTo}
							maxKnownPage={allCursors.length}
							hasMoreBeyondKnown={hasMoreBeyondKnown}
							itemCount={accounts.length}
							pageSize={pageSize}
							onPageSizeChange={(size) => {
								setPageSize(size);
								pageNumRef.current = 1;
								setPageNum(1);
								setCurrentCursor("");
								setAllCursors([""]);
								setHasMoreBeyondKnown(false);
							}}
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
							{t("accountPage.noAccountsFound")}
						</h3>
						<p className="text-muted-foreground">
							{t("accountPage.tryChangeFilter")}
						</p>
					</motion.div>
				)}
			</div>
		</>
	);
}
