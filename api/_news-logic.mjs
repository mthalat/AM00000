import RSSParser from "rss-parser";
import crypto from "node:crypto";

const parser = new RSSParser({
  customFields: {
    item: [
      ["media:content", "media:content"],
      ["media:thumbnail", "thumbnail"],
    ],
  },
  timeout: 5000,
  headers: {
    "User-Agent": "Mozilla/5.0 (compatible; NewsBot/1.0; +https://vercel.app)",
    Accept: "application/rss+xml, application/xml, text/xml, application/atom+xml",
  },
});

export const RSS_SOURCES = [
  { url: "https://www.aljazeera.net/rss/all.xml", name: "الجزيرة", sourceUrl: "https://www.aljazeera.net", category: "world" },
  { url: "https://feeds.bbci.co.uk/arabic/rss.xml", name: "بي بي سي عربي", sourceUrl: "https://www.bbc.com/arabic", category: "world" },
  { url: "https://www.skynewsarabia.com/rss.xml", name: "سكاي نيوز عربية", sourceUrl: "https://www.skynewsarabia.com", category: "world" },
  { url: "https://www.france24.com/ar/rss", name: "فرانس 24", sourceUrl: "https://www.france24.com/ar", category: "world" },
  { url: "https://rss.dw.com/rss/ar-all", name: "دويتشه فيله", sourceUrl: "https://www.dw.com/ar", category: "world" },
  { url: "https://www.aljazeera.net/rss/RssFeeds.aspx?CategoryId=428", name: "الجزيرة - سياسة", sourceUrl: "https://www.aljazeera.net", category: "politics" },
  { url: "https://www.aljazeera.net/rss/RssFeeds.aspx?CategoryId=432", name: "الجزيرة - اقتصاد", sourceUrl: "https://www.aljazeera.net/economy", category: "business" },
  { url: "https://www.skynewsarabia.com/rss/economy.xml", name: "سكاي نيوز - اقتصاد", sourceUrl: "https://www.skynewsarabia.com/economy", category: "business" },
  { url: "https://www.skynewsarabia.com/rss/sport.xml", name: "سكاي نيوز - رياضة", sourceUrl: "https://www.skynewsarabia.com/sport", category: "sports" },
  { url: "https://www.aljazeera.net/rss/RssFeeds.aspx?CategoryId=433", name: "الجزيرة - تقنية", sourceUrl: "https://www.aljazeera.net/science", category: "technology" },
  { url: "http://feeds.bbci.co.uk/news/technology/rss.xml", name: "BBC Technology", sourceUrl: "https://www.bbc.com/news/technology", category: "technology" },
  { url: "http://feeds.bbci.co.uk/news/health/rss.xml", name: "BBC Health", sourceUrl: "https://www.bbc.com/news/health", category: "health" },
];

let cache = { articles: [], lastFetched: 0 };
const CACHE_TTL = 5 * 60 * 1000;

function extractImageUrl(item) {
  if (item?.["media:content"]?.$?.url) return item["media:content"].$.url;
  if (item?.thumbnail?.$?.url) return item.thumbnail.$.url;
  if (item?.enclosure?.url && item?.enclosure?.type?.startsWith("image/")) return item.enclosure.url;
  if (item?.content) {
    const match = item.content.match(/<img[^>]+src=["']([^"']+)["']/i);
    if (match) return match[1];
  }
  return null;
}

function cleanSummary(text) {
  if (!text) return "";
  return String(text)
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 400);
}

async function fetchFeed(source) {
  try {
    const feed = await parser.parseURL(source.url);
    return (feed.items || [])
      .slice(0, 8)
      .filter((item) => item.title && item.link)
      .map((item) => ({
        id: crypto.createHash("md5").update(item.link).digest("hex"),
        title: item.title.trim(),
        summary: cleanSummary(item.contentSnippet || item.content),
        url: item.link,
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

export async function getAllArticles() {
  const now = Date.now();
  if (cache.articles.length > 0 && now - cache.lastFetched < CACHE_TTL) return cache.articles;

  const results = await Promise.allSettled(RSS_SOURCES.map(fetchFeed));
  const allArticles = [];
  for (const result of results) {
    if (result.status === "fulfilled") allArticles.push(...result.value);
  }

  const seen = new Set();
  const unique = allArticles.filter((article) => {
    if (seen.has(article.id)) return false;
    seen.add(article.id);
    return true;
  });

  unique.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  cache = { articles: unique, lastFetched: now };
  return unique;
}

export const CATEGORY_META = {
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
