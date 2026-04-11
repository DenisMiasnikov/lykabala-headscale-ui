import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { url, apiKey } = req.body || {};

  if (!url || !apiKey) {
    return res.status(400).json({ error: "Missing url or apiKey" });
  }

  const baseUrl = url.replace(/\/$/, "");
  const endpoints = ["/api/v1/health", "/api/health"];

  for (const endpoint of endpoints) {
    try {
      const fullUrl = `${baseUrl}${endpoint}`;
      const response = await fetch(fullUrl, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        signal: AbortSignal.timeout(10000),
      });

      if (response.ok || response.status === 401) {
        return res.json({ success: true });
      }
    } catch (err) {
      console.error("Test connection error:", (err as Error).message);
    }
  }

  return res.status(502).json({ error: "Could not connect. Check URL." });
}
