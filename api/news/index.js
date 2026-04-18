import { getAllArticles } from "../_news-logic.mjs";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { category = "all", q = "", page = "1", limit = "20" } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));

    let articles = await getAllArticles();

    if (category && category !== "all") {
      articles = articles.filter((article) => article.category === category);
    }

    if (q) {
      const query = q.toLowerCase();
      articles = articles.filter(
        (article) =>
          article.title.toLowerCase().includes(query) ||
          article.summary.toLowerCase().includes(query) ||
          article.source.toLowerCase().includes(query),
      );
    }

    const total = articles.length;
    const start = (pageNum - 1) * limitNum;
    const paged = articles.slice(start, start + limitNum);

    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=60");
    return res.status(200).json({ articles: paged, total, page: pageNum, limit: limitNum, hasMore: start + limitNum < total });
  } catch {
    return res.status(200).json({ articles: [], total: 0, page: 1, limit: 20, hasMore: false });
  }
}