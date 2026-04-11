import type { NextApiRequest, NextApiResponse } from "next";
import { headscaleFetch } from "../../../../../shared/lib/auth/headscale";
import { requireAuth, getHeadscaleConfig } from "../../_auth";

function validId(id: string | string[] | undefined): boolean {
  return /^[0-9]+$/.test(String(id || ""));
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (!requireAuth(req, res)) return;

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { id } = req.query;
  if (!validId(id)) {
    return res.status(400).json({ error: "Invalid node id" });
  }

  const { tags } = req.body || {};
  if (!Array.isArray(tags)) {
    return res.status(400).json({ error: "Tags must be an array of strings" });
  }

  try {
    const config = getHeadscaleConfig(req);
    const response = await headscaleFetch(`/api/v1/node/${id}/tags`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tags }),
    }, config);

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }

    if (!response.ok) {
      console.error("Headscale set tags error:", response.status, data);
      return res
        .status(502)
        .json({
          error:
            data?.message ||
            data?.error ||
            `Headscale error ${response.status}`,
        });
    }

    return res.json({ success: true, node: data });
  } catch (err) {
    console.error("Headscale error:", (err as Error).message);
    return res.status(502).json({ error: "Headscale API error" });
  }
}
