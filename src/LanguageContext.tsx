import React, { createContext, useContext, useState, useEffect } from "react";
import { translations, LanguageCode } from "./translations";

interface LanguageContextProps {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: string, replacements?: Record<string, string>) => string;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Try to read language from localStorage, fallback to English
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    const saved = localStorage.getItem("transitops_lang");
    if (saved === "en" || saved === "ta" || saved === "es") {
      return saved as LanguageCode;
    }
    return "en";
  });

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
    localStorage.setItem("transitops_lang", lang);
  };

  // Translation helper function
  const t = (key: string, replacements?: Record<string, string>): string => {
    const dict = translations[language];
    // @ts-ignore
    let value = dict[key] || translations["en"][key] || key;

    if (replacements) {
      Object.entries(replacements).forEach(([k, v]) => {
        value = value.replace(`{${k}}`, v);
      });
    }

    return value;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
