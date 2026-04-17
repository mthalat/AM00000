import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getAllArticles } from "../_news-logic.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { category = "all", q = "", page = "1", limit = "20" } = req.query as Record<string, string>;

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
    const paged = articles.slice(start, start + limitNum);

    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=60");
    return res.status(200).json({ articles: paged, total, page: pageNum, limit: limitNum, hasMore: start + limitNum < total });
  } catch {
    return res.status(500).json({ error: "Failed to fetch news" });
  }
}
