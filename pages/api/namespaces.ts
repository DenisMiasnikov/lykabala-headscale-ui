import type { NextApiRequest, NextApiResponse } from "next";
import { headscaleFetch } from "../../lib/headscale";
import { requireAuth } from "./_auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!requireAuth(req, res)) return;

  if (req.method === "GET") {
    try {
      const response = await headscaleFetch("/api/v1/user");
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
      const body: any = { name };
      if (displayName) body.displayName = displayName;
      if (email) body.email = email;
      if (pictureUrl) body.pictureUrl = pictureUrl;
      
      const response = await headscaleFetch("/api/v1/user", {
        method: "POST",
        body: JSON.stringify(body)
      });
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
