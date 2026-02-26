import { create } from "zustand";
import { persist } from "zustand/middleware";
import vi from "@/locales/vi.json";

type Language = "vi" | "en";
const translations: Partial<Record<Language, any>> = { vi };

const getNestedValue = (obj: any, path: string) => {
  if (!obj || !path) return undefined;
  return path.split('.').reduce((acc, part) => (acc ? acc[part] : undefined), obj);
};

export const useLanguageStore = create<{
  language: Language;
  setLanguage: (l: Language) => void;
  toggleLanguage: () => void;
}>()(
  persist(
    (set) => ({
      language: "vi",
      setLanguage: (l: Language) => set({ language: l }),
      toggleLanguage: () => set((state: any) => ({ language: state.language === "vi" ? "en" : "vi" })),
    }),
    { name: "language-storage" }
  )
);

export const useTranslation = () => {
  const language = useLanguageStore((s) => s.language);
  const setLanguage = useLanguageStore((s) => s.setLanguage);
  const toggleLanguage = useLanguageStore((s) => s.toggleLanguage);

  const t = (path: string, params?: Record<string, string | number>): string => {
    const langObj = translations[language] ?? translations["vi"];
    let text = getNestedValue(langObj, path) ?? path;

    if (params && typeof text === "string") {
      Object.entries(params).forEach(([k, v]) => {
        text = text.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
      });
    }
    return typeof text === "string" ? text : String(text);
  };

  const tArray = (path: string): string[] => {
    const langObj = translations[language] ?? translations["vi"];
    const value = getNestedValue(langObj, path);
    if (Array.isArray(value)) return value;
    if (value == null) return [];
    if (typeof value === "object") return [JSON.stringify(value)];
    return [String(value)];
  };

  return { t, tArray, language, setLanguage, toggleLanguage };
};