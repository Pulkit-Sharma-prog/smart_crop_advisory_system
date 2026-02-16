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
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAsyncData } from "../hooks/useAsyncData";
import { generateAdvisoryAlerts, type AdvisoryAlert } from "../services/alertService";
import {
  saveLastDiseaseResult,
  saveLastLocationAdvisory,
  saveLastSoilResult,
  saveProfile,
} from "../services/farmProfileService";
import { getMarketPrices, type MarketItem } from "../services/marketService";
import { getBackendHealth } from "../services/systemService";
import {
  getForecast,
  getWeatherSnapshot,
  type WeatherForecastItem,
  type WeatherSnapshot,
} from "../services/weatherService";
import { routes } from "../types/routes";

type DemoScenario = "rainy-risk" | "market-spike" | "balanced";

export default function Dashboard() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [activeScenario, setActiveScenario] = useState<DemoScenario | null>(null);

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

  const getRelativeDayLabel = (offset: number) => {
    if (offset === 0) return "Today";
    if (offset === 1) return "Tomorrow";
    return new Date(Date.now() + offset * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", { weekday: "long" });
  };

  const {
    data: weather,
    loading: weatherLoading,
    error: weatherError,
    reload: reloadWeather,
  } = useAsyncData(getWeatherSnapshot, { cacheKey: "weather-snapshot", ttlMs: 60000 });

  const { data: forecast } = useAsyncData(getForecast, {
    cacheKey: "weather-forecast",
    ttlMs: 60000,
  });

  const { data: marketData, reload: reloadMarket } = useAsyncData(getMarketPrices, {
    cacheKey: "market-prices",
    ttlMs: 45000,
  });

  const {
    data: backendHealth,
    error: backendError,
    reload: reloadBackend,
  } = useAsyncData(getBackendHealth, {
    cacheKey: "backend-health",
    ttlMs: 15000,
  });

  const demoWeather = useMemo<WeatherSnapshot | null>(() => {
    if (activeScenario === "rainy-risk") {
      return {
        currentTempC: 24,
        feelsLikeC: 27,
        humidityPercent: 88,
        windKmph: 23,
        highC: 26,
        lowC: 21,
        condition: "Heavy Rain",
      };
    }

    if (activeScenario === "market-spike") {
      return {
        currentTempC: 31,
        feelsLikeC: 34,
        humidityPercent: 61,
        windKmph: 12,
        highC: 34,
        lowC: 26,
        condition: "Partly Cloudy",
      };
    }

    if (activeScenario === "balanced") {
      return {
        currentTempC: 28,
        feelsLikeC: 30,
        humidityPercent: 68,
        windKmph: 11,
        highC: 30,
        lowC: 23,
        condition: "Cloudy",
      };
    }

    return null;
  }, [activeScenario]);

  const demoMarketData = useMemo<MarketItem[] | null>(() => {
    if (activeScenario === "rainy-risk") {
      return [
        { crop: "Rice", market: "Nashik Mandi", pricePerKg: 34, changePercent: 6.1 },
        { crop: "Onion", market: "Lasalgaon", pricePerKg: 22, changePercent: 3.2 },
      ];
    }

    if (activeScenario === "market-spike") {
      return [
        { crop: "Onion", market: "Indore Mandi", pricePerKg: 41, changePercent: 13.4 },
        { crop: "Tomato", market: "Pune Mandi", pricePerKg: 29, changePercent: 7.8 },
      ];
    }

    if (activeScenario === "balanced") {
      return [
        { crop: "Maize", market: "Belagavi Mandi", pricePerKg: 27, changePercent: 4.9 },
        { crop: "Soybean", market: "Hubli Mandi", pricePerKg: 33, changePercent: 2.7 },
      ];
    }

    return null;
  }, [activeScenario]);

  const demoForecast = useMemo<WeatherForecastItem[] | null>(() => {
    if (activeScenario === "rainy-risk") {
      const pattern = [
        { temperatureC: 24, condition: "Heavy Rain", rainChancePercent: 88 },
        { temperatureC: 25, condition: "Rainy", rainChancePercent: 81 },
        { temperatureC: 26, condition: "Rainy", rainChancePercent: 72 },
        { temperatureC: 27, condition: "Cloudy", rainChancePercent: 44 },
        { temperatureC: 27, condition: "Cloudy", rainChancePercent: 38 },
        { temperatureC: 28, condition: "Partly Cloudy", rainChancePercent: 29 },
        { temperatureC: 29, condition: "Sunny", rainChancePercent: 16 },
      ];
      return pattern.map((entry, index) => ({ day: getRelativeDayLabel(index), ...entry }));
    }

    if (activeScenario === "market-spike") {
      const pattern = [
        { temperatureC: 31, condition: "Sunny", rainChancePercent: 12 },
        { temperatureC: 32, condition: "Partly Cloudy", rainChancePercent: 18 },
        { temperatureC: 33, condition: "Sunny", rainChancePercent: 8 },
        { temperatureC: 32, condition: "Sunny", rainChancePercent: 10 },
        { temperatureC: 31, condition: "Sunny", rainChancePercent: 14 },
        { temperatureC: 30, condition: "Partly Cloudy", rainChancePercent: 19 },
        { temperatureC: 29, condition: "Cloudy", rainChancePercent: 26 },
      ];
      return pattern.map((entry, index) => ({ day: getRelativeDayLabel(index), ...entry }));
    }

    if (activeScenario === "balanced") {
      const pattern = [
        { temperatureC: 28, condition: "Cloudy", rainChancePercent: 36 },
        { temperatureC: 29, condition: "Partly Cloudy", rainChancePercent: 30 },
        { temperatureC: 29, condition: "Cloudy", rainChancePercent: 41 },
        { temperatureC: 30, condition: "Sunny", rainChancePercent: 24 },
        { temperatureC: 30, condition: "Partly Cloudy", rainChancePercent: 28 },
        { temperatureC: 29, condition: "Cloudy", rainChancePercent: 34 },
        { temperatureC: 28, condition: "Sunny", rainChancePercent: 20 },
      ];
      return pattern.map((entry, index) => ({ day: getRelativeDayLabel(index), ...entry }));
    }

    return null;
  }, [activeScenario]);

  const displayWeather = useMemo(() => demoWeather ?? weather ?? null, [demoWeather, weather]);
  const displayMarketData = useMemo(() => demoMarketData ?? marketData ?? null, [demoMarketData, marketData]);
  const displayForecast = useMemo(() => demoForecast ?? forecast ?? [], [demoForecast, forecast]);

  const topCrop = useMemo(() => {
    if (!displayMarketData || displayMarketData.length === 0) {
      return null;
    }

    return [...displayMarketData].sort((a, b) => b.changePercent - a.changePercent)[0];
  }, [displayMarketData]);

  const scenarioAlert = useMemo<AdvisoryAlert | null>(() => {
    if (activeScenario === "rainy-risk") {
      return {
        id: "demo-rainy-risk",
        title: t("dashboard.demoRainyRisk"),
        message: t("dashboard.demoRainyRiskStatus"),
        severity: "high",
      };
    }

    if (activeScenario === "market-spike") {
      return {
        id: "demo-market-spike",
        title: t("dashboard.demoMarketSpike"),
        message: t("dashboard.demoMarketSpikeStatus"),
        severity: "low",
      };
    }

    if (activeScenario === "balanced") {
      return {
        id: "demo-balanced",
        title: t("dashboard.demoBalanced"),
        message: t("dashboard.demoBalancedStatus"),
        severity: "medium",
      };
    }

    return null;
  }, [activeScenario, t]);

  const alerts = useMemo(() => {
    const baseAlerts = generateAdvisoryAlerts(displayWeather, displayMarketData, t);
    return scenarioAlert ? [scenarioAlert, ...baseAlerts] : baseAlerts;
  }, [displayWeather, displayMarketData, scenarioAlert, t]);

  const planner = useMemo(() => {
    return displayForecast.slice(0, 7).map((day) => {
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
  }, [displayForecast, t]);

  const applyDemoScenario = (scenario: DemoScenario) => {
    setActiveScenario(scenario);

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

  const getScenarioLabel = (scenario: DemoScenario) => {
    if (scenario === "rainy-risk") return t("dashboard.demoRainyRisk");
    if (scenario === "market-spike") return t("dashboard.demoMarketSpike");
    return t("dashboard.demoBalanced");
  };

  const currentRainChance = planner[0]?.rainChancePercent ?? 20;
  const hasDemoScenario = activeScenario !== null;

  return (
    <div className="page-wrap">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-4 md:gap-5">
        <aside
          className="surface-card-strong p-2 h-fit lg:sticky lg:top-20"
          aria-label={t("dashboard.menu") || "Dashboard menu"}
        >
          <div className="space-y-2">
            <button
              onClick={() => navigate(routes.dashboard)}
              className="w-full flex items-center space-x-2.5 px-3 py-2 text-forest-800 bg-forest-50 rounded-lg font-semibold text-sm"
            >
              <LayoutDashboard className="h-5 w-5" />
              <span>{t("dashboard.overview")}</span>
            </button>
            <button
              onClick={() => navigate(routes.weather)}
              className="w-full flex items-center space-x-2.5 px-3 py-2 text-forest-700 hover:bg-forest-50 rounded-lg font-semibold text-sm transition-colors"
            >
              <Cloud className="h-5 w-5" />
              <span>{t("weather.title")}</span>
            </button>
            <button
              onClick={() => navigate(routes.advisory)}
              className="w-full flex items-center space-x-2.5 px-3 py-2 text-forest-700 hover:bg-forest-50 rounded-lg font-semibold text-sm transition-colors"
            >
              <Sprout className="h-5 w-5" />
              <span>{t("soil.title")}</span>
            </button>
            <button
              onClick={() => navigate(routes.diseaseDetection)}
              className="w-full flex items-center space-x-2.5 px-3 py-2 text-forest-700 hover:bg-forest-50 rounded-lg font-semibold text-sm transition-colors"
            >
              <AlertTriangle className="h-5 w-5" />
              <span>{t("disease.title")}</span>
            </button>
            <button
              onClick={() => navigate(routes.farmingSchedule)}
              className="w-full flex items-center space-x-2.5 px-3 py-2 text-forest-700 hover:bg-forest-50 rounded-lg font-semibold text-sm transition-colors"
            >
              <Calendar className="h-5 w-5" />
              <span>{t("schedule.title")}</span>
            </button>
            <button
              onClick={() => navigate(routes.marketPrices)}
              className="w-full flex items-center space-x-2.5 px-3 py-2 text-forest-700 hover:bg-forest-50 rounded-lg font-semibold text-sm transition-colors"
            >
              <TrendingUp className="h-5 w-5" />
              <span>{t("market.title")}</span>
            </button>
          </div>
        </aside>

        <main>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <div>
              <h1 className="section-title">{t("dashboard.overview")}</h1>
              <p className="section-subtitle">{t("dashboard.subtitle")}</p>
            </div>
            <button onClick={() => void runRefresh()} className="btn-secondary">
              <RefreshCw className="h-4 w-4" />
              {t("dashboard.refresh")}
            </button>
          </div>

          <div className="surface-card-strong p-3.5 mb-3 fade-up">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <h3 className="text-lg font-semibold text-forest-900">{t("dashboard.demoScenariosTitle")}</h3>
              <div
                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                  hasDemoScenario ? "bg-forest-100 text-forest-800" : "bg-forest-50 text-forest-700"
                }`}
              >
                {hasDemoScenario
                  ? `${t("dashboard.demoActiveState")} ${getScenarioLabel(activeScenario)}`
                  : t("dashboard.demoLiveState")}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                className={`btn-secondary !px-3 !py-2 text-sm transition-all ${
                  activeScenario === "rainy-risk" ? "!bg-forest-600 !text-white !border-forest-600 shadow-md" : ""
                }`}
                onClick={() => applyDemoScenario("rainy-risk")}
              >
                {t("dashboard.demoRainyRisk")}
              </button>
              <button
                className={`btn-secondary !px-3 !py-2 text-sm transition-all ${
                  activeScenario === "market-spike" ? "!bg-forest-600 !text-white !border-forest-600 shadow-md" : ""
                }`}
                onClick={() => applyDemoScenario("market-spike")}
              >
                {t("dashboard.demoMarketSpike")}
              </button>
              <button
                className={`btn-secondary !px-3 !py-2 text-sm transition-all ${
                  activeScenario === "balanced" ? "!bg-forest-600 !text-white !border-forest-600 shadow-md" : ""
                }`}
                onClick={() => applyDemoScenario("balanced")}
              >
                {t("dashboard.demoBalanced")}
              </button>
              <button className="btn-secondary !px-3 !py-2 text-sm" onClick={() => setActiveScenario(null)}>
                {t("dashboard.demoReset")}
              </button>
            </div>
          </div>

          <div className="surface-card-strong p-3.5 mb-3 fade-up">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-forest-900 mb-1">{t("dashboard.platformStatus")}</p>
                <p className="text-sm text-forest-800/90">
                  {t("dashboard.backend")}:{" "}
                  <span className="font-semibold">
                    {backendError
                      ? t("dashboard.disconnected")
                      : backendHealth?.status === "ok"
                        ? t("dashboard.operational")
                        : t("dashboard.degraded")}
                  </span>
                </p>
              </div>
              <div
                className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${
                  backendError
                    ? "tone-danger"
                    : backendHealth?.status === "ok"
                      ? "tone-success"
                      : "tone-warning"
                }`}
              >
                <Server className="h-3.5 w-3.5" />
                {backendError
                  ? t("dashboard.disconnected")
                  : backendHealth?.status === "ok"
                    ? t("dashboard.operational")
                    : t("dashboard.degraded")}
              </div>
            </div>
          </div>

          <div className="surface-card-strong p-3.5 mb-3 fade-up">
            <h3 className="text-lg font-semibold text-forest-900 mb-3">{t("dashboard.smartAlertsTitle")}</h3>
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`rounded-xl border p-3 ${
                    alert.severity === "high"
                      ? "tone-danger"
                      : alert.severity === "medium"
                        ? "tone-warning"
                        : "tone-success"
                  }`}
                >
                  <p className="font-semibold text-forest-900 text-sm">{alert.title}</p>
                  <p className="text-sm text-forest-800/90">{alert.message}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="surface-card-strong p-3.5 mb-3 fade-up">
            <h3 className="text-lg font-semibold text-forest-900 mb-3">{t("dashboard.bestDayPlannerTitle")}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 stagger-in">
              {planner.map((day) => (
                <div
                  key={day.day}
                  className={`rounded-xl border p-3 ${
                    day.status === "red"
                      ? "tone-danger"
                      : day.status === "yellow"
                        ? "tone-warning"
                        : "tone-success"
                  }`}
                >
                  <p className="font-semibold text-forest-900 text-sm">{getDayLabel(day.day)}</p>
                  <p className="text-xs text-forest-800">
                    {getConditionLabel(day.condition)} | {t("weather.rain")} {day.rainChancePercent}%
                  </p>
                  <p className="text-xs text-forest-800 mt-1">{day.action}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5 mb-4 stagger-in">
            <div className="metric-card bg-gradient-to-br from-sky-500 to-sky-700 text-white">
              <p className="text-sky-100 text-sm font-semibold mb-1">{t("dashboard.currentWeather")}</p>
              <h3 className="text-3xl font-bold mb-1">
                {weatherLoading && !hasDemoScenario ? "--" : `${displayWeather?.currentTempC ?? "--"} C`}
              </h3>
              {weatherError && !hasDemoScenario ? (
                <p className="text-sm text-red-100">{t("dashboard.weatherUnavailable")}</p>
              ) : (
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2">
                    <CloudRain className="h-4 w-4" />
                    <span>
                      {t("weather.rain")}: {currentRainChance}%
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Droplets className="h-4 w-4" />
                    <span>
                      {t("weather.humidity")}: {displayWeather?.humidityPercent ?? "--"}%
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Wind className="h-4 w-4" />
                    <span>
                      {t("weather.wind")}: {displayWeather?.windKmph ?? "--"} km/h
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="metric-card">
              <h3 className="text-lg font-semibold text-forest-900 mb-4">{t("dashboard.todayAdvisory")}</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <div className="bg-forest-100 p-2 rounded-lg">
                    <Sprout className="h-5 w-5 text-forest-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-forest-900">{t("dashboard.idealSowing")}</p>
                    <p className="text-forest-800/90">{t("dashboard.soilMoisture")}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-sky-100 p-2 rounded-lg">
                    <Droplets className="h-5 w-5 text-sky-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-forest-900">{t("dashboard.irrigationNeeded")}</p>
                    <p className="text-forest-800/90">{t("dashboard.irrigationLine")}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="metric-card">
              <h3 className="text-lg font-semibold text-forest-900 mb-4">{t("dashboard.bestCropSell")}</h3>
              <div className="flex items-center gap-4">
                  <div className="bg-leaf-100 p-4 rounded-xl">
                    <TrendingUp className="h-10 w-10 text-leaf-600" />
                  </div>
                <div>
                  <p className="text-2xl font-bold text-forest-900">{topCrop?.crop ?? t("common.notAvailable")}</p>
                  <p className="text-sm text-forest-800/90">{topCrop?.market ?? t("dashboard.noMarketData")}</p>
                  {topCrop ? (
                    <span className="inline-block mt-2 bg-forest-100 text-forest-700 text-xs font-semibold px-3 py-1 rounded-full">
                      +{topCrop.changePercent}%
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-3.5 stagger-in">
            <div className="surface-card-strong p-4 border-l-4 border-red-500">
              <div className="flex items-start gap-4">
                <AlertTriangle className="h-6 w-6 text-red-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-bold text-red-900 mb-2">{t("dashboard.weatherAlert")}</h3>
                  <p className="text-red-800 mb-3 text-sm">{t("dashboard.weatherAlertDesc")}</p>
                  <button
                    onClick={() => navigate(routes.weather)}
                    className="text-red-700 font-semibold hover:text-red-900 text-sm underline"
                  >
                    {t("dashboard.viewDetails")}
                  </button>
                </div>
              </div>
            </div>

            <div className="surface-card-strong p-4">
              <h3 className="text-lg font-semibold text-forest-900 mb-4">{t("dashboard.marketSnapshot")}</h3>
              <div className="space-y-3">
                {(displayMarketData ?? []).slice(0, 2).map((item) => (
                  <div
                    key={`${item.crop}-${item.market}`}
                    className="flex items-center justify-between p-3 rounded-xl bg-forest-50/70 border border-forest-100"
                  >
                    <div>
                      <p className="font-semibold text-forest-900">{item.crop}</p>
                      <p className="text-sm text-forest-800/90">{item.market}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-forest-900">
                        Rs {item.pricePerKg}/{t("common.kgUnit")}
                      </p>
                      <p className="text-sm text-leaf-700 font-semibold">
                        {item.changePercent > 0 ? "+" : ""}
                        {item.changePercent}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={() => navigate(routes.marketPrices)} className="btn-secondary w-full mt-4">
                {t("dashboard.viewAllPrices")}
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
