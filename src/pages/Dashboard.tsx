import {
  AlertTriangle,
  Calendar,
  Cloud,
  CloudRain,
  Droplets,
  LayoutDashboard,
  RefreshCw,
  Server,
  Sprout,
  TrendingUp,
  Wind,
} from "lucide-react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAsyncData } from "../hooks/useAsyncData";
import { generateAdvisoryAlerts } from "../services/alertService";
import { saveLastDiseaseResult, saveLastLocationAdvisory, saveLastSoilResult, saveProfile } from "../services/farmProfileService";
import { getMarketPrices } from "../services/marketService";
import { getBackendHealth } from "../services/systemService";
import { getForecast, getWeatherSnapshot } from "../services/weatherService";
import { routes } from "../types/routes";

export default function Dashboard() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const getDayLabel = (day: string) => {
    const map: Record<string, string> = {
      Today: t("common.dayToday"),
      Tomorrow: t("common.dayTomorrow"),
      Monday: t("common.dayMonday"),
      Tuesday: t("common.dayTuesday"),
      Wednesday: t("common.dayWednesday"),
      Thursday: t("common.dayThursday"),
      Friday: t("common.dayFriday"),
      Saturday: t("common.daySaturday"),
      Sunday: t("common.daySunday"),
    };
    return map[day] ?? day;
  };
  const getConditionLabel = (condition: string) => {
    const map: Record<string, string> = {
      Sunny: t("common.conditionSunny"),
      Cloudy: t("common.conditionCloudy"),
      "Partly Cloudy": t("common.conditionPartlyCloudy"),
      Rainy: t("common.conditionRainy"),
      "Heavy Rain": t("common.conditionHeavyRain"),
    };
    return map[condition] ?? condition;
  };

  const {
    data: weather,
    loading: weatherLoading,
    error: weatherError,
    reload: reloadWeather,
  } = useAsyncData(getWeatherSnapshot, { cacheKey: "weather-snapshot", ttlMs: 60000 });

  const { data: forecast } = useAsyncData(getForecast, { cacheKey: "weather-forecast", ttlMs: 60000 });

  const { data: marketData, reload: reloadMarket } = useAsyncData(getMarketPrices, {
    cacheKey: "market-prices",
    ttlMs: 45000,
  });

  const { data: backendHealth, error: backendError, reload: reloadBackend } = useAsyncData(getBackendHealth, {
    cacheKey: "backend-health",
    ttlMs: 15000,
  });

  const topCrop = useMemo(() => {
    if (!marketData || marketData.length === 0) {
      return null;
    }

    return [...marketData].sort((a, b) => b.changePercent - a.changePercent)[0];
  }, [marketData]);

  const alerts = useMemo(() => generateAdvisoryAlerts(weather ?? null, marketData ?? null, t), [weather, marketData, t]);

  const planner = useMemo(() => {
    return (forecast ?? []).slice(0, 7).map((day) => {
      const risky = day.rainChancePercent >= 70 || day.condition.toLowerCase().includes("heavy");
      const moderate = day.rainChancePercent >= 40;
      const status = risky ? "red" : moderate ? "yellow" : "green";
      const action = risky
        ? t("dashboard.plannerActionHighRisk")
        : moderate
          ? t("dashboard.plannerActionModerateRisk")
          : t("dashboard.plannerActionLowRisk");
      return { ...day, status, action };
    });
  }, [forecast, t]);

  const applyDemoScenario = (scenario: "rainy-risk" | "market-spike" | "balanced") => {
    if (scenario === "rainy-risk") {
      saveProfile({ farmerName: "Ravi", village: "Nashik", primaryCrop: "Tomato", landSizeAcres: 4 });
      saveLastSoilResult({ healthLabel: "Moderate", healthScore: 62 });
      saveLastDiseaseResult({ primary: { name: "Leaf Blight", confidence: 88 } });
      saveLastLocationAdvisory({ climate: { zone: "Tropical wet-dry" }, soil: { soilType: "Clay loam" } });
      return;
    }

    if (scenario === "market-spike") {
      saveProfile({ farmerName: "Sita", village: "Indore", primaryCrop: "Onion", landSizeAcres: 7 });
      saveLastSoilResult({ healthLabel: "Good", healthScore: 78 });
      saveLastDiseaseResult({ primary: { name: "Mild Rust", confidence: 67 } });
      saveLastLocationAdvisory({ climate: { zone: "Subtropical continental" }, soil: { soilType: "Alluvial loam" } });
      return;
    }

    saveProfile({ farmerName: "Aman", village: "Belagavi", primaryCrop: "Maize", landSizeAcres: 5 });
    saveLastSoilResult({ healthLabel: "Good", healthScore: 74 });
    saveLastDiseaseResult({ primary: { name: "No major disease", confidence: 72 } });
    saveLastLocationAdvisory({ climate: { zone: "Tropical humid" }, soil: { soilType: "Red loam" } });
  };

  const runRefresh = async () => {
    await Promise.all([reloadWeather(), reloadMarket(), reloadBackend()]);
  };

  return (
    <div className="page-wrap">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-6">
        <aside className="surface-card-strong p-3 h-fit lg:sticky lg:top-24" aria-label={t("dashboard.menu") || "Dashboard menu"}>
          <div className="space-y-2">
            <button onClick={() => navigate(routes.dashboard)} className="w-full flex items-center space-x-3 px-4 py-3 text-forest-800 bg-forest-50 rounded-xl font-semibold">
              <LayoutDashboard className="h-5 w-5" />
              <span>{t("dashboard.overview")}</span>
            </button>
            <button onClick={() => navigate(routes.weather)} className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-xl font-semibold transition-colors"><Cloud className="h-5 w-5" /><span>{t("weather.title")}</span></button>
            <button onClick={() => navigate(routes.advisory)} className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-xl font-semibold transition-colors"><Sprout className="h-5 w-5" /><span>{t("soil.title")}</span></button>
            <button onClick={() => navigate(routes.diseaseDetection)} className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-xl font-semibold transition-colors"><AlertTriangle className="h-5 w-5" /><span>{t("disease.title")}</span></button>
            <button onClick={() => navigate(routes.farmingSchedule)} className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-xl font-semibold transition-colors"><Calendar className="h-5 w-5" /><span>{t("schedule.title")}</span></button>
            <button onClick={() => navigate(routes.marketPrices)} className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-xl font-semibold transition-colors"><TrendingUp className="h-5 w-5" /><span>{t("market.title")}</span></button>
          </div>
        </aside>

        <main>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="section-title">{t("dashboard.overview")}</h1>
              <p className="section-subtitle">{t("dashboard.subtitle")}</p>
            </div>
            <button onClick={() => void runRefresh()} className="btn-secondary">
              <RefreshCw className="h-4 w-4" />
              {t("dashboard.refresh")}
            </button>
          </div>

          <div className="surface-card-strong p-4 mb-4 fade-up">
              <h3 className="text-lg font-semibold text-forest-900 mb-3">{t("dashboard.demoScenariosTitle")}</h3>
              <div className="flex flex-wrap gap-2">
              <button className="btn-secondary !px-3 !py-2 text-sm" onClick={() => applyDemoScenario("rainy-risk")}>{t("dashboard.demoRainyRisk")}</button>
              <button className="btn-secondary !px-3 !py-2 text-sm" onClick={() => applyDemoScenario("market-spike")}>{t("dashboard.demoMarketSpike")}</button>
              <button className="btn-secondary !px-3 !py-2 text-sm" onClick={() => applyDemoScenario("balanced")}>{t("dashboard.demoBalanced")}</button>
            </div>
            <p className="text-xs text-forest-700 mt-2">{t("dashboard.demoHint")}</p>
          </div>

          <div className="surface-card-strong p-4 mb-4 fade-up">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-forest-900 mb-1">{t("dashboard.platformStatus")}</p>
                <p className="text-sm text-forest-800/90">
                  {t("dashboard.backend")}:{" "}
                  <span className="font-semibold">
                    {backendError ? t("dashboard.disconnected") : backendHealth?.status === "ok" ? t("dashboard.operational") : t("dashboard.degraded")}
                  </span>
                </p>
              </div>
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${backendError ? "bg-red-50 text-red-700" : backendHealth?.status === "ok" ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>
                <Server className="h-3.5 w-3.5" />
                {backendError ? t("dashboard.disconnected") : backendHealth?.status === "ok" ? t("dashboard.operational") : t("dashboard.degraded")}
              </div>
            </div>
          </div>

          <div className="surface-card-strong p-4 mb-4 fade-up">
            <h3 className="text-lg font-semibold text-forest-900 mb-3">{t("dashboard.smartAlertsTitle")}</h3>
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div key={alert.id} className={`rounded-xl border p-3 ${alert.severity === "high" ? "bg-red-50 border-red-200" : alert.severity === "medium" ? "bg-yellow-50 border-yellow-200" : "bg-green-50 border-green-200"}`}>
                  <p className="font-semibold text-forest-900 text-sm">{alert.title}</p>
                  <p className="text-sm text-forest-800/90">{alert.message}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="surface-card-strong p-4 mb-4 fade-up">
            <h3 className="text-lg font-semibold text-forest-900 mb-3">{t("dashboard.bestDayPlannerTitle")}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 stagger-in">
              {planner.map((day) => (
                <div key={day.day} className={`rounded-xl border p-3 ${day.status === "red" ? "bg-red-50 border-red-200" : day.status === "yellow" ? "bg-yellow-50 border-yellow-200" : "bg-green-50 border-green-200"}`}>
                  <p className="font-semibold text-forest-900 text-sm">{getDayLabel(day.day)}</p>
                  <p className="text-xs text-forest-800">{getConditionLabel(day.condition)} | {t("weather.rain")} {day.rainChancePercent}%</p>
                  <p className="text-xs text-forest-800 mt-1">{day.action}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mb-6 stagger-in">
            <div className="metric-card bg-gradient-to-br from-sky-500 to-sky-700 text-white">
              <p className="text-sky-100 text-sm font-semibold mb-1">{t("dashboard.currentWeather")}</p>
              <h3 className="text-3xl font-bold mb-1">{weatherLoading ? "--" : `${weather?.currentTempC ?? "--"} C`}</h3>
              {weatherError ? (
                <p className="text-sm text-red-100">{t("dashboard.weatherUnavailable")}</p>
              ) : (
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2"><CloudRain className="h-4 w-4" /><span>{t("weather.rain")}: 20%</span></div>
                  <div className="flex items-center gap-2"><Droplets className="h-4 w-4" /><span>{t("weather.humidity")}: {weather?.humidityPercent ?? "--"}%</span></div>
                  <div className="flex items-center gap-2"><Wind className="h-4 w-4" /><span>{t("weather.wind")}: {weather?.windKmph ?? "--"} km/h</span></div>
                </div>
              )}
            </div>

            <div className="metric-card">
              <h3 className="text-lg font-semibold text-forest-900 mb-4">{t("dashboard.todayAdvisory")}</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <div className="bg-forest-100 p-2 rounded-lg"><Sprout className="h-5 w-5 text-forest-600" /></div>
                  <div><p className="font-semibold text-forest-900">{t("dashboard.idealSowing")}</p><p className="text-forest-800/90">{t("dashboard.soilMoisture")}</p></div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-sky-100 p-2 rounded-lg"><Droplets className="h-5 w-5 text-sky-600" /></div>
                  <div><p className="font-semibold text-forest-900">{t("dashboard.irrigationNeeded")}</p><p className="text-forest-800/90">{t("dashboard.irrigationLine")}</p></div>
                </div>
              </div>
            </div>

            <div className="metric-card">
              <h3 className="text-lg font-semibold text-forest-900 mb-4">{t("dashboard.bestCropSell")}</h3>
              <div className="flex items-center gap-4">
                <div className="bg-leaf-100 p-4 rounded-xl"><TrendingUp className="h-10 w-10 text-leaf-600" /></div>
                <div>
                  <p className="text-2xl font-bold text-forest-900">{topCrop?.crop ?? t("common.notAvailable")}</p>
                  <p className="text-sm text-forest-800/90">{topCrop?.market ?? t("dashboard.noMarketData")}</p>
                  {topCrop ? <span className="inline-block mt-2 bg-forest-100 text-forest-700 text-xs font-semibold px-3 py-1 rounded-full">+{topCrop.changePercent}%</span> : null}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 stagger-in">
            <div className="surface-card-strong p-4 border-l-4 border-red-500">
              <div className="flex items-start gap-4">
                <AlertTriangle className="h-6 w-6 text-red-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-bold text-red-900 mb-2">{t("dashboard.weatherAlert")}</h3>
                  <p className="text-red-800 mb-3 text-sm">{t("dashboard.weatherAlertDesc")}</p>
                  <button onClick={() => navigate(routes.weather)} className="text-red-700 font-semibold hover:text-red-900 text-sm underline">
                    {t("dashboard.viewDetails")}
                  </button>
                </div>
              </div>
            </div>

            <div className="surface-card-strong p-4">
              <h3 className="text-lg font-semibold text-forest-900 mb-4">{t("dashboard.marketSnapshot")}</h3>
              <div className="space-y-3">
                {(marketData ?? []).slice(0, 2).map((item) => (
                  <div key={`${item.crop}-${item.market}`} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <div>
                      <p className="font-semibold text-forest-900">{item.crop}</p>
                      <p className="text-sm text-forest-800/90">{item.market}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-forest-900">Rs {item.pricePerKg}/{t("common.kgUnit")}</p>
                      <p className="text-sm text-green-600 font-semibold">{item.changePercent > 0 ? "+" : ""}{item.changePercent}%</p>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={() => navigate(routes.marketPrices)} className="btn-secondary w-full mt-4">{t("dashboard.viewAllPrices")}</button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

