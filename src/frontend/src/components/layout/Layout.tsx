import { Header } from "./Header";
import { Footer } from "./Footer";
import { FloatingContact } from "./FloatingContact";
import { Outlet } from "react-router";
import { ScrollToTop } from "./ScrollToTop";

interface LayoutProps {
	showFooter?: boolean;
}

export function Layout({ showFooter = true }: LayoutProps) {
	return (
		<div className="min-h-screen flex flex-col bg-background">
			<ScrollToTop />
			<Header />
			<main className="flex-1">
				<Outlet />
			</main>
			{showFooter && <Footer />}
			<FloatingContact />
		</div>
	);
}
