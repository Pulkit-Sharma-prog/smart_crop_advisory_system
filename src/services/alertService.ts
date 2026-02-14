import type { MarketItem } from "./marketService";
import type { WeatherSnapshot } from "./weatherService";

export interface AdvisoryAlert {
  id: string;
  title: string;
  message: string;
  severity: "high" | "medium" | "low";
}

interface Translator {
  (key: string, options?: Record<string, unknown>): string;
}

export function generateAdvisoryAlerts(
  weather: WeatherSnapshot | null,
  marketData: MarketItem[] | null,
  t: Translator,
): AdvisoryAlert[] {
  const alerts: AdvisoryAlert[] = [];

  if (weather && weather.humidityPercent >= 75) {
    alerts.push({
      id: "humidity-risk",
      title: t("alerts.humidityRiskTitle"),
      message: t("alerts.humidityRiskMessage"),
      severity: "high",
    });
  }

  if (weather && weather.windKmph >= 18) {
    alerts.push({
      id: "wind-risk",
      title: t("alerts.windRiskTitle"),
      message: t("alerts.windRiskMessage"),
      severity: "medium",
    });
  }

  if (marketData && marketData.length > 0) {
    const top = [...marketData].sort((a, b) => b.changePercent - a.changePercent)[0];
    if (top && top.changePercent >= 8) {
      alerts.push({
        id: "market-spike",
        title: t("alerts.marketOpportunityTitle"),
        message: t("alerts.marketOpportunityMessage", { crop: top.crop, changePercent: top.changePercent }),
        severity: "low",
      });
    }
  }

  if (alerts.length === 0) {
    alerts.push({
      id: "stable-day",
      title: t("alerts.stableWindowTitle"),
      message: t("alerts.stableWindowMessage"),
      severity: "low",
    });
  }

  return alerts;
}
