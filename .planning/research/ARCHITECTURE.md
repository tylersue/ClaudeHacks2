# Architecture Research

**Domain:** Social matching app with AI analysis and graph visualization
**Researched:** 2026-04-14
**Confidence:** HIGH

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser (React/Next.js)               │
├────────────────┬────────────────┬───────────────────────────┤
│  Upload/Auth   │  Graph View    │  Match Feed / Messaging   │
│  (file input,  │  (D3 force-    │  (compatibility scores,   │
│   mock SSO)    │   directed)    │   chat UI)                │
└────────┬───────┴───────┬────────┴────────────┬──────────────┘
         │               │                     │
┌────────┴───────────────┴─────────────────────┴──────────────┐
│                  Next.js API Routes (monolith)               │
├──────────────┬──────────────────┬───────────────────────────┤
│  /api/ingest │  /api/match      │  /api/messages            │
│  /api/analyze│  /api/graph      │  /api/classes             │
└──────────────┴────────┬─────────┴───────────────────────────┘
                        │
         ┌──────────────┴──────────────┐
         │       Service Layer         │
         │  AnalysisService            │
         │  MatchingService            │
         │  GraphBuilderService        │
         └──────────────┬──────────────┘
                        │
         ┌──────────────┴──────────────┐
         │  External / Data Layer      │
         ├──────────────┬──────────────┤
         │  Claude API  │  SQLite DB   │
         │  (Anthropic) │  (profiles,  │
         │              │   matches,   │
         │              │   messages)  │
         └──────────────┴──────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| Auth / Mock SSO | Session management, user identity | NextAuth.js with credentials provider simulating SSO |
| Ingest Handler | Accept chat export files (JSON/text), validate, queue for analysis | Next.js API route + multipart or text body |
| Analysis Service | Send raw chat text to Claude API, parse structured profile back | Server-side service calling Anthropic SDK |
| Profile Store | Persist user profile (interests[], personality{}, thinking_style) | SQLite table via Prisma or better-sqlite3 |
| Matching Service | Compute cosine similarity across interest/personality vectors | In-process JS, pre-computed on profile creation |
| Graph Builder | Produce nodes/edges JSON for D3 from profiles and match scores | Stateless function: profiles in → graph JSON out |
| Graph View | Render force-directed Obsidian-style graph, interactive | react-force-graph (wraps D3 internally) |
| Match Feed | Ranked list of compatible users with scores, class filter tab | React component consuming /api/match |
| Messaging | Simple in-app chat between matched users | SQLite messages table, polling or SSE |
| Mock Class Data | Static fixture providing class → user memberships | JSON file or seeded SQLite rows |

## Recommended Project Structure

```
src/
├── app/                     # Next.js App Router pages
│   ├── page.tsx             # Landing / upload page
│   ├── dashboard/page.tsx   # Main view post-login
│   ├── graph/page.tsx       # Interest graph visualization
│   └── messages/page.tsx    # Messaging UI
├── api/                     # Next.js API routes (under app/api/)
│   ├── ingest/route.ts      # POST: accept chat export
│   ├── analyze/route.ts     # POST: trigger Claude analysis
│   ├── match/route.ts       # GET: return ranked matches
│   ├── graph/route.ts       # GET: return graph nodes/edges
│   ├── messages/route.ts    # GET/POST: messages
│   └── classes/route.ts     # GET: mock class data
├── services/                # Business logic, no HTTP concerns
│   ├── analysis.ts          # Calls Claude API, returns Profile
│   ├── matching.ts          # Cosine similarity across profiles
│   └── graphBuilder.ts      # Transforms profiles → graph JSON
├── lib/
│   ├── db.ts                # SQLite connection (better-sqlite3)
│   ├── claude.ts            # Anthropic SDK wrapper
│   └── mockData.ts          # Seeded class schedules
├── components/
│   ├── GraphView.tsx        # react-force-graph wrapper
│   ├── MatchCard.tsx        # Single match with score
│   ├── ChatWindow.tsx       # Messaging UI
│   └── ProfileCard.tsx      # User interest summary
└── types/
    └── index.ts             # Profile, Match, GraphNode, Message
```

### Structure Rationale

- **services/:** Keeps Claude API calls and matching math out of route handlers — each is independently testable and swappable without touching HTTP layer.
- **lib/db.ts:** Single DB connection instance avoids SQLite locking issues common in Next.js serverless context.
- **mockData.ts:** Isolated from real data paths so demo scaffolding is never mixed into production logic.

## Architectural Patterns

### Pattern 1: Extract-Then-Store (for AI analysis)

**What:** Call Claude API once on upload, store the structured profile immediately. All downstream features (matching, graph) read from the stored profile — never re-call Claude at request time.

**When to use:** Always. Re-calling the LLM per-request is too slow for demo UX and burns API budget.

