"use client";

import { useState, useCallback, useRef } from "react";
import type { Attributes, StageResult, LifeStage } from "@/lib/game/types";

const STAGE_ORDER: LifeStage[] = [
  "birth",
  "youth",
  "adulthood",
  "middle_age",
  "elder",
];

// 降级用通用选项
const FALLBACK_CHOICES = [
  { text: "谨慎前行", hint: "稳妥但可能错过机会" },
  { text: "冒险一搏", hint: "高风险高回报" },
  { text: "随缘吧", hint: "命运自有安排" },
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
  // 保存最近一次流式内容，用于降级构建
  const lastStreamRef = useRef("");

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
                lastStreamRef.current = fullContent;
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

  // 从流式内容中 regex 提取事件，用于降级构建 StageResult
  const buildFallbackStageResult = useCallback(
    (content: string, stageName: string, isElder: boolean): StageResult | null => {
      const unescape = (s: string) =>
        s.replace(/\\"/g, '"').replace(/\\n/g, "\n").replace(/\\t/g, "\t");

      // 提取阶段名和年龄范围
      const stageMatch = content.match(/"stage"\s*:\s*"((?:[^"\\]|\\.)*)"/);
      const ageRangeMatch = content.match(/"age_range"\s*:\s*"((?:[^"\\]|\\.)*)"/);

      // 提取事件
      const events: Array<{ age: number; text: string }> = [];
      const ageRegex = /"age"\s*:\s*(\d+)/g;
      let ageMatch;
      while ((ageMatch = ageRegex.exec(content)) !== null) {
        const after = content.slice(ageMatch.index);
        const textComplete = after.match(/"text"\s*:\s*"((?:[^"\\]|\\.)*)"/);
        if (textComplete) {
          events.push({
            age: parseInt(ageMatch[1]),
            text: unescape(textComplete[1]),
          });
        }
      }

      // 提取已有的 choices
      const choices: Array<{ text: string; hint: string }> = [];
      const choiceTextRegex = /"text"\s*:\s*"((?:[^"\\]|\\.)*)"\s*,\s*"hint"\s*:\s*"((?:[^"\\]|\\.)*)"/g;
      let choiceMatch;
      while ((choiceMatch = choiceTextRegex.exec(content)) !== null) {
        // 排除 events 中的 text（events 的 text 后面跟的是 attribute_changes 不是 hint）
        choices.push({
          text: unescape(choiceMatch[1]),
          hint: unescape(choiceMatch[2]),
        });
      }

      // 提取 stage_summary
      const summaryMatch = content.match(/"stage_summary"\s*:\s*"((?:[^"\\]|\\.)*)"/);

      if (events.length === 0) return null;

      console.warn("buildFallbackStageResult: 降级构建 StageResult", {
        events: events.length,
        choices: choices.length,
      });

      return {
        stage: stageMatch ? unescape(stageMatch[1]) : stageName,
        age_range: ageRangeMatch ? unescape(ageRangeMatch[1]) : "",
        events,
        choices: isElder ? [] : (choices.length >= 2 ? choices : FALLBACK_CHOICES),
        stage_summary: summaryMatch ? unescape(summaryMatch[1]) : "",
      };
    },
    []
  );

  const startGame = useCallback(async () => {
    setIsStreaming(true);
    setError(null);
    setStreamContent("");
    lastStreamRef.current = "";

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
      let stageResult = parseStageJSON(content);

      // 重试：解析失败时重新请求一次
      if (!stageResult) {
        console.warn("startGame: 首次解析失败，重试中...");
        setStreamContent("");
        lastStreamRef.current = "";
        const retryResponse = await fetch("/api/game/start", { method: "POST" });
        if (retryResponse.ok) {
          const retryContent = await parseSSEStream(retryResponse);
          stageResult = parseStageJSON(retryContent);
        }
      }

      // 降级：两次都失败，从流式内容中构建
      if (!stageResult) {
        console.warn("startGame: 重试也失败，尝试降级构建...");
        stageResult = buildFallbackStageResult(lastStreamRef.current, "出生与童年", false);
      }

      if (stageResult) {
        setData((prev) => {
          // 始终从事件的 attribute_changes 计算属性
          if (prev.attributes && stageResult.events) {
            stageResult.updated_attributes = computeAttributesFromEvents(prev.attributes, stageResult.events);
          }
          return {
            ...prev,
            stageResults: [stageResult],
            attributes: stageResult.updated_attributes || prev.attributes,
          };
        });
        setStreamContent("");
      } else {
        setError("内容解析失败，请刷新页面重试");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setIsStreaming(false);
    }
  }, [parseSSEStream, buildFallbackStageResult]);

  const makeChoice = useCallback(
    async (choiceText: string) => {
      if (!data.sessionId) return;

      const nextStageIndex = data.currentStageIndex + 1;
      if (nextStageIndex >= STAGE_ORDER.length) return;

      const nextStage = STAGE_ORDER[nextStageIndex];
      const isElder = nextStage === "elder";

      setIsStreaming(true);
      setError(null);
      setStreamContent("");
      lastStreamRef.current = "";

      const requestBody = JSON.stringify({
        choiceText,
        nextStage,
        sessionId: data.sessionId,
        attributes: data.attributes,
      });

      try {
        const response = await fetch("/api/game/choice", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: requestBody,
        });

        if (!response.ok) throw new Error("Failed to continue game");

        const content = await parseSSEStream(response);
        let stageResult = parseStageJSON(content);

        // 重试：解析失败时重新请求一次
        if (!stageResult) {
          console.warn("makeChoice: 首次解析失败，重试中...");
          setStreamContent("");
          lastStreamRef.current = "";
          const retryResponse = await fetch("/api/game/choice", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: requestBody,
          });
          if (retryResponse.ok) {
            const retryContent = await parseSSEStream(retryResponse);
            stageResult = parseStageJSON(retryContent);
          }
        }

        // 降级：两次都失败，从流式内容中构建
        if (!stageResult) {
          console.warn("makeChoice: 重试也失败，尝试降级构建...");
          stageResult = buildFallbackStageResult(lastStreamRef.current, nextStage, isElder);
        }

        if (stageResult) {
          const isLast = isElder || !!stageResult.death_age;
          setData((prev) => {
            // 始终从事件的 attribute_changes 计算属性
            if (prev.attributes && stageResult.events) {
              stageResult.updated_attributes = computeAttributesFromEvents(prev.attributes, stageResult.events);
            }
            return {
              ...prev,
              currentStageIndex: nextStageIndex,
              stageResults: [...prev.stageResults, stageResult],
              attributes: stageResult.updated_attributes || prev.attributes,
              isComplete: isLast,
            };
          });
          setStreamContent("");
        } else {
          setError("内容解析失败，请刷新页面重试");
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unknown error");
      } finally {
        setIsStreaming(false);
      }
    },
    [data.sessionId, data.currentStageIndex, data.attributes, parseSSEStream, buildFallbackStageResult]
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
          finalAttributes: data.attributes,
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

