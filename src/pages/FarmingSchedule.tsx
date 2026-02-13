import { Calendar, CheckCircle, Droplets, Sparkles, Sprout, Wheat } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAsyncData } from "../hooks/useAsyncData";
import { getSchedulePhases } from "../services/scheduleService";

export default function FarmingSchedule() {
  const { t } = useTranslation();
  const { data: schedule, loading, error } = useAsyncData(getSchedulePhases, {
    cacheKey: "farming-schedule",
    ttlMs: 90000,
  });

  const getColorClasses = (color: "leaf" | "sky" | "earth" | "forest") => {
    const colors = {
      leaf: { bg: "bg-leaf-100", text: "text-leaf-700", dot: "bg-leaf-500" },
      sky: { bg: "bg-sky-100", text: "text-sky-700", dot: "bg-sky-500" },
      earth: { bg: "bg-earth-100", text: "text-earth-700", dot: "bg-earth-500" },
      forest: { bg: "bg-forest-100", text: "text-forest-700", dot: "bg-forest-500" },
    };

    return colors[color];
  };

  const getIcon = (phase: string) => {
    if (phase.includes("Sowing")) return Sprout;
    if (phase.includes("Irrigation")) return Droplets;
    if (phase.includes("Spray")) return Sparkles;
    return Wheat;
  };

  return (
    <div className="min-h-screen px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="section-title">{t("schedule.title")}</h1>
          <p className="section-subtitle">{t("schedule.subtitle")}</p>
        </div>

        {loading ? <p className="text-forest-800/80">{t("schedule.loading")}</p> : null}
        {error ? <p className="text-red-600">{t("schedule.loadError")}</p> : null}

        <div className="space-y-5">
          {(schedule ?? []).map((item) => {
            const colors = getColorClasses(item.color);
            const Icon = getIcon(item.phase);

            return (
              <div key={item.phase} className="surface-card-strong overflow-hidden">
                <div className={`${colors.bg} px-6 py-4 border-b border-gray-200`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-white/80 flex items-center justify-center">
                        <Icon className={`h-6 w-6 ${colors.text}`} />
                      </div>
                      <div>
                        <h3 className={`text-xl font-bold ${colors.text}`}>{item.phase}</h3>
                        <p className="text-sm text-forest-800/80 mt-0.5 flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {item.date}
                        </p>
                      </div>
                    </div>
                    {item.status === "completed" ? (
                      <div className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                        <CheckCircle className="h-4 w-4" />
                        {t("schedule.completed")}
                      </div>
                    ) : (
                      <div className="bg-yellow-100 text-yellow-700 text-xs font-semibold px-3 py-1 rounded-full">{t("schedule.upcoming")}</div>
                    )}
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  {item.tasks.map((taskItem) => (
                    <div key={taskItem.task} className="surface-card p-4">
                      <div className="flex items-start gap-3">
                        <div className={`${colors.dot} w-2.5 h-2.5 rounded-full mt-2 flex-shrink-0`} />
                        <div>
                          <p className="font-semibold text-forest-900">{taskItem.task}</p>
                          <p className="text-sm text-forest-800/75 mt-1">{taskItem.reason}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
