import crypto from "node:crypto";
import { getDatabase } from "./database.js";
import { detectDiseaseCandidates } from "./diseaseAi.js";

const diseaseNameHiMap = {
  "late blight": "लेट ब्लाइट",
  "early blight": "अर्ली ब्लाइट",
  "powdery mildew": "पाउडरी मिल्ड्यू",
  "leaf spot": "लीफ स्पॉट",
  "bacterial blight": "बैक्टीरियल ब्लाइट",
  "septoria leaf spot": "सेप्टोरिया लीफ स्पॉट",
  "uncertain foliar disease": "अनिश्चित पत्ती रोग",
};

const sentenceHiMap = {
  "Avoid prolonged leaf wetness and improve airflow.": "पत्तियों पर लंबे समय तक नमी न रहने दें और वायु संचार बेहतर रखें।",
  "Scout nearby plants for early spread signs.": "पास के पौधों में शुरुआती फैलाव के संकेत नियमित जांचें।",
  "Clean tools after handling infected foliage.": "संक्रमित पत्तियों को छूने के बाद औजार साफ करें।",
  "Apply crop-specific treatment approved by local agriculture authority.": "स्थानीय कृषि प्राधिकरण द्वारा अनुमोदित फसल-विशिष्ट उपचार का उपयोग करें।",
  "Reassess disease progression after 3 to 5 days.": "3 से 5 दिन बाद रोग की प्रगति फिर जांचें।",
  "Use suitable biofungicide or biocontrol formulation as preventive support.": "निवारक समर्थन के लिए उपयुक्त जैव-फफूंदनाशी या बायोकंट्रोल उपयोग करें।",
  "Maintain balanced nutrition to reduce plant stress.": "पौधों का तनाव कम करने के लिए संतुलित पोषण बनाए रखें।",
  "Escalate to local agronomist if spread increases after first treatment cycle.": "पहले उपचार चक्र के बाद फैलाव बढ़े तो स्थानीय कृषि विशेषज्ञ से तुरंत संपर्क करें।",
  "Visible stress pattern detected": "तनाव का दृश्य पैटर्न मिला",
  "Spotted lesions on leaf surface": "पत्ती सतह पर धब्बेदार घाव",
  "Dark concentric lesions on older leaves": "पुरानी पत्तियों पर गहरे गोलाकार घाव",
  "White powdery film on foliage": "पत्तियों पर सफेद पाउडर जैसी परत",
  "General stress pattern": "सामान्य तनाव पैटर्न",
};

function ensureDistinctAlternatives(primaryName, candidates) {
  return candidates
    .filter((entry) => entry.name.toLowerCase() !== primaryName.toLowerCase())
    .slice(0, 4)
    .map((entry) => ({ name: entry.name, confidence: entry.confidence }));
}

function defaultGuidance(name) {
  return {
    preventiveMeasures: [
      "Avoid prolonged leaf wetness and improve airflow.",
      "Scout nearby plants for early spread signs.",
      "Clean tools after handling infected foliage.",
    ],
    curativeActions: [
      `Remove heavily affected leaves showing ${name} symptoms.`,
      "Apply crop-specific treatment approved by local agriculture authority.",
      "Reassess disease progression after 3 to 5 days.",
    ],
    organicOptions: [
      "Use suitable biofungicide or biocontrol formulation as preventive support.",
      "Maintain balanced nutrition to reduce plant stress.",
    ],
    escalationAdvice: "Escalate to local agronomist if spread increases after first treatment cycle.",
  };
}

function translateSeverityToHindi(value) {
  const normalized = String(value ?? "").toLowerCase();
  if (normalized === "high") return "उच्च";
  if (normalized === "medium") return "मध्यम";
  if (normalized === "low") return "कम";
  return "मध्यम";
}

