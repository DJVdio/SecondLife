import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const state = crypto.randomUUID();

  const redirectUrl = new URL("https://go.second.me/oauth/");
  redirectUrl.searchParams.set("client_id", process.env.SECONDME_CLIENT_ID!);
  redirectUrl.searchParams.set(
    "redirect_uri",
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/callback`
  );
  redirectUrl.searchParams.set("response_type", "code");
  redirectUrl.searchParams.set("state", state);

  const cookieStore = await cookies();
  cookieStore.set("oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });

  return NextResponse.redirect(redirectUrl.toString());
}
