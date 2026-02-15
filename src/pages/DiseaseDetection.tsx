import { AlertCircle, Camera, CheckCircle2, Image as ImageIcon, Shield, Upload } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { saveLastDiseaseResult } from "../services/farmProfileService";
import { analyzeCropImage, type DiseaseResult } from "../services/diseaseService";

const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;

export default function DiseaseDetection() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [result, setResult] = useState<DiseaseResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t, i18n } = useTranslation();

  const hasResult = useMemo(() => Boolean(result), [result]);
  const severity = useMemo(() => {
    if (result?.severity) return result.severity;
    const confidence = result?.primary.confidence ?? 0;
    if (confidence >= 85) return "High";
    if (confidence >= 65) return "Medium";
    return "Low";
  }, [result]);

  const readFile = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });

  const validateFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      return t("disease.fileTypeError");
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      return t("disease.fileSizeError");
    }

    return null;
  };

  const handleFile = async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setIsAnalyzing(true);

    try {
      const image = await readFile(file);
      setSelectedImage(image);

      const analysis = await analyzeCropImage(file, i18n.language);
      setResult(analysis);
      saveLastDiseaseResult(analysis);
    } catch {
      setError(t("common.error"));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await handleFile(file);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) await handleFile(file);
  };

  return (
    <div className="page-wrap">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6"><h1 className="section-title">{t("disease.title")}</h1><p className="section-subtitle">{t("disease.subtitle")}</p></div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div className="surface-card-strong p-5 md:p-6">
              <h2 className="text-xl font-bold text-forest-900 mb-6">{t("disease.uploadTitle")}</h2>

              <div onDragOver={(e) => e.preventDefault()} onDrop={(e) => void handleDrop(e)} className="border-2 border-dashed border-forest-200 rounded-2xl p-6 text-center hover:border-forest-500 hover:bg-forest-50/70 transition-colors cursor-pointer bg-forest-50/40">
                {!selectedImage ? (
                  <label className="cursor-pointer block">
                    <input type="file" accept="image/*" onChange={(e) => void handleImageUpload(e)} className="hidden" />
                    <Upload className="h-16 w-16 text-forest-400 mx-auto mb-4" />
                    <p className="text-lg font-semibold text-forest-900 mb-2">{t("disease.dropText")}</p>
                    <p className="text-sm text-forest-700/90">{t("disease.supported")}</p>
                  </label>
                ) : (
                  <div className="space-y-4">
                    <img src={selectedImage} alt={t("disease.imageAlt")} className="max-h-64 mx-auto rounded-xl shadow-md border border-white" />
                    <button onClick={() => { setSelectedImage(null); setResult(null); setError(null); }} className="text-sm text-forest-700 hover:text-forest-900 font-semibold">{t("disease.uploadDifferent")}</button>
                  </div>
                )}
              </div>

              {error ? <p className="mt-3 text-sm text-red-600 font-medium">{error}</p> : null}

              <div className="mt-6">
                <label className="cursor-pointer block">
                  <input type="file" accept="image/*" capture="environment" onChange={(e) => void handleImageUpload(e)} className="hidden" />
                  <span className="btn-primary w-full"><Camera className="h-5 w-5" />{t("disease.takePhoto")}</span>
                </label>
              </div>
            </div>

            <div className="surface-card-strong bg-blue-50 border-blue-100 p-5">
              <div className="flex items-start gap-3">
                <ImageIcon className="h-5 w-5 text-blue-700 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-blue-900 mb-2">{t("disease.tipsTitle")}</h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>{t("disease.tip1")}</li>
                    <li>{t("disease.tip2")}</li>
                    <li>{t("disease.tip3")}</li>
                    <li>{t("disease.tip4")}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {!hasResult ? (
              <div className="surface-card-strong bg-gradient-to-br from-leaf-50 to-forest-50 p-6 flex items-center justify-center h-full">
                <div className="text-center">
                  <Shield className="h-16 w-16 text-forest-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-forest-900 mb-2">{t("disease.readyTitle")}</h3>
                  <p className="text-forest-800/90 max-w-md">{t("disease.readyDesc")}</p>
                  {isAnalyzing ? <p className="text-sm text-forest-700 mt-4 font-semibold">{t("disease.analyzing")}</p> : null}
                </div>
              </div>
            ) : (
              <>
                <div className="surface-card-strong p-5 md:p-6">
                  <h2 className="text-xl font-bold text-forest-900 mb-4">{t("disease.resultsTitle")}</h2>
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="font-bold text-red-900 mb-1">{result?.primary.name}</h3>
                        <p className="text-sm text-red-800 mb-2">{t("disease.primaryLabel")}</p>
                        <p className="text-sm font-semibold text-red-900">{t("disease.confidence")}: {result?.primary.confidence}%</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <h4 className="font-semibold text-forest-900 mb-2">{t("disease.altMatches")}</h4>
                    <div className="space-y-2 text-sm">
                      {result?.alternatives.map((item) => (
                        <div key={item.name} className="flex justify-between rounded-lg bg-white px-3 py-2 border border-gray-100"><span className="text-forest-800">{item.name}</span><span className="font-semibold text-forest-900">{item.confidence}%</span></div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 p-4 bg-forest-50 rounded-xl border border-forest-100">
                    <h4 className="font-semibold text-forest-900 mb-2">{t("disease.explainabilityTitle")}</h4>
                    <p className="text-sm text-forest-800">{t("disease.severityEstimate")}: <strong>{severity}</strong></p>
                    <p className="text-sm text-forest-800">{result?.analysisSummary}</p>
                    <p className="text-sm text-forest-800">{result?.confidenceNote}</p>
                    {result?.sources?.length ? <p className="text-sm text-forest-800">{t("disease.sourcesLabel")}: {result.sources.join(", ")}</p> : null}
                    <p className="text-sm text-forest-800">{t("disease.advisoryNote")}</p>
                  </div>
                </div>

                <div className="surface-card-strong p-5 md:p-6">
                  <h3 className="text-lg font-bold text-forest-900 mb-4">{t("disease.treatmentTitle")}</h3>
                  <div className="space-y-4 text-sm text-forest-800">
                    {(result?.guidance.curativeActions ?? [t("disease.treat1"), t("disease.treat2"), t("disease.treat3")]).map((item) => (
                      <p key={`curative-${item}`} className="flex items-start gap-3"><CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />{item}</p>
                    ))}
                  </div>
                  <h4 className="text-base font-semibold text-forest-900 mt-5 mb-3">{t("disease.preventiveTitle")}</h4>
                  <div className="space-y-3 text-sm text-forest-800">
                    {(result?.guidance.preventiveMeasures ?? []).map((item) => (
                      <p key={`preventive-${item}`} className="flex items-start gap-3"><CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5" />{item}</p>
                    ))}
                  </div>
                  {result?.guidance.organicOptions?.length ? (
                    <>
                      <h4 className="text-base font-semibold text-forest-900 mt-5 mb-3">{t("disease.organicTitle")}</h4>
                      <div className="space-y-3 text-sm text-forest-800">
                        {result.guidance.organicOptions.map((item) => (
                          <p key={`organic-${item}`} className="flex items-start gap-3"><CheckCircle2 className="h-5 w-5 text-yellow-600 mt-0.5" />{item}</p>
                        ))}
                      </div>
                    </>
                  ) : null}
                  {result?.guidance.escalationAdvice ? (
                    <p className="text-sm text-forest-900 mt-5"><strong>{t("disease.escalationLabel")}:</strong> {result.guidance.escalationAdvice}</p>
                  ) : null}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


