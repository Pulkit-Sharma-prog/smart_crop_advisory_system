import {
  AlertTriangle,
  Bug,
  Calendar,
  CheckCircle2,
  Cloud,
  Droplets,
  LayoutDashboard,
  ListChecks,
  MapPinned,
  Sprout,
  TrendingUp,
  Wrench,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { routes } from "../types/routes";

const navItems = [
  { path: routes.dashboard, icon: LayoutDashboard, labelKey: "dashboard.overview" },
  { path: routes.weather, icon: Cloud, labelKey: "weather.title" },
  { path: routes.advisory, icon: Sprout, labelKey: "soil.title" },
  { path: routes.diseaseDetection, icon: AlertTriangle, labelKey: "disease.title" },
  { path: routes.farmingSchedule, icon: Calendar, labelKey: "schedule.title" },
  { path: routes.marketPrices, icon: TrendingUp, labelKey: "market.title" },
  { path: routes.farmTools, icon: Wrench, labelKey: "farmTools.title" },
] as const;

const CHECKLIST_KEY_PREFIX = "smart_crop_sidebar_checklist";

export default function FeatureSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();

  const todayKey = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const storageKey = `${CHECKLIST_KEY_PREFIX}:${todayKey}`;
  const [checks, setChecks] = useState<boolean[]>([false, false, false]);

  const checklistItems = useMemo(
    () => [
      { key: "irrigation", label: t("dashboard.sidebarChecklistIrrigation"), icon: Droplets },
      { key: "scouting", label: t("dashboard.sidebarChecklistScouting"), icon: Bug },
      { key: "market", label: t("dashboard.sidebarChecklistMarket"), icon: TrendingUp },
    ],
    [t],
  );

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return;
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed) && parsed.length === checklistItems.length) {
        setChecks(parsed.map((item) => Boolean(item)));
      }
    } catch {
      // Ignore parsing/storage issues and keep defaults.
    }
  }, [checklistItems.length, storageKey]);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(checks));
    } catch {
      // Ignore storage write failures.
    }
  }, [checks, storageKey]);

  const completedCount = checks.filter(Boolean).length;
  const dateLabel = new Intl.DateTimeFormat(i18n.language === "hi" ? "hi-IN" : "en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(new Date());

  const quickActions = [
    { key: "weather", label: t("dashboard.sidebarActionWeather"), icon: Cloud, path: routes.weather },
    { key: "market", label: t("dashboard.sidebarActionMarket"), icon: MapPinned, path: routes.marketPrices },
    { key: "plan", label: t("dashboard.sidebarActionPlan"), icon: Calendar, path: routes.farmingSchedule },
  ] as const;

  return (
    <aside className="surface-card-strong p-2.5 h-fit lg:sticky lg:top-20" aria-label={t("dashboard.menu") || "Dashboard menu"}>
      <div className="space-y-2.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg font-semibold text-sm transition-colors ${
                isActive ? "text-forest-800 bg-forest-50" : "text-forest-700 hover:bg-forest-50"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{t(item.labelKey)}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-3 p-3 rounded-xl bg-forest-50 border border-forest-100">
        <p className="text-xs font-semibold text-forest-700 uppercase tracking-wide">{t("dashboard.sidebarToday")}</p>
        <p className="text-sm font-bold text-forest-900 mt-1">{dateLabel}</p>
        <p className="text-xs text-forest-800/90 mt-1">{t("dashboard.sidebarTodayHint")}</p>
      </div>

      <div className="mt-3 p-3 rounded-xl bg-white border border-forest-100">
        <p className="text-sm font-semibold text-forest-900 mb-2">{t("dashboard.sidebarQuickActions")}</p>
        <div className="space-y-1.5">
          {quickActions.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                onClick={() => navigate(item.path)}
                className="w-full inline-flex items-center gap-2 rounded-lg bg-forest-50 hover:bg-forest-100 text-forest-800 px-2.5 py-2 text-xs font-semibold transition-colors"
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-3 p-3 rounded-xl bg-white border border-forest-100">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-semibold text-forest-900 inline-flex items-center gap-1.5">
            <ListChecks className="h-4 w-4 text-forest-700" />
            {t("dashboard.sidebarChecklistTitle")}
          </p>
          <span className="text-xs font-semibold text-forest-700">
            {completedCount}/{checklistItems.length} {t("dashboard.sidebarChecklistDone")}
          </span>
        </div>
        <div className="space-y-1.5">
          {checklistItems.map((item, index) => {
            const checked = checks[index];
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                onClick={() => {
                  setChecks((prev) => prev.map((value, i) => (i === index ? !value : value)));
                }}
                className={`w-full text-left rounded-lg px-2.5 py-2 border text-xs font-medium transition-colors ${
                  checked ? "bg-leaf-50 border-leaf-200 text-forest-900" : "bg-forest-50 border-forest-100 text-forest-800"
                }`}
              >
                <span className="inline-flex items-center gap-2">
                  {checked ? <CheckCircle2 className="h-4 w-4 text-leaf-700" /> : <Icon className="h-4 w-4 text-forest-700" />}
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
