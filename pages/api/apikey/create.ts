import type { NextApiRequest, NextApiResponse } from "next";
import { headscaleFetch } from "../../../lib/headscale";
import { requireAuth } from "../_auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!requireAuth(req, res)) return;

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { expiration } = req.body || {};
    const body: any = {};
    if (expiration) {
      // Convert datetime-local (YYYY-MM-DDTHH:MM) to full ISO with seconds and Z timezone
      const date = new Date(expiration);
      if (isNaN(date.getTime())) {
        return res.status(400).json({ error: "Invalid expiration date format" });
      }
      body.expiration = date.toISOString();
    }

    const response = await headscaleFetch("/api/v1/apikey", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }

    if (!response.ok) {
      console.error("Headscale create apikey error:", response.status, data);
      return res.status(502).json({ error: data?.message || data?.error || `Headscale error ${response.status}` });
    }

    return res.json(data);
  } catch (err) {
    console.error("Headscale error:", (err as Error).message);
    return res.status(502).json({ error: "Headscale API error" });
  }
}
