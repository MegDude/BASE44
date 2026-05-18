export default async function handler(req, res) {
  try {
    const q = (req.query.q || "").toString();

    // Simple intent parsing (expand later with LLM)
    const normalized = q.toLowerCase();

    const categories = [];
    if (normalized.includes("coffee")) categories.push("coffee");
    if (normalized.includes("happy hour")) categories.push("bar");
    if (normalized.includes("food")) categories.push("restaurant");

    const response = {
      intent: q,
      categories,
      filters: categories,
      ranking: "default",
      confidence: 0.62,
    };

    res.status(200).json(response);
  } catch (err) {
    res.status(500).json({ error: "ask-map failed" });
  }
}
