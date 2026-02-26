import { Sparkles, Instagram, Phone, MapPin, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "@/stores/languageStore";

export function Footer() {
	const { t } = useTranslation();
	return (
		<footer className="border-t-2 border-primary/20 bg-gradient-to-b from-card to-[hsl(var(--pastel-pink)/0.3)]">
			<div className="container mx-auto px-4 py-12">
				<div className="grid grid-cols-1 md:grid-cols-4 gap-8">
					{/* Brand */}
					<div className="space-y-4">
						<Link to="/" className="flex items-center gap-2">
							<div className="p-2 rounded-2xl bg-gradient-to-br from-primary/20 to-[hsl(var(--pastel-blue))]">
								<Sparkles className="h-6 w-6 text-primary" />
							</div>
							<span className="font-gaming text-xl font-bold text-gradient">
								TienCoTruong Shop
							</span>
						</Link>
						<p className="text-sm text-muted-foreground">
							{t("footer.description")}
						</p>
					</div>

					{/* Quick Links */}
					<div className="space-y-4">
						<h4 className="font-gaming font-semibold text-foreground flex items-center gap-2">
							{t("footer.quickLinks")}
						</h4>
						<ul className="space-y-2">
							<li>
								<Link
									to="/"
									className="text-sm text-muted-foreground hover:text-primary transition-colors"
								>
									{t("footer.homeLink")}
								</Link>
							</li>
							<li>
								<Link
									to="/accounts"
									className="text-sm text-muted-foreground hover:text-primary transition-colors"
								>
									{t("footer.accountsLink")}
								</Link>
							</li>
							<li>
								<Link
									to="/guide"
									className="text-sm text-muted-foreground hover:text-primary transition-colors"
								>
									{t("footer.guideLink")}
								</Link>
							</li>
							<li>
								<Link
									to="/warranty"
									className="text-sm text-muted-foreground hover:text-primary transition-colors"
								>
									{t("footer.warrantyLink")}
								</Link>
							</li>
						</ul>
					</div>

					{/* Categories */}
					<div className="space-y-4">
						<h4 className="font-gaming font-semibold text-foreground flex items-center gap-2">
							{t("footer.hotCategories")}
						</h4>
						<ul className="space-y-2">
							<li className="text-sm text-muted-foreground">
								{t("footer.categoryService1")}
							</li>
							<li className="text-sm text-muted-foreground">
								{t("footer.categoryService2")}
							</li>
						</ul>
					</div>

					{/* Contact */}
					<div className="space-y-4">
						<h4 className="font-gaming font-semibold text-foreground flex items-center gap-2">
							{t("footer.contactLabel")}
						</h4>
						<ul className="space-y-3">
							<li className="flex items-center gap-2 text-sm text-muted-foreground">
								<Instagram className="h-4 w-4 text-primary" />
								@leminhtien95
							</li>
							<li className="flex items-center gap-2 text-sm text-muted-foreground">
								<Phone className="h-4 w-4 text-primary" />
								Zalo: 0333 423 113
							</li>
							<li className="flex items-center gap-2 text-sm text-muted-foreground">
								<MapPin className="h-4 w-4 text-primary" />
								Việt Nam
							</li>
						</ul>
					</div>
				</div>

				<div className="mt-8 pt-8 border-t-2 border-primary/20 text-center space-y-2">
					<p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
						{t("footer.madeWith")}{" "}
						<Heart className="h-4 w-4 text-primary fill-primary animate-pulse" />{" "}
						{t("footer.by")} © 2026
					</p>
					<p className="text-xs text-muted-foreground/60">
						{import.meta.env.VITE_APP_VERSION}
					</p>
				</div>
			</div>
		</footer>
	);
}
