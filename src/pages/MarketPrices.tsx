import { Info, MapPin, Star, TrendingDown, TrendingUp, Truck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAsyncData } from "../hooks/useAsyncData";
import { getMarketPrices } from "../services/marketService";

const marketDistanceKm: Record<string, number> = {
  "Local Mandi": 12,
  "Regional Market": 48,
  "City Market": 95,
};

export default function MarketPrices() {
  const { t } = useTranslation();
  const { data, loading, error, reload } = useAsyncData(getMarketPrices, {
    cacheKey: "market-prices",
    ttlMs: 45000,
  });

  const [selectedCrop, setSelectedCrop] = useState("");
  const [transportCostPerKm, setTransportCostPerKm] = useState(3);

  const ranked = useMemo(() => {
    if (!data) return { top: null, stable: null, low: null };

    const sorted = [...data].sort((a, b) => b.changePercent - a.changePercent);
    const top = sorted[0] ?? null;
    const low = sorted[sorted.length - 1] ?? null;
    const stable = [...data].sort((a, b) => Math.abs(a.changePercent) - Math.abs(b.changePercent))[0] ?? null;

    return { top, stable, low };
  }, [data]);

  const cropOptions = useMemo(() => {
    return Array.from(new Set((data ?? []).map((item) => item.crop)));
  }, [data]);

  useEffect(() => {
    if (!selectedCrop && cropOptions.length > 0) {
      setSelectedCrop(cropOptions[0]);
    }
  }, [cropOptions, selectedCrop]);

  const comparisonRows = useMemo(() => {
    if (!selectedCrop) return [];
    return (data ?? [])
      .filter((item) => item.crop === selectedCrop)
      .map((item) => {
        const distance = marketDistanceKm[item.market] ?? 40;
        const transportCost = (distance * transportCostPerKm) / 100;
        return {
          ...item,
          distance,
          netPricePerKg: Number((item.pricePerKg - transportCost).toFixed(2)),
        };
      })
      .sort((a, b) => b.netPricePerKg - a.netPricePerKg);
  }, [data, selectedCrop, transportCostPerKm]);

  const bestNet = comparisonRows[0] ?? null;
  const topMarket = [...comparisonRows].sort((a, b) => b.pricePerKg - a.pricePerKg)[0] ?? null;
  const lowMarket = [...comparisonRows].sort((a, b) => a.pricePerKg - b.pricePerKg)[0] ?? null;
  const spread = topMarket && lowMarket ? topMarket.pricePerKg - lowMarket.pricePerKg : 0;

  return (
    <div className="min-h-screen px-4 sm:px-6 lg:px-8 py-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="section-title">{t("market.title")}</h1>
          <p className="section-subtitle">{t("market.subtitle")}</p>
        </div>

        {error ? (
          <div className="surface-card-strong border border-red-200 bg-red-50 p-4">
            <p className="text-red-800">{t("market.loadError")}</p>
            <button onClick={() => void reload()} className="mt-2 text-sm text-red-900 underline font-semibold">{t("common.retry")}</button>
          </div>
        ) : null}

        <div className="hero-panel p-5 text-white fade-up">
          <div className="flex items-start gap-4 relative z-10">
            <div className="bg-white/20 p-3 rounded-lg"><Star className="h-8 w-8" /></div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2">{t("market.bestSellTitle")}</h2>
              <p className="text-forest-100 mb-4">{t("market.bestSellDesc")}</p>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="bg-white/10 rounded-xl px-5 py-4">
                  <p className="text-forest-100 text-sm mb-1">{t("market.crop")}</p>
                  <p className="text-xl font-bold">{ranked.top?.crop ?? t("common.notAvailable")}</p>
                </div>
                <div className="bg-white/10 rounded-xl px-5 py-4">
                  <p className="text-forest-100 text-sm mb-1">{t("market.currentPrice")}</p>
                  <p className="text-xl font-bold">Rs {ranked.top?.pricePerKg ?? "--"}/kg</p>
                </div>
                <div className="bg-white/10 rounded-xl px-5 py-4">
                  <p className="text-forest-100 text-sm mb-1">{t("market.priceIncrease")}</p>
                  <p className="text-xl font-bold text-leaf-200 flex items-center gap-1">
                    <TrendingUp className="h-5 w-5" />
                    {ranked.top?.changePercent ?? "--"}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 stagger-in">
          <div className="surface-card-strong p-4">
            <div className="flex items-center justify-between mb-4"><h3 className="font-semibold text-forest-900">{t("market.topGainer")}</h3><TrendingUp className="h-5 w-5 text-green-600" /></div>
            <p className="text-2xl font-bold text-forest-900 mb-1">{ranked.top?.crop ?? t("common.notAvailable")}</p>
            <p className="text-green-600 font-semibold text-lg">{ranked.top?.changePercent ?? "--"}%</p>
            <p className="text-sm text-forest-800/70 mt-2">{ranked.top?.market ?? ""}</p>
          </div>

          <div className="surface-card-strong p-4">
            <div className="flex items-center justify-between mb-4"><h3 className="font-semibold text-forest-900">{t("market.stablePrice")}</h3><Info className="h-5 w-5 text-blue-600" /></div>
            <p className="text-2xl font-bold text-forest-900 mb-1">{ranked.stable?.crop ?? t("common.notAvailable")}</p>
            <p className="text-blue-600 font-semibold text-lg">{ranked.stable?.changePercent ?? "--"}%</p>
            <p className="text-sm text-forest-800/70 mt-2">{ranked.stable?.market ?? ""}</p>
          </div>

          <div className="surface-card-strong p-4">
            <div className="flex items-center justify-between mb-4"><h3 className="font-semibold text-forest-900">{t("market.topLoser")}</h3><TrendingDown className="h-5 w-5 text-red-600" /></div>
            <p className="text-2xl font-bold text-forest-900 mb-1">{ranked.low?.crop ?? t("common.notAvailable")}</p>
            <p className="text-red-600 font-semibold text-lg">{ranked.low?.changePercent ?? "--"}%</p>
            <p className="text-sm text-forest-800/70 mt-2">{ranked.low?.market ?? ""}</p>
          </div>
        </div>

        <div className="surface-card-strong p-4 fade-up">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold text-forest-900">{t("market.compareTitle")}</h2>
              <p className="text-sm text-forest-700/80 mt-1">{t("market.compareSubtitle")}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full md:w-auto">
              <div className="min-w-52">
                <label htmlFor="crop-select" className="block text-sm font-semibold text-forest-800 mb-2">{t("market.selectCrop")}</label>
                <select
                  id="crop-select"
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl bg-white"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl bg-white"
                />
              </div>
            </div>
          </div>

          {comparisonRows.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-5 stagger-in">
                <div className="bg-green-50 border border-green-100 rounded-xl p-4">
                  <p className="text-xs text-green-700 font-semibold mb-1">{t("market.bestNetMandi")}</p>
                  <p className="text-lg font-bold text-green-900">{bestNet?.market}</p>
                  <p className="text-sm text-green-800">{t("market.netPrice")}: Rs {bestNet?.netPricePerKg}/{t("common.kgUnit")}</p>
                </div>
                <div className="bg-green-50 border border-green-100 rounded-xl p-4">
                  <p className="text-xs text-green-700 font-semibold mb-1">{t("market.bestMandi")}</p>
                  <p className="text-lg font-bold text-green-900">{topMarket?.market}</p>
                  <p className="text-sm text-green-800">Rs {topMarket?.pricePerKg}/{t("common.kgUnit")}</p>
                </div>
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                  <p className="text-xs text-amber-700 font-semibold mb-1">{t("market.lowestMandi")}</p>
                  <p className="text-lg font-bold text-amber-900">{lowMarket?.market}</p>
                  <p className="text-sm text-amber-800">Rs {lowMarket?.pricePerKg}/{t("common.kgUnit")}</p>
                </div>
                <div className="bg-sky-50 border border-sky-100 rounded-xl p-4">
                  <p className="text-xs text-sky-700 font-semibold mb-1">{t("market.spread")}</p>
                  <p className="text-lg font-bold text-sky-900">Rs {spread}/kg</p>
                </div>
              </div>

              <div className="space-y-3">
                {comparisonRows.map((item) => (
                  <div key={`${item.crop}-${item.market}`} className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-forest-900">
                        <MapPin className="h-4 w-4 text-forest-700" />
                        <span className="font-semibold">{item.market}</span>
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

        <div className="surface-card-strong overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-forest-900">{t("market.currentRates")}</h2>
              <p className="text-sm text-forest-700/80 mt-1">{t("market.updatedToday")}</p>
            </div>
            {loading ? <span className="text-sm text-gray-500">{t("market.loading")}</span> : null}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-forest-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-forest-900">{t("market.cropName")}</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-forest-900">{t("market.market")}</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-forest-900">{t("market.price")}</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-forest-900">{t("market.trend")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {(data ?? []).map((item) => (
                  <tr key={`${item.crop}-${item.market}`} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-forest-100 w-10 h-10 rounded-lg flex items-center justify-center">
                          <span className="text-lg font-semibold text-forest-800">{item.crop[0]}</span>
                        </div>
                        <span className="font-semibold text-forest-900">{item.crop}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-forest-700/80">
                        <MapPin className="h-4 w-4" />
                        <span className="text-sm">{item.market}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-lg font-bold text-forest-900">Rs {item.pricePerKg}</span>
                      <span className="text-sm text-forest-700/70">/{t("common.kgUnit")}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${item.changePercent >= 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
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
      </div>
    </div>
  );
}
