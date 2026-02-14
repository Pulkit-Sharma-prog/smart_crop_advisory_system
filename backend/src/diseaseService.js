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
  "Avoid prolonged leaf wetness and improve airflow.": "पत्तियों पर लंबे समय तक नमी न रहने दें और वायु संचार बेहतर करें।",
  "Scout nearby plants for early spread signs.": "पास की पौधों में शुरुआती फैलाव के संकेतों की नियमित जांच करें।",
  "Clean tools after handling infected foliage.": "संक्रमित पत्तियों को छूने के बाद औजारों को साफ करें।",
  "Apply crop-specific treatment approved by local agriculture authority.": "स्थानीय कृषि प्राधिकरण द्वारा अनुमोदित फसल-विशिष्ट उपचार का उपयोग करें।",
  "Reassess disease progression after 3 to 5 days.": "3 से 5 दिन बाद रोग की प्रगति फिर से जांचें।",
  "Use suitable biofungicide or biocontrol formulation as preventive support.": "निवारक समर्थन के रूप में उपयुक्त जैव-फफूंदनाशी या बायोकंट्रोल फॉर्मूलेशन उपयोग करें।",
  "Maintain balanced nutrition to reduce plant stress.": "पौधों के तनाव को कम करने के लिए संतुलित पोषण बनाए रखें।",
  "Escalate to local agronomist if spread increases after first treatment cycle.": "पहले उपचार चक्र के बाद फैलाव बढ़े तो स्थानीय कृषि विशेषज्ञ से तुरंत संपर्क करें।",
  "Avoid overhead irrigation late in the day.": "दिन के अंत में ऊपर से सिंचाई करने से बचें।",
  "Improve airflow by maintaining proper plant spacing.": "उचित पौध दूरी रखकर वायु संचार बेहतर करें।",
  "Remove volunteer host plants and infected debris.": "स्वतः उगे मेजबान पौधे और संक्रमित अवशेष हटाएं।",
  "Prune and destroy infected leaves immediately.": "संक्रमित पत्तियों को तुरंत काटकर नष्ट करें।",
  "Apply a registered anti-oomycete fungicide as per local label.": "स्थानीय निर्देशानुसार पंजीकृत एंटी-ऊमाइसीट फफूंदनाशी का उपयोग करें।",
  "Repeat treatment at 5 to 7 day interval during high humidity.": "अधिक आर्द्रता में 5 से 7 दिन के अंतराल पर उपचार दोहराएं।",
  "Use copper-based approved organic fungicides.": "अनुमोदित कॉपर-आधारित जैविक फफूंदनाशी का उपयोग करें।",
  "Spray bio-control products containing Bacillus subtilis.": "Bacillus subtilis युक्त बायोकंट्रोल उत्पाद का छिड़काव करें।",
  "Use certified disease-free seed and seedlings.": "प्रमाणित रोग-मुक्त बीज और पौध का उपयोग करें।",
  "Follow crop rotation of at least 2 years.": "कम से कम 2 वर्ष का फसल चक्र अपनाएं।",
  "Mulch soil to reduce splash dispersal.": "छींटों से फैलाव कम करने के लिए मल्चिंग करें।",
  "Remove heavily affected leaves and stems.": "अधिक प्रभावित पत्तियां और तने हटा दें।",
  "Use recommended protectant fungicide on schedule.": "निर्धारित समय पर अनुशंसित संरक्षक फफूंदनाशी का प्रयोग करें।",
  "Support plant nutrition, especially potassium.": "पौध पोषण को सहारा दें, विशेषकर पोटाश।",
  "Use neem-based products as supportive management.": "सहायक प्रबंधन के रूप में नीम-आधारित उत्पाद उपयोग करें।",
  "Apply compost tea only as preventive supplement.": "कम्पोस्ट टी का उपयोग केवल निवारक पूरक के रूप में करें।",
  "Keep canopy open with pruning and spacing.": "छंटाई और दूरी रखकर पौधे का कैनोपी खुला रखें।",
  "Avoid excess nitrogen fertilization.": "नाइट्रोजन का अत्यधिक उपयोग न करें।",
  "Monitor humidity buildup in low-airflow zones.": "कम वायु प्रवाह वाले क्षेत्रों में आर्द्रता बढ़ने की निगरानी करें।",
  "Remove infected plant parts early.": "संक्रमित भागों को शुरुआती चरण में हटा दें।",
  "Use sulfur or systemic fungicide as per crop label.": "फसल निर्देशानुसार सल्फर या सिस्टमिक फफूंदनाशी का उपयोग करें।",
  "Recheck and repeat spray within 7 days if needed.": "जरूरत हो तो 7 दिनों के भीतर दोबारा छिड़काव करें।",
  "Use potassium bicarbonate sprays.": "पोटेशियम बाइकार्बोनेट का छिड़काव करें।",
  "Apply neem oil in evening hours.": "शाम के समय नीम तेल का उपयोग करें।",
  "Use drip irrigation to reduce wet foliage time.": "पत्तियों के गीले रहने का समय कम करने के लिए ड्रिप सिंचाई अपनाएं।",
  "Sanitize tools before moving between plots.": "एक प्लॉट से दूसरे में जाने से पहले औजारों को सैनिटाइज करें।",
  "Avoid dense planting that blocks airflow.": "बहुत घनी रोपाई से बचें जिससे वायु प्रवाह रुकता है।",
  "Prune affected leaves and avoid field composting of infected waste.": "प्रभावित पत्तियां काटें और संक्रमित अवशेष का खेत में कम्पोस्ट न बनाएं।",
  "Apply broad-spectrum fungicide/bactericide according to diagnosis.": "निदान के अनुसार ब्रॉड-स्पेक्ट्रम फफूंदनाशी/बैक्टीरिसाइड का उपयोग करें।",
  "Track progression every 48 hours.": "हर 48 घंटे में प्रगति ट्रैक करें।",
  "Use copper soap formulations where allowed.": "जहां अनुमति हो, कॉपर सोप फॉर्मुलेशन का उपयोग करें।",
  "Use biofungicide based on Trichoderma as preventive support.": "निवारक समर्थन के लिए ट्राइकोडर्मा आधारित जैव-फफूंदनाशी उपयोग करें।",
  "Use resistant varieties where available.": "जहां उपलब्ध हों, प्रतिरोधी किस्में अपनाएं।",
  "Avoid excess field moisture and standing water.": "खेत में अतिरिक्त नमी और जलभराव से बचें।",
  "Disinfect field equipment regularly.": "खेत के उपकरण नियमित रूप से कीटाणुरहित करें।",
  "Rogue severely infected clumps early.": "गंभीर रूप से संक्रमित गुच्छों को जल्दी निकाल दें।",
  "Use approved bactericide based on local extension guidance.": "स्थानीय कृषि सलाह के अनुसार अनुमोदित बैक्टीरिसाइड उपयोग करें।",
  "Balance nitrogen and potassium to reduce stress.": "तनाव कम करने के लिए नाइट्रोजन और पोटाश संतुलित रखें।",
  "Use biological bacterial suppressants as recommended locally.": "स्थानीय अनुशंसा अनुसार जैविक बैक्टीरिया-नियंत्रक उपयोग करें।",
  "Apply silicon-rich amendments to improve plant resilience.": "पौधों की सहनशीलता बढ़ाने के लिए सिलिकॉन-समृद्ध संशोधन करें।",
  "Water-soaked lesions on leaves": "पत्तियों पर पानी जैसे धब्बे",
  "Dark brown patches with pale green halo": "हल्के हरे घेरे के साथ गहरे भूरे धब्बे",
  "White fungal growth on leaf underside during humid weather": "आर्द्र मौसम में पत्ती के नीचे सफेद फफूंद वृद्धि",
  "Concentric target-like spots on older leaves": "पुरानी पत्तियों पर गोल-गोल निशाने जैसे धब्बे",
  "Yellowing around necrotic leaf lesions": "सूखे धब्बों के आसपास पीलापन",
  "Lower canopy defoliation": "निचली पत्तियों का झड़ना",
  "White powdery coating on leaf surfaces": "पत्तियों की सतह पर सफेद पाउडर जैसी परत",
  "Leaf curling and distortion": "पत्तियों का मुड़ना और विकृति",
  "Premature leaf drop in severe cases": "गंभीर स्थिति में पत्तियों का समय से पहले गिरना",
  "Small circular brown or black spots": "छोटे गोल भूरे या काले धब्बे",
  "Spots may merge into larger necrotic areas": "धब्बे मिलकर बड़े सूखे भाग बना सकते हैं",
  "Yellow halos around lesions": "घावों के आसपास पीला घेरा",
  "Water-soaked streaks that turn yellow-brown": "पानी जैसे धारियां जो पीली-भूरी हो जाती हैं",
  "Leaf tip drying and wilting": "पत्ती की नोक का सूखना और मुरझाना",
  "Rapid spread after rain and wind": "बारिश और हवा के बाद तेज फैलाव",
};

