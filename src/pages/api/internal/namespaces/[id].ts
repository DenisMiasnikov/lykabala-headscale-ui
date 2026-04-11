import type { NextApiRequest, NextApiResponse } from "next";
import { requireAuth, getHeadscaleConfig } from "../_auth";
import { headscaleFetch } from "../../../../shared/lib/auth/headscale";

function validId(id: string | string[] | undefined) {
  return /^[0-9]+$/.test(String(id || ""));
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (!requireAuth(req, res)) return;
  const config = getHeadscaleConfig(req);

  const { id } = req.query;
  if (!validId(id))
    return res.status(400).json({ error: "Invalid namespace ID" });

  // Headscale API does not support GET individual namespace.
  // We only handle DELETE here. GET returns 501 from Headscale.

  if (req.method === "DELETE") {
    try {
      const response = await headscaleFetch(`/api/v1/user/${id}`, {
        method: "DELETE",
      }, config);
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        return res
          .status(502)
          .json({ error: data.error || "Failed to delete namespace" });
      }
      return res.json({ success: true });
    } catch (err) {
      console.error("Headscale error:", (err as Error).message);
      return res.status(502).json({ error: "Headscale API error" });
    }
  }

  if (req.method === "GET") {
    // Not supported by Headscale - return a helpful error
    return res.status(501).json({
      error:
        "Headscale API does not support getting individual namespace. Use the list endpoint instead.",
    });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
