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

// LinkedIn's default "no photo" avatar, because you haven't uploaded one either.
export function DefaultAvatar({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`w-10 h-10 rounded-full flex-shrink-0 ${className}`}
      viewBox="0 0 40 40"
      aria-hidden="true"
    >
      <rect width="40" height="40" fill="#E9E5DF" />
      <circle cx="20" cy="16" r="7" fill="#A5A29D" />
      <path d="M6 38c1.6-7.4 7.2-11 14-11s12.4 3.6 14 11z" fill="#A5A29D" />
    </svg>
  );
}

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
    <div className="bg-white border border-li-border rounded-lg p-4">
      <h2 id="composer-title" className="text-sm font-semibold text-li-text mb-3">Start a post</h2>
      <form onSubmit={handleSubmit}>
        {!expanded ? (
          <div className="flex items-center gap-3">
            <DefaultAvatar />
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="flex-1 min-w-0 min-h-11 text-left border border-li-border-strong rounded-full px-4 py-2 text-sm font-semibold text-li-muted truncate hover:bg-li-canvas transition-colors"
            >
              What do you want to thought-leader about?
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-start gap-3 mb-3">
              <DefaultAvatar className="mt-0.5" />
              <textarea
                autoFocus
                aria-labelledby="composer-title"
                aria-describedby="composer-count"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value.slice(0, MAX_CHARS))}
                onKeyDown={handleKeyDown}
                placeholder="What do you want to thought-leader about?"
                rows={4}
                className="flex-1 min-w-0 border border-li-border-strong rounded-lg px-3 py-2 text-base sm:text-sm leading-relaxed text-li-text placeholder-li-muted hover:border-li-muted focus:border-li-blue focus:outline-none resize-none focus:ring-2 focus:ring-li-blue/30 transition-[border-color,box-shadow]"
              />
            </div>
            <div className="flex items-center justify-end gap-2 sm:gap-3">
              <span
                id="composer-count"
                className={`text-xs tabular-nums mr-auto sm:mr-0 pl-[52px] sm:pl-0 ${prompt.length >= MAX_CHARS ? "text-li-danger font-semibold" : "text-li-muted"}`}
              >
                {prompt.length.toLocaleString()}/{MAX_CHARS.toLocaleString()}
              </span>
              <button
                type="button"
                onClick={handleRandom}
                disabled={isLoading}
                className="h-9 border border-li-blue text-li-blue hover:bg-li-blue-soft hover:shadow-[inset_0_0_0_1px_var(--color-li-blue)] active:bg-li-blue/15 disabled:border-li-border-strong disabled:text-li-muted disabled:bg-transparent disabled:shadow-none disabled:cursor-not-allowed text-sm font-semibold px-4 sm:px-5 rounded-full transition-[background-color,box-shadow,color] duration-150"
              >
                Random
              </button>
              <button
                type="submit"
                disabled={isLoading || !prompt.trim()}
                className="h-9 bg-li-blue hover:bg-li-blue-dark active:bg-li-blue-press disabled:bg-li-border disabled:text-li-muted disabled:cursor-not-allowed text-white text-sm font-semibold px-4 sm:px-5 rounded-full transition-colors duration-150"
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
