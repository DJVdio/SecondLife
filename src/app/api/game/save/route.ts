import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { lifeResults } from "@/lib/db/schema";
import { generateSnowflakeId } from "@/lib/snowflake";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session.accessToken || !session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const shareId = generateSnowflakeId();

    await getDb().insert(lifeResults).values({
      shareId,
      userId: session.userId,
      userName: session.userName || "Unknown",
      userAvatar: session.userAvatar || null,
      initialAttributes: body.initialAttributes,
      finalAttributes: body.finalAttributes,
      deathAge: body.deathAge,
      deathCause: body.deathCause,
      epitaph: body.epitaph,
      lifeRating: body.lifeRating,
      finalSummary: body.finalSummary,
      stageNarratives: body.stageNarratives,
      choicesMade: body.choicesMade,
      keyEvents: body.keyEvents,
    });

    return NextResponse.json({ shareId });
  } catch (e) {
    console.error("Game save error:", e);
    return NextResponse.json(
      { error: "Failed to save result" },
      { status: 500 }
    );
  }
}
