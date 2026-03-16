import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./i18n/messages/en.json";
import ar from "./i18n/messages/ar.json";
import fr from "./i18n/messages/fr.json";

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ar: { translation: ar },
    fr: { translation: fr }
  },
  lng: "fr", // default locale
  fallbackLng: "en",
  interpolation: {
    escapeValue: false
  },
  detection: {
    order: ["path", "localStorage", "htmlTag"],
    caches: ["localStorage"]
  }
});

export default i18n;
