import type { NextApiRequest, NextApiResponse } from "next";
import { headscaleFetch } from "../../lib/headscale";
import { requireAuth } from "./_auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!requireAuth(req, res)) return;

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const response = await headscaleFetch("/api/v1/health");
    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }

    if (!response.ok) {
      console.error("Headscale health error:", response.status, data);
      return res.status(502).json({ error: data?.message || data?.error || `Headscale error ${response.status}` });
    }

    return res.json(data);
  } catch (err) {
    console.error("Headscale error:", (err as Error).message);
    return res.status(502).json({ error: "Headscale API error" });
  }
}
