import type { NextResponse } from "next/server";

/** Cookie options that work locally and on Vercel HTTPS */
export function sessionCookieOpts(maxAge: number) {
  const secure = process.env.NODE_ENV === "production";
  return {
    path: "/" as const,
    sameSite: "lax" as const,
    secure,
    maxAge,
  };
}

export function setSessionCookies(
  res: NextResponse,
  uid: string,
  role: string,
) {
  const opts = sessionCookieOpts(60 * 60 * 24 * 30);
  res.cookies.set("kolab_uid", uid, { ...opts, httpOnly: false });
  res.cookies.set("kolab_role", role, { ...opts, httpOnly: false });
}

export function setAdminCookie(res: NextResponse) {
  res.cookies.set("rivo_admin", "1", {
    ...sessionCookieOpts(60 * 60 * 12),
    httpOnly: true,
  });
}

export function clearAdminCookie(res: NextResponse) {
  res.cookies.set("rivo_admin", "", {
    ...sessionCookieOpts(0),
    httpOnly: true,
    maxAge: 0,
  });
}

export function clearSessionCookies(res: NextResponse) {
  const opts = { ...sessionCookieOpts(0), httpOnly: false, maxAge: 0 };
  res.cookies.set("kolab_uid", "", opts);
  res.cookies.set("kolab_role", "", opts);
}
