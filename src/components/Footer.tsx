import { Leaf } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="mt-auto border-t border-forest-700 bg-gradient-to-b from-[#0f2f21] via-forest-900 to-[#0f2f21] text-white" role="contentinfo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur p-5 shadow-[0_16px_30px_-24px_rgba(0,0,0,0.55)]">
            <h3 className="text-lg font-semibold mb-3 flex items-center text-white">
              <Leaf className="h-5 w-5 mr-2 text-leaf-300" />
              {t("footer.aboutTitle")}
            </h3>
            <p className="text-white/80 text-sm leading-relaxed">{t("footer.aboutText")}</p>
          </div>

          <div className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur p-5 shadow-[0_16px_30px_-24px_rgba(0,0,0,0.55)]">
            <h3 className="text-lg font-semibold mb-3 text-white">{t("footer.teamTitle")}</h3>
            <p className="text-white/80 text-sm leading-relaxed">{t("footer.teamText")}</p>
          </div>

          <div className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur p-5 shadow-[0_16px_30px_-24px_rgba(0,0,0,0.55)]">
            <h3 className="text-lg font-semibold mb-3 text-white">{t("footer.missionTitle")}</h3>
            <p className="text-leaf-300 text-sm font-semibold">{t("footer.missionTagline")}</p>
            <p className="text-white/80 text-sm mt-2 leading-relaxed">{t("footer.missionText")}</p>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-forest-800 text-center">
          <p className="text-white/85 text-sm tracking-wide">{t("footer.presentedBy")}</p>
        </div>
      </div>
    </footer>
  );
}

