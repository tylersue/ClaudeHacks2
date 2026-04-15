# Requirements: ConnectUW

**Defined:** 2026-04-14
**Core Value:** Help students discover compatible people they'd never otherwise meet — by understanding who they actually are through their AI conversations, not curated social media personas.

## v1 Requirements

### Onboarding & Auth

- [ ] **AUTH-01**: User can sign in via simplified UW SSO flow
- [ ] **AUTH-02**: User can upload LLM chat history (Claude/ChatGPT JSON export)
- [ ] **AUTH-03**: User can connect Canvas course schedule via personal access token

### Profile & Analysis

- [ ] **PROF-01**: System analyzes uploaded chat history to extract interests, thinking style, and personality traits using Claude API
- [ ] **PROF-02**: User can view their generated profile with multi-dimensional breakdown
- [ ] **PROF-03**: Profile displays separate sections for interests, personality, and thinking style

### Matching

- [ ] **MTCH-01**: User sees ranked list of compatible people with similarity percentage scores
- [ ] **MTCH-02**: Each match shows shared interests/traits explaining the compatibility score
- [ ] **MTCH-03**: User can view class-specific tab filtering matches to classmates in specific courses

### Visualization

- [ ] **VIZN-01**: Obsidian-style interest graph showing people and interests as interconnected nodes with interactive exploration

### Communication

- [ ] **COMM-01**: User can send and receive messages with matched users in-app
- [ ] **COMM-02**: System suggests meetup opportunities based on shared classes/schedule proximity

## v2 Requirements

### Matching Enhancements

- **MTCH-04**: Group matching — suggest potential friend groups of 3+ compatible people
- **MTCH-05**: Campus-wide vs class-specific match toggle with different weighting

### Integration

- **INTG-01**: OAuth2 Canvas integration (requires institutional Developer Key)
- **INTG-02**: Direct LLM API/OAuth connection (Claude, ChatGPT) instead of file upload
- **INTG-03**: Real UW Shibboleth SSO integration

### Social

- **SOCL-01**: User profiles visible to matches with customizable privacy settings
- **SOCL-02**: Event-based meetup suggestions tied to campus calendar

## Out of Scope

| Feature | Reason |
|---------|--------|
| Native mobile app | Web-first; responsive design covers mobile browsers |
| MyUW integration | No public API exists; Canvas covers course data |
| Content moderation | Not needed for hackathon demo |
| Push notifications | Not needed for hackathon demo |
| Swipe/reject mechanics | Creates anxiety, contradicts the connection-first framing |
| Real-time video/voice chat | Complexity far exceeds hackathon scope |
| Manual self-tagging of interests | Undermines the authentic-signal value prop of LLM analysis |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01 | Phase 1 | Pending |
| AUTH-02 | Phase 1 | Pending |
| AUTH-03 | Phase 1 | Pending |
| PROF-01 | Phase 2 | Pending |
| PROF-02 | Phase 2 | Pending |
| PROF-03 | Phase 2 | Pending |
| MTCH-01 | Phase 3 | Pending |
| MTCH-02 | Phase 3 | Pending |
| MTCH-03 | Phase 3 | Pending |
| VIZN-01 | Phase 3 | Pending |
| COMM-01 | Phase 4 | Pending |
| COMM-02 | Phase 4 | Pending |

**Coverage:**
- v1 requirements: 12 total
- Mapped to phases: 12
- Unmapped: 0

---
*Requirements defined: 2026-04-14*
*Last updated: 2026-04-14 — traceability updated after roadmap creation*
