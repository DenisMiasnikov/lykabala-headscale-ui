import type { NextApiRequest, NextApiResponse } from "next";
import { headscaleFetch } from "../../shared/lib/auth/headscale";
import { requireAuth } from "./_auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (!requireAuth(req, res)) return;
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { namespace } = req.body || {};
  if (!namespace) return res.status(400).json({ error: "Missing namespace" });

  try {
    const userRes = await headscaleFetch("/api/v1/user");
    const userData = await userRes.json();
    if (!userRes.ok) {
      return res.status(502).json({ error: "Headscale API error" });
    }

    const match = (userData.users || []).find(
      (user: { name: string }) => user.name === namespace,
    );

    if (!match) {
      return res.status(404).json({ error: "Namespace not found" });
    }

    const response = await headscaleFetch("/api/v1/preauthkey", {
      method: "POST",
      body: JSON.stringify({
        user: Number(match.id),
        reusable: true,
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      return res.status(502).json({ error: "Headscale API error" });
    }
    const key = data?.preAuthKey?.key || data?.key;
    return res.json({ key });
  } catch (err) {
    console.error("Headscale error:", (err as Error).message);
    return res.status(502).json({ error: "Headscale API error" });
  }
}
