# Project Context

This is the **LinkedIn Shitpost Generator** - a satirical web app that generates humorous LinkedIn-style posts using AI.

## Key Files

- `src/app/page.tsx` - Main UI, orchestrates state and display
- `src/app/api/generate/route.ts` - POST endpoint, runs the AI pipeline
- `src/lib/agents.ts` - 5 comedic AI agent definitions with prompts
- `src/lib/evaluator.ts` - Evaluation and synthesis logic
- `src/components/InputPanel.tsx` - Prompt input + optional image upload
- `src/components/OutputCard.tsx` - Displays generated posts with scores

## AI Pipeline Flow

1. User submits prompt (+ optional image)
2. API generates 5 posts in parallel (one per agent persona)
3. Each post is evaluated on humor/virality/originality/cringe
4. Best elements synthesized into "Director's Cut" and "Roast Mode"
5. All results displayed with scores

## Important Patterns

- Uses `ai` SDK for streaming AI responses
- OpenRouter for AI API calls (Gemini models)
- Simple FormData with just prompt
- Tailwind CSS v4 with `@import "tailwindcss"` syntax
- Dark theme with custom CSS variables in `globals.css`

## Common Tasks

- **Add new agent**: Edit `src/lib/agents.ts`, add new persona to `AGENTS` array
- **Modify evaluation**: Edit `src/lib/evaluator.ts`, adjust scoring logic
- **UI changes**: Components in `src/components/`, main page in `src/app/page.tsx`
- **Styling**: `src/app/globals.css` + Tailwind utility classes

## Gotchas

- Missing API keys will show errors in UI but won't crash
- Tailwind v4 uses `@import` not `@tailwind` directives
- Next.js 16 with React 19 - some patterns differ from older versions