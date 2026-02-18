import { Info, MapPin, Star, TrendingDown, TrendingUp, Truck } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import FeatureSidebar from "../components/FeatureSidebar";
import { useAsyncData } from "../hooks/useAsyncData";
import { getMarketPrices } from "../services/marketService";

const DEFAULT_LAT = 20.5937;
const DEFAULT_LON = 78.9629;

export default function MarketPrices() {
  const { t } = useTranslation();
  const [selectedCrop, setSelectedCrop] = useState("");
  const [transportCostPerKm, setTransportCostPerKm] = useState(3);
  const [activeLocation, setActiveLocation] = useState({ latitude: DEFAULT_LAT, longitude: DEFAULT_LON });
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [locationStatus, setLocationStatus] = useState<"fallback" | "detected">("fallback");

  const { latitude, longitude } = activeLocation;
  const cacheSuffix = `${latitude.toFixed(4)}:${longitude.toFixed(4)}`;

  const loadMarketPrices = useCallback(() => getMarketPrices({ latitude, longitude }), [latitude, longitude]);

  const { data, loading, error, reload } = useAsyncData(loadMarketPrices, {
    cacheKey: `market-prices-${cacheSuffix}`,
    ttlMs: 45000,
  });

  const cropOptions = useMemo(() => {
    return Array.from(new Set((data ?? []).map((item) => item.crop)));
  }, [data]);

  useEffect(() => {
    if (cropOptions.length === 0) {
      setSelectedCrop("");
      return;
    }

    if (!selectedCrop || !cropOptions.includes(selectedCrop)) {
      setSelectedCrop(cropOptions[0]);
    }
  }, [cropOptions, selectedCrop]);

  const detectCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus("fallback");
      return;
    }

    setDetectingLocation(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextLatitude = Number(position.coords.latitude.toFixed(4));
        const nextLongitude = Number(position.coords.longitude.toFixed(4));
        setActiveLocation({ latitude: nextLatitude, longitude: nextLongitude });
        setLocationStatus("detected");
        setDetectingLocation(false);
      },
      () => {
        setLocationStatus("fallback");
        setDetectingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 12000 },
    );
  };

  const ranked = useMemo(() => {
    if (!data || data.length === 0) return { top: null, stable: null, low: null };

    const sorted = [...data].sort((a, b) => b.changePercent - a.changePercent);
    const top = sorted[0] ?? null;
    const low = sorted[sorted.length - 1] ?? null;
    const stable = [...data].sort((a, b) => Math.abs(a.changePercent) - Math.abs(b.changePercent))[0] ?? null;

    return { top, stable, low };
  }, [data]);

  const comparisonRows = useMemo(() => {
    if (!selectedCrop) return [];

    return (data ?? [])
      .filter((item) => item.crop === selectedCrop)
      .map((item) => {
        const distance = item.distanceKm ?? 120;
        const transportCost = (distance * transportCostPerKm) / 100;
        return {
          ...item,
          distance,
          netPricePerKg: Number((item.pricePerKg - transportCost).toFixed(2)),
        };
      })
      .sort((a, b) => a.distance - b.distance);
  }, [data, selectedCrop, transportCostPerKm]);

  const bestNet = [...comparisonRows].sort((a, b) => b.netPricePerKg - a.netPricePerKg)[0] ?? null;
  const topMarket = [...comparisonRows].sort((a, b) => b.pricePerKg - a.pricePerKg)[0] ?? null;
  const lowMarket = [...comparisonRows].sort((a, b) => a.pricePerKg - b.pricePerKg)[0] ?? null;
  const spread = topMarket && lowMarket ? Number((topMarket.pricePerKg - lowMarket.pricePerKg).toFixed(2)) : 0;
  const nearestMarket = comparisonRows[0] ?? null;

  const sortedDataByDistance = useMemo(() => {
    return [...(data ?? [])].sort((a, b) => (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999));
  }, [data]);

  return (
    <div className="page-wrap">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-4 md:gap-5">
        <FeatureSidebar />
        <main className="min-w-0 space-y-4 md:space-y-5">
        <div>
          <h1 className="section-title">{t("market.title")}</h1>
          <p className="section-subtitle">{t("market.subtitle")}</p>
        </div>

        {error ? (
          <div className="surface-card-strong tone-danger p-3.5">
            <p>{t("market.loadError")}</p>
            <button onClick={() => void reload()} className="mt-2 text-sm underline font-semibold">{t("common.retry")}</button>
          </div>
        ) : null}

        <div className="surface-card-strong p-3.5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-forest-900">{t("market.locationTitle")}</h2>
              <p className="text-sm text-forest-800/90 mt-1">
                {locationStatus === "detected"
                  ? t("market.locationUsing", { latitude: activeLocation.latitude, longitude: activeLocation.longitude })
                  : t("market.locationFallback")}
              </p>
            </div>
            <button onClick={detectCurrentLocation} className="btn-secondary" disabled={detectingLocation}>
              <MapPin className="h-4 w-4" />
              {detectingLocation ? t("market.detectingLocation") : t("market.detectLocation")}
            </button>
          </div>
        </div>

        <div className="hero-panel p-4 md:p-5 text-white fade-up">
          <div className="flex items-start gap-4 relative z-10">
            <div className="bg-white/20 p-2.5 rounded-lg"><Star className="h-7 w-7" /></div>
            <div className="flex-1">
              <h2 className="text-xl md:text-2xl font-bold mb-1.5">{t("market.bestSellTitle")}</h2>
              <p className="text-forest-100 text-sm mb-3">{t("market.bestSellDesc")}</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-white/10 rounded-xl px-3 py-2.5 border border-white/10">
                  <p className="text-forest-100 text-sm mb-1">{t("market.crop")}</p>
                  <p className="text-lg md:text-xl font-bold">{ranked.top?.crop ?? t("common.notAvailable")}</p>
                </div>
                <div className="bg-white/10 rounded-xl px-3 py-2.5 border border-white/10">
                  <p className="text-forest-100 text-sm mb-1">{t("market.currentPrice")}</p>
                  <p className="text-lg md:text-xl font-bold">Rs {ranked.top?.pricePerKg ?? "--"}/kg</p>
                </div>
                <div className="bg-white/10 rounded-xl px-3 py-2.5 border border-white/10">
                  <p className="text-forest-100 text-sm mb-1">{t("market.priceIncrease")}</p>
                  <p className="text-lg md:text-xl font-bold text-leaf-200 flex items-center gap-1">
                    <TrendingUp className="h-5 w-5" />
                    {ranked.top?.changePercent ?? "--"}%
                  </p>
                </div>
              </div>
              {nearestMarket ? (
                <p className="mt-4 text-sm text-forest-100">
                  {t("market.nearestMandi")}: <span className="font-semibold text-white">{nearestMarket.market}</span> ({t("market.nearestDistance", { distance: nearestMarket.distance })})
                </p>
              ) : null}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5 stagger-in">
          <div className="surface-card-strong p-3.5">
            <div className="flex items-center justify-between mb-4"><h3 className="font-semibold text-forest-900">{t("market.topGainer")}</h3><TrendingUp className="h-5 w-5 text-leaf-600" /></div>
            <p className="text-2xl font-bold text-forest-900 mb-1">{ranked.top?.crop ?? t("common.notAvailable")}</p>
            <p className="text-leaf-700 font-semibold text-lg">{ranked.top?.changePercent ?? "--"}%</p>
            <p className="text-sm text-forest-800/90 mt-2">{ranked.top?.market ?? ""}</p>
          </div>

          <div className="surface-card-strong p-3.5">
            <div className="flex items-center justify-between mb-4"><h3 className="font-semibold text-forest-900">{t("market.stablePrice")}</h3><Info className="h-5 w-5 text-sky-600" /></div>
            <p className="text-2xl font-bold text-forest-900 mb-1">{ranked.stable?.crop ?? t("common.notAvailable")}</p>
            <p className="text-sky-700 font-semibold text-lg">{ranked.stable?.changePercent ?? "--"}%</p>
            <p className="text-sm text-forest-800/90 mt-2">{ranked.stable?.market ?? ""}</p>
          </div>

          <div className="surface-card-strong p-3.5">
            <div className="flex items-center justify-between mb-4"><h3 className="font-semibold text-forest-900">{t("market.topLoser")}</h3><TrendingDown className="h-5 w-5 text-red-600" /></div>
            <p className="text-2xl font-bold text-forest-900 mb-1">{ranked.low?.crop ?? t("common.notAvailable")}</p>
            <p className="text-red-600 font-semibold text-lg">{ranked.low?.changePercent ?? "--"}%</p>
            <p className="text-sm text-forest-800/90 mt-2">{ranked.low?.market ?? ""}</p>
          </div>
        </div>

        <div className="surface-card-strong p-3.5 fade-up">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-4">
            <div>
              <h2 className="text-xl font-bold text-forest-900">{t("market.compareTitle")}</h2>
              <p className="text-sm text-forest-700/90 mt-1">{t("market.compareSubtitle")}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full md:w-auto">
              <div className="min-w-52">
                <label htmlFor="crop-select" className="block text-sm font-semibold text-forest-800 mb-2">{t("market.selectCrop")}</label>
                <select
                  id="crop-select"
                  className="bg-white"
                  value={selectedCrop}
                  onChange={(e) => setSelectedCrop(e.target.value)}
                >
                  {cropOptions.map((crop) => (
                    <option key={crop} value={crop}>{crop}</option>
                  ))}
                </select>
              </div>
              <div className="min-w-52">
                <label htmlFor="transport-cost" className="block text-sm font-semibold text-forest-800 mb-2">{t("market.transportCost")}</label>
                <input
                  id="transport-cost"
                  type="number"
                  min={0}
                  step="0.5"
                  value={transportCostPerKm}
                  onChange={(e) => setTransportCostPerKm(Number(e.target.value) || 0)}
                  className="bg-white"
                />
              </div>
            </div>
          </div>

          {comparisonRows.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-4 stagger-in">
                <div className="tone-success rounded-xl p-4">
                  <p className="text-xs font-semibold mb-1">{t("market.bestNetMandi")}</p>
                  <p className="text-lg font-bold">{bestNet?.market}</p>
                  <p className="text-sm">{t("market.netPrice")}: Rs {bestNet?.netPricePerKg}/{t("common.kgUnit")}</p>
                </div>
                <div className="tone-success rounded-xl p-4">
                  <p className="text-xs font-semibold mb-1">{t("market.bestMandi")}</p>
                  <p className="text-lg font-bold">{topMarket?.market}</p>
                  <p className="text-sm">Rs {topMarket?.pricePerKg}/{t("common.kgUnit")}</p>
                </div>
                <div className="tone-warning rounded-xl p-4">
                  <p className="text-xs font-semibold mb-1">{t("market.lowestMandi")}</p>
                  <p className="text-lg font-bold">{lowMarket?.market}</p>
                  <p className="text-sm">Rs {lowMarket?.pricePerKg}/{t("common.kgUnit")}</p>
                </div>
                <div className="bg-sky-50 border border-sky-100 rounded-xl p-4">
                  <p className="text-xs text-sky-700 font-semibold mb-1">{t("market.spread")}</p>
                  <p className="text-lg font-bold text-sky-900">Rs {spread}/kg</p>
                </div>
                <div className="bg-forest-50 border border-forest-100 rounded-xl p-4">
                  <p className="text-xs text-forest-700 font-semibold mb-1">{t("market.nearestMandi")}</p>
                  <p className="text-lg font-bold text-forest-900">{nearestMarket?.market ?? t("common.notAvailable")}</p>
                  <p className="text-sm text-forest-800">{t("market.nearestDistance", { distance: nearestMarket?.distance ?? "--" })}</p>
                </div>
              </div>

              <div className="space-y-3">
                {comparisonRows.map((item) => (
                  <div key={`${item.crop}-${item.market}`} className="flex items-center justify-between rounded-lg border border-forest-100 bg-gradient-to-r from-white to-forest-50/55 px-3.5 py-2.5">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-forest-900">
                        <MapPin className="h-4 w-4 text-forest-700" />
                        <span className="font-semibold">{item.market}</span>
                        {nearestMarket?.market === item.market ? (
                          <span className="text-[11px] font-semibold bg-forest-100 text-forest-800 px-2 py-0.5 rounded-full">
                            {t("market.nearestBadge")}
                          </span>
                        ) : null}
                      </div>
                      <p className="text-xs text-forest-700 flex items-center gap-1"><Truck className="h-3 w-3" /> {t("market.transportDistance", { distance: item.distance })}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-forest-900">Rs {item.pricePerKg}/{t("common.kgUnit")}</p>
                      <p className="text-xs text-forest-700">{t("market.netPrice")}: Rs {item.netPricePerKg}/{t("common.kgUnit")}</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-sm text-forest-700">{t("market.noComparisonData")}</p>
          )}
        </div>

        <div className="table-shell">
          <div className="px-4 py-3 border-b border-forest-100 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-forest-900">{t("market.currentRates")}</h2>
              <p className="text-sm text-forest-700/90 mt-1">{t("market.updatedToday")}</p>
            </div>
            {loading ? <span className="text-sm text-forest-700">{t("market.loading")}</span> : null}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="table-head">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-forest-900">{t("market.cropName")}</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-forest-900">{t("market.market")}</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-forest-900">{t("market.distanceFromYou")}</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-forest-900">{t("market.price")}</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-forest-900">{t("market.trend")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-forest-100">
                {sortedDataByDistance.map((item, index) => (
                  <tr key={`${item.crop}-${item.market}-${index}`} className={`${index % 2 ? "table-row-alt" : "bg-white"} hover:bg-forest-50/60 transition-colors`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="bg-forest-100 w-10 h-10 rounded-lg flex items-center justify-center">
                          <span className="text-lg font-semibold text-forest-800">{item.crop[0]}</span>
                        </div>
                        <span className="font-semibold text-forest-900">{item.crop}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 text-forest-700/90">
                        <MapPin className="h-4 w-4" />
                        <span className="text-sm">{item.market}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm font-semibold text-forest-900">{item.distanceKm ?? "--"} km</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-lg font-bold text-forest-900">Rs {item.pricePerKg}</span>
                      <span className="text-sm text-forest-700/90">/{t("common.kgUnit")}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${item.changePercent >= 0 ? "bg-leaf-100 text-leaf-700" : "bg-rose-100 text-rose-700"}`}>
                        {item.changePercent >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                        {item.changePercent >= 0 ? "+" : ""}
                        {item.changePercent}%
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        </main>
      </div>
    </div>
  );
}
