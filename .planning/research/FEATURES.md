# Feature Research

**Domain:** Campus social matching / people-discovery app
**Researched:** 2026-04-14
**Confidence:** MEDIUM — market research via WebSearch, verified against multiple competitor sources

---

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| User profile with photo and bio | Every social app has this; no profile = no trust | LOW | For hackathon: name, year, major, 2-3 interest tags is enough |
| Compatibility/match score | Core promise of a "matching" app; users expect to see a number | MEDIUM | Percentage score derived from LLM analysis output |
| List of matched people | Users expect to browse who they are compatible with | LOW | Sorted by score descending; minimal card UI |
| In-app messaging or contact handoff | After matching, users need a next step to connect | MEDIUM | For demo: simplify to "send message" stub or reveal email/Discord |
| Some form of auth / identity verification | Campus app must be campus-specific; anonymous signup kills trust | LOW | Simplified UW SSO simulation (email domain check) is sufficient |
| Own profile / self-view | Users want to see what the system extracted about them | LOW | Show generated interest tags and personality summary |
| Opt-in / consent flow for data use | Users sharing LLM history expect to know what happens to it | LOW | One-screen consent before analysis; critical for trust |

### Differentiators (Competitive Advantage)

Features that set the product apart. Not required, but valuable.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| LLM chat history as profile signal | Authentic, unfiltered personality signal vs. curated self-presentation; unique to this product | HIGH | Core differentiator — the entire product premise; worth the complexity |
| Personality + thinking-style extraction | Goes beyond hobbies to surface HOW people think (analytical, creative, empathetic); richer than interest tags alone | HIGH | Use Claude API to produce Big Five-style or custom trait labels from conversation history |
| Class-based match tab | Narrows the social graph to people in your actual classes — immediately actionable | MEDIUM | Works well with mock schedule data; makes matches feel hyper-relevant |
| Obsidian-style interest graph visualization | Visually striking demo moment; makes abstract "connections" tangible as a node graph | HIGH | Use a library like Cytoscape.js or react-force-graph; high wow-factor for judges |
| Group match suggestions (3+ people) | Most friend-finding apps are 1:1; group matching mirrors how friendships actually form on campus | HIGH | Computationally: find triads with mutual high pairwise scores; impressive but non-trivial |
| "Why you match" explanation | Surfaces which specific interests or traits caused the match; builds trust in the algorithm | LOW | Pull top-N shared topics from both LLM analysis outputs and list them |
| Meetup opportunity suggestion | "You both have free time Tuesday at 11am near Bascom" — turns match into action | MEDIUM | Requires schedule data; achievable with mock data |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but create problems.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Swipe/accept-reject mechanic | Familiar from Tinder/Hinge; feels like matching | Introduces asymmetric rejection anxiety; undermines the "compatible people" framing; scope creep for 1-hour build | Show ranked list with mutual opt-in messaging instead |
| Fully bidirectional real-time chat | Users want to message matches | Real-time infra (WebSockets, presence) is a time sink; crashes demos | Async message send + email notification stub, or just reveal contact info |
| Interest self-tagging / manual profile builder | Users want control over their profile | Contradicts the core value prop (authentic signal from LLM history vs. curated self-presentation) | Show auto-extracted tags but allow user to hide/remove tags they dislike |
| Like / heart on profiles | Social validation mechanic feels familiar | Creates social anxiety, gamification of people; conflicts with the "connection not validation" framing | Replace with "connect" or "say hi" single action |
| Algorithmic feed of posts/content | Users may expect a social feed | Completely out of scope; dilutes the matching focus | Stick to match list + messaging only |
| Leaderboard / match count metrics | Gamification can drive engagement | Makes users feel like objects to be collected; harmful for a loneliness-reduction product | Remove all public metrics; keep scores private |
| Real Canvas/MyUW API integration | Would make class data accurate | UW API access requires institutional agreements; impossible in 1-hour hackathon | Mock class schedule JSON with realistic UW course names |

---

## Feature Dependencies

```
[LLM History Upload / OAuth Connect]
    └──requires──> [User Auth]
    └──enables──> [Interest + Personality Extraction]
                      └──enables──> [Own Profile View]
                      └──enables──> [Compatibility Score Calculation]
                                        └──enables──> [Match List]
                                        └──enables──> [Class Match Tab]
                                        └──enables──> [Group Match Suggestions]
                                        └──enables──> [Interest Graph Visualization]

["Why You Match" Explanation]
    └──requires──> [Compatibility Score Calculation]

[Meetup Suggestion]
    └──requires──> [Class Match Tab]
    └──requires──> [Mock Schedule Data]

[In-App Messaging]
    └──requires──> [Match List]
    └──requires──> [User Auth]
```

### Dependency Notes

- **LLM History Upload requires User Auth:** Cannot store or attribute extracted profile data without an identity.
- **All matching features require Extraction:** The compatibility score is derived entirely from LLM-extracted traits; without extraction there is nothing to match on.
- **Interest Graph requires Match List:** The graph nodes are the matched users; it is a visual layer on top of the match list, not a standalone feature.
- **Group Matching requires pairwise scores:** Cannot compute compatible triads until all pairwise compatibility scores exist.
- **Class Match Tab requires Mock Schedule Data:** This is a view filter on the Match List — only show matches who share a course ID. Schedule data (even mocked) must exist first.

---

## MVP Definition

### Launch With (v1) — Hackathon Demo Core

Minimum viable product to validate the concept and win the demo.

