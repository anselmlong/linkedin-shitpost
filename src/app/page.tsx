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
      setLoadingMessage(LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)]);
    }, 2000);
    return () => clearInterval(interval);
  }, [isLoading]);

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
    setUsedPrompt(prompt);

    try {
      const fd = new FormData();
      fd.append("prompt", prompt);

      const res = await fetch("/api/generate", { method: "POST", body: fd });
      const data = await res.json();

      console.log("[page] Response status:", res.status);
      console.log("[page] Response data:", data);

      if (!res.ok) throw new Error(data.error || "Generation failed");

      incrementUsage();
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
    <div className="min-h-screen bg-[#F3F2EF]">
      {/* LinkedIn-style nav */}
      <header className="bg-white border-b border-[#E0DFDC] sticky top-0 z-10 shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
        <div className="max-w-3xl mx-auto px-4 h-12 flex items-center gap-1">
          <span className="text-sm font-semibold text-[#191919]">sh</span>
          <div className="w-7 h-7 bg-[#0A66C2] rounded flex items-center justify-center flex-shrink-0">
            <span className="text-white font-extrabold text-base leading-none">it</span>
          </div>
          <span className="text-sm font-semibold text-[#191919]">post</span>
          <button
            onClick={() => setModalMode('voluntary')}
            className="text-xs font-semibold text-[#0A66C2] border border-[#0A66C2] rounded-full px-3 py-1 hover:bg-[#EEF3FB] transition-colors flex-shrink-0 ml-auto"
          >
            Support
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        <InputPanel onGenerate={handleGenerate} isLoading={isLoading} />

        {thankYou && (
          <div className="bg-[#EEF3FB] border border-[#0A66C2]/30 rounded-lg p-3 text-sm text-[#0A66C2] text-center">
            you&apos;re a legend, genuinely thank you 🙏 you&apos;ve got unlimited generations for 30 days.
          </div>
        )}

        {error && (
          <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-lg p-4 text-sm text-[#991B1B]">
            <strong>Error:</strong> {error}
          </div>
        )}

        {isLoading && (
          <div className="space-y-4">
            <p className="text-center text-[#666] text-xs animate-pulse py-2">
              {loadingMessage}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="bg-white border border-[#E0DFDC] rounded-lg overflow-hidden">
                  <div className="h-8 bg-[#F3F2EF] animate-pulse" />
                  <div className="p-4 space-y-3">
                    <div className="flex gap-3 items-center">
                      <div className="w-10 h-10 rounded-full bg-[#E0DFDC] animate-pulse flex-shrink-0" />
                      <div className="space-y-2 flex-1">
                        <div className="h-4 bg-[#E0DFDC] animate-pulse rounded w-1/4" />
                        <div className="h-3 bg-[#E0DFDC] animate-pulse rounded w-2/5" />
                      </div>
                    </div>
                    <div className="h-4 bg-[#E0DFDC] animate-pulse rounded" />
                    <div className="h-4 bg-[#E0DFDC] animate-pulse rounded w-4/5" />
                    <div className="h-4 bg-[#E0DFDC] animate-pulse rounded w-3/5" />
                    <div className="h-4 bg-[#E0DFDC] animate-pulse rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!isLoading && posts.length > 0 && (
          <div className="space-y-6">
            {usedPrompt && (
              <p className="text-center text-[#666] text-xs italic">
                &ldquo;{usedPrompt}&rdquo;
              </p>
            )}

            <section className="space-y-3">
              <p className="text-[10px] font-bold text-[#666] uppercase tracking-wide">
                All 6 Agents
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </section>
          </div>
        )}

        {!isLoading && posts.length === 0 && (
          <div className="space-y-2 py-16">
            <p className="text-center text-[#191919] text-2xl font-extrabold">
              Your career depends on this.
            </p>
            <p className="text-center text-[#666] text-sm">
              Actually no, please don't post these on LinkedIn.
            </p>
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
