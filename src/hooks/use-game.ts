"use client";

import { useState, useCallback } from "react";
import type { Attributes, StageResult, LifeStage } from "@/lib/game/types";

const STAGE_ORDER: LifeStage[] = [
  "birth",
  "youth",
  "adulthood",
  "middle_age",
  "elder",
];

interface GameData {
  attributes: Attributes | null;
  profile: { name: string; avatar: string } | null;
  sessionId: string | null;
  currentStageIndex: number;
  stageResults: StageResult[];
  isComplete: boolean;
  shareId: string | null;
}

export function useGame() {
  const [data, setData] = useState<GameData>({
    attributes: null,
    profile: null,
    sessionId: null,
    currentStageIndex: 0,
    stageResults: [],
    isComplete: false,
    shareId: null,
  });
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamContent, setStreamContent] = useState("");
  const [error, setError] = useState<string | null>(null);

  const parseSSEStream = useCallback(
    async (response: Response): Promise<string> => {
      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let fullContent = "";
      let nextIsSessionData = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("event: session")) {
            nextIsSessionData = true;
            continue;
          }

          if (line.startsWith("event: attributes")) {
            continue;
          }

          if (line.startsWith("event: profile")) {
            continue;
          }

          if (line.startsWith("data: ")) {
            const rawData = line.slice(6);

            if (rawData === "[DONE]") continue;

            try {
              const parsed = JSON.parse(rawData);

              if (nextIsSessionData && parsed.sessionId) {
                setData((prev) => ({ ...prev, sessionId: parsed.sessionId }));
                nextIsSessionData = false;
                continue;
              }

              // 自定义事件数据
              if (parsed.happiness !== undefined && parsed.wealth !== undefined) {
                setData((prev) => ({ ...prev, attributes: parsed as Attributes }));
                continue;
              }

              if (parsed.name !== undefined && parsed.avatar !== undefined && !parsed.choices) {
                setData((prev) => ({ ...prev, profile: parsed }));
                continue;
              }

              if (parsed.choices?.[0]?.delta?.content) {
                const chunk = parsed.choices[0].delta.content;
                fullContent += chunk;
                setStreamContent(fullContent);
              }
            } catch {
              // 忽略解析错误
            }
          }
        }
      }

      return fullContent;
    },
    []
  );

  const startGame = useCallback(async () => {
    setIsStreaming(true);
    setError(null);
    setStreamContent("");

    try {
      const response = await fetch("/api/game/start", { method: "POST" });
      if (!response.ok) {
        if (response.status === 401) {
          window.location.href = "/api/auth/login";
          return;
        }
        throw new Error("Failed to start game");
      }

      const content = await parseSSEStream(response);
      const stageResult = parseStageJSON(content);

      if (stageResult) {
        setData((prev) => ({
          ...prev,
          stageResults: [stageResult],
          attributes: stageResult.updated_attributes || prev.attributes,
        }));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setIsStreaming(false);
    }
  }, [parseSSEStream]);

  const makeChoice = useCallback(
    async (choiceText: string) => {
      if (!data.sessionId) return;

      const nextStageIndex = data.currentStageIndex + 1;
      if (nextStageIndex >= STAGE_ORDER.length) return;

      const nextStage = STAGE_ORDER[nextStageIndex];

      setIsStreaming(true);
      setError(null);
      setStreamContent("");

      try {
        const response = await fetch("/api/game/choice", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            choiceText,
            nextStage,
            sessionId: data.sessionId,
            attributes: data.attributes,
          }),
        });

        if (!response.ok) throw new Error("Failed to continue game");

        const content = await parseSSEStream(response);
        const stageResult = parseStageJSON(content);

        if (stageResult) {
          const isLast = nextStage === "elder" || !!stageResult.death_age;
          setData((prev) => ({
            ...prev,
            currentStageIndex: nextStageIndex,
            stageResults: [...prev.stageResults, stageResult],
            attributes: stageResult.updated_attributes || prev.attributes,
            isComplete: isLast,
          }));
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unknown error");
      } finally {
        setIsStreaming(false);
      }
    },
    [data.sessionId, data.currentStageIndex, parseSSEStream]
  );

  const saveResult = useCallback(async () => {
    const lastStage = data.stageResults[data.stageResults.length - 1];
    if (!lastStage) return null;

    try {
      const response = await fetch("/api/game/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          initialAttributes: data.stageResults[0]?.updated_attributes || data.attributes,
          finalAttributes: lastStage.updated_attributes,
          deathAge: lastStage.death_age || 80,
          deathCause: lastStage.death_cause || "自然老去",
          epitaph: lastStage.epitaph || "这一生，值了。",
          lifeRating: lastStage.life_rating || "B",
          finalSummary: lastStage.final_summary || lastStage.stage_summary || "",
          stageNarratives: data.stageResults,
          choicesMade: data.stageResults
            .filter((s) => s.choices?.length > 0)
            .map((s) => s.choices),
          keyEvents: data.stageResults.flatMap((s) => s.events || []),
        }),
      });

      if (!response.ok) throw new Error("Failed to save");

      const { shareId } = await response.json();
      setData((prev) => ({ ...prev, shareId }));
      return shareId;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
      return null;
    }
  }, [data]);

  return {
    ...data,
    isStreaming,
    streamContent,
    error,
    startGame,
    makeChoice,
    saveResult,
  };
}

function parseStageJSON(content: string): StageResult | null {
  try {
    // 尝试直接解析
    return JSON.parse(content);
  } catch {
    // 尝试从 markdown code block 中提取
    const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[1]);
      } catch {
        // fall through
      }
    }

    // 尝试找到第一个 { 和最后一个 }
    const start = content.indexOf("{");
    const end = content.lastIndexOf("}");
    if (start !== -1 && end > start) {
      try {
        return JSON.parse(content.slice(start, end + 1));
      } catch {
        // fall through
      }
    }

    return null;
  }
}
