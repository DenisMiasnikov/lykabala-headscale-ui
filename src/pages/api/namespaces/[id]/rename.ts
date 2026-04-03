import type { NextApiRequest, NextApiResponse } from "next";
import { headscaleFetch } from "../../../../shared/lib/auth/headscale";
import { requireAuth } from "../../_auth";

function validId(id: string | string[] | undefined) {
  return /^[0-9]+$/.test(String(id || ""));
}

function validName(name: string | undefined) {
  if (!name) return false;
  return /^[a-zA-Z0-9_.-]+$/.test(name);
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
  if (!validId(id))
    return res.status(400).json({ error: "Invalid namespace ID" });

  const { name: newName } = req.body || {};
  if (!newName || !validName(newName)) {
    return res.status(400).json({ error: "Invalid new namespace name" });
  }

  try {
    const encodedNewName = encodeURIComponent(String(newName));
    const response = await headscaleFetch(
      `/api/v1/user/${id}/rename/${encodedNewName}`,
      {
        method: "POST",
      },
    );
    const data = await response.json();

    if (!response.ok) {
      const message = data?.message || data?.error || "Headscale API error";
      return res
        .status(response.status || 502)
        .json({ error: message, details: data });
    }

    return res.json(data.user || data);
  } catch (err) {
    console.error("Headscale rename error:", (err as Error).message);
    return res
      .status(500)
      .json({
        error: "Internal server error",
        details: (err as Error).message,
      });
  }
}
