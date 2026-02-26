import { defineConfig } from "vite";
import path from "path";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
	return {
		plugins: [react()],
		resolve: {
			alias: { "@": path.resolve(__dirname, "./src") },
		},
		build: {
			minify: "esbuild",
			drop: ["console", "debugger"],
			cssCodeSplit: true,
			sourcemap: false,
			chunkSizeWarningLimit: 1500,
			rollupOptions: {
				output: {
					manualChunks: {
						vendor: ["react", "react-dom"],
					},
				},
			},
		},
		server: {
			proxy:
				mode === "development"
					? {
							"/v1": {
								target: "http://tradeplay-backend:8090",
								changeOrigin: true,
							},
						}
					: undefined,
			allowedHosts: [
				"test.tadeldev.site",
				"tiencotruong.com",
				"test.tiencotruong.com",
				"staging.tadeldev.site",
			],
		},
	};
});
