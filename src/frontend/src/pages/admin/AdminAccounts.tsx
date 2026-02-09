import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
	Plus,
	Pencil,
	Trash2,
	X,
	Upload,
	Loader2,
	CheckCircle2,
	Clock,
	Banknote,
	Ban,
	ImageIcon,
	Star,
	MoreVertical,
	Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { PaginationWrapper } from "@/components/ui/pagination-wrapper";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from "@/components/ui/dialog";
import type { GameAccount } from "@/types";
import type { GameAttributes } from "@/types/gameSchemas";
import { getGameSchema } from "@/types/gameSchemas";
import { formatCurrency } from "@/utils/format";
import { useToast } from "@/hooks/use-toast";
import { accountService } from "@/services/accountService";
import { GameSelector } from "@/components/admin/GameSelector";
import { DynamicAttributesForm } from "@/components/admin/DynamicAttributesForm";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
	DndContext,
	closestCenter,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
	type DragEndEvent,
} from "@dnd-kit/core";
import {
	arrayMove,
	SortableContext,
	sortableKeyboardCoordinates,
	rectSortingStrategy,
} from "@dnd-kit/sortable";
import { AccountStatus, GameList, getGameName } from "@/constants/enums";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";

function CircularProgress({ value }: { value: number }) {
	const radius = 18;
	const circumference = 2 * Math.PI * radius;
	const strokeDashoffset = circumference - (value / 100) * circumference;

	return (
		<div className="relative flex items-center justify-center">
			{/* Background Circle */}
			<svg className="transform -rotate-90 w-12 h-12">
				<circle
					className="text-gray-600"
					strokeWidth="4"
					stroke="currentColor"
					fill="transparent"
					r={radius}
					cx="24"
					cy="24"
				/>
				{/* Progress Circle */}
				<circle
					className="text-primary transition-all duration-300 ease-in-out"
					strokeWidth="4"
					strokeDasharray={circumference}
					strokeDashoffset={strokeDashoffset}
					strokeLinecap="round"
					stroke="currentColor"
					fill="transparent"
					r={radius}
					cx="24"
					cy="24"
				/>
			</svg>
			<span className="absolute text-[10px] font-bold text-white">
				{Math.round(value)}%
			</span>
		</div>
	);
}

interface SortableImageProps {
	id: string;
	url: string;
	isThumbnail: boolean;
	onRemove: () => void;
	onSetThumbnail: () => void;
	progress?: number;
	mediaType?: "image" | "video";
}

export function SortableImage({
	id,
	url,
	isThumbnail,
	onRemove,
	onSetThumbnail,
	progress,
	mediaType = "image",
}: SortableImageProps) {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id: id });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		opacity: isDragging ? 0.5 : 1,
		zIndex: isDragging ? 1000 : "auto",
		touchAction: "none",
	};

	const isUploading =
		progress !== undefined && progress < 100 && progress >= 0;

	return (
		<div
			ref={setNodeRef}
			style={style}
			{...attributes}
			{...listeners}
			className={`relative aspect-square rounded-xl overflow-hidden group cursor-move transition-all bg-secondary/50 ${
				isThumbnail
					? "ring-2 ring-primary ring-offset-2 ring-offset-background"
					: "border border-border"
			}`}
		>
			{mediaType === "video" ? (
				<video
					src={url}
					className={`w-full h-full object-cover select-none bg-black ${isUploading ? "brightness-50 blur-[1px]" : ""}`}
					muted
					loop
					playsInline
				/>
			) : (
				<img
					src={url}
					alt=""
					className={`w-full h-full object-cover select-none ${isUploading ? "brightness-50 blur-[1px]" : ""}`}
				/>
			)}

			{mediaType === "video" && !isUploading && (
				<div className="absolute inset-0 flex items-center justify-center pointer-events-none">
					<div className="bg-black/40 rounded-full p-1.5 backdrop-blur-[1px]">
						<svg
							className="w-5 h-5 text-white/90"
							fill="currentColor"
							viewBox="0 0 24 24"
						>
							<path d="M8 5v14l11-7z" />
						</svg>
					</div>
				</div>
			)}

			{isUploading && (
				<div className="absolute inset-0 flex items-center justify-center z-30 bg-black/40">
					<CircularProgress value={progress} />
				</div>
			)}

			{!isUploading && (
				<>
					<button
						type="button"
						onPointerDown={(e) => e.stopPropagation()}
						onClick={(e) => {
							e.stopPropagation();
							onRemove();
						}}
						className="absolute top-1 right-1 p-1.5 rounded-full bg-black/50 hover:bg-destructive text-white backdrop-blur-sm transition-colors z-20"
					>
						<X className="h-3.5 w-3.5" />
					</button>

					<button
						type="button"
						onPointerDown={(e) => e.stopPropagation()}
						onClick={(e) => {
							e.stopPropagation();
							onSetThumbnail();
						}}
						className={`absolute bottom-1 right-1 p-1.5 rounded-full backdrop-blur-sm z-20 transition-all ${
							isThumbnail
								? "bg-primary text-primary-foreground"
								: "bg-black/50 text-white hover:bg-primary/80"
						}`}
					>
						<Star
							className={`h-3.5 w-3.5 ${isThumbnail ? "fill-current" : ""}`}
						/>
					</button>

					{isThumbnail && (
						<div className="absolute top-1 left-1 px-2 py-0.5 rounded bg-primary text-primary-foreground text-[10px] font-bold z-10 shadow-sm">
							Bìa
						</div>
					)}
				</>
			)}
		</div>
	);
}

