import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
	Plus,
	Pencil,
	Trash2,
	X,
	Upload,
	Loader2,
	Link as LinkIcon,
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
import { formatCurrency, formatDate } from "@/utils/format";
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
}

export function SortableImage({
	id,
	url,
	isThumbnail,
	onRemove,
	onSetThumbnail,
	progress,
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
			className={`relative aspect-square rounded-lg overflow-hidden group cursor-move transition-all ${
				isThumbnail
					? "ring-2 ring-primary ring-offset-2 ring-offset-background"
					: "hover:ring-2 hover:ring-muted-foreground/50"
			}`}
		>
			<img
				src={url}
				alt=""
				className={`w-full h-full object-cover select-none ${
					isUploading ? "brightness-50 blur-[1px]" : ""
				}`}
			/>

			{isUploading && (
				<div className="absolute inset-0 flex items-center justify-center z-30 bg-black/40">
					<CircularProgress value={progress} />
				</div>
			)}

			{isThumbnail && (
				<div className="absolute top-2 left-2 px-2 py-1 rounded bg-primary text-primary-foreground text-xs font-medium z-10">
					Thumbnail
				</div>
			)}

			{!isUploading && (
				<button
					type="button"
					onPointerDown={(e) => e.stopPropagation()}
					onClick={(e) => {
						e.stopPropagation();
						onRemove();
					}}
					className="absolute top-1 right-1 p-1.5 rounded-full bg-destructive/90 text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive z-20"
				>
					<X className="h-3.5 w-3.5" />
				</button>
			)}

			{!isThumbnail && !isUploading && (
				<div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
					<button
						type="button"
						onClick={(e) => {
							e.stopPropagation();
							onSetThumbnail();
						}}
						className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600/90 text-white text-xs font-semibold rounded-md shadow-md hover:bg-emerald-600"
					>
						Set thumbnail
					</button>
				</div>
			)}
		</div>
	);
}

interface FormData {
	gameName: string;
	title: string;
	price: string;
	original_price: string;
	description: string;
	features: string;
	status: "available" | "reserved" | "delivered" | "deleted" | "sold";
	attributes: GameAttributes;
	thumbnailIndex: number;
}

type SortablePhoto = {
	id: string;
	url: string;
};

const initialFormData: FormData = {
	gameName: "",
	title: "",
	price: "",
	original_price: "",
	description: "",
	features: "",
	status: "available",
	attributes: {},
	thumbnailIndex: 0,
};

