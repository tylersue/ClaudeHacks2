# Stack Research

**Domain:** Campus social matching web app with graph visualization
**Researched:** 2026-04-14
**Confidence:** HIGH (core choices), MEDIUM (graph library specifics)

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Vite + React | Vite 8.x, React 18/19 | App scaffold and UI framework | `npm create vite@latest -- --template react-ts` launches in seconds. Sub-second HMR, zero-config TypeScript. Wins over Next.js for hackathons because there is no SSR overhead to configure and no file-based routing to learn. Vite 8 is current stable. |
| TypeScript | ~5.x (bundled with Vite react-ts template) | Type safety | Included free in Vite template. Prevents demo-breaking runtime errors when data shapes change. Cost: zero setup time. |
| Tailwind CSS v4 | 4.x | Styling | No class memorization needed — inline utility classes. v4 uses CSS-first config (no tailwind.config.js required). Faster to style components than any component library alternative. |
| shadcn/ui | latest (copy-paste, no version lock) | Pre-built accessible components | Cards, dialogs, tabs, badges, avatars copy-paste in seconds. Zero bundle overhead for unused components. Ideal when you need a polished match card or messaging panel in minutes, not hours. |
| Supabase | JS client ^2.x | Auth + Postgres DB + Realtime messaging | One SDK gives you: OAuth/email auth, a Postgres database with instant REST API, and WebSocket-based pub/sub for in-app chat. Free tier is enough for a demo. Faster than building any backend yourself. Auth simulating UW SSO works out of the box via their OAuth flow. |
| Zustand | 5.0.x | Client state management | ~1.2KB, hooks-only API, no boilerplate. Holds the user's personality profile, matches list, and graph data between route changes. Simpler than Redux, lighter than React Context for this use case. |
| react-force-graph-2d | 1.29.x | Obsidian-style interest graph | Wraps D3 force simulation in a declarative React component. Pass `{ nodes, links }` and get an interactive canvas-based force-directed graph. Closest off-the-shelf match for Obsidian's aesthetic. `npm i react-force-graph-2d`. |
| Anthropic SDK (Node/Edge) | latest (`@anthropic-ai/sdk`) | LLM personality extraction | Official SDK for calling Claude. Use `claude-haiku-4-5` ($1/$5 per MTok) for fast, cheap extraction of interests and personality traits from uploaded chat history. 200K context window handles full chat exports. |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@supabase/supabase-js` | ^2.x | Supabase client | Every DB read/write, auth state, realtime channel subscriptions |
| `react-router-dom` | ^7.x | Client-side routing | Navigate between: Landing → Profile → Matches → Graph → Messages |
| `zod` | ^3.x | Runtime schema validation | Validate LLM JSON output before storing (LLMs hallucinate schema) |
| `lucide-react` | latest | Icon set | Matches shadcn/ui's default icon system; import only what you use |
| `@anthropic-ai/sdk` | latest | Anthropic Claude API | Chat history analysis, interest extraction |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| Vite dev server | HMR during dev | Already included; `npm run dev` starts in ~500ms |
| Supabase CLI | Local DB + Edge Functions dev | Optional for hackathon — use hosted free tier instead to skip setup |
| Vercel / Netlify CLI | One-command deploy | `npx vercel` from project root deploys in ~60s for live demo URL |

## Installation

```bash
# Scaffold
npm create vite@latest connectuw -- --template react-ts
cd connectuw

# Core
npm install @supabase/supabase-js @anthropic-ai/sdk react-router-dom zustand react-force-graph-2d zod

# UI
npm install tailwindcss @tailwindcss/vite lucide-react
npx shadcn@latest init

