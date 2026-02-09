import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { exchangeCodeForToken, fetchUserInfo } from "@/lib/secondme/client";
import { getSession } from "@/lib/auth/session";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/?error=${error}`
    );
  }

  const cookieStore = await cookies();
  const storedState = cookieStore.get("oauth_state")?.value;

  if (!code || !state || state !== storedState) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/?error=invalid_state`
    );
  }

  try {
    const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/callback`;
    const tokenData = await exchangeCodeForToken(code, redirectUri);
    const userInfo = await fetchUserInfo(tokenData.accessToken);

    const session = await getSession();
    session.accessToken = tokenData.accessToken;
    session.refreshToken = tokenData.refreshToken;
    session.expiresAt = Date.now() + tokenData.expiresIn * 1000;
    session.userId = userInfo.userId;
    session.userName = userInfo.name;
    session.userAvatar = userInfo.avatar;
    await session.save();

    cookieStore.delete("oauth_state");

    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/game`);
  } catch (e) {
    console.error("OAuth callback error:", e);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/?error=auth_failed`
    );
  }
}
