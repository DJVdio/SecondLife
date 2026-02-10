import { NextResponse } from "next/server";
import { ensureFreshToken } from "@/lib/auth/ensure-token";
import { composeUserProfile } from "@/lib/secondme/memory-composer";
import { buildChatStreamRequest } from "@/lib/secondme/client";
import { buildSystemPrompt, stageMessages } from "@/lib/game/prompts";
import { generateRandomAttributes } from "@/lib/game/engine";

export async function POST() {
  try {
    const token = await ensureFreshToken();
    const profile = await composeUserProfile(token);
    const attributes = generateRandomAttributes();
    const systemPrompt = buildSystemPrompt(profile, attributes);

    const { url, init } = buildChatStreamRequest(
      token,
      stageMessages.birth_and_childhood,
      { systemPrompt }
    );

    const sseResponse = await fetch(url, init);

    if (!sseResponse.ok || !sseResponse.body) {
      return NextResponse.json(
        { error: "Failed to start game stream" },
        { status: 502 }
      );
    }

    // 在流前面注入初始属性
    const encoder = new TextEncoder();
    const attributesEvent = `event: attributes\ndata: ${JSON.stringify(attributes)}\n\n`;
    const profileEvent = `event: profile\ndata: ${JSON.stringify({ name: profile.identity.name, avatar: profile.identity.avatar })}\n\n`;

    const prefixStream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(attributesEvent));
        controller.enqueue(encoder.encode(profileEvent));
        controller.close();
      },
    });

    // 合并 prefix 和 SSE 流
    const combinedStream = concatStreams(prefixStream, sseResponse.body);

    return new Response(combinedStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (e) {
    console.error("Game start error:", e);
    const message = e instanceof Error ? e.message : "Unknown error";
    if (message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function concatStreams(
  first: ReadableStream<Uint8Array>,
  second: ReadableStream<Uint8Array>
): ReadableStream<Uint8Array> {
  let reader: ReadableStreamDefaultReader<Uint8Array>;
  let phase = 0;

  return new ReadableStream({
    async start() {
      reader = first.getReader();
    },
    async pull(controller) {
      while (true) {
        const { done, value } = await reader.read();
        if (!done) {
          controller.enqueue(value);
          return;
        }
        if (phase === 0) {
          phase = 1;
          reader = second.getReader();
          continue;
        }
        controller.close();
        return;
      }
    },
  });
}