# Tailwind v4 (CSS-first, add to vite.config.ts plugin)
# See: https://tailwindcss.com/docs/v4-beta
```

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Vite + React | Next.js 15 | When you need SSR for SEO, server components, or file-based API routes. Overkill for a 1-hour hackathon demo with no SEO requirements. |
| Supabase | Firebase Realtime DB | Firebase has marginally faster initial auth setup but Supabase's Postgres is superior for the relational data model (users ↔ matches ↔ classes). Firebase's NoSQL model creates friction when querying multi-dimensional match scores. |
| react-force-graph-2d | Cytoscape.js | Cytoscape is more powerful for graph algorithms but requires 2-3x more code to produce the same visual result. Use it if you need custom layout algorithms beyond force-directed. |
| react-force-graph-2d | vis-network | vis-network has comparable DX but react-force-graph has more active maintenance and better React integration with less boilerplate. |
| Zustand | React Context + useReducer | Context is fine for small trees; Zustand wins when 3+ devs are touching shared state simultaneously (avoids prop drilling races). |
| `claude-haiku-4-5` | `claude-sonnet-4-6` | Use Sonnet if quality of personality extraction matters more than cost/latency. Haiku handles interest/trait extraction well at 5x lower cost. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| Next.js App Router | Server components, RSC, and Edge runtime add 20-30 minutes of configuration time you don't have. SSR is irrelevant for an in-demo app. | Vite + React SPA |
| Redux Toolkit | 3-4x more boilerplate than Zustand for equivalent functionality. Even "simple" Redux setups take 15 minutes. | Zustand 5.x |
| D3.js directly | You'll spend 45 minutes on SVG coordinate math and force simulation setup. react-force-graph-2d gives you the same visual result in 20 lines. | react-force-graph-2d |
| Custom WebSocket server | Building a chat WebSocket server from scratch is a 2-hour job. Supabase Realtime gives you pub/sub over WebSockets for free. | Supabase Realtime (Broadcast channel) |
| Material UI / Ant Design | Heavy install, theme override complexity, opinionated visual style that fights customization. Takes longer to override than to use Tailwind from scratch. | shadcn/ui + Tailwind |
| `claude-opus-4-6` for bulk extraction | $5/$25 per MTok — 5-25x more expensive than Haiku for a task that doesn't require Opus-level reasoning. | `claude-haiku-4-5-20251001` |
| Prisma / Drizzle ORM | ORM migration setup costs 20+ minutes. Supabase's auto-generated REST API and JS client are sufficient for a demo. | Supabase JS client directly |
| create-react-app | Deprecated. Slow cold start. Dead project. | `npm create vite@latest` |

## Stack Patterns by Variant

**For the graph visualization (Obsidian-style):**
- Use `react-force-graph-2d` with `nodeCanvasObject` prop for custom node rendering (colored circles with interest labels)
- Configure `d3AlphaDecay={0.02}` and `d3VelocityDecay={0.3}` for Obsidian-like settling behavior
- Color nodes by type: person nodes (blue), interest nodes (green), shared nodes (gold)

**For LLM chat history analysis:**
- Accept file upload (JSON export from Claude.ai / ChatGPT) — simplest path for hackathon
- Send conversation content to `claude-haiku-4-5` with a structured extraction prompt
- Use `zod` to validate the returned JSON schema before storing in Supabase
- Return: `{ interests: string[], personality_traits: string[], thinking_style: string, topics: string[] }`

**For matching algorithm:**
- Store profiles in Supabase `profiles` table with `interests jsonb`, `classes text[]`
- Compute cosine similarity server-side via Supabase Edge Function OR client-side with a simple JS dot product over interest vectors
- For hackathon: client-side JS is fine — query all profiles, score locally, rank

**For UW SSO (simplified):**
- Use Supabase Auth with email/password — add UW email domain validation (`@wisc.edu`)
- Label it "UW Login" in UI — demo judges will understand the simplification
- Do NOT attempt real Shibboleth/SAML integration (multi-day effort)

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| react-force-graph-2d@1.29.x | React 18.x | Tested with React 18. React 19 compatibility not verified — stay on React 18 for the hackathon. |
| Tailwind CSS v4 | Vite 8.x | Use `@tailwindcss/vite` plugin; CSS-first config replaces tailwind.config.js |
| shadcn/ui (current) | Tailwind v3 or v4 | shadcn CLI handles the Tailwind integration automatically |
| Supabase JS ^2.x | Any bundler | ESM-compatible, Vite handles it without config |
| Zustand 5.x | React 18+ | Requires React 18 for concurrent-safe updates |

## Sources

- [Anthropic Models Overview](https://platform.claude.com/docs/en/about-claude/models/overview) — Model IDs, pricing, context windows (HIGH confidence, fetched directly)
- [react-force-graph npm](https://www.npmjs.com/package/react-force-graph) — Version 1.48.2 bundle, react-force-graph-2d@1.29.1 (HIGH confidence)
- [Vite 8 announcement](https://vite.dev/blog/announcing-vite8) — Vite 8 is current stable (HIGH confidence)
- [Zustand npm](https://www.npmjs.com/package/zustand) — Version 5.0.12, 20M weekly downloads (HIGH confidence via WebSearch)
- [Supabase Realtime docs](https://supabase.com/docs/guides/realtime/getting_started) — WebSocket pub/sub, RLS integration (HIGH confidence)
- [shadcn/ui handbook 2026](https://shadcnspace.com/blog/shadcn-ui-handbook) — Setup patterns, bundle size (MEDIUM confidence via WebSearch)
- [Vite vs Next.js 2026 comparison](https://designrevision.com/blog/vite-vs-nextjs) — Hackathon recommendation (MEDIUM confidence via WebSearch)

---
*Stack research for: campus social matching web app (ConnectUW)*
*Researched: 2026-04-14*
