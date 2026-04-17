import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getAllArticles } from "../_news-logic.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { limit = "5" } = req.query as Record<string, string>;
    const limitNum = Math.min(20, Math.max(1, parseInt(limit, 10) || 5));

    const articles = await getAllArticles();
    const withImage = articles.filter((a) => a.imageUrl);
    const top = withImage.slice(0, limitNum);

    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=60");
    return res.status(200).json({ articles: top });
  } catch {
    return res.status(500).json({ error: "Failed to fetch top news" });
  }
}
