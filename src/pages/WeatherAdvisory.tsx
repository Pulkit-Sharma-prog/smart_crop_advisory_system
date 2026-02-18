import { AlertTriangle, Cloud, CloudRain, Droplet, Droplets, LocateFixed, MapPin, Sun, Wind } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import FeatureSidebar from "../components/FeatureSidebar";
import LocationPickerMap from "../components/LocationPickerMap";
import { useAsyncData } from "../hooks/useAsyncData";
import { getForecast, getWeatherSnapshot, type WeatherLocationInput } from "../services/weatherService";

const DEFAULT_LAT = 20.5937;
const DEFAULT_LON = 78.9629;

export default function WeatherAdvisory() {
  const { t } = useTranslation();
  const [draftLat, setDraftLat] = useState(String(DEFAULT_LAT));
  const [draftLon, setDraftLon] = useState(String(DEFAULT_LON));
  const [activeLocation, setActiveLocation] = useState<WeatherLocationInput>({
    latitude: DEFAULT_LAT,
    longitude: DEFAULT_LON,
  });
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const { latitude, longitude } = activeLocation;

  const cacheSuffix = `${latitude.toFixed(4)}:${longitude.toFixed(4)}`;

  const loadSnapshot = useCallback(
    () => getWeatherSnapshot({ latitude, longitude }),
    [latitude, longitude],
  );

  const loadForecast = useCallback(
    () => getForecast({ latitude, longitude }),
    [latitude, longitude],
  );

  const {
    data: snapshot,
    loading,
    error,
    reload: reloadSnapshot,
  } = useAsyncData(loadSnapshot, {
    cacheKey: `weather-snapshot-${cacheSuffix}`,
    ttlMs: 60000,
  });

  const { data: forecast, reload: reloadForecast } = useAsyncData(loadForecast, {
    cacheKey: `weather-forecast-${cacheSuffix}`,
    ttlMs: 60000,
  });

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

  const applyLocation = () => {
    const latitude = Number(draftLat);
    const longitude = Number(draftLon);

    if (Number.isNaN(latitude) || Number.isNaN(longitude) || latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      setLocationError(t("weather.locationInvalid"));
      return;
    }

    setLocationError(null);
    setActiveLocation({ latitude, longitude });
  };

  const detectCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError(t("weather.geoUnsupported"));
      return;
    }

    setDetectingLocation(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = Number(position.coords.latitude.toFixed(4));
        const longitude = Number(position.coords.longitude.toFixed(4));

        setDraftLat(String(latitude));
        setDraftLon(String(longitude));
        setActiveLocation({ latitude, longitude });
        setDetectingLocation(false);
      },
      () => {
        setLocationError(t("weather.geoDenied"));
        setDetectingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 12000 },
    );
  };

  return (
    <div className="page-wrap">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-4 md:gap-5">
        <FeatureSidebar />
        <main className="min-w-0 space-y-4">
        <div>
          <h1 className="section-title">{t("weather.title")}</h1>
          <p className="section-subtitle">{t("weather.subtitle")}</p>
        </div>

        <div className="surface-card-strong p-4 md:p-5">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <h2 className="text-lg font-bold text-forest-900">{t("weather.locationTitle")}</h2>
              <p className="text-sm text-forest-800/90 mt-1">{t("weather.locationSubtitle")}</p>
            </div>
            <button type="button" onClick={detectCurrentLocation} disabled={detectingLocation} className="btn-secondary !px-3 !py-2">
              <LocateFixed className="h-4 w-4" />
              {detectingLocation ? t("weather.detecting") : t("weather.detectCurrent")}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
            <div>
              <label htmlFor="weather-lat" className="block text-xs font-semibold text-forest-800 mb-1">{t("weather.latitude")}</label>
              <input
                id="weather-lat"
                value={draftLat}
                onChange={(event) => setDraftLat(event.target.value)}
                className="w-full px-3 py-2 border border-forest-200 rounded-xl"
                placeholder={t("weather.latitudePlaceholder")}
              />
            </div>
            <div>
              <label htmlFor="weather-lon" className="block text-xs font-semibold text-forest-800 mb-1">{t("weather.longitude")}</label>
              <input
                id="weather-lon"
                value={draftLon}
                onChange={(event) => setDraftLon(event.target.value)}
                className="w-full px-3 py-2 border border-forest-200 rounded-xl"
                placeholder={t("weather.longitudePlaceholder")}
              />
            </div>
          </div>

          <div className="mb-3">
            <div className="text-xs text-forest-800/90 bg-forest-50 rounded px-2 py-1 inline-block mb-2">{t("weather.mapHint")}</div>
            <LocationPickerMap
              value={{ latitude: Number(draftLat) || DEFAULT_LAT, longitude: Number(draftLon) || DEFAULT_LON }}
              className="h-48 md:h-56"
              onChange={(next) => {
                setDraftLat(next.latitude.toFixed(4));
                setDraftLon(next.longitude.toFixed(4));
              }}
            />
          </div>

          <button type="button" onClick={applyLocation} className="btn-primary w-full">
            <MapPin className="h-4 w-4" />
            {t("weather.applyLocation")}
          </button>

          {locationError ? <p className="mt-3 text-sm text-red-600">{locationError}</p> : null}

          <p className="mt-2 text-xs text-forest-700/90">
            {t("weather.currentLocationLabel")}: {activeLocation.latitude.toFixed(4)}, {activeLocation.longitude.toFixed(4)}
          </p>
        </div>

        {error ? (
          <div className="surface-card-strong tone-danger p-4">
            <p>{t("weather.loadError")}</p>
            <button onClick={() => { void reloadSnapshot(); void reloadForecast(); }} className="mt-2 text-sm underline font-semibold">{t("common.retry")}</button>
          </div>
        ) : null}

        <div className="surface-card-strong border-l-4 border-rose-500 p-4 md:p-5 tone-danger">
          <div className="flex items-start gap-4">
            <AlertTriangle className="h-5 w-5 text-rose-700 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-base font-bold text-rose-900 mb-1">{t("weather.warningTitle")}</h3>
              <p className="text-rose-800 mb-2 text-sm">{t("weather.warningDesc")}</p>
              <ul className="list-disc list-inside text-rose-800 space-y-1 text-sm">
                <li>{t("weather.warningPoint1")}</li>
                <li>{t("weather.warningPoint2")}</li>
                <li>{t("weather.warningPoint3")}</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          <div className="metric-card bg-gradient-to-br from-sky-500 to-sky-700 text-white !p-4">
            <div className="flex items-center justify-between mb-3"><h3 className="text-sm font-semibold">{t("weather.temperature")}</h3><Sun className="h-5 w-5" /></div>
            <p className="text-3xl font-bold mb-1">{loading ? "--" : `${snapshot?.currentTempC ?? "--"} C`}</p>
            <p className="text-sky-100 text-sm">{t("weather.feelsLike")} {snapshot?.feelsLikeC ?? "--"} C</p>
            <div className="mt-3 pt-3 border-t border-sky-400 text-xs flex justify-between">
              <span>{t("weather.high")}: {snapshot?.highC ?? "--"} C</span>
              <span>{t("weather.low")}: {snapshot?.lowC ?? "--"} C</span>
            </div>
          </div>

          <div className="metric-card bg-gradient-to-br from-sky-600 to-sky-800 text-white !p-4">
            <div className="flex items-center justify-between mb-3"><h3 className="text-sm font-semibold">{t("weather.humidity")}</h3><Droplets className="h-5 w-5" /></div>
            <p className="text-3xl font-bold mb-1">{snapshot?.humidityPercent ?? "--"}%</p>
            <p className="text-sky-100 text-sm">{t("weather.humidityDesc")}</p>
          </div>

          <div className="metric-card bg-gradient-to-br from-forest-600 to-forest-800 text-white !p-4">
            <div className="flex items-center justify-between mb-3"><h3 className="text-sm font-semibold">{t("weather.wind")}</h3><Wind className="h-5 w-5" /></div>
            <p className="text-3xl font-bold mb-1">{snapshot?.windKmph ?? "--"} km/h</p>
            <p className="text-forest-100 text-sm">{t("weather.windDesc")}</p>
          </div>
        </div>

        <div className="surface-card-strong p-4 md:p-5">
          <h2 className="text-lg font-bold text-forest-900 mb-4">{t("weather.forecastTitle")}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {days.map((day) => (
              <div key={day.day} className="surface-card p-3 text-center">
                <p className="font-semibold text-forest-900 mb-2 text-sm">{getDayLabel(day.day)}</p>
                {day.condition.toLowerCase().includes("rain") ? <CloudRain className="h-8 w-8 mx-auto mb-2 text-sky-600" /> : <Cloud className="h-8 w-8 mx-auto mb-2 text-sky-600" />}
                <p className="text-xl font-bold text-forest-900 mb-1">{day.temperatureC} C</p>
                <p className="text-xs text-forest-700/90 mb-1">{getConditionLabel(day.condition)}</p>
                <div className="flex items-center justify-center gap-1 text-sm text-sky-700"><CloudRain className="h-4 w-4" /><span>{day.rainChancePercent}%</span></div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <div className="surface-card-strong p-4 md:p-5">
            <div className="flex items-center gap-3 mb-4"><div className="bg-sky-100 p-2 rounded-lg"><Droplet className="h-5 w-5 text-sky-600" /></div><h2 className="text-lg font-bold text-forest-900">{t("weather.irrigationTitle")}</h2></div>
            <div className="space-y-3 text-sm text-forest-800">
              <p className="p-3 bg-green-50 rounded-xl border border-green-200">{t("weather.irrigation1")}</p>
              <p className="p-3 bg-yellow-50 rounded-xl border border-yellow-200">{t("weather.irrigation2")}</p>
              <p className="p-3 bg-red-50 rounded-xl border border-red-200">{t("weather.irrigation3")}</p>
            </div>
          </div>

          <div className="surface-card-strong p-4 md:p-5">
            <h2 className="text-lg font-bold text-forest-900 mb-4">{t("weather.activityTitle")}</h2>
            <ul className="space-y-2 text-sm text-forest-800">
              <li>{t("weather.activity1")}</li>
              <li>{t("weather.activity2")}</li>
              <li>{t("weather.activity3")}</li>
              <li>{t("weather.activity4")}</li>
            </ul>
          </div>
        </div>
        </main>
      </div>
    </div>
  );
}