function repairJSON(str: string): string {
  return str
    // 移除控制字符（保留 \n \r \t）
    .replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g, "")
    // 修复尾部逗号
    .replace(/,(\s*[}\]])/g, "$1")
    // 移除行尾注释
    .replace(/\/\/[^\n]*$/gm, "")
    // 移除多行注释
    .replace(/\/\*[\s\S]*?\*\//g, "");
}

// 修复被截断的 JSON（AI 回复因 token 限制被截断时使用）
function closeTruncatedJSON(str: string): string {
  let cleaned = str;

  // 检测末尾是否在未关闭的字符串内
  let inStr = false;
  let esc = false;
  let lastStrStart = -1;
  for (let i = 0; i < cleaned.length; i++) {
    const ch = cleaned[i];
    if (esc) { esc = false; continue; }
    if (ch === "\\" && inStr) { esc = true; continue; }
    if (ch === '"') {
      if (!inStr) lastStrStart = i;
      inStr = !inStr;
    }
  }
  if (inStr && lastStrStart > 0) {
    // 截断到未关闭字符串之前的最近分隔符
    const before = cleaned.slice(0, lastStrStart);
    const cut = Math.max(before.lastIndexOf(","), before.lastIndexOf("["), before.lastIndexOf("{"));
    if (cut > 0) cleaned = cleaned.slice(0, cut + 1);
  }

  // 移除末尾不完整的 key: value 片段（含或不含前导逗号，含部分数值/布尔）
  cleaned = cleaned.replace(/,?\s*"[^"]*"\s*:\s*[-\w.]*\s*$/, "");
  // 移除末尾悬挂逗号
  cleaned = cleaned.replace(/,\s*$/, "");

  // 统计未关闭的括号并补全
  const stack: string[] = [];
  inStr = false;
  esc = false;
  for (let i = 0; i < cleaned.length; i++) {
    const ch = cleaned[i];
    if (esc) { esc = false; continue; }
    if (ch === "\\" && inStr) { esc = true; continue; }
    if (ch === '"') { inStr = !inStr; continue; }
    if (inStr) continue;
    if (ch === "{") stack.push("}");
    else if (ch === "[") stack.push("]");
    else if (ch === "}" || ch === "]") stack.pop();
  }

  return cleaned + stack.reverse().join("");
}

