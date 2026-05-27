---
name: developer
description: Implement features in tih-ui following established code patterns and conventions. Use this skill when writing new components, hooks, API calls, Zustand store slices, or wiring up TanStack Query.
---

# Developer Skill — tih-ui

You are implementing features for **tih-ui** — a React 18 + TypeScript SPA with TypeScript 5 (strict), Vite 6, React Router v6, TanStack Query v5,
Zustand v5, Tiptap v2, Tailwind CSS v3, Axios, `clsx`, and `lucide-react`. Follow the established patterns exactly — reviewers will flag deviations.

## Commands

Run these after writing code to confirm your changes are valid:

```bash
npm run build          # tsc --noEmit + vite build — must pass with zero errors
npm run lint           # eslint . --ext ts,tsx --max-warnings 0
npm run lint --fix     # auto-fix style issues
prettier --write "src/**/*.{ts,tsx,css}"
npm test               # confirm no regressions
```

## Boundaries

- ✅ **Always:** Add new domain types to `src/types/index.ts`. Use `<ModalShell>` for all dialogs. Import icons only from `lucide-react`.
  Use semantic Tailwind tokens only. Validate with `npm run build` before handing off.
- ⚠️ **Ask first:** Adding a new `npm` dependency. Creating a new Zustand store. Changing `vite.config.ts` manual chunks.
- 🚫 **Never:** Import `axios` directly outside `src/api/client.ts`. Use `any`. Store server data in Zustand. Use raw Tailwind palette
  classes or hardcoded hex. Leave unused imports or parameters. Commit or push.

---

## 1. Component template

```tsx
// Always: named default export, no React.FC, props interface above the function
interface MyComponentProps {
    value: string
    onChange: (v: string) => void
    optional?: boolean
}

export default function MyComponent({value, onChange, optional = false}: MyComponentProps) {
    // ...
}
```

- **No** `React.FC<Props>` — use plain function syntax.
- Props interface goes **above** the component function in the same file.
- One component per file; filename matches the component name (`MyComponent.tsx`).
- Default exports only — no named component exports from feature files.

---

## 2. Conditional classes

Always use `clsx` for conditional class names. Import it from `'clsx'`.

```tsx
import clsx from 'clsx'

function MyButton({isActive}: { isActive: boolean }) {
    return (
        <button
            className={clsx(
                'px-3 py-1.5 rounded-full text-sm border transition-colors',
                isActive
                    ? 'bg-toolbar-active-bg text-toolbar-active-text border-toolbar-active-bg'
                    : 'bg-surface text-muted border-border hover:border-border-strong',
            )}
        >
            ...
        </button>
    )
}
```

**Never** use template literals or inline `style` objects for colours.

---

## 3. TanStack Query v5 patterns

### Reading data

```tsx
const {data: languages = [] as Language[]} = useQuery({
    queryKey: ['languages'],
    queryFn: languagesApi.getAll,
})

// Dependent query (disabled until parent resolves)
const {data: categories = [] as Category[]} = useQuery({
    queryKey: ['categories', languageId],
    queryFn: () => categoriesApi.getAll(languageId!),
    enabled: Boolean(languageId),
})

// Paginated query — keeps previous page visible while loading the next
const {data, isLoading} = useQuery({
    queryKey: ['questions', 'search', query, langId, catId, page, size],
    queryFn: () => questionsApi.search({q: query, languageId: langId, categoryId: catId, page, size}),
    placeholderData: (prev) => prev,  // ← v5 syntax, NOT keepPreviousData
})
```

### Mutating data

```tsx
const queryClient = useQueryClient()

const mutation = useMutation<ReturnType, Error, PayloadType>({
    mutationFn: (data) => questionsApi.create(data),
    onSuccess: (saved) => {
        queryClient.invalidateQueries({queryKey: ['questions']})
        navigate(`/questions/${saved.id}`, {replace: true})
    },
    onError: () => {
        // reset any saving guards here
    },
})

// Trigger: mutation.mutate(payload)
// Loading state: mutation.isPending
// Error: mutation.isError, mutation.error
```

---

## 4. Zustand store additions

Follow the existing pattern in `src/store/`:

