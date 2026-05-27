---
applyTo: "**"
---

# tih-ui — GitHub Copilot Instructions

## Project purpose

**Tech Interview Helper UI** — a React SPA for browsing, searching, creating, and managing technical interview Q&A.  
It communicates with a Spring Boot backend (`tih-app`) via a REST API proxied at `/api/v1`.

---

## Tech stack

| Concern             | Library / tool                                                                                     |
|---------------------|----------------------------------------------------------------------------------------------------|
| UI framework        | React 18 (strict mode)                                                                             |
| Language            | TypeScript 5 — `strict: true`, `noUnusedLocals`, `noUnusedParameters`                              |
| Bundler             | Vite 6                                                                                             |
| Routing             | React Router v6 (`createBrowserRouter`, `<Outlet>`)                                                |
| Server state        | TanStack Query v5 (`staleTime: 5 min`, `retry: 1`)                                                 |
| UI / client state   | Zustand v5                                                                                         |
| Rich-text editor    | Tiptap v2 with `tiptap-markdown` (stores content as Markdown)                                      |
| Styling             | Tailwind CSS v3 + CSS custom properties (theme system)                                             |
| HTTP                | Axios — single `apiClient` in `src/api/client.ts`                                                  |
| Icons               | `lucide-react`                                                                                     |
| Conditional classes | `clsx`                                                                                             |
| Diagrams            | Mermaid, PlantUML                                                                                  |
| Linting             | ESLint 8 — `eslint-plugin-react`, `@typescript-eslint`, `react-hooks`, `react-refresh`, `prettier` |
| Formatting          | Prettier 3 — `printWidth: 100`, `trailingComma: "all"`, `semi: true`                               |

---

## Path alias

`@/` resolves to `src/`.  
Example: `import { questionsApi } from '@/api/questions'`

---

## Commands

```bash
npm run dev          # start dev server at http://localhost:5173 (proxies /api/* → localhost:8080)
npm run build        # tsc --noEmit && vite build  (must pass before any merge)
npm run lint         # eslint . --ext ts,tsx --max-warnings 0
npm run lint --fix   # auto-fix ESLint style issues
prettier --write "src/**/*.{ts,tsx,css}"   # format all source files
npm test             # run Vitest in watch mode
npm run test:coverage  # vitest run --coverage  (outputs lcov + text summary)
```

> Run `npm run build` after every code change; run `npm test` before marking a task done.

---

## Folder structure

```
src/
├── api/            # One file per backend resource (languagesApi, categoriesApi, tagsApi, questionsApi)
├── components/
│   ├── common/     # Shared UI (ModalShell, FilterPanel, PageLoader, PageError, InlineNameForm, …)
│   ├── editor/     # RichTextEditor + EditorToolbar (Tiptap)
│   ├── layout/     # Layout (shell + <Outlet>), Header, ThemeSwitcher
│   ├── question/   # QuestionCard, QuestionForm
│   └── search/     # SearchBox, SearchResults
├── constants/      # languageColors.ts, editorPalette.ts
├── hooks/          # Custom hooks (useSearch, useDebounce)
├── pages/          # Route-level components (lazy-loaded)
├── store/          # Zustand stores: filterStore, themeStore, uiStore
├── styles/         # Extra CSS (tags.css)
├── themes/         # applyTheme.ts, types.ts
├── types/          # index.ts — all domain and request/response types
└── utils/          # format.ts (formatDate)
```

---

## Domain types (`src/types/index.ts`)

Core models: `Language`, `Category`, `Tag`, `Question`  
Request shapes: `QuestionCreateRequest`, `LanguageCreateRequest`, `CategoryCreateRequest`, `TagCreateRequest`  
Response shapes: `PageResponse<T>`, `BatchUploadResponse`, `QuestionTransferItem`  
UI state: `FilterState`

---

## TanStack Query — query key conventions

| Data                      | Query key                                                            |
|---------------------------|----------------------------------------------------------------------|
| All languages             | `['languages']`                                                      |
| Categories for a language | `['categories', languageId]`                                         |
| Tags for a language       | `['tags', languageId]`                                               |
| All / filtered questions  | `['questions']`                                                      |
| Single question           | `['questions', id]`                                                  |
| Search                    | `['questions', 'search', query, languageId, categoryId, page, size]` |

Always invalidate with the broadest matching prefix, e.g. `invalidateQueries({ queryKey: ['questions'] })`.

---

## Zustand stores

| Store         | Purpose                                                                                                  |
|---------------|----------------------------------------------------------------------------------------------------------|
| `filterStore` | `selectedLanguageId` / `selectedCategoryId` — persists across navigation                                 |
| `themeStore`  | Active theme, available themes, `init()` / `setTheme()`, persisted via `localStorage` key `tih-theme-id` |
| `uiStore`     | Transient flags: `showUpload`, `showExport`                                                              |

Store pattern:

```ts
export const useXxxStore = create<XxxState>((set, get) => ({...}))
```

---

## Theming

- Themes are JSON files in `public/themes/` loaded at runtime via `fetch('/themes/<file>')`.
- `applyTokens(tokens)` writes CSS custom properties onto `:root` (e.g., `--color-primary-600`).
- Manifest: `public/themes/_manifest.json` — lists all themes, sets `defaultThemeId`.
- Tailwind `theme.extend.colors` in `tailwind.config.js` maps every semantic token to a CSS variable.

