"use client";

import type { Attributes } from "@/lib/game/types";

const STAT_LABELS: Record<keyof Attributes, string> = {
  happiness: "幸福",
  wealth: "财富",
  health: "健康",
  intelligence: "智力",
  charisma: "魅力",
  luck: "运气",
};

export function StatsBar({ attributes }: { attributes: Attributes }) {
  return (
    <div className="grid grid-cols-3 gap-x-6 gap-y-3">
      {(Object.entries(STAT_LABELS) as [keyof Attributes, string][]).map(
        ([key, label]) => (
          <div key={key} className="flex items-center gap-2">
            <span className="w-8 text-xs font-mono">{label}</span>
            <div className="flex-1 h-2 border border-foreground/20 relative">
              <div
                className="absolute inset-y-0 left-0 bg-foreground animate-fill"
                style={{ width: `${attributes[key]}%` }}
              />
            </div>
            <span className="w-6 text-xs font-mono text-right">
              {attributes[key]}
            </span>
          </div>
        )
      )}
    </div>
  );
}
