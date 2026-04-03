import crypto from "crypto";

const COOKIE_NAME = "hs_session";

function sign(value: string, secret: string) {
  return crypto.createHmac("sha256", secret).update(value).digest("hex");
}

type SessionPayload = {
  username: string;
  isAdmin: boolean;
  exp: number;
};

export function createSessionCookie(
  payloadJson: string,
  secret: string,
  maxAgeSeconds: number
) {
  const payload: SessionPayload = {
    ...JSON.parse(payloadJson),
    exp: Date.now() + maxAgeSeconds * 1000
  };
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64");
  const signature = sign(encoded, secret);
  return `${encoded}.${signature}`;
}

export function verifySessionCookie(cookieValue: string | undefined, secret: string): SessionPayload | null {
  if (!cookieValue) return null;
  const parts = cookieValue.split(".");
  if (parts.length !== 2) return null;
  const [encoded, signature] = parts;
  const expected = sign(encoded, secret);
  if (expected !== signature) return null;
  const payload = JSON.parse(
    Buffer.from(encoded, "base64").toString("utf8")
  ) as SessionPayload;
  if (Date.now() > payload.exp) return null;
  return payload;
}

export function sessionCookieName() {
  return COOKIE_NAME;
}
