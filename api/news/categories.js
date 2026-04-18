import { CATEGORY_META, getAllArticles } from "../_news-logic.mjs";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  try {
    const articles = await getAllArticles();
    const counts = { all: articles.length };

    for (const article of articles) {
      counts[article.category] = (counts[article.category] || 0) + 1;
    }

    const categories = Object.entries(CATEGORY_META).map(([category, meta]) => ({
      category,
      label: meta.label,
      count: counts[category] || 0,
      icon: meta.icon,
    }));

    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=60");
    return res.status(200).json({ categories });
  } catch {
    const categories = Object.entries(CATEGORY_META).map(([category, meta]) => ({
      category,
      label: meta.label,
      count: 0,
      icon: meta.icon,
    }));
    return res.status(200).json({ categories });
  }
}