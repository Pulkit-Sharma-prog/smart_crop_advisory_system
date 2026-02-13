import { loadRecentInsights } from "./farmProfileService";

export interface CopilotMessage {
  role: "user" | "assistant";
  content: string;
}

function summarizeContext() {
  const insights = loadRecentInsights();
  const lines: string[] = [];

  if (insights.soil && typeof insights.soil === "object" && insights.soil !== null && "healthLabel" in insights.soil) {
    const soil = insights.soil as { healthLabel?: string; healthScore?: number };
    lines.push(`Last soil health: ${soil.healthLabel ?? "Unknown"} (${soil.healthScore ?? "--"}/100).`);
  }

  if (insights.location && typeof insights.location === "object" && insights.location !== null && "climate" in insights.location) {
    const location = insights.location as { climate?: { zone?: string }; soil?: { soilType?: string } };
    lines.push(`Location advisory: ${location.climate?.zone ?? "Unknown zone"}, soil ${location.soil?.soilType ?? "Unknown"}.`);
  }

  if (insights.disease && typeof insights.disease === "object" && insights.disease !== null && "primary" in insights.disease) {
    const disease = insights.disease as { primary?: { name?: string; confidence?: number } };
    lines.push(`Last disease scan: ${disease.primary?.name ?? "Unknown"} (${disease.primary?.confidence ?? "--"}%).`);
  }

  return lines;
}

export function runCopilot(question: string): string {
  const q = question.toLowerCase();
  const context = summarizeContext();

  if (q.includes("irrigation") || q.includes("water")) {
    return [
      "Irrigation suggestion:",
      "1) Check top-soil moisture before evening watering.",
      "2) If humidity is high, use lighter but more frequent irrigation.",
      "3) Avoid overwatering in low-drainage plots.",
      ...context,
    ].join("\n");
  }

  if (q.includes("disease") || q.includes("fungus") || q.includes("pest")) {
    return [
      "Disease management suggestion:",
      "1) Remove visibly infected leaves first.",
      "2) Spray in low-wind hours.",
      "3) Re-check field in 3-4 days and repeat if spread continues.",
      ...context,
    ].join("\n");
  }

  if (q.includes("sell") || q.includes("mandi") || q.includes("market")) {
    return [
      "Market action plan:",
      "1) Compare at least 2 mandis before dispatch.",
      "2) Prioritize crops with positive short-term trend.",
      "3) Split selling across days if price volatility is high.",
      ...context,
    ].join("\n");
  }

  return [
    "Smart advisory summary:",
    "1) Keep crop-wise field records weekly.",
    "2) Follow nutrient split dosing instead of one-time heavy application.",
    "3) Use weather and mandi trend together before final decisions.",
    ...context,
  ].join("\n");
}
