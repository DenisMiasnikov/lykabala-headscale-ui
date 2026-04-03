import type { NextApiRequest, NextApiResponse } from "next";
import { requireAuth } from "../_auth";
import { updateUser, deleteUser } from "../../../shared/lib/auth/users";

function validUsername(username: string | string[] | undefined): string | null {
  const str = String(username || "");
  if (!/^[a-zA-Z0-9_.-]+$/.test(str)) return null;
  return str;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const session = requireAuth(req, res);
  if (!session) return;

  // Allow either admin or self-update
  const { username } = req.query;
  const validName = validUsername(username);
  if (!validName) {
    return res
      .status(400)
      .json({
        error:
          "Invalid username. Username can only contain letters, numbers, underscores, dots, and hyphens",
      });
  }

  if (!session.isAdmin && validName !== session.username) {
    return res.status(403).json({ error: "Admin only" });
  }

  if (req.method === "PUT") {
    const { password, isAdmin } = req.body || {};

    const updates: any = {};

    if (password) {
      updates.password = password;
    }

    if (isAdmin !== undefined) {
      if (!session.isAdmin) {
        return res.status(403).json({ error: "Admin only" });
      }
      updates.isAdmin = isAdmin;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "No changes provided" });
    }

    const ok = updateUser(validName, updates);
    if (!ok) {
      return res.status(400).json({ error: "User not found" });
    }

    return res.json({ success: true });
  }

  if (req.method === "DELETE") {
    if (validName === session.username) {
      return res.status(400).json({ error: "Cannot delete yourself" });
    }
    if (!session.isAdmin) {
      return res.status(403).json({ error: "Admin only" });
    }
    const ok = deleteUser(validName);
    if (!ok) {
      return res.status(400).json({ error: "User not found" });
    }
    return res.json({ success: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
