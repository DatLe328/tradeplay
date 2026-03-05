import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router";
import { useEffect } from "react";
import { useThemeStore } from "@/stores/themeStore";

import { AppRoutes } from "./routes";

const queryClient = new QueryClient();

function ThemeInitializer() {
	const { theme } = useThemeStore();

	useEffect(() => {
		document.documentElement.classList.toggle("dark", theme === "dark");
	}, [theme]);

	return null;
}

const App = () => {
	return (
		<QueryClientProvider client={queryClient}>
			<TooltipProvider>
				<ThemeInitializer />
				<Toaster />
				<Sonner />
				<RouterProvider router={AppRoutes} />
			</TooltipProvider>
		</QueryClientProvider>
	);
};

export default App;