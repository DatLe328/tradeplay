import { defineConfig } from "vite";
import path from "path";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig(({}) => {
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
			hmr: {
				host: "localhost",
				protocol: "ws",
			},
			allowedHosts: [
				"test.tadeldev.site",
				"tiencotruong.com",
				"staging.tiencotruong.com",
				"localhost",
			],
		},
	};
});
