import type { NextApiRequest, NextApiResponse } from "next";
import { requireAuth } from "../_auth";
import { updateUser, getUser } from "../../../../shared/lib/auth/users";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const session = requireAuth(req, res);
  if (!session) return;

  if (req.method === "GET") {
    const user = getUser(session.username);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    return res.json({
      id: user.id,
      username: user.username,
      passwordHash: "********",
      salt: "********",
      isAdmin: user.isAdmin,
      createdAt: user.createdAt,
    });
  }

  if (req.method === "PUT") {
    const { password, username, passwordHash } = req.body || {};

    if (username !== undefined) {
      if (!/^[a-zA-Z0-9_.-]+$/.test(username)) {
        return res
          .status(400)
          .json({
            error:
              "Invalid username. Username can only contain letters, numbers, underscores, dots, and hyphens",
          });
      }
      if (username === session.username) {
        return res
          .status(400)
          .json({ error: "New username must be different" });
      }
      const exists = getUser(username);
      if (exists) {
        return res.status(400).json({ error: "Username already exists" });
      }
      const ok = updateUser(session.username, { username });
      if (!ok) {
        return res.status(400).json({ error: "Failed to update username" });
      }
      return res.json({ success: true, usernameChanged: true });
    }

    if (password || passwordHash) {
      const updates: { password?: string; passwordHash?: string } = {};
      if (password) updates.password = password;
      if (passwordHash) updates.passwordHash = passwordHash;
      
      const ok = updateUser(session.username, updates);
      if (!ok) {
        return res.status(400).json({ error: "Failed to update password" });
      }
    }

    return res.json({ success: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
