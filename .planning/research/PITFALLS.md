# Pitfalls Research

**Domain:** Campus social matching app (LLM chat history analysis, graph visualization, in-app messaging)
**Researched:** 2026-04-14
**Confidence:** HIGH for hackathon-specific pitfalls; MEDIUM for domain-specific matching pitfalls

---

## Critical Pitfalls

### Pitfall 1: Treating In-App Messaging as a "Simple Add-On"

**What goes wrong:**
The team underestimates real-time chat. WebSockets require connection management, reconnection logic, message persistence, delivery guarantees, and presence state. Building this from scratch in a 1-hour hackathon consumes the entire backend budget and produces a fragile demo that fails under judges' eyes.

**Why it happens:**
Chat feels conceptually simple — "just send a message." The gap between the concept and production-ready WebSocket infrastructure is invisible until you're 40 minutes into the build.

**How to avoid:**
Use a managed real-time layer. Supabase Realtime (already in the likely stack) supports subscriptions on DB rows — enough for a demo chat without raw WebSockets. Alternative: mock the chat UI with simulated messages and stub the "send" action; judges care about the matching flow, not whether chat is real-time. Treat messaging as a late Phase feature, not a core deliverable.

**Warning signs:**
- Anyone mentions "let's use Socket.IO" or "let's build a WebSocket server" — stop immediately.
- Messaging gets started before matching + graph are working.

**Phase to address:**
Messaging should be the final phase. Implement only after matching, profile display, and graph are demo-stable. Use Supabase Realtime subscriptions rather than raw WebSockets.

---

### Pitfall 2: Scope Creep Disguised as "Just One More Feature"

**What goes wrong:**
The project list (group matching, meetup suggestions, class-specific tabs, Obsidian-style graph, in-app messaging, SSO auth, LLM ingestion, interest profiles, similarity scores) is a 2-week project compressed into 1 hour. Each feature added in the last 20 minutes is a feature that breaks another. The demo collapses under its own weight.

**Why it happens:**
All three features look achievable individually. The integration tax between them — shared state, data dependencies, routing — is invisible during planning.

**How to avoid:**
Before any code is written, define a "demo critical path" of exactly 3 things that must work: (1) upload/ingest chat history → generate profile, (2) see your match list with scores, (3) see the interest graph. Everything else — group matching, meetup suggestions, messaging — is deferred unless the critical path is complete with 20 minutes to spare. Use a physical or shared doc "cut list" — features get cut, not deferred to "later tonight."

**Warning signs:**
- Someone says "while we're at it, let's also add…"
- The task list grows after coding starts.
- Any single person is blocked waiting for another person's feature.

**Phase to address:**
Phase 0 (pre-build planning). Lock the critical path before the timer starts. No new features added after coding begins.

---

### Pitfall 3: LLM Chat Export Format Incompatibility

**What goes wrong:**
ChatGPT exports as a ZIP with a `conversations.json` file in a specific nested schema. Claude's export is different. Gemini differs again. If the ingestion pipeline is built for one format and the demo uses another, the "wow moment" of uploading your own chat history breaks live.

**Why it happens:**
Developers assume export formats are standardized. They are not. Each provider has a unique schema, and the field names, nesting, and message role labels differ.

**How to avoid:**
Before the hackathon starts, download a real export from ChatGPT and from Claude. Write the parser against the actual file, not documentation. Build one working parser (pick ChatGPT — larger install base for demos) and mock the others. Have a hardcoded fallback dataset (a pre-processed profile JSON) ready so if parsing fails during the demo, you switch to the fallback without the audience noticing.

**Warning signs:**
- Ingestion is being built without a real export file to test against.
- The parser is written from memory of what the format "probably looks like."
- No fallback dataset exists before the demo.

**Phase to address:**
Phase 1 (data ingestion). The fallback dataset must be built in the same phase, not deferred.

---

### Pitfall 4: Graph Visualization Freezing the Browser

**What goes wrong:**
Force-directed graph layouts (the Obsidian-style visualization) are computationally expensive. With even 20 nodes and 100 edges, SVG-based rendering causes visible frame drops. With 50+ nodes it locks the browser during simulation. The demo's most visually impressive feature becomes its most embarrassing moment.

