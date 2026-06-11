<!--
SYNC IMPACT REPORT
==================
Version change  : 1.0.0 → 1.1.0
Bump rationale  : Minor bump — new Principle VI added; Quality Gates updated with
                  code-style gate; Development Workflow updated with code-style read step.

Principles added:
  - VI.  Code Style Consistency

Sections updated: Quality Gates (new manual check item), Development Workflow (step 3 updated)
Sections removed: none

Templates updated:
  ✅ .specify/templates/plan-template.md  — Constitution Check table updated with Principle VI row

Deferred items  : none
-->

<!--
PREVIOUS SYNC IMPACT REPORT (v1.0.0)
==================
Version change  : (new) → 1.0.0
Bump rationale  : Initial ratification — all five principles are new; two new sections
                  (Quality Gates, Development Workflow) added; Governance populated.

Principles added:
  - I.   Code Quality — TypeScript Strictness (NON-NEGOTIABLE)
  - II.  Testing Standards (NON-NEGOTIABLE)
  - III. User Experience Consistency
  - IV.  Performance Requirements
  - V.   Simplicity & Maintainability (YAGNI)

Sections added  : Quality Gates, Development Workflow
Sections removed: none

Templates updated:
  ✅ .specify/templates/plan-template.md  — Constitution Check gates populated
  ✅ .specify/templates/spec-template.md  — no changes required (already aligned)
  ✅ .specify/templates/tasks-template.md — no changes required (already aligned)

Deferred items  : none
-->

# Tech Interview Helper UI Constitution

## Core Principles

### I. Code Quality — TypeScript Strictness (NON-NEGOTIABLE)

All source files in `src/` MUST pass TypeScript compilation with `strict: true`,
`noUnusedLocals`, and `noUnusedParameters`. The `@typescript-eslint/no-explicit-any` rule
is set to `error` — use a specific type or `unknown` with a type guard instead of `any`.
ESLint MUST report zero warnings (`--max-warnings 0`). Prettier drives all formatting; no
duplicate style rules in ESLint. `npm run build` MUST succeed without errors before any
branch is merged.

**Rationale**: Untyped or loosely-typed code is the primary source of runtime defects in
this codebase. Strict compilation eliminates entire categories of bugs at zero runtime cost.

### II. Testing Standards (NON-NEGOTIABLE)

Every new component, hook, and page MUST have a corresponding Vitest + React Testing Library
test file. Tests MUST be written or updated before a feature is considered done. `npm test`
MUST pass before marking any task complete. Test coverage MUST NOT decrease on any merge to
`develop` or `main`. API calls MUST be mocked at the `apiClient` level
(`vi.mock('@/api/...')`). Zustand stores MUST be reset between tests using the store's
`setState` in `beforeEach`. RTL tests MUST assert on user-visible behaviour, not
implementation details.

**Rationale**: Untested code is a liability. The RTL philosophy (test behaviour, not
implementation) ensures tests survive refactors and give genuine confidence in user-facing
correctness.

### III. User Experience Consistency

All components MUST use semantic Tailwind colour tokens exclusively — never hardcode hex
values or raw Tailwind palette classes (e.g. `bg-gray-100`, `text-blue-500`, `#3b82f6`).
Every interactive element that is not a native `<button>` or `<a>` MUST include a `role`,
an `aria-label` or `aria-labelledby`, and `onKeyDown`/`onKeyUp` handlers for Enter and
Space. Visible focus rings MUST use `focus-visible:ring-2 focus-visible:ring-border-focus`.
Components MUST render correctly under all themes defined in `public/themes/`. Modal dialogs
MUST trap focus and restore it to the trigger element on close.

**Rationale**: Visual and behavioural inconsistency erodes user trust. A semantic token
system allows theme changes without touching components and makes accessibility
non-optional.

### IV. Performance Requirements

- Bundle chunk sizes MUST NOT exceed the **650 KB** Vite warning threshold; new heavy
  dependencies MUST be assigned to a named manual chunk in `vite.config.ts`.
- TanStack Query `staleTime` MUST be set to at least 5 minutes for all list/read queries;
  effectively-static data (e.g. synonym groups, languages) SHOULD use `staleTime: Infinity`.
- Route-level pages MUST be lazy-loaded via `React.lazy` / `Suspense` in `src/App.tsx`.
- User-input-driven API calls (search, filter) MUST be debounced at ≥ 300 ms before firing.
- `npm run build` MUST complete without chunk-size warnings.

**Rationale**: A React SPA that loads slowly or over-fetches from the backend degrades the
interview-preparation experience. Proactive bundle discipline prevents regressions as the
feature set grows.

### V. Simplicity & Maintainability (YAGNI)

Only implement what a task explicitly requires. Do not add features, refactors, helpers, or
abstractions beyond scope. Components MUST follow the `common → feature-specific → page`
layering defined in `src/components/`. API functions MUST use the `unwrap` pattern in
`src/api/`. State placement MUST follow the decision tree:

