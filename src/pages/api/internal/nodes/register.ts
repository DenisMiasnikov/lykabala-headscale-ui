import type { NextApiRequest, NextApiResponse } from "next";
import { headscaleFetch } from "../../../../shared/lib/auth/headscale";
import { requireAuth, getHeadscaleConfig } from "../_auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (!requireAuth(req, res)) return;

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const config = getHeadscaleConfig(req);
  const { user, key } = req.body || {};
  if (!user || !key) {
    return res.status(400).json({ error: "Missing user or key" });
  }

  try {
    const query = new URLSearchParams({ user, key }).toString();
    const response = await headscaleFetch(`/api/v1/node/register?${query}`, {
      method: "POST",
    }, config);
    const data = await response.json();

    if (!response.ok) {
      const message = data?.message || data?.error || "Headscale API error";
      return res.status(502).json({ error: message });
    }

    return res.json(data.node || data);
  } catch (err) {
    console.error("Headscale error:", (err as Error).message);
    return res.status(502).json({ error: "Headscale API error" });
  }
}