function ensureDistinctAlternatives(primaryName, candidates) {
  return candidates
    .filter((entry) => entry.name.toLowerCase() !== primaryName.toLowerCase())
    .slice(0, 3)
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
    analysisSummary: "तस्वीर में दिख रहे लक्षणों के आधार पर यह रोग विश्लेषण तैयार किया गया है।",
    confidenceNote:
      diagnosis.sources[0] === "fallback"
        ? "विश्वसनीयता कम हो सकती है क्योंकि बाहरी AI सेवाएं उपलब्ध नहीं थीं।"
        : "विश्वसनीयता अपलोड की गई तस्वीर के दृश्य लक्षणों के मिलान पर आधारित है।",
    guidance: {
      preventiveMeasures: diagnosis.guidance.preventiveMeasures.map(toHindiText),
      curativeActions: diagnosis.guidance.curativeActions.map(toHindiText),
      organicOptions: diagnosis.guidance.organicOptions.map(toHindiText),
      escalationAdvice: toHindiText(diagnosis.guidance.escalationAdvice),
    },
    symptoms: diagnosis.symptoms.map(toHindiText),
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
    analysisSummary: modelOutput.analysisSummary,
    severity: modelOutput.severity,
    confidenceNote:
      modelOutput.providersUsed[0] === "fallback"
        ? "Confidence is lower because external AI providers were unavailable."
        : db
          ? "Confidence is based on cross-provider visual symptom matching."
          : "Confidence is based on visual matching. Database persistence is unavailable until MySQL is configured.",
    guidance,
    sources: modelOutput.providersUsed,
    symptoms: primary.visibleSymptoms?.length ? primary.visibleSymptoms : profile?.symptoms ?? [],
    providerErrors: modelOutput.providerErrors,
  };

  if (db) {
    await db.insertDiagnosis(diagnosis);
  }

  return localizeDiagnosis(diagnosis, context.language ?? "en");
}
