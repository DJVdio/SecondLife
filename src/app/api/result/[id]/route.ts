import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { lifeResults } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const results = await getDb()
      .select()
      .from(lifeResults)
      .where(eq(lifeResults.shareId, id))
      .limit(1);

    if (results.length === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const result = results[0];
    return NextResponse.json({
      shareId: result.shareId,
      userName: result.userName,
      userAvatar: result.userAvatar,
      initialAttributes: result.initialAttributes,
      finalAttributes: result.finalAttributes,
      deathAge: result.deathAge,
      deathCause: result.deathCause,
      epitaph: result.epitaph,
      lifeRating: result.lifeRating,
      finalSummary: result.finalSummary,
      stageNarratives: result.stageNarratives,
      keyEvents: result.keyEvents,
      createdAt: result.createdAt,
    });
  } catch (e) {
    console.error("Result fetch error:", e);
    return NextResponse.json(
      { error: "Failed to fetch result" },
      { status: 500 }
    );
  }
}