**Trade-offs:** Profile is a snapshot; updating requires re-analysis. Fine for a hackathon.

**Example:**
```typescript
// services/analysis.ts
export async function analyzeChat(rawText: string): Promise<Profile> {
  const response = await anthropic.messages.create({
    model: "claude-opus-4-5",
    max_tokens: 1024,
    messages: [{
      role: "user",
      content: `Extract interests, personality traits, and thinking style from this chat history. Return JSON only.\n\n${rawText}`
    }]
  });
  return JSON.parse(response.content[0].text) as Profile;
}

// api/ingest/route.ts
const profile = await analyzeChat(rawText);
db.prepare("INSERT INTO profiles ...").run(userId, JSON.stringify(profile));
```

### Pattern 2: Pre-computed Match Scores

**What:** Compute and cache match scores for all user pairs at profile creation time. Store in a `matches` table. Match feed is a simple DB read.

**When to use:** When user count is small (demo scale). Avoids runtime cosine math on every page load.

**Trade-offs:** Stale if new users join mid-session. Fine for demo; just re-compute on each ingest.

**Example:**
```typescript
// services/matching.ts
export function cosineSimilarity(a: number[], b: number[]): number {
  const dot = a.reduce((sum, ai, i) => sum + ai * b[i], 0);
  const magA = Math.sqrt(a.reduce((sum, ai) => sum + ai * ai, 0));
  const magB = Math.sqrt(b.reduce((sum, bi) => sum + bi * bi, 0));
  return dot / (magA * magB);
}

export function buildInterestVector(profile: Profile, allInterests: string[]): number[] {
  return allInterests.map(i => profile.interests.includes(i) ? 1 : 0);
}
```

### Pattern 3: Graph-as-Derived-View

**What:** The interest graph is not stored — it is computed on demand from profiles in the DB and returned as nodes/edges JSON. Graph state lives entirely in the frontend (react-force-graph).

**When to use:** Always for a hackathon. Storing graph state is premature optimization.

**Trade-offs:** Recomputed on each graph load. With <100 users this is instant.

**Example:**
```typescript
// services/graphBuilder.ts
export function buildGraph(profiles: Profile[]): GraphData {
  const nodes = profiles.map(p => ({ id: p.userId, name: p.name, group: "user" }));
  const interestNodes = [...new Set(profiles.flatMap(p => p.interests))]
    .map(i => ({ id: i, name: i, group: "interest" }));
  const links = profiles.flatMap(p =>
    p.interests.map(i => ({ source: p.userId, target: i }))
  );
  return { nodes: [...nodes, ...interestNodes], links };
}
```

## Data Flow

### Chat History Ingestion Flow

```
User uploads file / pastes text
    ↓
POST /api/ingest (raw text)
    ↓
AnalysisService → Claude API (structured prompt)
    ↓
Claude returns JSON { interests[], personality{}, thinking_style }
    ↓
Profile saved to SQLite profiles table
    ↓
MatchingService recomputes all pair similarities
    ↓
Match scores upserted to SQLite matches table
    ↓
Response: { profileId, previewProfile }
```

### Match Feed Flow

```
User views dashboard
    ↓
GET /api/match?userId=X&filter=class|campus
    ↓
DB query: SELECT matches WHERE userId=X ORDER BY score DESC
    ↓
Optional class filter: JOIN mock class memberships
    ↓
Response: [{ userId, name, score, sharedInterests[] }]
    ↓
MatchCard components rendered
```

### Graph Visualization Flow

```
User opens graph view
    ↓
GET /api/graph?scope=campus|class
    ↓
GraphBuilderService reads all profiles from DB
    ↓
Returns { nodes: [], links: [] }
    ↓
react-force-graph renders force-directed layout
    ↓
Click node → highlight that user's connections
    ↓
Click user node → open MatchCard / message
```

### Messaging Flow

```
User clicks "Message" on match card
    ↓
POST /api/messages { toUserId, text }
    ↓
Saved to SQLite messages table
    ↓
GET /api/messages?withUserId=Y (polled every 2s)
    ↓
ChatWindow renders conversation
```

### Key Data Flows Summary

1. **Ingest → Analyze → Store:** One-time per user, blocks on Claude API (~2-5s), everything else is reads
2. **Profile → Vector → Similarity:** Computed at ingest time, stored; match feed is O(1)
3. **Profiles → Graph JSON → D3:** Stateless transform, fast, graph state owned by browser
4. **Messages → Poll → UI:** Simplest possible approach — no WebSocket complexity for a demo

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0-50 users (demo) | Monolith is perfect. SQLite in-process. Pre-compute matches in-process. |
| 50-1k users | Move to Postgres (Neon/Supabase). Add job queue for analysis (BullMQ). |
| 1k-100k users | Separate analysis worker service. Add pgvector for similarity search. Cache match results in Redis. |
| 100k+ users | ANN index (Pinecone/Weaviate), dedicated graph DB for connections. Out of scope. |

