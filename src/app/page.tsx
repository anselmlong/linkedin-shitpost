"use client";

import { useState, useEffect } from "react";
import InputPanel from "@/components/InputPanel";
import OutputCard from "@/components/OutputCard";
import type { GeneratedPost } from "@/lib/agents";

const LOADING_MESSAGES = [
  "5 agents brainstorming your humiliation...",
  "Teaching AI to roast people...",
  "Generating chaos...",
  "Consulting the dark comedy council...",
  "Distilling pure cringe...",
  "Brewing the perfect shitpost...",
];

interface Synthesis {
  directors_cut: string;
  roast_mode: string;
}

export default function Home() {
  const [posts, setPosts] = useState<GeneratedPost[]>([]);
  const [synthesis, setSynthesis] = useState<Synthesis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usedPrompt, setUsedPrompt] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState(LOADING_MESSAGES[0]);

  useEffect(() => {
    if (!isLoading) return;
    const interval = setInterval(() => {
      setLoadingMessage(LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)]);
    }, 2000);
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleGenerate = async (prompt: string) => {
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

      setPosts(data.posts);
      setSynthesis(data.synthesis);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F2EF]">
      {/* LinkedIn-style nav */}
      <header className="bg-white border-b border-[#E0DFDC] sticky top-0 z-10 shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
        <div className="max-w-3xl mx-auto px-4 h-12 flex items-center gap-3">
          <div className="w-7 h-7 bg-[#0A66C2] rounded flex items-center justify-center flex-shrink-0">
            <span className="text-white font-extrabold text-base leading-none">in</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm font-semibold text-[#191919]">Shitpost Generator</span>
            <span className="text-xs text-[#666]">— don&apos;t actually post these</span>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        <InputPanel onGenerate={handleGenerate} isLoading={isLoading} />

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
            {/* Featured skeletons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[0, 1].map((i) => (
                <div key={i} className="bg-white border border-[#E0DFDC] rounded-lg overflow-hidden" style={{ borderTop: "3px solid #E0DFDC" }}>
                  <div className="h-8 bg-[#F3F2EF] animate-pulse" />
                  <div className="p-3 space-y-2">
                    <div className="flex gap-2 items-center">
                      <div className="w-8 h-8 rounded-full bg-[#E0DFDC] animate-pulse flex-shrink-0" />
                      <div className="space-y-1 flex-1">
                        <div className="h-2.5 bg-[#E0DFDC] animate-pulse rounded w-1/3" />
                        <div className="h-2 bg-[#E0DFDC] animate-pulse rounded w-1/2" />
                      </div>
                    </div>
                    <div className="h-2.5 bg-[#E0DFDC] animate-pulse rounded" />
                    <div className="h-2.5 bg-[#E0DFDC] animate-pulse rounded w-4/5" />
                    <div className="h-2.5 bg-[#E0DFDC] animate-pulse rounded w-3/5" />
                  </div>
                </div>
              ))}
            </div>
            {/* Agent skeletons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="bg-white border border-[#E0DFDC] rounded-lg overflow-hidden">
                  <div className="h-6 bg-[#F3F2EF] animate-pulse" />
                  <div className="p-3 space-y-2">
                    <div className="flex gap-2 items-center">
                      <div className="w-8 h-8 rounded-full bg-[#E0DFDC] animate-pulse flex-shrink-0" />
                      <div className="space-y-1 flex-1">
                        <div className="h-2.5 bg-[#E0DFDC] animate-pulse rounded w-1/4" />
                        <div className="h-2 bg-[#E0DFDC] animate-pulse rounded w-2/5" />
                      </div>
                    </div>
                    <div className="h-2.5 bg-[#E0DFDC] animate-pulse rounded" />
                    <div className="h-2.5 bg-[#E0DFDC] animate-pulse rounded w-3/4" />
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

            {synthesis && (
              <section className="space-y-3">
                <p className="text-[10px] font-bold text-[#666] uppercase tracking-wide">
                  ⭐ AI Picks
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <OutputCard
                    pattern="directors_cut"
                    label="Director's Cut"
                    emoji="🎬"
                    color=""
                    post={synthesis.directors_cut}
                    isAiPick
                  />
                  <OutputCard
                    pattern="roast_mode"
                    label="Roast Mode"
                    emoji="🔥"
                    color=""
                    post={synthesis.roast_mode}
                    isAiPick
                  />
                </div>
              </section>
            )}

            <section className="space-y-3">
              <p className="text-[10px] font-bold text-[#666] uppercase tracking-wide">
                All 5 Agents
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {posts.map((post) => (
                  <OutputCard
                    key={post.pattern}
                    pattern={post.pattern}
                    label={post.pattern}
                    emoji=""
                    color=""
                    post={post.post}
                    score={post.score}
                  />
                ))}
              </div>
            </section>

            <p className="text-center text-[#666] text-[10px] pt-2 border-t border-[#E0DFDC]">
              scores are AI-evaluated on humor, virality, originality &amp; cringe authenticity
            </p>
          </div>
        )}

        {!isLoading && posts.length === 0 && (
          <p className="text-center text-[#666] text-sm py-16">
            Enter a topic above and hit <strong>Shitpost</strong>.
          </p>
        )}
      </main>
    </div>
  );
}
