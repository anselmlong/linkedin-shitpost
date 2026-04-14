"use client";

import { useState } from "react";

interface OutputCardProps {
  pattern: string;
  label: string;
  emoji: string;
  color: string;
  post: string;
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
  "lucius": {
    label: "Lucius",
    emoji: "🧉",
    avatarColor: "#14B8A6",
    fakeName: "you",
    fakeTitle: "singaporean at large",
  },
  "lowercase": {
    label: "Lowercase Tryhard",
    emoji: "✍️",
    avatarColor: "#10B981",
    fakeName: "you",
    fakeTitle: "vibes & growth",
  },
  "boomer": {
    label: "Boomer Trying",
    emoji: "👴",
    avatarColor: "#EC4899",
    fakeName: "you",
    fakeTitle: "learning from nephew",
  },
};

export default function OutputCard({ pattern, post }: OutputCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(post);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const agent = AGENT_CONFIG[pattern] ?? {
    label: pattern,
    emoji: "📝",
    avatarColor: "#C0BFBD",
    fakeName: "You",
    fakeTitle: "LinkedIn Member",
  };

  return (
    <div className="bg-white border border-[#E0DFDC] rounded-lg overflow-hidden h-full">
      <div className="flex items-center justify-between px-3 py-2 bg-[#F3F2EF] border-b border-[#E0DFDC]">
        <span className="text-xs font-semibold text-[#555]">
          {agent.emoji} {agent.label}
        </span>
      </div>
      <div className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-10 h-10 rounded-full flex-shrink-0"
            style={{ background: agent.avatarColor }}
          />
          <div>
            <div className="text-sm font-semibold text-[#191919]">{agent.fakeName}</div>
            <div className="text-xs text-[#666]">{agent.fakeTitle}</div>
          </div>
        </div>
        <p className="text-sm text-[#191919] leading-relaxed whitespace-pre-wrap mb-3">
          {post}
        </p>
        <div className="flex gap-4 border-t border-[#F3F2EF] pt-3 items-center">
          <span className="text-xs text-[#666]">👍</span>
          <span className="text-xs text-[#666]">💬</span>
          <button
            onClick={handleCopy}
            className="text-xs font-semibold text-[#0A66C2] ml-auto hover:underline hover:scale-105 inline-block transition-transform"
          >
            {copied ? "✓ Copied" : "Copy"}
          </button>
        </div>
      </div>
    </div>
  );
}
