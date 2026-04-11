import type { NextApiRequest, NextApiResponse } from "next";
import { headscaleFetch } from "../../../shared/lib/auth/headscale";
import { requireAuth, getHeadscaleConfig } from "./_auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const session = requireAuth(req, res);
  if (!session) return;
  const config = getHeadscaleConfig(req);

  if (!config) {
    return res.status(502).json({ error: "Headscale not configured" });
  }

  if (req.method === "GET") {
    try {
      const response = await headscaleFetch("/api/v1/user", {}, config);
      const data = await response.json();
      if (!response.ok) {
        return res.status(502).json({ error: "Headscale API error" });
      }
      // Headscale returns namespaces as "users" array with id and name
      return res.json({ namespaces: data.users || [] });
    } catch (err) {
      console.error("Headscale error:", (err as Error).message);
      return res.status(502).json({ error: "Headscale API error" });
    }
  }

  if (req.method === "POST") {
    const { name, displayName, email, pictureUrl } = req.body || {};
    if (!name) return res.status(400).json({ error: "Missing namespace name" });
    try {
      const body: Record<string, unknown> = { name };
      if (displayName) body.displayName = displayName;
      if (email) body.email = email;
      if (pictureUrl) body.pictureUrl = pictureUrl;

      const response = await headscaleFetch("/api/v1/user", {
        method: "POST",
        body: JSON.stringify(body),
      }, config);
      const data = await response.json();
      if (!response.ok) {
        return res.status(502).json({ error: "Headscale API error" });
      }
      return res.json(data.user || data);
    } catch (err) {
      console.error("Headscale error:", (err as Error).message);
      return res.status(502).json({ error: "Headscale API error" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
