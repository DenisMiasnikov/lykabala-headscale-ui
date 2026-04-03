import type { NextApiRequest, NextApiResponse } from "next";
import {
  createSessionCookie,
  sessionCookieName,
} from "../../shared/lib/auth/session";
import { validatePassword, getUser } from "../../shared/lib/auth/users";

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

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { username, password } = req.body || {};
    console.log("Login attempt:", username, req.body);

    if (!username || !password) {
      return res.status(400).json({ error: "Missing credentials" });
    }

    const envUser = process.env.UI_USERNAME || "admin";
    const envPass = process.env.UI_PASSWORD || "admin";

    if (username === envUser && password === envPass) {
      const secret = process.env.SESSION_SECRET || "secret";
      const cookieValue = createSessionCookie(
        JSON.stringify({ username, isAdmin: true }),
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

      return res.status(200).json({ success: true, isAdmin: true });
    }

    if (!validatePassword(username, password)) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = getUser(username);
    const secret = process.env.SESSION_SECRET || "secret";
    const cookieValue = createSessionCookie(
      JSON.stringify({ username, isAdmin: user?.isAdmin || false }),
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
      .json({ success: true, isAdmin: user?.isAdmin || false });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
