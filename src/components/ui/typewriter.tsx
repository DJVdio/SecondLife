"use client";

interface TypewriterProps {
  text: string;
  isStreaming: boolean;
}

export function Typewriter({ text, isStreaming }: TypewriterProps) {
  return (
    <span>
      {text}
      {isStreaming && <span className="cursor-blink" />}
    </span>
  );
}
