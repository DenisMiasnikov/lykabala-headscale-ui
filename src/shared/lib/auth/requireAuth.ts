import type { GetServerSidePropsContext } from "next";
import { verifySessionCookie, sessionCookieName } from "./session";

function parseCookies(header = "") {
  return header.split(";").reduce<Record<string, string>>((acc, part) => {
    const [key, ...rest] = part.trim().split("=");
    if (!key) return acc;
    acc[key] = decodeURIComponent(rest.join("="));
    return acc;
  }, {});
}

export async function getAuthRedirect(context: GetServerSidePropsContext) {
  const secret = process.env.SESSION_SECRET || "secret";
  const cookies = context.req.cookies || parseCookies(context.req.headers.cookie);
  const cookie = cookies?.[sessionCookieName()];
  const session = verifySessionCookie(cookie, secret);

  if (!session) {
    return {
      redirect: {
        destination: "/login",
        permanent: false
      }
    };
  }

  return null;
}
