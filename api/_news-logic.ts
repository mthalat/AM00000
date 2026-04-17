import RSSParser from "rss-parser";
import crypto from "crypto";

type RSSFeedItem = {
  title?: string;
  link?: string;
  contentSnippet?: string;
  content?: string;
  pubDate?: string;
  creator?: string;
  "media:content"?: { $?: { url?: string } };
  enclosure?: { url?: string; type?: string };
  thumbnail?: { $?: { url?: string } };
};

type CustomFeed = {
  title?: string;
  link?: string;
  items: RSSFeedItem[];
};

const parser = new RSSParser<CustomFeed, RSSFeedItem>({
  customFields: {
    item: [
      ["media:content", "media:content"],
      ["media:thumbnail", "thumbnail"],
    ],
  },
  timeout: 8000,
  headers: {
    "User-Agent": "Mozilla/5.0 (compatible; NewsBot/1.0; +http://newshub.app)",
    Accept: "application/rss+xml, application/xml, text/xml, application/atom+xml",
  },
});

export type NewsSource = {
  url: string;
  name: string;
  sourceUrl: string;
  category: string;
};

export const RSS_SOURCES: NewsSource[] = [
  { url: "https://www.aljazeera.net/rss/all.xml", name: "الجزيرة", sourceUrl: "https://www.aljazeera.net", category: "world" },
  { url: "https://feeds.bbci.co.uk/arabic/rss.xml", name: "بي بي سي عربي", sourceUrl: "https://www.bbc.com/arabic", category: "world" },
  { url: "https://www.skynewsarabia.com/rss.xml", name: "سكاي نيوز عربية", sourceUrl: "https://www.skynewsarabia.com", category: "world" },
  { url: "https://www.france24.com/ar/rss", name: "فرانس 24", sourceUrl: "https://www.france24.com/ar", category: "world" },
  { url: "https://rss.dw.com/rss/ar-all", name: "دويتشه فيله", sourceUrl: "https://www.dw.com/ar", category: "world" },
  { url: "https://www.aljazeera.net/rss/RssFeeds.aspx?CategoryId=428", name: "الجزيرة - سياسة", sourceUrl: "https://www.aljazeera.net", category: "politics" },
  { url: "https://www.skynewsarabia.com/rss/world.xml", name: "سكاي نيوز - سياسة", sourceUrl: "https://www.skynewsarabia.com/world", category: "politics" },
  { url: "https://www.aljazeera.net/rss/RssFeeds.aspx?CategoryId=432", name: "الجزيرة - اقتصاد", sourceUrl: "https://www.aljazeera.net/economy", category: "business" },
  { url: "https://www.skynewsarabia.com/rss/economy.xml", name: "سكاي نيوز - اقتصاد", sourceUrl: "https://www.skynewsarabia.com/economy", category: "business" },
  { url: "https://www.skynewsarabia.com/rss/sport.xml", name: "سكاي نيوز - رياضة", sourceUrl: "https://www.skynewsarabia.com/sport", category: "sports" },
  { url: "https://www.aljazeera.net/rss/RssFeeds.aspx?CategoryId=430", name: "الجزيرة - رياضة", sourceUrl: "https://www.aljazeera.net/sport", category: "sports" },
  { url: "https://www.aljazeera.net/rss/RssFeeds.aspx?CategoryId=433", name: "الجزيرة - تقنية", sourceUrl: "https://www.aljazeera.net/science", category: "technology" },
  { url: "http://feeds.bbci.co.uk/news/world/rss.xml", name: "BBC News", sourceUrl: "https://www.bbc.com/news", category: "world" },
  { url: "https://feeds.reuters.com/reuters/topNews", name: "Reuters", sourceUrl: "https://www.reuters.com", category: "world" },
  { url: "https://www.aljazeera.com/xml/rss/all.xml", name: "Al Jazeera English", sourceUrl: "https://www.aljazeera.com", category: "world" },
  { url: "http://feeds.bbci.co.uk/news/politics/rss.xml", name: "BBC Politics", sourceUrl: "https://www.bbc.com/news/politics", category: "politics" },
  { url: "https://feeds.npr.org/1014/rss.xml", name: "NPR Politics", sourceUrl: "https://www.npr.org/sections/politics", category: "politics" },
  { url: "http://feeds.bbci.co.uk/news/business/rss.xml", name: "BBC Business", sourceUrl: "https://www.bbc.com/news/business", category: "business" },
  { url: "https://rss.nytimes.com/services/xml/rss/nyt/Business.xml", name: "NY Times Business", sourceUrl: "https://www.nytimes.com/section/business", category: "business" },
  { url: "http://feeds.bbci.co.uk/sport/rss.xml", name: "BBC Sport", sourceUrl: "https://www.bbc.com/sport", category: "sports" },
  { url: "https://www.espn.com/espn/rss/news", name: "ESPN", sourceUrl: "https://www.espn.com", category: "sports" },
  { url: "https://feeds.feedburner.com/TechCrunch", name: "TechCrunch", sourceUrl: "https://techcrunch.com", category: "technology" },
  { url: "https://www.theverge.com/rss/index.xml", name: "The Verge", sourceUrl: "https://www.theverge.com", category: "technology" },
  { url: "http://feeds.bbci.co.uk/news/technology/rss.xml", name: "BBC Technology", sourceUrl: "https://www.bbc.com/news/technology", category: "technology" },
  { url: "http://feeds.bbci.co.uk/news/science_and_environment/rss.xml", name: "BBC Science", sourceUrl: "https://www.bbc.com/news/science_and_environment", category: "science" },
  { url: "https://feeds.npr.org/1007/rss.xml", name: "NPR Science", sourceUrl: "https://www.npr.org/sections/science", category: "science" },
  { url: "https://www.nasa.gov/rss/dyn/breaking_news.rss", name: "NASA", sourceUrl: "https://www.nasa.gov", category: "science" },
  { url: "http://feeds.bbci.co.uk/news/health/rss.xml", name: "BBC Health", sourceUrl: "https://www.bbc.com/news/health", category: "health" },
  { url: "https://feeds.npr.org/1128/rss.xml", name: "NPR Health", sourceUrl: "https://www.npr.org/sections/health", category: "health" },
  { url: "http://feeds.bbci.co.uk/news/entertainment_and_arts/rss.xml", name: "BBC Entertainment", sourceUrl: "https://www.bbc.com/news/entertainment_and_arts", category: "entertainment" },
  { url: "https://feeds.npr.org/1008/rss.xml", name: "NPR Arts", sourceUrl: "https://www.npr.org/sections/arts", category: "entertainment" },
];

