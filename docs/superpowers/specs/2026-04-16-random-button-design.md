# Random Button Feature Design

**Date:** 2026-04-16  
**Status:** Approved

## 1. Overview

Add a "Random" button next to the "Shitpost" button in InputPanel.tsx. When clicked, it randomly selects a prompt from a predefined list and fills the textarea, giving users instant inspiration for their shitpost.

## 2. UI/UX

### Button Placement and Layout

- Position: To the left of the "Shitpost" button
- Layout in form:
  ```
  [ Random ] [ Shitpost ]
  ```

### Button Styling

- **Default state:**
  - Background: transparent
  - Border: 1px solid #0A66C2 (LinkedIn blue)
  - Text: #0A66C2
  - Padding: py-1.5 px-5 (same as Shitpost)
  - Border radius: full (rounded-full)
  - Font: text-sm font-semibold

- **Hover state:**
  - Background: #EEF3FB (subtle blue fill)
  - Transition: transition-colors

- **Disabled state (during loading):**
  - Text color: #C0BFBD (gray)
  - Border color: #C0BFBD
  - Cursor: not-allowed

## 3. Functionality

### Prompt Library

A predefined array of ~30 prompts across 5 categories:

**Current Events (tech news):**
- "Claude can now read your Gmail"
- "Claude Mythos is more powerful than Opus"
- "AI models can now exploit zero-day vulnerabilities"
- "OpenAI and Anthropic are competing for enterprise"
- "Project Glasswing is using AI for cybersecurity"

**Daily Life / Mundane:**
- "Forgot to eat lunch until 3pm"
- "The office AC is too cold"
- "My laptop has been updating for 2 hours"
- "I accidentally replied all to the entire company"
- "The coffee machine is broken again"
- "My Slack notifications have 847 unread messages"

**Generic Thought Leader:**
- "Cold showers changed my life"
- "I learned everything from my 4-year-old"
- "Failure is just success that hasn't happened yet"
- "Sleep is for the weak"
- "My commute is my thinking time"

**Workplace Absurdity:**
- "The meeting that could have been an email"
- "Someone else's code in production"
- "Requirements that changed three times today"
- "The documentation that doesn't exist"
- "Standup when you haven't made progress"

**Silly / Over-the-Top:**
- "I decided to optimize my sleep schedule with AI"
- "My dog is my co-founder"
- "I have a cold and it's affecting my throughput"
- "Hot take: tabs are better than spaces"

### Behavior

1. User clicks "Random" button
2. A random prompt is selected using `Math.random()`
3. The textarea value is set to the selected prompt
4. Textarea automatically expands (if collapsed, it expands)
5. **Form automatically submits** - `onGenerate` is called with the selected prompt
6. Button is disabled while generation is in progress

**Note:** The parent component (page.tsx) handles the loading state, so the Random button will be disabled via the `isLoading` prop passed to InputPanel.

## 4. Implementation

**File to modify:** `src/components/InputPanel.tsx`

**Changes:**
1. Add `prompts` array (constant outside component)
2. Add `handleRandom` function that:
   - Selects random prompt from array
   - Sets prompt state to selected value
   - Sets expanded to true
   - Calls `onGenerate` with the selected prompt (auto-submit)
3. Add "Random" button with LinkedIn styling
4. Disable "Random" button when `isLoading` is true

**No new dependencies required.**

## 5. Acceptance Criteria

- [ ] "Random" button appears next to "Shitpost" button
- [ ] Button has LinkedIn-style blue outline appearance
- [ ] Clicking "Random" fills textarea with a random prompt
- [ ] Clicking "Random" automatically submits (generates shitpost)
- [ ] Button is disabled during generation loading state
- [ ] Works on both expanded and collapsed textarea states