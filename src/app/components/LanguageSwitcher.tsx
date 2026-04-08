import { useTranslation } from "react-i18next";
import { Button } from "./ui/button";

const languages = [
  { code: "en", name: "English" },
  { code: "fr", name: "Français" },
  { code: "ar", name: "العربية" }
];

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="flex space-x-2">
      {languages.map((lang) => (
        <Button
          key={lang.code}
          variant={i18n.language === lang.code ? "default" : "outline"}
          size="sm"
          onClick={() => changeLanguage(lang.code)}
        >
          {lang.name}
        </Button>
      ))}
    </div>
  );
}
