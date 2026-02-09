import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";

export async function GET() {
  const session = await getSession();

  if (!session.accessToken) {
    return NextResponse.json({ user: null });
  }

  return NextResponse.json({
    user: {
      userId: session.userId,
      name: session.userName,
      avatar: session.userAvatar,
    },
  });
}

export async function DELETE() {
  const session = await getSession();
  session.destroy();
  return NextResponse.json({ ok: true });
}
