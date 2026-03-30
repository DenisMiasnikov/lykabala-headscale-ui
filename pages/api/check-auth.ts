import type { NextApiRequest, NextApiResponse } from "next";
import { requireAuth } from "./_auth";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = requireAuth(req, res);
  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  return res.status(200).json({ ok: true });
}
