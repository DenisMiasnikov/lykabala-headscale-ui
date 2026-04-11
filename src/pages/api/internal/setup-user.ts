import type { NextApiRequest, NextApiResponse } from "next";
import { getAllUsers, createUser } from "../../../shared/lib/auth/users";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const users = getAllUsers();
  if (users.length > 0) {
    return res.status(403).json({ error: "Admin user already exists" });
  }

  const { username, password, isAdmin } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ error: "Missing username or password" });
  }

  if (!/^[a-zA-Z0-9_.-]+$/.test(username)) {
    return res.status(400).json({
      error: "Username can only contain letters, numbers, underscores, dots, and hyphens",
    });
  }

  const ok = createUser(username, password, isAdmin || true);
  if (!ok) {
    return res.status(400).json({ error: "User already exists" });
  }

  return res.json({ success: true });
}
