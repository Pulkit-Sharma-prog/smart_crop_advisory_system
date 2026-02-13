import type { MarketItem } from "./marketService";
import type { WeatherSnapshot } from "./weatherService";

export interface AdvisoryAlert {
  id: string;
  title: string;
  message: string;
  severity: "high" | "medium" | "low";
}

export function generateAdvisoryAlerts(weather: WeatherSnapshot | null, marketData: MarketItem[] | null): AdvisoryAlert[] {
  const alerts: AdvisoryAlert[] = [];

  if (weather && weather.humidityPercent >= 75) {
    alerts.push({
      id: "humidity-risk",
      title: "Disease pressure risk",
      message: "Humidity is high. Increase field scouting frequency and avoid late evening irrigation.",
      severity: "high",
    });
  }

  if (weather && weather.windKmph >= 18) {
    alerts.push({
      id: "wind-risk",
      title: "Spray caution",
      message: "Wind speed is elevated. Prefer morning spray windows for better coverage.",
      severity: "medium",
    });
  }

  if (marketData && marketData.length > 0) {
    const top = [...marketData].sort((a, b) => b.changePercent - a.changePercent)[0];
    if (top && top.changePercent >= 8) {
      alerts.push({
        id: "market-spike",
        title: "Market opportunity",
        message: `${top.crop} is up by ${top.changePercent}%. Compare nearby mandis before selling.`,
        severity: "low",
      });
    }
  }

  if (alerts.length === 0) {
    alerts.push({
      id: "stable-day",
      title: "Stable advisory window",
      message: "No major weather or market risk detected. Continue planned field operations.",
      severity: "low",
    });
  }

  return alerts;
}
