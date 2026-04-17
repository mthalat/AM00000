import { useState, useMemo } from "react";
import { Search, Moon, Sun, Languages } from "lucide-react";
import { useGetNews, useGetTopNews, useGetNewsCategories, getGetNewsQueryKey, getGetTopNewsQueryKey, getGetNewsCategoriesQueryKey } from "@workspace/api-client-react";
import { GetNewsCategory, NewsArticle } from "@workspace/api-zod/src/generated/types";
import { useDebounce } from "@/hooks/use-debounce";
import { useTheme } from "@/components/theme-provider";
import { useLanguage, getCategoryLabel } from "@/contexts/language-context";
import { formatDistanceToNow } from "date-fns";
import { ar, enUS } from "date-fns/locale";

const CATEGORIES = ["all", "world", "politics", "business", "sports", "technology", "science", "health", "entertainment"];

function TopNav({ searchQuery, setSearchQuery }: { searchQuery: string; setSearchQuery: (q: string) => void }) {
  const { theme, setTheme } = useTheme();
  const { t, lang, toggleLanguage } = useLanguage();
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const isRtl = lang === "ar";

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-4">

        {/* Logo */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 bg-primary rounded flex items-center justify-center text-primary-foreground font-serif font-bold text-lg leading-none select-none">
            {lang === "ar" ? "أ" : "L"}
          </div>
          <span className="font-bold text-xl tracking-tight hidden md:inline-block">{t.siteName}</span>
        </div>

        {/* Search */}
        <div className="flex-1 max-w-md mx-auto">
          <div
            className={`relative flex items-center transition-all duration-300 rounded-full border ${
              isSearchFocused ? "ring-2 ring-primary border-transparent" : "border-border bg-muted/30"
            }`}
          >
            <Search className={`absolute ${isRtl ? "right-3" : "left-3"} w-4 h-4 text-muted-foreground`} />
            <input
              type="search"
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              className={`w-full h-10 ${isRtl ? "pr-10 pl-4" : "pl-10 pr-4"} rounded-full bg-transparent outline-none text-sm placeholder:text-muted-foreground`}
              dir={isRtl ? "rtl" : "ltr"}
              data-testid="input-search"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Language Toggle */}
          <button
            onClick={toggleLanguage}
            data-testid="button-toggle-language"
            className="flex items-center gap-1.5 px-3 h-9 rounded-full border border-border text-sm font-medium hover:bg-muted transition-colors"
            title={t.toggleLanguage}
          >
            <Languages className="h-4 w-4" />
            <span className="hidden sm:inline">{t.toggleLanguage}</span>
          </button>

          {/* Dark mode toggle */}
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-muted transition-colors relative"
            aria-label={t.toggleDark}
            data-testid="button-toggle-theme"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </button>
        </div>

      </div>
    </header>
  );
}

function HeroArticle({ article }: { article: NewsArticle }) {
  const { t, lang } = useLanguage();
  const dateLocale = lang === "ar" ? ar : enUS;

  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      data-testid={`hero-article-${article.id}`}
      className="group relative block overflow-hidden rounded-xl bg-muted w-full aspect-[21/9] min-h-[300px] md:min-h-[450px]"
    >
      {article.imageUrl ? (
        <img
          src={article.imageUrl}
          alt={article.title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1200&q=80";
          }}
        />
      ) : (
        <div className="absolute inset-0 w-full h-full bg-primary/10 flex items-center justify-center">
          <span className="text-primary/40 font-serif text-6xl">أ</span>
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />

      <div className="absolute bottom-0 inset-x-0 p-6 md:p-8 flex flex-col justify-end text-white">
        <div className="flex items-center gap-3 mb-3 flex-wrap">
          <span className="bg-primary px-3 py-1 text-xs font-medium rounded-full">
            {getCategoryLabel(article.category, t)}
          </span>
          <div className="flex items-center gap-1.5 text-white/80 text-sm">
            <span className="w-2 h-2 rounded-full bg-blue-400" />
            <span>{article.source}</span>
          </div>
          <span className="text-white/60 text-sm">•</span>
          <span className="text-white/80 text-sm">
            {formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true, locale: dateLocale })}
          </span>
        </div>

        <h2
          className="text-2xl md:text-4xl font-bold leading-tight mb-3 group-hover:underline decoration-2 underline-offset-4"
          dir="auto"
        >
          {article.title}
        </h2>

        <p className="text-white/80 line-clamp-2 md:text-lg max-w-3xl" dir="auto">
          {article.summary}
        </p>
      </div>
    </a>
  );
}

