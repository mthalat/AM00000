import { Router } from "express";
import RSSParser from "rss-parser";
import crypto from "crypto";

const router = Router();

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
    "User-Agent":
      "Mozilla/5.0 (compatible; NewsBot/1.0; +http://newshub.app)",
    Accept:
      "application/rss+xml, application/xml, text/xml, application/atom+xml",
  },
});

type NewsSource = {
  url: string;
  name: string;
  sourceUrl: string;
  category: string;
};

const RSS_SOURCES: NewsSource[] = [
  // ===== Arabic Sources =====
  // الجزيرة العربية
  {
    url: "https://www.aljazeera.net/rss/all.xml",
    name: "الجزيرة",
    sourceUrl: "https://www.aljazeera.net",
    category: "world",
  },
  // بي بي سي عربي
  {
    url: "https://feeds.bbci.co.uk/arabic/rss.xml",
    name: "بي بي سي عربي",
    sourceUrl: "https://www.bbc.com/arabic",
    category: "world",
  },
  // سكاي نيوز عربية
  {
    url: "https://www.skynewsarabia.com/rss.xml",
    name: "سكاي نيوز عربية",
    sourceUrl: "https://www.skynewsarabia.com",
    category: "world",
  },
  // فرانس 24 عربي
  {
    url: "https://www.france24.com/ar/rss",
    name: "فرانس 24",
    sourceUrl: "https://www.france24.com/ar",
    category: "world",
  },
  // دويتشه فيله عربي
  {
    url: "https://rss.dw.com/rss/ar-all",
    name: "دويتشه فيله",
    sourceUrl: "https://www.dw.com/ar",
    category: "world",
  },
  // الجزيرة - سياسة
  {
    url: "https://www.aljazeera.net/rss/RssFeeds.aspx?CategoryId=428",
    name: "الجزيرة - سياسة",
    sourceUrl: "https://www.aljazeera.net",
    category: "politics",
  },
  // سكاي نيوز - سياسة
  {
    url: "https://www.skynewsarabia.com/rss/world.xml",
    name: "سكاي نيوز - سياسة",
    sourceUrl: "https://www.skynewsarabia.com/world",
    category: "politics",
  },
  // الجزيرة - اقتصاد
  {
    url: "https://www.aljazeera.net/rss/RssFeeds.aspx?CategoryId=432",
    name: "الجزيرة - اقتصاد",
    sourceUrl: "https://www.aljazeera.net/economy",
    category: "business",
  },
  // سكاي نيوز - اقتصاد
  {
    url: "https://www.skynewsarabia.com/rss/economy.xml",
    name: "سكاي نيوز - اقتصاد",
    sourceUrl: "https://www.skynewsarabia.com/economy",
    category: "business",
  },
  // سكاي نيوز - رياضة
  {
    url: "https://www.skynewsarabia.com/rss/sport.xml",
    name: "سكاي نيوز - رياضة",
    sourceUrl: "https://www.skynewsarabia.com/sport",
    category: "sports",
  },
  // الجزيرة - رياضة
  {
    url: "https://www.aljazeera.net/rss/RssFeeds.aspx?CategoryId=430",
    name: "الجزيرة - رياضة",
    sourceUrl: "https://www.aljazeera.net/sport",
    category: "sports",
  },
  // الجزيرة - علوم وتكنولوجيا
  {
    url: "https://www.aljazeera.net/rss/RssFeeds.aspx?CategoryId=433",
    name: "الجزيرة - تقنية",
    sourceUrl: "https://www.aljazeera.net/science",
    category: "technology",
  },

  // ===== English / International Sources =====
  // World / International
  {
    url: "http://feeds.bbci.co.uk/news/world/rss.xml",
    name: "BBC News",
    sourceUrl: "https://www.bbc.com/news",
    category: "world",
  },
  {
    url: "https://feeds.reuters.com/reuters/topNews",
    name: "Reuters",
    sourceUrl: "https://www.reuters.com",
    category: "world",
  },
  {
    url: "https://www.aljazeera.com/xml/rss/all.xml",
    name: "Al Jazeera English",
    sourceUrl: "https://www.aljazeera.com",
    category: "world",
  },

  // Politics
  {
    url: "http://feeds.bbci.co.uk/news/politics/rss.xml",
    name: "BBC Politics",
    sourceUrl: "https://www.bbc.com/news/politics",
    category: "politics",
  },
  {
    url: "https://feeds.npr.org/1014/rss.xml",
    name: "NPR Politics",
    sourceUrl: "https://www.npr.org/sections/politics",
    category: "politics",
  },

  // Business / Economy
  {
    url: "http://feeds.bbci.co.uk/news/business/rss.xml",
    name: "BBC Business",
    sourceUrl: "https://www.bbc.com/news/business",
    category: "business",
  },
  {
    url: "https://rss.nytimes.com/services/xml/rss/nyt/Business.xml",
    name: "NY Times Business",
    sourceUrl: "https://www.nytimes.com/section/business",
    category: "business",
  },

  // Sports
  {
    url: "http://feeds.bbci.co.uk/sport/rss.xml",
    name: "BBC Sport",
    sourceUrl: "https://www.bbc.com/sport",
    category: "sports",
  },
  {
    url: "https://www.espn.com/espn/rss/news",
    name: "ESPN",
    sourceUrl: "https://www.espn.com",
    category: "sports",
  },

  // Technology
  {
    url: "https://feeds.feedburner.com/TechCrunch",
    name: "TechCrunch",
    sourceUrl: "https://techcrunch.com",
    category: "technology",
  },
  {
    url: "https://www.theverge.com/rss/index.xml",
    name: "The Verge",
    sourceUrl: "https://www.theverge.com",
    category: "technology",
  },
  {
    url: "https://feeds.arstechnica.com/arstechnica/index",
    name: "Ars Technica",
    sourceUrl: "https://arstechnica.com",
    category: "technology",
  },
  {
    url: "http://feeds.bbci.co.uk/news/technology/rss.xml",
    name: "BBC Technology",
    sourceUrl: "https://www.bbc.com/news/technology",
    category: "technology",
  },

  // Science
  {
    url: "http://feeds.bbci.co.uk/news/science_and_environment/rss.xml",
    name: "BBC Science",
    sourceUrl: "https://www.bbc.com/news/science_and_environment",
    category: "science",
  },
  {
    url: "https://feeds.npr.org/1007/rss.xml",
    name: "NPR Science",
    sourceUrl: "https://www.npr.org/sections/science",
    category: "science",
  },
  {
    url: "https://www.nasa.gov/rss/dyn/breaking_news.rss",
    name: "NASA",
    sourceUrl: "https://www.nasa.gov",
    category: "science",
  },

  // Health
  {
    url: "http://feeds.bbci.co.uk/news/health/rss.xml",
    name: "BBC Health",
    sourceUrl: "https://www.bbc.com/news/health",
    category: "health",
  },
  {
    url: "https://feeds.npr.org/1128/rss.xml",
    name: "NPR Health",
    sourceUrl: "https://www.npr.org/sections/health",
    category: "health",
  },

  // Entertainment
  {
    url: "http://feeds.bbci.co.uk/news/entertainment_and_arts/rss.xml",
    name: "BBC Entertainment",
    sourceUrl: "https://www.bbc.com/news/entertainment_and_arts",
    category: "entertainment",
  },
  {
    url: "https://feeds.npr.org/1008/rss.xml",
    name: "NPR Arts",
    sourceUrl: "https://www.npr.org/sections/arts",
    category: "entertainment",
  },
];

