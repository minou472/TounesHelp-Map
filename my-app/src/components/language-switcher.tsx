"use client";

import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { Languages } from "lucide-react";

interface Language {
  code: string;
  name: string;
  nativeName: string;
  rtl: boolean;
}

const languages: Language[] = [
  { code: "en", name: "English", nativeName: "English", rtl: false },
  { code: "fr", name: "French", nativeName: "Français", rtl: false },
  { code: "ar", name: "Arabic", nativeName: "العربية", rtl: true }
];

interface LanguageSwitcherProps {
  variant?: "dropdown" | "buttons";
  className?: string;
}

export default function LanguageSwitcher({
  variant = "dropdown",
  className = ""
}: LanguageSwitcherProps) {
  // const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLocale = params?.locale || "en";
  const currentLanguage =
    languages.find((l) => l.code === currentLocale) || languages[0];

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const switchLanguage = (newLocale: string) => {
    // Replace locale in current path
    const pathParts = location.pathname.split("/");
    pathParts[1] = newLocale;
    const newPath = pathParts.join("/").replace("//", "/");

    // i18n.changeLanguage would be called from App.tsx or context
    navigate(newPath, { replace: true });
    setIsOpen(false);
  };

  if (variant === "buttons") {
    return (
      <div className={`flex gap-2 ${className}`}>
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => switchLanguage(lang.code)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              currentLocale === lang.code
                ? "bg-indigo-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {lang.nativeName}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-indigo-600 hover:bg-slate-50 transition-colors"
        aria-label="Select language"
      >
        <Languages className="w-5 h-5" />
        <span>{currentLanguage.nativeName}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => switchLanguage(lang.code)}
              className={`w-full px-4 py-2 text-left text-sm flex items-center justify-between transition-colors ${
                currentLocale === lang.code
                  ? "text-indigo-600 bg-indigo-50 font-medium"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <span>{lang.nativeName}</span>
              {lang.rtl && <span className="text-xs text-slate-400">RTL</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
