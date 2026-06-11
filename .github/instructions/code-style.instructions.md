---
name: Code Style
description: >
  TypeScript, React, and test code-style rules for the Tech Interview Helper UI project.
  Covers source files and test files. All agents producing TypeScript/TSX code —
  react-developer, qa-engineer, and speckit.implement — MUST follow every rule in this
  file. No exceptions.
applyTo: "src/**/*.{ts,tsx}"
---

# Code Style — tih-ui

> All agents producing TypeScript or TSX code — including `react-developer`, `qa-engineer`,
> and `speckit.implement` — **MUST** strictly follow every rule in this file. **NO EXCEPTIONS.**

---

## TypeScript & React Code Style

Rules that apply to all source files under `src/`.

---

### Component Declaration

Use plain `function` syntax with a **named default export**. Never use `React.FC<Props>` or
arrow-function component exports from feature files:

```tsx
// ✅ correct
interface QuestionCardProps {
    question: Question
    onDelete: (id: number) => void
}

export default function QuestionCard({ question, onDelete }: QuestionCardProps) {
    // ...
}

// ❌ incorrect — React.FC<Props>
export const QuestionCard: React.FC<QuestionCardProps> = ({ question }) => { ... }

// ❌ incorrect — anonymous arrow export
export default ({ question }: QuestionCardProps) => { ... }
```

The `interface Props` declaration goes **above** the function in the same file. One component per file; filename matches the component name exactly (`QuestionCard.tsx`).

---

### Props Destructuring

Destructure props in the function signature, not inside the function body:

```tsx
// ✅ correct
export default function FilterPanel({ languageId, onLanguageChange }: FilterPanelProps) {
    // ...
}

// ❌ incorrect — destructuring inside body
export default function FilterPanel(props: FilterPanelProps) {
    const { languageId, onLanguageChange } = props;
    // ...
}
```

---

### No `any`

Never use `any`. Use a specific type or `unknown` with a type guard.
`@typescript-eslint/no-explicit-any` is set to `"error"` — the lint step will fail:

```ts
// ✅ correct
function processResponse(data: unknown) {
    if (typeof data === 'string') return data.trim();
}

// ❌ incorrect
function processResponse(data: any) { ... }
```

---

### Unused Variables & Parameters

No unused imports, variables, or parameters — enforced by `noUnusedLocals`,
`noUnusedParameters`, and `@typescript-eslint/no-unused-vars: "error"`.
Prefix **intentionally** unused parameters with `_`:

```ts
// ✅ correct — intentionally unused second argument
array.forEach((item, _index) => process(item));

// ❌ incorrect — unused variable with no underscore prefix
const result = compute(); // result never read
```

---

### Non-null Assertions

Non-null assertions (`!`) require a comment explaining why it is safe:

```ts
// ✅ correct — root element is guaranteed by index.html
ReactDOM.createRoot(document.getElementById('root')!).render(...)

// ❌ incorrect — unexplained non-null assertion
const el = document.getElementById(id)!;
```

---

### Conditional Class Names

Use `clsx` for **all** conditional class names — never template literals for colours or
complex conditions:

```tsx
// ✅ correct
<button className={clsx(
    'px-4 py-2 rounded-lg font-medium transition-colors',
    isActive ? 'bg-primary-600 text-white' : 'bg-surface text-foreground',
    disabled && 'opacity-50 cursor-not-allowed'
)}>

// ❌ incorrect — template literal with conditions
<button className={`px-4 py-2 ${isActive ? 'bg-primary-600' : 'bg-surface'}`}>
```

---

### Semantic Tailwind Tokens

**Always** use semantic colour tokens. **Never** hardcode hex or raw Tailwind palette classes:

```tsx
// ✅ correct
<div className="bg-surface text-foreground border border-border shadow-theme-sm">

// ❌ incorrect
<div className="bg-white text-gray-900 border border-gray-200">
<div style={{ background: '#ffffff', color: '#111827' }}>
```

Allowed semantic tokens: `bg-surface`, `bg-surface-alt`, `bg-background`, `text-foreground`,
`text-foreground-secondary`, `text-muted`, `text-muted-light`, `border-border`,
`border-border-strong`, `border-border-focus`, `bg-primary-600`, `hover:bg-primary-700`,
`text-primary-600`, `text-error`, `bg-error-bg`, `border-error-light`, `shadow-theme-sm`,
`shadow-theme-md`, `bg-toolbar-active-bg`, `text-toolbar-active-text`.

Language badge colours live in `src/constants/languageColors.ts` — extend that map for new languages; never add inline colours for badges.

---

### JSX Text Content

