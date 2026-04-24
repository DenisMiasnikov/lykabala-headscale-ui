import type { NextApiRequest, NextApiResponse } from "next";
import { requireAuth, getHeadscaleConfig } from "../_auth";
import { headscaleFetch } from "../../../../shared/lib/auth/headscale";
import { query } from "../../../../shared/lib/db";

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

  if (req.method === "PUT") {
    const { name, pictureUrl } = req.body || {};

    if (!name && !pictureUrl) {
      return res.status(400).json({ error: "Missing name or pictureUrl" });
    }

    const errors: string[] = [];
    let renameSuccess = false;

    // 1. Rename in Headscale if name provided
    if (name) {
      if (!validName(name)) {
        return res.status(400).json({ error: "Invalid name format" });
      }
      try {
        const encodedNewName = encodeURIComponent(String(name));
        const response = await headscaleFetch(
          `/api/v1/user/${id}/rename/${encodedNewName}`,
          { method: "POST" },
          config
        );
        const data = await response.json();
        if (!response.ok) {
          const message = data?.message || data?.error || "Headscale rename failed";
          errors.push(message);
        } else {
          renameSuccess = true;
        }
      } catch (err) {
        errors.push((err as Error).message);
      }
    }

    // 2. Update pictureUrl in database if provided
    let imageSuccess = false;
    if (pictureUrl) {
      try {
        const result = await query(
          `UPDATE users SET "profile_pic_url" = $1 WHERE id = $2 RETURNING *`,
          [pictureUrl, id]
        );
        if (result.rowCount === 0) {
          errors.push("Namespace not found in database");
        } else {
          imageSuccess = true;
        }
      } catch (err) {
        errors.push((err as Error).message);
      }
    }

    if (errors.length > 0) {
      return res.status(502).json({ error: errors.join(", ") });
    }

    return res.json({ success: true, renamed: renameSuccess, imageUpdated: imageSuccess });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