**Why it happens:**
Graph libraries like D3 force simulation run physics calculations on every animation frame in the main thread. SVG element creation is DOM-heavy. Teams test with 5 mock nodes and never discover the real cost.

**How to avoid:**
Use a Canvas-based renderer (Cytoscape.js with the canvas renderer, or react-force-graph which defaults to WebGL via three.js). Pre-compute the layout server-side or before demo time so the graph loads in a settled state rather than animating from random positions. Limit the demo graph to 15-20 nodes maximum — quality of connection over quantity. Pre-freeze the simulation before the demo so no physics calculation runs live.

**Warning signs:**
- D3 SVG force simulation chosen for a "large" graph.
- No performance test run before demo with the actual node count.
- Graph still animating/settling when the demo starts.

**Phase to address:**
Phase 2 (graph visualization). Test with the actual mock data node count immediately after implementing, not after styling.

---

### Pitfall 5: Auth Setup Eating the Build Window

**What goes wrong:**
"UW Shibboleth SSO" is a SAML-based enterprise auth system that requires institutional setup, metadata exchange, and approval from UW IT. This cannot be done during a hackathon. Even "simplified SSO simulation" via OAuth with Google/GitHub can consume 30-60 minutes when cookie handling, middleware, and session refresh are misconfigured in Next.js + Supabase.

**Why it happens:**
Auth feels foundational — teams want to build it first so everything else can rely on it. In practice, auth misconfiguration is a rabbit hole (server vs. client Supabase clients, cookie vs. token, `getUser()` vs. `getSession()` mistakes).

**How to avoid:**
Skip real auth for the demo. Use a hardcoded "demo user" session that bypasses authentication entirely — a single mock user object stored in React context or localStorage. If auth is required for judging, use Supabase email/password auth (no OAuth, no SSO) which takes under 10 minutes to wire up. Never start with SSO.

**Warning signs:**
- Anyone opens the Supabase OAuth configuration panel in the first 15 minutes.
- A callback URL or CORS error appears before any product feature is built.
- The word "Shibboleth" appears in any technical conversation during the build.

**Phase to address:**
Phase 0. Decide on auth strategy before building starts. Default: hardcoded demo session. Upgrade only if time permits.

---

### Pitfall 6: Matching Algorithm Producing Identical or Nonsensical Scores

**What goes wrong:**
The LLM-extracted interest vectors produce similarity scores where every student matches at 94-99%, or where obviously incompatible profiles score identically to compatible ones. Judges notice immediately. The matching is the core value proposition — if it looks random or inflated, the product has no credibility.

**Why it happens:**
Embedding vectors from LLMs are high-dimensional and cosine similarity between them is often high even for dissimilar content (the "hubness" problem). Without normalization, calibration, or diverse mock data, scores cluster near 1.0.

**How to avoid:**
Generate mock profiles with intentionally varied interests — a CS student, a music student, a pre-med student, a political science student. Test the similarity scores before the demo to confirm they produce a believable spread (e.g., 45%-88%). If using cosine similarity, apply a sigmoid or scaling function to spread the distribution. Have the top match and a bottom match visible so judges see differentiation. Hardcode a "best match" pairing for demo purposes if the algorithm doesn't cooperate.

**Warning signs:**
- All similarity percentages are above 90%.
- Similarity percentages are all identical regardless of profile differences.
- The algorithm hasn't been tested against the actual mock profiles.

**Phase to address:**
Phase 1 (matching algorithm). Validate score distribution against mock data before building the UI.

---

### Pitfall 7: The Demo Breaks on Live Data Ingestion

**What goes wrong:**
The demo plan involves uploading a real ChatGPT export file live in front of judges. The LLM API call (Claude/OpenAI analyzing the chat history) is slow (3-30 seconds), times out, returns an unexpected token format, or hits a rate limit. The most compelling demo moment becomes dead air.

**Why it happens:**
Live API calls during demos are unreliable. Network latency, API rate limits, and cold starts are unpredictable in a venue with 50+ people on the same WiFi.

