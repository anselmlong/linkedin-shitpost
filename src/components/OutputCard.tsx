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

const AGENT_CONFIG: Record<string, {
  label: string;
  emoji: string;
  avatarColor: string;
  fakeName: string;
  fakeTitle: string;
}> = {
  "tech-bro": {
    label: "Tech Bro",
    emoji: "🎭",
    avatarColor: "#0A66C2",
    fakeName: "You",
    fakeTitle: "Disrupting disruption at Scale",
  },
  "absurdist": {
    label: "Absurdist",
    emoji: "🌀",
    avatarColor: "#8B5CF6",
    fakeName: "You",
    fakeTitle: "Existential Strategist",
  },
  "unhinged": {
    label: "Unhinged Hook",
    emoji: "😱",
    avatarColor: "#F59E0B",
    fakeName: "You",
    fakeTitle: "Thought Leader (self-appointed)",
  },
  "ragebait": {
    label: "Ragebait",
    emoji: "😤",
    avatarColor: "#EF4444",
    fakeName: "You",
    fakeTitle: "Contrarian at Large",
  },
  "lowercase": {
    label: "Lowercase Tryhard",
    emoji: "✍️",
    avatarColor: "#10B981",
    fakeName: "you",
    fakeTitle: "vibes & growth",
  },
};

const FEATURED_CONFIG: Record<string, {
  label: string;
  emoji: string;
  borderColor: string;
  accentColor: string;
  scoreLabel: string;
}> = {
  "directors_cut": {
    label: "Director's Cut",
    emoji: "🎬",
    borderColor: "#0A66C2",
    accentColor: "#0A66C2",
    scoreLabel: "Score",
  },
  "roast_mode": {
    label: "Roast Mode",
    emoji: "🔥",
    borderColor: "#B24020",
    accentColor: "#B24020",
    scoreLabel: "Cringe",
  },
};

export default function OutputCard({ pattern, post, score, isAiPick }: OutputCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(post);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (isAiPick) {
    const featured = FEATURED_CONFIG[pattern] ?? {
      label: pattern,
      emoji: "⭐",
      borderColor: "#0A66C2",
      accentColor: "#0A66C2",
      scoreLabel: "Score",
    };

    return (
      <div
        className="bg-white border border-[#E0DFDC] rounded-lg overflow-hidden"
        style={{ borderTop: `3px solid ${featured.borderColor}` }}
      >
        <div className="flex items-center justify-between px-3 py-2 border-b border-[#F3F2EF]">
          <span
            className="text-xs font-bold flex items-center gap-1"
            style={{ color: featured.accentColor }}
          >
            {featured.emoji} {featured.label}
          </span>
          {score !== undefined && (
            <span
              className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
              style={{
                color: featured.accentColor,
                background: featured.accentColor + "18",
              }}
            >
              {featured.scoreLabel}: {score.toFixed(1)}
            </span>
          )}
        </div>
        <div className="p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-[#E0DFDC] flex-shrink-0" />
            <div>
              <div className="text-xs font-semibold text-[#191919]">You</div>
              <div className="text-[10px] text-[#666]">LinkedIn Member • Just now</div>
            </div>
          </div>
          <p className="text-xs text-[#191919] leading-relaxed whitespace-pre-wrap mb-3">
            {post}
          </p>
          <div className="flex gap-4 border-t border-[#F3F2EF] pt-2 items-center">
            <span className="text-[10px] text-[#666]">👍 Like</span>
            <span className="text-[10px] text-[#666]">💬 Comment</span>
            <button
              onClick={handleCopy}
              className="text-[10px] font-semibold text-[#0A66C2] ml-auto hover:underline"
            >
              {copied ? "✓ Copied" : "Copy post"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const agent = AGENT_CONFIG[pattern] ?? {
    label: pattern,
    emoji: "📝",
    avatarColor: "#C0BFBD",
    fakeName: "You",
    fakeTitle: "LinkedIn Member",
  };

  return (
    <div className="bg-white border border-[#E0DFDC] rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#F3F2EF] border-b border-[#E0DFDC]">
        <span className="text-[10px] font-semibold text-[#555]">
          {agent.emoji} {agent.label}
        </span>
        {score !== undefined && (
          <span className="text-[10px] text-[#888]">{score.toFixed(1)} / 10</span>
        )}
      </div>
      <div className="p-3">
        <div className="flex items-center gap-2 mb-2">
          <div
            className="w-8 h-8 rounded-full flex-shrink-0"
            style={{ background: agent.avatarColor }}
          />
          <div>
            <div className="text-xs font-semibold text-[#191919]">{agent.fakeName}</div>
            <div className="text-[10px] text-[#666]">{agent.fakeTitle} • Just now</div>
          </div>
        </div>
        <p className="text-xs text-[#191919] leading-relaxed whitespace-pre-wrap mb-3">
          {post}
        </p>
        <div className="flex gap-4 border-t border-[#F3F2EF] pt-2 items-center">
          <span className="text-[10px] text-[#666]">👍 Like</span>
          <span className="text-[10px] text-[#666]">💬 Comment</span>
          <button
            onClick={handleCopy}
            className="text-[10px] font-semibold text-[#0A66C2] ml-auto hover:underline"
          >
            {copied ? "✓ Copied" : "Copy"}
          </button>
        </div>
      </div>
    </div>
  );
}
