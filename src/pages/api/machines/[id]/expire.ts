import type { NextApiRequest, NextApiResponse } from "next";
import { headscaleFetch } from "../../../../shared/lib/auth/headscale";
import { requireAuth } from "../../_auth";

function validId(id: string | string[] | undefined) {
  return /^[0-9]+$/.test(String(id || ""));
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (!requireAuth(req, res)) return;
  const { id } = req.query;
  if (!validId(id)) return res.status(400).json({ error: "Invalid id" });

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const response = await headscaleFetch(`/api/v1/node/${id}/expire`, {
      method: "POST",
    });
    if (!response.ok) {
      return res.status(502).json({ error: "Headscale API error" });
    }
    return res.json({ success: true });
  } catch (err) {
    console.error("Headscale error:", (err as Error).message);
    return res.status(502).json({ error: "Headscale API error" });
  }
}
