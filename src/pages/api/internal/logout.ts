import type { NextApiRequest, NextApiResponse } from "next";
import { sessionCookieName } from "../../../shared/lib/auth/session";

function serializeCookie(name: string, value: string) {
  return `${name}=${value}; Max-Age=0; Path=/; HttpOnly; SameSite=Lax`;
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader("Set-Cookie", serializeCookie(sessionCookieName(), ""));
  res.status(200).json({ success: true });
}
