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
  avatarGradient: string;
  fakeName: string;
  fakeTitle: string;
}> = {
  "tech-bro": {
    label: "Tech Bro",
    emoji: "🎓",
    avatarColor: "#0A66C2",
    avatarGradient: "linear-gradient(135deg, #0A66C2 0%, #004182 100%)",
    fakeName: "You",
    fakeTitle: "Founder @disrupting_things",
  },
  "tryhard": {
    label: "Tryhard",
    emoji: "🌟",
    avatarColor: "#8B5CF6",
    avatarGradient: "linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)",
    fakeName: "You",
    fakeTitle: "Chief Momentum Officer",
  },
  "unhinged": {
    label: "Unhinged",
    emoji: "🔥",
    avatarColor: "#F59E0B",
    avatarGradient: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
    fakeName: "You",
    fakeTitle: "Your attention is currency",
  },
  "singaporean": {
    label: "Lucius",
    emoji: "🍹",
    avatarColor: "#14B8A6",
    avatarGradient: "linear-gradient(135deg, #14B8A6 0%, #0D9488 100%)",
    fakeName: "you",
    fakeTitle: "fruits enthusiast",
  },
  "lowercase": {
    label: "Lowercase",
    emoji: "✨",
    avatarColor: "#10B981",
    avatarGradient: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
    fakeName: "you",
    fakeTitle: "posting from the void",
  },
  "anselm": {
    label: "Anselm",
    emoji: "💻",
    avatarColor: "#EC4899",
    avatarGradient: "linear-gradient(135deg, #EC4899 0%, #DB2777 100%)",
    fakeName: "Anselm",
    fakeTitle: "computing student",
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
    avatarGradient: "linear-gradient(135deg, #C0BFBD 0%, #A1A09E 100%)",
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
            className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center"
            style={{ background: agent.avatarGradient }}
          >
            <span className="text-white text-xs font-bold">{agent.emoji}</span>
          </div>
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
