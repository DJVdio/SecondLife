import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { refreshAccessToken } from "@/lib/secondme/client";

export async function POST() {
  const session = await getSession();

  if (!session.refreshToken) {
    return NextResponse.json({ error: "No session" }, { status: 401 });
  }

  try {
    const tokenData = await refreshAccessToken(session.refreshToken);
    session.accessToken = tokenData.accessToken;
    session.refreshToken = tokenData.refreshToken;
    session.expiresAt = Date.now() + tokenData.expiresIn * 1000;
    await session.save();

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Token refresh error:", e);
    session.destroy();
    return NextResponse.json({ error: "Refresh failed" }, { status: 401 });
  }
}
