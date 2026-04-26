import { supabaseServer } from "../src/lib/supabaseServer.js";

const FALLBACK_HEATMAP = [
  { lat: 30.2587, lng: -97.7386, intensity: 72 },
  { lat: 30.2694, lng: -97.7499, intensity: 48 },
  { lat: 30.2661, lng: -97.7524, intensity: 38 },
  { lat: 30.2682, lng: -97.7363, intensity: 44 },
  { lat: 30.2672, lng: -97.7431, intensity: 30 }
];

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!supabaseServer) {
    return res.status(200).json(FALLBACK_HEATMAP);
  }

  const { data, error } = await supabaseServer.rpc("get_heatmap");

  if (error) {
    return res.status(200).json(FALLBACK_HEATMAP);
  }

  return res.status(200).json(Array.isArray(data) && data.length ? data : FALLBACK_HEATMAP);
}
