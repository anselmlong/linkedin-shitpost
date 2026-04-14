# LinkedIn Shitpost Generator

A satirical web application that generates humorous, exaggerated LinkedIn-style posts using AI. Enter a topic (like "sprint planning meetings" or "coworker who doesn't refactor") and optionally upload an image to get 5 different types of satirical posts, evaluated and synthesized into curated "Director's Cut" and "Roast Mode" versions.

## Features

- **5 Distinct AI Comedic Personas**: Each generates posts with a unique comedic voice
  - Tech-bro earnestness (startup culture, "learnings", "journey")
  - Absurdist derailment (completely missing the point)
  - Unhinged hooks (rage-inducing opens)
  - Ragebait escalation (controversial takes)
  - Lowercase tryhard (casual LinkedIn bro)
- **AI-Powered Evaluation**: Scores posts on humor, virality, originality, and cringe
- **Synthesis Pipeline**: Combines best elements into polished final outputs
- **Dark Theme**: Sleek gradient UI with Tailwind CSS

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI**: React 19, Tailwind CSS v4
- **AI**: Google Gemini (via OpenRouter)

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to generate some shitposts.

## Project Structure

```
src/
├── app/
│   ├── api/generate/route.ts   # POST endpoint for generation
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Main UI
│   └── globals.css         # Global styles
├── components/
│   ├── InputPanel.tsx      # User input form
│   └── OutputCard.tsx     # Post display card
└── lib/
    ├── agents.ts          # AI agent definitions
    ├── evaluator.ts      # Post evaluation
    └── openrouter.ts     # OpenRouter integration
```

## Environment Variables

Set `OPENAI_API_KEY` and `GEMINI_API_KEY` for AI generation. The app gracefully handles missing keys for demo purposes.

## Disclaimer

This is a satirical tool for entertainment. Don't actually post these to LinkedIn (or do, I'm not your mom).