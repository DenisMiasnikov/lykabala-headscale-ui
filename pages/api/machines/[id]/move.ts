import type { NextApiRequest, NextApiResponse } from "next";
import { headscaleFetch } from "../../../../lib/headscale";
import { requireAuth } from "../../_auth";

function validId(id: string | string[] | undefined) {
  return /^[0-9]+$/.test(String(id || ""));
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!requireAuth(req, res)) return;
  const { id } = req.query;

  if (!validId(id)) {
    return res.status(400).json({ error: "Invalid machine id" });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { namespaceId } = req.body || {};
  if (!namespaceId) {
    return res.status(400).json({ error: "Missing namespaceId" });
  }

  if (!validId(namespaceId)) {
    return res.status(400).json({ error: "Invalid namespace id" });
  }

  try {
    const response = await headscaleFetch(`/api/v1/node/${id}/user/${namespaceId}`, {
      method: "POST"
    });

    let data;
    const text = await response.text();
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }

    if (!response.ok) {
      console.error("Headscale move node error:", response.status, data);
      return res.status(502).json({ error: data?.message || data?.error || `Headscale error ${response.status}` });
    }

    return res.json({ success: true, node: data });
  } catch (err) {
    console.error("Headscale error:", (err as Error).message);
    return res.status(502).json({ error: "Headscale API error" });
  }
}
