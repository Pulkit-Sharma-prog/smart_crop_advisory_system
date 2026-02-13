import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, LogIn, Phone } from "lucide-react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { z } from "zod";
import { useAuth } from "../auth/AuthContext";
import { routes } from "../types/routes";

const schema = z.object({
  phone: z.string().min(10),
  password: z.string().min(4),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const { t } = useTranslation();
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      phone: "",
      password: "",
    },
  });

  if (isAuthenticated) {
    return <Navigate to={routes.dashboard} replace />;
  }

  const onSubmit = async (values: FormData) => {
    const ok = await login(values.phone, values.password);
    if (ok) {
      const state = location.state as { from?: string } | null;
      navigate(state?.from ?? routes.dashboard, { replace: true });
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] px-4 sm:px-6 lg:px-8 py-10">
      <div className="max-w-md mx-auto surface-card-strong p-7">
        <h1 className="text-3xl font-bold text-forest-900 mb-2">{t("auth.loginTitle")}</h1>
        <p className="text-sm text-forest-800/75 mb-6">{t("auth.loginSubtitle")}</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div>
            <label className="text-sm font-semibold text-forest-800 mb-2 flex items-center gap-2" htmlFor="phone">
              <Phone className="h-4 w-4" />
              {t("auth.phone")}
            </label>
            <input
              id="phone"
              type="tel"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl"
              placeholder={t("auth.phonePlaceholder")}
              {...register("phone")}
            />
            {errors.phone ? <p className="text-xs text-red-600 mt-1">{t("auth.phoneError")}</p> : null}
          </div>

          <div>
            <label className="text-sm font-semibold text-forest-800 mb-2 flex items-center gap-2" htmlFor="password">
              <Lock className="h-4 w-4" />
              {t("auth.password")}
            </label>
            <input
              id="password"
              type="password"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl"
              placeholder={t("auth.passwordPlaceholder")}
              {...register("password")}
            />
            {errors.password ? <p className="text-xs text-red-600 mt-1">{t("auth.passwordError")}</p> : null}
          </div>

          <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
            <LogIn className="h-4 w-4" />
            {isSubmitting ? t("auth.loggingIn") : t("auth.loginButton")}
          </button>
        </form>
      </div>
    </div>
  );
}
