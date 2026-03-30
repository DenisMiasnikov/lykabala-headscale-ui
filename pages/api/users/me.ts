import type { NextApiRequest, NextApiResponse } from "next";
import { requireAuth } from "../_auth";
import { updateUser, getUser } from "../../../lib/users";
import { validatePassword, hashPassword } from "../../../lib/users";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = requireAuth(req, res);
  if (!session) return;

  if (req.method === "GET") {
    return res.json({
      username: session.username,
      isAdmin: session.isAdmin
    });
  }

  if (req.method === "PUT") {
    const { password, newUsername } = req.body || {};

    // Handle username change (no current password required)
    if (newUsername !== undefined) {
      if (!/^[a-zA-Z0-9_.-]+$/.test(newUsername)) {
        return res.status(400).json({ error: "Invalid username. Username can only contain letters, numbers, underscores, dots, and hyphens" });
      }
      if (newUsername === session.username) {
        return res.status(400).json({ error: "New username must be different" });
      }
      if (getUser(newUsername)) {
        return res.status(400).json({ error: "Username already exists" });
      }
      const ok = updateUser(session.username, { username: newUsername });
      if (!ok) {
        return res.status(400).json({ error: "Failed to update username" });
      }
      return res.json({ success: true, usernameChanged: true });
    }

    // Handle password change
    if (password) {
      const ok = updateUser(session.username, { password });
      if (!ok) {
        return res.status(400).json({ error: "Failed to update password" });
      }
    }

    return res.json({ success: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