type CachedArticle = {
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

type Cache = {
  articles: CachedArticle[];
  lastFetched: number;
};

let cache: Cache = {
  articles: [],
  lastFetched: 0,
};

const CACHE_TTL = 5 * 60 * 1000;

function extractImageUrl(item: RSSFeedItem): string | null {
  if (
    item["media:content"] &&
    item["media:content"]?.$ &&
    item["media:content"].$?.url
  ) {
    return item["media:content"].$.url;
  }
  if (item.thumbnail && item.thumbnail?.$ && item.thumbnail.$?.url) {
    return item.thumbnail.$.url;
  }
  if (item.enclosure?.url && item.enclosure?.type?.startsWith("image/")) {
    return item.enclosure.url;
  }
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
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 400);
}

async function fetchFeed(source: NewsSource): Promise<CachedArticle[]> {
  try {
    const feed = await parser.parseURL(source.url);
    const articles: CachedArticle[] = [];

    for (const item of feed.items.slice(0, 8)) {
      if (!item.title || !item.link) continue;

      const id = crypto
        .createHash("md5")
        .update(item.link)
        .digest("hex");

      articles.push({
        id,
        title: item.title.trim(),
        summary: cleanSummary(item.contentSnippet || item.content),
        url: item.link,
        imageUrl: extractImageUrl(item),
        source: source.name,
        sourceUrl: source.sourceUrl,
        category: source.category,
        publishedAt: item.pubDate
          ? new Date(item.pubDate).toISOString()
          : new Date().toISOString(),
        author: item.creator || null,
      });
    }

    return articles;
  } catch {
    return [];
  }
}

