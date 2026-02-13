import { useTranslation } from "react-i18next";
import { LANGUAGE_KEY } from "../i18n/config";

export function useLanguage() {
  const { i18n } = useTranslation();

  const toggleLanguage = async () => {
    const nextLanguage = i18n.language === "en" ? "hi" : "en";
    await i18n.changeLanguage(nextLanguage);
    localStorage.setItem(LANGUAGE_KEY, nextLanguage);
  };

  return {
    language: i18n.language,
    toggleLanguage,
  };
}
