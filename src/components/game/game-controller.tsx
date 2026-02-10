"use client";

import { useEffect, useRef, useMemo } from "react";
import { useGame } from "@/hooks/use-game";
import { StatsBar } from "@/components/ui/stats-bar";
import { Timeline } from "@/components/game/timeline";
import { ChoicePanel } from "@/components/game/choice-panel";
import { useRouter } from "next/navigation";

export function GameController() {
  const {
    attributes,
    profile,
    stageResults,
    isStreaming,
    streamContent,
    isComplete,
    error,
    startGame,
    makeChoice,
    saveResult,
  } = useGame();
  const router = useRouter();
  const started = useRef(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!started.current) {
      started.current = true;
      startGame();
    }
  }, [startGame]);

  // 自动滚动到底部
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [stageResults, streamContent, isComplete]);

  const handleSave = async () => {
    const shareId = await saveResult();
    if (shareId) {
      router.push(`/result/${shareId}`);
    }
  };

  // 从流式 JSON 中解析结构化阶段数据，实现逐事件展示
  const streamingStage = useMemo(() => {
    if (!streamContent) return null;

    const unescape = (s: string) =>
      s.replace(/\\"/g, '"').replace(/\\n/g, "\n").replace(/\\t/g, "\t");

    // 提取阶段名和年龄范围
    const stageMatch = streamContent.match(/"stage"\s*:\s*"((?:[^"\\]|\\.)*)"/);
    const ageRangeMatch = streamContent.match(
      /"age_range"\s*:\s*"((?:[^"\\]|\\.)*)"/
    );

    // 逐个提取事件（age + text）
    const events: Array<{
      age: number;
      text: string;
      isPartial?: boolean;
    }> = [];
    const ageRegex = /"age"\s*:\s*(\d+)/g;
    let ageMatch;
    while ((ageMatch = ageRegex.exec(streamContent)) !== null) {
      const after = streamContent.slice(ageMatch.index);
      // 完整的 text 值
      const textComplete = after.match(/"text"\s*:\s*"((?:[^"\\]|\\.)*)"/);
      if (textComplete) {
        events.push({
          age: parseInt(ageMatch[1]),
          text: unescape(textComplete[1]),
        });
      } else {
        // 正在流式输出的部分 text
        const textPartial = after.match(
          /"text"\s*:\s*"((?:[^"\\]|\\.)*?)$/
        );
        if (textPartial) {
          events.push({
            age: parseInt(ageMatch[1]),
            text: unescape(textPartial[1]),
            isPartial: true,
          });
        }
      }
    }

    // 阶段小结
    let stageSummary = "";
    let isSummaryPartial = false;
    const summaryComplete = streamContent.match(
      /"stage_summary"\s*:\s*"((?:[^"\\]|\\.)*)"/
    );
    if (summaryComplete) {
      stageSummary = unescape(summaryComplete[1]);
    } else {
      const summaryPartial = streamContent.match(
        /"stage_summary"\s*:\s*"((?:[^"\\]|\\.)*?)$/
      );
      if (summaryPartial) {
        stageSummary = unescape(summaryPartial[1]);
        isSummaryPartial = true;
      }
    }

    if (!stageMatch && events.length === 0) return null;

    return {
      stageName: stageMatch ? unescape(stageMatch[1]) : "",
      ageRange: ageRangeMatch ? unescape(ageRangeMatch[1]) : "",
      events,
      stageSummary,
      isSummaryPartial,
    };
  }, [streamContent]);

  // 当前/下一阶段标签
  const STAGE_LABELS = ["出生与童年", "青年", "成年", "中年", "老年与结局"];
  const nextStageLabel = STAGE_LABELS[stageResults.length] || "下一阶段";

  const currentStage = stageResults[stageResults.length - 1];
  const showChoices =
    !isStreaming && currentStage?.choices?.length > 0 && !isComplete;

  return (
    <div className="min-h-screen max-w-2xl mx-auto px-6 py-8">
      {/* 头部 */}
      <header className="flex items-center justify-between mb-8 pb-4 border-b border-border">
        <h1 className="font-mono text-lg tracking-wider">第二人生</h1>
        {profile && (
          <div className="flex items-center gap-2">
            {profile.avatar && (
              <img
                src={profile.avatar}
                alt=""
                className="w-6 h-6 rounded-full border border-border"
              />
            )}
            <span className="text-sm text-muted">{profile.name}</span>
          </div>
        )}
      </header>

      {/* 属性条 */}
      {attributes && (
        <div className="mb-8 p-4 border border-border">
          <StatsBar attributes={attributes} />
        </div>
      )}

      {/* 骨架屏时间线（等待 AI 生成时显示） */}
      {isStreaming && !streamingStage && (
        <div className="relative pl-8 my-4 animate-fade-in">
          <div className="absolute left-3 top-0 bottom-0 w-px timeline-line opacity-30" />

          {/* 阶段标题 */}
          <div className="flex items-center gap-3 mb-4 -ml-8">
            <div className="w-6 h-6 rounded-full border-2 border-muted bg-background flex items-center justify-center z-10">
              <span className="text-[10px] font-mono text-muted">
                {stageResults.length + 1}
              </span>
            </div>
            <h3 className="text-sm font-mono tracking-wider text-muted">
              {nextStageLabel}
              <span className="loading-dots" />
            </h3>
          </div>

          {/* 事件骨架条 */}
          <div className="space-y-4 ml-1">
            {[0, 1, 2].map((i) => (
              <div key={i} className="relative flex gap-3 animate-pulse" style={{ animationDelay: `${i * 0.3}s` }}>
                <div className="absolute -left-[25px] top-1.5 w-2 h-2 rounded-full bg-muted/40" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 w-10 bg-muted/20 rounded" />
                  <div className="h-3 bg-muted/15 rounded" style={{ width: `${55 + i * 15}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 错误 */}
      {error && (
        <div className="p-4 border border-red-300 bg-red-50 text-red-800 text-sm mb-6">
          {error}
        </div>
      )}

      {/* 时间线 */}
      {stageResults.length > 0 && <Timeline stages={stageResults} />}

      {/* 流式时间线（当前阶段逐事件展示） */}
      {isStreaming && streamingStage && (
        <div className="relative pl-8 my-4">
          <div className="absolute left-3 top-0 bottom-0 w-px timeline-line" />

          {/* 阶段标题 */}
          {(streamingStage.stageName || streamingStage.ageRange) && (
            <div className="flex items-center gap-3 mb-4 -ml-8">
              <div className="w-6 h-6 rounded-full border-2 border-foreground bg-background flex items-center justify-center z-10">
                <span className="text-[10px] font-mono">
                  {stageResults.length + 1}
                </span>
              </div>
              <h3 className="text-sm font-mono tracking-wider uppercase">
                {streamingStage.stageName}
                {streamingStage.ageRange &&
                  ` · ${streamingStage.ageRange}`}
              </h3>
            </div>
          )}

          {/* 事件列表 */}
          <div className="space-y-3 ml-1">
            {streamingStage.events.map((event, idx) => (
              <div
                key={idx}
                className="relative flex gap-3 animate-fade-in"
              >
                <div className="absolute -left-[25px] top-1.5 w-2 h-2 rounded-full bg-foreground" />
                <div>
                  <span className="font-mono text-xs text-muted mr-2">
                    {event.age}岁
                  </span>
                  <span className="text-sm leading-relaxed">
                    {event.text}
                    {event.isPartial && (
                      <span className="cursor-blink" />
                    )}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* 阶段小结 */}
          {streamingStage.stageSummary && (
            <p className="mt-3 text-xs text-muted italic border-l-2 border-border pl-3">
              {streamingStage.stageSummary}
              {streamingStage.isSummaryPartial && (
                <span className="cursor-blink" />
              )}
            </p>
          )}
        </div>
      )}

      {/* 选择面板 */}
      {showChoices && (
        <ChoicePanel
          choices={currentStage.choices}
          onSelect={makeChoice}
          disabled={isStreaming}
        />
      )}

      {/* 游戏结束 */}
      {isComplete && currentStage && (
        <div className="mt-8 mb-12 animate-fade-in">
          <div className="border-2 border-foreground p-6 text-center">
            {currentStage.death_age && (
              <p className="font-mono text-xs text-muted mb-2">
                享年 {currentStage.death_age} 岁
              </p>
            )}
            {currentStage.death_cause && (
              <p className="text-sm mb-4">{currentStage.death_cause}</p>
            )}
            {currentStage.life_rating && (
              <div className="text-6xl font-mono font-bold my-4">
                {currentStage.life_rating}
              </div>
            )}
            {currentStage.epitaph && (
              <p className="italic text-muted text-sm mb-4">
                &ldquo;{currentStage.epitaph}&rdquo;
              </p>
            )}
            {currentStage.final_summary && (
              <p className="text-sm leading-relaxed mt-4">
                {currentStage.final_summary}
              </p>
            )}
          </div>

          <button
            onClick={handleSave}
            className="mt-6 w-full py-3 border-2 border-foreground font-mono text-sm tracking-wider hover:bg-foreground hover:text-background transition-colors"
          >
            保存并分享这一生
          </button>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
