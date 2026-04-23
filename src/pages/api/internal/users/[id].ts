import type { NextApiRequest, NextApiResponse } from "next";
import { requireAuth } from "../_auth";
import { updateUser, deleteUserById, getUserById, getUserWithId } from "../../../../shared/lib/auth/users";

function validId(id: string | string[] | undefined): string | null {
  const str = String(id || "");
  if (!/^[0-9a-f-]+$/.test(str)) return null;
  return str;
}

function getUserFromSession(session: { username: string; isAdmin: boolean }, userId: string) {
  const user = getUserById(userId);
  if (!user) return null;
  if (!session.isAdmin && user.username !== session.username) {
    return null;
  }
  return user;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const session = requireAuth(req, res);
  if (!session) return;

  const { id } = req.query;
  const validIdStr = validId(id);
  if (!validIdStr) {
    return res.status(400).json({ error: "Invalid user ID" });
  }

  const targetUser = getUserFromSession(session, validIdStr);
  if (!targetUser) {
    return res.status(403).json({ error: "User not found or access denied" });
  }

  if (req.method === "GET") {
    return res.json({
      id: targetUser.id,
      username: targetUser.username,
      passwordHash: "********",
      salt: "********",
      isAdmin: targetUser.isAdmin,
      createdAt: targetUser.createdAt,
    });
  }

  if (req.method === "PUT") {
    const { password, passwordHash, isAdmin, username } = req.body || {};

    const updates: { password?: string; passwordHash?: string; isAdmin?: boolean; username?: string } = {};

    if (password) {
      updates.password = password;
    }

    if (passwordHash) {
      updates.passwordHash = passwordHash;
    }

    if (username) {
      if (!/^[a-zA-Z0-9_.-]+$/.test(username)) {
        return res.status(400).json({ error: "Invalid username" });
      }
      updates.username = username;
    }

    if (isAdmin !== undefined) {
      if (!session.isAdmin) {
        return res.status(403).json({ error: "Admin only" });
      } else {
        updates.isAdmin = isAdmin;
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "No changes provided" });
    }

    const ok = updateUser(targetUser.username, updates);
    if (!ok) {
      return res.status(400).json({ error: "Failed to update user" });
    }

    return res.json({ success: true });
  }

  if (req.method === "DELETE") {
    if (targetUser.username === session.username) {
      return res.status(400).json({ error: "Cannot delete yourself" });
    }
    if (!session.isAdmin) {
      return res.status(403).json({ error: "Admin only" });
    }
    const ok = deleteUserById(targetUser.id);
    if (!ok) {
      return res.status(400).json({ error: "User not found" });
    }
    return res.json({ success: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
