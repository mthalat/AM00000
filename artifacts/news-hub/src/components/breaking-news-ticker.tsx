import { useRef } from "react";
import { useGetTopNews, getGetTopNewsQueryKey } from "@workspace/api-client-react";
import { useLanguage } from "@/contexts/language-context";

export function BreakingNewsTicker() {
  const { lang } = useLanguage();
  const isRtl = lang === "ar";
  const trackRef = useRef<HTMLDivElement>(null);

  const { data } = useGetTopNews(
    { limit: 10 },
    {
      query: {
        refetchInterval: 300_000,
        queryKey: getGetTopNewsQueryKey({ limit: 10 }),
      },
    }
  );

  const articles = data?.articles ?? [];
  if (!articles.length) return null;

  const items = [...articles, ...articles];

  return (
    <div
      className="w-full flex items-stretch h-10 overflow-hidden border-b"
      style={{ backgroundColor: "hsl(var(--destructive) / 0.08)", borderColor: "hsl(var(--destructive) / 0.2)" }}
      dir={isRtl ? "rtl" : "ltr"}
    >
      <div
        className="shrink-0 flex items-center gap-2 px-4 font-bold text-xs tracking-widest uppercase z-10"
        style={{
          backgroundColor: "hsl(var(--destructive))",
          color: "hsl(var(--destructive-foreground))",
          borderInlineEnd: "2px solid hsl(var(--destructive) / 0.4)",
        }}
      >
        <span
          className="w-2 h-2 rounded-full"
          style={{
            backgroundColor: "hsl(var(--destructive-foreground))",
            animation: "pulse-dot 1.2s ease-in-out infinite",
          }}
        />
        {isRtl ? "عاجل" : "BREAKING"}
      </div>

      <div className="flex-1 overflow-hidden relative">
        <div
          ref={trackRef}
          className="ticker-track flex items-center gap-0 whitespace-nowrap h-full"
          style={{
            animationDirection: isRtl ? "reverse" : "normal",
          }}
        >
          {items.map((article, i) => (
            <a
              key={`${article.id}-${i}`}
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 inline-flex items-center gap-2 px-6 text-sm transition-colors"
              style={{ color: "hsl(var(--foreground))" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "hsl(var(--primary))")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "hsl(var(--foreground))")}
            >
              <span style={{ color: "hsl(var(--destructive))", fontSize: "8px" }}>◆</span>
              {article.title}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
