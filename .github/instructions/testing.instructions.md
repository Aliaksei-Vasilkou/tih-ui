---
name: Testing conventions
description: Vitest + React Testing Library conventions for all test files in tih-ui
applyTo: "src/**/*.test.{ts,tsx}"
---

# Testing conventions — tih-ui



## File location & naming

- Co-locate test files next to the source file they test.
- `ComponentName.test.tsx` for components, `useHookName.test.ts` for hooks.

## Choosing the right render helper

| Situation                     | Helper                                                  |
|-------------------------------|---------------------------------------------------------|
| Component with no `useParams` | `renderWithProviders` from `@/test/renderWithProviders` |
| Page that calls `useParams`   | `renderWithRoute` from `@/test/renderWithRoute`         |
| Hook in isolation             | `renderHook` + bare `QueryClientProvider`               |

```tsx
import {renderWithProviders} from '@/test/renderWithProviders'
import {renderWithRoute} from '@/test/renderWithRoute'

// Component — no route params needed
renderWithProviders(<FilterPanel/>)

// Page — useParams requires a matched route
renderWithRoute(<QuestionDetailPage/>, {
    path: '/questions/:id',
    initialEntry: '/questions/42',
})
```

## Mocking API modules

Mock at the **api module level** — never mock `apiClient` directly:

```ts
vi.mock('@/api/questions')
import {questionsApi} from '@/api/questions'

const mockGetById = vi.mocked(questionsApi.getById)
```

## Mocking heavy or router-dependent components

### RichTextEditor — always mock (Tiptap does not run in jsdom)

```ts
vi.mock('@/components/editor/RichTextEditor', () => ({
    default: ({content, onChange}: { content: string; onChange: (v: string) => void }) => (
        <textarea data - testid = "rich-text-editor" value = {content}
    onChange = {(e)
=>
onChange(e.target.value)
}
/>
),
}))
```

### useBlocker — always mock when rendering QuestionForm

`useBlocker` throws inside `MemoryRouter` because it requires a data router:

```ts
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
    return {
        ...actual,
        useBlocker: vi.fn(() => ({state: 'unblocked', reset: undefined, proceed: undefined})),
    }
})
```

## Resetting Zustand stores

```ts
afterEach(() => {
    act(() => {
        useFilterStore.setState({selectedLanguageId: null, selectedCategoryId: null})
    })
})
```

## Test naming

```ts
describe('ComponentName', () => {
    it('should <expected behaviour>', () => { ...
    })
})
```

## Common gotchas

### PageLoader has no `role="status"` — query by text

```ts
// ✅
expect(screen.getByText(/loading/i)).toBeInTheDocument()
// ❌ PageLoader renders a plain span, not a status landmark
expect(screen.getByRole('status')).toBeInTheDocument()
```

### Select is a custom dropdown — not a native `<select>`

Open the trigger button first, then click the option from the listbox:

```ts
await user.click(screen.getByRole('button', {name: /select language/i}))
await waitFor(() => expect(screen.getByRole('listbox')).toBeInTheDocument())
await user.click(screen.getByRole('button', {name: 'JavaScript'}))
```

### Avoid text collisions between badges and tags

Using "OOP" as both a categoryName and a tag name causes `getByText` to throw.
Always use clearly distinct values in test fixtures:

```ts
makeQuestion({categoryName: 'MyCategory', tags: ['L2', 'Basics']})
```

### Dialogs sharing button text with the page

When both the page and a dialog show "Delete", use `getAllByRole` and pick by index:

```ts
await user.click(screen.getByRole('button', {name: /delete/i}))  // opens dialog
const deleteButtons = screen.getAllByRole('button', {name: /delete/i})
await user.click(deleteButtons[1])  // second button is inside the dialog
```

### Timezone-safe date fixtures

Use midday UTC timestamps in date-related tests to prevent date rollover in
non-UTC environments:

```ts
// ✅ safe
'2023-12-31T12:00:00Z'
// ⚠️ risky in UTC-1 and earlier
'2023-12-31T00:00:00Z'
```

## What to test (priority order)

1. User interactions — button clicks, form submit, modal open/close
2. Async states — loading spinner, success render, error render
3. Conditional rendering — empty state, disabled state
4. Custom hook return values and side effects
5. Pure utility functions (`src/utils/`)

**Do not** test implementation details, internal React state, or CSS class names.

## Boundaries

- ✅ **Always:** Co-locate test files next to their source file. Use `renderWithProviders` or `renderWithRoute` — never `render` without
  providers. Mock at the api module level. Always mock `RichTextEditor`. Reset Zustand stores in `afterEach`. Use midday UTC timestamps
  (`T12:00:00Z`) in any date fixture.
- ⚠️ **Ask first:** Before modifying `src/test/renderWithProviders.tsx` or `src/test/renderWithRoute.tsx` (shared test infrastructure affects
  every test file). Before adding a new testing library or helper.
- 🚫 **Never:** Modify source files from a test file. Mock `apiClient` directly. Remove a failing test instead of fixing it. Assert on CSS
  class names or internal React state. Use `role="status"` to find `PageLoader` (it has none). Use midnight UTC timestamps in fixtures.