function localizeDiagnosis(diagnosis, language) {
  if (language !== "hi") return diagnosis;

  const toHindiDiseaseName = (name) => diseaseNameHiMap[name.trim().toLowerCase()] ?? name;
  const toHindiText = (text) => {
    if (!text) return text;
    if (text.startsWith("Remove heavily affected leaves showing ") && text.endsWith(" symptoms.")) {
      const disease = text
        .replace("Remove heavily affected leaves showing ", "")
        .replace(" symptoms.", "");
      return `जिन पत्तियों में ${toHindiDiseaseName(disease)} के लक्षण हों, उन्हें तुरंत हटा दें।`;
    }
    return sentenceHiMap[text] ?? text;
  };

  const uncertaintyReasonMap = {
    no_candidates: "पर्याप्त संकेत नहीं मिले",
    low_image_quality: "छवि गुणवत्ता कम है",
    weak_signal: "लक्षण संकेत कमजोर हैं",
    low_margin: "शीर्ष मिलान में अंतर कम है",
  };

  return {
    ...diagnosis,
    primary: {
      ...diagnosis.primary,
      name: toHindiDiseaseName(diagnosis.primary.name),
      visibleSymptoms: (diagnosis.primary.visibleSymptoms ?? []).map(toHindiText),
    },
    alternatives: (diagnosis.alternatives ?? []).map((item) => ({
      ...item,
      name: toHindiDiseaseName(item.name),
    })),
    topCandidates: (diagnosis.topCandidates ?? []).map((item) => ({
      ...item,
      name: toHindiDiseaseName(item.name),
      visibleSymptoms: (item.visibleSymptoms ?? []).map(toHindiText),
    })),
    analysisSummary: "तस्वीर में दिख रहे दृश्य लक्षणों के आधार पर यह रोग विश्लेषण तैयार किया गया है।",
    confidenceNote:
      diagnosis.sources[0] === "fallback"
        ? "विश्वसनीयता कम हो सकती है क्योंकि बाहरी AI सेवाएं उपलब्ध नहीं थीं।"
        : "विश्वसनीयता अपलोड की गई तस्वीर के दृश्य लक्षणों के मिलान पर आधारित है।",
    severityLabel: translateSeverityToHindi(diagnosis.severity),
    guidance: {
      preventiveMeasures: diagnosis.guidance.preventiveMeasures.map(toHindiText),
      curativeActions: diagnosis.guidance.curativeActions.map(toHindiText),
      organicOptions: diagnosis.guidance.organicOptions.map(toHindiText),
      escalationAdvice: toHindiText(diagnosis.guidance.escalationAdvice),
    },
    symptoms: diagnosis.symptoms.map(toHindiText),
    uncertainty: diagnosis.uncertainty
      ? {
          ...diagnosis.uncertainty,
          reasonLabel: uncertaintyReasonMap[diagnosis.uncertainty.reason] ?? "अनिश्चित परिणाम",
        }
      : diagnosis.uncertainty,
  };
}

export async function diagnosePlantDisease(file, context = {}) {
  const modelOutput = await detectDiseaseCandidates(file);
  const [primaryCandidate, ...remaining] = modelOutput.candidates;

  const primary = primaryCandidate ?? {
    name: "Uncertain foliar disease",
    confidence: 51,
    visibleSymptoms: ["Visible stress pattern detected"],
  };

  let profile = null;
  let db = null;
  try {
    db = await getDatabase();
    profile = await db.getDiseaseProfileByName(primary.name);
  } catch {
    profile = null;
  }

  const guidance = profile
    ? {
        preventiveMeasures: profile.preventiveMeasures,
        curativeActions: profile.curativeActions,
        organicOptions: profile.organicOptions,
        escalationAdvice: profile.escalationAdvice,
      }
    : defaultGuidance(primary.name);

  const diagnosisId = crypto.randomUUID();
  const recordedAt = new Date().toISOString();

  const diagnosis = {
    diagnosisId,
    recordedAt,
    cropHint: context.cropHint ?? null,
    fileName: file.originalname,
    primary,
    alternatives: ensureDistinctAlternatives(primary.name, remaining),
    topCandidates: modelOutput.candidates.slice(0, 5),
    analysisSummary: modelOutput.analysisSummary,
    severity: modelOutput.severity,
    severityLabel: modelOutput.severity,
    confidenceNote:
      modelOutput.providersUsed?.[0] === "fallback"
        ? "Confidence is lower because external AI providers were unavailable."
        : db
          ? "Confidence is based on cross-provider visual symptom matching."
          : "Confidence is based on visual matching. Database persistence is unavailable until MySQL is configured.",
    guidance,
    sources: modelOutput.providersUsed,
    symptoms: primary.visibleSymptoms?.length ? primary.visibleSymptoms : profile?.symptoms ?? [],
    providerErrors: modelOutput.providerErrors,
    quality: modelOutput.quality,
    uncertainty: modelOutput.uncertainty,
    model: modelOutput.model,
  };

  if (db) {
    await db.insertDiagnosis(diagnosis);
  }

  return localizeDiagnosis(diagnosis, context.language ?? "en");
}
