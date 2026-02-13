import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, CheckCircle, FlaskConical, LocateFixed, MapPin, Ruler, Sprout } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import LocationPickerMap from "../components/LocationPickerMap";
import { saveLastLocationAdvisory, saveLastSoilResult } from "../services/farmProfileService";
import { getLocationAdvisory, type LocationAdvisoryResult } from "../services/locationAdvisoryService";
import { getSoilRecommendation, type SoilRecommendationResult } from "../services/recommendationService";

const formSchema = z.object({
  nitrogen: z.coerce.number().min(0).max(300),
  phosphorus: z.coerce.number().min(0).max(200),
  potassium: z.coerce.number().min(0).max(200),
  ph: z.coerce.number().min(0).max(14),
  landSize: z.coerce.number().min(0.1).max(10000),
});

type FormInput = z.input<typeof formSchema>;
type FormOutput = z.output<typeof formSchema>;

export default function SoilCropRecommendation() {
  const [result, setResult] = useState<SoilRecommendationResult | null>(null);
  const [lastSoilInput, setLastSoilInput] = useState<FormOutput | null>(null);
  const [locationAdvisory, setLocationAdvisory] = useState<LocationAdvisoryResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [latInput, setLatInput] = useState("20.5937");
  const [lonInput, setLonInput] = useState("78.9629");
  const { t } = useTranslation();

  const { register, handleSubmit, formState: { errors } } = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(formSchema),
    defaultValues: { nitrogen: 120, phosphorus: 60, potassium: 40, ph: 6.5, landSize: 5 },
  });

  const onSubmit = async (values: FormOutput) => {
    setSubmitting(true);
    const response = await getSoilRecommendation(values);
    setResult(response);
    setLastSoilInput(values);
    saveLastSoilResult(response);
    setSubmitting(false);
  };

  const runLocationAnalysis = async () => {
    const lat = Number(latInput);
    const lon = Number(lonInput);

    if (Number.isNaN(lat) || Number.isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      setLocationError(t("soil.locationInvalid"));
      return;
    }

    setLocationError(null);
    setLocationLoading(true);
    try {
      const advisory = await getLocationAdvisory({ latitude: lat, longitude: lon });
      setLocationAdvisory(advisory);
      saveLastLocationAdvisory(advisory);
    } catch {
      setLocationError(t("soil.locationFetchError"));
    } finally {
      setLocationLoading(false);
    }
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError(t("soil.geoUnsupported"));
      return;
    }

    setDetectingLocation(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatInput(position.coords.latitude.toFixed(4));
        setLonInput(position.coords.longitude.toFixed(4));
        setDetectingLocation(false);
      },
      () => {
        setLocationError(t("soil.geoDenied"));
        setDetectingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 12000 },
    );
  };

  return (
    <div className="min-h-screen px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="section-title">{t("soil.title")}</h1>
          <p className="section-subtitle">{t("soil.subtitle")}</p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 fade-up">
          <div className="space-y-6">
            <div className="surface-card-strong p-6">
              <h2 className="text-xl font-bold text-forest-900 mb-6">{t("soil.formTitle")}</h2>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 stagger-in" noValidate>
                <div>
                  <label htmlFor="nitrogen" className="flex items-center gap-2 text-sm font-semibold text-forest-800 mb-2"><FlaskConical className="h-4 w-4 text-forest-600" /> {t("soil.nitrogen")}</label>
                  <input id="nitrogen" type="number" className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white/80 focus:border-forest-400" {...register("nitrogen")} />
                  {errors.nitrogen ? <p className="mt-1 text-sm text-red-600">{t("soil.error")}</p> : null}
                </div>

                <div>
                  <label htmlFor="phosphorus" className="flex items-center gap-2 text-sm font-semibold text-forest-800 mb-2"><FlaskConical className="h-4 w-4 text-forest-600" /> {t("soil.phosphorus")}</label>
                  <input id="phosphorus" type="number" className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white/80 focus:border-forest-400" {...register("phosphorus")} />
                  {errors.phosphorus ? <p className="mt-1 text-sm text-red-600">{t("soil.error")}</p> : null}
                </div>

                <div>
                  <label htmlFor="potassium" className="flex items-center gap-2 text-sm font-semibold text-forest-800 mb-2"><FlaskConical className="h-4 w-4 text-forest-600" /> {t("soil.potassium")}</label>
                  <input id="potassium" type="number" className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white/80 focus:border-forest-400" {...register("potassium")} />
                  {errors.potassium ? <p className="mt-1 text-sm text-red-600">{t("soil.error")}</p> : null}
                </div>

                <div>
                  <label htmlFor="ph" className="flex items-center gap-2 text-sm font-semibold text-forest-800 mb-2">{t("soil.ph")}</label>
                  <input id="ph" type="number" step="0.1" className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white/80 focus:border-forest-400" {...register("ph")} />
                  {errors.ph ? <p className="mt-1 text-sm text-red-600">{t("soil.error")}</p> : null}
                </div>

                <div>
                  <label htmlFor="landSize" className="flex items-center gap-2 text-sm font-semibold text-forest-800 mb-2"><Ruler className="h-4 w-4 text-forest-600" /> {t("soil.landSize")}</label>
                  <input id="landSize" type="number" step="0.1" className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white/80 focus:border-forest-400" {...register("landSize")} />
                  {errors.landSize ? <p className="mt-1 text-sm text-red-600">{t("soil.error")}</p> : null}
                </div>

                <button type="submit" disabled={submitting} className="btn-primary w-full disabled:opacity-70">{submitting ? t("soil.calculating") : t("soil.submit")}</button>
              </form>
            </div>

            <div className="surface-card-strong p-6">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <h2 className="text-xl font-bold text-forest-900">{t("soil.locationTitle")}</h2>
                  <p className="text-sm text-forest-800/75 mt-1">{t("soil.locationSubtitle")}</p>
                </div>
                <button type="button" onClick={useCurrentLocation} disabled={detectingLocation} className="btn-secondary !px-3 !py-2">
                  <LocateFixed className="h-4 w-4" />
                  {detectingLocation ? t("soil.detecting") : t("soil.detectCurrent")}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                <div>
                  <label htmlFor="lat" className="block text-xs font-semibold text-forest-800 mb-1">{t("soil.latitude")}</label>
                  <input id="lat" value={latInput} onChange={(e) => setLatInput(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-xl" placeholder="20.5937" />
                </div>
                <div>
                  <label htmlFor="lon" className="block text-xs font-semibold text-forest-800 mb-1">{t("soil.longitude")}</label>
                  <input id="lon" value={lonInput} onChange={(e) => setLonInput(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-xl" placeholder="78.9629" />
                </div>
              </div>

              <div className="mb-4">
                <div className="text-xs text-forest-800/80 bg-forest-50 rounded px-2 py-1 inline-block mb-2">{t("soil.mapHint")}</div>
                <LocationPickerMap
                  value={{ latitude: Number(latInput) || 20.5937, longitude: Number(lonInput) || 78.9629 }}
                  onChange={(next) => {
                    setLatInput(next.latitude.toFixed(4));
                    setLonInput(next.longitude.toFixed(4));
                  }}
                />
              </div>

              <button type="button" onClick={() => void runLocationAnalysis()} disabled={locationLoading} className="btn-primary w-full">
                <MapPin className="h-4 w-4" />
                {locationLoading ? t("soil.locationAnalyzing") : t("soil.locationAnalyze")}
              </button>

              {locationError ? <p className="mt-3 text-sm text-red-600">{locationError}</p> : null}
            </div>
          </div>

          <div className="space-y-5 fade-up">
            {locationAdvisory ? (
              <div className="surface-card-strong p-6">
                <h2 className="text-xl font-bold text-forest-900 mb-4">{t("soil.locationResultTitle")}</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                  <div className="surface-card p-4">
                    <p className="text-xs text-forest-700 mb-1">{t("soil.zone")}</p>
                    <p className="font-semibold text-forest-900">{locationAdvisory.climate.zone}</p>
                    <p className="text-xs text-forest-700 mt-2">{locationAdvisory.locationLabel}</p>
                  </div>
                  <div className="surface-card p-4">
                    <p className="text-xs text-forest-700 mb-1">{t("soil.soilType")}</p>
                    <p className="font-semibold text-forest-900">{locationAdvisory.soil.soilType}</p>
                    <p className="text-xs text-forest-700 mt-2">pH {locationAdvisory.soil.phBand}</p>
                  </div>
                </div>

                <div className="surface-card p-4 mb-4">
                  <h3 className="font-semibold text-forest-900 mb-2">{t("soil.climateSnapshot")}</h3>
                  <div className="text-sm text-forest-800 space-y-1">
                    <p>{t("soil.tempBand")}: {locationAdvisory.climate.tempBandC}</p>
                    <p>{t("soil.rainfallBand")}: {locationAdvisory.climate.rainfallBandMm}</p>
                    <p>{t("soil.humidityBand")}: {locationAdvisory.climate.humidityBand}</p>
                    <p>{t("soil.seasonSignal")}: {locationAdvisory.climate.seasonSignal}</p>
                  </div>
                </div>

                <div className="surface-card p-4 mb-4">
                  <h3 className="font-semibold text-forest-900 mb-2">{t("soil.locationCrops")}</h3>
                  <div className="flex flex-wrap gap-2">
                    {locationAdvisory.recommendedCrops.map((crop) => (
                      <span key={crop} className="px-3 py-1 rounded-full bg-leaf-100 text-leaf-700 text-xs font-semibold">{crop}</span>
                    ))}
                  </div>
                </div>

                <div className="surface-card p-4 mb-4">
                  <h3 className="font-semibold text-forest-900 mb-2">{t("soil.locationActions")}</h3>
                  <ul className="text-sm text-forest-800 list-disc list-inside space-y-1">
                    {locationAdvisory.actions.map((action) => (
                      <li key={action}>{action}</li>
                    ))}
                  </ul>
                </div>

                <div className="surface-card border border-yellow-200 bg-yellow-50 p-4 rounded-xl">
                  <p className="text-sm text-yellow-900">{locationAdvisory.caution}</p>
                </div>
              </div>
            ) : null}

            {result ? (
              <>
                <div className="surface-card-strong p-6">
                  <h2 className="text-xl font-bold text-forest-900 mb-4">{t("soil.healthTitle")}</h2>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3"><div className="bg-green-100 p-3 rounded-full"><CheckCircle className="h-8 w-8 text-green-600" /></div><div><p className="text-2xl font-bold text-green-600">{result.healthLabel}</p><p className="text-sm text-forest-800/70">{t("soil.healthSummary")}</p></div></div>
                    <div className="text-right"><p className="text-3xl font-bold text-forest-900">{result.healthScore}/100</p><p className="text-sm text-forest-800/70">{t("soil.healthScore")}</p></div>
                  </div>
                </div>

                <div className="surface-card-strong p-6">
                  <h2 className="text-xl font-bold text-forest-900 mb-4">{t("soil.recommendedCrops")}</h2>
                  <div className="space-y-3">
                    {result.crops.map((crop) => (
                      <div key={crop.name} className="surface-card p-4 hover:border-forest-300 transition-all">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3"><div className="bg-leaf-100 p-2 rounded-lg"><Sprout className="h-6 w-6 text-leaf-600" /></div><div><h3 className="font-bold text-forest-900">{crop.name}</h3><p className="text-sm text-forest-800/70">{crop.season}</p></div></div>
                          <div className="text-right"><p className="text-2xl font-bold text-forest-600">{crop.suitability}%</p><p className="text-xs text-forest-700/70">{t("soil.suitability")}</p></div>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                          <span className="bg-gray-100 text-gray-700 text-xs font-semibold px-3 py-1 rounded-full">NPK: {crop.npk}</span>
                          <span className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">{t("soil.profit")}: {crop.profit}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="surface-card-strong p-6">
                  <h3 className="text-lg font-bold text-forest-900 mb-3">Why this recommendation</h3>
                  <ul className="text-sm text-forest-800 list-disc list-inside space-y-1">
                    <li>Soil pH: {lastSoilInput?.ph ?? "--"} (crop fit is pH sensitive).</li>
                    <li>NPK signals: N {lastSoilInput?.nitrogen ?? "--"}, P {lastSoilInput?.phosphorus ?? "--"}, K {lastSoilInput?.potassium ?? "--"}.</li>
                    <li>Land size input: {lastSoilInput?.landSize ?? "--"} acres for practical planning.</li>
                    {locationAdvisory ? <li>Location climate and soil profile were included from coordinates-based advisory.</li> : null}
                  </ul>
                </div>

                <div className="surface-card-strong border border-yellow-200 bg-yellow-50 rounded-xl flex items-start gap-3 p-4">
                  <AlertCircle className="h-5 w-5 text-yellow-700 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-yellow-900">{t("soil.warning")}</p>
                </div>
              </>
            ) : (
              <div className="surface-card-strong bg-gradient-to-br from-forest-50 to-leaf-50 p-8 flex items-center justify-center">
                <div className="text-center"><Sprout className="h-16 w-16 text-forest-600 mx-auto mb-4" /><h3 className="text-xl font-bold text-forest-900 mb-2">{t("soil.awaitingTitle")}</h3><p className="text-forest-800/70 max-w-md">{t("soil.awaitingDesc")}</p></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
