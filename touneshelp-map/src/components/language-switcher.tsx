"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";

interface Language {
  code: string;
  name: string;
  nativeName: string;
  rtl: boolean;
}

const languages: Language[] = [
  { code: "en", name: "English", nativeName: "English", rtl: false },
  { code: "fr", name: "French", nativeName: "Français", rtl: false },
  { code: "ar", name: "Arabic", nativeName: "العربية", rtl: true },
];

export default function LanguageSwitcher({
  variant = "dropdown", // "dropdown" | "buttons"
  className = "",
}: {
  variant?: "dropdown" | "buttons";
  className?: string;
}) {
  const t = useTranslations("language");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLanguage =
    languages.find((l) => l.code === locale) || languages[0];

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
    // Get the path without the locale prefix
    const currentLocale = locale;
    let newPath = pathname;

    // Remove current locale from path
    if (languages.some((l) => l.code === pathname.split("/")[1])) {
      newPath = "/" + pathname.split("/").slice(2).join("/");
    }

    // Construct new path with new locale
    const fullNewPath = `/${newLocale}${newPath === "/" ? "" : newPath}`;

    router.push(fullNewPath);
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
              locale === lang.code
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
        aria-label={t("select")}
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
          />
        </svg>
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
                locale === lang.code
                  ? "text-indigo-600 bg-indigo-50 font-medium"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <span>{lang.nativeName}</span>
              {lang.rtl && (
                <span className="text-xs text-slate-400 ml-2">RTL</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Helper hook to check if current locale is RTL
export function useIsRTL() {
  const locale = useLocale();
  return locale === "ar";
}
