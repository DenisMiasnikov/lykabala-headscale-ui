import type { NextApiRequest, NextApiResponse } from "next";
import { headscaleFetch } from "../../../../shared/lib/auth/headscale";
import { requireAuth, getHeadscaleConfig } from "../_auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (!requireAuth(req, res)) return;

  if (req.method !== "DELETE") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { id } = req.query;
  if (!id || typeof id !== "string" || !/^[0-9]+$/.test(id)) {
    return res.status(400).json({ error: "Missing or invalid preauth key id" });
  }

  try {
    const config = getHeadscaleConfig(req);
    const response = await headscaleFetch(`/api/v1/preauthkey/expire`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: parseInt(id) }),
    }, config);

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }

    if (!response.ok) {
      console.error(
        "Headscale delete preauthkey error:",
        response.status,
        data,
      );
      return res
        .status(502)
        .json({
          error:
            data?.message ||
            data?.error ||
            `Headscale error ${response.status}`,
        });
    }

    return res.json({ success: true });
  } catch (err) {
    console.error("Headscale error:", (err as Error).message);
    return res.status(502).json({ error: "Headscale API error" });
  }
}
