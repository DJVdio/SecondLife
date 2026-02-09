import { NextRequest, NextResponse } from "next/server";
import { ensureFreshToken } from "@/lib/auth/ensure-token";
import { buildChatStreamRequest } from "@/lib/secondme/client";
import { stageMessages } from "@/lib/game/prompts";
import type { LifeStage } from "@/lib/game/types";

export const maxDuration = 60;

const stageMessageMap: Record<string, (choice: string) => string> = {
  youth: stageMessages.youth,
  adulthood: stageMessages.adulthood,
  middle_age: stageMessages.middle_age,
  elder: stageMessages.elder,
};

export async function POST(request: NextRequest) {
  try {
    const token = await ensureFreshToken();
    const { choiceText, nextStage, sessionId } = (await request.json()) as {
      choiceText: string;
      nextStage: LifeStage;
      sessionId: string;
    };

    if (!choiceText || !nextStage || !sessionId) {
      return NextResponse.json(
        { error: "choiceText, nextStage, and sessionId are required" },
        { status: 400 }
      );
    }

    const buildMessage = stageMessageMap[nextStage];
    if (!buildMessage) {
      return NextResponse.json(
        { error: "Invalid nextStage" },
        { status: 400 }
      );
    }

    const message = buildMessage(choiceText);
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
    console.error("Game choice error:", e);
    const message = e instanceof Error ? e.message : "Unknown error";
    if (message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
