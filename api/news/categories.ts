import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getAllArticles, CATEGORY_META } from "../_news-logic.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

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

    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=60");
    return res.status(200).json({ categories });
  } catch {
    return res.status(500).json({ error: "Failed to fetch categories" });
  }
}