// 从事件的 attribute_changes 计算最终属性
function computeAttributesFromEvents(
  base: Attributes,
  events: Array<{ attribute_changes?: Partial<Attributes> }>
): Attributes {
  const clamp = (v: number) => Math.max(0, Math.min(100, v));
  const result = { ...base };
  for (const event of events) {
    if (!event.attribute_changes) continue;
    for (const key of Object.keys(event.attribute_changes) as (keyof Attributes)[]) {
      result[key] = clamp(result[key] + (event.attribute_changes[key] || 0));
    }
  }
  return result;
}

function tryParse(str: string): StageResult | null {
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
}

function parseStageJSON(content: string): StageResult | null {
  if (!content?.trim()) return null;

  // 1. 直接解析
  const direct = tryParse(content);
  if (direct) return direct;

  // 2. 从 markdown code block 提取（贪婪匹配到最后一个 ```）
  const fenceMatch = content.match(/```(?:json)?\s*\n?([\s\S]*)\n?\s*```\s*$/);
  if (fenceMatch) {
    const inner = fenceMatch[1].trim();
    const r = tryParse(inner) || tryParse(repairJSON(inner));
    if (r) return r;
  }

  // 3. 也试试 lazy 匹配（可能有多个代码块）
  const fenceLazy = content.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/);
  if (fenceLazy) {
    const inner = fenceLazy[1].trim();
    const r = tryParse(inner) || tryParse(repairJSON(inner));
    if (r) return r;
  }

  // 4. 提取最外层 { ... }（找到配对的大括号）
  const start = content.indexOf("{");
  if (start !== -1) {
    // 尝试找到配对的结束括号
    let depth = 0;
    let inString = false;
    let escape = false;
    let end = -1;

    for (let i = start; i < content.length; i++) {
      const ch = content[i];
      if (escape) { escape = false; continue; }
      if (ch === "\\") { escape = true; continue; }
      if (ch === '"') { inString = !inString; continue; }
      if (inString) continue;
      if (ch === "{") depth++;
      if (ch === "}") { depth--; if (depth === 0) { end = i; break; } }
    }

    if (end === -1) end = content.lastIndexOf("}");

    if (end > start) {
      const jsonStr = content.slice(start, end + 1);
      const r = tryParse(jsonStr) || tryParse(repairJSON(jsonStr));
      if (r) return r;
    }
  }

  // 5. 尝试修复截断的 JSON（AI 输出因 token 限制被截断）
  const startPos = content.indexOf("{");
  if (startPos !== -1) {
    const truncated = content.slice(startPos);
    const closed = closeTruncatedJSON(truncated);
    const r = tryParse(closed) || tryParse(repairJSON(closed));
    if (r) {
      console.warn("parseStageJSON: recovered from truncated JSON");
      return r;
    }
  }

  console.warn("parseStageJSON: all attempts failed.");
  console.warn("Full content:", content);
  return null;
}
