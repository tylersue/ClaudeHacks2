# Roadmap: ConnectUW

## Overview

ConnectUW ships in four phases across a 1-hour hackathon sprint. Phase 1 scaffolds the app and brings in real data (Canvas courses, LLM chat history). Phase 2 runs the Claude API analysis that generates authentic interest profiles. Phase 3 delivers the matching engine and the Obsidian-style graph that makes the demo compelling. Phase 4 closes the loop with in-app messaging and meetup suggestions. Phases 2-4 are designed to be parallelized against each other once Phase 1 data contracts are locked.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Foundation** - App scaffold, auth, Canvas API integration, LLM chat history upload
- [ ] **Phase 2: Intelligence** - Claude API analysis of chat history produces interest/personality profiles
- [ ] **Phase 3: Matching + Graph** - Compatibility matching engine, class-filtered view, Obsidian-style graph
- [ ] **Phase 4: Connection** - In-app messaging and schedule-based meetup suggestions

## Phase Details

### Phase 1: Foundation
**Goal**: The app runs, users can sign in, connect their Canvas courses, and upload their LLM chat history — all real data, no mocks
**Depends on**: Nothing (first phase)
**Requirements**: AUTH-01, AUTH-02, AUTH-03
**Success Criteria** (what must be TRUE):
  1. User can sign in via the UW SSO flow and land on an authenticated dashboard
  2. User can enter a Canvas personal access token and see their actual course list pulled from canvas.wisc.edu
  3. User can upload a Claude or ChatGPT JSON export and the file is accepted and stored
**Plans**: TBD

### Phase 2: Intelligence
**Goal**: Users can see a rich, multi-dimensional profile of their own interests, thinking style, and personality — generated from their uploaded chat history by Claude API
**Depends on**: Phase 1 (uploaded chat history)
**Requirements**: PROF-01, PROF-02, PROF-03
**Success Criteria** (what must be TRUE):
  1. System sends uploaded chat history to Claude API and returns structured profile data
  2. User can view their profile page showing clearly separated interests, personality, and thinking style sections
  3. Profile contains specific, recognizable traits — not generic placeholders
**Plans**: TBD

### Phase 3: Matching + Graph
**Goal**: Users discover compatible people across campus and within their classes, and can explore the connection landscape through an interactive interest graph
**Depends on**: Phase 2 (profiles must exist to match)
**Requirements**: MTCH-01, MTCH-02, MTCH-03, VIZN-01
**Success Criteria** (what must be TRUE):
  1. User sees a ranked list of compatible people with numeric similarity percentage scores
  2. Each match shows the specific shared interests and traits driving the compatibility score
  3. User can switch to a class-specific tab and see only classmates enrolled in a selected course
  4. User can open an Obsidian-style interactive graph where people and interests appear as nodes with visible edges, and clicking a node navigates to it
**Plans**: TBD

### Phase 4: Connection
**Goal**: Users can reach out to matches and receive concrete suggestions for when and where to actually meet
**Depends on**: Phase 3 (matches must exist to message)
**Requirements**: COMM-01, COMM-02
**Success Criteria** (what must be TRUE):
  1. User can send a message to a matched person and the matched person can receive and reply to it
  2. System surfaces at least one meetup suggestion per match that references a real shared class or overlapping schedule window
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4
Note: With 3 people, Phase 2 backend analysis and Phase 3 frontend graph scaffolding can be parallelized once Phase 1 data contracts are locked.

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 0/TBD | Not started | - |
| 2. Intelligence | 0/TBD | Not started | - |
| 3. Matching + Graph | 0/TBD | Not started | - |
| 4. Connection | 0/TBD | Not started | - |
