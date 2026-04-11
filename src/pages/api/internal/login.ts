import type { NextApiRequest, NextApiResponse } from "next";
import {
  createSessionCookie,
  sessionCookieName,
} from "../../../shared/lib/auth/session";
import { validatePassword, getUser } from "../../../shared/lib/auth/users";
import { decrypt } from "../../../shared/lib/crypto";

const ONE_DAY = 60 * 60 * 24;

function serializeCookie(
  name: string,
  value: string,
  options: {
    maxAge?: number;
    httpOnly?: boolean;
    sameSite?: string;
    secure?: boolean;
  },
) {
  const attrs = [`${name}=${value}`];
  if (options.maxAge) attrs.push(`Max-Age=${options.maxAge}`);
  if (options.httpOnly) attrs.push("HttpOnly");
  if (options.sameSite) attrs.push(`SameSite=${options.sameSite}`);
  if (options.secure) attrs.push("Secure");
  attrs.push("Path=/");
  return attrs.join("; ");
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { username, password, headscaleUrl, encryptedApiKey } = req.body || {};
    console.log("Login attempt:", username);

    if (!username || !password) {
      return res.status(400).json({ error: "Missing credentials" });
    }

    let isValid = false;
    let userIsAdmin = false;

    const envUser = process.env.UI_USERNAME;
    const envPass = process.env.UI_PASSWORD;

    if (envUser && envPass && username === envUser && password === envPass) {
      isValid = true;
      userIsAdmin = true;
    } else if (validatePassword(username, password)) {
      isValid = true;
      const user = getUser(username);
      userIsAdmin = user?.isAdmin || false;
    }

    if (!isValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    let headscaleApiKey: string | undefined;
    let hsUrl: string | undefined;

    if (headscaleUrl && encryptedApiKey && password) {
      const decrypted = await decrypt(encryptedApiKey, password);
      if (decrypted) {
        headscaleApiKey = decrypted;
        hsUrl = headscaleUrl.replace(/\/$/, "");
      }
    }

    const secret = process.env.SESSION_SECRET || "secret";
    const sessionData = {
      username,
      isAdmin: userIsAdmin,
      ...(hsUrl && headscaleApiKey && { headscaleUrl: hsUrl, headscaleApiKey }),
    };
    const cookieValue = createSessionCookie(
      JSON.stringify(sessionData),
      secret,
      ONE_DAY,
    );
    const secure = process.env.COOKIE_SECURE === "true";

    res.setHeader(
      "Set-Cookie",
      serializeCookie(sessionCookieName(), cookieValue, {
        maxAge: ONE_DAY,
        httpOnly: true,
        sameSite: "Lax",
        secure,
      }),
    );

    return res
      .status(200)
      .json({ success: true, isAdmin: userIsAdmin });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
