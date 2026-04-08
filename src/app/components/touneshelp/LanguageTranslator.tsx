import { useState } from 'react';
import { Globe, ChevronDown } from 'lucide-react';
import { Button } from '../ui/button';

type Language = {
  code: 'fr' | 'ar' | 'en';
  name: string;
  nativeName: string;
  flag: string;
};

const languages: Language[] = [
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇹🇳' },
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
];

export function LanguageTranslator() {
  const [currentLang, setCurrentLang] = useState<Language>(languages[0]);
  const [isOpen, setIsOpen] = useState(false);

  const handleLanguageChange = (lang: Language) => {
    setCurrentLang(lang);
    setIsOpen(false);
    
    // Apply RTL for Arabic
    if (lang.code === 'ar') {
      document.documentElement.setAttribute('dir', 'rtl');
      document.documentElement.setAttribute('lang', 'ar');
    } else {
      document.documentElement.setAttribute('dir', 'ltr');
      document.documentElement.setAttribute('lang', lang.code);
    }

    // You can add additional translation logic here
    // For example, updating context, localStorage, etc.
    localStorage.setItem('touneshelp-language', lang.code);
  };

  return (
    <div className="relative">
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="outline"
        className="flex items-center gap-2 bg-white border-2 border-gray-200 hover:border-[#C0392B] hover:bg-[#C0392B]/5 transition-colors"
      >
        <Globe size={18} className="text-[#C0392B]" />
        <span className="font-medium">{currentLang.flag} {currentLang.nativeName}</span>
        <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-2xl border-2 border-gray-200 overflow-hidden z-50 min-w-[200px]">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang)}
                className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-[#C0392B]/5 transition-colors ${
                  currentLang.code === lang.code ? 'bg-[#C0392B]/10' : ''
                }`}
              >
                <span className="text-2xl">{lang.flag}</span>
                <div className="flex-1 text-left">
                  <div className={`font-medium ${currentLang.code === lang.code ? 'text-[#C0392B]' : 'text-gray-800'}`}>
                    {lang.nativeName}
                  </div>
                  <div className="text-xs text-gray-500">{lang.name}</div>
                </div>
                {currentLang.code === lang.code && (
                  <svg className="w-5 h-5 text-[#C0392B]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// Compact version for mobile
export function LanguageTranslatorCompact() {
  const [currentLang, setCurrentLang] = useState<Language>(languages[0]);
  const [isOpen, setIsOpen] = useState(false);

  const handleLanguageChange = (lang: Language) => {
    setCurrentLang(lang);
    setIsOpen(false);
    
    if (lang.code === 'ar') {
      document.documentElement.setAttribute('dir', 'rtl');
      document.documentElement.setAttribute('lang', 'ar');
    } else {
      document.documentElement.setAttribute('dir', 'ltr');
      document.documentElement.setAttribute('lang', lang.code);
    }
    
    localStorage.setItem('touneshelp-language', lang.code);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-gray-200 hover:border-[#C0392B] transition-colors"
      >
        <Globe size={16} className="text-[#C0392B]" />
        <span className="text-sm font-medium">{currentLang.flag}</span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          <div className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang)}
                className={`w-full px-4 py-2 flex items-center gap-2 hover:bg-[#C0392B]/5 ${
                  currentLang.code === lang.code ? 'bg-[#C0392B]/10' : ''
                }`}
              >
                <span className="text-lg">{lang.flag}</span>
                <span className={`text-sm ${currentLang.code === lang.code ? 'text-[#C0392B] font-medium' : 'text-gray-700'}`}>
                  {lang.nativeName}
                </span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
