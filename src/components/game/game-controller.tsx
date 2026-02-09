"use client";

import { useEffect, useRef } from "react";
import { useGame } from "@/hooks/use-game";
import { StatsBar } from "@/components/ui/stats-bar";
import { Typewriter } from "@/components/ui/typewriter";
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

      {/* 加载中 */}
      {isStreaming && stageResults.length === 0 && (
        <div className="flex flex-col items-center py-16 animate-fade-in">
          <div className="w-8 h-8 border-2 border-foreground border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-sm text-muted">正在翻阅你的记忆，编织新的人生...</p>
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

      {/* 流式文本（当前阶段加载中） */}
      {isStreaming && streamContent && stageResults.length > 0 && (
        <div className="pl-8 my-4 text-sm text-muted">
          <Typewriter text={streamContent} isStreaming={true} />
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