export default function AdminAccounts() {
	const [accounts, setAccounts] = useState<GameAccount[]>([]);
	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [totalItems, setTotalItems] = useState(0);
	const [searchTerm, setSearchTerm] = useState("");
	const [debouncedSearch, setDebouncedSearch] = useState("");
	const pageSize = 10;

	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [editingAccount, setEditingAccount] = useState<GameAccount | null>(
		null
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

	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: {
				distance: 8,
			},
		}),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		})
	);

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;

		if (over && active.id !== over.id) {
			setPreviewImages((items) => {
				const oldIndex = items.findIndex(
					(item) => item.id === active.id
				);
				const newIndex = items.findIndex((item) => item.id === over.id);

				const currentThumbnailItem = items[formData.thumbnailIndex];
				const newItems = arrayMove(items, oldIndex, newIndex);

				const newThumbnailIndex = newItems.findIndex(
					(item) => item.id === currentThumbnailItem.id
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
	const currentSchema = getGameSchema(formData.gameName);

	const handleGameChange = (gameName: string) => {
		setFormData({ ...formData, gameName, attributes: {} });
	};

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

	const openEditDialog = (account: GameAccount) => {
		setEditingAccount(account);
		const thumbnailIndex = account.images.findIndex(
			(img) => img === account.thumbnail
		);
		setFormData({
			gameName: account.game_name || "",
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
		});

		const formattedImages = (account.images || []).map((url) => ({
			id: crypto.randomUUID(),
			url: url,
		}));
		setPreviewImages(formattedImages);
		setLocalFiles({});
		setImageUrlInput("");
		setIsDialogOpen(true);
	};

	const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = e.target.files;
		if (!files || files.length === 0) return;

		const newFilesMap = { ...localFiles };
		const newPhotos: SortablePhoto[] = [];

		Array.from(files).forEach((file) => {
			const url = URL.createObjectURL(file);
			newFilesMap[url] = file;

			newPhotos.push({
				id: crypto.randomUUID(),
				url: url,
			});
		});

		setLocalFiles(newFilesMap);
		setPreviewImages((prev) => [...prev, ...newPhotos]);
		e.target.value = "";
	};

	const handleAddImageUrl = () => {
		if (imageUrlInput.trim()) {
			setPreviewImages([
				...previewImages,
				{
					id: crypto.randomUUID(),
					url: imageUrlInput.trim(),
				},
			]);
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

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);
		setUploadProgress({ current: 0, total: 0 });
		setImageProgressMap({});

		try {
			const filesToUpload = previewImages
				.map((img, index) => ({ ...img, index }))
				.filter(
					(item) =>
						item.url.startsWith("blob:") && localFiles[item.url]
				);

			setUploadProgress({ current: 0, total: filesToUpload.length });

			const finalImageUrls = previewImages.map((img) => img.url);

			const BATCH_SIZE = 3;

			for (let i = 0; i < filesToUpload.length; i += BATCH_SIZE) {
				const batch = filesToUpload.slice(i, i + BATCH_SIZE);

				const batchResults = await Promise.allSettled(
					batch.map(async (item) => {
						const file = localFiles[item.url];

						setImageProgressMap((prev) => ({
							...prev,
							[item.id]: 0,
						}));

						try {
							const fileUrl =
								await accountService.uploadImageDirect(
									file,
									(percent) => {
										setImageProgressMap((prev) => ({
											...prev,
											[item.id]: percent,
										}));
									}
								);

							setImageProgressMap((prev) => ({
								...prev,
								[item.id]: 100,
							}));

							finalImageUrls[item.index] = fileUrl;
							return fileUrl;
						} catch (err) {
							console.error(
								"Image upload error at index",
								item.index,
								err
							);
							setImageProgressMap((prev) => {
								const newState = { ...prev };
								delete newState[item.id];
								return newState;
							});
							throw err;
						}
					})
				);

				const failedUploads = batchResults.filter(
					(r) => r.status === "rejected"
				);
				if (failedUploads.length > 0) {
					throw new Error(
						`${failedUploads.length} image upload(s) failed.`
					);
				}

				setUploadProgress((prev) => ({
					...prev,
					current: Math.min(prev.total, i + BATCH_SIZE),
				}));
			}

			const cleanedImageUrls = finalImageUrls.filter(
				(url) =>
					url && typeof url === "string" && !url.startsWith("blob:")
			);

			const thumbnailImage =
				cleanedImageUrls[formData.thumbnailIndex] ||
				cleanedImageUrls[0] ||
				"";

			const payload = {
				game_name: formData.gameName,
				title: formData.title,
				price: Number(formData.price),
				original_price: formData.original_price
					? Number(formData.original_price)
					: undefined,
				description: formData.description,
				status: formData.status,
				rank: (formData.attributes.rank as string) || "",
				level: Number(formData.attributes.level || 0),
				server: (formData.attributes.server as string) || "",
				attributes: formData.attributes,
				images: cleanedImageUrls,
				thumbnail: thumbnailImage,
				features: formData.features
					.split(",")
					.map((f) => f.trim())
					.filter(Boolean),
			};

			if (editingAccount) {
				await accountService.update(editingAccount.id, payload);
				toast({ title: "Cập nhật thành công" });
			} else {
				await accountService.create(payload);
				toast({ title: "Thêm mới thành công" });
			}

			loadAccounts(currentPage);
			setIsDialogOpen(false);
		} catch (error: any) {
			toast({
				title: error.message || "Có lỗi xảy ra khi lưu",
				variant: "destructive",
			});
		} finally {
			setIsSubmitting(false);
			setUploadProgress({ current: 0, total: 0 });
			setImageProgressMap({});
		}
	};

	const handleDelete = async (id: string) => {
		if (!confirm("Bạn có chắc chắn muốn xóa tài khoản này?")) return;

		setDeletingId(id);

		try {
			await accountService.delete(id);
			toast({ title: "Đã xóa thành công" });
			loadAccounts(currentPage);
		} catch (error) {
			toast({ title: "Xóa thất bại", variant: "destructive" });
		} finally {
			setDeletingId(null);
		}
	};

	const getStatusBadge = (status: string) => {
		switch (status) {
			case "available":
				return <Badge className="badge-available">Còn hàng</Badge>;
			case "reserved":
				return (
					<Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
						Đang giữ
					</Badge>
				);
			case "sold":
				return <Badge className="badge-sold">Đã bán</Badge>;
			case "deleted":
				return (
					<Badge className="bg-red-500/20 text-red-400 border-red-500/30">
						Đã xóa
					</Badge>
				);
			default:
				return null;
		}
	};

	return (
		<div className="p-6 space-y-6">
			<div>
				<div className="flex items-center justify-between mb-6">
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
					>
						<h1 className="font-gaming text-3xl font-bold mb-2">
							Quản Lý Acc Game
						</h1>
						<p className="text-muted-foreground">
							Thêm, sửa, xóa acc game trong shop
						</p>
					</motion.div>
					<Button
						className="btn-gaming gap-2"
						onClick={openCreateDialog}
					>
						<Plus className="h-4 w-4" />
						Thêm Acc
					</Button>
				</div>

				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.05 }}
					className="mb-6"
				>
					<div className="relative">
						<svg
							className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
							/>
						</svg>
						<Input
							type="text"
							placeholder="Tìm kiếm theo ID hoặc tên acc..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="pl-10 input-gaming"
						/>
					</div>
				</motion.div>
			</div>

			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.1 }}
				className="rounded-xl border border-border overflow-hidden"
			>
				<div className="overflow-x-auto">
					<table className="w-full">
						<thead className="bg-secondary">
							<tr>
								<th className="px-4 py-3 text-left text-sm font-medium">
									Thumbnail
								</th>
								<th className="px-4 py-3 text-left text-sm font-medium">
									ID
								</th>
								<th className="px-4 py-3 text-left text-sm font-medium">
									Game
								</th>
								<th className="px-4 py-3 text-left text-sm font-medium">
									Tiêu đề
								</th>
								<th className="px-4 py-3 text-left text-sm font-medium">
									Giá
								</th>
								<th className="px-4 py-3 text-left text-sm font-medium">
									Trạng thái
								</th>
								<th className="px-4 py-3 text-left text-sm font-medium">
									Ngày tạo
								</th>
								<th className="px-4 py-3 text-right text-sm font-medium">
									Thao tác
								</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-border">
							{accounts.map((account) => (
								<tr
									key={account.id}
									className="bg-card hover:bg-secondary/50 transition-colors"
								>
									<td className="px-4 py-3">
										<img
											src={account.thumbnail}
											alt={account.title}
											className="w-12 h-12 rounded-lg object-cover"
										/>
									</td>
									<td className="px-4 py-3 text-sm font-medium text-primary">
										{account.id}
									</td>
									<td className="px-4 py-3 font-medium">
										{account.game_name}
									</td>
									<td className="px-4 py-3 text-sm max-w-[200px] truncate">
										{account.title}
									</td>
									<td className="px-4 py-3 font-gaming text-primary">
										{formatCurrency(account.price)}
									</td>
									<td className="px-4 py-3">
										{getStatusBadge(account.status)}
									</td>
									<td className="px-4 py-3 text-sm text-muted-foreground">
										{formatDate(
											account.created_at ||
												account.createdAt
										)}
									</td>
									<td className="px-4 py-3">
										<div className="flex justify-end gap-2">
											<Button
												variant="ghost"
												size="icon"
												onClick={() =>
													openEditDialog(account)
												}
											>
												<Pencil className="h-4 w-4" />
											</Button>
											<Button
												variant="ghost"
												size="icon"
												className="text-destructive hover:text-destructive"
												disabled={
													deletingId === account.id
												}
												onClick={() =>
													handleDelete(account.id)
												}
											>
												{deletingId === account.id ? (
													<Loader2 className="h-4 w-4 animate-spin" />
												) : (
													<Trash2 className="h-4 w-4" />
												)}
											</Button>
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
				<PaginationWrapper
					currentPage={currentPage}
					totalPages={totalPages}
					totalItems={totalItems}
					onPageChange={handlePageChange}
					pageSize={pageSize}
				/>
			</motion.div>

			<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
				<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle className="font-gaming">
							{editingAccount
								? "Chỉnh sửa Acc Game"
								: "Thêm Acc Game Mới"}
						</DialogTitle>
						<DialogDescription>
							Nhập thông tin chi tiết của tài khoản game bên dưới.
						</DialogDescription>
					</DialogHeader>

					<form onSubmit={handleSubmit} className="space-y-6">
						<div className="space-y-4 p-4 rounded-lg bg-secondary/30 border border-border">
							<h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
								Thông tin cơ bản
							</h3>
							<GameSelector
								value={formData.gameName}
								onChange={handleGameChange}
							/>

							<div className="space-y-2">
								<Label htmlFor="title">
									Tiêu đề{" "}
									<span className="text-destructive">*</span>
								</Label>
								<Input
									id="title"
									value={formData.title}
									onChange={(e) =>
										setFormData({
											...formData,
											title: e.target.value,
										})
									}
									required
								/>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="price">
										Giá (VNĐ){" "}
										<span className="text-destructive">
											*
										</span>
									</Label>
									<Input
										id="price"
										type="number"
										value={formData.price}
										onChange={(e) =>
											setFormData({
												...formData,
												price: e.target.value,
											})
										}
										required
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="originalPrice">
										Giá gốc (VNĐ)
									</Label>
									<Input
										id="originalPrice"
										type="number"
										value={formData.original_price}
										onChange={(e) =>
											setFormData({
												...formData,
												original_price: e.target.value,
											})
										}
									/>
								</div>
							</div>

							<div className="space-y-2">
								<Label>Trạng thái</Label>
								<Select
									value={formData.status}
									onValueChange={(
										value:
											| "available"
											| "reserved"
											| "delivered"
											| "deleted"
											| "sold"
									) =>
										setFormData({
											...formData,
											status: value,
										})
									}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="available">
											Còn hàng
										</SelectItem>
										<SelectItem value="reserved">
											Đang giữ
										</SelectItem>
										<SelectItem value="sold">
											Đã bán
										</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>

						<div className="space-y-4 p-4 rounded-lg bg-secondary/30 border border-border">
							<DynamicAttributesForm
								schema={currentSchema}
								attributes={formData.attributes}
								onChange={handleAttributesChange}
							/>
						</div>

						<div className="space-y-4 p-4 rounded-lg bg-secondary/30 border border-border">
							<h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
								Mô tả & Hình ảnh
							</h3>
							<div className="space-y-2">
								<Label htmlFor="description">
									Mô tả{" "}
									<span className="text-destructive">*</span>
								</Label>
								<Textarea
									id="description"
									value={formData.description}
									onChange={(e) =>
										setFormData({
											...formData,
											description: e.target.value,
										})
									}
									required
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="features">
									Đặc điểm nổi bật (cách nhau dấu phẩy)
								</Label>
								<Input
									id="features"
									value={formData.features}
									onChange={(e) =>
										setFormData({
											...formData,
											features: e.target.value,
										})
									}
								/>
							</div>

							<div className="space-y-2">
								<Label>Hình ảnh</Label>
								<p className="text-xs text-muted-foreground">
									Kéo thả để sắp xếp. Click "Set Thumbnail" để
									đặt làm ảnh đại diện
								</p>
								<div className="flex gap-2">
									<Input
										value={imageUrlInput}
										onChange={(e) =>
											setImageUrlInput(e.target.value)
										}
										placeholder="https://... (hoặc chọn từ máy bên dưới)"
										onKeyDown={(e) =>
											e.key === "Enter" &&
											(e.preventDefault(),
											handleAddImageUrl())
										}
									/>
									<Button
										type="button"
										onClick={handleAddImageUrl}
										size="icon"
									>
										<LinkIcon className="h-4 w-4" />
									</Button>
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
										<div className="grid grid-cols-4 gap-2 mt-2">
											{previewImages.map((img, index) => (
												<SortableImage
													key={img.id}
													id={img.id}
													url={img.url}
													isThumbnail={
														index ===
														formData.thumbnailIndex
													}
													progress={
														imageProgressMap[img.id]
													}
													onRemove={() =>
														removeImage(index)
													}
													onSetThumbnail={() =>
														setThumbnail(index)
													}
												/>
											))}

											<label className="aspect-square rounded-lg border-2 border-dashed border-border hover:border-primary flex flex-col items-center justify-center cursor-pointer transition-colors bg-secondary/20 hover:bg-secondary/40">
												<input
													type="file"
													accept="image/*"
													multiple
													onChange={handleImageSelect}
													className="hidden"
												/>
												<Upload className="h-6 w-6 mb-1 text-muted-foreground" />
												<span className="text-xs text-muted-foreground">
													Chọn ảnh
												</span>
											</label>
										</div>
									</SortableContext>
								</DndContext>
							</div>
						</div>

						<div className="flex justify-end gap-3">
							<Button
								type="button"
								variant="outline"
								onClick={() => setIsDialogOpen(false)}
								disabled={isSubmitting}
							>
								Hủy
							</Button>
							<Button
								type="submit"
								className="btn-gaming gap-2"
								disabled={isSubmitting || !formData.gameName}
							>
								{isSubmitting && (
									<Loader2 className="h-4 w-4 animate-spin" />
								)}

								{isSubmitting ? (
									uploadProgress.total > 0 ? (
										<span>
											Đang up ảnh {uploadProgress.current}
											/{uploadProgress.total}...
										</span>
									) : (
										"Đang xử lý..."
									)
								) : editingAccount ? (
									"Cập nhật"
								) : (
									"Thêm mới"
								)}
							</Button>
						</div>
					</form>
				</DialogContent>
			</Dialog>
		</div>
	);
}
