import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { format } from "date-fns";
import {
	ShieldAlert,
	Search,
	FileJson,
	Filter,
	RotateCcw,
	AlertCircle,
	CheckCircle2,
	Server,
	Globe,
	Code,
	User,
	Timer,
	Laptop,
	AlertTriangle,
} from "lucide-react";

// Services & Utils
import { auditService } from "@/services/auditService";
import { useToast } from "@/hooks/use-toast";
import type { AuditLog, AuditLogFilter } from "@/types";

// Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PaginationWrapper } from "@/components/ui/pagination-wrapper";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";

const StatusBadge = ({ code }: { code: number }) => {
	let className = "";
	if (code >= 200 && code < 300)
		className = "bg-green-500/15 text-green-600 border-green-500/20";
	else if (code >= 400 && code < 500)
		className = "bg-amber-500/15 text-amber-600 border-amber-500/20";
	else className = "bg-rose-500/15 text-rose-600 border-rose-500/20";

	return (
		<Badge variant="outline" className={`font-mono font-bold ${className}`}>
			{code}
		</Badge>
	);
};

const MethodBadge = ({ method }: { method: string }) => {
	const colors: Record<string, string> = {
		GET: "text-blue-500 bg-blue-500/10 border-blue-200/20",
		POST: "text-green-500 bg-green-500/10 border-green-200/20",
		PUT: "text-orange-500 bg-orange-500/10 border-orange-200/20",
		DELETE: "text-red-500 bg-red-500/10 border-red-200/20",
	};
	return (
		<span
			className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${colors[method] || "text-gray-500"}`}
		>
			{method}
		</span>
	);
};

const JsonViewer = ({ title, data }: { title: string; data: any }) => {
	if (!data || (typeof data === "object" && Object.keys(data).length === 0))
		return null;

	return (
		<div className="space-y-2 mt-4">
			<h4 className="text-sm font-semibold flex items-center gap-2 text-foreground/80">
				<FileJson className="h-4 w-4" /> {title}
			</h4>
			<div className="bg-muted/50 rounded-md border p-3 overflow-hidden">
				<ScrollArea className="h-full max-h-[200px] w-full">
					<pre className="text-xs font-mono text-muted-foreground whitespace-pre-wrap break-all">
						{JSON.stringify(data, null, 2)}
					</pre>
				</ScrollArea>
			</div>
		</div>
	);
};

const DetailRow = ({ icon: Icon, label, value, className = "" }: any) => (
	<div
		className={`flex items-start justify-between py-2 border-b last:border-0 ${className}`}
	>
		<span className="text-sm text-muted-foreground flex items-center gap-2">
			{Icon && <Icon className="h-4 w-4" />}
			{label}
		</span>
		<span className="text-sm font-medium text-right max-w-[60%] break-words">
			{value || "N/A"}
		</span>
	</div>
);

const AuditLogSkeleton = () => {
	return (
		<>
			{Array.from({ length: 10 }).map((_, i) => (
				<TableRow key={i}>
					<TableCell>
						<div className="flex flex-col gap-2">
							<Skeleton className="h-4 w-24" /> {/* Date */}
							<Skeleton className="h-3 w-16" /> {/* Time */}
						</div>
					</TableCell>
					<TableCell>
						<Skeleton className="h-5 w-16 rounded-full" />{" "}
						{/* User Badge */}
					</TableCell>
					<TableCell>
						<Skeleton className="h-4 w-32" /> {/* Action Text */}
					</TableCell>
					<TableCell className="hidden md:table-cell">
						<div className="flex items-center gap-2">
							<Skeleton className="h-5 w-8" />{" "}
							{/* Method Badge */}
							<Skeleton className="h-3 w-24" /> {/* Path */}
						</div>
					</TableCell>
					<TableCell className="hidden lg:table-cell">
						<Skeleton className="h-3 w-20" /> {/* IP */}
					</TableCell>
					<TableCell className="text-center">
						<Skeleton className="h-5 w-10 mx-auto rounded-full" />{" "}
						{/* Status Badge */}
					</TableCell>
					<TableCell>
						<Skeleton className="h-8 w-8 rounded-md ml-auto" />{" "}
						{/* Action Button */}
					</TableCell>
				</TableRow>
			))}
		</>
	);
};

// --- Main Component ---

export default function AuditLogs() {
	const [searchParams, setSearchParams] = useSearchParams();
	const { toast } = useToast();

	// State
	const [filters, setFilters] = useState({
		user_id: searchParams.get("user_id") || "",
		action: searchParams.get("action") || "",
		status_code: searchParams.get("status_code") || "",
		date_from: searchParams.get("date_from") || "",
		date_to: searchParams.get("date_to") || "",
	});
	const [isFilterOpen, setIsFilterOpen] = useState(false);

	const [logs, setLogs] = useState<AuditLog[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

	// Pagination
	const [currentPage, setCurrentPage] = useState(1);
	useEffect(() => {
		window.scrollTo({ top: 0, behavior: "smooth" });
	}, [currentPage]);

	const [pageSize, setPageSize] = useState(20);
	const [totalItems, setTotalItems] = useState(0);
	const [totalPages, setTotalPages] = useState(1);

	const [debouncedFilters, setDebouncedFilters] = useState(filters);
	useEffect(() => {
		const timer = setTimeout(() => setDebouncedFilters(filters), 500);
		return () => clearTimeout(timer);
	}, [filters]);

	useEffect(() => {
		setCurrentPage(1);
		const params: any = {};
		Object.keys(filters).forEach((key) => {
			if (filters[key as keyof typeof filters])
				params[key] = filters[key as keyof typeof filters];
		});
		setSearchParams(params);
	}, [debouncedFilters]);

	// Fetch Data
	useEffect(() => {
		const fetchLogs = async () => {
			try {
				setIsLoading(true);
				// Giả lập delay một chút để nhìn thấy hiệu ứng Skeleton nếu mạng quá nhanh
				// await new Promise(resolve => setTimeout(resolve, 500));

				const params: AuditLogFilter = {
					page: currentPage,
					limit: pageSize,
					...debouncedFilters,
				};
				const res = await auditService.getLogs(params);
				setLogs(res.data);
				if (res.paging) {
					setTotalItems(res.paging.total);
					setTotalPages(Math.ceil(res.paging.total / pageSize));
				}
			} catch (error) {
				console.error("Audit fetch error:", error);
				toast({
					title: "Lỗi",
					description: "Không thể tải dữ liệu.",
					variant: "destructive",
				});
			} finally {
				setIsLoading(false);
			}
		};
		fetchLogs();
	}, [currentPage, pageSize, debouncedFilters, toast]);

	const clearFilters = () => {
		setFilters({
			user_id: "",
			action: "",
			status_code: "",
			date_from: "",
			date_to: "",
		});
	};

	return (
		<div className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-[100vw] overflow-x-hidden">
			{/* --- Header --- */}
			<div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					className="mt-6 md:mt-0"
				>
					<h1 className="font-gaming text-3xl md:text-4xl font-extrabold tracking-tight">
						<ShieldAlert className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
						<span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
							Audit Logs
						</span>
					</h1>
					<p className="text-xs md:text-sm text-muted-foreground mt-2 font-medium opacity-80">
						Nhật ký hoạt động hệ thống
					</p>
				</motion.div>
			</div>

			<Card className="sticky top-2 z-30 shadow-md border-primary/10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
				<CardContent className="p-3 sm:p-4">
					<div className="flex flex-col sm:flex-row gap-3">
						<div className="relative flex-1">
							<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
							<Input
								placeholder="Tìm User ID..."
								value={filters.user_id}
								onChange={(e) =>
									setFilters({
										...filters,
										user_id: e.target.value,
									})
								}
								className="pl-9 bg-background"
							/>
						</div>
						<div className="hidden lg:flex gap-3 flex-[2]">
							<Input
								placeholder="Action..."
								value={filters.action}
								onChange={(e) =>
									setFilters({
										...filters,
										action: e.target.value,
									})
								}
								className="bg-background"
							/>
							<Input
								placeholder="Status..."
								value={filters.status_code}
								onChange={(e) =>
									setFilters({
										...filters,
										status_code: e.target.value,
									})
								}
								className="w-[100px] bg-background"
							/>
							<div className="flex items-center gap-2">
								<Input
									type="date"
									value={filters.date_from}
									onChange={(e) =>
										setFilters({
											...filters,
											date_from: e.target.value,
										})
									}
									className="w-[130px] bg-background"
								/>
								<span className="text-muted-foreground">-</span>
								<Input
									type="date"
									value={filters.date_to}
									onChange={(e) =>
										setFilters({
											...filters,
											date_to: e.target.value,
										})
									}
									className="w-[130px] bg-background"
								/>
							</div>
							<Button
								variant="ghost"
								size="icon"
								onClick={clearFilters}
							>
								<RotateCcw className="h-4 w-4" />
							</Button>
						</div>
						<div className="lg:hidden">
							<Sheet
								open={isFilterOpen}
								onOpenChange={setIsFilterOpen}
							>
								<SheetTrigger asChild>
									<Button
										variant="outline"
										className="gap-2 w-full sm:w-auto"
									>
										<Filter className="h-4 w-4" />{" "}
										<span className="sm:hidden">
											Bộ lọc
										</span>
									</Button>
								</SheetTrigger>
								<SheetContent side="left">
									<SheetHeader>
										<SheetTitle>Bộ lọc tìm kiếm</SheetTitle>
										<SheetDescription>
											Chi tiết các tiêu chí lọc log.
										</SheetDescription>
									</SheetHeader>
									<div className="grid gap-4 py-4">
										{/* Các input filter mobile giữ nguyên */}
										<div className="space-y-2">
											<label className="text-sm font-medium">
												Hành động
											</label>
											<Input
												value={filters.action}
												onChange={(e) =>
													setFilters({
														...filters,
														action: e.target.value,
													})
												}
											/>
										</div>
										<div className="space-y-2">
											<label className="text-sm font-medium">
												Status
											</label>
											<Input
												value={filters.status_code}
												onChange={(e) =>
													setFilters({
														...filters,
														status_code:
															e.target.value,
													})
												}
											/>
										</div>
										<div className="space-y-2">
											<label className="text-sm font-medium">
												Từ ngày
											</label>
											<Input
												type="date"
												value={filters.date_from}
												onChange={(e) =>
													setFilters({
														...filters,
														date_from:
															e.target.value,
													})
												}
											/>
										</div>
										<div className="space-y-2">
											<label className="text-sm font-medium">
												Đến ngày
											</label>
											<Input
												type="date"
												value={filters.date_to}
												onChange={(e) =>
													setFilters({
														...filters,
														date_to: e.target.value,
													})
												}
											/>
										</div>
										<Button
											variant="secondary"
											onClick={clearFilters}
											className="mt-4"
										>
											Xóa bộ lọc
										</Button>
									</div>
								</SheetContent>
							</Sheet>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* --- Data Table --- */}
			<Card className="border-border shadow-sm overflow-hidden">
				<CardContent className="p-0">
					<ScrollArea className="h-[calc(100vh-300px)] w-full">
						<Table>
							<TableHeader className="bg-muted/50 sticky top-0 z-10">
								<TableRow>
									<TableHead className="w-[150px]">
										Thời gian
									</TableHead>
									<TableHead className="w-[100px]">
										User
									</TableHead>
									<TableHead>Hành động</TableHead>
									<TableHead className="hidden md:table-cell">
										API Path
									</TableHead>
									<TableHead className="hidden lg:table-cell">
										IP
									</TableHead>
									<TableHead className="text-center">
										Status
									</TableHead>
									<TableHead className="w-[50px]"></TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{/* LOGIC HIỂN THỊ SKELETON Ở ĐÂY */}
								{isLoading ? (
									<AuditLogSkeleton />
								) : logs.length > 0 ? (
									logs.map((log) => (
										<TableRow
											key={log.id}
											className="group cursor-pointer hover:bg-muted/50"
											onClick={() => setSelectedLog(log)}
										>
											<TableCell className="whitespace-nowrap">
												<div className="flex flex-col">
													<span className="font-medium text-xs sm:text-sm">
														{format(
															new Date(
																log.created_at,
															),
															"dd/MM/yyyy",
														)}
													</span>
													<span className="text-[10px] sm:text-xs text-muted-foreground font-mono">
														{format(
															new Date(
																log.created_at,
															),
															"HH:mm:ss",
														)}
													</span>
												</div>
											</TableCell>
											<TableCell>
												{log.user_id ? (
													<Badge
														variant="secondary"
														className="font-mono text-[10px]"
													>
														#{log.user_id}
													</Badge>
												) : (
													<span className="text-xs text-muted-foreground italic">
														Guest
													</span>
												)}
											</TableCell>
											<TableCell>
												<span className="font-semibold text-xs sm:text-sm text-foreground/90">
													{log.action}
												</span>
											</TableCell>
											<TableCell className="hidden md:table-cell max-w-[200px]">
												<div className="flex items-center gap-2">
													<MethodBadge
														method={log.method}
													/>
													<span
														className="text-xs text-muted-foreground truncate font-mono"
														title={log.path}
													>
														{log.path}
													</span>
												</div>
											</TableCell>
											<TableCell className="hidden lg:table-cell font-mono text-xs text-muted-foreground">
												{log.ip_address}
											</TableCell>
											<TableCell className="text-center">
												<StatusBadge
													code={log.status_code}
												/>
											</TableCell>
											<TableCell>
												<Button
													variant="ghost"
													size="icon"
													className="h-8 w-8 text-muted-foreground"
												>
													<FileJson className="h-4 w-4" />
												</Button>
											</TableCell>
										</TableRow>
									))
								) : (
									<TableRow>
										<TableCell
											colSpan={7}
											className="h-32 text-center text-muted-foreground"
										>
											<div className="flex flex-col items-center justify-center">
												<div className="p-4 rounded-full bg-secondary mb-4">
													<Search className="h-8 w-8 opacity-50" />
												</div>
												<p>
													Không tìm thấy nhật ký nào
													phù hợp.
												</p>
												<Button
													variant="link"
													onClick={clearFilters}
												>
													Xóa bộ lọc
												</Button>
											</div>
										</TableCell>
									</TableRow>
								)}
							</TableBody>
						</Table>
						<ScrollBar orientation="horizontal" />
					</ScrollArea>
				</CardContent>
			</Card>

			{/* --- Pagination --- */}
			<div className="py-2">
				{/* Ẩn Pagination khi đang loading để tránh user click nhầm */}
				{!isLoading && (
					<PaginationWrapper
						currentPage={currentPage}
						totalPages={totalPages}
						totalItems={totalItems}
						onPageChange={setCurrentPage}
						pageSize={pageSize}
						onPageSizeChange={setPageSize}
						pageSizeOptions={[20, 50, 100]}
					/>
				)}
			</div>

			{/* Sheet chi tiết Log giữ nguyên */}
			<Sheet
				open={!!selectedLog}
				onOpenChange={(open) => !open && setSelectedLog(null)}
			>
				<SheetContent
					className="w-full sm:w-[540px] p-0 flex flex-col h-full bg-background"
					side="right"
				>
					{/* Header Fixed */}
					<SheetHeader className="p-6 border-b bg-muted/10 shrink-0">
						<SheetTitle className="flex items-center gap-2 text-xl">
							<ShieldAlert className="h-6 w-6 text-primary" />
							Chi tiết Log{" "}
							<span className="font-mono text-muted-foreground text-base font-normal">
								#{selectedLog?.id}
							</span>
						</SheetTitle>
						<SheetDescription>
							Ghi nhận lúc{" "}
							{selectedLog &&
								format(
									new Date(selectedLog.created_at),
									"HH:mm:ss - dd/MM/yyyy",
								)}
						</SheetDescription>
					</SheetHeader>

					{selectedLog && (
						<ScrollArea className="flex-1">
							<div className="p-6 space-y-6">
								{/* Status & Main Info */}
								<div className="grid grid-cols-2 gap-4">
									<Card className="p-4 border-l-4 border-l-primary/50 shadow-sm">
										<div className="text-muted-foreground text-xs uppercase font-bold mb-1">
											Hành động
										</div>
										<div
											className="font-semibold text-lg truncate"
											title={selectedLog.action}
										>
											{selectedLog.action}
										</div>
									</Card>
									<Card
										className={`p-4 border-l-4 shadow-sm ${selectedLog.status_code >= 400 ? "border-l-destructive/50 bg-destructive/5" : "border-l-green-500/50 bg-green-500/5"}`}
									>
										<div className="text-muted-foreground text-xs uppercase font-bold mb-1">
											Trạng thái
										</div>
										<div className="flex items-center gap-2 font-mono font-bold text-lg">
											{selectedLog.status_code >= 400 ? (
												<AlertCircle className="h-5 w-5 text-destructive" />
											) : (
												<CheckCircle2 className="h-5 w-5 text-green-600" />
											)}
											{selectedLog.status_code}
										</div>
									</Card>
								</div>

								{/* Thông tin kỹ thuật */}
								<div className="space-y-1">
									<h3 className="font-semibold text-foreground/90 mb-3 flex items-center gap-2">
										<Server className="h-4 w-4" /> Thông tin
										Request
									</h3>
									<div className="rounded-lg border bg-card px-4">
										<DetailRow
											icon={Globe}
											label="IP Address"
											value={selectedLog.ip_address}
										/>
										<DetailRow
											icon={Code}
											label="Method"
											value={
												<MethodBadge
													method={selectedLog.method}
												/>
											}
										/>
										<DetailRow
											icon={Search}
											label="Endpoint"
											value={
												<span className="font-mono text-xs">
													{selectedLog.path}
												</span>
											}
										/>
										<DetailRow
											icon={User}
											label="User ID"
											value={
												selectedLog.user_id
													? `#${selectedLog.user_id}`
													: "Guest"
											}
										/>
										<DetailRow
											icon={Timer}
											label="Duration"
											value={`${selectedLog.duration}ms`}
										/>
									</div>
								</div>

								{/* User Agent */}
								<div className="bg-muted/30 p-3 rounded-md text-xs text-muted-foreground flex gap-2 items-start">
									<Laptop className="h-4 w-4 mt-0.5 shrink-0" />
									<span className="break-all">
										{selectedLog.user_agent}
									</span>
								</div>

								{/* Error Message (Nếu có) */}
								{selectedLog.error_msg && (
									<div className="rounded-md bg-destructive/10 p-3 border border-destructive/20">
										<h4 className="text-destructive font-semibold text-sm flex items-center gap-2 mb-1">
											<AlertTriangle className="h-4 w-4" />{" "}
											Lỗi hệ thống
										</h4>
										<p className="text-sm text-destructive/90">
											{selectedLog.error_msg}
										</p>
									</div>
								)}

								<Separator />

								<div className="space-y-6">
									<JsonViewer
										title="Request Payload"
										data={selectedLog.payload}
									/>

									{(selectedLog.prev_state ||
										selectedLog.new_state) && (
										<div className="grid grid-cols-1 gap-4">
											<JsonViewer
												title="Dữ liệu cũ (Old State)"
												data={selectedLog.prev_state}
											/>
											<JsonViewer
												title="Dữ liệu mới (New State)"
												data={selectedLog.new_state}
											/>
										</div>
									)}
								</div>
							</div>
						</ScrollArea>
					)}
				</SheetContent>
			</Sheet>
		</div>
	);
}
