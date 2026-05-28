# Developer — Implementation Patterns

## TanStack Query v5

### Reading data

```tsx
const {data: languages = [] as Language[]} = useQuery({
    queryKey: ['languages'],
    queryFn: languagesApi.getAll,
})

// Dependent query — disabled until parent resolves
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
// trigger: mutation.mutate(payload)
// loading: mutation.isPending
// error: mutation.isError, mutation.error
```

## Zustand store additions

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

## Modal pattern

All dialogs **must** use `<ModalShell>` from `src/components/common/ModalShell.tsx`:

```tsx
import ModalShell from '@/components/common/ModalShell'

// Props: title, onClose, children, footer?, maxWidth?: 'sm' | 'md' | 'lg' (default 'lg')
function MyFeatureModal({onClose}: {onClose: () => void}) {
    return (
        <ModalShell title="My Dialog" onClose={onClose} maxWidth="md" footer={<FooterJSX/>}>
            <div className="px-6 py-5 space-y-4">{/* content */}</div>
        </ModalShell>
    )
}
```

Render modals conditionally at the **bottom** of the parent component's JSX:

```tsx
{showModal && <MyModal onClose={() => setShowModal(false)}/>}
```

## Page-level loading and error states

```tsx
import PageLoader from '@/components/common/PageLoader'
import PageError from '@/components/common/PageError'

function MyPage() {
    if (isLoading) return <PageLoader/>
    if (isError || !data) return <PageError message="Item not found."/>
    // render content
}
```

## Inline edit with InlineNameForm

```tsx
import InlineNameForm from '@/components/common/InlineNameForm'

<InlineNameForm
    value={name}
    onChange={setEditValue}
    onSave={onSave}
    onCancel={onCancel}
    isPending={isPending}
    error={error}
    placeholder="Name…"
/>
```

## Writing a custom hook

```ts
// src/hooks/useLanguages.ts
import {useQuery} from '@tanstack/react-query'
import {languagesApi} from '@/api/languages'

export function useLanguages() {
    return useQuery({
        queryKey: ['languages'],
        queryFn: languagesApi.getAll,
    })
}
```

Reference: `src/hooks/useSearch.ts` — debounces the query string with `useDebounce(value, 400)` before passing it to the query function.

## Rich-text editor usage

```tsx
import RichTextEditor from '@/components/editor/RichTextEditor'

// Editable
<RichTextEditor
    content={markdownString}
    onChange={(val) => setValue(val)}
    placeholder="Write here…"
    readOnly={false}
/>

// Read-only rendering
import MarkdownViewer from '@/components/common/MarkdownViewer'
<MarkdownViewer content={question.answerContent}/>
```

## Date formatting

```ts
import {formatDate} from '@/utils/format'
const label = formatDate(question.createdAt)  // → "Jan 15, 2025"
```

## Icons

```tsx
import {Loader2} from 'lucide-react'

function SaveButton({isPending}: {isPending: boolean}) {
    return (
        <button>
            {isPending && <Loader2 className="w-4 h-4 animate-spin"/>}
            Save
        </button>
    )
}
```

Common icons already in use: `Loader2`, `Pencil`, `Trash2`, `Settings2`, `X`, `Check`, `Plus`, `Search`
