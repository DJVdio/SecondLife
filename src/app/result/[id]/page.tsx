"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { StatsBar } from "@/components/ui/stats-bar";
import { Timeline } from "@/components/game/timeline";
import type { Attributes, StageResult } from "@/lib/game/types";

interface ResultData {
  shareId: string;
  userName: string;
  userAvatar: string | null;
  initialAttributes: Attributes;
  finalAttributes: Attributes;
  deathAge: number;
  deathCause: string;
  epitaph: string;
  lifeRating: string;
  finalSummary: string;
  stageNarratives: StageResult[];
  keyEvents: Array<{ age: number; text: string }>;
  createdAt: string;
}

export default function ResultPage() {
  const params = useParams();
  const id = params.id as string;
  const [data, setData] = useState<ResultData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch(`/api/result/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then(setData)
      .catch((e) => setError(e.message));
  }, [id]);

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-6xl font-mono font-bold mb-4">404</p>
          <p className="text-muted text-sm">这段人生尚未被记录</p>
          <a
            href="/"
            className="inline-block mt-6 px-6 py-2 border border-foreground text-sm font-mono hover:bg-foreground hover:text-background transition-colors"
          >
            开启你的第二人生
          </a>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-foreground border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen max-w-2xl mx-auto px-6 py-8">
      {/* 头部 */}
      <header className="flex items-center justify-between mb-8 pb-4 border-b border-border">
        <h1 className="font-mono text-lg tracking-wider">第二人生</h1>
        <div className="flex items-center gap-2">
          {data.userAvatar && (
            <img
              src={data.userAvatar}
              alt=""
              className="w-6 h-6 rounded-full border border-border"
            />
          )}
          <span className="text-sm text-muted">{data.userName} 的第二人生</span>
        </div>
      </header>

      {/* 评级卡片 */}
      <div className="border-2 border-foreground p-8 text-center mb-8 animate-fade-in">
        <div className="text-8xl font-mono font-bold mb-4">
          {data.lifeRating}
        </div>
        <p className="text-sm text-muted mb-2">享年 {data.deathAge} 岁</p>
        <p className="text-sm mb-4">{data.deathCause}</p>
        <p className="italic text-muted text-sm">
          &ldquo;{data.epitaph}&rdquo;
        </p>
      </div>

      {/* 最终属性 */}
      <div className="mb-8 p-4 border border-border">
        <p className="text-xs font-mono text-muted mb-3">最终属性</p>
        <StatsBar attributes={data.finalAttributes} />
      </div>

      {/* 人生总结 */}
      {data.finalSummary && (
        <div className="mb-8 p-4 border-l-2 border-foreground">
          <p className="text-sm leading-relaxed">{data.finalSummary}</p>
        </div>
      )}

      {/* 完整时间线 */}
      {data.stageNarratives?.length > 0 && (
        <div className="mb-8">
          <p className="text-xs font-mono text-muted mb-4 tracking-wider">
            — 人生轨迹 —
          </p>
          <Timeline stages={data.stageNarratives} />
        </div>
      )}

      {/* 操作 */}
      <div className="flex gap-4 mb-12">
        <button
          onClick={handleShare}
          className="flex-1 py-3 border-2 border-foreground font-mono text-sm tracking-wider hover:bg-foreground hover:text-background transition-colors"
        >
          {copied ? "已复制链接" : "复制分享链接"}
        </button>
        <a
          href="/"
          className="flex-1 py-3 border border-border text-center font-mono text-sm tracking-wider hover:border-foreground transition-colors"
        >
          开启我的第二人生
        </a>
      </div>

      <footer className="text-center text-xs text-muted font-mono pb-6">
        powered by SecondMe API
      </footer>
    </div>
  );
}