| Data type | Location |
|---|---|
| Fetched from the API | TanStack Query (`useQuery` / `useMutation`) |
| Shared across unrelated components, survives navigation | Zustand (`src/store/`) |
| Local to one component or its direct children | `useState` inside component |

API data MUST NOT be cached in Zustand. New routes MUST follow the `createBrowserRouter`
pattern in `src/App.tsx`.

**Rationale**: Complexity accumulates quickly in SPAs. Clear layering rules and the YAGNI
principle prevent architectural drift and reduce onboarding friction.

### VI. Code Style Consistency

All TypeScript and TSX source files MUST comply with every rule in
`.github/instructions/code-style.instructions.md`. The key mandatory rules are:

- Components MUST use plain `function` syntax with named default exports — no `React.FC`, no anonymous arrow exports.
- Props destructuring MUST occur in the function signature, not the body.
- `clsx` MUST be used for all conditional class names — no template literals for colours or compound conditions.
- Import groups MUST be ordered: React → third-party → `@/` alias (types → api → store → hooks → components → utils → constants) → relative. Groups separated by a single blank line.
- The `unwrap` helper MUST be defined once per API file and used for every `.then()` call — never access `.data` inline.
- Zustand stores MUST export as `use<Name>Store`, use a typed `interface` above `create`, and never store server data.
- TanStack Query keys MUST follow the project table; paginated queries MUST use `placeholderData: (prev) => prev`; dependent queries MUST use `enabled: Boolean(param)`.
- `for...in` is banned — use `Object.keys/values/entries` or `for...of`.
- All icons MUST be named imports from `lucide-react`.
- All modals MUST use `<ModalShell>`.
- All domain types MUST live in `src/types/index.ts`.
- Route-level pages MUST be lazy-loaded via `React.lazy` in `src/App.tsx`.

All agents writing TypeScript/TSX (`react-developer`, `qa-engineer`, `speckit.implement`)
MUST read `code-style.instructions.md` before producing code. The Code Reviewer agent MUST
use it as an enforcement checklist and cite the violated rule by name for each finding.

**Rationale**: Consistent code style reduces cognitive load during review, prevents
common anti-patterns (inline `.data` access, raw palette classes, unguarded queries) from
entering the codebase, and ensures every contributor — human or AI — produces code that
is indistinguishable in style from the existing codebase.

## Quality Gates

Before any branch is merged to `develop` or `main`, ALL of the following MUST pass:

1. `npm run build` — TypeScript compilation + Vite build, zero errors, no chunk-size
   warnings (threshold: 650 KB).
2. `npm run lint` — ESLint with `--max-warnings 0`, zero warnings.
3. `npm test` — all Vitest tests pass.
4. Manual review: no hardcoded hex or raw palette colours; no `any` types; semantic tokens
   only.
5. Accessibility spot-check: all new interactive elements carry `role`, `aria-label`, and
   focus-ring classes.
6. Code-style review: component declarations, import ordering, `clsx` usage, `unwrap`
   pattern, Zustand shape, and TanStack Query conventions all comply with
   `.github/instructions/code-style.instructions.md`.

Complexity violations (e.g. a new top-level Zustand store, a second API client) MUST be
justified in a `Complexity Tracking` table in the feature's implementation plan.

## Development Workflow

1. Branch from `develop`; name using Conventional Commits type (`feat/`, `fix/`, `chore/`).
2. For non-trivial features, produce a design document under `docs/` before coding (use the
   `feature-design` skill or the Software Architect agent).
3. Before writing any code, read `.github/copilot-instructions.md`, `.specify/memory/constitution.md`,
   and `.github/instructions/code-style.instructions.md` in that order.
4. Follow the agent pipeline: **Software Architect → React Developer → QA Engineer →
   Code Reviewer**.
5. Commit messages MUST follow Conventional Commits (`feat:`, `fix:`, `refactor:`,
   `chore:`, `test:`, `docs:`, `style:`). Breaking changes MUST append `!` to the type.
6. Before marking any task done: `npm run build` passes, `npm test` passes, lint is clean,
   and all Quality Gates above are satisfied.

## Governance

This constitution supersedes all other development practices in tih-ui. Amendments MUST:

1. Increment `CONSTITUTION_VERSION` according to semantic versioning:
   - MAJOR: backward-incompatible governance change or principle removal.
   - MINOR: new principle or section added / materially expanded.
   - PATCH: clarification, wording, or typo fix with no semantic change.
2. Document all changes in the Sync Impact Report HTML comment at the top of this file.
3. Propagate changes to all dependent templates: `plan-template.md`, `spec-template.md`,
   `tasks-template.md`.
4. Apply to in-progress feature specs within one sprint of ratification.

All PRs MUST verify compliance against the Quality Gates above. The
`.github/copilot-instructions.md` file is the runtime guidance document for AI agents and
MUST remain in sync with this constitution.

**Version**: 1.0.0 | **Ratified**: 2026-05-29 | **Last Amended**: 2026-05-29
