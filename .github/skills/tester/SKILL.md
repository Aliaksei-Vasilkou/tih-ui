---
name: tester
description: Write Vitest + React Testing Library tests for tih-ui components, hooks, and pages. Use this skill when adding tests for new or existing code, or when setting up the test infrastructure for the first time.
---

# Tester Skill — tih-ui

You are writing tests for **tih-ui** using **Vitest** and **React Testing Library**. You verify real user behaviour — never implementation details.
You write to `*.test.{ts,tsx}` files only and never touch source code.

## Boundaries

- ✅ **Always:** Co-locate test files next to the source file they test. Use `renderWithProviders` or `renderWithRoute` (never raw `render`
  without providers). Mock at the api module level (`vi.mock('@/api/...')`). Always mock `RichTextEditor`. Reset Zustand stores in `afterEach`.
  Use midday UTC timestamps (`T12:00:00Z`) in date fixtures.
- ⚠️ **Ask first:** Before modifying `src/test/renderWithProviders.tsx` or `src/test/renderWithRoute.tsx` (shared infrastructure). Before
  adding a new testing dependency.
- 🚫 **Never:** Modify source files. Remove a failing test. Mock `apiClient` directly. Test CSS class names or internal React state. Use
  midnight UTC timestamps (`T00:00:00Z`) — they cause timezone rollover in UTC-1 and earlier.

---

## 1. One-time setup (if not already done)

### Install dependencies

```bash
npm install -D vitest @vitest/coverage-v8 \
  @testing-library/react @testing-library/user-event @testing-library/jest-dom \
  jsdom
```

### Update `vite.config.ts`

> ⚠️ **Important:** import `defineConfig` from `vitest/config`, **not** from `vite`.
> The `test` block is only typed in `vitest/config`.

```ts
import {defineConfig} from 'vitest/config'   // ← vitest/config, not vite
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
    // ...existing config (plugins, resolve, server, build)...
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: ['./src/test/setup.ts'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'lcov'],
            include: ['src/**/*.{ts,tsx}'],
            exclude: ['src/main.tsx', 'src/**/*.d.ts', 'src/test/**'],
        },
    },
})
```

### Create `src/test/setup.ts`

```ts
import '@testing-library/jest-dom'
```

### Create `src/test/renderWithProviders.tsx`

For components that do **not** need route params:

```tsx
import {render, type RenderOptions} from '@testing-library/react'
import {QueryClient, QueryClientProvider} from '@tanstack/react-query'
import {MemoryRouter} from 'react-router-dom'
import type {ReactNode} from 'react'

function createTestClient() {
    return new QueryClient({
        defaultOptions: {
            queries: {retry: false, gcTime: 0},
            mutations: {retry: false},
        },
    })
}

interface ProvidersProps {
    children: ReactNode
    initialEntries?: string[]
}

function Providers({children, initialEntries = ['/']}: ProvidersProps) {
    const client = createTestClient()
    return (
        <QueryClientProvider client={client}>
            <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>
        </QueryClientProvider>
    )
}

export function renderWithProviders(
    ui: React.ReactElement,
    options?: Omit<RenderOptions, 'wrapper'> & { initialEntries?: string[] },
) {
    const {initialEntries, ...rest} = options ?? {}
    return render(ui, {
        wrapper: ({children}) => <Providers initialEntries={initialEntries}>{children}</Providers>,
        ...rest,
    })
}
```

### Create `src/test/renderWithRoute.tsx`

For **page-level components** that use `useParams` — `MemoryRouter` alone does not populate
route params. Use `Routes` + `Route` to bind them:

```tsx
import {render, type RenderOptions} from '@testing-library/react'
import {QueryClient, QueryClientProvider} from '@tanstack/react-query'
import {MemoryRouter, Routes, Route} from 'react-router-dom'
import type {ReactNode} from 'react'

function createTestClient() {
    return new QueryClient({
        defaultOptions: {
            queries: {retry: false, gcTime: 0},
            mutations: {retry: false},
        },
    })
}

interface ProvidersWithRouteProps {
    children: ReactNode
    path: string
    initialEntry: string
}

function ProvidersWithRoute({children, path, initialEntry}: ProvidersWithRouteProps) {
    const client = createTestClient()
    return (
        <QueryClientProvider client={client}>
            <MemoryRouter initialEntries={[initialEntry]}>
                <Routes>
                    <Route path={path} element={children}/>
                </Routes>
            </MemoryRouter>
        </QueryClientProvider>
    )
}

// Use for pages with useParams (e.g. QuestionDetailPage, EditQuestionPage)
export function renderWithRoute(
    ui: React.ReactElement,
    options: { path: string; initialEntry: string } & Omit<RenderOptions, 'wrapper'>,
) {
    const {path, initialEntry, ...rest} = options
    return render(ui, {
        wrapper: ({children}) => (
            <ProvidersWithRoute path={path} initialEntry={initialEntry}>
                {children}
            </ProvidersWithRoute>
        ),
        ...rest,
    })
}
```

### Add scripts to `package.json`

