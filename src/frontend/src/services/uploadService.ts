import { apiRequest } from "./api";
import type { ApiResponse } from "@/types";
import imageCompression from "browser-image-compression";

interface PresignedURLResponse {
	upload_url: string;
	file_url: string;
	key: string;
}

export const uploadService = {
	getPresignedURL: async (filename: string, contentType: string, size: number) => {
		return apiRequest<ApiResponse<PresignedURLResponse>>("/admin/upload/presign", {
			method: "POST",
			data: {
				filename,
				content_type: contentType,
				size: size,
			},
		});
	},

	uploadToS3: async (
		presignedUrl: string,
		file: File,
		onProgress?: (percent: number) => void
	): Promise<void> => {
		return new Promise((resolve, reject) => {
			const xhr = new XMLHttpRequest();

			if (onProgress) {
				xhr.upload.addEventListener("progress", (e) => {
					if (e.lengthComputable) {
						const percent = (e.loaded / e.total) * 100;
						onProgress(Math.round(percent));
					}
				});
			}

			xhr.addEventListener("load", () => {
				if (xhr.status === 200) {
					resolve();
				} else {
					reject(new Error(`Upload failed: ${xhr.status}`));
				}
			});

			xhr.addEventListener("error", () => {
				reject(new Error("Network error during upload"));
			});

			xhr.open("PUT", presignedUrl);
			xhr.setRequestHeader("Content-Type", file.type);
			xhr.send(file);
		});
	},

	compressImage: async (file: File): Promise<File> => {
		const options = {
			maxSizeMB: 1,
			maxWidthOrHeight: 1920,
			useWebWorker: true,
			fileType: "image/webp",
			initialQuality: 0.5,
		};

		try {
			console.log(`Original size: ${file.size / 1024 / 1024} MB`);
			const compressedFile = await imageCompression(file, options);
			console.log(`Compressed size: ${compressedFile.size / 1024 / 1024} MB`);
			
			return new File([compressedFile], file.name.replace(/\.[^/.]+$/, ".webp"), {
                type: "image/webp",
                lastModified: Date.now()
            });
		} catch (error) {
			console.error("Image compression failed:", error);
			return file;
		}
	},

	uploadImage: async (
        file: File,
        onProgress?: (percent: number) => void,
        maxRetries: number = 3
    ): Promise<string> => {
        const isVideo = file.type.startsWith('video/');
        const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
        const MAX_VIDEO_SIZE = 100 * 1024 * 1024;

        let fileToUpload = file;
        if (!isVideo) {
            if (file.size > MAX_IMAGE_SIZE) throw new Error("Ảnh quá lớn (Max 10MB)");
            fileToUpload = await uploadService.compressImage(file);
        } else {
            if (file.size > MAX_VIDEO_SIZE) throw new Error("Video quá lớn (Max 100MB)");
        }

        let attempt = 0;
        while (true) {
            try {
                const response = await uploadService.getPresignedURL(
                    fileToUpload.name,
                    fileToUpload.type,
                    fileToUpload.size
                );

                if (!response.data) {
                    throw new Error("Failed to get presigned URL");
                }

                const { upload_url, file_url } = response.data;

                await uploadService.uploadToS3(upload_url, fileToUpload, onProgress);

                return file_url;

            } catch (error) {
                attempt++;
                if (attempt >= maxRetries) {
                    throw error;
                }
                console.warn(`Upload failed (attempt ${attempt}/${maxRetries}). Retrying in 1s...`);
                await new Promise((resolve) => setTimeout(resolve, 1000));
            }
        }
    },
};