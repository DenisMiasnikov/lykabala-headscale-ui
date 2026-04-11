import type { NextApiRequest, NextApiResponse } from "next";
import {
  verifySessionCookie,
  sessionCookieName,
} from "../../../shared/lib/auth/session";
import { parseCookies } from "./_utils";

type SessionData = {
  username: string;
  isAdmin: boolean;
  headscaleUrl?: string;
  headscaleApiKey?: string;
};

function getEnvConfig(): { url: string; apiKey: string } | null {
  if (process.env.HEADSCALE_URL && process.env.HEADSCALE_API_KEY) {
    return {
      url: process.env.HEADSCALE_URL,
      apiKey: process.env.HEADSCALE_API_KEY
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