```json
"test": "vitest",
"test:ui": "vitest --ui",
"test:coverage": "vitest run --coverage"
```

### Add `coverage/` to `.gitignore`

The coverage output folder must **not** be committed:

```gitignore
# Test coverage
coverage/
```

### Add vitest globals type to `tsconfig.json`

```json
{
  "compilerOptions": {
    "types": [
      "vitest/globals"
    ]
  }
}
```

---

## 2. Test file location and naming

- **Co-locate** test files next to the source file they test:
  ```
  src/components/common/DeleteConfirmDialog.tsx
  src/components/common/DeleteConfirmDialog.test.tsx   ← test file here
  ```
- Naming: `ComponentName.test.tsx` for components, `useHookName.test.ts` for hooks.

---

## 3. Choosing the right render helper

| Situation                              | Helper to use                                          |
|----------------------------------------|--------------------------------------------------------|
| Component or hook with no route params | `renderWithProviders`                                  |
| Page that calls `useParams`            | `renderWithRoute`                                      |
| Hook tested in isolation               | `renderHook` with a bare `QueryClientProvider` wrapper |

```tsx
// Component (no route params)
renderWithProviders(<FilterPanel/>, {initialEntries: ['/search']})

// Page with :id param  ← useParams requires this
renderWithRoute(<QuestionDetailPage/>, {
    path: '/questions/:id',
    initialEntry: '/questions/42',
})
```

---

## 4. Mocking API modules

Mock at the **api module** level, never mock `apiClient` directly.

```ts
// At the top of the test file, before imports
vi.mock('@/api/questions')

import {questionsApi} from '@/api/questions'

const mockGetById = vi.mocked(questionsApi.getById)

beforeEach(() => {
    mockGetById.mockResolvedValue({
        id: 1,
        questionText: 'What is a closure?',
        answerContent: 'A closure...',
        languageId: 1,
        languageName: 'JavaScript',
        languageCode: 'javascript',
        categoryId: 1,
        categoryName: 'Functions',
        tags: ['L2'],
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
        createdBy: 'admin',
    })
})
```

---

## 5. Mocking heavy or router-dependent components

### RichTextEditor (Tiptap)

`RichTextEditor` is built on Tiptap, which does not run in jsdom. Always mock it:

```ts
vi.mock('@/components/editor/RichTextEditor', () => ({
    default: ({content, onChange}: { content: string; onChange: (v: string) => void }) => (
        <textarea
            data - testid = "rich-text-editor"
    value = {content}
    onChange = {(e)
=>
onChange(e.target.value)
}
/>
),
}))
```

### useBlocker (React Router)

`useBlocker` requires a **data router** (`createBrowserRouter`). It throws inside `MemoryRouter`.
Mock it in any test file that renders `QuestionForm`:

```ts
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
    return {
        ...actual,
        useBlocker: vi.fn(() => ({state: 'unblocked', reset: undefined, proceed: undefined})),
    }
})
```

---

## 6. Resetting Zustand stores between tests

```ts
import {act} from '@testing-library/react'
import {useFilterStore} from '@/store/filterStore'

afterEach(() => {
    act(() => {
        useFilterStore.setState({
            selectedLanguageId: null,
            selectedCategoryId: null,
        })
    })
})
```

Apply the same pattern for `useUIStore` and `useThemeStore` when a test modifies them.

---

## 7. Test naming convention

```ts
describe('DeleteConfirmDialog', () => {
    it('should render the item label in the confirmation message', () => { ...
    })
    it('should call onConfirm when the Delete button is clicked', () => { ...
    })
    it('should show a spinner and disable both buttons while isDeleting is true', () => { ...
    })
    it('should call onCancel when the Cancel button is clicked', () => { ...
    })
})
```

Pattern: `describe('<ComponentName>')` → `it('should <behaviour>')`

---

## 8. Common test patterns

### Loading state — PageLoader

`PageLoader` renders a `<span>` with text, not an element with `role="status"`. Query it by text:

```tsx
// ✅ correct
expect(screen.getByText(/loading/i)).toBeInTheDocument()

// ❌ wrong — PageLoader has no role="status"
expect(screen.getByRole('status')).toBeInTheDocument()
```

### Asserting async query state

```tsx
import {screen, waitFor} from '@testing-library/react'
import {renderWithRoute} from '@/test/renderWithRoute'

it('should display the question text after loading', async () => {
    renderWithRoute(<QuestionDetailPage/>, {
        path: '/questions/:id',
        initialEntry: '/questions/1',
    })

    // Loading state
    expect(screen.getByText(/loading/i)).toBeInTheDocument()

    // Resolved state
    await waitFor(() => {
        expect(screen.getByText('What is a closure?')).toBeInTheDocument()
    })
})
```

### Disambiguation when the same text appears multiple times

When a word appears as both a badge value and a tag (e.g. a category named "OOP" and a tag called
"OOP"), `getByText` throws a "multiple elements" error. Use unique test data or `getAllByText`:

