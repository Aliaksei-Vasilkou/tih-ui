---
name: developer
description: 'Implement React 18 + TypeScript features in tih-ui. Use when writing components, hooks, API calls, Zustand store slices, TanStack Query wiring, or modals. Covers component template, clsx usage, unwrap API pattern, and semantic Tailwind tokens.'
---

# Developer Skill — tih-ui

You are implementing features for **tih-ui** — a React 18 + TypeScript SPA with TypeScript 5 (strict), Vite 6, React Router v6, TanStack Query v5,
Zustand v5, Tiptap v2, Tailwind CSS v3, Axios, `clsx`, and `lucide-react`. Follow the established patterns exactly.

## When to Use This Skill

- Writing a new component, page, or custom hook
- Wiring up a new API resource with TanStack Query
- Adding a Zustand store slice
- Implementing a modal, inline form, or CRUD flow
- Deciding on state ownership or query key structure

## Boundaries

- ✅ **Always:** Add new domain types to `src/types/index.ts`. Use `<ModalShell>` for all dialogs. Import icons only from `lucide-react`.
  Use semantic Tailwind tokens only. Validate with `npm run build` before handing off.
- ⚠️ **Ask first:** Adding a new `npm` dependency. Creating a new Zustand store. Changing `vite.config.ts` manual chunks.
- 🚫 **Never:** Import `axios` directly outside `src/api/client.ts`. Use `any`. Store server data in Zustand. Use raw Tailwind classes
  (`bg-gray-*`, `text-blue-*`) or hardcoded hex. Leave unused imports or parameters. Commit or push.

## Component template

```tsx
// Named default export, no React.FC, props interface above the function
interface MyComponentProps {
    value: string
    onChange: (v: string) => void
    optional?: boolean
}

export default function MyComponent({value, onChange, optional = false}: MyComponentProps) {
    // ...
}
```

## Conditional classes — always use `clsx`

```tsx
import clsx from 'clsx'

<button className={clsx(
    'px-3 py-1.5 rounded-full text-sm border transition-colors',
    isActive
        ? 'bg-toolbar-active-bg text-toolbar-active-text border-toolbar-active-bg'
        : 'bg-surface text-muted border-border hover:border-border-strong',
)}>
```

## API layer pattern

```ts
import type {AxiosResponse} from 'axios'
import apiClient from './client'
import type {MyResource, MyResourceCreateRequest} from '@/types'

const unwrap = <T>(r: AxiosResponse<T>) => r.data

export const myResourceApi = {
    getAll: () => apiClient.get<MyResource[]>('/my-resource').then(unwrap),
    getById: (id: number) => apiClient.get<MyResource>(`/my-resource/${id}`).then(unwrap),
    create: (data: MyResourceCreateRequest) => apiClient.post<MyResource>('/my-resource', data).then(unwrap),
    update: (id: number, data: MyResourceCreateRequest) => apiClient.put<MyResource>(`/my-resource/${id}`, data).then(unwrap),
    delete: (id: number) => apiClient.delete(`/my-resource/${id}`),
}
```

## References

Read these only when needed for your current task:

- [Implementation patterns](./references/patterns.md) — TanStack Query v5, Zustand, modals, page loading, hooks, RichTextEditor, date formatting, icons
