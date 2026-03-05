import { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router";
import { motion } from "framer-motion";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/services/api";
import { useTranslation } from "@/stores/languageStore";

export default function VerifyEmailPage() {
	const location = useLocation();
	const navigate = useNavigate();
	const { toast } = useToast();
	const { t } = useTranslation();

	const email = location.state?.email;

	const [otp, setOtp] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		if (!email) {
			navigate("/auth");
		}
	}, [email, navigate]);

	const handleVerify = async (e: React.FormEvent) => {
		e.preventDefault();
		if (otp.length < 6) return;

		setIsLoading(true);
		try {
			await apiRequest("/auth/verify", {
				method: "POST",
				data: JSON.stringify({ email, code: otp }),
			});

			toast({
				title: t("verifyEmailPage.verifySuccess"),
				description: t("verifyEmailPage.verifySuccessDesc"),
			});

			navigate("/auth");
		} catch (error: any) {
			toast({
				title: t("verifyEmailPage.verifyFailed"),
				description: error.message || t("verifyEmailPage.verifyFailedDesc"),
				variant: "destructive",
			});
		} finally {
			setIsLoading(false);
		}
	};

	if (!email) return null;

	return (
		<div className="min-h-screen flex items-center justify-center bg-background p-4">
			<div className="fixed inset-0 bg-gradient-to-br from-primary/5 via-background to-background" />
			<div className="fixed top-0 right-0 w-1/2 h-1/2 bg-gradient-to-bl from-primary/10 to-transparent blur-3xl" />

			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				className="w-full max-w-md relative"
			>
				<Link
					to="/auth"
					className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
				>
					<ArrowLeft className="h-4 w-4" />
					{t("verifyEmailPage.backToRegister")}
				</Link>

				<div className="p-8 rounded-2xl bg-card border border-border shadow-lg text-center">
					<div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
						<ShieldCheck className="h-6 w-6 text-primary" />
					</div>

					<h1 className="font-gaming text-2xl font-bold mb-2">
						{t("verifyEmailPage.verifyEmailTitle")}
					</h1>
					<p className="text-muted-foreground text-sm mb-6">
						{t("verifyEmailPage.verifyEmailDesc")}
						<br />
						<span className="font-medium text-foreground">
							{email}
						</span>
					</p>

					<form onSubmit={handleVerify} className="space-y-6">
						<div className="space-y-2">
							<Input
								type="text"
								placeholder={t("verifyEmailPage.enterOtpPlaceholder")}
								value={otp}
								onChange={(e) =>
									setOtp(
										e.target.value
											.replace(/[^0-9]/g, "")
											.slice(0, 6),
									)
								}
								className="text-center text-2xl tracking-[0.5em] font-mono h-14"
								maxLength={6}
								autoFocus
							/>
						</div>

						<Button
							type="submit"
							className="btn-gaming w-full py-6 text-lg"
							disabled={isLoading || otp.length < 6}
						>
							{isLoading ? t("verifyEmailPage.verifying") : t("verifyEmailPage.confirm")}
						</Button>
					</form>
				</div>
			</motion.div>
		</div>
	);
}