**How to avoid:**
Pre-run the ingestion pipeline before the demo. Cache the output (the extracted interest profile JSON) so the "upload" step in the demo triggers an instant display of pre-computed results. The live upload is theatrical — the real processing happened 30 minutes ago. Have the cached result as a fallback even if the live call succeeds, to swap in if something goes wrong.

**Warning signs:**
- No cached demo dataset exists the day before the presentation.
- The team plans to run ingestion live for the first time in front of judges.
- No fallback if the API call fails or is slow.

**Phase to address:**
Phase 1 (ingestion). Always build with a pre-computed fallback. Never demo a live API call without a cached result ready.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Hardcoded demo user session | Saves 30-60 min on auth | No real auth for real users | Hackathon demo only — never ship |
| Pre-computed graph layout | Graph loads instantly | Not reactive to new users | Acceptable for demo; replace in v1 |
| Mock class schedule data | Avoids Canvas API complexity | Not real-time or accurate | Acceptable; clearly scope-limited |
| Cached LLM ingestion results | Fast demo, no API latency | Stale if data changes | Acceptable; label as "cached" |
| Single-table Supabase schema | Fast to set up | Hard to query at scale | Acceptable for hackathon |
| Polling instead of WebSockets | Simpler messaging setup | Scales poorly, battery drain | Acceptable if messages are low-volume demo |

---

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| ChatGPT export | Assuming format matches documentation | Download a real export first; parse against the actual JSON structure |
| Claude API (analysis) | Sending entire chat history in one prompt | Chunk by conversation, summarize per-conversation, aggregate — or truncate to last 50 messages |
| Supabase Realtime | Using raw WebSockets when Supabase subscriptions exist | Use `supabase.channel()` with `on('postgres_changes', ...)` for messaging |
| Supabase Auth (Next.js) | Using `getSession()` server-side | Always use `getUser()` server-side; `getSession()` is not secure on the server |
| graph library (D3) | SVG renderer for any graph > 10 nodes | Use Canvas or WebGL renderer (Cytoscape.js canvas, react-force-graph) |
| Next.js App Router | Mixing server/client Supabase clients | Create separate `createServerClient` and `createBrowserClient` utilities; never import the wrong one |

---

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Force-directed SVG graph | Frame drops, browser freeze during layout | Use Canvas renderer; pre-settle simulation | > 15 nodes in SVG |
| Real-time LLM analysis during demo | 5-30 second wait, timeouts | Pre-compute and cache results | Any live API call in a demo environment |
| All users loaded for matching | Slow page load if user table is large | Mock data anyway; limit to 20-30 mock profiles | > 50 users without pagination |
| Re-running embedding on every page load | Repeated API costs and latency | Store embeddings in DB on first ingestion | First request after ingestion |
| Unindexed similarity queries | Slow match ranking | For demo scale (20 users), doesn't matter — pre-compute rank order | > 1000 users without vector index |

---

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Storing raw chat history server-side without consent | FERPA-adjacent risk; student data exposure | For demo: store only extracted interest tags, not raw conversation text |
| Exposing Supabase service role key in client code | Full DB access for anyone who inspects the page | Use anon key only in client; service role key only in server-side routes |
| No input validation on file upload | Malformed files crash the ingestion pipeline | Validate file type and size; wrap parser in try/catch with fallback |
| Matching across all users without opt-in | Students matched without consent | Add explicit opt-in step in onboarding; for demo, all mock users are pre-consented |

---

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Showing similarity as raw cosine score (e.g., 0.847) | Meaningless to users; not compelling | Convert to percentage with a friendly label: "87% compatible" |
| Interest graph with no entry point or explanation | Users stare at nodes with no idea what to do | Add a tooltip on first load: "Click any node to see who shares this interest" |
| Match list with no "why" explanation | Users don't trust the match | Show 2-3 shared interests below each match: "Both into: distributed systems, coffee, film noir" |
| Uploading chat history with no progress indicator | Looks broken during the 3-30 second LLM call | Show a processing animation with a message like "Analyzing your conversations…" |
| Empty state if user has no matches | Dead end | Always show at least 3 mock matches for demo; real app needs minimum user density |
| Class tab showing 0 classmates | Breaks the class-matching premise | Ensure at least 2-3 mock profiles share classes with the demo user |

---

