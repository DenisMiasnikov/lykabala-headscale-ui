import type { NextApiRequest, NextApiResponse } from "next";
import { headscaleFetch } from "../../../../../shared/lib/auth/headscale";
import { requireAuth, getHeadscaleConfig } from "../../_auth";

function validId(id: string | string[] | undefined) {
  return /^[0-9]+$/.test(String(id || ""));
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (!requireAuth(req, res)) return;
  const config = getHeadscaleConfig(req);
  const { id, givenName } = req.query;
  if (!validId(id)) return res.status(400).json({ error: "Invalid id" });
  if (!givenName) return res.status(400).json({ error: "Missing name" });

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const name = encodeURIComponent(String(givenName));
    const renameRes = await headscaleFetch(
      `/api/v1/node/${id}/rename/${name}`,
      {
        method: "POST",
      },
      config
    );

    let data;
    const text = await renameRes.text();
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }

    if (!renameRes.ok) {
      console.error("Headscale rename error:", renameRes.status, data);
      return res
        .status(502)
        .json({
          error:
            data?.message ||
            data?.error ||
            `Headscale error ${renameRes.status}`,
        });
    }

    return res.json({ success: true, node: data });
  } catch (err) {
    console.error("Headscale error:", (err as Error).message);
    return res.status(502).json({ error: "Headscale API error" });
  }
}
