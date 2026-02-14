import { Calculator, Save } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { calculateProfitability, loadProfile, saveProfile, type FarmProfile, type ProfitabilityScenario } from "../services/farmProfileService";

export default function FarmTools() {
  const { t } = useTranslation();
  const [profile, setProfile] = useState<FarmProfile>(loadProfile());
  const [saved, setSaved] = useState(false);
  const [scenario, setScenario] = useState<ProfitabilityScenario>({
    crop: "Wheat",
    areaAcres: 5,
    expectedYieldKgPerAcre: 1400,
    sellingPricePerKg: 22,
    seedCost: 8500,
    fertilizerCost: 12000,
    laborCost: 15000,
    irrigationCost: 6000,
  });

  const result = useMemo(() => calculateProfitability(scenario), [scenario]);

  return (
    <div className="min-h-screen px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="section-title">{t("farmTools.title")}</h1>
          <p className="section-subtitle">{t("farmTools.subtitle")}</p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="surface-card-strong p-6 space-y-4">
            <h2 className="text-xl font-bold text-forest-900">{t("farmTools.profileTitle")}</h2>

            <input className="w-full px-3 py-2 border rounded-xl" placeholder={t("farmTools.farmerName")} value={profile.farmerName} onChange={(e) => { setSaved(false); setProfile((prev) => ({ ...prev, farmerName: e.target.value })); }} />
            <input className="w-full px-3 py-2 border rounded-xl" placeholder={t("farmTools.village")} value={profile.village} onChange={(e) => { setSaved(false); setProfile((prev) => ({ ...prev, village: e.target.value })); }} />
            <input className="w-full px-3 py-2 border rounded-xl" placeholder={t("farmTools.primaryCrop")} value={profile.primaryCrop} onChange={(e) => { setSaved(false); setProfile((prev) => ({ ...prev, primaryCrop: e.target.value })); }} />
            <input className="w-full px-3 py-2 border rounded-xl" type="number" step="0.1" placeholder={t("farmTools.landSize")} value={profile.landSizeAcres} onChange={(e) => { setSaved(false); setProfile((prev) => ({ ...prev, landSizeAcres: Number(e.target.value) || 0 })); }} />

            <button
              onClick={() => {
                saveProfile(profile);
                setSaved(true);
              }}
              className="btn-primary"
            >
              <Save className="h-4 w-4" /> {t("farmTools.saveProfile")}
            </button>

            {saved ? <p className="text-sm text-green-700">{t("farmTools.saved")}</p> : null}
          </div>

          <div className="surface-card-strong p-6 space-y-4">
            <h2 className="text-xl font-bold text-forest-900">{t("farmTools.simulatorTitle")}</h2>

            <div className="grid grid-cols-2 gap-3">
              <input className="px-3 py-2 border rounded-xl" placeholder={t("farmTools.inputCrop")} value={scenario.crop} onChange={(e) => setScenario((prev) => ({ ...prev, crop: e.target.value }))} />
              <input className="px-3 py-2 border rounded-xl" type="number" placeholder={t("farmTools.inputArea")} value={scenario.areaAcres} onChange={(e) => setScenario((prev) => ({ ...prev, areaAcres: Number(e.target.value) || 0 }))} />
              <input className="px-3 py-2 border rounded-xl" type="number" placeholder={t("farmTools.inputYield")} value={scenario.expectedYieldKgPerAcre} onChange={(e) => setScenario((prev) => ({ ...prev, expectedYieldKgPerAcre: Number(e.target.value) || 0 }))} />
              <input className="px-3 py-2 border rounded-xl" type="number" placeholder={t("farmTools.inputPrice")} value={scenario.sellingPricePerKg} onChange={(e) => setScenario((prev) => ({ ...prev, sellingPricePerKg: Number(e.target.value) || 0 }))} />
              <input className="px-3 py-2 border rounded-xl" type="number" placeholder={t("farmTools.inputSeedCost")} value={scenario.seedCost} onChange={(e) => setScenario((prev) => ({ ...prev, seedCost: Number(e.target.value) || 0 }))} />
              <input className="px-3 py-2 border rounded-xl" type="number" placeholder={t("farmTools.inputFertilizerCost")} value={scenario.fertilizerCost} onChange={(e) => setScenario((prev) => ({ ...prev, fertilizerCost: Number(e.target.value) || 0 }))} />
              <input className="px-3 py-2 border rounded-xl" type="number" placeholder={t("farmTools.inputLaborCost")} value={scenario.laborCost} onChange={(e) => setScenario((prev) => ({ ...prev, laborCost: Number(e.target.value) || 0 }))} />
              <input className="px-3 py-2 border rounded-xl" type="number" placeholder={t("farmTools.inputIrrigationCost")} value={scenario.irrigationCost} onChange={(e) => setScenario((prev) => ({ ...prev, irrigationCost: Number(e.target.value) || 0 }))} />
            </div>

            <div className="surface-card p-4 bg-forest-50 border-forest-100">
              <p className="text-sm text-forest-800 mb-2 flex items-center gap-2"><Calculator className="h-4 w-4" /> {t("farmTools.estimatedOutcome")}</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <p>{t("farmTools.revenue")}: <strong>Rs {result.revenue.toFixed(0)}</strong></p>
                <p>{t("farmTools.totalCost")}: <strong>Rs {result.cost.toFixed(0)}</strong></p>
                <p>{t("farmTools.profit")}: <strong className={result.profit >= 0 ? "text-green-700" : "text-red-700"}>Rs {result.profit.toFixed(0)}</strong></p>
                <p>{t("farmTools.profitPerAcre")}: <strong>Rs {result.profitPerAcre.toFixed(0)}</strong></p>
                <p className="col-span-2">{t("farmTools.breakEvenPrice")}: <strong>Rs {result.breakEvenPrice.toFixed(2)}/{t("common.kgUnit")}</strong></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
