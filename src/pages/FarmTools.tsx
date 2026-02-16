import { Calculator, Save, Sparkles, TrendingDown, TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  calculateProfitability,
  loadProfile,
  saveProfile,
  type FarmProfile,
  type ProfitabilityScenario,
} from "../services/farmProfileService";

const presetScenarios: Array<{ key: "wheat" | "rice" | "cotton"; payload: ProfitabilityScenario }> = [
  {
    key: "wheat",
    payload: {
      crop: "Wheat",
      areaAcres: 5,
      expectedYieldKgPerAcre: 1400,
      sellingPricePerKg: 22,
      seedCost: 8500,
      fertilizerCost: 12000,
      laborCost: 15000,
      irrigationCost: 6000,
    },
  },
  {
    key: "rice",
    payload: {
      crop: "Rice",
      areaAcres: 4,
      expectedYieldKgPerAcre: 1700,
      sellingPricePerKg: 21,
      seedCost: 7600,
      fertilizerCost: 11000,
      laborCost: 14000,
      irrigationCost: 7200,
    },
  },
  {
    key: "cotton",
    payload: {
      crop: "Cotton",
      areaAcres: 6,
      expectedYieldKgPerAcre: 620,
      sellingPricePerKg: 58,
      seedCost: 13000,
      fertilizerCost: 17000,
      laborCost: 19500,
      irrigationCost: 7800,
    },
  },
];