interface FormData {
	category_id: string;
	title: string;
	price: string;
	original_price: string;
	description: string;
	features: string;
	status: AccountStatus;
	attributes: GameAttributes;
	thumbnailIndex: number;
	username: string;
	password: string;
	extraData: string;
}

type SortablePhoto = {
	id: string;
	url: string;
	mediaType: "image" | "video";
};

const initialFormData: FormData = {
	category_id: "",
	title: "",
	price: "",
	original_price: "",
	description: "",
	features: "",
	status: AccountStatus.Available,
	attributes: {},
	thumbnailIndex: 0,
	username: "",
	password: "",
	extraData: "",
};

const getMediaType = (url: string): "image" | "video" => {
	if (/\.(mp4|mov|avi|webm|mkv)$/i.test(url)) return "video";
	return "image";
};

const AccountsSkeleton = () => {
	return (
		<>
			<div className="grid grid-cols-1 gap-4 md:hidden">
				{Array.from({ length: 5 }).map((_, i) => (
					<div
						key={i}
						className="bg-card rounded-xl p-3 border border-border shadow-sm flex gap-3"
					>
						{/* Thumbnail Skeleton */}
						<Skeleton className="w-20 h-20 shrink-0 rounded-lg" />

						<div className="flex-1 min-w-0 flex flex-col justify-between">
							<div className="space-y-2">
								<div className="flex justify-between items-start">
									<Skeleton className="h-3 w-16" />{" "}
									{/* Game Name */}
									<Skeleton className="h-3 w-8" /> {/* ID */}
								</div>
								<Skeleton className="h-4 w-3/4" /> {/* Title */}
							</div>

							<div className="flex items-end justify-between mt-2">
								<div className="flex flex-col gap-1">
									<Skeleton className="h-4 w-24" />{" "}
									{/* Price */}
									<Skeleton className="h-5 w-16 rounded-full" />{" "}
									{/* Badge */}
								</div>
								<Skeleton className="h-8 w-8 rounded-md" />{" "}
								{/* Action Button */}
							</div>
						</div>
					</div>
				))}
			</div>

			<div className="hidden md:block rounded-xl border border-border overflow-hidden bg-card">
				<table className="w-full text-sm">
					<thead className="bg-secondary/50 border-b border-border">
						<tr>
							<th className="px-4 py-3 text-left font-medium">
								Hình ảnh
							</th>
							<th className="px-4 py-3 text-left font-medium">
								ID / Game
							</th>
							<th className="px-4 py-3 text-left font-medium">
								Tiêu đề
							</th>
							<th className="px-4 py-3 text-left font-medium">
								Giá bán
							</th>
							<th className="px-4 py-3 text-left font-medium">
								Trạng thái
							</th>
							<th className="px-4 py-3 text-right font-medium">
								Thao tác
							</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-border">
						{Array.from({ length: 5 }).map((_, i) => (
							<tr key={i}>
								<td className="px-4 py-3">
									<Skeleton className="w-12 h-12 rounded-lg" />
								</td>
								<td className="px-4 py-3">
									<div className="space-y-1">
										<Skeleton className="h-4 w-8" />
										<Skeleton className="h-3 w-16" />
									</div>
								</td>
								<td className="px-4 py-3">
									<Skeleton className="h-4 w-48" />
								</td>
								<td className="px-4 py-3">
									<Skeleton className="h-4 w-24" />
								</td>
								<td className="px-4 py-3">
									<Skeleton className="h-6 w-20 rounded-full" />
								</td>
								<td className="px-4 py-3 text-right">
									<div className="flex justify-end gap-1">
										<Skeleton className="h-8 w-8 rounded-md" />
										<Skeleton className="h-8 w-8 rounded-md" />
									</div>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</>
	);
};

export default function AdminAccounts() {
	const [accounts, setAccounts] = useState<GameAccount[]>([]);
	const [currentPage, setCurrentPage] = useState(1);
	useEffect(() => {
		window.scrollTo({ top: 0, behavior: "smooth" });
	}, [currentPage]);

	const [totalPages, setTotalPages] = useState(1);
	const [totalItems, setTotalItems] = useState(0);
	const [searchTerm, setSearchTerm] = useState("");
	const [debouncedSearch, setDebouncedSearch] = useState("");
	const pageSize = 10;
	const [isLoading, setIsLoading] = useState(true);

	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [editingAccount, setEditingAccount] = useState<GameAccount | null>(
		null,
	);
	const [previewImages, setPreviewImages] = useState<SortablePhoto[]>([]);
	const [localFiles, setLocalFiles] = useState<Record<string, File>>({});
	const [imageUrlInput, setImageUrlInput] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [formData, setFormData] = useState<FormData>(initialFormData);
	const { toast } = useToast();
	const [uploadProgress, setUploadProgress] = useState({
		current: 0,
		total: 0,
	});
	const [imageProgressMap, setImageProgressMap] = useState<
		Record<string, number>
	>({});
	const [deletingId, setDeletingId] = useState<string | null>(null);
	const [accountToDelete, setAccountToDelete] = useState<GameAccount | null>(
		null,
	);
	const currentCategory = GameList.find(
		(g) => g.id.toString() === formData.category_id,
	);
	const currentSchema = getGameSchema(currentCategory?.slug || "");

	const handleGameChange = (categoryId: string) => {
		setFormData({ ...formData, category_id: categoryId, attributes: {} });
	};

	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: {
				distance: 8,
			},
		}),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		}),
	);
	const confirmDelete = (account: GameAccount) => {
		setAccountToDelete(account);
	};

	const executeDelete = async () => {
		if (!accountToDelete) return;

		setDeletingId(String(accountToDelete.id));

		try {
			await accountService.delete(String(accountToDelete.id));

			toast({
				title: "Đã xóa thành công",
				description: `Đã xóa tài khoản #${accountToDelete.id}`,
				className: "bg-green-600 text-white border-none",
			});
			loadAccounts(currentPage);
		} catch (error) {
			toast({
				title: "Xóa thất bại",
				variant: "destructive",
			});
		} finally {
			setDeletingId(null);
			setAccountToDelete(null);
		}
	};

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;

		if (over && active.id !== over.id) {
			setPreviewImages((items) => {
				const oldIndex = items.findIndex(
					(item) => item.id === active.id,
				);
				const newIndex = items.findIndex((item) => item.id === over.id);

				const currentThumbnailItem = items[formData.thumbnailIndex];
				const newItems = arrayMove(items, oldIndex, newIndex);

				const newThumbnailIndex = newItems.findIndex(
					(item) => item.id === currentThumbnailItem.id,
				);

				if (
					newThumbnailIndex !== -1 &&
					newThumbnailIndex !== formData.thumbnailIndex
				) {
					setFormData((prev) => ({
						...prev,
						thumbnailIndex: newThumbnailIndex,
					}));
				}

				return newItems;
			});
		}
	};

	const loadAccounts = async (page: number) => {
		try {
			setIsLoading(true);
			const res = await accountService.getAll({
				page: page,
				limit: pageSize,
				search: debouncedSearch,
			});

			setAccounts(res.data);
			if (res.paging) {
				setTotalItems(Number(res.paging.total));
				setTotalPages(Math.ceil(Number(res.paging.total) / pageSize));
			}
		} catch (error) {
			toast({ title: "Lỗi tải danh sách", variant: "destructive" });
		} finally {
			setIsLoading(false);
		}
	};
	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedSearch(searchTerm);
		}, 500);

		return () => clearTimeout(timer);
	}, [searchTerm]);

	useEffect(() => {
		setCurrentPage(1);
	}, [debouncedSearch]);

	useEffect(() => {
		loadAccounts(currentPage);
	}, [currentPage, debouncedSearch]);

	const handlePageChange = (page: number) => setCurrentPage(page);

	const handleAttributesChange = (attributes: GameAttributes) => {
		setFormData({ ...formData, attributes });
	};

	const openCreateDialog = () => {
		setEditingAccount(null);
		setFormData(initialFormData);
		setPreviewImages([]);
		setLocalFiles({});
		setImageUrlInput("");
		setIsDialogOpen(true);
	};

	const openEditDialog = async (account: GameAccount) => {
		setEditingAccount(account);
		const thumbnailIndex = account.images.findIndex(
			(img) => img === account.thumbnail,
		);
		setFormData({
			category_id: account.category_id?.toString() || "",
			title: account.title,
			price: String(account.price),
			original_price: account.original_price
				? String(account.original_price)
				: "",
			description: account.description,
			features: account.features ? account.features.join(", ") : "",
			status: account.status,
			attributes: account.attributes || {},
			thumbnailIndex: thumbnailIndex >= 0 ? thumbnailIndex : 0,
			username: "",
			password: "",
			extraData: "",
		});

		const formattedImages: SortablePhoto[] = (account.images || []).map(
			(url) => ({
				id: crypto.randomUUID(),
				url: url,
				mediaType: getMediaType(url),
			}),
		);
		setPreviewImages(formattedImages);
		setLocalFiles({});
		setImageUrlInput("");

		setIsDialogOpen(true);

		try {
			const res = await accountService.getAdminCredentials(account.id);
			if (res.data) {
				setFormData((prev) => ({
					...prev,
					username: res.data.username || "",
					password: res.data.password || "",
					extraData: res.data.extra_data || "",
				}));
			}
		} catch (error) {
			console.error("Không lấy được thông tin mật khẩu", error);
		}
	};

	const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = e.target.files;
		if (!files || files.length === 0) return;

		const newFilesMap = { ...localFiles };
		const newPhotos: SortablePhoto[] = [];

		Array.from(files).forEach((file) => {
			const url = URL.createObjectURL(file);
			newFilesMap[url] = file;

			const isVideo = file.type.startsWith("video/");

			newPhotos.push({
				id: crypto.randomUUID(),
				url: url,
				mediaType: isVideo ? "video" : "image",
			});
		});

		setLocalFiles(newFilesMap);
		setPreviewImages((prev) => [...prev, ...newPhotos]);
		e.target.value = "";
	};

	const handleAddImageUrl = () => {
		if (!imageUrlInput.trim()) return;

		const input = imageUrlInput.trim();
		let urlsToAdd: string[] = [];

		try {
			const parsed = JSON.parse(input);
			if (Array.isArray(parsed)) {
				urlsToAdd = parsed
					.map((url) => String(url).trim())
					.filter(Boolean);
			} else {
				urlsToAdd = [input];
			}
		} catch (e) {
			urlsToAdd = [input];
		}

		if (urlsToAdd.length > 0) {
			const newPhotos: SortablePhoto[] = urlsToAdd.map((url) => ({
				id: crypto.randomUUID(),
				url: url,
				mediaType: getMediaType(url),
			}));

			setPreviewImages((prev) => [...prev, ...newPhotos]);
			setImageUrlInput("");
		}
	};
	const removeImage = (index: number) => {
		const itemToRemove = previewImages[index];
		setPreviewImages(previewImages.filter((_, i) => i !== index));

		if (itemToRemove.url.startsWith("blob:")) {
			const newLocalFiles = { ...localFiles };
			delete newLocalFiles[itemToRemove.url];
			setLocalFiles(newLocalFiles);
			URL.revokeObjectURL(itemToRemove.url);
		}

		if (index === formData.thumbnailIndex) {
			setFormData({ ...formData, thumbnailIndex: 0 });
		} else if (index < formData.thumbnailIndex) {
			setFormData({
				...formData,
				thumbnailIndex: formData.thumbnailIndex - 1,
			});
		}
	};

	const setThumbnail = (index: number) => {
		setFormData({ ...formData, thumbnailIndex: index });
	};

	const uploadFiles = async (
		filesToUpload: { url: string; index: number; id: string }[],
		localFiles: Record<string, File>,
		onProgress: (id: string, percent: number) => void,
	) => {
		const results: { index: number; url: string }[] = [];
		const BATCH_SIZE = 5;

		for (let i = 0; i < filesToUpload.length; i += BATCH_SIZE) {
			const batch = filesToUpload.slice(i, i + BATCH_SIZE);
			await Promise.all(
				batch.map(async (item) => {
					const file = localFiles[item.url];
					onProgress(item.id, 0);
					try {
						const fileUrl = await accountService.uploadImageDirect(
							file,
							(percent) => onProgress(item.id, percent),
						);
						onProgress(item.id, 100);
						results.push({ index: item.index, url: fileUrl });
					} catch (error) {
						console.error("Upload failed", error);
						throw error;
					}
				}),
			);
		}
		return results;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);
		setUploadProgress({ current: 0, total: 0 });
		setImageProgressMap({});

		try {
			if (
				formData.original_price &&
				Number(formData.original_price) < Number(formData.price)
			) {
				throw new Error("Giá gốc phải lớn hơn hoặc bằng Giá bán");
			}
			const filesToUpload = previewImages
				.map((img, index) => ({ ...img, index }))
				.filter(
					(item) =>
						item.url.startsWith("blob:") && localFiles[item.url],
				);

			setUploadProgress({ current: 0, total: filesToUpload.length });

			const finalImageUrls = previewImages.map((img) =>
				img.url.startsWith("blob:") ? "" : img.url,
			);

			if (!editingAccount) {
				const createPayload = {
					category_id: Number(formData.category_id),
					title: formData.title,
					price: Number(formData.price),
					original_price: formData.original_price
						? Number(formData.original_price)
						: undefined,
					description: formData.description,
					features: formData.features
						.split(",")
						.map((f) => f.trim())
						.filter(Boolean),
					attributes: formData.attributes,

					images: [],
					thumbnail: "",
					status: AccountStatus.Deleted,

					username: formData.username,
					password: formData.password,
					extra_data: formData.extraData,
				};

				const res = await accountService.create(createPayload);
				const newAccountId = res.data;

				if (!newAccountId)
					throw new Error("Không lấy được ID tài khoản mới");

				if (filesToUpload.length > 0) {
					const uploadedResults = await uploadFiles(
						filesToUpload,
						localFiles,
						(id, percent) => {
							setImageProgressMap((prev) => ({
								...prev,
								[id]: percent,
							}));

							if (percent === 100) {
								setUploadProgress((prev) => ({
									...prev,
									current: prev.current + 1,
								}));
							}
						},
					);

					uploadedResults.forEach((res) => {
						finalImageUrls[res.index] = res.url;
					});
				}

				const thumbnailImage =
					finalImageUrls[formData.thumbnailIndex] ||
					finalImageUrls[0] ||
					"";

				await accountService.update(
					String(newAccountId),
					{
						images: finalImageUrls.filter(Boolean),
						thumbnail: thumbnailImage,
						status: formData.status,
					},
					0,
				);

				toast({ title: "Thêm mới thành công" });
			} else {
				if (filesToUpload.length > 0) {
					const uploadedResults = await uploadFiles(
						filesToUpload,
						localFiles,
						(id, percent) =>
							setImageProgressMap((prev) => ({
								...prev,
								[id]: percent,
							})),
					);
					uploadedResults.forEach((res) => {
						finalImageUrls[res.index] = res.url;
					});
				}

				const thumbnailImage =
					finalImageUrls[formData.thumbnailIndex] ||
					finalImageUrls[0] ||
					"";

				await accountService.update(
					editingAccount.id,
					{
						category_id: Number(formData.category_id),
						title: formData.title,
						price: Number(formData.price),
						original_price: formData.original_price
							? Number(formData.original_price)
							: undefined,
						description: formData.description,
						features: formData.features
							.split(",")
							.map((f) => f.trim())
							.filter(Boolean),
						attributes: formData.attributes,
						status: formData.status,
						images: finalImageUrls.filter(Boolean),
						thumbnail: thumbnailImage,

						username: formData.username,
						password: formData.password,
						extra_data: formData.extraData,
					},
					editingAccount.version,
				);

				toast({ title: "Cập nhật thành công" });
			}

			loadAccounts(currentPage);
			setIsDialogOpen(false);
		} catch (error: any) {
			console.error(error);
			toast({
				title: "Lỗi xử lý",
				description:
					error.message || "Upload hoặc lưu dữ liệu thất bại",
				variant: "destructive",
			});
		} finally {
			setIsSubmitting(false);
			setUploadProgress({ current: 0, total: 0 });
			setImageProgressMap({});
		}
	};

	const getStatusBadge = (status: any) => {
		switch (Number(status)) {
			case AccountStatus.Available:
				return (
					<Badge
						variant="outline"
						className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20 gap-1.5 pl-1.5 pr-2.5"
					>
						<CheckCircle2 className="w-3.5 h-3.5" />
						Còn hàng
					</Badge>
				);
			case AccountStatus.Reserved:
				return (
					<Badge
						variant="outline"
						className="bg-orange-500/10 text-orange-600 border-orange-500/20 hover:bg-orange-500/20 gap-1.5 pl-1.5 pr-2.5"
					>
						<Clock className="w-3.5 h-3.5" />
						Đã đặt cọc
					</Badge>
				);
			case AccountStatus.Sold:
				return (
					<Badge
						variant="outline"
						className="bg-blue-600/10 text-blue-600 border-blue-600/20 hover:bg-blue-600/20 gap-1.5 pl-1.5 pr-2.5"
					>
						<Banknote className="w-3.5 h-3.5" />
						Đã bán
					</Badge>
				);
			case AccountStatus.Deleted:
				return (
					<Badge
						variant="outline"
						className="bg-gray-500/10 text-gray-500 border-gray-500/20 hover:bg-gray-500/20 gap-1.5 pl-1.5 pr-2.5"
					>
						<Ban className="w-3.5 h-3.5" />
						Đã xóa
					</Badge>
				);
			default:
				return null;
		}
	};

	return (
		<div className="p-4 md:p-6 space-y-4 md:space-y-6 max-w-[100vw] overflow-x-hidden">
			{/* Header */}
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
				<motion.div
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					className="mt-6 md:mt-0"
				>
					<h1 className="font-gaming text-3xl md:text-4xl font-extrabold tracking-tight">
						<span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
							Quản Lý Acc
						</span>
					</h1>
					<div className="h-1 w-12 bg-primary rounded-full mt-1 hidden md:block" />
					<p className="text-xs md:text-sm text-muted-foreground mt-2 font-medium opacity-80">
						Thêm, sửa, xóa acc game trong shop
					</p>
				</motion.div>

				<div className="flex gap-2 w-full md:w-auto">
					<div className="relative flex-1 md:w-64">
						<Input
							type="text"
							placeholder="Tìm kiếm..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="pl-3 md:pl-4 input-gaming w-full"
						/>
					</div>
					<Button
						className="btn-gaming gap-2 shrink-0"
						onClick={openCreateDialog}
					>
						<Plus className="h-4 w-4" />
						<span className="hidden md:inline">Thêm Acc</span>
					</Button>
				</div>
			</div>

			{/* --- DANH SÁCH TÀI KHOẢN (Responsive switch) --- */}

			{/* VIEW 1: Cards cho Mobile */}
			{isLoading ? (
				<AccountsSkeleton />
			) : (
				<>
					{/* VIEW 1: Cards cho Mobile */}
					<div className="grid grid-cols-1 gap-4 md:hidden">
						{accounts.length === 0 ? (
							<div className="text-center p-8 text-muted-foreground border border-dashed rounded-xl">
								Không tìm thấy tài khoản nào.
							</div>
						) : (
							accounts.map((account) => (
								<div
									key={account.id}
									className="bg-card rounded-xl p-3 border border-border shadow-sm flex gap-3"
								>
									{/* Thumbnail */}
									<div className="w-20 h-20 shrink-0 rounded-lg overflow-hidden border border-border bg-secondary">
										{account.thumbnail ? (
											<img
												src={account.thumbnail}
												alt=""
												className="w-full h-full object-cover"
											/>
										) : (
											<div className="w-full h-full flex items-center justify-center">
												<ImageIcon className="h-6 w-6 text-muted-foreground/50" />
											</div>
										)}
									</div>

									{/* Info */}
									<div className="flex-1 min-w-0 flex flex-col justify-between">
										<div>
											<div className="flex justify-between items-start">
												<span className="text-[10px] font-bold uppercase text-primary tracking-wider">
													{account.category?.name ||
														getGameName(
															account.category_id,
														)}
												</span>
												<span className="text-xs text-muted-foreground">
													#{account.id}
												</span>
											</div>
											<h3 className="font-medium text-sm truncate pr-2 mt-0.5">
												{account.title}
											</h3>
										</div>

										<div className="flex items-end justify-between mt-2">
											<div className="flex flex-col gap-1">
												<span className="font-gaming text-emerald-500 font-bold">
													{formatCurrency(
														account.price,
													)}
												</span>
												{getStatusBadge(account.status)}
											</div>

											{/* Mobile Actions */}
											<DropdownMenu>
												<DropdownMenuTrigger asChild>
													<Button
														variant="ghost"
														size="icon"
														className="h-8 w-8"
													>
														<MoreVertical className="h-4 w-4" />
													</Button>
												</DropdownMenuTrigger>
												<DropdownMenuContent align="end">
													<DropdownMenuItem
														onClick={() =>
															openEditDialog(
																account,
															)
														}
													>
														<Pencil className="mr-2 h-4 w-4" />{" "}
														Sửa
													</DropdownMenuItem>
													<DropdownMenuItem
														className="text-destructive focus:text-destructive cursor-pointer"
														onClick={() =>
															confirmDelete(
																account,
															)
														}
													>
														<Trash2 className="mr-2 h-4 w-4" />{" "}
														Xóa
													</DropdownMenuItem>
												</DropdownMenuContent>
											</DropdownMenu>
										</div>
									</div>
								</div>
							))
						)}
					</div>

					{/* VIEW 2: Table cho Desktop */}
					<div className="hidden md:block rounded-xl border border-border overflow-hidden bg-card">
						<table className="w-full text-sm">
							<thead className="bg-secondary/50 border-b border-border">
								<tr>
									<th className="px-4 py-3 text-left font-medium">
										Hình ảnh
									</th>
									<th className="px-4 py-3 text-left font-medium">
										ID / Game
									</th>
									<th className="px-4 py-3 text-left font-medium">
										Tiêu đề
									</th>
									<th className="px-4 py-3 text-left font-medium">
										Giá bán
									</th>
									<th className="px-4 py-3 text-left font-medium">
										Trạng thái
									</th>
									<th className="px-4 py-3 text-right font-medium">
										Thao tác
									</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-border">
								{accounts.length === 0 ? (
									<tr>
										<td
											colSpan={6}
											className="h-32 text-center text-muted-foreground"
										>
											Không có dữ liệu hiển thị
										</td>
									</tr>
								) : (
									accounts.map((account) => (
										<tr
											key={account.id}
											className="hover:bg-secondary/30 transition-colors"
										>
											<td className="px-4 py-3">
												<div className="w-12 h-12 rounded-lg bg-secondary/50 border border-border overflow-hidden">
													{account.thumbnail && (
														<img
															src={
																account.thumbnail
															}
															className="w-full h-full object-cover"
														/>
													)}
												</div>
											</td>
											<td className="px-4 py-3">
												<div className="font-medium text-primary">
													#{account.id}
												</div>
												<div className="text-xs text-muted-foreground">
													{account.category?.name ||
														getGameName(
															account.category_id,
														)}
												</div>
											</td>
											<td
												className="px-4 py-3 max-w-[200px] truncate"
												title={account.title}
											>
												{account.title}
											</td>
											<td className="px-4 py-3 font-gaming text-emerald-500 font-medium">
												{formatCurrency(account.price)}
											</td>
											<td className="px-4 py-3">
												{getStatusBadge(account.status)}
											</td>
											<td className="px-4 py-3 text-right">
												<div className="flex justify-end gap-1">
													<Button
														variant="ghost"
														size="icon"
														onClick={() =>
															openEditDialog(
																account,
															)
														}
													>
														<Pencil className="h-4 w-4" />
													</Button>
													<Button
														variant="ghost"
														size="icon"
														className="text-destructive hover:bg-destructive/10 hover:text-destructive"
														onClick={() =>
															confirmDelete(
																account,
															)
														}
														disabled={
															deletingId ===
															String(account.id)
														}
													>
														{deletingId ===
														String(account.id) ? (
															<Loader2 className="h-4 w-4 animate-spin" />
														) : (
															<Trash2 className="h-4 w-4" />
														)}
													</Button>
												</div>
											</td>
										</tr>
									))
								)}
							</tbody>
						</table>
					</div>
				</>
			)}

			{/* Pagination */}
			{!isLoading && totalItems > 0 && (
				<div className="mt-4">
					<PaginationWrapper
						currentPage={currentPage}
						totalPages={totalPages}
						totalItems={totalItems}
						onPageChange={handlePageChange}
						pageSize={pageSize}
					/>
				</div>
			)}

			{/* --- FORM DIALOG (Responsive: Fullscreen on mobile) --- */}
			<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
				{/* Thay đổi class DialogContent: w-full h-full trên mobile */}
				<DialogContent className="w-screen h-[100dvh] max-w-none rounded-none md:h-[90vh] md:max-w-5xl md:rounded-xl p-0 flex flex-col gap-0 bg-background">
					{/* Header: Sticky */}
					<DialogHeader className="px-4 py-3 md:p-6 border-b border-border shrink-0 flex flex-row items-center justify-between space-y-0">
						<div>
							<DialogTitle className="font-gaming text-lg md:text-2xl">
								{editingAccount
									? "Chỉnh sửa Acc"
									: "Thêm Acc Mới"}
							</DialogTitle>
							<DialogDescription className="hidden md:block text-xs md:text-sm">
								Nhập thông tin chi tiết cho tài khoản
							</DialogDescription>
						</div>
					</DialogHeader>

					{/* Body: Scrollable */}
					<div className="flex-1 overflow-y-auto p-4 md:p-6 scrollbar-thin">
						<form
							id="account-form"
							onSubmit={handleSubmit}
							className="space-y-6 md:space-y-8 pb-20 md:pb-0"
						>
							<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
								<div className="space-y-4 md:space-y-6">
									<div className="bg-secondary/10 p-4 rounded-lg border border-border/60 h-fit">
										<h3 className="font-semibold text-primary mb-4 flex items-center gap-2">
											<div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
												1
											</div>
											Thông tin cơ bản
										</h3>
										<div className="space-y-4">
											<GameSelector
												value={formData.category_id}
												onChange={handleGameChange}
											/>
											<div className="space-y-1.5">
												<Label>
													Tiêu đề{" "}
													<span className="text-destructive">
														*
													</span>
												</Label>
												<Input
													value={formData.title}
													onChange={(e) =>
														setFormData({
															...formData,
															title: e.target
																.value,
														})
													}
													required
												/>
											</div>
											<div className="grid grid-cols-2 gap-4">
												<div className="space-y-1.5">
													<Label>Giá bán</Label>
													<Input
														value={
															formData.price
																? formData.price
																		.toString()
																		.replace(
																			/\B(?=(\d{3})+(?!\d))/g,
																			".",
																		)
																: ""
														}
														onChange={(e) => {
															const raw =
																e.target.value.replace(
																	/\./g,
																	"",
																);
															if (
																!isNaN(
																	Number(raw),
																)
															)
																setFormData({
																	...formData,
																	price: raw,
																});
														}}
														className="text-emerald-500 font-bold"
														placeholder="0"
														inputMode="numeric"
													/>
												</div>
												<div className="space-y-1.5">
													<Label>Giá gốc</Label>
													<Input
														value={
															formData.original_price
																? formData.original_price
																		.toString()
																		.replace(
																			/\B(?=(\d{3})+(?!\d))/g,
																			".",
																		)
																: ""
														}
														onChange={(e) => {
															const raw =
																e.target.value.replace(
																	/\./g,
																	"",
																);
															if (
																raw === "" ||
																!isNaN(
																	Number(raw),
																)
															)
																setFormData({
																	...formData,
																	original_price:
																		raw,
																});
														}}
														placeholder="0"
														inputMode="numeric"
													/>
												</div>
											</div>
											<div className="space-y-1.5">
												<Label>Trạng thái</Label>
												<Select
													value={formData.status.toString()}
													onValueChange={(val) =>
														setFormData({
															...formData,
															status: Number(
																val,
															) as AccountStatus,
														})
													}
												>
													<SelectTrigger>
														<SelectValue />
													</SelectTrigger>
													<SelectContent>
														<SelectItem
															value={AccountStatus.Available.toString()}
														>
															Còn hàng
														</SelectItem>
														<SelectItem
															value={AccountStatus.Reserved.toString()}
														>
															Đã đặt cọc
														</SelectItem>
														<SelectItem
															value={AccountStatus.Sold.toString()}
														>
															Đã bán
														</SelectItem>
														<SelectItem
															value={AccountStatus.Deleted.toString()}
														>
															Ẩn / Đã xóa
														</SelectItem>
													</SelectContent>
												</Select>
											</div>
										</div>
									</div>

									<div className="bg-secondary/10 p-4 rounded-lg border border-border/60 h-fit">
										<h3 className="font-semibold text-primary mb-4 flex items-center gap-2">
											<div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
												2
											</div>
											Thuộc tính Game
										</h3>
										<DynamicAttributesForm
											schema={currentSchema}
											attributes={formData.attributes}
											onChange={handleAttributesChange}
										/>
									</div>
								</div>

								<div className="space-y-4 md:space-y-6">
									<div className="bg-secondary/10 p-4 rounded-lg border border-border/60">
										<h3 className="font-semibold text-primary mb-4 flex items-center gap-2">
											<div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
												<Lock className="h-3 w-3" />
											</div>
											Thông tin đăng nhập (Ẩn)
										</h3>
										<div className="space-y-4">
											<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
												<div className="space-y-1.5">
													<Label>
														Tài khoản / Username
													</Label>
													<Input
														value={
															formData.username
														}
														onChange={(e) =>
															setFormData({
																...formData,
																username:
																	e.target
																		.value,
															})
														}
														placeholder="Tên đăng nhập game..."
														className="font-mono"
													/>
												</div>
												<div className="space-y-1.5 relative">
													<Label>Mật khẩu</Label>
													<div className="relative">
														<Input
															value={
																formData.password
															}
															onChange={(e) =>
																setFormData({
																	...formData,
																	password:
																		e.target
																			.value,
																})
															}
															placeholder="Mật khẩu..."
															className="font-mono"
															type="text"
														/>
													</div>
												</div>
											</div>
											<div className="space-y-1.5">
												<Label>
													Thông tin thêm (2FA, Email,
													Note)
												</Label>
												<Textarea
													value={formData.extraData}
													onChange={(e) =>
														setFormData({
															...formData,
															extraData:
																e.target.value,
														})
													}
													placeholder="Ví dụ: Mã 2FA, Email khôi phục, Câu hỏi bảo mật..."
													className="font-mono text-xs h-20"
												/>
											</div>
											<div className="flex items-center gap-2 p-3 bg-yellow-500/10 text-yellow-600 rounded text-xs border border-yellow-500/20">
												<Lock className="h-4 w-4 shrink-0" />
												<span>
													Thông tin này được mã hóa và
													chỉ hiển thị cho người mua
													sau khi thanh toán thành
													công.
												</span>
											</div>
										</div>
									</div>

									<div className="bg-secondary/10 p-4 rounded-lg border border-border/60">
										<h3 className="font-semibold text-primary mb-4 flex items-center gap-2">
											<div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
												3
											</div>
											Nội dung mô tả
										</h3>
										<div className="space-y-4">
											<div className="space-y-1.5">
												<Label>Tags / Highlight</Label>
												<Input
													value={formData.features}
													onChange={(e) =>
														setFormData({
															...formData,
															features:
																e.target.value,
														})
													}
													placeholder="VD: Full Skin, Rank Cao..."
												/>
											</div>
											<div className="space-y-1.5">
												<Label>Mô tả chi tiết</Label>
												<Textarea
													value={formData.description}
													onChange={(e) =>
														setFormData({
															...formData,
															description:
																e.target.value,
														})
													}
													required
													className="min-h-[150px] md:min-h-[220px]"
												/>
											</div>
										</div>
									</div>
								</div>
							</div>

							<div className="bg-secondary/10 p-4 md:p-6 rounded-lg border border-border/60">
								<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
									<h3 className="font-semibold text-primary flex items-center gap-2 text-lg">
										<div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
											4
										</div>
										Hình ảnh & Video
									</h3>

									<div className="flex items-center gap-2 w-full md:w-auto">
										<Input
											value={imageUrlInput}
											onChange={(e) =>
												setImageUrlInput(e.target.value)
											}
											placeholder="Dán link ảnh..."
											className="text-sm bg-background"
										/>
										<Button
											type="button"
											onClick={handleAddImageUrl}
											variant="secondary"
											className="shrink-0"
										>
											<Plus className="h-4 w-4 mr-1" />{" "}
											Thêm link
										</Button>
									</div>
								</div>

								<div className="min-h-[120px]">
									<div className="flex items-center justify-between mb-2">
										<span className="text-xs text-muted-foreground">
											Kéo thả để sắp xếp vị trí • Ảnh đầu
											tiên sẽ là ảnh bìa
										</span>
										<span className="text-xs font-medium bg-background px-2 py-1 rounded border">
											{previewImages.length} items
										</span>
									</div>

									<DndContext
										sensors={sensors}
										collisionDetection={closestCenter}
										onDragEnd={handleDragEnd}
									>
										<SortableContext
											items={previewImages}
											strategy={rectSortingStrategy}
										>
											<div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3 md:gap-4">
												{previewImages.map(
													(img, index) => (
														<SortableImage
															key={img.id}
															id={img.id}
															url={img.url}
															mediaType={
																img.mediaType
															}
															isThumbnail={
																index ===
																formData.thumbnailIndex
															}
															progress={
																imageProgressMap[
																	img.id
																]
															}
															onRemove={() =>
																removeImage(
																	index,
																)
															}
															onSetThumbnail={() =>
																setThumbnail(
																	index,
																)
															}
														/>
													),
												)}

												<label className="aspect-square rounded-xl border-2 border-dashed border-border hover:border-primary/50 cursor-pointer flex flex-col items-center justify-center gap-2 hover:bg-primary/5 transition-all bg-background/50 group">
													<input
														type="file"
														accept="image/*,video/*"
														multiple
														onChange={
															handleImageSelect
														}
														className="hidden"
													/>
													<div className="p-3 rounded-full bg-secondary group-hover:bg-primary/10 transition-colors">
														<Upload className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
													</div>
													<span className="text-xs text-muted-foreground font-medium group-hover:text-primary transition-colors">
														Upload
													</span>
												</label>
											</div>
										</SortableContext>
									</DndContext>
								</div>
							</div>
						</form>
					</div>

					<div className="p-4 border-t border-border bg-background shrink-0 flex justify-end gap-3 safe-area-bottom">
						<Button
							type="button"
							variant="outline"
							onClick={() => setIsDialogOpen(false)}
							disabled={isSubmitting}
							className="hidden md:inline-flex"
						>
							Hủy
						</Button>
						<Button
							type="submit"
							form="account-form"
							className="btn-gaming w-full md:w-auto min-w-[140px]"
							disabled={isSubmitting || !formData.category_id}
						>
							{isSubmitting && (
								<Loader2 className="animate-spin mr-2 h-4 w-4" />
							)}
							{isSubmitting
								? uploadProgress.total > 0
									? `Đang tải ${uploadProgress.current}/${uploadProgress.total}`
									: "Đang xử lý..."
								: editingAccount
									? "Lưu thay đổi"
									: "Tạo tài khoản"}
						</Button>
					</div>
				</DialogContent>
			</Dialog>
			<Dialog
				open={!!accountToDelete}
				onOpenChange={(open) => !open && setAccountToDelete(null)}
			>
				<DialogContent className="sm:max-w-[400px] p-0 gap-0 overflow-hidden border-0">
					<div className="bg-destructive/10 p-6 flex flex-col items-center justify-center gap-4 border-b border-destructive/20">
						<div className="p-3 bg-destructive/20 rounded-full animate-in zoom-in duration-300">
							<div className="p-2 bg-destructive text-destructive-foreground rounded-full shadow-lg">
								<Trash2 className="h-6 w-6" />
							</div>
						</div>
						<div className="text-center space-y-1">
							<DialogTitle className="text-xl font-bold text-destructive">
								Xác nhận xóa?
							</DialogTitle>
							<DialogDescription className="text-center max-w-[280px] mx-auto">
								Hành động này không thể hoàn tác. Nếu xóa sẽ xóa
								các order liên quan(nếu có).
							</DialogDescription>
						</div>
					</div>

					<div className="p-6 bg-background space-y-4">
						<div className="bg-secondary/50 rounded-lg p-3 text-sm border border-border">
							<div className="flex justify-between items-center mb-1">
								<span className="text-muted-foreground">
									Tài khoản:
								</span>
								<span className="font-mono font-bold text-primary">
									#{accountToDelete?.id}
								</span>
							</div>
							<div className="font-medium text-primary truncate">
								{accountToDelete?.title}
							</div>
							<div className="text-right text-xs text-muted-foreground mt-1">
								Game:{" "}
								{accountToDelete?.category?.name ||
									getGameName(accountToDelete?.category_id)}
							</div>
						</div>

						{/* Buttons */}
						<div className="grid grid-cols-2 gap-3">
							<Button
								variant="outline"
								onClick={() => setAccountToDelete(null)}
								className="hover:bg-secondary"
							>
								Hủy bỏ
							</Button>
							<Button
								variant="destructive"
								onClick={executeDelete}
								disabled={!!deletingId}
								className="font-bold shadow-sm"
							>
								{deletingId ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Đang xóa...
									</>
								) : (
									"Xác nhận xóa"
								)}
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}
