"use client";

import type { StageResult } from "@/lib/game/types";

interface TimelineProps {
  stages: StageResult[];
}

export function Timeline({ stages }: TimelineProps) {
  return (
    <div className="relative pl-8">
      {/* 虚线竖线 */}
      <div className="absolute left-3 top-0 bottom-0 w-px timeline-line" />

      {stages.map((stage, stageIdx) => (
        <div key={stageIdx} className="mb-8 animate-fade-in">
          {/* 阶段标题 */}
          <div className="flex items-center gap-3 mb-4 -ml-8">
            <div className="w-6 h-6 rounded-full border-2 border-foreground bg-background flex items-center justify-center z-10">
              <span className="text-[10px] font-mono">{stageIdx + 1}</span>
            </div>
            <h3 className="text-sm font-mono tracking-wider uppercase">
              {stage.stage} · {stage.age_range}
            </h3>
          </div>

          {/* 事件列表 */}
          <div className="space-y-3 ml-1">
            {stage.events?.map((event, eventIdx) => (
              <div
                key={eventIdx}
                className="relative flex gap-3 animate-fade-in"
                style={{ animationDelay: `${eventIdx * 0.15}s` }}
              >
                {/* 小圆点 */}
                <div className="absolute -left-[25px] top-1.5 w-2 h-2 rounded-full bg-foreground" />
                <div>
                  <span className="font-mono text-xs text-muted mr-2">
                    {event.age}岁
                  </span>
                  <span className="text-sm leading-relaxed">{event.text}</span>
                </div>
              </div>
            ))}
          </div>

          {/* 阶段小结 */}
          {stage.stage_summary && (
            <p className="mt-3 text-xs text-muted italic border-l-2 border-border pl-3">
              {stage.stage_summary}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
