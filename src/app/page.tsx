export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      {/* 标题区 */}
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold tracking-tight mb-4">第二人生</h1>
        <p className="text-lg text-muted">如果人生重来一次...</p>
      </div>

      {/* 说明 */}
      <div className="max-w-md w-full mb-12">
        <div className="space-y-6">
          {[
            { step: "01", title: "连接记忆", desc: "授权 SecondMe，让 AI 读取你的记忆" },
            { step: "02", title: "重启人生", desc: "基于你的性格和经历，生成全新的人生" },
            { step: "03", title: "分享命运", desc: "保存结果，让朋友看看你的另一种人生" },
          ].map((item) => (
            <div key={item.step} className="flex gap-4 items-start">
              <span className="font-mono text-xs text-muted mt-1">
                {item.step}
              </span>
              <div>
                <p className="text-sm font-medium">{item.title}</p>
                <p className="text-xs text-muted mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="max-w-md w-full">
        <a
          href="/api/auth/login"
          className="block w-full py-3 border-2 border-foreground text-center font-mono text-sm tracking-wider hover:bg-foreground hover:text-background transition-colors"
        >
          连接 SecondMe 开始
        </a>
      </div>

      {/* 底部 */}
      <footer className="absolute bottom-6 text-xs text-muted font-mono">
        powered by SecondMe API
      </footer>
    </div>
  );
}
