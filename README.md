# Explain Again

A React 18 + TypeScript + Vite build of the public wall for everything people are tired of re-explaining to AI every single session.

## Stack

- React 18 + TypeScript
- Plain CSS in [`src/styles.css`](./src/styles.css)
- Supabase for storage + realtime
- Anthropic Claude via [`api/categorize.ts`](./api/categorize.ts)
- Vercel for deployment

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Run the SQL in [`supabase.sql`](./supabase.sql) in your Supabase SQL editor.

3. Fill in [`.env`](./.env):

```bash
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

4. Start the frontend:

```bash
npm run dev
```

Notes:
- The app will still submit locally if `/api/categorize` is unavailable by falling back to a lightweight client-side category guess.
- To exercise the real Claude path locally, run the app through Vercel dev tooling instead of plain Vite.

## Deployment

1. Add `CLAUDE_API_KEY` in the Vercel dashboard.
2. Deploy:

```bash
npx vercel --prod
```

3. Confirm:
- submissions load from Supabase
- voting increments once per browser
- opening two tabs reflects new submissions in realtime
- `POST /api/categorize` returns `{ "category": "..." }`

## Project structure

- [`src/App.tsx`](./src/App.tsx) coordinates state, filtering, voting, toasts, and sharing
- [`src/components`](./src/components) contains the UI
- [`src/lib/supabase.ts`](./src/lib/supabase.ts) wraps all data access
- [`src/lib/fingerprint.ts`](./src/lib/fingerprint.ts) handles local vote dedup
- [`api/categorize.ts`](./api/categorize.ts) keeps the Claude key server-side
