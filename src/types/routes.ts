export const routes = {
  home: "/",
  login: "/login",
  dashboard: "/dashboard",
  weather: "/weather",
  advisory: "/advisory",
  diseaseDetection: "/disease-detection",
  farmingSchedule: "/farming-schedule",
  marketPrices: "/market-prices",
  farmTools: "/farm-tools",
} as const;

export type AppRoute = (typeof routes)[keyof typeof routes];

export const primaryNavItems: Array<{ labelKey: string; path: AppRoute; protected?: boolean }> = [
  { labelKey: "nav.home", path: routes.home, protected: false },
  { labelKey: "nav.dashboard", path: routes.dashboard, protected: true },
  { labelKey: "nav.advisory", path: routes.advisory, protected: true },
  { labelKey: "nav.marketPrices", path: routes.marketPrices, protected: true },
  { labelKey: "nav.farmTools", path: routes.farmTools, protected: true },
];