### ⚠️ ESLint strictness rules

- **No `any`** — `@typescript-eslint/no-explicit-any` is set to `"error"`. Use a specific type or `unknown` with a type guard.
- **No unused vars** — `@typescript-eslint/no-unused-vars` is `"error"`. Prefix intentionally unused params with `_`.
- **No `for...in`** — banned via `no-restricted-syntax`. Use `Object.keys/values/entries` instead.
- **`for...of` is allowed** — no restriction; use it freely for iteration.
- **No HTML entities in JSX** — `react/no-unescaped-entities` is active. Use JSX expressions for literal quotes: `` {`"${value}"`} `` or `{'"'}`.
  Never `&quot;`, `&amp;`, etc.
- **Prettier drives all formatting** — `printWidth: 100`. Never duplicate Prettier options in ESLint rules.

### ⚠️ Tailwind token rule

**Always use semantic colour tokens. Never hardcode hex or raw Tailwind palette classes.**

✅ `bg-surface`, `text-foreground`, `text-foreground-secondary`, `text-muted`, `text-muted-light`  
✅ `border-border`, `border-border-strong`, `border-border-focus`  
✅ `bg-primary-600`, `text-primary-600`, `hover:bg-primary-700`  
✅ `text-error`, `bg-error-bg`, `border-error-light`  
✅ `bg-surface-alt`, `shadow-theme-sm`, `shadow-theme-md`  
✅ `bg-toolbar-active-bg`, `text-toolbar-active-text`  
❌ `bg-gray-100`, `text-gray-500`, `#3b82f6`

Language badge colours are in `src/constants/languageColors.ts` — extend that map for new languages.

---

## Routing (`src/App.tsx`)

All routes live inside `<Layout>` (which renders `<Header>` + `<main><Outlet/></main>`).  
Routes use `createBrowserRouter`. The root path `/` redirects to `/search`.

```
/search                → SearchPage
/questions/new         → CreateQuestionPage
/questions/:id         → QuestionDetailPage
/questions/:id/edit    → EditQuestionPage
```

When adding a new route:

1. Create `src/pages/MyFeaturePage.tsx` with `export default function MyFeaturePage()`.
2. Import the page directly and add it to the `children` array in `src/App.tsx`.
3. Add a navigation entry in `src/components/layout/Header.tsx` if user-visible.

---

## API layer pattern (`src/api/`)

```ts
const unwrap = <T>(r: AxiosResponse<T>) => r.data

export const xxxApi = {
    getAll: (...) => apiClient.get<XxxType[]>('/xxx').then(unwrap),
    getById: (id) => apiClient.get<XxxType>(`/xxx/${id}`).then(unwrap),
    create: (data) => apiClient.post<XxxType>('/xxx', data).then(unwrap),
    update: (id, data) => apiClient.put<XxxType>(`/xxx/${id}`, data).then(unwrap),
    delete: (id) => apiClient.delete(`/xxx/${id}`),
}
```

Error messages are normalised inside the Axios response interceptor in `apiClient` — no need to re-wrap in individual api files.

---

## Conventional Commits

All commits and PR titles **must** follow Conventional Commits:

```
feat:      new feature
fix:       bug fix
refactor:  code change without behaviour change
chore:     build / config / deps
test:      tests only
docs:      documentation only
style:     formatting only (no logic change)
```

Breaking changes: append `!` after the type, e.g. `feat!: redesign question form`.

---

## Vite chunk strategy

Large third-party libraries are split into named manual chunks in `vite.config.ts`.  
When adding a heavy new dependency, assign it to an existing chunk or create a new named chunk.  
Current chunks: `react-core`, `editor`, `mermaid`, `syntax-highlighter`, `markdown`, `query`, `utils`.  
Chunk size warning threshold: **650 KB** — do not raise it without justification.

---

## AI agent setup

This project is configured for agent-assisted development. Use the agents and skills below instead of asking Copilot to do everything in one shot.

### Custom agents (`.github/agents/`)

| Agent file           | Role                                    | Handoff          |
|----------------------|-----------------------------------------|------------------|
| `plan.agent.md`      | Research & plan — read-only             | → implement      |
| `implement.agent.md` | Write / edit code                       | → review or test |
| `review.agent.md`    | Audit changes for convention compliance | → implement      |
| `test.agent.md`      | Write Vitest + RTL tests                | → review         |
| `lint.agent.md`      | Fix formatting & style only — no logic  | → review         |

### Skills (`.github/skills/`)

| Skill       | Trigger                                                          |
|-------------|------------------------------------------------------------------|
| `architect` | Designing features, deciding state ownership, routing, API shape |
| `developer` | Writing components, hooks, mutations, stores                     |
| `reviewer`  | Reviewing diffs or auditing files                                |
| `tester`    | Writing or scaffolding tests                                     |

### File-based instructions (`.github/instructions/`)

| File                               | Applies to               |
|------------------------------------|--------------------------|
| `react-typescript.instructions.md` | `src/**/*.{ts,tsx}`      |
| `testing.instructions.md`          | `src/**/*.test.{ts,tsx}` |