- [ ] User auth (UW email domain check, simulated SSO) — establishes campus identity, required for everything
- [ ] LLM history upload (file upload fallback if OAuth unavailable) — the core differentiator input
- [ ] Interest + personality extraction via Claude API — the magic moment
- [ ] Own profile view showing extracted tags and summary — user sees value immediately
- [ ] Match list with compatibility scores — core output; answers "who do I connect with?"
- [ ] "Why you match" blurb for top matches — makes the score feel trustworthy, not black-box
- [ ] Interest graph visualization — the "wow" demo moment for judges; visually distinctive

### Add After Validation (v1.x)

Features to add once core is working.

- [ ] Class-based match tab — trigger: schedule mock data is loaded and match list works
- [ ] Meetup time suggestion — trigger: class tab is working, schedule overlap is computable
- [ ] In-app messaging — trigger: users are actually making matches and need a next step

### Future Consideration (v2+)

Features to defer until product-market fit is established.

- [ ] Group match suggestions (3+) — computationally heavier; impressive but not essential for demo
- [ ] Real UW SSO (Shibboleth) integration — requires institutional partnership
- [ ] Real Canvas/MyUW API for schedules — same institutional barrier
- [ ] Push / email notifications — infrastructure overhead; not needed for hackathon

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| User Auth (email domain) | HIGH | LOW | P1 |
| LLM history upload | HIGH | LOW | P1 |
| Interest/personality extraction | HIGH | MEDIUM | P1 |
| Own profile view | HIGH | LOW | P1 |
| Match list with scores | HIGH | MEDIUM | P1 |
| "Why you match" explanation | HIGH | LOW | P1 |
| Interest graph visualization | HIGH (demo) | MEDIUM | P1 |
| Class match tab | MEDIUM | LOW | P2 |
| Meetup suggestion | MEDIUM | MEDIUM | P2 |
| In-app messaging | MEDIUM | MEDIUM | P2 |
| Group match suggestions | MEDIUM | HIGH | P3 |
| Real SSO / Canvas integration | LOW (hackathon) | HIGH | P3 |

**Priority key:**
- P1: Must have for launch — hackathon demo fails without these
- P2: Should have, add when possible — strengthens demo
- P3: Nice to have, future consideration — cut if time-constrained

---

## Competitor Feature Analysis

| Feature | ZeeMee / Friended | Bumble BFF (revamped) | Lunchclub (professional) | ConnectUW Approach |
|---------|-------------------|----------------------|--------------------------|-------------------|
| Profile input | Self-reported interests, photos | Bios, interest tags, photo prompts | Goals, background questionnaire | Auto-extracted from LLM chat history |
| Matching signal | Shared interests, school, major | Interest tags, proximity | Professional goals + AI | Personality + thinking style + interests from actual conversations |
| Match presentation | Browse list with filters | Swipe or browse groups | One curated match per week | Ranked list + graph visualization |
| Campus specificity | School-filtered | Location filter only | None (professional network) | Class-level granularity via schedule data |
| Group matching | Groups/chats | Groups feature | None | Planned (v1.x) |
| Explanation of match | None | None | Opaque | "Why you match" blurb |
| Auth | Email signup | Phone number | Email | UW email domain (simulated SSO) |

---

## Hackathon-Specific Notes

**What makes this demo compelling to judges:**

1. The "wow" moment is when a user uploads their LLM history and immediately sees a personality profile they recognize as accurate. Build toward this moment.
2. The interest graph is visually distinctive — no competitor does this. Make it the first thing visible after matching.
3. The class-specific tab makes the product feel immediately actionable, not theoretical.
4. The "Why you match" explanation prevents the score from feeling like a black box.

**What to cut without hesitation if time runs short:**

- Group matching (complex graph computation)
- Meetup scheduling (schedule overlap logic)
- Real messaging (async stub is fine for demo)

**What cannot be cut:**

- LLM history upload + extraction (the entire product premise)
- Match list with scores (the core output)
- Interest graph (the demo's visual centerpiece)

---

## Sources

- [ZeeMee college friend-finding app](https://apps.apple.com/us/app/zeemee-meet-college-friends/id1044878258) — table stakes feature reference
- [Penn Marriage Pact / Penn Date Drop](https://www.34st.com/article/2026/02/college-matchmaking-platforms-competition) — campus algorithmic matching patterns
- [Bumble BFF revamp (TechCrunch, Sep 2025)](https://techcrunch.com/2025/09/18/bumble-bffs-revamped-app-is-here-focusing-on-friend-groups-and-community-building/) — group matching, interest tags, friend-finding UX patterns
- [Lunchclub AI networking](https://medium.com/lightspeed-venture-partners/lunchclub-the-future-of-professional-networking-429b25d82bb1) — curated AI matching model reference
- [LLM user interest profiling research (ResearchGate)](https://www.researchgate.net/figure/llustration-of-using-an-LLM-for-user-interest-profiling-The-input-provided-to-the-LLM-is_fig2_384741809) — LLM-based profile extraction feasibility
- [PersonalityLens (ScienceDirect)](https://www.sciencedirect.com/science/article/abs/pii/S0097849325002936) — LLM personality visualization from dialogue data
- [JMIR Smartphone App for College Loneliness](https://mental.jmir.org/2020/10/e21496/) — evidence that digital tools reduce campus loneliness

---

*Feature research for: campus social matching / people-discovery (ConnectUW)*
*Researched: 2026-04-14*
