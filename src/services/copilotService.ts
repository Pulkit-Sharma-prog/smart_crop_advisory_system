import { z } from "zod";
import { appEnv } from "../config/env";
import { logger } from "../utils/logger";
import { loadProfile, loadRecentInsights } from "./farmProfileService";
import { apiRequest } from "./httpClient";

export interface CopilotMessage {
  role: "user" | "assistant";
  content: string;
}

const responseSchema = z.object({
  reply: z.string().min(1),
});

const HISTORY_LIMIT = 12;
const CROP_LIST = ["wheat", "rice", "maize", "corn", "soybean", "cotton", "tomato", "onion", "potato", "sugarcane", "mustard", "paddy"];

function sanitizeHistory(messages: CopilotMessage[]) {
  return (messages ?? [])
    .filter((item) => item && (item.role === "user" || item.role === "assistant"))
    .map((item) => ({
      role: item.role,
      content: item.content.trim().slice(0, 1200),
    }))
    .filter((item) => item.content.length > 0)
    .slice(-HISTORY_LIMIT);
}

function isGreeting(text = "") {
  const q = text.toLowerCase().trim();
  return /^(hi|hello|hey|namaste|hii|helo|good morning|good evening|good afternoon)$/.test(q);
}

function detectTopic(text = ""): "weather" | "irrigation" | "disease" | "market" | "soil" | "schedule" | "general" {
  const q = text.toLowerCase();
  if (/(irrigation|water|drip|sprinkler|sichai|pani|sinchai)/.test(q)) return "irrigation";
  if (/(rain|weather|forecast|wind|humidity|barish|mausam)/.test(q)) return "weather";
  if (/(disease|pest|fungus|blight|rust|insect|rog|keet)/.test(q)) return "disease";
  if (/(market|mandi|price|sell|profit|bazar|bazaar)/.test(q)) return "market";
  if (/(soil|npk|nitrogen|phosphorus|potassium|ph |fertiliz|mitti|khad)/.test(q)) return "soil";
  if (/(sowing|harvest|schedule|crop stage|buwai|katai)/.test(q)) return "schedule";
  return "general";
}

function detectCrop(text = "", fallbackCrop?: string) {
  const q = text.toLowerCase();
  const found = CROP_LIST.find((crop) => q.includes(crop));
  if (found) return found[0].toUpperCase() + found.slice(1);
  if (fallbackCrop?.trim()) return fallbackCrop.trim();
  return null;
}

function fallbackReply(messages: CopilotMessage[]) {
  const profile = loadProfile();
  const insights = loadRecentInsights();
  const lastUser = [...messages].reverse().find((item) => item.role === "user")?.content ?? "";
  const topic = detectTopic(lastUser);
  const crop = detectCrop(lastUser, profile.primaryCrop) ?? "your crop";
  const soilLabel = insights.soil && typeof insights.soil === "object" && insights.soil !== null && "healthLabel" in insights.soil
    ? String((insights.soil as { healthLabel?: string }).healthLabel ?? "")
    : "";

  if (isGreeting(lastUser)) {
    return [
      "Hello. I am your Farmer Copilot.",
      "I can help with weather, irrigation, disease, market selling, and soil planning.",
      "Tell me crop + issue + time window (today / next 48h), and I will give a direct action plan.",
      "Example: Tomato leaf spots, rain expected in 2 days, what should I do?",
    ].join("\n");
  }

  if (topic === "weather") {
    return [
      `Weather plan for ${crop}:`,
      "1) Today: spray only in low-wind windows.",
      "2) Next 48h: reduce/skip irrigation if rain is likely.",
      "3) Risk: waterlogging and fungal pressure.",
      "4) Prevention: keep drainage channels open.",
      soilLabel ? `Known context: last soil health ${soilLabel}.` : "",
    ].filter(Boolean).join("\n");
  }

  if (topic === "irrigation") {
    return [
      `Irrigation plan for ${crop}:`,
      "1) Today: irrigate only after top-soil moisture check.",
      "2) Next 48h: reduce water by 20-40% if rain chance is high.",
      "3) Risk: overwatering can increase root stress.",
      "4) Prevention: use short watering cycles.",
      soilLabel ? `Known context: last soil health ${soilLabel}.` : "",
    ].filter(Boolean).join("\n");
  }

  if (topic === "disease") {
    return [
      `Disease response for ${crop}:`,
      "1) Today: remove visibly infected leaves.",
      "2) Next 48h: targeted spray in calm weather window.",
      "3) Risk: spread accelerates in high humidity.",
      "4) Prevention: improve airflow and avoid late overhead irrigation.",
    ].join("\n");
  }

  if (topic === "market") {
    return [
      `Market plan for ${crop}:`,
      "1) Compare rates across at least two mandis.",
      "2) Use net price (rate - transport) for decision.",
      "3) Sell in batches if prices are volatile.",
      "4) Re-check trend before dispatch.",
    ].join("\n");
  }

  if (topic === "soil") {
    return [
      `Soil and nutrient plan for ${crop}:`,
      "1) Check pH and NPK fit.",
      "2) Use split dosing instead of one heavy application.",
      "3) Align nutrient timing with irrigation and weather.",
      "4) Track response in next 3-5 days.",
    ].join("\n");
  }

  return [
    "I can give you a direct advisory plan.",
    "Share crop + issue + time window (today / next 48h).",
    "Example: Tomato leaf spots, rain expected in 2 days, what should I do?",
  ].join("\n");
}

async function requestChat(payload: unknown) {
  const response = await apiRequest<unknown>("/api/copilot/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    timeoutMs: 12000,
    retryCount: 1,
  });
  return responseSchema.parse(response).reply;
}

export async function askCopilot(messages: CopilotMessage[], language = "en"): Promise<string> {
  const history = sanitizeHistory(messages);
  if (history.length === 0) return "Hello. I am your Farmer Copilot. Ask a farming question.";

  const profile = loadProfile();
  const insights = loadRecentInsights();
  const normalizedLanguage = language.toLowerCase().startsWith("hi") ? "hi" : "en";

  try {
    return await requestChat({
      language: normalizedLanguage,
      messages: history,
      context: { profile, insights },
    });
  } catch (errorWithContext) {
    logger.warn("Copilot chat with context failed. Retrying without context.", errorWithContext);

    try {
      return await requestChat({
        language: normalizedLanguage,
        messages: history,
      });
    } catch (errorWithoutContext) {
      logger.warn("Copilot chat API failed. Falling back to local advisory response.", errorWithoutContext);
      if (appEnv.allowApiFallback || appEnv.useMockData) return fallbackReply(history);
      throw errorWithoutContext;
    }
  }
}
