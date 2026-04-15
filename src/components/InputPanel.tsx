"use client";

import { useState } from "react";

interface InputPanelProps {
  onGenerate: (prompt: string) => Promise<void>;
  isLoading: boolean;
}

const MAX_CHARS = 3000;

const PROMPTS = [
  // Current Events (tech news)
  "Claude can now read your Gmail",
  "Claude Mythos is more powerful than Opus",
  "AI models can now exploit zero-day vulnerabilities",
  "OpenAI and Anthropic are competing for enterprise",
  "Project Glasswing is using AI for cybersecurity",
  // Daily Life / Mundane
  "Forgot to eat lunch until 3pm",
  "The office AC is too cold",
  "My laptop has been updating for 2 hours",
  "I accidentally replied all to the entire company",
  "The coffee machine is broken again",
  "My Slack notifications have 847 unread messages",
  // Generic Thought Leader
  "Cold showers changed my life",
  "I learned everything from my 4-year-old",
  "Failure is just success that hasn't happened yet",
  "Sleep is for the weak",
  "My commute is my thinking time",
  // Workplace Absurdity
  "The meeting that could have been an email",
  "Someone else's code in production",
  "Requirements that changed three times today",
  "The documentation that doesn't exist",
  "Standup when you haven't made progress",
  // Silly / Over-the-Top
  "I decided to optimize my sleep schedule with AI",
  "My dog is my co-founder",
  "I have a cold and it's affecting my throughput",
  "Hot take: tabs are better than spaces",
] as const;

export default function InputPanel({ onGenerate, isLoading }: InputPanelProps) {
  const [prompt, setPrompt] = useState("");
  const [expanded, setExpanded] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;
    await onGenerate(prompt);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (prompt.trim() && !isLoading) onGenerate(prompt);
    }
  };

  const handleRandom = async () => {
    if (isLoading) return;
    const randomPrompt = PROMPTS[Math.floor(Math.random() * PROMPTS.length)];
    setPrompt(randomPrompt);
    setExpanded(true);
    await onGenerate(randomPrompt);
  };

  return (
    <div className="bg-white border border-[#E0DFDC] rounded-lg p-4">
      <div className="text-sm font-semibold text-[#191919] mb-3">Start a post</div>
      <form onSubmit={handleSubmit}>
        {!expanded ? (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#0A66C2] flex-shrink-0" />
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="flex-1 text-left border border-[#C0BFBD] rounded-full px-4 py-2 text-sm text-[#666] hover:bg-[#F3F2EF] hover:border-[#0A66C2] hover:text-[#0A66C2] transition-colors"
            >
              What do you want to thought-leader about?
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-[#0A66C2] flex-shrink-0 mt-0.5" />
              <textarea
                autoFocus
                value={prompt}
                onChange={(e) => setPrompt(e.target.value.slice(0, MAX_CHARS))}
                onKeyDown={handleKeyDown}
                placeholder="What do you want to thought-leader about?"
                rows={4}
                className="flex-1 border border-[#0A66C2] rounded-lg px-3 py-2 text-sm text-[#191919] placeholder-[#666] focus:outline-none resize-none focus:ring-2 focus:ring-[#0A66C2]/30 transition-shadow"
              />
            </div>
            <div className="flex items-center justify-end gap-3">
              <span className="text-xs text-[#666]">{prompt.length}/{MAX_CHARS}</span>
              <button
                type="button"
                onClick={handleRandom}
                disabled={isLoading}
                className="border border-[#0A66C2] text-[#0A66C2] hover:bg-[#EEF3FB] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] disabled:border-[#C0BFBD] disabled:text-[#C0BFBD] disabled:cursor-not-allowed text-sm font-semibold px-5 py-1.5 rounded-full transition-all duration-150"
              >
                Random
              </button>
              <button
                type="submit"
                disabled={isLoading || !prompt.trim()}
                className="bg-[#0A66C2] hover:bg-[#004182] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.97] disabled:bg-[#C0BFBD] disabled:cursor-not-allowed text-white text-sm font-semibold px-5 py-1.5 rounded-full transition-all duration-150"
              >
                {isLoading ? "Generating..." : "Shitpost"}
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  );
}
