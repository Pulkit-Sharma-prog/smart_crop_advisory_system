import { Calculator, Save } from "lucide-react";
import { useMemo, useState } from "react";
import { calculateProfitability, loadProfile, saveProfile, type FarmProfile, type ProfitabilityScenario } from "../services/farmProfileService";

export default function FarmTools() {
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
          <h1 className="section-title">Farm Tools</h1>
          <p className="section-subtitle">My Farm profile and profitability simulator for smart planning.</p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="surface-card-strong p-6 space-y-4">
            <h2 className="text-xl font-bold text-forest-900">My Farm Profile</h2>

            <input className="w-full px-3 py-2 border rounded-xl" placeholder="Farmer name" value={profile.farmerName} onChange={(e) => { setSaved(false); setProfile((prev) => ({ ...prev, farmerName: e.target.value })); }} />
            <input className="w-full px-3 py-2 border rounded-xl" placeholder="Village" value={profile.village} onChange={(e) => { setSaved(false); setProfile((prev) => ({ ...prev, village: e.target.value })); }} />
            <input className="w-full px-3 py-2 border rounded-xl" placeholder="Primary crop" value={profile.primaryCrop} onChange={(e) => { setSaved(false); setProfile((prev) => ({ ...prev, primaryCrop: e.target.value })); }} />
            <input className="w-full px-3 py-2 border rounded-xl" type="number" step="0.1" placeholder="Land size (acres)" value={profile.landSizeAcres} onChange={(e) => { setSaved(false); setProfile((prev) => ({ ...prev, landSizeAcres: Number(e.target.value) || 0 })); }} />

            <button
              onClick={() => {
                saveProfile(profile);
                setSaved(true);
              }}
              className="btn-primary"
            >
              <Save className="h-4 w-4" /> Save Profile
            </button>

            {saved ? <p className="text-sm text-green-700">Profile saved locally.</p> : null}
          </div>

          <div className="surface-card-strong p-6 space-y-4">
            <h2 className="text-xl font-bold text-forest-900">Profitability Simulator</h2>

            <div className="grid grid-cols-2 gap-3">
              <input className="px-3 py-2 border rounded-xl" placeholder="Crop" value={scenario.crop} onChange={(e) => setScenario((prev) => ({ ...prev, crop: e.target.value }))} />
              <input className="px-3 py-2 border rounded-xl" type="number" placeholder="Area acres" value={scenario.areaAcres} onChange={(e) => setScenario((prev) => ({ ...prev, areaAcres: Number(e.target.value) || 0 }))} />
              <input className="px-3 py-2 border rounded-xl" type="number" placeholder="Yield kg/acre" value={scenario.expectedYieldKgPerAcre} onChange={(e) => setScenario((prev) => ({ ...prev, expectedYieldKgPerAcre: Number(e.target.value) || 0 }))} />
              <input className="px-3 py-2 border rounded-xl" type="number" placeholder="Price per kg" value={scenario.sellingPricePerKg} onChange={(e) => setScenario((prev) => ({ ...prev, sellingPricePerKg: Number(e.target.value) || 0 }))} />
              <input className="px-3 py-2 border rounded-xl" type="number" placeholder="Seed cost" value={scenario.seedCost} onChange={(e) => setScenario((prev) => ({ ...prev, seedCost: Number(e.target.value) || 0 }))} />
              <input className="px-3 py-2 border rounded-xl" type="number" placeholder="Fertilizer cost" value={scenario.fertilizerCost} onChange={(e) => setScenario((prev) => ({ ...prev, fertilizerCost: Number(e.target.value) || 0 }))} />
              <input className="px-3 py-2 border rounded-xl" type="number" placeholder="Labor cost" value={scenario.laborCost} onChange={(e) => setScenario((prev) => ({ ...prev, laborCost: Number(e.target.value) || 0 }))} />
              <input className="px-3 py-2 border rounded-xl" type="number" placeholder="Irrigation cost" value={scenario.irrigationCost} onChange={(e) => setScenario((prev) => ({ ...prev, irrigationCost: Number(e.target.value) || 0 }))} />
            </div>

            <div className="surface-card p-4 bg-forest-50 border-forest-100">
              <p className="text-sm text-forest-800 mb-2 flex items-center gap-2"><Calculator className="h-4 w-4" /> Estimated outcome</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <p>Revenue: <strong>Rs {result.revenue.toFixed(0)}</strong></p>
                <p>Total Cost: <strong>Rs {result.cost.toFixed(0)}</strong></p>
                <p>Profit: <strong className={result.profit >= 0 ? "text-green-700" : "text-red-700"}>Rs {result.profit.toFixed(0)}</strong></p>
                <p>Profit/Acre: <strong>Rs {result.profitPerAcre.toFixed(0)}</strong></p>
                <p className="col-span-2">Break-even Price: <strong>Rs {result.breakEvenPrice.toFixed(2)}/kg</strong></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
