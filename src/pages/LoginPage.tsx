import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowRight,
  CheckCircle2,
  KeyRound,
  Leaf,
  Lock,
  Mail,
  Phone,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { z } from "zod";
import { useAuth } from "../auth/useAuth";
import { appEnv } from "../config/env";
import { initGoogleButton } from "../services/googleIdentityService";
import { routes } from "../types/routes";

const signInSchema = z.object({
  phone: z.string().trim().min(10),
  password: z.string().trim().min(4),
});

const signUpSchema = z
  .object({
    fullName: z.string().trim().min(2),
    phone: z.string().trim().min(10),
    email: z.string().trim().email(),
    password: z.string().trim().min(6),
    confirmPassword: z.string().trim().min(6),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "password_mismatch",
    path: ["confirmPassword"],
  });

type SignInFormData = z.infer<typeof signInSchema>;
type SignUpFormData = z.infer<typeof signUpSchema>;
type AuthMode = "signin" | "signup";

export default function LoginPage() {
  const { t } = useTranslation();
  const { isAuthenticated, login, signup, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const initialMode: AuthMode = params.get("mode") === "signup" ? "signup" : "signin";
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [authError, setAuthError] = useState<string | null>(null);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleUnavailable, setGoogleUnavailable] = useState(false);
  const googleButtonRef = useRef<HTMLDivElement | null>(null);

  const state = location.state as { from?: string } | null;
  const destination = state?.from ?? routes.dashboard;

  const {
    register: registerSignIn,
    handleSubmit: handleSignInSubmit,
    formState: { errors: signInErrors, isSubmitting: isSigningIn },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      phone: "",
      password: "",
    },
  });

  const {
    register: registerSignUp,
    handleSubmit: handleSignUpSubmit,
    formState: { errors: signUpErrors, isSubmitting: isSigningUp },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const isSubmitting = isSigningIn || isSigningUp || googleLoading;

  const passwordConfirmError = useMemo(() => {
    if (!signUpErrors.confirmPassword) return null;
    return signUpErrors.confirmPassword.message === "password_mismatch"
      ? t("auth.passwordConfirmMismatch")
      : t("auth.passwordConfirmError");
  }, [signUpErrors.confirmPassword, t]);

  const onSignIn = async (values: SignInFormData) => {
    setAuthError(null);
    const ok = await login(values.phone, values.password);
    if (!ok) {
      setAuthError(t("auth.invalidCredentials"));
      return;
    }

    navigate(destination, { replace: true });
  };

  const onSignUp = async (values: SignUpFormData) => {
    setAuthError(null);
    const result = await signup({
      fullName: values.fullName,
      phone: values.phone,
      email: values.email,
      password: values.password,
    });

    if (!result.ok) {
      if (result.reason === "phone_exists") {
        setAuthError(t("auth.accountExists"));
      } else {
        setAuthError(t("auth.signupFailed"));
      }
      return;
    }

    navigate(destination, { replace: true });
  };

  const onGoogleAuth = useCallback(async (idToken: string) => {
    setGoogleLoading(true);
    setAuthError(null);

    try {
      const ok = await loginWithGoogle(idToken);
      if (ok) {
        navigate(destination, { replace: true });
      } else {
        setAuthError(t("auth.googleFailed"));
      }
    } finally {
      setGoogleLoading(false);
    }
  }, [destination, loginWithGoogle, navigate, t]);

  useEffect(() => {
    if (!appEnv.googleClientId || !googleButtonRef.current) {
      setGoogleUnavailable(true);
      return;
    }

    setGoogleUnavailable(false);
    let cancelled = false;

    void initGoogleButton({
      clientId: appEnv.googleClientId,
      mountNode: googleButtonRef.current,
      onCredential: (credential) => {
        if (!cancelled) {
          void onGoogleAuth(credential);
        }
      },
    }).catch(() => {
      if (!cancelled) {
        setGoogleUnavailable(true);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [onGoogleAuth]);

  if (isAuthenticated) {
    return <Navigate to={routes.dashboard} replace />;
  }

  return (
    <div className="page-wrap">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-5 md:gap-6 items-stretch">
        <section className="hero-panel text-white p-6 md:p-8 float-in">
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full border border-white/15 px-3 py-1 text-xs font-semibold">
            <Leaf className="h-4 w-4" />
            {t("auth.brandTag")}
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold leading-tight mt-4">{t("auth.pageTitle")}</h1>
          <p className="text-white/85 mt-3 text-sm md:text-base">{t("auth.pageSubtitle")}</p>

          <div className="mt-6 space-y-3 stagger-in">
            <div className="flex items-start gap-3 rounded-xl bg-white/10 border border-white/15 p-3">
              <ShieldCheck className="h-5 w-5 mt-0.5 text-emerald-200" />
              <div>
                <p className="font-semibold">{t("auth.benefitSecureTitle")}</p>
                <p className="text-xs text-white/80">{t("auth.benefitSecureDesc")}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-xl bg-white/10 border border-white/15 p-3">
              <CheckCircle2 className="h-5 w-5 mt-0.5 text-emerald-200" />
              <div>
                <p className="font-semibold">{t("auth.benefitFastTitle")}</p>
                <p className="text-xs text-white/80">{t("auth.benefitFastDesc")}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-xl bg-white/10 border border-white/15 p-3">
              <KeyRound className="h-5 w-5 mt-0.5 text-emerald-200" />
              <div>
                <p className="font-semibold">{t("auth.benefitAccessTitle")}</p>
                <p className="text-xs text-white/80">{t("auth.benefitAccessDesc")}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="surface-card-strong p-5 md:p-7 fade-up">
          <div className="inline-flex rounded-xl border border-forest-100 p-1 bg-forest-50/80 w-full">
            <button
              type="button"
              className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                mode === "signin" ? "bg-white shadow text-forest-900" : "text-forest-700"
              }`}
              onClick={() => {
                setMode("signin");
                setAuthError(null);
              }}
            >
              {t("auth.signInTab")}
            </button>
            <button
              type="button"
              className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                mode === "signup" ? "bg-white shadow text-forest-900" : "text-forest-700"
              }`}
              onClick={() => {
                setMode("signup");
                setAuthError(null);
              }}
            >
              {t("auth.signUpTab")}
            </button>
          </div>

          <div className="mt-5">
            <h2 className="text-2xl font-bold text-forest-900">
              {mode === "signin" ? t("auth.signInTitle") : t("auth.signUpTitle")}
            </h2>
            <p className="text-sm text-forest-800/90 mt-1">
              {mode === "signin" ? t("auth.signInSubtitle") : t("auth.signUpSubtitle")}
            </p>
          </div>

          <div className="w-full mt-5">
            <div ref={googleButtonRef} className={googleLoading ? "opacity-70 pointer-events-none" : ""} />
            {googleUnavailable ? (
              <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mt-2">
                {t("auth.googleUnavailable")}
              </p>
            ) : null}
            {googleLoading ? <p className="text-xs text-forest-700 mt-2">{t("auth.googleLoading")}</p> : null}
          </div>

          <div className="relative mt-4 mb-4">
            <div className="border-t border-forest-100" />
            <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 bg-white text-xs text-forest-700">
              {t("auth.orDivider")}
            </span>
          </div>

          {mode === "signin" ? (
            <form onSubmit={handleSignInSubmit(onSignIn)} className="space-y-4" noValidate>
              <div>
                <label className="text-sm font-semibold text-forest-800 mb-2 flex items-center gap-2" htmlFor="signin-phone">
                  <Phone className="h-4 w-4" />
                  {t("auth.phone")}
                </label>
                <input
                  id="signin-phone"
                  type="tel"
                  className="bg-white"
                  placeholder={t("auth.phonePlaceholder")}
                  {...registerSignIn("phone")}
                />
                {signInErrors.phone ? <p className="text-xs text-red-600 mt-1">{t("auth.phoneError")}</p> : null}
              </div>

              <div>
                <label className="text-sm font-semibold text-forest-800 mb-2 flex items-center gap-2" htmlFor="signin-password">
                  <Lock className="h-4 w-4" />
                  {t("auth.password")}
                </label>
                <input
                  id="signin-password"
                  type="password"
                  className="bg-white"
                  placeholder={t("auth.passwordPlaceholder")}
                  {...registerSignIn("password")}
                />
                {signInErrors.password ? <p className="text-xs text-red-600 mt-1">{t("auth.passwordError")}</p> : null}
              </div>

              {authError ? <p className="text-sm text-red-700 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">{authError}</p> : null}

              <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
                {isSigningIn ? t("auth.loggingIn") : t("auth.loginButton")}
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignUpSubmit(onSignUp)} className="space-y-4" noValidate>
              <div>
                <label className="text-sm font-semibold text-forest-800 mb-2 flex items-center gap-2" htmlFor="signup-name">
                  <UserRound className="h-4 w-4" />
                  {t("auth.fullName")}
                </label>
                <input
                  id="signup-name"
                  type="text"
                  className="bg-white"
                  placeholder={t("auth.fullNamePlaceholder")}
                  {...registerSignUp("fullName")}
                />
                {signUpErrors.fullName ? <p className="text-xs text-red-600 mt-1">{t("auth.fullNameError")}</p> : null}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-semibold text-forest-800 mb-2 flex items-center gap-2" htmlFor="signup-phone">
                    <Phone className="h-4 w-4" />
                    {t("auth.phone")}
                  </label>
                  <input
                    id="signup-phone"
                    type="tel"
                    className="bg-white"
                    placeholder={t("auth.phonePlaceholder")}
                    {...registerSignUp("phone")}
                  />
                  {signUpErrors.phone ? <p className="text-xs text-red-600 mt-1">{t("auth.phoneError")}</p> : null}
                </div>

                <div>
                  <label className="text-sm font-semibold text-forest-800 mb-2 flex items-center gap-2" htmlFor="signup-email">
                    <Mail className="h-4 w-4" />
                    {t("auth.email")}
                  </label>
                  <input
                    id="signup-email"
                    type="email"
                    className="bg-white"
                    placeholder={t("auth.emailPlaceholder")}
                    {...registerSignUp("email")}
                  />
                  {signUpErrors.email ? <p className="text-xs text-red-600 mt-1">{t("auth.emailError")}</p> : null}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-semibold text-forest-800 mb-2 flex items-center gap-2" htmlFor="signup-password">
                    <Lock className="h-4 w-4" />
                    {t("auth.password")}
                  </label>
                  <input
                    id="signup-password"
                    type="password"
                    className="bg-white"
                    placeholder={t("auth.passwordCreatePlaceholder")}
                    {...registerSignUp("password")}
                  />
                  {signUpErrors.password ? <p className="text-xs text-red-600 mt-1">{t("auth.passwordCreateError")}</p> : null}
                </div>

                <div>
                  <label className="text-sm font-semibold text-forest-800 mb-2 flex items-center gap-2" htmlFor="signup-confirm-password">
                    <Lock className="h-4 w-4" />
                    {t("auth.confirmPassword")}
                  </label>
                  <input
                    id="signup-confirm-password"
                    type="password"
                    className="bg-white"
                    placeholder={t("auth.confirmPasswordPlaceholder")}
                    {...registerSignUp("confirmPassword")}
                  />
                  {passwordConfirmError ? <p className="text-xs text-red-600 mt-1">{passwordConfirmError}</p> : null}
                </div>
              </div>

              {authError ? <p className="text-sm text-red-700 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">{authError}</p> : null}

              <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
                {isSigningUp ? t("auth.creatingAccount") : t("auth.createAccountButton")}
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          )}
        </section>
      </div>
    </div>
  );
}


