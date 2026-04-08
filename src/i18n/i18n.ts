import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import translationFR from "./locales/fr.json";
import translationEN from "./locales/en.json";
import translationAR from "./locales/ar.json";

const resources = {
  fr: {
    translation: translationFR
  },
  en: {
    translation: translationEN
  },
  ar: {
    translation: translationAR
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "fr",
    detection: {
      order: ["localStorage", "navigator", "htmlTag"],
      caches: ["localStorage"]
    },
    interpolation: {
      escapeValue: false
    }
  });

// Setup document direction based on language
i18n.on("languageChanged", (lng) => {
  document.documentElement.dir = i18n.dir(lng);
  document.documentElement.lang = lng;
});

export default i18n;
