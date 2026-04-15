# ConnectUW

## What This Is

A web app for UW-Madison students that analyzes their LLM chat history (Claude, ChatGPT, etc.) to build rich interest and personality profiles, then matches them with compatible people in their classes and across campus. Built for the ClaudeHacks hackathon to address the loneliness epidemic on a 50,000-person campus where students sit next to strangers every day.

## Core Value

Help students discover compatible people they'd never otherwise meet — by understanding who they actually are through their AI conversations, not curated social media personas.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Users can sign in via UW Shibboleth/SSO
- [ ] Users can connect their LLM chat history (Claude/ChatGPT) via API/OAuth
- [ ] System analyzes chat history to extract interests, thinking style, and personality traits
- [ ] Users see their own generated interest/personality profile
- [ ] Users get matched with compatible people campus-wide with similarity percentage scores
- [ ] Users can view a class-specific tab showing classmates on the platform with compatibility scores
- [ ] Obsidian-style interest graph visualization showing connections between people and their interests as nodes
- [ ] In-app messaging between matched users
- [ ] System suggests meetup opportunities based on shared classes/schedule proximity
- [ ] Group matching — suggest potential friend groups of 3+ compatible people
- [ ] Class schedules populated via Canvas LMS API (personal access token for demo, OAuth2 for production)

### Out of Scope

- MyUW integration — no public API exists; Canvas covers course data
- Full OAuth2 Canvas integration — requires institutional Developer Key; using personal access token for demo
- Native mobile app — web app only
- Real UW Shibboleth integration complexity — simplified auth simulating SSO flow
- Content moderation system — not needed for demo
- Push notifications — not needed for demo

## Context

- **Hackathon**: ClaudeHacks at UW-Madison, 1 hour build time, team of 3
- **Prompt theme**: Building better tools for human connection — countering isolation created by social media and ideological silos
- **Key insight**: LLM chat history is an unfiltered window into how people actually think — unlike curated social profiles
- **Target users**: UW-Madison students who feel disconnected despite being surrounded by 50,000 peers
- **Demo strategy**: Real course data from Canvas API, focus on the "wow" of the interest graph and matching algorithm
- **Canvas API**: Base URL `https://canvas.wisc.edu/api/v1/`, auth via personal access token, endpoints: `/courses`, `/courses/:id/assignments`, `/courses/:id/users`

## Constraints

- **Timeline**: 1 hour hackathon — every feature must ship fast
- **Team**: 3 people — work must be parallelizable
- **Tech stack**: Whatever ships fastest (to be determined by research)
- **Data**: Course data from Canvas API (`canvas.wisc.edu/api/v1/courses`); LLM chat history via API/OAuth where possible, fallback to upload
- **Auth**: UW SSO login (simplified for demo)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Web app over mobile | Faster to build, works on all devices | — Pending |
| Canvas API with personal access token | Rich REST API available at canvas.wisc.edu; personal token works for demo, OAuth2 needs institutional approval for production | — Accepted |
| Skip MyUW integration | No public API; Canvas already covers course/enrollment data | — Accepted |
| LLM history as primary signal | Unfiltered view of interests/personality vs curated profiles | — Pending |
| Obsidian-style graph visualization | Visually compelling for demo, shows connections intuitively | — Pending |

---
*Last updated: 2026-04-14 — added Canvas API integration, dropped MyUW (no API)*
