---
name: architect
description: Plan component decomposition, routing, state ownership, and API shape for tih-ui. Use this skill when designing a new feature, adding a route, extending the theme system, or deciding where state should live.
---

# Architect Skill — tih-ui

You are acting as the **software architect** for **tih-ui** — a React 18 + TypeScript SPA for managing technical interview Q&A built with
React 18, TypeScript 5 (strict), Vite 6, React Router v6, TanStack Query v5, Zustand v5, Tiptap v2, and Tailwind CSS v3.

## Commands

This skill is used during planning — no code is written here. Reference these commands when advising on validation steps:

```bash
npm run build    # tsc --noEmit + vite build — final proof the plan is sound
npm run lint     # eslint . --ext ts,tsx --max-warnings 0
```

## Boundaries

- ✅ **Always:** Use the state ownership decision tree before placing any state. Define query keys following the project convention. Register new
  routes inside the `children` array in `src/App.tsx`. Add new API resources to `src/api/` using the `unwrap` pattern.
- ⚠️ **Ask first:** Adding a new Zustand store (check whether an existing store covers the concern). Adding a heavy new dependency (assess
  chunk impact). Changing the route structure.
- 🚫 **Never:** Cache server data in Zustand. Propose raw palette Tailwind classes (`bg-gray-*`, `text-blue-*`) or hardcoded hex in designs.
  Recommend raising the 650 KB chunk size threshold without justification. Duplicate concerns already covered by `filterStore`, `uiStore`,
  or `themeStore`.

## 1. State ownership rules

Use this decision tree before placing any state:

| Question                                                                                | Where it lives                                  |
|-----------------------------------------------------------------------------------------|-------------------------------------------------|
| Is it fetched from the backend API?                                                     | **TanStack Query** (`useQuery` / `useMutation`) |
| Is it UI state shared across multiple unrelated components and must survive navigation? | **Zustand** (`src/store/`)                      |
| Is it transient UI state local to one component or its direct children?                 | **React `useState`** inside the component       |

### Existing Zustand stores (never duplicate their concern)

- `filterStore` — `selectedLanguageId`, `selectedCategoryId`; reset category when language changes
- `uiStore` — `showUpload`, `showExport`; toggling one closes the other
- `themeStore` — active theme id, available themes, `init()` on app mount, `setTheme()`, persisted in `localStorage` under key `tih-theme-id`

Do **not** use Zustand to cache API data — that is TanStack Query's job.

---

## 2. Query key design

When designing a new query, register its key following the project convention:

```
['resource']                              → list of all items
['resource', parentId]                   → list filtered by parent
['resource', id]                         → single item by id
['resource', 'search', ...searchParams]  → search/filter results
```

Invalidate at the highest useful prefix:

```ts
queryClient.invalidateQueries({queryKey: ['questions']})
// invalidates both ['questions'] and ['questions', id] and ['questions','search',...]
```

---

## 3. Component decomposition hierarchy

```
src/pages/          ← Route-level containers. Orchestrate data + layout. No domain UI logic.
src/components/
  question/         ← Domain components: QuestionCard, QuestionForm
  search/           ← Search-specific: SearchBox, SearchResults
  editor/           ← Editor-specific: RichTextEditor, EditorToolbar
  common/           ← Generic reusable UI used by ≥2 features
  layout/           ← App shell: Layout, Header, ThemeSwitcher
```

**Rule**: A page component owns `useQuery`/`useMutation` calls and passes data down as props to feature components. Common components must not import
from `src/api/` or `src/store/` unless they are intentionally self-contained (e.g., `FilterPanel`, `LanguageSelector`).

When a component needs to manage CRUD operations inline (e.g., `ManageLanguagesModal`), it may own its own `useQuery`/`useMutation` internally.
Document this in a comment.

---

## 4. Adding a new route

1. Create a page component `src/pages/MyFeaturePage.tsx` with `export default function MyFeaturePage()`.
2. Add a lazy import and route entry in `src/App.tsx`:
   ```ts
   const MyFeaturePage = lazy(() => import('@/pages/MyFeaturePage'))
   // inside the Layout children array:
   { path: 'my-feature', element: withSuspense(MyFeaturePage) },
   ```
3. The route is automatically wrapped in `<Layout>` (Header + `<main>`).
4. Add a navigation entry in `src/components/layout/Header.tsx` if visible to users.

---

## 5. Adding a new API resource

1. Create `src/api/myResource.ts` following the `unwrap` helper pattern:
   ```ts
   import type { AxiosResponse } from 'axios'
   import apiClient from './client'
   import type { MyResource, MyResourceCreateRequest } from '@/types'

   const unwrap = <T>(r: AxiosResponse<T>) => r.data

   export const myResourceApi = {
     getAll:  () => apiClient.get<MyResource[]>('/my-resource').then(unwrap),
     getById: (id: number) => apiClient.get<MyResource>(`/my-resource/${id}`).then(unwrap),
     create:  (data: MyResourceCreateRequest) => apiClient.post<MyResource>('/my-resource', data).then(unwrap),
     update:  (id: number, data: MyResourceCreateRequest) => apiClient.put<MyResource>(`/my-resource/${id}`, data).then(unwrap),
     delete:  (id: number) => apiClient.delete(`/my-resource/${id}`),
   }
   ```
2. Add the domain type and request type to `src/types/index.ts`.
3. Define query keys following the convention in section 2.

---

## 6. Extending the theme system

To add a new theme:

1. Create `public/themes/my-theme.json`:
   ```json
   {
     "id": "my-theme",
     "name": "My Theme",
     "tokens": {
       "color-background": "#...",
       "color-surface": "#...",
       "color-foreground": "#..."
       // ... all tokens from index.css :root block
     }
   }
   ```
2. Register it in `public/themes/_manifest.json` under `themes[]`.
3. To add a new language badge colour, add an entry in `src/constants/languageColors.ts`:
   ```ts
   myLang: 'bg-badge-lang-mylang-bg text-badge-lang-mylang-text',
   ```
   Then add the corresponding `--color-badge-lang-mylang-*` tokens to every theme JSON and to `src/index.css` `:root`.
4. Register the new Tailwind tokens in `tailwind.config.js` under `theme.extend.colors`.

---

## 7. Vite chunk strategy

Large third-party libraries are split into named manual chunks in `vite.config.ts`.  
When adding a heavy new dependency, decide which chunk it belongs to or create a new named chunk.  
Current chunks: `react-core`, `editor`, `mermaid`, `syntax-highlighter`, `markdown`, `query`, `utils`.  
Chunk size warning threshold: **650 KB**; do not raise it without justification.
