import type { NextApiRequest, NextApiResponse } from "next";
import {
  verifySessionCookie,
  sessionCookieName,
} from "../../shared/lib/auth/session";
import { parseCookies } from "./_utils";

type SessionData = {
  username: string;
  isAdmin: boolean;
};

export function requireAuth(
  req: NextApiRequest,
  res: NextApiResponse,
): SessionData | null {
  const secret = process.env.SESSION_SECRET || "secret";
  const cookies = req.cookies || parseCookies(req.headers.cookie);
  const cookie = cookies?.[sessionCookieName()];
  const session = verifySessionCookie(cookie, secret);
  if (!session) {
    res.status(401).json({ error: "Unauthorized" });
    return null;
  }
  return {
    username: session.username,
    isAdmin: session.isAdmin,
  };
}
