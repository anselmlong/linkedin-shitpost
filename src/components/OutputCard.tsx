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
  avatarGradient: string;
  fakeName: string;
  fakeTitle: string;
  likes: number;
  comments: number;
  timeAgo: string;
}> = {
  "tech-bro": {
    label: "Tech Bro",
    emoji: "🎓",
    avatarGradient: "linear-gradient(135deg, #0A66C2 0%, #004182 100%)",
    fakeName: "Tech Bro",
    fakeTitle: "Founder @disrupting_things • Building things that scale",
    likes: 847,
    comments: 143,
    timeAgo: "2h",
  },
  "tryhard": {
    label: "Tryhard",
    emoji: "🌟",
    avatarGradient: "linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)",
    fakeName: "Tryhard",
    fakeTitle: "Chief Momentum Officer • Top Voice in Hustle",
    likes: 2100,
    comments: 89,
    timeAgo: "4h",
  },
  "unhinged": {
    label: "Unhinged",
    emoji: "🔥",
    avatarGradient: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
    fakeName: "Unhinged",
    fakeTitle: "Your attention is currency",
    likes: 312,
    comments: 567,
    timeAgo: "1h",
  },
  "singaporean": {
    label: "Lucius",
    emoji: "🍹",
    avatarGradient: "linear-gradient(135deg, #14B8A6 0%, #0D9488 100%)",
    fakeName: "Singaporean Uncle",
    fakeTitle: "fruits enthusiast",
    likes: 156,
    comments: 23,
    timeAgo: "6h",
  },
  "lowercase": {
    label: "Lowercase",
    emoji: "✨",
    avatarGradient: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
    fakeName: "tryhard but lowercase",
    fakeTitle: "posting from the void",
    likes: 89,
    comments: 45,
    timeAgo: "3h",
  },
  "anselm": {
    label: "Anselm",
    emoji: "💻",
    avatarGradient: "linear-gradient(135deg, #EC4899 0%, #DB2777 100%)",
    fakeName: "Anselm",
    fakeTitle: "computing student",
    likes: 234,
    comments: 31,
    timeAgo: "5h",
  },
};

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toString();
}

const TRUNCATE_LENGTH = 280;

export default function OutputCard({ pattern, post }: OutputCardProps) {
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(post);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const agent = AGENT_CONFIG[pattern] ?? {
    label: pattern,
    emoji: "📝",
    avatarGradient: "linear-gradient(135deg, #C0BFBD 0%, #A1A09E 100%)",
    fakeName: "You",
    fakeTitle: "LinkedIn Member",
    likes: 42,
    comments: 7,
    timeAgo: "1h",
  };

  const shouldTruncate = post.length > TRUNCATE_LENGTH;
  const displayPost = shouldTruncate && !expanded ? post.slice(0, TRUNCATE_LENGTH) : post;
  const likeCount = agent.likes + (liked ? 1 : 0);

  return (
    <div className="bg-white border border-[#E0DFDC] rounded-lg overflow-hidden">
      {/* Post header */}
      <div className="px-4 pt-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2.5">
            <div className="relative flex-shrink-0">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-xl"
                style={{ background: agent.avatarGradient }}
              >
                {agent.emoji}
              </div>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1 flex-wrap">
                <span className="text-sm font-semibold text-[#191919] hover:text-[#0A66C2] cursor-pointer leading-tight">
                  {agent.fakeName}
                </span>
                <span className="text-xs text-[#999] font-normal">• 1st</span>
              </div>
              <div className="text-xs text-[#666] leading-tight mt-0.5 line-clamp-2">
                {agent.fakeTitle}
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-xs text-[#666]">{agent.timeAgo}</span>
                <span className="text-[#666] text-xs">•</span>
                <svg className="text-[#666]" width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 flex-shrink-0 mt-0.5">
            <button className="text-xs font-semibold text-[#0A66C2] hover:bg-[#EEF3FB] border border-[#0A66C2] rounded-full px-3 py-1 transition-colors leading-tight">
              + Follow
            </button>
            <button className="text-[#666] hover:bg-[#F3F2EF] p-1.5 rounded-full transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="5" cy="12" r="2" />
                <circle cx="12" cy="12" r="2" />
                <circle cx="19" cy="12" r="2" />
              </svg>
            </button>
          </div>
        </div>

        {/* Post body */}
        <div className="mt-3 text-sm text-[#191919] leading-[1.6] whitespace-pre-wrap break-words">
          {displayPost}
          {shouldTruncate && !expanded && (
            <>
              {"… "}
              <button
                onClick={() => setExpanded(true)}
                className="text-[#666] font-semibold hover:text-[#0A66C2] transition-colors"
              >
                more
              </button>
            </>
          )}
        </div>
      </div>

      {/* Reaction counts row */}
      <div className="px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <span className="text-base leading-none">👍</span>
          <span className="text-base leading-none -ml-1">❤️</span>
          <span className="text-xs text-[#666] hover:text-[#0A66C2] hover:underline cursor-pointer ml-0.5">
            {formatCount(likeCount)}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-[#666] hover:underline cursor-pointer">
            {agent.comments} comments
          </span>
          <button
            onClick={handleCopy}
            className="text-xs font-semibold text-[#0A66C2] hover:underline transition-colors"
          >
            {copied ? "✓ Copied" : "Copy post"}
          </button>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-[#E0DFDC]" />

      {/* Action buttons */}
      <div className="flex items-stretch px-1 py-0.5">
        <button
          onClick={() => setLiked(!liked)}
          className={`flex items-center justify-center gap-1.5 py-2.5 flex-1 rounded transition-colors text-xs font-semibold ${
            liked
              ? "text-[#0A66C2] hover:bg-[#EEF3FB]"
              : "text-[#666] hover:bg-[#F3F2EF] hover:text-[#191919]"
          }`}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill={liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
            <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z" />
            <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
          </svg>
          <span>Like</span>
        </button>

        <button className="flex items-center justify-center gap-1.5 py-2.5 flex-1 rounded text-[#666] hover:bg-[#F3F2EF] hover:text-[#191919] transition-colors text-xs font-semibold">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <span>Comment</span>
        </button>

        <button className="flex items-center justify-center gap-1.5 py-2.5 flex-1 rounded text-[#666] hover:bg-[#F3F2EF] hover:text-[#191919] transition-colors text-xs font-semibold">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="17 1 21 5 17 9" />
            <path d="M3 11V9a4 4 0 0 1 4-4h14" />
            <polyline points="7 23 3 19 7 15" />
            <path d="M21 13v2a4 4 0 0 1-4 4H3" />
          </svg>
          <span>Repost</span>
        </button>

        <button className="flex items-center justify-center gap-1.5 py-2.5 flex-1 rounded text-[#666] hover:bg-[#F3F2EF] hover:text-[#191919] transition-colors text-xs font-semibold">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
          <span>Send</span>
        </button>
      </div>
    </div>
  );
}
