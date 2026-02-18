import { useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Home, LogIn } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { routes } from "../types/routes";

export default function LogoutPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      logout();
    }

    const timer = window.setTimeout(() => {
      navigate(routes.home, { replace: true });
    }, 2800);

    return () => window.clearTimeout(timer);
  }, [isAuthenticated, logout, navigate]);

  return (
    <div className="page-wrap">
      <div className="max-w-2xl mx-auto">
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="surface-card-strong p-5 md:p-7 text-center"
        >
          <div className="mx-auto h-14 w-14 rounded-full bg-forest-100 text-forest-700 flex items-center justify-center">
            <CheckCircle2 className="h-8 w-8" aria-hidden="true" />
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-forest-900 mt-4">{t("auth.logoutTitle")}</h1>
          <p className="text-forest-800 mt-2">{t("auth.logoutSubtitle")}</p>

          <div className="surface-card p-4 mt-5 text-left">
            <p className="text-sm font-semibold text-forest-900">{t("auth.logoutTipsTitle")}</p>
            <ul className="mt-2 space-y-1 text-sm text-forest-800">
              <li>{t("auth.logoutTip1")}</li>
              <li>{t("auth.logoutTip2")}</li>
              <li>{t("auth.logoutTip3")}</li>
            </ul>
          </div>

          <p className="text-xs text-forest-700 mt-4">{t("auth.logoutRedirecting")}</p>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            <button onClick={() => navigate(routes.home, { replace: true })} className="btn-primary">
              <Home className="h-4 w-4" />
              {t("auth.goHome")}
            </button>
            <button onClick={() => navigate(routes.login)} className="btn-secondary">
              <LogIn className="h-4 w-4" />
              {t("auth.signInAgain")}
            </button>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
