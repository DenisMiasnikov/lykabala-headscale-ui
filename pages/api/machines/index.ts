import type { NextApiRequest, NextApiResponse } from "next";
import { headscaleFetch } from "../../../lib/headscale";
import { requireAuth } from "../_auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!requireAuth(req, res)) return;
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const response = await headscaleFetch("/api/v1/node");
    const data = await response.json();
    if (!response.ok) {
      return res.status(502).json({ error: "Headscale API error" });
    }
    return res.json({ machines: data.nodes || [] });
  } catch (err) {
    console.error("Headscale error:", (err as Error).message);
    return res.status(502).json({ error: "Headscale API error" });
  }
}
