import { Leaf } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="mt-auto border-t border-white/50 bg-gradient-to-b from-forest-900 to-forest-900 text-white" role="contentinfo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="surface-card bg-white/5 border-white/10 p-5">
            <h3 className="text-lg font-semibold mb-3 flex items-center">
              <Leaf className="h-5 w-5 mr-2 text-leaf-200" />
              {t("footer.aboutTitle")}
            </h3>
            <p className="text-forest-100 text-sm leading-relaxed">{t("footer.aboutText")}</p>
          </div>

          <div className="surface-card bg-white/5 border-white/10 p-5">
            <h3 className="text-lg font-semibold mb-3">{t("footer.teamTitle")}</h3>
            <p className="text-forest-100 text-sm leading-relaxed">{t("footer.teamText")}</p>
          </div>

          <div className="surface-card bg-white/5 border-white/10 p-5">
            <h3 className="text-lg font-semibold mb-3">{t("footer.missionTitle")}</h3>
            <p className="text-leaf-200 text-sm font-semibold">{t("footer.missionTagline")}</p>
            <p className="text-forest-100 text-sm mt-2 leading-relaxed">{t("footer.missionText")}</p>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-forest-800 text-center">
          <p className="text-forest-200 text-sm tracking-wide">{t("footer.presentedBy")}</p>
        </div>
      </div>
    </footer>
  );
}