```ts
import {create} from 'zustand'

interface MyState {
    isOpen: boolean
    open: () => void
    close: () => void
}

export const useMyStore = create<MyState>((set) => ({
    isOpen: false,
    open: () => set({isOpen: true}),
    close: () => set({isOpen: false}),
}))
```

Use `(set, get)` only when you need to read current state inside an action.  
Do **not** store server data in Zustand — use TanStack Query for that.

---

## 5. Modal pattern

All dialogs/modals **must** use `<ModalShell>` from `src/components/common/ModalShell.tsx`.

```tsx
import ModalShell from '@/components/common/ModalShell'

// Props: title, onClose, children, footer?, maxWidth?: 'sm' | 'md' | 'lg' (default 'lg')
function MyFeatureModal({onClose}: { onClose: () => void }) {
    return (
        <ModalShell
            title="My Dialog"
            onClose={onClose}
            maxWidth="md"
            footer={<FooterJSX/>}
        >
            <div className="px-6 py-5 space-y-4">
                {/* content */}
            </div>
        </ModalShell>
    )
}
```

Render modals conditionally at the **bottom** of the parent component's JSX:

```tsx
function ParentComponent() {
    const [showModal, setShowModal] = useState(false)
    return (
        <div>
            {/* ...main content... */}
            {showModal && <MyModal onClose={() => setShowModal(false)}/>}
        </div>
    )
}
```

---

## 6. Page-level loading and error states

```tsx
import PageLoader from '@/components/common/PageLoader'
import PageError from '@/components/common/PageError'

function MyPage() {
    // ...useQuery calls...
    if (isLoading) return <PageLoader/>
    if (isError || !data) return <PageError message="Item not found."/>
    // ...render content
}
```

---

## 7. Inline edit / CRUD forms inside modals

For inline name editing (e.g., renaming a language or category), use `<InlineNameForm>` from `src/components/common/InlineNameForm.tsx`:

```tsx
import InlineNameForm from '@/components/common/InlineNameForm'

function EditableItem({name, onSave, onCancel, isPending, error}: EditableItemProps) {
    return (
        <InlineNameForm
            value={name}
            onChange={setEditValue}
            onSave={onSave}
            onCancel={onCancel}
            isPending={isPending}
            error={error}
            placeholder="Name…"
        />
    )
}
```

---

## 8. Writing a custom hook

Hooks go in `src/hooks/`. Co-locate the query logic there when the same query is used by more than one component:

```ts
// src/hooks/useLanguages.ts
import {useQuery} from '@tanstack/react-query'
import {languagesApi} from '@/api/languages'
import type {Language} from '@/types'

export function useLanguages() {
    return useQuery({
        queryKey: ['languages'],
        queryFn: languagesApi.getAll,
        // returns: { data: Language[] | undefined, isLoading, isError }
    })
}
```

Reference: `src/hooks/useSearch.ts` — debounces the query string with `useDebounce(value, 400)` before passing it to the query function.

---

## 9. Rich-text editor usage

To embed the rich-text editor (Tiptap + Markdown):

```tsx
import RichTextEditor from '@/components/editor/RichTextEditor'

function QuestionEditor({markdownString, setValue}: { markdownString: string; setValue: (v: string) => void }) {
    return (
        <RichTextEditor
            content={markdownString}           // current Markdown string
            onChange={(val) => setValue(val)}  // fires with updated Markdown on every keystroke
            placeholder="Write here…"
            readOnly={false}                   // omit or false for editable
        />
    )
}
```

To render stored Markdown content (read-only):

```tsx
import MarkdownViewer from '@/components/common/MarkdownViewer'

function QuestionDetail({question}: { question: Question }) {
    return <MarkdownViewer content={question.answerContent}/>
}
```

---

## 10. Date formatting

```ts
import {formatDate} from '@/utils/format'

const label = formatDate(question.createdAt)  // → "Jan 15, 2025"
```

---

## 11. Icons

Use `lucide-react` exclusively. Common icons already in use:
`Loader2` (spinner with `animate-spin`), `Pencil`, `Trash2`, `Settings2`, `X`, `Check`, `Plus`, `Search`

```tsx
import {Loader2} from 'lucide-react'

function SaveButton({isPending}: { isPending: boolean }) {
    return (
        <button>
            {isPending && <Loader2 className="w-4 h-4 animate-spin"/>}
            Save
        </button>
    )
}
```
