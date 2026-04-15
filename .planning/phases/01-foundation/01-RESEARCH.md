# Phase 1: Foundation - Research

**Researched:** 2026-04-14
**Domain:** Auth (Supabase email/password + domain gate), Canvas REST API (personal access token), JSON file upload (React FileReader)
**Confidence:** HIGH

---

## Summary

Phase 1 stands up three real data connections with zero mocks: a simplified UW SSO-style auth (Supabase email/password gated to `@wisc.edu`), a live Canvas API integration using a personal access token to pull actual courses from `canvas.wisc.edu`, and a client-side JSON file upload that parses and stores Claude/ChatGPT chat exports.

All three are well-solved problems with known patterns. None require custom infrastructure — Supabase handles auth and storage, a single `fetch()` call hits the Canvas API, and the browser's built-in `FileReader` handles JSON parsing. The entire Foundation phase is achievable in 15-20 minutes of real build time if the team moves directly to known patterns without exploration.

**Primary recommendation:** Supabase email/password auth gated to `@wisc.edu` via a `before-user-created` hook, then `fetch('https://canvas.wisc.edu/api/v1/courses', { headers: { Authorization: 'Bearer <token>' } })`, then `FileReader.readAsText()` + `JSON.parse()` for chat history. Store the token and parsed file in Supabase. Done.

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| AUTH-01 | User can sign in via simplified UW SSO flow | Supabase email/password auth gated to `@wisc.edu` domain via `before-user-created` hook; label UI "UW Login" |
| AUTH-02 | User can upload LLM chat history (Claude/ChatGPT JSON export) | Browser FileReader API + JSON.parse; validate shape with zod; store parsed JSON in Supabase `profiles` table |
| AUTH-03 | User can connect Canvas course schedule via personal access token | `fetch` to `canvas.wisc.edu/api/v1/courses` with `Authorization: Bearer <token>`; store token in Supabase; render course list |
</phase_requirements>

---

## Standard Stack

### Core (Phase 1 specific)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@supabase/supabase-js` | ^2.x | Auth (email/password), DB (user + canvas token storage), realtime | One SDK handles auth state, DB reads/writes, and session persistence. No backend needed for Phase 1. |
| `react-router-dom` | ^7.x | Route to `/login`, `/dashboard` after auth | Required to guard dashboard behind auth check. |
| `zod` | ^3.x | Validate Claude/ChatGPT JSON shape before storing | LLM exports have inconsistent schemas between versions; zod catches bad files before they corrupt DB. |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `lucide-react` | latest | Upload icon, spinner, check mark for UI feedback | Use on upload button and Canvas token input field. |
| shadcn/ui `Input`, `Button`, `Card` | latest (copy-paste) | Auth form fields, Canvas token input, course list card | Fastest way to get polished form UI without writing CSS. |

### Installation

```bash
# Already in the monorepo install from STACK.md — no additional packages needed for Phase 1
npm install @supabase/supabase-js react-router-dom zod lucide-react
npx shadcn@latest add input button card
```

---

## Architecture Patterns

### Recommended File Structure (Phase 1 additions only)

```
src/
├── lib/
│   ├── supabase.ts          # Supabase client singleton
│   └── canvas.ts            # fetchCourses(token: string) helper
├── components/
│   ├── AuthForm.tsx          # Email/password sign-in form
│   ├── CanvasTokenForm.tsx   # PAT input + course list display
│   └── ChatUpload.tsx        # File input + parse + preview
├── pages/
│   ├── Login.tsx             # Route: /login
│   └── Dashboard.tsx         # Route: /dashboard (auth-gated)
└── types/
    └── index.ts             # CanvasCourse, ChatExport types
```

### Pattern 1: Supabase Auth with @wisc.edu Domain Gate

**What:** Use Supabase email/password auth. Gate signup to `@wisc.edu` emails via a Supabase `before-user-created` PostgreSQL hook. Label the UI button "Sign in with UW NetID" for demo credibility.

**When to use:** Always for this phase. Real Shibboleth/SAML is a multi-day integration.

**Setup (SQL — run once in Supabase dashboard SQL editor):**

```sql
-- Source: Supabase Before-User-Created Hook docs
create or replace function public.restrict_to_wisc_edu(event jsonb)
returns jsonb
language plpgsql
as $$
declare
  email text;
  domain text;
begin
  email := event->'user'->>'email';
  domain := split_part(email, '@', 2);
  if lower(domain) = 'wisc.edu' then
    return '{}'::jsonb;
  end if;
  return jsonb_build_object(
    'error', jsonb_build_object(
      'message', 'Only @wisc.edu email addresses can sign in.',
      'http_code', 403
    )
  );
end;
$$;
```

**React client pattern:**

