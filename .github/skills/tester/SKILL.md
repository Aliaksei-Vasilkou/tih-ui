---
name: tester
description: 'Write Vitest + React Testing Library tests for tih-ui. Use when adding tests for React components, hooks, or pages, or setting up the test infrastructure. Covers renderWithProviders, renderWithRoute, api mocking, Zustand reset, and Tiptap/useBlocker mocking.'
---

# Tester Skill — tih-ui

You are writing tests for **tih-ui** using **Vitest** and **React Testing Library**. You verify real user behaviour — never implementation details.
You write to `*.test.{ts,tsx}` files only and never touch source code.

## When to Use This Skill

- Adding tests for a new or existing React component, custom hook, or page
- Setting up the Vitest + RTL test infrastructure for the first time
- Debugging a failing test or investigating low coverage

## Boundaries

- ✅ **Always:** Co-locate test files next to the source file they test. Use `renderWithProviders` or `renderWithRoute` (never raw `render`
  without providers). Mock at the api module level (`vi.mock('@/api/...')`). Always mock `RichTextEditor`. Reset Zustand stores in `afterEach`.
  Use midday UTC timestamps (`T12:00:00Z`) in date fixtures.
- ⚠️ **Ask first:** Before modifying `src/test/renderWithProviders.tsx` or `src/test/renderWithRoute.tsx` (shared infrastructure). Before
  adding a new testing dependency.
- 🚫 **Never:** Modify source files. Remove a failing test. Mock `apiClient` directly. Test CSS class names or internal React state. Use
  midnight UTC timestamps (`T00:00:00Z`) — they cause timezone rollover in UTC-1 and earlier.

## Render helper selection

| Situation | Helper |
|-----------|--------|
| Component or hook with no route params | `renderWithProviders` |
| Page that calls `useParams` | `renderWithRoute` |
| Hook tested in isolation | `renderHook` + bare `QueryClientProvider` |

## Core mocking rules

- **API modules**: `vi.mock('@/api/questions')` — never mock `apiClient` directly.
- **RichTextEditor**: always mock — Tiptap does not run in jsdom.
- **useBlocker**: always mock when rendering `QuestionForm` — requires a data router, throws in `MemoryRouter`.

## Test naming

```ts
describe('ComponentName', () => {
    it('should <expected behaviour>', () => { ... })
})
```

## Gotchas

- **PageLoader** has no `role="status"` — query with `getByText(/loading/i)`.
- **Select** is a custom dropdown — open trigger button first, then click option from listbox.
- **Text collisions** — never use the same string for `categoryName` and a tag name in the same fixture.
- **Dialog buttons** — use `getAllByRole` and index `[1]` when page and dialog share the same label.
- **Date timestamps** — midday UTC only (`T12:00:00Z`).

## References

Read these only when needed for your current task:

- [One-time setup](./references/setup.md) — install deps, vite config, renderWithProviders, renderWithRoute, scripts
- [Common test patterns](./references/test-patterns.md) — loading state, async query, mutations, hooks, dialogs, Select, debounce, themes
