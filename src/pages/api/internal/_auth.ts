import type { NextApiRequest, NextApiResponse } from "next";
import {
  verifySessionCookie,
  sessionCookieName,
} from "../../../shared/lib/auth/session";
import { parseCookies } from "./_utils";
import fs from "fs";

type SessionData = {
  username: string;
  isAdmin: boolean;
  headscaleUrl?: string;
  headscaleApiKey?: string;
};

function getEnvConfig(): { url: string; apiKey: string } | null {
  if ((process.env.HEADSCALE_URL && process.env.HEADSCALE_API_KEY) || process.env.HEADSCALE_API_KEY_FILE) {
    return {
      url: process.env.HEADSCALE_URL || "http://headscale:8080",
      apiKey: process.env.HEADSCALE_API_KEY || fs.readFileSync(process.env.HEADSCALE_API_KEY_FILE || "", "utf8").trim()
    };
  }
  return null;
}

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
    headscaleUrl: session.headscaleUrl,
    headscaleApiKey: session.headscaleApiKey,
  };
}

export function getHeadscaleConfig(req: NextApiRequest): { url: string; apiKey: string } | null {
  const secret = process.env.SESSION_SECRET || "secret";
  const cookies = req.cookies || parseCookies(req.headers.cookie);
  const cookie = cookies?.[sessionCookieName()];
  const session = verifySessionCookie(cookie, secret);

  if (session?.headscaleUrl && session?.headscaleApiKey) {
    return { url: session.headscaleUrl, apiKey: session.headscaleApiKey };
  }

  return getEnvConfig();
}