```typescript
// Source: Supabase JS client v2 docs
import { supabase } from '../lib/supabase'

// Sign up
const { error } = await supabase.auth.signUp({ email, password })

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({ email, password })

// Auth state listener (put in App.tsx or AuthProvider)
supabase.auth.onAuthStateChange((event, session) => {
  // session.user available after sign-in
})
```

**Supabase client singleton:**

```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)
```

### Pattern 2: Canvas Personal Access Token — Fetch Courses

**What:** User enters their Canvas PAT in a form. Client calls `canvas.wisc.edu/api/v1/courses` with `Authorization: Bearer <token>` header. Store the token in Supabase so user doesn't re-enter it. Display course list.

**Auth header format (HIGH confidence — official Canvas REST API docs):**

```
Authorization: Bearer <ACCESS-TOKEN>
```

**Fetch helper:**

```typescript
// src/lib/canvas.ts
export interface CanvasCourse {
  id: number
  name: string
  course_code: string
  enrollment_term_id: number
}

export async function fetchCourses(token: string): Promise<CanvasCourse[]> {
  const res = await fetch(
    'https://canvas.wisc.edu/api/v1/courses?enrollment_state=active&per_page=50',
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  )
  if (!res.ok) throw new Error(`Canvas API error: ${res.status}`)
  return res.json()
}
```

**Store token after verification:**

```typescript
// After fetchCourses() succeeds, store in Supabase
await supabase
  .from('user_settings')
  .upsert({ user_id: user.id, canvas_token: token, courses: courses })
```

