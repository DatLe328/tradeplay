import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";

import priceFilter1 from "@/assets/price-filter-1.jpg";
import priceFilter2 from "@/assets/price-filter-2.jpg";
import priceFilter3 from "@/assets/price-filter-3.jpg";
import priceFilter4 from "@/assets/price-filter-4.jpg";
import priceFilter5 from "@/assets/price-filter-5.jpg";
import { WelcomePopup } from "@/components/layout/WelcomePopup";
import { useTranslation } from "@/stores/languageStore";
import { SeoMetadata } from "@/components/seo/SeoMetadata";

export default function HomePage() {
	const { t } = useTranslation();

	const priceFilters = [
		{
			label: t("homePage.filterPriceUnder1m"),
			range: "0-1000000",
			image: priceFilter1,
			color: "from-green-400 to-emerald-500",
			desc: t("homePage.priceDescCheap"),
		},
		{
			label: t("homePage.filterPrice1mTo5m"),
			range: "1000000-5000000",
			image: priceFilter2,
			color: "from-blue-400 to-cyan-500",
			desc: t("homePage.priceDescGood"),
		},
		{
			label: t("homePage.filterPrice5mTo10m"),
			range: "5000000-10000000",
			image: priceFilter3,
			color: "from-purple-400 to-pink-500",
			desc: t("homePage.priceDescVip"),
		},
		{
			label: t("homePage.filterPrice10mTo20m"),
			range: "10000000-20000000",
			image: priceFilter4,
			color: "from-yellow-400 to-orange-500",
			desc: t("homePage.priceDescSuperVip"),
		},
		{
			label: t("homePage.filterPriceAbove20m"),
			range: "20000000-999999999",
			image: priceFilter5,
			color: "from-yellow-500 to-orange-600",
			desc: t("homePage.priceDescSuperVip"),
		},
	];

	return (
		<Layout>
			<SeoMetadata
				title="Tiến Cơ Trưởng - Shop Acc Play Together Uy Tín"
				description="Shop Tiến Cơ Trưởng chuyên mua bán nick Play Together giá rẻ, uy tín. Giao dịch tự động, bảo hành, hỗ trợ 24/7."
			/>
			<WelcomePopup />
			{/* Hero Section */}
			<section className="relative overflow-hidden">
				{/* Background gradient - Cute pastel */}
				<div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--pastel-pink)/0.4)] via-background to-[hsl(var(--pastel-blue)/0.3)]" />
				<div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-bl from-[hsl(var(--pastel-yellow)/0.4)] to-transparent blur-3xl" />
				<div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-gradient-to-tr from-[hsl(var(--pastel-green)/0.3)] to-transparent blur-3xl" />

				<div className="container mx-auto px-4 py-20 md:py-32 relative">
					<div className="max-w-4xl mx-auto text-center space-y-8">
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6 }}
							className="space-y-4"
						>
							<div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-primary/20 to-[hsl(var(--pastel-blue))] border-2 border-primary/30">
								<Sparkles className="h-5 w-5 text-primary animate-pulse" />
								<span className="text-sm font-bold text-primary">
									{t("homePage.shopBadge")}
								</span>
							</div>

							<h1 className="font-gaming text-4xl md:text-6xl lg:text-7xl font-bold">
								<span className="text-gradient">
									{"TienCoTruong"}
								</span>
								<br />
								<span className="text-foreground">
									{"Shop 🎮💖"}
								</span>
							</h1>

							<p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
								{t("homePage.heroDescription")}
							</p>
						</motion.div>

						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: 0.2 }}
							className="flex flex-col sm:flex-row gap-4 justify-center"
						>
							<Link to="/accounts">
								<Button className="btn-gaming text-lg px-8 py-6 gap-2">
									{t("homePage.viewAccNow")}
									<ArrowRight className="h-5 w-5" />
								</Button>
							</Link>
							<Link to="/auth">
								<Button
									variant="outline"
									className="text-lg px-8 py-6 rounded-2xl border-2 border-primary/40 hover:bg-primary/10"
								>
									{t("homePage.registerFree")}
								</Button>
							</Link>
						</motion.div>
					</div>
				</div>
			</section>

			{/* Price Filter Cards */}
			<section className="py-20">
				<div className="container mx-auto px-4">
					<div className="text-center mb-12">
						<h2 className="font-gaming text-3xl md:text-4xl font-bold mb-2">
							{t("homePage.findByPrice")}{" "}
							<span className="text-gradient">{t("homePage.price")}</span>{" "}
							💰
						</h2>
						<p className="text-muted-foreground">
							{t("homePage.findByPriceDesc")}
						</p>
					</div>

					<div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
						{priceFilters.map((item, index) => (
							<motion.div
								key={index}
								initial={{ opacity: 0, y: 20 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true }}
								transition={{
									duration: 0.5,
									delay: index * 0.1,
								}}
							>
								<Link
									to={"/accounts"}
									state={{ priceRange: item.range }}
								>
									<motion.div
										whileHover={{ scale: 1.05, y: -8 }}
										whileTap={{ scale: 0.98 }}
										className="rounded-3xl bg-card border-2 border-primary/20 hover:border-primary/50 transition-all duration-300 cute-shadow cursor-pointer group overflow-hidden"
									>
										<div className="relative h-36 overflow-hidden">
											<img
												src={item.image}
												alt={item.label}
												className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
											/>
											<div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
										</div>
										<div className="p-4 text-center">
											<div
												className={`inline-block px-4 py-2 rounded-2xl bg-gradient-to-r ${item.color} text-white font-bold mb-2`}
											>
												{item.label}
											</div>
											<p className="text-muted-foreground text-sm">
												{item.desc}
											</p>
										</div>
									</motion.div>
								</Link>
							</motion.div>
						))}
					</div>

					<div className="mt-8 text-center">
						<Link to="/accounts">
							<Button
								variant="outline"
								className="gap-2 rounded-2xl border-2 border-primary/40 hover:bg-primary/10"
							>
								{t("homePage.viewAllAccounts")}
								<ArrowRight className="h-4 w-4" />
							</Button>
						</Link>
					</div>
				</div>
			</section>
		</Layout>
	);
}
