import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "../locales/en.json";
import hi from "../locales/hi.json";

const LANGUAGE_KEY = "smart_crop_language";

const getSavedLanguage = () => {
  const saved = localStorage.getItem(LANGUAGE_KEY);
  if (saved === "en" || saved === "hi") {
    return saved;
  }
  return "en";
};

void i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    hi: { translation: hi },
  },
  lng: getSavedLanguage(),
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

export { LANGUAGE_KEY };
export default i18n;
