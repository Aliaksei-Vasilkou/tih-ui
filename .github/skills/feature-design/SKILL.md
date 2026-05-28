---
name: feature-design
description: "Design a new tih-ui feature end-to-end. Use when planning a new feature, brainstorming approaches, comparing options, deciding on state ownership and API shape, decomposing components, or preparing questions for the team. Produces both a feature design document and an implementation plan."
argument-hint: "Describe the feature you want to design"
---

# Feature Design Skill — tih-ui

You are acting as a **feature designer** for **tih-ui** — a React 18 + TypeScript SPA backed by a Spring Boot REST API.

When this skill is invoked, produce two artefacts in a **single new file** named after the feature (e.g. `docs/feature-<slug>.md`):

1. **Feature Design Document** — problem, options, decision, architecture
2. **Implementation Plan** — ordered task list ready to hand off to the `React Developer` agent

If the feature is too large for a single document (e.g. it spans multiple teams, repos, or more than ~5 independent sub-systems), split it into sub-features and produce one document per sub-feature, linking them together with a short index section at the top of each file.

---

## When to Use

- You have a feature idea and need to think it through before coding
- You want to compare approaches (with benefits and drawbacks) before committing
- You need to decide where state lives, which API endpoints are required, and which components to create or change
- You want a team-ready document with open questions
- You want a ready-to-execute task list for the developer agent

---

## Procedure

### Step 1 — Understand the Feature

Infer answers from the user's description. If critical information (scope, entry point) cannot be reasonably inferred, ask targeted clarifying questions before proceeding. Otherwise, state your assumptions explicitly at the top of the document and produce the full output without further prompting.

- **Goal**: What user problem does this solve?
- **Entry point**: Which page / component triggers the feature?
- **Scope**: Is this frontend-only, or does it require backend changes?
- **Constraints**: Performance sensitivity? Accessibility needs? Data volume?

### Step 2 — Identify Approaches

List 2–3 realistic implementation approaches.  
For each approach include:

| Aspect | Detail |
|--------|--------|
| Summary | One-line description |
| Benefits | What it does well |
| Drawbacks | Risks, complexity, maintenance cost |
| Recommended? | Yes / No / Conditional |

### Step 3 — Design Decision

State the chosen approach and justify it against the project's conventions:

- **State ownership** — follow the decision tree (see below)
- **Query keys** — follow the project convention (`['resource', ...params]`)
- **Component hierarchy** — follow `common → feature-specific → page` layering
- **Tailwind tokens** — semantic tokens only, never raw palette classes

#### State Ownership Decision Tree

| Question | Placement |
|----------|-----------|
| Fetched from API? | TanStack Query (`useQuery` / `useMutation`) |
| Shared across unrelated components, survives navigation? | Zustand (`src/store/`) |
| Local to one component or its direct children? | `useState` inside component |

Never cache API data in Zustand.

### Step 4 — Architecture

For the chosen approach describe:

#### New / Changed Files

List every file to create or modify with a one-line description of the change.

```
src/api/synonyms.ts          — new: synonymsApi.getAll()
src/components/common/...    — new or changed
src/pages/SearchPage.tsx     — changed: wire synonym expansion
src/types/index.ts           — add Synonym type
```

#### Type Definitions

Define any new domain types and request/response shapes needed in `src/types/index.ts`.

#### API Endpoints (if backend work is needed)

Only include this section when the user indicates backend changes are required.

```
GET  /api/v1/<resource>          → Response shape
POST /api/v1/<resource>          → Request / Response shape
```

#### Query Keys

Register new keys following the convention:

```ts
['synonyms']                          // all synonyms
['synonyms', languageId]              // filtered by language
```

### Step 5 — Open Questions

List questions the team must decide before or during implementation.  
Use this format:

```
Q1. [Category] Question text?
    Options: A) ... B) ...
    Default assumption: ...
```

Categories: `Data`, `UX`, `Performance`, `Backend`, `Maintenance`

### Step 6 — Implementation Plan

Produce an **ordered task list** that the `React Developer` agent can execute sequentially.  
Each task must be:

- Actionable (starts with a verb: Add, Create, Update, Wire, Test)
- Scoped to a single file or concern
- Ordered so each task depends only on completed prior tasks

Format:

```markdown
## Implementation Plan

- [ ] 1. Add `Synonym` type to `src/types/index.ts`
- [ ] 2. Create `src/api/synonyms.ts` with `synonymsApi.getAll()`
- [ ] 3. Add `useSynonyms` query hook in `src/hooks/useSynonyms.ts`
- [ ] 4. Update `HighlightText` component to accept synonym expansions
- [ ] 5. Wire synonym expansion in `SearchPage`
- [ ] 6. Write Vitest tests (use QA Engineer agent)
- [ ] 7. Run `npm run build` and `npm run lint` — fix any errors
```

---

## Output Format

Save the full document to a file. Suggested path: `docs/feature-<kebab-slug>.md`.  
If a `docs/` folder does not exist, create it.

The file structure:

```markdown
# Feature: <Name>

## Problem Statement
...

## Approaches
### Option A — <Name>
...

### Option B — <Name>
...

## Decision
...

## Architecture
### New / Changed Files
...

### Type Definitions
...

### API Endpoints   ← only if backend is in scope
...

### Query Keys
...

## Open Questions
...

## Implementation Plan
- [ ] 1. ...
```

---

## Conventions to Enforce

- Semantic Tailwind tokens only: `bg-surface`, `text-foreground`, `border-border`, etc.
- `clsx` for conditional classes
- `unwrap` pattern in every API function
- Invalidate queries at broadest useful prefix
- Lazy-load new pages via `React.lazy` in `src/App.tsx`
- Vite chunk impact: if a new heavy dependency is introduced, assign it to a named chunk
- Chunk size warning threshold is **650 KB** — never raise it without justification
- Follow Conventional Commits for PR title suggestions: `feat:`, `fix:`, `refactor:`