Never use HTML entities inside JSX. Use JSX expressions:

```tsx
// ✅ correct
<span>{`"${query}"`}</span>
<span>{'"'}{query}{'"'}</span>

// ❌ incorrect
<span>&quot;{query}&quot;</span>
```

---

### Import Ordering

Organise imports into groups separated by a single blank line, in this order:

1. React / react-dom (framework)
2. Third-party libraries (`@tanstack/react-query`, `react-router-dom`, `clsx`, `lucide-react`, etc.)
3. Project imports using the `@/` alias, ordered: `@/types` → `@/api` → `@/store` → `@/hooks` → `@/components` → `@/utils` → `@/constants`
4. Relative imports (`./`, `../`)

```ts
// ✅ correct
import { useState, useEffect } from 'react';

import { useQuery } from '@tanstack/react-query';
import clsx from 'clsx';
import { Pencil, Trash2 } from 'lucide-react';

import type { Question } from '@/types';
import { questionsApi } from '@/api/questions';
import { useUIStore } from '@/store/uiStore';
import ModalShell from '@/components/common/ModalShell';

// ❌ incorrect — mixed groups, no blank lines
import { Pencil } from 'lucide-react';
import { useState } from 'react';
import { questionsApi } from '@/api/questions';
import { useQuery } from '@tanstack/react-query';
```

No wildcard imports.

---

### No `for...in`

`for...in` is banned by ESLint (`no-restricted-syntax`). Use `Object.keys()`,
`Object.values()`, or `Object.entries()` instead:

```ts
// ✅ correct
for (const [key, value] of Object.entries(obj)) { ... }

// ❌ incorrect
for (const key in obj) { ... }
```

`for...of` is allowed freely.

---

### Icons

Import icons as **named imports from `lucide-react` only**. Never import entire icon packs
or use inline SVG for icons already available in Lucide:

```ts
// ✅ correct
import { Loader2, Pencil, Trash2, X, Plus, Search, ChevronDown } from 'lucide-react';

// ❌ incorrect
import * as Icons from 'lucide-react';
import { CustomSVGIcon } from './icons';
```

---

### Modals

Use `<ModalShell>` for **every** modal dialog. Never build a raw `<div role="dialog">` with
manual focus management from scratch:

```tsx
// ✅ correct
<ModalShell title="Delete Question" onClose={handleClose}>
    <p className="text-foreground-secondary">This action cannot be undone.</p>
</ModalShell>

// ❌ incorrect
<div role="dialog" className="fixed inset-0 ...">...</div>
```

---

### Accessibility

Every interactive element that is not a native `<button>` or `<a>` MUST have:
- `role` attribute
- `aria-label` or `aria-labelledby`
- `onKeyDown` / `onKeyUp` handlers for `Enter` and `Space`

Visible focus rings MUST use `focus-visible:ring-2 focus-visible:ring-border-focus`.
Never suppress focus outlines with `outline-none` alone.

Icon-only buttons MUST have an `aria-label`:

```tsx
// ✅ correct
<button aria-label="Delete question" className="... focus-visible:ring-2 focus-visible:ring-border-focus">
    <Trash2 className="w-4 h-4" />
</button>

// ❌ incorrect — no aria-label on icon-only button
<button><Trash2 /></button>
```

---

### API Layer

Each backend resource gets its own file in `src/api/`. Every function MUST use the `unwrap`
helper — never access `.data` inline:

```ts
// ✅ correct
const unwrap = <T>(r: AxiosResponse<T>) => r.data;

export const languagesApi = {
    getAll: () => apiClient.get<Language[]>('/languages').then(unwrap<Language[]>),
    getById: (id: number) => apiClient.get<Language>(`/languages/${id}`).then(unwrap<Language>),
    create: (data: LanguageCreateRequest) => apiClient.post<Language>('/languages', data).then(unwrap<Language>),
};

// ❌ incorrect — inline .data access
export const languagesApi = {
    getAll: () => apiClient.get<Language[]>('/languages').then(r => r.data),
};
```

Import `apiClient` only from `@/api/client`. Never import `axios` directly elsewhere.

---

### Zustand Stores

Store pattern: typed state interface → `create<State>` with arrow-function callback.
State interface above the `create` call:

```ts
// ✅ correct
interface UIState {
    showUpload: boolean;
    toggleUpload: () => void;
}

export const useUIStore = create<UIState>((set) => ({
    showUpload: false,
    toggleUpload: () => set((s) => ({ showUpload: !s.showUpload })),
}));

// ❌ incorrect — no typed interface
export const useUIStore = create((set) => ({ ... }));
```

