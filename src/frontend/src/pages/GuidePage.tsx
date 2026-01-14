import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
	Search,
	MousePointer,
	CreditCard,
	CheckCircle,
	MessageCircle,
	ShieldCheck,
	Clock,
	Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "@/stores/languageStore";

export default function GuidePage() {
	const { t, tArray } = useTranslation();

	const steps = [
		{
			step: 1,
			icon: Search,
			title: t("step1Title"),
			description: t("step1Desc"),
			tips: tArray("step1Tips"),
		},
		{
			step: 2,
			icon: MousePointer,
			title: t("step2Title"),
			description: t("step2Desc"),
			tips: tArray("step2Tips"),
		},
		{
			step: 3,
			icon: CreditCard,
			title: t("step3Title"),
			description: t("step3Desc"),
			tips: tArray("step3Tips"),
		},
		{
			step: 4,
			icon: CheckCircle,
			title: t("step4Title"),
			description: t("step4Desc"),
			tips: tArray("step4Tips"),
		},
	];

	const paymentMethods = [
		{
			name: t("bankTransfer"),
			description: t("bankTransferDesc"),
		},
		{ name: t("momo"), description: t("momoDesc") },
	];

	return (
		<Layout>
			<div className="container mx-auto px-4 py-8">
				{/* Header */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					className="text-center mb-12"
				>
					<Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
						<Sparkles className="h-3 w-3 mr-1" />
						{t("guideHeader")}
					</Badge>
					<h1 className="text-3xl md:text-4xl font-gaming font-bold text-gradient mb-4">
						{t("guideTitle")}
					</h1>
					<p className="text-muted-foreground max-w-2xl mx-auto">
						{t("guideDesc")}
					</p>
				</motion.div>

				{/* Steps */}
				<div className="grid gap-6 md:gap-8 mb-12">
					{steps.map((item, index) => (
						<motion.div
							key={item.step}
							initial={{
								opacity: 0,
								x: index % 2 === 0 ? -20 : 20,
							}}
							animate={{ opacity: 1, x: 0 }}
							transition={{ delay: index * 0.1 }}
						>
							<Card className="border-2 border-primary/20 hover:border-primary/40 transition-colors">
								<CardHeader>
									<div className="flex items-start gap-4">
										<div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-[hsl(var(--pastel-blue))] flex items-center justify-center">
											<item.icon className="h-6 w-6 text-primary" />
										</div>
										<div className="flex-1">
											<div className="flex items-center gap-2 mb-2">
												<Badge
													variant="outline"
													className="bg-primary/10 text-primary border-primary/30"
												>
													{t("step")} {item.step}
												</Badge>
											</div>
											<CardTitle className="text-xl font-gaming">
												{item.title}
											</CardTitle>
										</div>
									</div>
								</CardHeader>
								<CardContent>
									<p className="text-muted-foreground mb-4">
										{item.description}
									</p>
									{item.tips && item.tips.length > 0 && (
										<div className="bg-muted/50 rounded-xl p-4">
											<p className="text-sm font-medium mb-2 flex items-center gap-2">
												{t("tips")}
											</p>
											<ul className="space-y-1">
												{item.tips.map((tip, i) => (
													<li
														key={i}
														className="text-sm text-muted-foreground flex items-start gap-2"
													>
														<span className="text-primary">
															•
														</span>
														{tip}
													</li>
												))}
											</ul>
										</div>
									)}
								</CardContent>
							</Card>
						</motion.div>
					))}
				</div>

				{/* Payment Methods */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.4 }}
				>
					<Card className="border-2 border-primary/20">
						<CardHeader>
							<CardTitle className="text-xl font-gaming flex items-center gap-2">
								{t("paymentMethods")}
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
								{paymentMethods.map((method, index) => (
									<div
										key={index}
										className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
									>
										<div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
											<CreditCard className="h-5 w-5 text-primary" />
										</div>
										<div>
											<p className="font-medium text-sm">
												{method.name}
											</p>
											<p className="text-xs text-muted-foreground">
												{method.description}
											</p>
										</div>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				</motion.div>

				{/* Support Section */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.5 }}
					className="mt-8"
				>
					<Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-[hsl(var(--pastel-blue)/0.2)]">
						<CardContent className="p-6">
							<div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
								<div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center flex-shrink-0">
									<MessageCircle className="h-8 w-8 text-primary" />
								</div>
								<div className="flex-1">
									<h3 className="text-lg font-gaming font-bold mb-2">
										{t("needSupport")}
									</h3>
									<p className="text-muted-foreground text-sm">
										{t("supportDesc")}
									</p>
								</div>
								<div className="flex gap-2">
									<Badge className="bg-primary/20 text-primary border-primary/30">
										<Clock className="h-3 w-3 mr-1" />
										{t("support247")}
									</Badge>
									<Badge className="bg-green-500/20 text-green-600 border-green-500/30">
										<ShieldCheck className="h-3 w-3 mr-1" />
										{t("reliable")}
									</Badge>
								</div>
							</div>
						</CardContent>
					</Card>
				</motion.div>
			</div>
		</Layout>
	);
}