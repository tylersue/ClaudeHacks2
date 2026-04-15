---
phase: 1
slug: foundation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-14
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest |
| **Config file** | none — Wave 0 installs |
| **Quick run command** | `npx vitest run` |
| **Full suite command** | `npx vitest run --reporter=verbose` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run`
- **After every plan wave:** Run `npx vitest run --reporter=verbose`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 01-01 | 01 | 0 | AUTH-01 | unit | `npx vitest run src/tests/auth.test.ts` | ❌ W0 | ⬜ pending |
| 01-02 | 01 | 0 | AUTH-02 | unit | `npx vitest run src/tests/upload.test.ts` | ❌ W0 | ⬜ pending |
| 01-03 | 01 | 0 | AUTH-03 | unit | `npx vitest run src/tests/canvas.test.ts` | ❌ W0 | ⬜ pending |
| 01-04 | 01 | 1 | AUTH-01 | smoke | Manual browser check | N/A | ⬜ pending |
| 01-05 | 01 | 1 | AUTH-03 | smoke | Manual browser check | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] Install vitest: `npm install -D vitest`
- [ ] `src/tests/auth.test.ts` — covers AUTH-01 domain validation logic
- [ ] `src/tests/upload.test.ts` — covers AUTH-02 JSON parse + format detection
- [ ] `src/tests/canvas.test.ts` — covers AUTH-03 fetch helper with mocked fetch

*Existing infrastructure covers no phase requirements — all Wave 0.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Sign-in redirects to dashboard | AUTH-01 | Requires browser + Supabase auth flow | Sign in with @wisc.edu email, verify dashboard loads |
| Course list renders from Canvas | AUTH-03 | Requires live Canvas API + real token | Enter valid PAT, verify courses appear |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
