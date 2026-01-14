import { apiRequest } from "./api";
import type { ApiResponse } from "@/types";

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

	uploadImage: async (
		file: File,
		onProgress?: (percent: number) => void
	): Promise<string> => {
		if (file.size > 1 * 1024 * 1024) {
			throw new Error("File quá lớn (Max 1MB)");
		}
		const response = await uploadService.getPresignedURL(
			file.name,
			file.type,
			file.size 
		);

		if (!response.data) {
			throw new Error("Failed to get presigned URL");
		}

		const { upload_url, file_url } = response.data;

		await uploadService.uploadToS3(upload_url, file, onProgress);

		return file_url;
	},
};