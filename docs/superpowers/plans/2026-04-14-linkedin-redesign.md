# LinkedIn Visual Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the dark "vibe-coded" aesthetic with a faithful LinkedIn-style light UI — same palette, patterns, and components as LinkedIn itself, so the comedy lands from the contrast between polished UI and absurd content.

**Architecture:** Pure UI change — no backend, API, or data model changes. Four files are rewritten: `globals.css`, `layout.tsx`, `InputPanel.tsx`, `OutputCard.tsx`. `page.tsx` is restructured for the new nav, sections, loading/empty/error states.

**Tech Stack:** Next.js 15, React 19, Tailwind CSS v4, TypeScript. No new dependencies.

---

## File Map

| File | Change |
|------|--------|
| `src/app/globals.css` | Replace dark vars with LinkedIn palette, fix font stack, remove dark media query |
| `src/app/layout.tsx` | Remove dark body classes |
| `src/components/InputPanel.tsx` | Full rewrite: LinkedIn composer pattern, "Shitpost" button, char count |
| `src/components/OutputCard.tsx` | Full rewrite: fake LinkedIn post card, agent label bar, featured border treatment |
| `src/app/page.tsx` | New nav, restructured results (AI Picks first), new loading/empty/error states |

---

## Task 1: Global styles & layout body

**Files:**
- Modify: `src/app/globals.css`
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Update globals.css**

Replace the entire file with:

```css
@import "tailwindcss";

:root {
  --background: #F3F2EF;
  --foreground: #191919;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}

body {
  background: var(--background);
  color: var(--foreground);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
}
```

- [ ] **Step 2: Update layout.tsx body classes**

In `src/app/layout.tsx`, change the `<body>` tag from:
```tsx
<body className="min-h-full flex flex-col bg-gray-950 text-gray-100">
```
to:
```tsx
<body className="min-h-full flex flex-col">
```

- [ ] **Step 3: Verify visually**

Run `npm run dev`, open http://localhost:3000. The page background should now be `#F3F2EF` (warm light gray) instead of near-black. Text should be dark.

- [ ] **Step 4: Commit**

```bash
git add src/app/globals.css src/app/layout.tsx
git commit -m "style: switch to LinkedIn light theme palette"
```

---

## Task 2: Rewrite InputPanel as LinkedIn composer

**Files:**
- Modify: `src/components/InputPanel.tsx`

