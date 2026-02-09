"use client";

import { useState, useCallback, useRef } from "react";

interface UseSSEResult {
  content: string;
  sessionId: string | null;
  isStreaming: boolean;
  isDone: boolean;
  start: (url: string, body?: object) => Promise<string>;
  reset: () => void;
}

export function useSSE(): UseSSEResult {
  const [content, setContent] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const contentRef = useRef("");

  const reset = useCallback(() => {
    setContent("");
    setSessionId(null);
    setIsStreaming(false);
    setIsDone(false);
    contentRef.current = "";
  }, []);

  const start = useCallback(
    async (url: string, body?: object): Promise<string> => {
      setIsStreaming(true);
      setIsDone(false);
      setContent("");
      contentRef.current = "";

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        ...(body && { body: JSON.stringify(body) }),
      });

      if (!response.ok || !response.body) {
        setIsStreaming(false);
        throw new Error(`Stream failed: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let currentSessionId: string | null = null;
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

          if (line.startsWith("event: attributes") || line.startsWith("event: profile")) {
            // 自定义事件，跳过 (由 game hook 单独处理)
            continue;
          }

          if (line.startsWith("data: ")) {
            const data = line.slice(6);

            if (data === "[DONE]") {
              setIsDone(true);
              continue;
            }

            try {
              const parsed = JSON.parse(data);

              if (nextIsSessionData && parsed.sessionId) {
                currentSessionId = parsed.sessionId;
                setSessionId(parsed.sessionId);
                nextIsSessionData = false;
                continue;
              }

              if (parsed.choices?.[0]?.delta?.content) {
                const chunk = parsed.choices[0].delta.content;
                contentRef.current += chunk;
                setContent(contentRef.current);
              }
            } catch {
              // 非 JSON 行，忽略
            }
          }
        }
      }

      setIsStreaming(false);
      return contentRef.current;
    },
    []
  );

  return { content, sessionId, isStreaming, isDone, start, reset };
}