async function getAllArticles(): Promise<CachedArticle[]> {
  const now = Date.now();

  if (cache.articles.length > 0 && now - cache.lastFetched < CACHE_TTL) {
    return cache.articles;
  }

  const results = await Promise.allSettled(
    RSS_SOURCES.map((source) => fetchFeed(source)),
  );

  const allArticles: CachedArticle[] = [];

  for (const result of results) {
    if (result.status === "fulfilled") {
      allArticles.push(...result.value);
    }
  }

  const seen = new Set<string>();
  const unique = allArticles.filter((a) => {
    if (seen.has(a.id)) return false;
    seen.add(a.id);
    return true;
  });

  unique.sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );

  cache = {
    articles: unique,
    lastFetched: now,
  };

  return unique;
}

const CATEGORY_META: Record<string, { label: string; icon: string }> = {
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

router.get("/news", async (req, res) => {
  try {
    const {
      category = "all",
      q = "",
      page = "1",
      limit = "20",
    } = req.query as {
      category?: string;
      q?: string;
      page?: string;
      limit?: string;
    };

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));

    let articles = await getAllArticles();

    if (category && category !== "all") {
      articles = articles.filter((a) => a.category === category);
    }

    if (q) {
      const query = q.toLowerCase();
      articles = articles.filter(
        (a) =>
          a.title.toLowerCase().includes(query) ||
          a.summary.toLowerCase().includes(query) ||
          a.source.toLowerCase().includes(query),
      );
    }

    const total = articles.length;
    const start = (pageNum - 1) * limitNum;
    const end = start + limitNum;
    const paged = articles.slice(start, end);

    res.json({
      articles: paged,
      total,
      page: pageNum,
      limit: limitNum,
      hasMore: end < total,
    });
  } catch (err) {
    req.log.error({ err }, "Error fetching news");
    res.status(500).json({ error: "Failed to fetch news" });
  }
});

router.get("/news/top", async (req, res) => {
  try {
    const { limit = "5" } = req.query as { limit?: string };
    const limitNum = Math.min(20, Math.max(1, parseInt(limit, 10) || 5));

    const articles = await getAllArticles();
    const withImage = articles.filter((a) => a.imageUrl);
    const top = withImage.slice(0, limitNum);

    res.json({ articles: top });
  } catch (err) {
    req.log.error({ err }, "Error fetching top news");
    res.status(500).json({ error: "Failed to fetch top news" });
  }
});

router.get("/news/categories", async (req, res) => {
  try {
    const articles = await getAllArticles();

    const counts: Record<string, number> = { all: articles.length };
    for (const a of articles) {
      counts[a.category] = (counts[a.category] || 0) + 1;
    }

    const categories = Object.entries(CATEGORY_META).map(([cat, meta]) => ({
      category: cat,
      label: meta.label,
      count: counts[cat] || 0,
      icon: meta.icon,
    }));

    res.json({ categories });
  } catch (err) {
    req.log.error({ err }, "Error fetching categories");
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

export default router;
