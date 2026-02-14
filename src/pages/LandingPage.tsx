import {
  ArrowRight,
  Bug,
  Calendar,
  Cloud,
  Sprout,
  TrendingUp,
} from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { routes } from "../types/routes";

const sectionVariant = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45 },
  },
};

export default function LandingPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const features = [
    {
      icon: Cloud,
      title: t("landing.weatherAlertsTitle"),
      description: t("landing.weatherAlertsDesc"),
      color: "from-sky-500/20 to-sky-500/0 text-sky-700",
    },
    {
      icon: Sprout,
      title: t("landing.soilCropTitle"),
      description: t("landing.soilCropDesc"),
      color: "from-forest-500/20 to-forest-500/0 text-forest-700",
    },
    {
      icon: Bug,
      title: t("landing.diseaseTitle"),
      description: t("landing.diseaseDesc"),
      color: "from-amber-500/20 to-amber-500/0 text-amber-700",
    },
    {
      icon: Calendar,
      title: t("landing.scheduleTitle"),
      description: t("landing.scheduleDesc"),
      color: "from-emerald-500/20 to-emerald-500/0 text-emerald-700",
    },
    {
      icon: TrendingUp,
      title: t("landing.marketTitle"),
      description: t("landing.marketDesc"),
      color: "from-indigo-500/20 to-indigo-500/0 text-indigo-700",
    },
  ];

  const steps = [
    { number: "01", title: t("landing.step1Title"), description: t("landing.step1Desc") },
    { number: "02", title: t("landing.step2Title"), description: t("landing.step2Desc") },
    { number: "03", title: t("landing.step3Title"), description: t("landing.step3Desc") },
    { number: "04", title: t("landing.step4Title"), description: t("landing.step4Desc") },
  ];

  return (
    <div className="min-h-screen px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <div className="max-w-7xl mx-auto space-y-10">
        <motion.section variants={sectionVariant} initial="hidden" animate="visible" className="hero-panel p-6 md:p-8 float-in">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center relative z-10">
            <div>
              <h1 className="text-3xl md:text-5xl font-extrabold text-white leading-tight mb-3">
                {t("landing.heroTitle")}
              </h1>
              <p className="text-forest-100 text-base md:text-lg max-w-2xl mb-8">
                {t("landing.heroSubtitle")}
              </p>

              <div className="flex gap-3 flex-wrap">
                <button onClick={() => navigate(routes.advisory)} className="btn-secondary pulse-glow">
                  {t("landing.startAdvisory")}
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button onClick={() => navigate(routes.diseaseDetection)} className="btn-primary">
                  {t("landing.uploadImage")}
                </button>
              </div>
            </div>

            <div className="surface-card bg-white/10 border-white/20 p-4 fade-up">
              <h3 className="text-white font-semibold text-lg mb-4">{t("landing.quickTitle")}</h3>
              <div className="space-y-3 text-sm text-forest-100">
                <p>{t("landing.quickLine1")}</p>
                <p>{t("landing.quickLine2")}</p>
                <p>{t("landing.quickLine3")}</p>
              </div>
            </div>
          </div>
        </motion.section>

        <motion.section variants={sectionVariant} initial="hidden" animate="visible" transition={{ delay: 0.08 }} className="surface-card-strong p-5 md:p-6">
          <div className="text-center mb-10">
            <h2 className="section-title mb-3">{t("landing.featuresHeading")}</h2>
            <p className="section-subtitle max-w-2xl mx-auto">{t("landing.featuresSub")}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 stagger-in">
            {features.map((feature) => (
              <motion.div
                key={feature.title}
                whileHover={{ y: -4 }}
                className="surface-card p-5 transition-all duration-200 hover:shadow-xl"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4`}>
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-forest-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-forest-800/80 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        <motion.section variants={sectionVariant} initial="hidden" animate="visible" transition={{ delay: 0.14 }} className="surface-card-strong p-5 md:p-6">
          <div className="text-center mb-10">
            <h2 className="section-title mb-3">{t("landing.howItWorks")}</h2>
            <p className="section-subtitle">{t("landing.howItWorksSub")}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 stagger-in">
            {steps.map((step) => (
              <motion.div key={step.number} whileHover={{ y: -3, scale: 1.01 }} className="surface-card p-5 text-center">
                <div className="text-3xl font-extrabold text-forest-300 mb-2">{step.number}</div>
                <h3 className="text-lg font-semibold text-forest-900 mb-2">{step.title}</h3>
                <p className="text-sm text-forest-800/80">{step.description}</p>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-8">
            <button onClick={() => navigate(routes.dashboard)} className="btn-primary">
              {t("landing.goDashboard")}
            </button>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
