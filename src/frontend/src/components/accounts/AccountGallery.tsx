import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AccountGalleryProps {
	images: string[];
	title: string;
}

export function AccountGallery({ images, title }: AccountGalleryProps) {
	const [selectedIndex, setSelectedIndex] = useState(0);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const thumbnailsRef = useRef<HTMLDivElement>(null);
	const thumbnailRefs = useRef<(HTMLButtonElement | null)[]>([]);

	// Auto-scroll to selected thumbnail
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

	const handlePrevious = () => {
		setSelectedIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
	};

	const handleNext = () => {
		setSelectedIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
	};

	return (
		<>
			<div className="grid grid-cols-1 lg:grid-cols-[1fr_120px] gap-4">
				{/* Main Image */}
				<div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-secondary">
					<motion.img
						key={selectedIndex}
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ duration: 0.3 }}
						src={images[selectedIndex]}
						alt={`${title} - Ảnh ${selectedIndex + 1}`}
						className="w-full h-full object-contain cursor-zoom-in"
						onClick={() => setIsModalOpen(true)}
					/>

					{/* Zoom indicator */}
					<button
						onClick={() => setIsModalOpen(true)}
						className="absolute top-4 right-4 p-2 rounded-lg bg-background/80 backdrop-blur-sm hover:bg-background transition-colors"
					>
						<ZoomIn className="h-5 w-5" />
					</button>

					{/* Navigation arrows */}
					{images.length > 1 && (
						<>
							<button
								onClick={handlePrevious}
								className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-background/80 backdrop-blur-sm hover:bg-background transition-colors"
							>
								<ChevronLeft className="h-5 w-5" />
							</button>
							<button
								onClick={handleNext}
								className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-background/80 backdrop-blur-sm hover:bg-background transition-colors"
							>
								<ChevronRight className="h-5 w-5" />
							</button>
						</>
					)}
				</div>

				{/* Thumbnails */}
				<div
					ref={thumbnailsRef}
					className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-y-auto lg:max-h-[400px] p-1 pb-2 lg:pb-1 lg:pr-2"
				>
					{images.map((image, index) => (
						<button
							key={index}
							ref={(el) => {
								if (el) {
									thumbnailRefs.current[index] = el;
								}
							}}
							onClick={() => setSelectedIndex(index)}
							className={`flex-shrink-0 w-20 h-20 lg:w-full lg:h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
								index === selectedIndex
									? "border-primary ring-2 ring-primary/50 ring-offset-2 ring-offset-background"
									: "border-muted-foreground/20 hover:border-primary/50"
							}`}
						>
							<img
								src={image}
								alt={`Thumbnail ${index + 1}`}
								className="w-full h-full object-cover"
							/>
						</button>
					))}
				</div>
			</div>

			{/* Fullscreen Modal */}
			<AnimatePresence>
				{isModalOpen && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
						onClick={() => setIsModalOpen(false)}
					>
						<Button
							variant="ghost"
							size="icon"
							className="absolute top-4 right-4 text-white hover:bg-white/10"
							onClick={() => setIsModalOpen(false)}
						>
							<X className="h-6 w-6" />
						</Button>

						{/* Navigation */}
						{images.length > 1 && (
							<>
								<button
									onClick={(e) => {
										e.stopPropagation();
										handlePrevious();
									}}
									className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
								>
									<ChevronLeft className="h-8 w-8 text-white" />
								</button>
								<button
									onClick={(e) => {
										e.stopPropagation();
										handleNext();
									}}
									className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
								>
									<ChevronRight className="h-8 w-8 text-white" />
								</button>
							</>
						)}

						<motion.img
							key={selectedIndex}
							initial={{ scale: 0.9, opacity: 0 }}
							animate={{ scale: 1, opacity: 1 }}
							exit={{ scale: 0.9, opacity: 0 }}
							src={images[selectedIndex]}
							alt={`${title} - Fullscreen`}
							className="max-w-full max-h-[90vh] object-contain rounded-lg"
							onClick={(e) => e.stopPropagation()}
						/>

						{/* Image counter */}
						<div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-white/10 text-white text-sm">
							{selectedIndex + 1} / {images.length}
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</>
	);
}
