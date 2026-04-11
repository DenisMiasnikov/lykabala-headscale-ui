import type { NextApiRequest, NextApiResponse } from "next";

import { query } from "../../../shared/lib/db";
import {requireAuth} from "./_auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!requireAuth(req, res)) return;

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { userId, imageUrl } = req.body;

  if (!userId || !imageUrl) {
    return res.status(400).json({ error: "Missing userId or imageUrl" });
  }

  try {
    const result = await query(
      `UPDATE users SET "profile_pic_url" = $1 WHERE id = $2 RETURNING *`,
      [imageUrl, userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json({ success: true, user: result.rows[0] });
  } catch (err: any) {
    console.error("Update image error:", err);
    return res.status(500).json({ error: "Failed to update image URL" });
  }
}
