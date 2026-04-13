import type { GetServerSidePropsContext } from "next";
import { verifySessionCookie, sessionCookieName } from "./session";
import { parseCookies } from "../../../pages/api/internal/_utils";

export async function getAuthRedirect(context: GetServerSidePropsContext) {
  const secret = process.env.SESSION_SECRET || "secret";
  const headerCookies = parseCookies(context.req.headers.cookie || "");
  const cookies = context.req.cookies || headerCookies;
  const cookie = cookies?.[sessionCookieName()] || headerCookies?.[sessionCookieName()];

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