export default function FarmTools() {
  const { t, i18n } = useTranslation();
  const [profile, setProfile] = useState<FarmProfile>(loadProfile());
  const [saved, setSaved] = useState(false);
  const [scenario, setScenario] = useState<ProfitabilityScenario>(presetScenarios[0].payload);

  const result = useMemo(() => calculateProfitability(scenario), [scenario]);

  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat(i18n.language === "hi" ? "hi-IN" : "en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }),
    [i18n.language],
  );

  const decimalFormatter = useMemo(
    () =>
      new Intl.NumberFormat(i18n.language === "hi" ? "hi-IN" : "en-IN", {
        maximumFractionDigits: 2,
      }),
    [i18n.language],
  );

  const statusKey = result.profit >= 0 ? "farmTools.profitStatusGood" : "farmTools.profitStatusRisk";

  const applyPreset = (key: "wheat" | "rice" | "cotton") => {
    const preset = presetScenarios.find((item) => item.key === key);
    if (!preset) return;
    setScenario(preset.payload);
  };

  const applyProfileArea = () => {
    if (!profile.landSizeAcres || profile.landSizeAcres <= 0) return;
    setScenario((prev) => ({
      ...prev,
      areaAcres: profile.landSizeAcres,
      crop: profile.primaryCrop || prev.crop,
    }));
  };

  return (
    <div className="page-wrap">
      <div className="max-w-7xl mx-auto space-y-4 md:space-y-5">
        <div>
          <h1 className="section-title">{t("farmTools.title")}</h1>
          <p className="section-subtitle">{t("farmTools.subtitle")}</p>
        </div>

        <div className="surface-card-strong p-4 md:p-5">
          <h2 className="text-lg font-bold text-forest-900 mb-2">{t("farmTools.presetTitle")}</h2>
          <p className="text-sm text-forest-800/90 mb-3">{t("farmTools.presetSubtitle")}</p>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn-secondary !px-3 !py-2 text-sm" onClick={() => applyPreset("wheat")}>{t("farmTools.presetWheat")}</button>
            <button type="button" className="btn-secondary !px-3 !py-2 text-sm" onClick={() => applyPreset("rice")}>{t("farmTools.presetRice")}</button>
            <button type="button" className="btn-secondary !px-3 !py-2 text-sm" onClick={() => applyPreset("cotton")}>{t("farmTools.presetCotton")}</button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-5 items-start">
          <div className="surface-card-strong p-5 md:p-6 space-y-4">
            <h2 className="text-xl font-bold text-forest-900">{t("farmTools.profileTitle")}</h2>
            <p className="text-sm text-forest-800/90">{t("farmTools.profileHelp")}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label htmlFor="farmer-name" className="block text-sm font-semibold text-forest-800 mb-1">{t("farmTools.farmerName")}</label>
                <input id="farmer-name" className="bg-white" value={profile.farmerName} onChange={(event) => { setSaved(false); setProfile((prev) => ({ ...prev, farmerName: event.target.value })); }} />
              </div>
              <div>
                <label htmlFor="village" className="block text-sm font-semibold text-forest-800 mb-1">{t("farmTools.village")}</label>
                <input id="village" className="bg-white" value={profile.village} onChange={(event) => { setSaved(false); setProfile((prev) => ({ ...prev, village: event.target.value })); }} />
              </div>
              <div>
                <label htmlFor="primary-crop" className="block text-sm font-semibold text-forest-800 mb-1">{t("farmTools.primaryCrop")}</label>
                <input id="primary-crop" className="bg-white" value={profile.primaryCrop} onChange={(event) => { setSaved(false); setProfile((prev) => ({ ...prev, primaryCrop: event.target.value })); }} />
              </div>
              <div>
                <label htmlFor="land-size" className="block text-sm font-semibold text-forest-800 mb-1">{t("farmTools.landSize")}</label>
                <input id="land-size" className="bg-white" type="number" step="0.1" value={profile.landSizeAcres} onChange={(event) => { setSaved(false); setProfile((prev) => ({ ...prev, landSizeAcres: Number(event.target.value) || 0 })); }} />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  saveProfile(profile);
                  setSaved(true);
                }}
                className="btn-primary"
              >
                <Save className="h-4 w-4" /> {t("farmTools.saveProfile")}
              </button>
              <button type="button" onClick={applyProfileArea} className="btn-secondary">
                <Sparkles className="h-4 w-4" /> {t("farmTools.useProfileInCalc")}
              </button>
            </div>

            {saved ? <p className="text-sm text-leaf-700">{t("farmTools.saved")}</p> : null}

            <div className="surface-card p-3.5 bg-forest-50 border-forest-100">
              <p className="text-sm font-semibold text-forest-900 mb-2">{t("farmTools.profileTipsTitle")}</p>
              <ul className="space-y-1.5 text-sm text-forest-800/90">
                <li>{t("farmTools.profileTip1")}</li>
                <li>{t("farmTools.profileTip2")}</li>
                <li>{t("farmTools.profileTip3")}</li>
              </ul>
            </div>
          </div>

          <div className="surface-card-strong p-5 md:p-6 space-y-4">
            <h2 className="text-xl font-bold text-forest-900">{t("farmTools.simulatorTitle")}</h2>
            <p className="text-sm text-forest-800/90">{t("farmTools.simulatorHelp")}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label htmlFor="input-crop" className="block text-sm font-semibold text-forest-800 mb-1">{t("farmTools.inputCrop")}</label>
                <input id="input-crop" className="bg-white" value={scenario.crop} onChange={(event) => setScenario((prev) => ({ ...prev, crop: event.target.value }))} />
              </div>
              <div>
                <label htmlFor="input-area" className="block text-sm font-semibold text-forest-800 mb-1">{t("farmTools.inputArea")}</label>
                <input id="input-area" className="bg-white" type="number" value={scenario.areaAcres} onChange={(event) => setScenario((prev) => ({ ...prev, areaAcres: Number(event.target.value) || 0 }))} />
              </div>
              <div>
                <label htmlFor="input-yield" className="block text-sm font-semibold text-forest-800 mb-1">{t("farmTools.inputYield")}</label>
                <input id="input-yield" className="bg-white" type="number" value={scenario.expectedYieldKgPerAcre} onChange={(event) => setScenario((prev) => ({ ...prev, expectedYieldKgPerAcre: Number(event.target.value) || 0 }))} />
              </div>
              <div>
                <label htmlFor="input-price" className="block text-sm font-semibold text-forest-800 mb-1">{t("farmTools.inputPrice")}</label>
                <input id="input-price" className="bg-white" type="number" value={scenario.sellingPricePerKg} onChange={(event) => setScenario((prev) => ({ ...prev, sellingPricePerKg: Number(event.target.value) || 0 }))} />
              </div>
              <div>
                <label htmlFor="input-seed" className="block text-sm font-semibold text-forest-800 mb-1">{t("farmTools.inputSeedCost")}</label>
                <input id="input-seed" className="bg-white" type="number" value={scenario.seedCost} onChange={(event) => setScenario((prev) => ({ ...prev, seedCost: Number(event.target.value) || 0 }))} />
              </div>
              <div>
                <label htmlFor="input-fertilizer" className="block text-sm font-semibold text-forest-800 mb-1">{t("farmTools.inputFertilizerCost")}</label>
                <input id="input-fertilizer" className="bg-white" type="number" value={scenario.fertilizerCost} onChange={(event) => setScenario((prev) => ({ ...prev, fertilizerCost: Number(event.target.value) || 0 }))} />
              </div>
              <div>
                <label htmlFor="input-labor" className="block text-sm font-semibold text-forest-800 mb-1">{t("farmTools.inputLaborCost")}</label>
                <input id="input-labor" className="bg-white" type="number" value={scenario.laborCost} onChange={(event) => setScenario((prev) => ({ ...prev, laborCost: Number(event.target.value) || 0 }))} />
              </div>
              <div>
                <label htmlFor="input-irrigation" className="block text-sm font-semibold text-forest-800 mb-1">{t("farmTools.inputIrrigationCost")}</label>
                <input id="input-irrigation" className="bg-white" type="number" value={scenario.irrigationCost} onChange={(event) => setScenario((prev) => ({ ...prev, irrigationCost: Number(event.target.value) || 0 }))} />
              </div>
            </div>

            <div className="surface-card p-4 bg-forest-50 border-forest-100">
              <p className="text-sm text-forest-800 mb-3 flex items-center gap-2"><Calculator className="h-4 w-4" /> {t("farmTools.estimatedOutcome")}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl bg-white/75 border border-white px-3 py-2">{t("farmTools.revenue")}: <strong>{currencyFormatter.format(result.revenue)}</strong></div>
                <div className="rounded-xl bg-white/75 border border-white px-3 py-2">{t("farmTools.totalCost")}: <strong>{currencyFormatter.format(result.cost)}</strong></div>
                <div className="rounded-xl bg-white/75 border border-white px-3 py-2">{t("farmTools.profit")}: <strong className={result.profit >= 0 ? "text-leaf-700" : "text-rose-700"}>{currencyFormatter.format(result.profit)}</strong></div>
                <div className="rounded-xl bg-white/75 border border-white px-3 py-2">{t("farmTools.profitPerAcre")}: <strong>{currencyFormatter.format(result.profitPerAcre)}</strong></div>
                <div className="rounded-xl bg-white/75 border border-white px-3 py-2 sm:col-span-2">{t("farmTools.breakEvenPrice")}: <strong>{currencyFormatter.format(result.breakEvenPrice)}/{t("common.kgUnit")}</strong></div>
              </div>
              <div className={`mt-3 rounded-xl px-3 py-2 text-sm font-semibold inline-flex items-center gap-2 ${result.profit >= 0 ? "bg-leaf-100 text-leaf-800" : "bg-rose-100 text-rose-800"}`}>
                {result.profit >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                {t(statusKey)}
              </div>
              <p className="mt-2 text-sm text-forest-800/90">
                {result.profit >= 0
                  ? t("farmTools.breakEvenHintProfit", { value: decimalFormatter.format(result.breakEvenPrice) })
                  : t("farmTools.breakEvenHintLoss", { value: decimalFormatter.format(result.breakEvenPrice) })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
