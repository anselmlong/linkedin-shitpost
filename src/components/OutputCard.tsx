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
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">("idle");
  const [liked, setLiked] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [shareState, setShareState] = useState<"idle" | "working" | "copied" | "error">("idle");

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(post);
      setCopyState("copied");
    } catch {
      setCopyState("error");
    }
    setTimeout(() => setCopyState("idle"), 1500);
  };

  const handleShare = async () => {
    if (shareState === "working") return;
    setShareState("working");
    try {
      const res = await fetch("/api/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ post, pattern }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      await navigator.clipboard.writeText(`${window.location.origin}${data.url}`);
      setShareState("copied");
    } catch {
      setShareState("error");
    }
    setTimeout(() => setShareState("idle"), 2000);
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
    <article
      aria-label={`Post by ${agent.fakeName}`}
      className="bg-white border border-li-border rounded-lg overflow-hidden"
    >
      {/* Post header */}
      <div className="px-4 pt-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2.5">
            <div className="relative flex-shrink-0">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-xl"
                style={{ background: agent.avatarGradient }}
                aria-hidden="true"
              >
                {agent.emoji}
              </div>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1 flex-wrap">
                <span className="text-sm font-semibold text-li-text leading-tight">
                  {agent.fakeName}
                </span>
                <span className="text-xs text-li-muted font-normal" aria-label="1st degree connection">• 1st</span>
              </div>
              <div className="text-xs text-li-muted leading-tight mt-0.5 line-clamp-2">
                {agent.fakeTitle}
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-xs text-li-muted">{agent.timeAgo}</span>
                <span className="text-li-muted text-xs" aria-hidden="true">•</span>
                <svg className="text-li-muted" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" role="img" aria-label="Visible to anyone">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 flex-shrink-0 mt-0.5">
            <button type="button" className="hit-area text-xs font-semibold text-li-blue hover:bg-li-blue-soft border border-li-blue rounded-full px-3 h-7 transition-colors leading-tight">
              + Follow
            </button>
            <button type="button" aria-label="More actions" className="hit-area text-li-muted hover:bg-li-canvas w-7 h-7 flex items-center justify-center rounded-full transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <circle cx="5" cy="12" r="2" />
                <circle cx="12" cy="12" r="2" />
                <circle cx="19" cy="12" r="2" />
              </svg>
            </button>
          </div>
        </div>

        {/* Post body */}
        <div className="mt-3 text-sm text-li-text leading-[1.6] whitespace-pre-wrap break-words">
          {displayPost}
          {shouldTruncate && !expanded && (
            <>
              {"… "}
              <button
                type="button"
                onClick={() => setExpanded(true)}
                aria-expanded={false}
                aria-label="Show more of this post"
                className="hit-area text-li-muted font-semibold hover:text-li-blue hover:underline transition-colors"
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
          <span className="text-base leading-none" aria-hidden="true">👍</span>
          <span className="text-base leading-none -ml-1" aria-hidden="true">❤️</span>
          <span className="text-xs text-li-muted tabular-nums ml-0.5">
            <span className="sr-only">Reactions: </span>
            {formatCount(likeCount)}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-li-muted tabular-nums">
            {agent.comments} comments
          </span>
          <button
            type="button"
            onClick={handleCopy}
            aria-live="polite"
            className="hit-area text-xs font-semibold text-li-blue hover:underline underline-offset-2 transition-colors"
          >
            {copyState === "copied" ? "✓ Copied" : copyState === "error" ? "Copy failed" : "Copy post"}
          </button>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-li-border" />

      {/* Action buttons */}
      <div className="flex items-stretch px-1 py-0.5">
        <button
          type="button"
          onClick={() => setLiked(!liked)}
          aria-pressed={liked}
          className={`flex items-center justify-center gap-1.5 min-h-11 flex-1 rounded transition-colors text-xs font-semibold ${
            liked
              ? "text-li-blue hover:bg-li-blue-soft"
              : "text-li-muted hover:bg-li-canvas hover:text-li-text"
          }`}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill={liked ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
            className={`origin-[40%_70%] ${liked ? "animate-[likeNod_0.45s_cubic-bezier(0.16,1,0.3,1)]" : ""}`}
          >
            <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z" />
            <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
          </svg>
          <span>Like</span>
        </button>

        <button type="button" className="flex items-center justify-center gap-1.5 min-h-11 flex-1 rounded text-li-muted hover:bg-li-canvas hover:text-li-text transition-colors text-xs font-semibold">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <span>Comment</span>
        </button>

        <button type="button" className="flex items-center justify-center gap-1.5 min-h-11 flex-1 rounded text-li-muted hover:bg-li-canvas hover:text-li-text transition-colors text-xs font-semibold">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <polyline points="17 1 21 5 17 9" />
            <path d="M3 11V9a4 4 0 0 1 4-4h14" />
            <polyline points="7 23 3 19 7 15" />
            <path d="M21 13v2a4 4 0 0 1-4 4H3" />
          </svg>
          <span>Repost</span>
        </button>

        <button
          type="button"
          onClick={handleShare}
          aria-live="polite"
          className={`flex items-center justify-center gap-1.5 min-h-11 flex-1 rounded transition-colors text-xs font-semibold ${
            shareState === "copied"
              ? "text-li-blue hover:bg-li-blue-soft"
              : "text-li-muted hover:bg-li-canvas hover:text-li-text"
          }`}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
          <span>
            {shareState === "copied" ? "✓ Link copied"
              : shareState === "working" ? "Linking..."
              : shareState === "error" ? "No link, sorry"
              : "Send"}
          </span>
        </button>
      </div>
    </article>
  );
}
