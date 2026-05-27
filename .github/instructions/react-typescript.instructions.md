---
name: React & TypeScript conventions
description: Coding conventions for all TypeScript and React source files in tih-ui
applyTo: "src/**/*.{ts,tsx}"
---


# React & TypeScript conventions — tih-ui

Apply the [general project guidelines](../copilot-instructions.md) to all code.

## Component structure

- **Named default exports only** — no `export const Foo = () => {}` from feature files.
- **No `React.FC<Props>`** — use plain function syntax: `function MyComponent(props: MyComponentProps)`.
- Props interface is declared **above** the component function in the same file.
- One component per file; filename matches the component name (`MyComponent.tsx`).

```tsx
interface MyComponentProps {
    value: string
    onChange: (v: string) => void
    optional?: boolean
}

export default function MyComponent({value, onChange, optional = false}: MyComponentProps) {
    // ...
}
```

## TypeScript strictness

- No `any` — use a specific type or `unknown` with a type guard. **`@typescript-eslint/no-explicit-any` is `"error"` — the lint step will fail.**
- Non-null assertions (`!`) require a comment explaining why it is safe.
- No unused imports, variables, or parameters — enforced by both `noUnusedLocals`/`noUnusedParameters` in `tsconfig` and `@typescript-eslint/no-unused-vars: "error"` in ESLint. Prefix intentionally unused parameters with `_`.
- All domain and request/response types live in `src/types/index.ts`.

## JSX text content

Never use HTML entities (`&quot;`, `&amp;`, `&apos;`) inside JSX — `react/no-unescaped-entities` will flag them.  
Use JSX expressions instead:

```tsx
// ✅ template literal — keep value and quotes together
<span>{`"${query}"`}</span>

// ✅ explicit expression — for a literal quote character
<span>{'"'}{query}{'"'}</span>

// ❌ HTML entity — not idiomatic in JSX
<span>&quot;{query}&quot;</span>
```

## Styling — semantic tokens only

Never use raw Tailwind palette classes (`bg-gray-*`, `text-blue-*`) or hardcoded hex values.

✅ `bg-surface`, `text-foreground`, `text-foreground-secondary`, `text-muted`  
✅ `border-border`, `border-border-strong`, `bg-primary-600`, `hover:bg-primary-700`  
✅ `text-error`, `bg-error-bg`, `shadow-theme-sm`  
❌ `bg-gray-100`, `text-gray-500`, `style={{ color: '#3b82f6' }}`

Use `clsx` for conditional class names — never template literals for colours.

## State ownership

| Type of state                        | Where it lives                              |
|--------------------------------------|---------------------------------------------|
| Data from the backend                | TanStack Query (`useQuery` / `useMutation`) |
| Shared UI state surviving navigation | Zustand (`src/store/`)                      |
| Local component state                | `useState`                                  |

Do **not** cache server data in Zustand.

## TanStack Query v5

- Paginated queries: `placeholderData: (prev) => prev` (NOT `keepPreviousData`).
- `onSuccess` / `onError` on `useQuery` were removed in v5 — use `useEffect` watching `isSuccess` / `isError`.
- Always guard dependent queries with `enabled: Boolean(param)`.

## Imports & icons

- Path alias `@/` resolves to `src/`. Use it for all project imports.
- Icons: named imports from `lucide-react` only. Common: `Loader2`, `Pencil`, `Trash2`, `X`, `Plus`, `Search`.
- HTTP: only `apiClient` from `@/api/client` — never import `axios` directly elsewhere.

## Boundaries

- ✅ **Always:** Use semantic Tailwind tokens for all colours. Add every new domain type to `src/types/index.ts`. Use `<ModalShell>` for all
  dialogs. Use `clsx` for conditional class names. Export components as named default exports only.
- ⚠️ **Ask first:** Adding a dependency that is not already in `package.json`. Creating a new Zustand store (confirm it doesn't overlap with
  `filterStore`, `uiStore`, or `themeStore`). Changing `src/App.tsx` routing structure.
- 🚫 **Never:** Use `any` — `@typescript-eslint/no-explicit-any` is `"error"` and will fail CI. Use raw Tailwind palette classes
  (`bg-gray-*`, `text-blue-*`) or hardcoded hex values. Import `axios` directly outside `src/api/client.ts`. Use `React.FC<Props>`. Add
  HTML entities (`&quot;`, `&amp;`) inside JSX. Use `for...in` loops. Cache API data in Zustand.