**CORS consideration:** Canvas API at `canvas.wisc.edu` allows browser-side requests from any origin for personal access token auth (it's designed for user scripts/integrations). No proxy needed.

### Pattern 3: LLM Chat History File Upload

**What:** `<input type="file" accept=".json">` triggers `FileReader.readAsText()`. Parse with `JSON.parse()`. Validate shape with zod. Store raw JSON in Supabase. Phase 2 will process it with Claude — Phase 1 just accepts and stores.

**Claude.ai export shape:**

```typescript
// Claude export: array of conversations
// [ { uuid, name, created_at, updated_at, chat_messages: [...] } ]

// ChatGPT export: object with conversations array
// { conversations: [ { id, title, mapping: {...} } ] }
```

**FileReader pattern:**

```typescript
// src/components/ChatUpload.tsx
const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (event) => {
    try {
      const raw = JSON.parse(event.target?.result as string)
      // Detect format
      const isClaudeExport = Array.isArray(raw)
      const isChatGPTExport = raw?.conversations !== undefined

      if (!isClaudeExport && !isChatGPTExport) {
        setError('Unrecognized format — upload a Claude or ChatGPT JSON export')
        return
      }

      // Store raw JSON in Supabase — Phase 2 will analyze it
      supabase.from('chat_exports').insert({
        user_id: user.id,
        raw_json: raw,
        source: isClaudeExport ? 'claude' : 'chatgpt',
      })
      setUploadStatus('success')
    } catch {
      setError('Invalid JSON file')
    }
  }
  reader.readAsText(file)
}
```

**Zod schema for basic validation (optional but recommended):**

```typescript
// Loose schema — just confirm it's chat data, don't enforce deep structure
const ClaudeExportSchema = z.array(z.object({
  uuid: z.string(),
  name: z.string().optional(),
  chat_messages: z.array(z.any()),
}))

const ChatGPTExportSchema = z.object({
  conversations: z.array(z.any()),
})
```

### Pattern 4: Auth Guard (Dashboard Route)

**What:** Redirect unauthenticated users from `/dashboard` to `/login`. Check Supabase session before rendering.

```typescript
// src/pages/Dashboard.tsx
const { data: { user } } = await supabase.auth.getUser()
if (!user) navigate('/login')
```

### Anti-Patterns to Avoid

- **Storing Canvas PAT in localStorage directly:** Store in Supabase `user_settings` table — it persists across sessions and is tied to the authenticated user.
- **Parsing ChatGPT ZIP files:** ChatGPT exports are ZIP archives containing `conversations.json`. Do NOT handle ZIP — tell users to extract the JSON first, or accept only `.json` files (ZIP is out of scope for Phase 1).
- **Blocking the UI during FileReader:** FileReader is async. Always handle in `reader.onload` callback, never synchronously.
- **Re-fetching Canvas on every render:** Cache courses in Supabase after first fetch. Phase 1 only needs to fetch once and display.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Session persistence | Manual JWT storage/refresh | Supabase auth (handles it) | Supabase persists session in localStorage and auto-refreshes tokens |
| Email domain validation | Client-side check in form | Supabase `before-user-created` DB hook | Client-side validation is bypassable; hook runs server-side before user exists |
| Canvas token security | Encrypted custom storage | Supabase row-level security on `user_settings` | RLS ensures users can only read their own token |
| File type detection | MIME type check | JSON.parse try/catch + structural detection | MIME types are unreliable from user uploads; parse-then-detect is robust |

---

## Common Pitfalls

### Pitfall 1: Canvas API Pagination

**What goes wrong:** `GET /courses` returns only 10 courses by default. Students with many enrollments see incomplete list.

**Why it happens:** Canvas REST API paginates with `Link` header. Default page size is 10.

**How to avoid:** Always pass `?per_page=50` query param. For Phase 1 demo, 50 is sufficient. Check `Link: <...>; rel="next"` header if full pagination is needed.

**Warning signs:** User says "my CS course is missing" — check response headers for pagination link.

### Pitfall 2: Supabase Env Vars Not Exposed to Vite

**What goes wrong:** `supabase.createClient` gets `undefined` for URL and key. Auth fails silently or throws.

**Why it happens:** Vite only exposes env vars prefixed with `VITE_` to the browser bundle.

**How to avoid:** Use `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env`. Never use `NEXT_PUBLIC_` or bare names.

### Pitfall 3: CORS on Canvas API from Browser

**What goes wrong:** Canvas API call from `localhost:5173` gets blocked by browser CORS policy.

**Why it happens:** Historically Canvas allows cross-origin for PAT-authenticated requests (designed for user scripts), but some UW Canvas configurations may restrict origin. Not confirmed for `canvas.wisc.edu` specifically.

**How to avoid:** Test the Canvas API call from browser immediately. If CORS blocks it, proxy through a Supabase Edge Function (`supabase functions serve`). With Vite, you can also add a dev proxy in `vite.config.ts`:

```typescript
// vite.config.ts — if Canvas CORS blocks browser requests
server: {
  proxy: {
    '/canvas-api': {
      target: 'https://canvas.wisc.edu',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/canvas-api/, '/api/v1'),
    }
  }
}
```

**Warning signs:** Browser console shows `CORS error` or `preflight request failed` on the Canvas fetch call.

### Pitfall 4: ChatGPT ZIP vs JSON

**What goes wrong:** User uploads a `.zip` file (the default ChatGPT export format) — `JSON.parse` throws, user sees cryptic error.

**Why it happens:** ChatGPT's "Export data" downloads a ZIP containing `conversations.json` — not a bare JSON file.

**How to avoid:** In the upload UI, explicitly tell users: "Upload the `conversations.json` file from your ChatGPT export ZIP." Accept only `.json` files with `accept=".json"`. Do not implement ZIP parsing in Phase 1.

### Pitfall 5: Supabase `before-user-created` Hook Not Enabled

**What goes wrong:** The SQL hook function exists in DB but signups aren't gated — users with non-wisc.edu emails get through.

**Why it happens:** The hook must be explicitly enabled in Supabase Dashboard → Auth → Hooks. Creating the SQL function alone does nothing.

**How to avoid:** After running the SQL, go to Supabase Dashboard → Authentication → Hooks → "Before User Created" → enable and point to the function.

---

## Code Examples

### Supabase Client Init

```typescript
// src/lib/supabase.ts
// Source: Supabase JS v2 docs
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)
```

### Canvas Courses Fetch

```typescript
// Source: Canvas LMS REST API docs — Authorization: Bearer pattern
const response = await fetch(
  'https://canvas.wisc.edu/api/v1/courses?enrollment_state=active&per_page=50',
  { headers: { Authorization: `Bearer ${canvasToken}` } }
)
const courses: CanvasCourse[] = await response.json()
```

### File Upload + Parse

```typescript
// Source: MDN FileReader API
const reader = new FileReader()
reader.readAsText(file)
reader.onload = () => {
  const data = JSON.parse(reader.result as string)
  // validate with zod, then store
}
```

### Domain Hook (SQL)

```sql
-- Source: Supabase Before-User-Created Hook docs
create or replace function public.restrict_to_wisc_edu(event jsonb)
returns jsonb language plpgsql as $$
declare domain text;
begin
  domain := split_part(event->'user'->>'email', '@', 2);
  if lower(domain) = 'wisc.edu' then return '{}'::jsonb; end if;
  return jsonb_build_object('error', jsonb_build_object(
    'message', 'Only @wisc.edu addresses allowed.', 'http_code', 403
  ));
end; $$;
```

---

## Supabase Schema (Phase 1)

Minimal tables needed:

```sql
-- Users: managed by Supabase auth.users (auto-created)

-- Store Canvas token + fetched courses
create table user_settings (
  user_id uuid references auth.users(id) primary key,
  canvas_token text,
  courses jsonb,
  updated_at timestamptz default now()
);

-- Enable RLS
alter table user_settings enable row level security;
create policy "Users can manage own settings"
  on user_settings for all using (auth.uid() = user_id);

-- Store raw chat exports
create table chat_exports (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id),
  raw_json jsonb not null,
  source text check (source in ('claude', 'chatgpt')),
  created_at timestamptz default now()
);
alter table chat_exports enable row level security;
create policy "Users can manage own exports"
  on chat_exports for all using (auth.uid() = user_id);
```

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | No test framework installed yet (Wave 0 gap) |
| Config file | None — see Wave 0 |
| Quick run command | `npm test` (after vitest install) |
| Full suite command | `npm run test:run` |

### Phase Requirements to Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| AUTH-01 | Sign-in rejects non-@wisc.edu emails | unit | `npx vitest run src/tests/auth.test.ts` | Wave 0 |
| AUTH-01 | Sign-in redirects to dashboard on success | smoke | Manual browser check | Manual |
| AUTH-02 | `JSON.parse` succeeds on valid Claude export | unit | `npx vitest run src/tests/upload.test.ts` | Wave 0 |
| AUTH-02 | Rejects non-JSON or malformed files | unit | `npx vitest run src/tests/upload.test.ts` | Wave 0 |
| AUTH-03 | `fetchCourses()` constructs correct Authorization header | unit | `npx vitest run src/tests/canvas.test.ts` | Wave 0 |
| AUTH-03 | Course list renders with fetched data | smoke | Manual browser check | Manual |

### Sampling Rate

- **Per task commit:** `npx vitest run --reporter=verbose`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `src/tests/auth.test.ts` — covers AUTH-01 domain validation logic
- [ ] `src/tests/upload.test.ts` — covers AUTH-02 JSON parse + format detection
- [ ] `src/tests/canvas.test.ts` — covers AUTH-03 fetch helper with mocked `fetch`
- [ ] Install vitest: `npm install -D vitest`

---

## Open Questions

1. **Canvas CORS at canvas.wisc.edu**
   - What we know: Canvas official docs allow cross-origin PAT requests; it's designed for user scripts
   - What's unclear: Whether UW's Canvas instance restricts browser-origin CORS headers differently
   - Recommendation: Test live immediately in the first task. If blocked, add Vite dev proxy (pattern documented above) — 5-minute fix

2. **Supabase before-user-created hook in free tier**
   - What we know: Hook exists in docs; must be manually enabled in dashboard
   - What's unclear: Whether the free tier has hook execution limits
   - Recommendation: Use the hook; if unavailable, fall back to client-side `@wisc.edu` check in the form (acceptable for demo judges who won't try to bypass it)

3. **ChatGPT export JSON structure versioning**
   - What we know: ChatGPT exports `conversations.json` inside a ZIP; Claude exports a flat JSON array
   - What's unclear: Exact current schema of ChatGPT conversations JSON (OpenAI changes this)
   - Recommendation: Accept the file, do loose structural detection (array vs object), and store raw. Phase 2 handles parsing. Don't over-engineer validation in Phase 1.

---

## Sources

### Primary (HIGH confidence)

- Supabase Before-User-Created Hook docs (`supabase.com/docs/guides/auth/auth-hooks/before-user-created-hook`) — domain restriction hook pattern with SQL example
- Canvas LMS REST API docs (`canvas.instructure.com/doc/api/`) — `Authorization: Bearer` header pattern
- Supabase JS v2 docs — `createClient`, `signInWithPassword`, `onAuthStateChange` patterns
- MDN FileReader API — `readAsText()`, `onload` callback pattern

### Secondary (MEDIUM confidence)

- Supabase GitHub issue #1057 — DB trigger approach for domain gating; confirmed fixed and works
- Canvas LMS API Quickstart (JHU Engineering) — personal access token generation and header format
- WebSearch: React FileReader + useState patterns (2025/2026 sources, multiple sites consistent)

### Tertiary (LOW confidence)

- Canvas CORS behavior at `canvas.wisc.edu` specifically — inferred from general Canvas docs, not verified against UW's instance

---

## Metadata

**Confidence breakdown:**
- Supabase auth + domain hook: HIGH — official docs confirmed, SQL example verified
- Canvas API fetch pattern: HIGH — `Authorization: Bearer` is official Canvas REST API spec
- FileReader JSON upload: HIGH — MDN standard API, multiple consistent sources
- Canvas CORS at canvas.wisc.edu: LOW — inferred, requires live test
- ChatGPT JSON schema: MEDIUM — known format but OpenAI changes it; loose detection is safe hedge

**Research date:** 2026-04-14
**Valid until:** 2026-05-14 (Supabase and Canvas APIs are stable; Supabase hook config UI may shift)