export type CachedArticle = {
  id: string;
  title: string;
  summary: string;
  url: string;
  imageUrl: string | null;
  source: string;
  sourceUrl: string;
  category: string;
  publishedAt: string;
  author: string | null;
};

type Cache = { articles: CachedArticle[]; lastFetched: number };
let cache: Cache = { articles: [], lastFetched: 0 };
const CACHE_TTL = 5 * 60 * 1000;

function extractImageUrl(item: RSSFeedItem): string | null {
  if (item["media:content"]?.$?.url) return item["media:content"]!.$!.url!;
  if (item.thumbnail?.$?.url) return item.thumbnail!.$!.url!;
  if (item.enclosure?.url && item.enclosure?.type?.startsWith("image/")) return item.enclosure.url;
  if (item.content) {
    const match = item.content.match(/<img[^>]+src=["']([^"']+)["']/i);
    if (match) return match[1];
  }
  return null;
}

function cleanSummary(text: string | undefined): string {
  if (!text) return "";
  return text
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/\s+/g, " ").trim().slice(0, 400);
}

async function fetchFeed(source: NewsSource): Promise<CachedArticle[]> {
  try {
    const feed = await parser.parseURL(source.url);
    return feed.items.slice(0, 8)
      .filter((item) => item.title && item.link)
      .map((item) => ({
        id: crypto.createHash("md5").update(item.link!).digest("hex"),
        title: item.title!.trim(),
        summary: cleanSummary(item.contentSnippet || item.content),
        url: item.link!,
        imageUrl: extractImageUrl(item),
        source: source.name,
        sourceUrl: source.sourceUrl,
        category: source.category,
        publishedAt: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
        author: item.creator || null,
      }));
  } catch {
    return [];
  }
}

export async function getAllArticles(): Promise<CachedArticle[]> {
  const now = Date.now();
  if (cache.articles.length > 0 && now - cache.lastFetched < CACHE_TTL) return cache.articles;

  const results = await Promise.allSettled(RSS_SOURCES.map(fetchFeed));
  const allArticles: CachedArticle[] = [];
  for (const r of results) {
    if (r.status === "fulfilled") allArticles.push(...r.value);
  }

  const seen = new Set<string>();
  const unique = allArticles.filter((a) => {
    if (seen.has(a.id)) return false;
    seen.add(a.id);
    return true;
  });

  unique.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  cache = { articles: unique, lastFetched: now };
  return unique;
}

export const CATEGORY_META: Record<string, { label: string; icon: string }> = {
  all: { label: "الكل", icon: "Newspaper" },
  world: { label: "العالم", icon: "Globe" },
  politics: { label: "السياسة", icon: "Landmark" },
  business: { label: "الاقتصاد", icon: "TrendingUp" },
  sports: { label: "الرياضة", icon: "Trophy" },
  technology: { label: "التقنية", icon: "Cpu" },
  science: { label: "العلوم", icon: "FlaskConical" },
  health: { label: "الصحة", icon: "Heart" },
  entertainment: { label: "الترفيه", icon: "Clapperboard" },
};
