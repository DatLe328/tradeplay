import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, ZoomIn, Play, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AccountGalleryProps {
	images: string[];
	title: string;
}

const isVideo = (url: string) => {
	if (!url) return false;
	return /\.(mp4|webm|ogg|mov|avi)$/i.test(url);
};

export function AccountGallery({ images, title }: AccountGalleryProps) {
	const [selectedIndex, setSelectedIndex] = useState(0);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const thumbnailsRef = useRef<HTMLDivElement>(null);
	const thumbnailRefs = useRef<(HTMLButtonElement | null)[]>([]);

	const mainVideoRef = useRef<HTMLVideoElement>(null);
	const modalVideoRef = useRef<HTMLVideoElement>(null);

	// Auto-scroll thumbnail
	useEffect(() => {
		const thumbnail = thumbnailRefs.current[selectedIndex];
		if (thumbnail && thumbnailsRef.current) {
			thumbnail.scrollIntoView({
				behavior: "smooth",
				block: "nearest",
				inline: "nearest",
			});
		}
	}, [selectedIndex]);

	const currentItem = images[selectedIndex];

	const handleTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
		const video = e.currentTarget;
		const time = video.currentTime;
		sessionStorage.setItem(`vid_time_${currentItem}`, time.toString());
	};

	const handleLoadedMetadata = (
		e: React.SyntheticEvent<HTMLVideoElement>
	) => {
		const video = e.currentTarget;
		const savedTime = sessionStorage.getItem(`vid_time_${currentItem}`);
		if (savedTime) {
			video.currentTime = parseFloat(savedTime);
		}
	};

	const handlePrevious = () => {
		setSelectedIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
	};

	const handleNext = () => {
		setSelectedIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
	};

	const isCurrentVideo = isVideo(currentItem);

	const posterImage = images.find((img) => img && !isVideo(img)) || "";

	return (
		<>
			<div className="grid grid-cols-1 lg:grid-cols-[1fr_120px] gap-4">
				{/* Main Image / Video Display */}
				<div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-secondary group border border-border/50">
                    {/* Fallback placeholder (ẩn, chỉ hiện khi onError trigger) */}
                    <div className="gallery-placeholder hidden absolute inset-0 flex items-center justify-center text-muted-foreground/30">
                        <ImageIcon className="h-16 w-16" />
                    </div>

					{isCurrentVideo ? (
						<div className="w-full h-full flex items-center justify-center bg-black">
							<video
								ref={mainVideoRef}
								key={currentItem}
								src={currentItem}
								controls
								className="w-full h-full object-contain"
								preload="metadata"
								poster={posterImage || undefined}
								onTimeUpdate={handleTimeUpdate}
								onLoadedMetadata={handleLoadedMetadata}
								playsInline
							/>
						</div>
					) : currentItem ? (
						<motion.img
							key={selectedIndex}
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ duration: 0.3 }}
							src={currentItem}
							alt={`${title} - ${selectedIndex + 1}`}
							className="w-full h-full object-contain cursor-zoom-in"
							onClick={() => setIsModalOpen(true)}
                            onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.parentElement?.querySelector('.gallery-placeholder')?.classList.remove('hidden');
                            }}
						/>
					) : (
                        /* Hiển thị Placeholder nếu currentItem là chuỗi rỗng */
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
                            <ImageIcon className="h-16 w-16" />
                        </div>
                    )}

					{/* Zoom indicator & Expand Button */}
					{(currentItem || isCurrentVideo) && (
						<button
							onClick={() => setIsModalOpen(true)}
							className="absolute top-4 right-4 p-2 rounded-lg bg-background/80 backdrop-blur-sm hover:bg-background transition-colors opacity-0 group-hover:opacity-100 z-10"
						>
							<ZoomIn className="h-5 w-5" />
						</button>
					)}

					{/* Navigation arrows */}
					{images.length > 1 && (
						<>
							<button
								onClick={handlePrevious}
								className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-background/80 backdrop-blur-sm hover:bg-background transition-colors z-10"
							>
								<ChevronLeft className="h-5 w-5" />
							</button>
							<button
								onClick={handleNext}
								className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-background/80 backdrop-blur-sm hover:bg-background transition-colors z-10"
							>
								<ChevronRight className="h-5 w-5" />
							</button>
						</>
					)}
				</div>

				<div
					ref={thumbnailsRef}
					className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-y-auto lg:max-h-[400px] p-1 pb-2 lg:pb-1 lg:pr-2"
				>
					{images.map((image, index) => {
						const isItemVideo = isVideo(image);
						return (
							<button
								key={index}
								ref={(el) => {
									if (el) thumbnailRefs.current[index] = el;
								}}
								onClick={() => setSelectedIndex(index)}
								className={`relative flex-shrink-0 w-20 h-20 lg:w-full lg:h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
									index === selectedIndex
										? "border-primary ring-2 ring-primary/50 ring-offset-2 ring-offset-background"
										: "border-muted-foreground/20 hover:border-primary/50 bg-secondary/50"
								}`}
							>
								{isItemVideo ? (
									<div className="relative w-full h-full">
										<img
											src="/video-placeholder.jpg"
											alt="Video thumbnail"
											className="w-full h-full object-cover opacity-60 hover:opacity-80 transition-opacity blur-[1px]"
                                            onError={(e) => {
                                                // Fallback nếu không có file video-placeholder.jpg
                                                e.currentTarget.style.display = 'none'; 
                                            }}
										/>
                                        {/* Fallback background nếu ảnh lỗi */}
                                        <div className="absolute inset-0 bg-black/60" />

										<div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
											<div className="rounded-full bg-black/50 p-1.5 backdrop-blur-sm">
												<Play className="w-5 h-5 text-white fill-white" />
											</div>
											<span className="text-[9px] font-bold text-white uppercase drop-shadow-md">
												Video {index + 1}
											</span>
										</div>
									</div>
								) : image ? (
									<img
										src={image}
										alt={`Thumbnail ${index + 1}`}
										className="w-full h-full object-cover"
										loading="lazy"
									/>
								) : (
                                    /* Thumbnail Placeholder */
                                    <div className="w-full h-full flex items-center justify-center bg-secondary/50">
                                        <ImageIcon className="h-6 w-6 text-muted-foreground/40" />
                                    </div>
                                )}
							</button>
						);
					})}
				</div>
			</div>

			{/* Fullscreen Modal */}
			<AnimatePresence>
				{isModalOpen && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
						onClick={() => setIsModalOpen(false)}
					>
						{/* Close Button */}
						<Button
							variant="ghost"
							size="icon"
							className="absolute top-4 right-4 text-white hover:bg-white/10 z-50"
							onClick={() => setIsModalOpen(false)}
						>
							<X className="h-6 w-6" />
						</Button>

						{/* Content Modal */}
						{isCurrentVideo ? (
							<motion.div
								key={selectedIndex}
								initial={{ scale: 0.9, opacity: 0 }}
								animate={{ scale: 1, opacity: 1 }}
								exit={{ scale: 0.9, opacity: 0 }}
								className="w-full max-w-5xl max-h-[90vh] aspect-video bg-black rounded-lg overflow-hidden"
								onClick={(e) => e.stopPropagation()}
							>
								<video
									ref={modalVideoRef}
									src={currentItem}
									controls
									autoPlay
									className="w-full h-full"
									onTimeUpdate={handleTimeUpdate}
									onLoadedMetadata={handleLoadedMetadata}
									playsInline
								/>
							</motion.div>
						) : currentItem ? (
							<motion.img
								key={selectedIndex}
								initial={{ scale: 0.9, opacity: 0 }}
								animate={{ scale: 1, opacity: 1 }}
								exit={{ scale: 0.9, opacity: 0 }}
								src={currentItem}
								alt={`${title} - Fullscreen`}
								className="max-w-full max-h-[90vh] object-contain rounded-lg"
								onClick={(e) => e.stopPropagation()}
							/>
						) : (
                             /* Modal Placeholder */
                             <div className="w-full max-w-5xl aspect-video flex items-center justify-center text-muted-foreground">
                                <ImageIcon className="h-20 w-20" />
                                <span className="ml-4 text-lg">Hình ảnh không tồn tại</span>
                             </div>
                        )}

						{images.length > 1 && (
							<>
								<button
									onClick={(e) => {
										e.stopPropagation();
										handlePrevious();
									}}
									className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-50"
								>
									<ChevronLeft className="h-8 w-8 text-white" />
								</button>
								<button
									onClick={(e) => {
										e.stopPropagation();
										handleNext();
									}}
									className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-50"
								>
									<ChevronRight className="h-8 w-8 text-white" />
								</button>
							</>
						)}

						<div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-white/10 text-white text-sm z-50">
							{selectedIndex + 1} / {images.length}
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</>
	);
}