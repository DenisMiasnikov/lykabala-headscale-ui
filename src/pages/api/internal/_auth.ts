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
    let apiKey = process.env.HEADSCALE_API_KEY;
    if (!apiKey && process.env.HEADSCALE_API_KEY_FILE) {
      try {
        apiKey = fs.readFileSync(process.env.HEADSCALE_API_KEY_FILE, "utf8").trim();
      } catch (err) {
        console.error("Failed to read API key file:", (err as Error).message);
        return null;
      }
    }
    return {
      url: process.env.HEADSCALE_URL || "http://headscale:8080",
      apiKey: apiKey || "",
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
  let session;
  try {
    session = verifySessionCookie(cookie, secret);
  } catch (err) {
    console.error("Session verification error:", (err as Error).message);
    res.status(401).json({ error: "Invalid session" });
    return null;
  }
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
  let session;
  try {
    session = verifySessionCookie(cookie, secret);
  } catch (err) {
    console.error("Session verification error:", (err as Error).message);
    return getEnvConfig();
  }

  if (session?.headscaleUrl && session?.headscaleApiKey) {
    return { url: session.headscaleUrl, apiKey: session.headscaleApiKey };
  }

  return getEnvConfig();
}
