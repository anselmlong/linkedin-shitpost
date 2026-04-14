# LinkedIn Shitpost Generator — Visual Redesign Spec

**Date:** 2026-04-14
**Status:** Approved

## Overview

Complete visual redesign of the LinkedIn Shitpost Generator from a dark "vibe-coded" aesthetic to a light, LinkedIn-faithful design. The app uses LinkedIn's actual colors, type, and UI patterns — the comedy comes from the contrast between the polished professional UI and the absurd content it generates.

---

## Design Direction

**Style:** LinkedIn-Inspired Tool — honest single-page generator. Uses LinkedIn's visual language faithfully without pretending to be LinkedIn. No dark mode. No gradients. No custom brand identity.

**Palette:**
- Page background: `#F3F2EF` (LinkedIn warm gray)
- Card/nav background: `#FFFFFF`
- Primary blue: `#0A66C2`
- Primary text: `#191919`
- Secondary text: `#666666`
- Border: `#E0DFDC`
- Muted background: `#F3F2EF`
- Roast accent: `#B24020` (rust red)

**Typography:** `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif` — LinkedIn's system font stack.

**Border radius:** 8px on cards, 20px on pill buttons (LinkedIn's actual values).

---

## Page Structure

### Navigation Bar
- White bar, 1px `#E0DFDC` bottom border, subtle box-shadow
- Left: LinkedIn `in` logo (white text on `#0A66C2` rounded square) + "Shitpost Generator" in bold + "— don't actually post these" in gray
- Sticky top, no other nav items

### Input Card
Mimics LinkedIn's "Start a post" composer:
- White card with `#E0DFDC` border, 8px radius
- Header row: user avatar circle + placeholder text ("What do you want to thought-leader about?")
- Clicking expands to a textarea (full-width, no resize, min-height ~80px)
- Footer row: character count (left) + **"Shitpost"** button (right, `#0A66C2` pill)
- No image upload button

### AI Picks Section (top, featured)
- Section label: small uppercase "⭐ AI PICKS" in gray
- Two cards side-by-side (`1fr 1fr` grid, 12px gap):
  - **Director's Cut** — blue top border (`#0A66C2`), badge "🎬 Director's Cut", score pill in blue
  - **Roast Mode** — rust top border (`#B24020`), badge "🔥 Roast Mode", cringe score pill in rust
- Each card renders as a fake LinkedIn post (see Post Card spec below)

### All 5 Agents Section
- Section label: "All 5 Agents" in gray
- 2-column grid, 12px gap
- Each renders as a post card with a subtle agent label bar at the top (light gray `#F3F2EF` background)

---

## Post Card Component

Each generated post (both featured and agent) renders as a fake LinkedIn post:

```
┌─────────────────────────────────────────┐
│ [Agent label bar — gray bg]  Score: x.x │  ← only on agent cards
│ ┌─────────────────────────────────────┐ │
│ │ [Avatar]  Name                      │ │
│ │           Subtitle • Just now       │ │
│ │                                     │ │
│ │ Post body text...                   │ │
│ │                                     │ │
│ │ 👍 Like  💬 Comment  Copy post      │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

- Avatar: 32–40px circle, colored per agent (or plain gray for featured)
- Name: "You" (or persona-flavored name for fun)
- "Copy post" action styled in `#0A66C2`, replaces the Share action
- No real like/comment functionality — purely cosmetic

**Agent avatar colors:**
- Tech Bro: `#0A66C2` (LinkedIn blue)
- Absurdist: `#8B5CF6` (purple)
- Ragebait: `#EF4444` (red)
- Lowercase: `#10B981` (green)
- Unhinged Hook: `#F59E0B` (amber)

---

## Loading State

Replace current dark skeleton with LinkedIn-faithful version:
- Same layout (2 featured + 2×2 grid)
- Skeleton shimmer uses `#E0DFDC` → `#F3F2EF` gradient (light gray, not dark)
- No loading message text needed

---

## Empty State (before first generation)

- Input card is shown
- Below: simple centered text in `#666` — "Enter a topic above and hit Shitpost."
- No bouncing emoji, no dramatic empty state

---

## Error State

- Inline below the input card
- Light red background `#FEF2F2`, border `#FECACA`, text `#991B1B`
- LinkedIn-style — no dark red cards

---

## Responsive

- Single column on mobile (< 640px): featured cards stack, agent cards stack
- Two columns at sm+ (≥ 640px): current grid layout

---

## What Changes vs Current

| Current | New |
|---|---|
| Dark bg `#0a0a0a` | Light bg `#F3F2EF` |
| Gray-800 cards | White cards |
| Gradient persona headers | Subtle agent label bar (gray) |
| Dark skeleton loading | Light shimmer skeleton |
| Amber ring for AI picks | Blue/rust top border |
| Blue→purple gradient CTA | Solid `#0A66C2` pill button |
| "Generate" button | "Shitpost" button |
| Image upload option | Removed |
| Custom dark nav | LinkedIn-style white nav |

---

## Out of Scope

- Actual LinkedIn auth or profile data
- Light/dark toggle
- Any backend/AI pipeline changes — this is purely a UI redesign
- Changing agent prompts or evaluation logic
