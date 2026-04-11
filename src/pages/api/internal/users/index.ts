import type { NextApiRequest, NextApiResponse } from "next";
import { requireAuth } from "../_auth";
import {
  getAllUsers,
  createUser,
} from "../../../../shared/lib/auth/users";

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

  if (!session.isAdmin) {
    return res.status(403).json({ error: "Admin only" });
  }

  if (req.method === "GET") {
    const users = getAllUsers();
    return res.json({ users });
  }

  if (req.method === "POST") {
    const { username, password, isAdmin } = req.body || {};
    const validName = validUsername(username);

    if (!validName) {
      return res
        .status(400)
        .json({
          error:
            "Username can only contain letters, numbers, underscores, dots, and hyphens",
        });
    }

    if (!username || !password) {
      return res.status(400).json({ error: "Missing username or password" });
    }
    const ok = createUser(username, password, isAdmin || false);
    if (!ok) {
      return res.status(400).json({ error: "User already exists" });
    }
    return res.json({ success: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
