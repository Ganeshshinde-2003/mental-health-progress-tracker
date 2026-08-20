import { getInsight } from '../services/insight.service.js';

export async function fetchInsight(req, res) {
  try {
    const text = await getInsight(req.user.id);
    res.json({ insight: text });
  } catch (err) {
    // AI insight is a nice-to-have; never break the dashboard over it.
    console.error(`[${req.id}] Insight generation failed:`, err);
    res.json({ insight: null });
  }
}
