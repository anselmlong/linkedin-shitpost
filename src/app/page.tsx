"use client";

import { useState, useEffect } from "react";
import InputPanel from "@/components/InputPanel";
import OutputCard from "@/components/OutputCard";
import type { GeneratedPost } from "@/lib/agents";
import DonationModal, { type ModalMode } from "@/components/DonationModal";
import { isSoftLimitHit, hasSeenModalThisSession, markModalSeen, incrementUsage } from "@/lib/usageTracker";

const LOADING_MESSAGES = [
  "Thinking out of the box...",
  "6 agents brainstorming your humiliation...",
  "Teaching AI to roast people...",
  "Generating chaos...",
  "Brewing the perfect shitpost...",
  "Consulting professional cringe practitioners...",
  "Thought leadering...",
];

export default function Home() {
  const [posts, setPosts] = useState<GeneratedPost[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usedPrompt, setUsedPrompt] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState(LOADING_MESSAGES[0]);
  const [modalMode, setModalMode] = useState<ModalMode | null>(null);
  const [pendingPrompt, setPendingPrompt] = useState<string | null>(null);
  const [thankYou, setThankYou] = useState(false);

  useEffect(() => {
    if (!isLoading) return;
    const interval = setInterval(() => {
      // Pick a different line each tick so the message never appears to stall.
      setLoadingMessage((current) => {
        const others = LOADING_MESSAGES.filter((m) => m !== current);
        return others[Math.floor(Math.random() * others.length)];
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [isLoading]);

  // Generation takes a while, so people wander off to another tab. When the posts land
  // while they're away, badge the tab title the way LinkedIn does with unread notifications.
  useEffect(() => {
    if (posts.length === 0 || !document.hidden) return;
    const baseTitle = document.title.replace(/^\(\d+\)\s*/, "");
    document.title = `(${posts.length}) ${baseTitle}`;
    const clear = () => {
      if (document.hidden) return;
      document.title = baseTitle;
      document.removeEventListener("visibilitychange", clear);
    };
    document.addEventListener("visibilitychange", clear);
    return () => {
      document.removeEventListener("visibilitychange", clear);
      document.title = baseTitle;
    };
  }, [posts]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const donated = params.get('donated');
    const sessionId = params.get('session_id');

    if (donated !== 'true' || !sessionId) return;

    // Clear params from URL without page reload
    window.history.replaceState({}, '', '/');

    fetch('/api/verify-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setThankYou(true);
      })
      .catch(() => { /* silent fail */ });
  }, []);

  const handleGenerate = async (prompt: string) => {
    // Show soft wall if limit hit and user hasn't dismissed this session
    if (isSoftLimitHit() && !hasSeenModalThisSession()) {
      setPendingPrompt(prompt);
      setModalMode('soft');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const fd = new FormData();
      fd.append("prompt", prompt);

      const res = await fetch("/api/generate", { method: "POST", body: fd });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Generation failed");

      incrementUsage();
      // Only relabel once new posts land, so a failed run keeps the previous posts under their own prompt.
      setUsedPrompt(prompt);
      setPosts(data.posts);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBypass = () => {
    markModalSeen();
    setModalMode(null);
    if (pendingPrompt) {
      const p = pendingPrompt;
      setPendingPrompt(null);
      handleGenerate(p);
    }
  };

  return (
    <div className="min-h-screen bg-li-canvas">
      {/* LinkedIn-style nav */}
      <header className="bg-white border-b border-li-border sticky top-0 z-10 shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
        <div className="max-w-xl mx-auto px-4 h-12 flex items-center">
          <h1 className="flex items-center gap-1">
            <span className="sr-only">LinkedIn Shitpost Generator</span>
            <span aria-hidden="true" className="text-sm font-semibold text-li-text">sh</span>
            <span aria-hidden="true" className="w-7 h-7 bg-li-blue rounded flex items-center justify-center flex-shrink-0 text-white font-extrabold text-base leading-none">
              it
            </span>
            <span aria-hidden="true" className="text-sm font-semibold text-li-text">post</span>
          </h1>
          <button
            type="button"
            onClick={() => setModalMode('voluntary')}
            className="hit-area text-xs font-semibold text-li-blue border border-li-blue rounded-full px-3 h-7 hover:bg-li-blue-soft active:bg-li-blue/15 transition-colors flex-shrink-0 ml-auto"
          >
            Support
          </button>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 py-6 space-y-4">
        <InputPanel onGenerate={handleGenerate} isLoading={isLoading} />

        {thankYou && (
          <div role="status" className="bg-li-blue-soft border border-li-blue/30 rounded-lg px-4 py-3 text-sm text-li-blue-dark text-center">
            you&apos;re a legend, genuinely thank you 🙏 you&apos;ve got unlimited generations for 30 days.
          </div>
        )}

        {error && (
          <div role="alert" className="bg-li-danger-soft border border-li-danger-border rounded-lg px-4 py-3 text-sm text-li-danger">
            <strong>Error:</strong> {error}
          </div>
        )}

        <p role="status" className="sr-only">
          {isLoading ? "Generating posts…" : posts.length > 0 ? `${posts.length} posts generated.` : ""}
        </p>

        {isLoading && (
          <div className="space-y-2" aria-hidden="true">
            <p className="text-center text-li-muted text-xs animate-pulse py-2">
              {loadingMessage}
            </p>
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="bg-white border border-li-border rounded-lg overflow-hidden">
                <div className="px-4 pt-3 pb-2">
                  <div className="flex gap-2.5 items-start">
                    <div className="w-12 h-12 rounded-full bg-li-border animate-pulse flex-shrink-0" />
                    <div className="space-y-2 flex-1 pt-1">
                      <div className="h-3.5 bg-li-border animate-pulse rounded w-24" />
                      <div className="h-3 bg-li-border animate-pulse rounded w-40" />
                      <div className="h-3 bg-li-border animate-pulse rounded w-12" />
                    </div>
                  </div>
                  <div className="mt-3 space-y-2">
                    <div className="h-3.5 bg-li-border animate-pulse rounded" />
                    <div className="h-3.5 bg-li-border animate-pulse rounded w-11/12" />
                    <div className="h-3.5 bg-li-border animate-pulse rounded w-4/5" />
                    <div className="h-3.5 bg-li-border animate-pulse rounded w-3/5" />
                  </div>
                </div>
                <div className="border-t border-li-border mx-0 mt-2" />
                <div className="flex gap-1 px-2 py-1.5">
                  {[0, 1, 2, 3].map((j) => (
                    <div key={j} className="h-8 bg-li-canvas animate-pulse rounded flex-1" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && posts.length > 0 && (
          <div className="space-y-3">
            {usedPrompt && (
              <p className="flex items-center gap-3 text-li-muted text-xs italic before:h-px before:flex-1 before:bg-li-border-strong after:h-px after:flex-1 after:bg-li-border-strong">
                <span className="max-w-[80%] text-center line-clamp-2 break-words">&ldquo;{usedPrompt}&rdquo;</span>
              </p>
            )}

            <div className="space-y-2">
              {posts.map((post, i) => (
                <div
                  key={post.pattern}
                  className="opacity-0 animate-[fadeIn_0.4s_ease-out_forwards]"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <OutputCard
                    pattern={post.pattern}
                    label={post.pattern}
                    emoji=""
                    color=""
                    post={post.post}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {!isLoading && posts.length === 0 && (
          <div className="space-y-2 py-16">
            <h2 className="text-center text-li-text text-2xl font-extrabold text-balance">
              Your career depends on this.
            </h2>
            <p className="text-center text-li-muted text-sm">
              Actually no, please don&apos;t post these on LinkedIn.
            </p>
            <video
              className="mx-auto mt-8 w-full max-w-xl aspect-video rounded-lg border border-li-border bg-white"
              width={1280}
              height={720}
              aria-label="Launch video"
              src="/launch.mp4"
              poster="/launch.jpg"
              controls
              playsInline
              preload="none"
            />
          </div>
        )}
      </main>

      {modalMode && (
        <DonationModal
          mode={modalMode}
          onClose={() => setModalMode(null)}
          onBypass={modalMode === 'soft' ? handleBypass : undefined}
        />
      )}
    </div>
  );
}
