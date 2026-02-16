import { Calendar, CheckCircle, ChevronRight, Droplets, Sparkles, Sprout, Wheat } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAsyncData } from "../hooks/useAsyncData";
import { getSchedulePhases } from "../services/scheduleService";

export default function FarmingSchedule() {
  const { t, i18n } = useTranslation();
  const [selectedCrop, setSelectedCrop] = useState("wheat");

  const loadSchedule = useCallback(
    () => getSchedulePhases({ crop: selectedCrop, language: i18n.language }),
    [i18n.language, selectedCrop],
  );

  const { data: schedule, loading, error } = useAsyncData(loadSchedule, {
    cacheKey: `farming-schedule-${selectedCrop}-${i18n.language}`,
    ttlMs: 90000,
  });

  const cropOptions = [
    { value: "wheat", label: t("schedule.cropWheat") },
    { value: "rice", label: t("schedule.cropRice") },
    { value: "cotton", label: t("schedule.cropCotton") },
    { value: "maize", label: t("schedule.cropMaize") },
    { value: "soybean", label: t("schedule.cropSoybean") },
    { value: "sugarcane", label: t("schedule.cropSugarcane") },
    { value: "potato", label: t("schedule.cropPotato") },
    { value: "tomato", label: t("schedule.cropTomato") },
    { value: "onion", label: t("schedule.cropOnion") },
  ];

  const getColorClasses = (color: "leaf" | "sky" | "earth" | "forest") => {
    const colors = {
      leaf: { bg: "bg-leaf-100", text: "text-leaf-700", dot: "bg-leaf-500" },
      sky: { bg: "bg-sky-100", text: "text-sky-700", dot: "bg-sky-500" },
      earth: { bg: "bg-earth-100", text: "text-earth-700", dot: "bg-earth-500" },
      forest: { bg: "bg-forest-100", text: "text-forest-700", dot: "bg-forest-500" },
    };

    return colors[color];
  };

  const getIcon = (color: "leaf" | "sky" | "earth" | "forest") => {
    if (color === "leaf") return Sprout;
    if (color === "sky") return Droplets;
    if (color === "earth") return Sparkles;
    return Wheat;
  };

  const totalTasks = useMemo(
    () => (schedule ?? []).reduce((sum, phase) => sum + phase.tasks.length, 0),
    [schedule],
  );

  const nextFocus = useMemo(
    () => (schedule ?? []).find((item) => item.status === "upcoming") ?? (schedule ?? [])[0] ?? null,
    [schedule],
  );

  return (
    <div className="page-wrap">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="section-title">{t("schedule.title")}</h1>
          <p className="section-subtitle">{t("schedule.subtitle")}</p>
        </div>

        <div className="surface-card-strong p-4 mb-5">
          <div className="grid grid-cols-1 gap-3 items-end">
            <div>
              <label htmlFor="schedule-crop" className="block text-sm font-semibold text-forest-900 mb-2">
                {t("schedule.selectCrop")}
              </label>
              <select
                id="schedule-crop"
                className="bg-white"
                value={selectedCrop}
                onChange={(event) => setSelectedCrop(event.target.value)}
              >
                {cropOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-forest-700 mt-2">{t("schedule.cropHint")}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          <div className="surface-card-strong p-4">
            <p className="text-xs text-forest-700 font-semibold mb-1">{t("schedule.totalTasks")}</p>
            <p className="text-2xl font-bold text-forest-900">{totalTasks}</p>
          </div>
          <div className="surface-card-strong p-4">
            <p className="text-xs text-forest-700 font-semibold mb-1">{t("schedule.nextFocus")}</p>
            <p className="text-base font-bold text-forest-900 inline-flex items-center gap-1">
              {nextFocus?.phase ?? t("common.notAvailable")}
              <ChevronRight className="h-4 w-4 text-forest-700" />
            </p>
          </div>
        </div>

        {loading ? <p className="text-forest-800/90">{t("schedule.loading")}</p> : null}
        {error ? <p className="text-red-600">{t("schedule.loadError")}</p> : null}

        <div className="space-y-5">
          {(schedule ?? []).map((item) => {
            const colors = getColorClasses(item.color);
            const Icon = getIcon(item.color);

            return (
              <div key={item.phase} className="surface-card-strong overflow-hidden">
                <div className={`${colors.bg} px-5 md:px-6 py-4 border-b border-forest-100`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-white/80 flex items-center justify-center">
                        <Icon className={`h-6 w-6 ${colors.text}`} />
                      </div>
                      <div>
                        <h3 className={`text-xl font-bold ${colors.text}`}>{item.phase}</h3>
                        <p className="text-sm text-forest-800/90 mt-0.5 flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {item.date}
                        </p>
                      </div>
                    </div>
                    {item.status === "completed" ? (
                      <div className="tone-success text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                        <CheckCircle className="h-4 w-4" />
                        {t("schedule.completed")}
                      </div>
                    ) : (
                      <div className="tone-warning text-xs font-semibold px-3 py-1 rounded-full">
                        {t("schedule.upcoming")}
                      </div>
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
                          <p className="text-sm text-forest-800/90 mt-1">{taskItem.reason}</p>
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
