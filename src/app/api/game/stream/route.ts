import { NextRequest, NextResponse } from "next/server";
import { ensureFreshToken } from "@/lib/auth/ensure-token";
import { buildChatStreamRequest } from "@/lib/secondme/client";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const token = await ensureFreshToken();
    const { message, sessionId } = await request.json();

    if (!message || !sessionId) {
      return NextResponse.json(
        { error: "message and sessionId are required" },
        { status: 400 }
      );
    }

    const { url, init } = buildChatStreamRequest(token, message, {
      sessionId,
    });

    const sseResponse = await fetch(url, init);

    if (!sseResponse.ok || !sseResponse.body) {
      return NextResponse.json(
        { error: "Failed to stream" },
        { status: 502 }
      );
    }

    return new Response(sseResponse.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (e) {
    console.error("Game stream error:", e);
    const message = e instanceof Error ? e.message : "Unknown error";
    if (message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