function ArticleCard({ article, index }: { article: NewsArticle; index: number }) {
  const { t, lang } = useLanguage();
  const dateLocale = lang === "ar" ? ar : enUS;
  const isRtl = lang === "ar";

  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      data-testid={`card-article-${article.id}`}
      className="group flex flex-col bg-card rounded-xl border border-border overflow-hidden hover:shadow-md transition-all duration-300 hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-4 fill-mode-both"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted">
        {article.imageUrl ? (
          <img
            src={article.imageUrl}
            alt={article.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-primary/5">
            <span className="text-primary/20 font-serif text-4xl">أ</span>
          </div>
        )}
        <div className={`absolute top-3 ${isRtl ? "right-3" : "left-3"}`}>
          <span className="bg-background/90 backdrop-blur text-foreground px-2.5 py-1 text-xs font-medium rounded shadow-sm">
            {getCategoryLabel(article.category, t)}
          </span>
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center justify-between mb-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            <span className="font-medium text-foreground">{article.source}</span>
          </div>
          <span>
            {formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true, locale: dateLocale })}
          </span>
        </div>

        <h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors" dir="auto">
          {article.title}
        </h3>

        <p className="text-muted-foreground text-sm line-clamp-3 mb-4 flex-1" dir="auto">
          {article.summary}
        </p>

        <div className={`mt-auto pt-4 border-t border-border/50 text-xs font-medium text-primary flex items-center gap-1`}>
          {t.readMore}
          <span className={`inline-block transition-transform ${isRtl ? "group-hover:-translate-x-1" : "group-hover:translate-x-1"}`}>
            {isRtl ? "←" : "→"}
          </span>
        </div>
      </div>
    </a>
  );
}

