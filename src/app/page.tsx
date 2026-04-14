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
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-3">
          <span className="text-2xl">💀</span>
          <div>
            <h1 className="font-bold text-lg text-white">
              LinkedIn Shitpost Generator
            </h1>
            <p className="text-xs text-gray-400">
              5 agents. 2 AI-curated picks. Pick your fighter.
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10 space-y-12">
        <section>
          <InputPanel onGenerate={handleGenerate} isLoading={isLoading} />
        </section>

        {error && (
          <div className="bg-red-900/30 border border-red-800 rounded-lg p-4 text-red-300 text-sm">
            <strong>Error:</strong> {error}
          </div>
        )}

        {isLoading && (
          <section className="space-y-6">
            <p className="text-center text-gray-500 text-sm animate-pulse">
              {loadingMessage}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-gray-800/50 border border-gray-700/50 rounded-xl overflow-hidden animate-pulse"
                >
                  <div className="h-12 bg-gray-700/60 rounded-t-xl" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-700/60 rounded w-3/4" />
                    <div className="h-4 bg-gray-700/40 rounded" />
                    <div className="h-4 bg-gray-700/40 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {!isLoading && posts.length > 0 && (
          <div className="space-y-10">
            {usedPrompt && (
              <div className="text-center pb-2">
                <p className="text-gray-500 text-xs italic">
                  &ldquo;{usedPrompt}&rdquo;
                </p>
              </div>
            )}

            {synthesis && (
              <section className="space-y-4">
                <h2 className="text-base font-semibold text-amber-400 flex items-center gap-2">
                  <span>⭐</span> AI Picks
                </h2>
                <p className="text-xs text-gray-500">Best combinations from all 5 agents</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <OutputCard
                    pattern="directors_cut"
                    label="Director's Cut"
                    emoji="⭐"
                    color="from-amber-500 to-yellow-400"
                    post={synthesis.directors_cut}
                    isAiPick
                  />
                  <OutputCard
                    pattern="roast_mode"
                    label="Roast Mode"
                    emoji="🔥"
                    color="from-orange-500 to-red-500"
                    post={synthesis.roast_mode}
                    isAiPick
                  />
                </div>
              </section>
            )}

            <section className="space-y-4">
              <h2 className="text-sm font-medium text-gray-400">
                All 5 Agents
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

            <div className="text-center text-gray-600 text-xs pt-2 border-t border-gray-800">
              scores are AI-evaluated on humor, virality, originality &amp; cringe authenticity
            </div>
          </div>
        )}

        {!isLoading && posts.length === 0 && (
          <div className="text-center py-24 text-gray-600">
            <p className="text-5xl mb-4 animate-bounce">💀</p>
            <p className="text-lg font-medium text-gray-500">
              No shitposts yet
            </p>
            <p className="text-sm mt-2 text-gray-600">
              Enter a topic above and watch the chaos unfold
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
