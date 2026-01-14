import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";

export default function GoogleCallbackPage() {
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
        <h2 className="text-xl font-semibold">Đang xử lý đăng nhập...</h2>
        <p className="text-muted-foreground">Đang xác thực thông tin tài khoản</p>
      </div>
    </div>
  );
}