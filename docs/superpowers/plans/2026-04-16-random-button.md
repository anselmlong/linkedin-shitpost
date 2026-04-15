# Random Button Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "Random" button next to "Shitpost" that randomly selects a prompt and auto-submits to generate a shitpost.

**Architecture:** Simple React component modification - add prompts array and Random button with LinkedIn styling. No new files or dependencies needed.

**Tech Stack:** React, TypeScript, Tailwind CSS

---

### Task 1: Add prompts array to InputPanel.tsx

**Files:**
- Modify: `src/components/InputPanel.tsx:10-38`

- [ ] **Step 1: Add prompts array constant**

After line 10 (after `const MAX_CHARS = 3000;`), add:

```typescript
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
```

- [ ] **Step 2: Commit**

```bash
git add src/components/InputPanel.tsx
git commit -m "feat: add prompts array for Random button"
```

---

### Task 2: Add handleRandom function

**Files:**
- Modify: `src/components/InputPanel.tsx:27-30` (insert new function after handleKeyDown)

- [ ] **Step 1: Add handleRandom function**

After the `handleKeyDown` function (ends around line 27), add:

```typescript
  const handleRandom = async () => {
    if (isLoading) return;
    const randomPrompt = PROMPTS[Math.floor(Math.random() * PROMPTS.length)];
    setPrompt(randomPrompt);
    setExpanded(true);
    await onGenerate(randomPrompt);
  };
```

- [ ] **Step 2: Commit**

```bash
git add src/components/InputPanel.tsx
git commit -m "feat: add handleRandom function"
```

---

### Task 3: Add Random button to UI

**Files:**
- Modify: `src/components/InputPanel.tsx:58-66` (button container)

- [ ] **Step 1: Update button container to include Random button**

Replace the button container (lines 58-66):
```typescript
            <div className="flex items-center justify-end gap-3">
              <span className="text-xs text-[#666]">{prompt.length}/{MAX_CHARS}</span>
              <button
                type="button"
                onClick={handleRandom}
                disabled={isLoading}
                className="border border-[#0A66C2] text-[#0A66C2] hover:bg-[#EEF3FB] disabled:border-[#C0BFBD] disabled:text-[#C0BFBD] disabled:cursor-not-allowed text-sm font-semibold px-5 py-1.5 rounded-full transition-colors"
              >
                Random
              </button>
              <button
                type="submit"
                disabled={isLoading || !prompt.trim()}
                className="bg-[#0A66C2] hover:bg-[#004182] active:scale-[0.97] disabled:bg-[#C0BFBD] disabled:cursor-not-allowed text-white text-sm font-semibold px-5 py-1.5 rounded-full transition-all duration-150"
              >
                {isLoading ? "Generating..." : "Shitpost"}
              </button>
            </div>
```

- [ ] **Step 2: Run type check to verify no errors**

```bash
bun run typecheck
```

Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/components/InputPanel.tsx
git commit -m "feat: add Random button with LinkedIn styling"
```

---

### Task 4: Verify implementation

**Files:**
- Test: Manual browser test

- [ ] **Step 1: Start dev server and test**

```bash
bun run dev
```

Open http://localhost:3000

- [ ] **Step 2: Verify button appears**

Check that "Random" button appears next to "Shitpost" button with blue outline styling

- [ ] **Step 3: Verify Random button works**

Click "Random" button and verify:
- A random prompt fills the textarea
- The shitpost generation starts automatically
- Button is disabled during loading

- [ ] **Step 4: Commit final**

```bash
git add -A
git commit -m "feat: complete Random button feature"
```