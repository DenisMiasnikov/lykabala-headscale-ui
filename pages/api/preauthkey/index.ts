import type { NextApiRequest, NextApiResponse } from "next";
import { headscaleFetch } from "../../../lib/headscale";
import { requireAuth } from "../_auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!requireAuth(req, res)) return;

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { user, reusable, ephemeral, expiration, aclTags } = req.body || {};
    
    if (!user) {
      return res.status(400).json({ error: "Missing user (namespace id)" });
    }

    const body: any = { user };
    if (reusable !== undefined) body.reusable = reusable;
    if (ephemeral !== undefined) body.ephemeral = ephemeral;
    
    if (expiration) {
      const date = new Date(expiration);
      if (isNaN(date.getTime())) {
        return res.status(400).json({ error: "Invalid expiration date format" });
      }
      body.expiration = date.toISOString();
    }
    
    if (aclTags && Array.isArray(aclTags)) {
      body.aclTags = aclTags;
    }

    const response = await headscaleFetch("/api/v1/preauthkey", {
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
      console.error("Headscale create preauthkey error:", response.status, data);
      return res.status(502).json({ error: data?.message || data?.error || `Headscale error ${response.status}` });
    }

    return res.json(data);
  } catch (err) {
    console.error("Headscale error:", (err as Error).message);
    return res.status(502).json({ error: "Headscale API error" });
  }
}
