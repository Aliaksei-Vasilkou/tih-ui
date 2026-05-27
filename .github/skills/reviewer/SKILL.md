---
name: reviewer
description: Review tih-ui pull requests and code changes for correctness, type safety, accessibility, performance, and convention compliance. Use this skill when reviewing a diff, auditing a component, or checking a PR before merge.
---

# Reviewer Skill — tih-ui

You are reviewing code for **tih-ui** — a React 18 + TypeScript SPA with TypeScript 5 (strict mode), TanStack Query v5, Zustand v5, Tailwind CSS v3
(semantic tokens only), and `lucide-react` icons. Work through each category below and report every finding with its exact location and a suggested fix.

## Commands

Use these (or ask the user to run them) to surface issues before writing your report:

```bash
npm run lint     # eslint . --ext ts,tsx --max-warnings 0
tsc --noEmit     # type-check without producing output
```

Also call `get_errors` on each changed file to surface IDE-level diagnostics.

## Boundaries

- ✅ **Always:** Read every changed file. Cover all ten categories below. Report every finding with file path, line number, issue description, and
  suggested fix. End with a clear verdict (✅ / ⚠️ / ❌).
- ⚠️ **Ask first:** If the diff is very large (>20 files), confirm review priority with the user.
- 🚫 **Never:** Edit any source file. Approve code that uses `any` without a type guard. Approve `useQuery` with a nullable dependency and no
  `enabled` guard. Ignore icon-only buttons without `aria-label`.

---

## 1. TypeScript strictness

The project runs with `strict: true`, `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`.

Flag:

- Any use of `any` — require a specific type or `unknown` with a type guard. **`@typescript-eslint/no-explicit-any` is `"error"`; this will fail lint.
  **
- Non-null assertions (`!`) without a comment explaining why it is safe.
- `@ts-ignore` or `@ts-expect-error` without a justification comment.
- Unused imports, variables, or parameters. Intentionally unused parameters must be prefixed with `_`.
- `object` or `{}` where a more specific type exists.

---

## 2. React hooks rules

Flag:

- Missing or incorrect dependency arrays in `useEffect`, `useCallback`, `useMemo`.  
  Example violation: reading a ref's `.current` inside `useCallback` without it being in the dep array (stale ref bug).
- Hooks called conditionally or inside loops.
- `useEffect` that fetches data — all data fetching must go through TanStack Query.
- State updates on unmounted components (missing cleanup / `enabled` guard).

Reference the `QuestionForm.tsx` pattern for safe dirty-state + navigation blocking:  
`isDirtyRef` / `isSavingRef` are used to avoid stale-closure issues inside the blocker callback.

---

## 3. TanStack Query v5 compliance

Flag:

- `keepPreviousData` — this is a v4 option; v5 uses `placeholderData: (prev) => prev`.
- `queryKey` that is not an array.
- `onSuccess` / `onError` passed to `useQuery` — these were removed in v5; use `useEffect` watching `isSuccess`/`isError` instead.
- Missing `enabled` guard when a query depends on a nullable parameter.
- `useMutation` that does not call `queryClient.invalidateQueries()` on `onSuccess` when the mutated resource is displayed elsewhere in the app.

---

## 4. Tailwind / theming

Flag:

- Raw Tailwind palette classes used for colours: `bg-gray-*`, `text-gray-*`, `bg-blue-*`, etc.
- Hardcoded hex values in `className` or `style`.
- Any `style={{ color: '...' }}` or `style={{ background: '...' }}` — all colours must come from semantic tokens.
- A new language without a corresponding entry in `src/constants/languageColors.ts` and the required theme token additions.

**Known exception** (do not flag): `bg-red-600` / `hover:bg-red-700` on the confirm-delete button inside `DeleteConfirmDialog.tsx` — intentionally
hard-coded for destructive action contrast. New destructive buttons should follow the same pattern or use `text-error` / `bg-error-bg`.

---

## 5. Accessibility

Flag:

- `<button>` or `<a>` elements that contain only an icon (no visible text) without an `aria-label`.  
  Reference: the close button in `ModalShell.tsx` uses `aria-label="Close"` — follow that pattern.
- `onClick` handlers attached to non-interactive elements (`div`, `span`, `p`) — use `<button>` instead.
- Form `<input>` elements without an associated `<label>` (`htmlFor` + `id` or wrapping label).
- `disabled` buttons that still receive focus without a visual indicator.
- Images without `alt` text.

---

## 6. Component structure

Flag:

- `React.FC<Props>` — banned; use plain `function ComponentName(props: Props)` syntax.
- Props interface defined **after** the component function declaration — it must be above.
- Named component exports from feature files (only default exports allowed).
- API calls (`import from '@/api/*'`) inside components in `src/components/common/` unless the component is intentionally self-contained (add a
  comment if so).
- Modals / dialogs that do not use `<ModalShell>`.
- HTML entities (`&quot;`, `&amp;`, `&apos;`, etc.) inside JSX text — `react/no-unescaped-entities` is active.  
  Use JSX expressions: `` {`"${value}"`} `` or `{'"'}`.
- `for...in` loops — banned via `no-restricted-syntax`; use `Object.keys/values/entries` instead.  
  (`for...of` **is** allowed.)

---

## 7. State placement

Flag:

- Server data cached in Zustand — use TanStack Query for data that comes from the API.
- `useState` used to track fetched data instead of `useQuery`.
- A new Zustand store for something that is already covered by `filterStore`, `uiStore`, or `themeStore`.

---

## 8. API layer

Flag:

- Direct `axios` imports outside `src/api/client.ts` — all requests must go through `apiClient`.
- Error handling inside individual `api/*.ts` files — error normalisation is already done in the Axios interceptor in `client.ts`.
- Missing `unwrap` helper (returning the full `AxiosResponse` instead of `.data`).
- Request types that are not declared in `src/types/index.ts`.

---

## 9. Performance

Flag:

- Missing `useCallback` on event handlers passed as props to memoised child components.
- `useEffect` with an empty dep array that could be replaced with a query's `onSuccess` or `select`.
- Heavy inline computations (sorting, filtering large arrays) not wrapped in `useMemo`.
- Importing the entire icon library — only named imports from `lucide-react` are acceptable.
- New large dependencies not accounted for in the `manualChunks` config in `vite.config.ts`.

---

## 10. Conventional Commits

Flag if the PR title or commit messages do not follow the format:

```
<type>[!]: <short imperative description>
```

Valid types: `feat` `fix` `refactor` `chore` `test` `docs` `style`  
Breaking change: append `!` after the type (e.g., `feat!: redesign question form`).  
Description must be lowercase and not end with a period.

---

## Review output format

Report findings as a numbered list grouped by category:

```
[TypeScript] src/components/common/MyComponent.tsx:12
  Issue: `data` typed as `any`
  Fix: Replace with `PageResponse<Question>`

[Hooks] src/pages/SearchPage.tsx:34
  Issue: `handleSubmit` recreated on every render, passed to a child
  Fix: Wrap in `useCallback` with correct dependencies
```

At the end, give a **summary verdict**: ✅ Approved / ⚠️ Approve with minor fixes / ❌ Request changes.
