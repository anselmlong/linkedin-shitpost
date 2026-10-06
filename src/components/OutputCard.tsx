"use client";

import { useId, useState } from "react";
import { DefaultAvatar } from "@/components/InputPanel";

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

// The feed's one-tap replies: engagement without the inconvenience of an opinion.
const SUGGESTED_COMMENTS = ["Great insights!", "Agree 💯", "Thanks for sharing", "Congrats!"];

// Small round reaction badges, drawn to match the feed's own like / love icons.
function ReactionBadge({ kind, className = "" }: { kind: "like" | "love"; className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" className={`rounded-full ring-2 ring-white ${className}`}>
      <circle cx="8" cy="8" r="8" fill={kind === "like" ? "#378FE9" : "#DF704D"} />
      {kind === "like" ? (
        <path d="M8.9 7.1V5.3a1.1 1.1 0 0 0-1.1-1.1L6.1 7.6v4.3h4.2a.8.8 0 0 0 .8-.65l.5-3.25a.8.8 0 0 0-.8-.9zM5.4 11.9H4.5a.5.5 0 0 1-.5-.5V8.1a.5.5 0 0 1 .5-.5h.9z" fill="#fff" />
      ) : (
        <path d="M8 11.8 4.6 8.6a2 2 0 0 1 2.8-2.9l.6.6.6-.6a2 2 0 0 1 2.8 2.9z" fill="#fff" />
      )}
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="inline-block mr-1 align-[-1px]">
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  );
}

export default function OutputCard({ pattern, post }: OutputCardProps) {
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">("idle");
  const [liked, setLiked] = useState(false);
  const [following, setFollowing] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [myComment, setMyComment] = useState<string | null>(null);
  const commentsId = useId();
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
  // Cut at the last word boundary so "more" never lands mid-word or mid-hashtag.
  const truncated = post.slice(0, TRUNCATE_LENGTH).replace(/\s+\S*$/, "");
  const displayPost = shouldTruncate && !expanded ? truncated : post;

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
              <div className="text-sm leading-tight">
                <span className="font-semibold text-li-text">{agent.fakeName}</span>{"\u00A0"}
                <span className="text-xs text-li-muted whitespace-nowrap" aria-label="1st degree connection">• 1st</span>
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
            {/* You can actually follow them. You will regret it, like on the real thing. */}
            <button
              type="button"
              onClick={() => setFollowing(!following)}
              aria-pressed={following}
              aria-label={`Follow ${agent.fakeName}`}
              className={`hit-area text-xs font-semibold rounded-full px-2 sm:px-3 h-7 border transition-colors leading-tight whitespace-nowrap ${
                following
                  ? "text-li-muted border-transparent hover:bg-li-canvas hover:text-li-text"
                  : "text-li-blue border-transparent sm:border-li-blue hover:bg-li-blue-soft"
              }`}
            >
              {following ? (
                <span key="following" className="inline-flex items-center animate-[settleIn_0.25s_cubic-bezier(0.16,1,0.3,1)]">
                  <CheckIcon />Following
                </span>
              ) : (
                "+ Follow"
              )}
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
      {/* Wraps as two whole groups on narrow phones instead of breaking "89 comments" mid-phrase. */}
      <div className="px-4 pt-3 pb-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
        <div className="flex items-center gap-1">
          <span className="flex" aria-hidden="true">
            <ReactionBadge kind="like" />
            <ReactionBadge kind="love" className="-ml-1" />
          </span>
          {/* Liking reads the way the feed says it: "You and 847 others". */}
          <span className="text-xs text-li-muted tabular-nums ml-0.5 whitespace-nowrap">
            <span className="sr-only">Reactions: </span>
            {liked ? (
              <span key="liked" className="inline-block animate-[settleIn_0.25s_cubic-bezier(0.16,1,0.3,1)]">
                You and {formatCount(agent.likes)} others
              </span>
            ) : (
              formatCount(agent.likes)
            )}
          </span>
        </div>
        <div className="flex items-center gap-3 ml-auto whitespace-nowrap">
          <span className="text-xs text-li-muted tabular-nums">
            {agent.comments + (myComment ? 1 : 0)} comments
          </span>
          <button
            type="button"
            onClick={handleCopy}
            aria-live="polite"
            className="hit-area text-xs font-semibold text-li-blue hover:underline underline-offset-2 transition-colors"
          >
            {copyState === "copied" ? <><CheckIcon />Copied</>
              : copyState === "error" ? "Copy failed"
              : "Copy post"}
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

        <button
          type="button"
          onClick={() => setCommentsOpen(!commentsOpen)}
          aria-expanded={commentsOpen}
          aria-controls={commentsId}
          className="flex items-center justify-center gap-1.5 min-h-11 flex-1 rounded text-li-muted hover:bg-li-canvas hover:text-li-text transition-colors text-xs font-semibold"
        >
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
            {shareState === "copied" ? <><CheckIcon />Link copied</>
              : shareState === "working" ? "Linking..."
              : shareState === "error" ? "No link, sorry"
              : "Send"}
          </span>
        </button>
      </div>

      {commentsOpen && (
        <div id={commentsId} aria-live="polite" className="px-4 pb-3 pt-1">
          {myComment ? (
            <div className="flex items-start gap-2 animate-[settleIn_0.25s_cubic-bezier(0.16,1,0.3,1)]">
              <DefaultAvatar className="w-8! h-8!" />
              <div className="min-w-0 bg-li-canvas rounded-lg rounded-tl-none px-3 py-2">
                <p className="text-xs leading-tight">
                  <span className="font-semibold text-li-text">You</span>
                  <span className="text-li-muted"> • now</span>
                </p>
                <p className="text-sm text-li-text mt-1 break-words">{myComment}</p>
              </div>
            </div>
          ) : (
            <div role="group" aria-label="Suggested comments" className="flex flex-wrap gap-2 animate-[settleIn_0.25s_cubic-bezier(0.16,1,0.3,1)]">
              {SUGGESTED_COMMENTS.map((text) => (
                <button
                  key={text}
                  type="button"
                  onClick={() => setMyComment(text)}
                  className="h-8 px-3 rounded-full border border-li-border-strong text-xs font-semibold text-li-muted hover:bg-li-canvas hover:text-li-text hover:shadow-[inset_0_0_0_1px_var(--color-li-border-strong)] transition-[background-color,box-shadow,color]"
                >
                  {text}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </article>
  );
}