Never store server data in Zustand — use TanStack Query.
Export the hook as `use<Name>Store` (camelCase, `use` prefix).

---

### TanStack Query

- `queryKey` MUST follow the project convention: `['resource']`, `['resource', id]`, `['resource', 'search', ...params]`.
- Paginated queries MUST use `placeholderData: (prev) => prev`.
- `onSuccess` / `onError` on `useQuery` are removed in v5 — use `useEffect` watching `isSuccess` / `isError`.
- Dependent queries MUST be guarded with `enabled: Boolean(param)`:

```ts
// ✅ correct
const { data } = useQuery({
    queryKey: ['categories', languageId],
    queryFn: () => categoriesApi.getAll(languageId!),
    enabled: Boolean(languageId),
    staleTime: 5 * 60 * 1000,
});

// ❌ incorrect — no enabled guard; query fires with null languageId
const { data } = useQuery({
    queryKey: ['categories', languageId],
    queryFn: () => categoriesApi.getAll(languageId!),
});
```

---

### Routing

All route-level pages MUST be lazy-loaded via `React.lazy` + `Suspense` in `src/App.tsx`.
New routes are added to the `children` array of the root route in `createBrowserRouter`:

```ts
// ✅ correct
const NewPage = lazy(() => import('@/pages/NewPage'));
{ path: 'new-path', element: withSuspense(NewPage) }

// ❌ incorrect — direct import without lazy loading
import NewPage from '@/pages/NewPage';
{ path: 'new-path', element: <NewPage /> }
```

---

### Domain Types

All domain types, request shapes, and response shapes live **exclusively** in
`src/types/index.ts`. Never define reusable types inline in component files:

```ts
// ✅ correct — in src/types/index.ts
export interface TagCreateRequest {
    name: string;
    languageId: number;
}

// ❌ incorrect — type defined inside a component file
interface TagCreateRequest { ... }
```

---

## Unit Testing Code Style

Rules that apply to test files (`*.test.ts`, `*.test.tsx`) only.

---

### Mock Grouping

Group `vi.mock()` calls at the top of the file, before imports of the mocked modules.
No blank lines between mock declarations. One blank line before the first `describe` block:

```ts
// ✅ correct
vi.mock('@/api/questions');
vi.mock('@/api/categories');
vi.mock('@/components/editor/RichTextEditor', () => ({ default: MockEditor }));

describe('QuestionForm', () => {
```

---

### Describe / It Naming

`describe` matches the component or hook name. `it` describes the expected behaviour in
plain English, starting with `should`:

```ts
// ✅ correct
describe('QuestionCard', () => {
    it('should display the question text', () => { ... })
    it('should call onDelete when the delete button is clicked', () => { ... })
})

// ❌ incorrect
test('test 1', () => { ... })
it('delete button', () => { ... })
```

---

### Given / When / Then Structure

Structure test bodies with a blank line separating the three phases:

```ts
it('should show an error when the API call fails', async () => {
    // given
    mockGetAll.mockRejectedValue(new Error('Network error'));

    // when
    renderWithProviders(<QuestionList />);

    // then
    expect(await screen.findByText(/something went wrong/i)).toBeInTheDocument();
});
```

---

### Zustand Reset

Reset all Zustand stores used by the component under test in `afterEach`:

```ts
// ✅ correct
afterEach(() => {
    useFilterStore.setState({ selectedLanguageId: null, selectedCategoryId: null });
});

// ❌ incorrect — store state bleeds between tests
```

---

### Date Fixtures

Always use **midday UTC** (`T12:00:00Z`) in date string fixtures to prevent timezone
rollover failures:

```ts
// ✅ correct
const question = { createdAt: '2024-03-15T12:00:00Z' };

// ❌ incorrect — midnight UTC may shift the date in negative-offset timezones
const question = { createdAt: '2024-03-15T00:00:00Z' };
```

---

### RichTextEditor Mock

Always mock `RichTextEditor` — Tiptap does not run in jsdom:

```ts
vi.mock('@/components/editor/RichTextEditor', () => ({
    default: ({ content, onChange }: { content: string; onChange: (v: string) => void }) => (
        <textarea data-testid="rich-text-editor" value={content} onChange={(e) => onChange(e.target.value)} />
    ),
}));
```

---

### useBlocker Mock

Always mock `useBlocker` when rendering `QuestionForm` — it requires a data router:

```ts
vi.mock('react-router-dom', async (importOriginal) => {
    const actual = await importOriginal<typeof import('react-router-dom')>();
    return { ...actual, useBlocker: () => ({ state: 'unblocked', proceed: vi.fn(), reset: vi.fn() }) };
});
```
