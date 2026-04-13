"use client";

import { useState } from "react";

interface OutputCardProps {
  pattern: string;
  label: string;
  emoji: string;
  color: string;
  post: string;
  score?: number;
  isAiPick?: boolean;
}

const PATTERN_LABELS: Record<string, { label: string; emoji: string; color: string }> = {
  "tech-bro": { label: "Tech Bro", emoji: "🎭", color: "from-blue-600 to-cyan-600" },
  "absurdist": { label: "Absurdist", emoji: "🌀", color: "from-purple-600 to-pink-600" },
  "unhinged": { label: "Unhinged Hook", emoji: "😱", color: "from-red-600 to-orange-600" },
  "ragebait": { label: "Ragebait", emoji: "😤", color: "from-yellow-600 to-red-600" },
  "lowercase": { label: "Lowercase Tryhard", emoji: "🧑‍💻", color: "from-green-600 to-teal-600" },
  "directors_cut": { label: "Director's Cut", emoji: "⭐", color: "from-amber-500 to-yellow-400" },
  "roast_mode": { label: "Roast Mode", emoji: "🔥", color: "from-orange-500 to-red-500" },
};

export default function OutputCard({
  pattern,
  post,
  score,
  isAiPick,
}: OutputCardProps) {
  const [copied, setCopied] = useState(false);
  const info = PATTERN_LABELS[pattern] ?? { label: pattern, emoji: "📝", color: "from-gray-600 to-gray-500" };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(post);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`
        relative bg-gray-800 border border-gray-700 rounded-xl overflow-hidden
        ${isAiPick ? "ring-2 ring-amber-400/50" : ""}
      `}
    >
      {/* Header */}
      <div className={`bg-gradient-to-r ${info.color} px-4 py-2 flex items-center justify-between`}>
        <div className="flex items-center gap-2">
          <span className="text-lg">{info.emoji}</span>
          <span className="font-semibold text-white text-sm">{info.label}</span>
          {isAiPick && (
            <span className="text-xs bg-black/30 text-amber-200 px-2 py-0.5 rounded-full">
              AI pick
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {score !== undefined && (
            <span className="text-xs font-mono text-white/80">
              {score.toFixed(1)}
            </span>
          )}
          <button
            onClick={handleCopy}
            className="text-white/80 hover:text-white text-xs font-medium bg-black/30 hover:bg-black/40 px-3 py-1 rounded-lg transition-colors"
          >
            {copied ? "✓ copied" : "copy"}
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="p-4">
        <p className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap">
          {post}
        </p>
      </div>
    </div>
  );
}