### Scaling Priorities

1. **First bottleneck:** Claude API latency during ingest — mitigate with async queue + status polling even at demo scale
2. **Second bottleneck:** SQLite write locking if multiple users upload simultaneously — mitigate by serializing writes or switching to Postgres

## Anti-Patterns

### Anti-Pattern 1: Calling Claude at Match-Read Time

**What people do:** Call the AI API inside `/api/match` to "freshly analyze" interests each time the feed loads.

**Why it's wrong:** 2-5 second API call per page load. Demo dies. Burns quota.

**Do this instead:** Analyze once at ingest, store the structured profile. Feed reads from DB only.

### Anti-Pattern 2: Storing Graph State Server-Side

**What people do:** Build a graph database (Neo4j, etc.) or store nodes/edges in a dedicated table, update it on every profile change.

**Why it's wrong:** Massive setup overhead. The graph is a view over profile data, not a primary data model. At hackathon scale this is pure waste.

**Do this instead:** Derive the graph on-demand in GraphBuilderService. Frontend owns rendering state.

### Anti-Pattern 3: Microservices for a 1-Hour Hackathon

**What people do:** Separate "analysis service," "matching service," and "API gateway" as distinct deployed services with REST or gRPC between them.

**Why it's wrong:** 45 minutes of the hour is config, CORS, and debugging network boundaries. Nothing ships.

**Do this instead:** Everything in one Next.js app. Services are modules in `src/services/`, not network processes.

### Anti-Pattern 4: Building Custom Graph Rendering

**What people do:** Write raw D3 simulation code from scratch — force physics, link/node rendering, zoom, drag.

**Why it's wrong:** 2+ hours of work for a graph that will have bugs. Not the differentiator.

**Do this instead:** Use `react-force-graph`. Drop in `<ForceGraph2D data={graphData} />`. Style nodes with color by group. Move on.

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Anthropic Claude API | Server-side SDK call in AnalysisService | Use claude-opus-4-5 for quality; add structured output prompt to guarantee JSON response |
| ChatGPT export | File upload (ZIP → JSON parse) | ChatGPT exports as `conversations.json` inside a ZIP; Claude exports as JSON directly |
| Mock Canvas/MyUW | Static JSON fixture in lib/mockData.ts | Seed 5-10 fake classes with pre-assigned user arrays |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| React components ↔ API routes | fetch() / SWR | SWR gives automatic revalidation for match feed; use for polling messages too |
| API routes ↔ Services | Direct function call (same process) | No HTTP overhead, no serialization — just import |
| Services ↔ DB | better-sqlite3 synchronous calls | Sync SQLite is simpler in Next.js than async; no connection pool needed at demo scale |
| GraphBuilder ↔ react-force-graph | Plain JS object `{ nodes, links }` | react-force-graph expects exactly this shape — no adapter needed |

## Build Order (Dependency Chain)

Build in this order to unblock parallel team members fastest:

```
1. DB schema + lib/db.ts          (blocks everything — do first, 5 min)
    ↓
2. Mock data + /api/classes        (unblocks class tab, independent of AI)
   Claude SDK + AnalysisService    (unblocks all AI features)
    ↓
3. /api/ingest + /api/analyze      (first real feature: profile creation)
   MatchingService                 (can be built in parallel with ingest)
    ↓
4. /api/match + MatchCard UI       (core value prop visible)
   GraphBuilderService + /api/graph (graph data ready)
    ↓
5. GraphView (react-force-graph)   (WOW moment — wire up last)
   Messaging UI                    (nice-to-have, add if time permits)
```

**Team split suggestion (3 people):**
- Person A: Auth + DB schema + ingest/analyze pipeline + Claude integration
- Person B: Matching logic + match feed UI + class filter tab
- Person C: Graph visualization (react-force-graph) + mock data + messaging

## Sources

- [react-force-graph GitHub](https://github.com/vasturiano/react-force-graph) — MEDIUM confidence (GitHub, actively maintained)
- [sqlite-vec for vector embeddings](https://dev.to/stephenc222/how-to-use-sqlite-vec-to-store-and-query-vector-embeddings-58mf) — MEDIUM confidence (verified with SQLite forum)
- [Next.js App Router 2026 patterns](https://dev.to/teguh_coding/nextjs-app-router-the-patterns-that-actually-matter-in-2026-146) — MEDIUM confidence (community, aligns with official Next.js docs)
- [D3 force graph implementation](https://dev.to/nigelsilonero/how-to-implement-a-d3js-force-directed-graph-in-2025-5cl1) — MEDIUM confidence
- [Next.js API Routes official docs](https://nextjs.org/docs/pages/building-your-application/routing/api-routes) — HIGH confidence (official)

---
*Architecture research for: Campus social matching app with AI analysis and graph visualization*
*Researched: 2026-04-14*