function Sidebar({
  activeCategory,
  onSelectCategory,
}: {
  activeCategory: string;
  onSelectCategory: (cat: string) => void;
}) {
  const { t } = useLanguage();
  const { data: statsData, isLoading } = useGetNewsCategories({
    query: { queryKey: getGetNewsCategoriesQueryKey() },
  });

  const categories = statsData?.categories || [];

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h3 className="font-bold text-lg pb-2 border-b border-border">{t.sections}</h3>
        <div className="space-y-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="h-10 bg-muted rounded-md animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sticky top-24">
      <h3 className="font-bold text-lg pb-2 border-b border-border">{t.sections}</h3>
      <div className="flex flex-col gap-1">
        <button
          onClick={() => onSelectCategory("all")}
          data-testid="button-category-all"
          className={`flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors ${
            activeCategory === "all"
              ? "bg-primary text-primary-foreground font-medium"
              : "hover:bg-muted text-foreground"
          }`}
        >
          <span>{t.all}</span>
        </button>
        {categories.map((stat) => (
          <button
            key={stat.category}
            onClick={() => onSelectCategory(stat.category)}
            data-testid={`button-category-${stat.category}`}
            className={`flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors ${
              activeCategory === stat.category
                ? "bg-primary text-primary-foreground font-medium"
                : "hover:bg-muted text-foreground"
            }`}
          >
            <span>{getCategoryLabel(stat.category, t)}</span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${
                activeCategory === stat.category
                  ? "bg-primary-foreground/20 text-primary-foreground"
                  : "bg-muted-foreground/10 text-muted-foreground"
              }`}
            >
              {stat.count}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const { t, lang } = useLanguage();
  const isRtl = lang === "ar";

  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 400);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [page, setPage] = useState(1);

  useMemo(() => {
    setPage(1);
  }, [activeCategory, debouncedSearch]);

  const { data: topNewsData, isLoading: isTopLoading } = useGetTopNews(
    { limit: 1 },
    { query: { enabled: true, queryKey: getGetTopNewsQueryKey({ limit: 1 }), refetchInterval: 300000 } }
  );

  const newsParams = {
    q: debouncedSearch || undefined,
    category: activeCategory !== "all" ? (activeCategory as GetNewsCategory) : undefined,
    page,
    limit: 12,
  };

  const { data: newsData, isLoading: isNewsLoading } = useGetNews(newsParams, {
    query: { enabled: true, queryKey: getGetNewsQueryKey(newsParams), refetchInterval: 300000 },
  });

  return (
    <div className="min-h-[100dvh] flex flex-col font-sans">
      <TopNav searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      {/* Mobile Category Scroll */}
      <div className="md:hidden border-b border-border bg-background sticky top-16 z-30 overflow-x-auto">
        <div className={`flex px-4 py-3 gap-2 min-w-max ${isRtl ? "flex-row-reverse" : ""}`}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              data-testid={`button-mobile-category-${cat}`}
              className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
                activeCategory === cat
                  ? "bg-primary text-primary-foreground font-medium"
                  : "bg-muted hover:bg-muted/80 text-foreground"
              }`}
            >
              {getCategoryLabel(cat, t)}
            </button>
          ))}
        </div>
      </div>

      <main className="flex-1 container mx-auto px-4 md:px-6 py-6 md:py-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">

          {/* Main Feed */}
          <div className="md:col-span-9 space-y-8">

            {/* Hero */}
            {!debouncedSearch && activeCategory === "all" && page === 1 && (
              <section className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {isTopLoading ? (
                  <div className="w-full aspect-[21/9] min-h-[300px] md:min-h-[450px] bg-muted rounded-xl animate-pulse" />
                ) : topNewsData?.articles?.[0] ? (
                  <HeroArticle article={topNewsData.articles[0]} />
                ) : null}
              </section>
            )}

            {/* Search Result Banner */}
            {debouncedSearch && (
              <div className="pb-4 border-b border-border">
                <h2 className="text-xl font-bold">
                  {t.searchResultsFor}{" "}
                  <span className="text-primary">"{debouncedSearch}"</span>
                </h2>
              </div>
            )}

            {/* Articles Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {isNewsLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex flex-col bg-card rounded-xl border border-border overflow-hidden h-[380px]"
                  >
                    <div className="aspect-[16/9] bg-muted animate-pulse" />
                    <div className="p-4 flex flex-col gap-3">
                      <div className="w-24 h-3 bg-muted rounded animate-pulse" />
                      <div className="w-full h-5 bg-muted rounded animate-pulse" />
                      <div className="w-3/4 h-5 bg-muted rounded animate-pulse" />
                      <div className="mt-4 w-full h-16 bg-muted rounded animate-pulse" />
                    </div>
                  </div>
                ))
              ) : newsData?.articles?.length ? (
                newsData.articles.map((article, i) => (
                  <ArticleCard key={article.id} article={article} index={i} />
                ))
              ) : (
                <div className="col-span-full py-20 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Search className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{t.noResults}</h3>
                  <p className="text-muted-foreground max-w-sm">{t.noResultsDesc}</p>
                </div>
              )}
            </div>

            {/* Load More */}
            {newsData?.hasMore && (
              <div className="pt-8 pb-4 flex justify-center">
                <button
                  onClick={() => setPage((p) => p + 1)}
                  data-testid="button-load-more"
                  className="px-8 py-3 bg-primary text-primary-foreground font-medium rounded-full hover:bg-primary/90 transition-colors shadow-sm"
                >
                  {t.loadMore}
                </button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="hidden md:block md:col-span-3">
            <Sidebar activeCategory={activeCategory} onSelectCategory={setActiveCategory} />
          </aside>

        </div>
      </main>

      <footer className="bg-card border-t border-border py-8 mt-auto">
        <div className="container mx-auto px-4 md:px-6 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} {t.siteName}. {t.footer}.</p>
        </div>
      </footer>
    </div>
  );
}
