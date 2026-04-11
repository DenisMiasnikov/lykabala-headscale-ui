import type { NextApiRequest, NextApiResponse } from "next";
import { headscaleFetch } from "../../../../shared/lib/auth/headscale";
import { requireAuth, getHeadscaleConfig } from "../_auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const session = requireAuth(req, res);
  if (!session) return;
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const config = getHeadscaleConfig(req);
    if (!config) {
      return res.status(502).json({ error: "Headscale not configured" });
    }
    const response = await headscaleFetch("/api/v1/node", {}, config);
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
