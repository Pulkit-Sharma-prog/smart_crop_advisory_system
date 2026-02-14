import { AlertTriangle, Cloud, CloudRain, Droplet, Droplets, Sun, Wind } from "lucide-react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useAsyncData } from "../hooks/useAsyncData";
import { getForecast, getWeatherSnapshot } from "../services/weatherService";

export default function WeatherAdvisory() {
  const { t } = useTranslation();
  const { data: snapshot, loading, error, reload } = useAsyncData(getWeatherSnapshot, { cacheKey: "weather-snapshot", ttlMs: 60000 });
  const { data: forecast } = useAsyncData(getForecast, { cacheKey: "weather-forecast", ttlMs: 60000 });

  const days = useMemo(() => forecast ?? [], [forecast]);
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

  return (
    <div className="min-h-screen px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="section-title">{t("weather.title")}</h1>
          <p className="section-subtitle">{t("weather.subtitle")}</p>
        </div>

        {error ? (
          <div className="surface-card-strong border border-red-200 bg-red-50 p-4">
            <p className="text-red-800">{t("weather.loadError")}</p>
            <button onClick={() => void reload()} className="mt-2 text-sm underline text-red-900 font-semibold">{t("common.retry")}</button>
          </div>
        ) : null}

        <div className="surface-card-strong border-l-4 border-red-500 p-6">
          <div className="flex items-start gap-4">
            <AlertTriangle className="h-6 w-6 text-red-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-bold text-red-900 mb-2">{t("weather.warningTitle")}</h3>
              <p className="text-red-800 mb-2 text-sm">{t("weather.warningDesc")}</p>
              <ul className="list-disc list-inside text-red-800 space-y-1 text-sm">
                <li>{t("weather.warningPoint1")}</li>
                <li>{t("weather.warningPoint2")}</li>
                <li>{t("weather.warningPoint3")}</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="metric-card bg-gradient-to-br from-sky-500 to-sky-700 text-white">
            <div className="flex items-center justify-between mb-4"><h3 className="text-lg font-semibold">{t("weather.temperature")}</h3><Sun className="h-8 w-8" /></div>
            <p className="text-4xl font-bold mb-2">{loading ? "--" : `${snapshot?.currentTempC ?? "--"} C`}</p>
            <p className="text-sky-100">{t("weather.feelsLike")} {snapshot?.feelsLikeC ?? "--"} C</p>
            <div className="mt-4 pt-4 border-t border-sky-400 text-sm flex justify-between">
              <span>{t("weather.high")}: {snapshot?.highC ?? "--"} C</span>
              <span>{t("weather.low")}: {snapshot?.lowC ?? "--"} C</span>
            </div>
          </div>

          <div className="metric-card bg-gradient-to-br from-blue-500 to-blue-700 text-white">
            <div className="flex items-center justify-between mb-4"><h3 className="text-lg font-semibold">{t("weather.humidity")}</h3><Droplets className="h-8 w-8" /></div>
            <p className="text-4xl font-bold mb-2">{snapshot?.humidityPercent ?? "--"}%</p>
            <p className="text-blue-100">{t("weather.humidityDesc")}</p>
          </div>

          <div className="metric-card bg-gradient-to-br from-teal-500 to-teal-700 text-white">
            <div className="flex items-center justify-between mb-4"><h3 className="text-lg font-semibold">{t("weather.wind")}</h3><Wind className="h-8 w-8" /></div>
            <p className="text-4xl font-bold mb-2">{snapshot?.windKmph ?? "--"} km/h</p>
            <p className="text-teal-100">{t("weather.windDesc")}</p>
          </div>
        </div>

        <div className="surface-card-strong p-6">
          <h2 className="text-xl font-bold text-forest-900 mb-6">{t("weather.forecastTitle")}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {days.map((day) => (
              <div key={day.day} className="surface-card p-4 text-center">
                <p className="font-semibold text-forest-900 mb-3">{getDayLabel(day.day)}</p>
                {day.condition.toLowerCase().includes("rain") ? <CloudRain className="h-10 w-10 mx-auto mb-3 text-sky-600" /> : <Cloud className="h-10 w-10 mx-auto mb-3 text-sky-600" />}
                <p className="text-2xl font-bold text-forest-900 mb-1">{day.temperatureC} C</p>
                <p className="text-xs text-forest-700/80 mb-2">{getConditionLabel(day.condition)}</p>
                <div className="flex items-center justify-center gap-1 text-sm text-blue-600"><CloudRain className="h-4 w-4" /><span>{day.rainChancePercent}%</span></div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="surface-card-strong p-6">
            <div className="flex items-center gap-3 mb-6"><div className="bg-blue-100 p-3 rounded-lg"><Droplet className="h-6 w-6 text-blue-600" /></div><h2 className="text-xl font-bold text-forest-900">{t("weather.irrigationTitle")}</h2></div>
            <div className="space-y-3 text-sm text-forest-800">
              <p className="p-4 bg-green-50 rounded-xl border border-green-200">{t("weather.irrigation1")}</p>
              <p className="p-4 bg-yellow-50 rounded-xl border border-yellow-200">{t("weather.irrigation2")}</p>
              <p className="p-4 bg-red-50 rounded-xl border border-red-200">{t("weather.irrigation3")}</p>
            </div>
          </div>

          <div className="surface-card-strong p-6">
            <h2 className="text-xl font-bold text-forest-900 mb-6">{t("weather.activityTitle")}</h2>
            <ul className="space-y-3 text-sm text-forest-800">
              <li>{t("weather.activity1")}</li>
              <li>{t("weather.activity2")}</li>
              <li>{t("weather.activity3")}</li>
              <li>{t("weather.activity4")}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