## "Looks Done But Isn't" Checklist

- [ ] **Chat ingestion:** Shows success message — but verify the extracted interests are actually stored in the DB, not just logged to the console.
- [ ] **Similarity scores:** Display correctly — but verify they vary meaningfully (not all 95%+) across mock profiles.
- [ ] **Graph visualization:** Renders in development — but verify it loads without frame drops in a fresh browser tab with no dev tools open.
- [ ] **Class tab:** Shows classmates — but verify at least one mock classmate has a compatibility score, not just a name.
- [ ] **Messaging:** Send button works — but verify the message actually persists and appears on refresh (not just in-memory).
- [ ] **Mobile/tablet layout:** Looks fine on your screen — but verify at 768px width; graph and match cards must not overflow.
- [ ] **Fallback dataset:** Exists in code — but verify it can be activated with one line change, not a 5-minute refactor.

---

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Graph freezes browser | LOW | Switch to static image of pre-screenshotted graph; label it "interactive demo"; explain live version coming |
| LLM API times out during demo | LOW | Swap to cached profile JSON; say "I pre-loaded my profile to save time" |
| Messaging fails to send | LOW | Refresh to show pre-seeded messages; say "Let me show you what a conversation looks like" |
| Auth breaks and no one can log in | MEDIUM | Use browser console to manually set the demo session object; if that fails, share your screen already logged in |
| Matching scores look wrong | MEDIUM | Hardcode the top 3 matches in the UI; explain "algorithm outputs are being calibrated" |
| Ingestion parser crashes on export file | LOW | Switch to the fallback dataset; don't attempt to debug live |

---

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Scope creep / feature overload | Phase 0 (pre-build planning) | Critical path is written down and agreed upon before coding starts |
| Auth complexity | Phase 0 | Auth strategy decided: hardcoded session OR email/password only |
| Chat export format mismatch | Phase 1 (ingestion) | Parser tested against real downloaded export file |
| Demo breaks on live API call | Phase 1 (ingestion) | Fallback cached profile JSON exists and is demo-switchable |
| Matching scores clustered / nonsensical | Phase 1 (matching) | Score distribution tested across all mock profiles before UI build |
| Graph performance | Phase 2 (visualization) | Canvas/WebGL renderer chosen; tested with full mock node count |
| Messaging over-engineering | Phase 3 (messaging) | Supabase Realtime used, not raw WebSockets; feature only starts if critical path is complete |

---

## Sources

- Hackathon pitfalls: [Top 5 Mistakes Developers Make at Hackathons](https://medium.com/@BizthonOfficial/top-5-mistakes-developers-make-at-hackathons-and-how-to-avoid-them-d7e870746da1)
- Scope creep: [devRant hackathon scope creep post](https://devrant.com/rants/755008/)
- Cold start / social matching: [How to solve the cold-start problem for social products](https://andrewchen.com/how-to-solve-the-cold-start-problem-for-social-products/)
- Graph performance: [Best Libraries to Render Large Force-Directed Graphs on the Web](https://weber-stephen.medium.com/the-best-libraries-and-methods-to-render-large-network-graphs-on-the-web-d122ece2f4dc)
- Graph at scale: [Graph visualization at scale: strategies that work](https://cambridge-intelligence.com/visualize-large-networks/)
- WebSocket complexity: [WebSockets vs SSE vs Long-Polling](https://rxdb.info/articles/websockets-sse-polling-webrtc-webtransport.html)
- Supabase Auth Next.js pitfalls: [Supabase troubleshooting Next.js auth issues](https://supabase.com/docs/guides/troubleshooting/how-do-you-troubleshoot-nextjs---supabase-auth-issues-riMCZV)
- LLM privacy / data handling: [Study exposes privacy risks of AI chatbot conversations](https://news.stanford.edu/stories/2025/10/ai-chatbot-privacy-concerns-risks-research)
- Matching algorithm oversimplification: [Cosine similarity limitations](https://www.algolia.com/blog/ai/cosine-similarity-what-is-it-and-how-does-it-enable-effective-and-profitable-recommendations)

---
*Pitfalls research for: Campus social matching app (ConnectUW)*
*Researched: 2026-04-14*
