import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { useTranslation } from "@/stores/languageStore";

export default function GoogleCallbackPage() {
	const { t } = useTranslation();
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();

	const { checkAuth, setCSRFToken } = useAuthStore();

	useEffect(() => {
		const handleGoogleLogin = async () => {
			const csrfToken = searchParams.get("csrf_token");
			if (csrfToken) {
				setCSRFToken(csrfToken);
			}

			await checkAuth();

			if (useAuthStore.getState().isAuthenticated) {
				navigate("/");
			} else {
				navigate("/auth/login?error=GoogleAuthFailed");
			}
		};

		handleGoogleLogin();
	}, [searchParams, navigate, checkAuth, setCSRFToken]);

	return (
		<div className="flex min-h-screen items-center justify-center bg-background">
			<div className="text-center space-y-4">
				<Loader2 className="mx-auto h-10 w-10 animate-spin text-primary" />
				<h2 className="text-xl font-semibold">
					{t("googleCallbackPage.processing")}
				</h2>
				<p className="text-muted-foreground">
					{t("googleCallbackPage.verifying")}
				</p>
			</div>
		</div>
	);
}
