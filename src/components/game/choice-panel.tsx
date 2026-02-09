"use client";

import type { StageChoice } from "@/lib/game/types";

interface ChoicePanelProps {
  choices: StageChoice[];
  onSelect: (choiceText: string) => void;
  disabled?: boolean;
}

export function ChoicePanel({ choices, onSelect, disabled }: ChoicePanelProps) {
  if (!choices || choices.length === 0) return null;

  return (
    <div className="my-6 animate-fade-in">
      <p className="text-xs font-mono text-muted mb-3 tracking-wider">
        — 命运的岔路口 —
      </p>
      <div className="space-y-3">
        {choices.map((choice, idx) => (
          <button
            key={idx}
            onClick={() => onSelect(choice.text)}
            disabled={disabled}
            className="w-full text-left p-4 border border-foreground/20 hover:border-foreground transition-colors group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-start gap-3">
              <span className="font-mono text-sm shrink-0 mt-0.5">
                {String.fromCharCode(65 + idx)}.
              </span>
              <div>
                <p className="text-sm">{choice.text}</p>
                {choice.hint && (
                  <p className="text-xs text-muted mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {choice.hint}
                  </p>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
