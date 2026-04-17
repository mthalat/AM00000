import { createContext, useContext, useState, useEffect } from "react";

export type Language = "ar" | "en";

export type Translations = {
  siteName: string;
  searchPlaceholder: string;
  sections: string;
  all: string;
  world: string;
  politics: string;
  business: string;
  sports: string;
  technology: string;
  science: string;
  health: string;
  entertainment: string;
  searchResultsFor: string;
  noResults: string;
  noResultsDesc: string;
  loadMore: string;
  readMore: string;
  footer: string;
  toggleDark: string;
  toggleLanguage: string;
};

const translations: Record<Language, Translations> = {
  ar: {
    siteName: "أخبار مباشرة",
    searchPlaceholder: "ابحث عن الأخبار...",
    sections: "الأقسام",
    all: "الكل",
    world: "العالم",
    politics: "السياسة",
    business: "الاقتصاد",
    sports: "الرياضة",
    technology: "التقنية",
    science: "العلوم",
    health: "الصحة",
    entertainment: "الترفيه",
    searchResultsFor: "نتائج البحث عن:",
    noResults: "لا توجد نتائج",
    noResultsDesc: "لم نتمكن من العثور على أي مقالات تطابق بحثك. حاول استخدام كلمات مفتاحية مختلفة.",
    loadMore: "تحميل المزيد",
    readMore: "اقرأ المزيد",
    footer: "منصة إخبارية موثوقة",
    toggleDark: "تبديل الوضع",
    toggleLanguage: "EN",
  },
  en: {
    siteName: "Live News",
    searchPlaceholder: "Search for news...",
    sections: "Sections",
    all: "All",
    world: "World",
    politics: "Politics",
    business: "Business",
    sports: "Sports",
    technology: "Technology",
    science: "Science",
    health: "Health",
    entertainment: "Entertainment",
    searchResultsFor: "Search results for:",
    noResults: "No results found",
    noResultsDesc: "We couldn't find any articles matching your search. Try different keywords.",
    loadMore: "Load more",
    readMore: "Read more",
    footer: "A trusted news platform",
    toggleDark: "Toggle mode",
    toggleLanguage: "عربي",
  },
};

type LanguageContextType = {
  lang: Language;
  t: Translations;
  toggleLanguage: () => void;
};

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem("akhbar-lang");
    return (saved === "en" ? "en" : "ar") as Language;
  });

  useEffect(() => {
    localStorage.setItem("akhbar-lang", lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.setAttribute("data-lang", lang);
  }, [lang]);

  const toggleLanguage = () => setLang(prev => prev === "ar" ? "en" : "ar");

  return (
    <LanguageContext.Provider value={{ lang, t: translations[lang], toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}

export function getCategoryLabel(cat: string, t: Translations): string {
  const map: Record<string, keyof Translations> = {
    all: "all",
    world: "world",
    politics: "politics",
    business: "business",
    sports: "sports",
    technology: "technology",
    science: "science",
    health: "health",
    entertainment: "entertainment",
  };
  const key = map[cat];
  return key ? String(t[key]) : cat;
}