The component has two visual states: collapsed (avatar + placeholder pill, like LinkedIn's feed) and expanded (textarea + char count + Shitpost button). Clicking the pill expands it. No image upload.

- [ ] **Step 1: Replace InputPanel.tsx**

```tsx
"use client";

import { useState } from "react";

interface InputPanelProps {
  onGenerate: (prompt: string) => Promise<void>;
  isLoading: boolean;
}

const MAX_CHARS = 3000;

export default function InputPanel({ onGenerate, isLoading }: InputPanelProps) {
  const [prompt, setPrompt] = useState("");
  const [expanded, setExpanded] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;
    await onGenerate(prompt);
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
              className="flex-1 text-left border border-[#C0BFBD] rounded-full px-4 py-2 text-sm text-[#666] hover:bg-[#F3F2EF] transition-colors"
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
                placeholder="What do you want to thought-leader about?"
                rows={4}
                className="flex-1 border border-[#0A66C2] rounded-lg px-3 py-2 text-sm text-[#191919] placeholder-[#666] focus:outline-none resize-none"
              />
            </div>
            <div className="flex items-center justify-end gap-3">
              <span className="text-xs text-[#666]">{prompt.length}/{MAX_CHARS}</span>
              <button
                type="submit"
                disabled={isLoading || !prompt.trim()}
                className="bg-[#0A66C2] hover:bg-[#004182] disabled:bg-[#C0BFBD] disabled:cursor-not-allowed text-white text-sm font-semibold px-5 py-1.5 rounded-full transition-colors"
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
```

- [ ] **Step 2: Verify visually**

Open http://localhost:3000. You should see a white card with "Start a post" header, an avatar circle, and a rounded pill placeholder. Clicking the pill should expand to a textarea with char count and a blue "Shitpost" pill button.

- [ ] **Step 3: Commit**

```bash
git add src/components/InputPanel.tsx
git commit -m "feat: rewrite InputPanel as LinkedIn composer"
```

---

## Task 3: Rewrite OutputCard as fake LinkedIn post

**Files:**
- Modify: `src/components/OutputCard.tsx`

Two card variants: featured (Director's Cut / Roast Mode) with a colored top border and badge row; agent cards with a gray label bar. Both render as fake LinkedIn posts with avatar, name, post body, and engagement actions.

- [ ] **Step 1: Replace OutputCard.tsx**

```tsx
"use client";

import { useState } from "react";

interface OutputCardProps {
  pattern: string;
  label: string;
  emoji: string;
  color: string;
  post: string;
  score?: number;
  isAiPick?: boolean;
}

const AGENT_CONFIG: Record<string, {
  label: string;
  emoji: string;
  avatarColor: string;
  fakeName: string;
  fakeTitle: string;
}> = {
  "tech-bro": {
    label: "Tech Bro",
    emoji: "🎭",
    avatarColor: "#0A66C2",
    fakeName: "You",
    fakeTitle: "Disrupting disruption at Scale",
  },
  "absurdist": {
    label: "Absurdist",
    emoji: "🌀",
    avatarColor: "#8B5CF6",
    fakeName: "You",
    fakeTitle: "Existential Strategist",
  },
  "unhinged": {
    label: "Unhinged Hook",
    emoji: "😱",
    avatarColor: "#F59E0B",
    fakeName: "You",
    fakeTitle: "Thought Leader (self-appointed)",
  },
  "ragebait": {
    label: "Ragebait",
    emoji: "😤",
    avatarColor: "#EF4444",
    fakeName: "You",
    fakeTitle: "Contrarian at Large",
  },
  "lowercase": {
    label: "Lowercase Tryhard",
    emoji: "✍️",
    avatarColor: "#10B981",
    fakeName: "you",
    fakeTitle: "vibes & growth",
  },
};

const FEATURED_CONFIG: Record<string, {
  label: string;
  emoji: string;
  borderColor: string;
  accentColor: string;
  scoreLabel: string;
}> = {
  "directors_cut": {
    label: "Director's Cut",
    emoji: "🎬",
    borderColor: "#0A66C2",
    accentColor: "#0A66C2",
    scoreLabel: "Score",
  },
  "roast_mode": {
    label: "Roast Mode",
    emoji: "🔥",
    borderColor: "#B24020",
    accentColor: "#B24020",
    scoreLabel: "Cringe",
  },
};

export default function OutputCard({ pattern, post, score, isAiPick }: OutputCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(post);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (isAiPick) {
    const featured = FEATURED_CONFIG[pattern] ?? {
      label: pattern,
      emoji: "⭐",
      borderColor: "#0A66C2",
      accentColor: "#0A66C2",
      scoreLabel: "Score",
    };

    return (
      <div
        className="bg-white border border-[#E0DFDC] rounded-lg overflow-hidden"
        style={{ borderTop: `3px solid ${featured.borderColor}` }}
      >
        <div className="flex items-center justify-between px-3 py-2 border-b border-[#F3F2EF]">
          <span
            className="text-xs font-bold flex items-center gap-1"
            style={{ color: featured.accentColor }}
          >
            {featured.emoji} {featured.label}
          </span>
          {score !== undefined && (
            <span
              className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
              style={{
                color: featured.accentColor,
                background: featured.accentColor + "18",
              }}
            >
              {featured.scoreLabel}: {score.toFixed(1)}
            </span>
          )}
        </div>
        <div className="p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-[#E0DFDC] flex-shrink-0" />
            <div>
              <div className="text-xs font-semibold text-[#191919]">You</div>
              <div className="text-[10px] text-[#666]">LinkedIn Member • Just now</div>
            </div>
          </div>
          <p className="text-xs text-[#191919] leading-relaxed whitespace-pre-wrap mb-3">
            {post}
          </p>
          <div className="flex gap-4 border-t border-[#F3F2EF] pt-2 items-center">
            <span className="text-[10px] text-[#666]">👍 Like</span>
            <span className="text-[10px] text-[#666]">💬 Comment</span>
            <button
              onClick={handleCopy}
              className="text-[10px] font-semibold text-[#0A66C2] ml-auto hover:underline"
            >
              {copied ? "✓ Copied" : "Copy post"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const agent = AGENT_CONFIG[pattern] ?? {
    label: pattern,
    emoji: "📝",
    avatarColor: "#C0BFBD",
    fakeName: "You",
    fakeTitle: "LinkedIn Member",
  };

  return (
    <div className="bg-white border border-[#E0DFDC] rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#F3F2EF] border-b border-[#E0DFDC]">
        <span className="text-[10px] font-semibold text-[#555]">
          {agent.emoji} {agent.label}
        </span>
        {score !== undefined && (
          <span className="text-[10px] text-[#888]">{score.toFixed(1)} / 10</span>
        )}
      </div>
      <div className="p-3">
        <div className="flex items-center gap-2 mb-2">
          <div
            className="w-8 h-8 rounded-full flex-shrink-0"
            style={{ background: agent.avatarColor }}
          />
          <div>
            <div className="text-xs font-semibold text-[#191919]">{agent.fakeName}</div>
            <div className="text-[10px] text-[#666]">{agent.fakeTitle} • Just now</div>
          </div>
        </div>
        <p className="text-xs text-[#191919] leading-relaxed whitespace-pre-wrap mb-3">
          {post}
        </p>
        <div className="flex gap-4 border-t border-[#F3F2EF] pt-2 items-center">
          <span className="text-[10px] text-[#666]">👍 Like</span>
          <span className="text-[10px] text-[#666]">💬 Comment</span>
          <button
            onClick={handleCopy}
            className="text-[10px] font-semibold text-[#0A66C2] ml-auto hover:underline"
          >
            {copied ? "✓ Copied" : "Copy"}
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify visually**

Generate a post. Featured cards (Director's Cut, Roast Mode) should have colored top borders and no gradient headers. Agent cards should have a gray label bar. All cards should look like LinkedIn posts with avatar, name, post text, and engagement row.

- [ ] **Step 3: Commit**

```bash
git add src/components/OutputCard.tsx
git commit -m "feat: rewrite OutputCard as fake LinkedIn post card"
```

---

## Task 4: Rewrite page.tsx — nav, sections, states

**Files:**
- Modify: `src/app/page.tsx`

Nav becomes LinkedIn-style white sticky bar. Results restructured: AI Picks first (two featured cards), then all 5 agents below. Loading state uses light shimmer skeleton. Empty state is simple centered text. Error state uses light red styling.

- [ ] **Step 1: Replace page.tsx**

```tsx
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
```

- [ ] **Step 2: Verify nav**

http://localhost:3000 — white sticky nav with `in` logo box, "Shitpost Generator", and "— don't actually post these" subtitle. Warm gray page background.

- [ ] **Step 3: Verify loading state**

Submit a prompt. Loading skeletons should use `#E0DFDC` shimmer on white cards — no dark colors.

- [ ] **Step 4: Verify results layout**

After generation: AI Picks section appears first with two featured cards (blue/rust top borders), then "All 5 Agents" below in a 2-col grid.

- [ ] **Step 5: Verify empty state**

On first load (no posts): simple centered text "Enter a topic above and hit Shitpost." — no bouncing skull.

- [ ] **Step 6: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: LinkedIn-style nav, light loading skeletons, restructured results layout"
```

---

## Task 5: Add .superpowers to .gitignore

**Files:**
- Modify: `.gitignore`

- [ ] **Step 1: Add .superpowers to .gitignore**

Open `.gitignore` and add this line if not already present:

```
.superpowers/
```

- [ ] **Step 2: Commit**

```bash
git add .gitignore
git commit -m "chore: ignore .superpowers brainstorm dir"
```
