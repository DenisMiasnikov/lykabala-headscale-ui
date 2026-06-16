import type { NextApiRequest, NextApiResponse } from "next";
import { headscaleFetch } from "../../../../../shared/lib/auth/headscale";
import { requireAuth, getHeadscaleConfig } from "../../_auth";

function validId(id: string | string[] | undefined) {
  return /^[0-9]+$/.test(String(id || ""));
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (!requireAuth(req, res)) return;
  const config = getHeadscaleConfig(req);
  const { id, expiry } = req.query;
  if (!validId(id)) return res.status(400).json({ error: "Invalid id" });

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    let url = `/api/v1/node/${id}/expire`;
    if (expiry && typeof expiry === "string") {
      const date = new Date(expiry);
      if (isNaN(date.getTime())) {
        return res.status(400).json({ error: "Invalid expiry date format" });
      }
      url += `?expiry=${encodeURIComponent(date.toISOString())}`;
    }
    const response = await headscaleFetch(url, { method: "POST" }, config);
    if (!response.ok) {
      return res.status(502).json({ error: "Headscale API error" });
    }
    return res.json({ success: true });
  } catch (err) {
    console.error("Headscale error:", (err as Error).message);
    return res.status(502).json({ error: "Headscale API error" });
  }
}
