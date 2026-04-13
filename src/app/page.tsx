"use client";

import { useState } from "react";
import InputPanel from "@/components/InputPanel";
import OutputCard from "@/components/OutputCard";
import type { GeneratedPost } from "@/lib/agents";

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
  const [imageTranscription, setImageTranscription] = useState<string | null>(null);

  const handleGenerate = async (
    prompt: string,
    imageBase64: string | null,
    mimeType: string | null
  ) => {
    setIsLoading(true);
    setError(null);
    setUsedPrompt(prompt);

    try {
      const fd = new FormData();
      fd.append("prompt", prompt);
      if (imageBase64) {
        fd.append("imageBase64", imageBase64);
        if (mimeType) fd.append("mimeType", mimeType);
      }

      const res = await fetch("/api/generate", { method: "POST", body: fd });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Generation failed");

      setPosts(data.posts);
      setSynthesis(data.synthesis);
      setImageTranscription(data.imageTranscription || null);
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

      <main className="max-w-4xl mx-auto px-6 py-10 space-y-10">
        {/* Input */}
        <section>
          <InputPanel onGenerate={handleGenerate} isLoading={isLoading} />
        </section>

        {/* Error */}
        {error && (
          <div className="bg-red-900/30 border border-red-800 rounded-lg p-4 text-red-300 text-sm">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Image transcription */}
        {imageTranscription && (
          <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-3 text-blue-300 text-xs">
            <strong>📸 Image transcription:</strong> {imageTranscription}
          </div>
        )}

        {/* Loading skeleton */}
        {isLoading && (
          <section>
            <p className="text-center text-gray-500 mb-4 text-sm">
              5 agents writing... evaluating... synthesizing...
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden animate-pulse"
                >
                  <div className="h-10 bg-gray-700" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-gray-700 rounded w-3/4" />
                    <div className="h-4 bg-gray-700 rounded" />
                    <div className="h-4 bg-gray-700 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Results */}
        {!isLoading && posts.length > 0 && (
          <>
            {/* Prompt echo */}
            {usedPrompt && (
              <div className="text-center">
                <p className="text-gray-500 text-xs">
                  &ldquo;{usedPrompt}&rdquo;
                </p>
              </div>
            )}

            {/* AI picks */}
            {synthesis && (
              <section>
                <h2 className="text-sm font-semibold text-amber-400 mb-3 flex items-center gap-2">
                  <span>⭐</span> AI Picks — Best combinations from all 5 agents
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

            {/* All agents */}
            <section>
              <h2 className="text-sm font-semibold text-gray-400 mb-3">
                All 5 Agents
              </h2>
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

            {/* Footer */}
            <div className="text-center text-gray-600 text-xs pt-4">
              scores are AI-evaluated on humor, virality, originality &amp; cringe authenticity
            </div>
          </>
        )}

        {/* Empty state */}
        {!isLoading && posts.length === 0 && (
          <div className="text-center py-20 text-gray-600">
            <p className="text-4xl mb-4">💀</p>
            <p className="text-lg font-medium text-gray-500">
              No shitposts yet
            </p>
            <p className="text-sm mt-1">
              Enter a topic above and watch the chaos unfold
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
