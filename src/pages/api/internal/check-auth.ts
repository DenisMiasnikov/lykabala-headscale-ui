import type { NextApiRequest, NextApiResponse } from "next";
import { verifySessionCookie, sessionCookieName } from "../../../shared/lib/auth/session";
import { parseCookies } from "./_utils";
import fs from "fs";

function getEnvConfig(): { url: string; apiKey: string } | null {
  let apiKey = "";
  if (process.env.HEADSCALE_API_KEY) {
    apiKey = process.env.HEADSCALE_API_KEY.trim();
  } else if (process.env.HEADSCALE_API_KEY_FILE) {
    try {
      apiKey = fs.readFileSync(process.env.HEADSCALE_API_KEY_FILE, "utf8").trim();
    } catch {}
  }
  if (process.env.HEADSCALE_URL && apiKey) {
    return { url: process.env.HEADSCALE_URL, apiKey };
  }
  return null;
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const secret = process.env.SESSION_SECRET || "secret";
  const cookies = req.cookies || parseCookies(req.headers.cookie);
  const cookie = cookies?.[sessionCookieName()];
  let session;
  try {
    session = verifySessionCookie(cookie, secret);
  } catch (err) {
    console.error("Session verification error:", (err as Error).message);
    session = null;
  }

  const envConfig = getEnvConfig();

  if (session) {
    const configured = !!(session.headscaleUrl && session.headscaleApiKey);
    return res.status(200).json({ ok: true, configured });
  }

  if (envConfig) {
    return res.status(200).json({ ok: true, configured: true });
  }

  return res.status(401).json({ error: "Unauthorized" });
}