```tsx
// ✅ use distinct category name to avoid collision
makeQuestion({categoryName: 'MyCategory', tags: ['L2', 'Basics']})

// ✅ or use getAllByText when duplicates are intentional
expect(screen.getAllByText('OOP').length).toBeGreaterThan(0)
```

### Asserting mutation + cache invalidation

```tsx
import userEvent from '@testing-library/user-event'

it('should call questionsApi.create after valid form submission', async () => {
    const user = userEvent.setup()
    vi.mocked(questionsApi.create).mockResolvedValue({id: 42, ...mockQuestion})

    renderWithProviders(<CreateQuestionPage/>)

    await user.type(screen.getByPlaceholderText(/interview question/i), 'What is a closure?')
    await user.click(screen.getByRole('button', {name: /create question/i}))

    await waitFor(() => {
        expect(vi.mocked(questionsApi.create)).toHaveBeenCalledOnce()
    })
})
```

### Testing dialogs that share button text with the page

When both the page and a dialog contain a "Delete" button, `getAllByRole` is safer:

```tsx
// Open the dialog
await user.click(screen.getByRole('button', {name: /delete/i}))
await waitFor(() => expect(screen.getByText(/are you sure/i)).toBeInTheDocument())

// There are now two Delete buttons — index 1 is inside the dialog
const deleteButtons = screen.getAllByRole('button', {name: /delete/i})
await user.click(deleteButtons[1])

await waitFor(() => expect(questionsApi.delete).toHaveBeenCalledWith(42))
```

### Testing error state

```tsx
it('should render PageError when the query rejects', async () => {
    vi.mocked(questionsApi.getById).mockRejectedValue(new Error('Not found'))

    renderWithRoute(<QuestionDetailPage/>, {
        path: '/questions/:id',
        initialEntry: '/questions/99',
    })

    await waitFor(() => {
        expect(screen.getByText(/question not found/i)).toBeInTheDocument()
    })
})
```

### Custom Select component

`Select` is a custom dropdown (not a native `<select>`). Open it via the trigger button, then
click the option button inside the listbox:

```tsx
// Open the dropdown
await user.click(screen.getByRole('button', {name: /select language/i}))
await waitFor(() => expect(screen.getByRole('listbox')).toBeInTheDocument())

// Click an option
await user.click(screen.getByRole('button', {name: 'JavaScript'}))
await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument())
```

### Testing a custom hook in isolation

```tsx
import {renderHook, waitFor, act} from '@testing-library/react'
import {QueryClientProvider} from '@tanstack/react-query'
import {useSearch} from '@/hooks/useSearch'

it('should debounce the search query', async () => {
    vi.useFakeTimers({shouldAdvanceTime: true})
    vi.mocked(questionsApi.search).mockResolvedValue({
        content: [], page: 0, size: 20, totalElements: 0, totalPages: 0, last: true,
    })

    const client = new QueryClient({defaultOptions: {queries: {retry: false, gcTime: 0}}})
    const wrapper = ({children}: { children: React.ReactNode }) => (
        <QueryClientProvider client={client}>{children}</QueryClientProvider>
    )

    const {result} = renderHook(() => useSearch('react', null, null), {wrapper})
    act(() => {
        vi.advanceTimersByTime(400)
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(questionsApi.search).toHaveBeenCalledWith(expect.objectContaining({q: 'react'}))

    vi.useRealTimers()
})
```

### Testing debounce timing

```ts
beforeEach(() => {
    vi.useFakeTimers()
})
afterEach(() => {
    vi.useRealTimers()
})

it('should not fire before the delay', () => {
    const {result, rerender} = renderHook(({value}) => useDebounce(value, 400), {
        initialProps: {value: 'a'},
    })
    rerender({value: 'b'})
    act(() => {
        vi.advanceTimersByTime(399)
    })
    expect(result.current).toBe('a')     // not yet updated

    act(() => {
        vi.advanceTimersByTime(1)
    })
    expect(result.current).toBe('b')     // now updated
})
```

### Date utilities — timezone safety

Use **midday** UTC timestamps to avoid date rollover when the test runner is in a timezone that
offsets midnight into the previous day:

```ts
// ✅ safe — midday is never affected by ±12h timezone offset
formatDate('2023-12-31T12:00:00Z')

// ⚠️ risky — 2023-12-31T00:00:00Z becomes 2023-12-30 in UTC-1 and earlier
formatDate('2023-12-31T00:00:00Z')
```

### Mocking `fetch` and `localStorage` for theme tests

```ts
vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
    ok: true,
    json: async () => mockManifest,
}))

// Restore after each test
afterEach(() => {
    vi.restoreAllMocks()
    localStorage.clear()
})
```

---

## 9. What to test (priority order)

1. **User interactions** — form submission, button clicks, modal open/close
2. **Async states** — loading spinner, success render, error render
3. **Conditional rendering** — empty states, disabled states, role-based visibility
4. **Custom hooks** — return values and side effects
5. **Utility functions** — pure functions in `src/utils/` (no providers needed)

Do **not** test implementation details (internal state, private functions, CSS class names).
