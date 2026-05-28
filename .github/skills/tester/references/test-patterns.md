# Tester — Common Test Patterns

## Loading state — PageLoader

```tsx
// ✅ correct — PageLoader renders a <span> with text, not role="status"
expect(screen.getByText(/loading/i)).toBeInTheDocument()

// ❌ wrong
expect(screen.getByRole('status')).toBeInTheDocument()
```

## Asserting async query state

```tsx
it('should display the question text after loading', async () => {
    renderWithRoute(<QuestionDetailPage/>, {path: '/questions/:id', initialEntry: '/questions/1'})
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
    await waitFor(() => {
        expect(screen.getByText('What is a closure?')).toBeInTheDocument()
    })
})
```

## Mocking API modules

```ts
vi.mock('@/api/questions')
import {questionsApi} from '@/api/questions'
const mockGetById = vi.mocked(questionsApi.getById)

beforeEach(() => {
    mockGetById.mockResolvedValue({
        id: 1, questionText: 'What is a closure?', answerContent: 'A closure...',
        languageId: 1, languageName: 'JavaScript', languageCode: 'javascript',
        categoryId: 1, categoryName: 'Functions', tags: ['L2'],
        createdAt: '2024-01-15T12:00:00Z', updatedAt: '2024-01-15T12:00:00Z', createdBy: 'admin',
    })
})
```

## Mocking RichTextEditor

```ts
vi.mock('@/components/editor/RichTextEditor', () => ({
    default: ({content, onChange}: {content: string; onChange: (v: string) => void}) => (
        <textarea data-testid="rich-text-editor" value={content}
            onChange={(e) => onChange(e.target.value)}/>
    ),
}))
```

## Mocking useBlocker (required when rendering QuestionForm)

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
import {act} from '@testing-library/react'
import {useFilterStore} from '@/store/filterStore'

afterEach(() => {
    act(() => {
        useFilterStore.setState({selectedLanguageId: null, selectedCategoryId: null})
    })
})
// Apply the same pattern for useUIStore and useThemeStore when a test modifies them.
```

## Asserting mutation submission

```tsx
it('should call questionsApi.create after valid form submission', async () => {
    const user = userEvent.setup()
    vi.mocked(questionsApi.create).mockResolvedValue({id: 42, ...mockQuestion})
    renderWithProviders(<CreateQuestionPage/>)
    await user.type(screen.getByPlaceholderText(/interview question/i), 'What is a closure?')
    await user.click(screen.getByRole('button', {name: /create question/i}))
    await waitFor(() => expect(vi.mocked(questionsApi.create)).toHaveBeenCalledOnce())
})
```

## Testing error state

```tsx
it('should render PageError when the query rejects', async () => {
    vi.mocked(questionsApi.getById).mockRejectedValue(new Error('Not found'))
    renderWithRoute(<QuestionDetailPage/>, {path: '/questions/:id', initialEntry: '/questions/99'})
    await waitFor(() => expect(screen.getByText(/question not found/i)).toBeInTheDocument())
})
```

## Dialogs sharing button text with the page

```tsx
// Open the dialog
await user.click(screen.getByRole('button', {name: /delete/i}))
await waitFor(() => expect(screen.getByText(/are you sure/i)).toBeInTheDocument())
// Index 1 is inside the dialog
const deleteButtons = screen.getAllByRole('button', {name: /delete/i})
await user.click(deleteButtons[1])
await waitFor(() => expect(questionsApi.delete).toHaveBeenCalledWith(42))
```

## Custom Select component

```tsx
await user.click(screen.getByRole('button', {name: /select language/i}))
await waitFor(() => expect(screen.getByRole('listbox')).toBeInTheDocument())
await user.click(screen.getByRole('button', {name: 'JavaScript'}))
await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument())
```

## Custom hook in isolation

```tsx
it('should debounce the search query', async () => {
    vi.useFakeTimers({shouldAdvanceTime: true})
    vi.mocked(questionsApi.search).mockResolvedValue({
        content: [], page: 0, size: 20, totalElements: 0, totalPages: 0, last: true,
    })
    const client = new QueryClient({defaultOptions: {queries: {retry: false, gcTime: 0}}})
    const wrapper = ({children}: {children: React.ReactNode}) => (
        <QueryClientProvider client={client}>{children}</QueryClientProvider>
    )
    const {result} = renderHook(() => useSearch('react', null, null), {wrapper})
    act(() => { vi.advanceTimersByTime(400) })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(questionsApi.search).toHaveBeenCalledWith(expect.objectContaining({q: 'react'}))
    vi.useRealTimers()
})
```

## Debounce timing

```ts
beforeEach(() => { vi.useFakeTimers() })
afterEach(() => { vi.useRealTimers() })

it('should not fire before the delay', () => {
    const {result, rerender} = renderHook(({value}) => useDebounce(value, 400), {initialProps: {value: 'a'}})
    rerender({value: 'b'})
    act(() => { vi.advanceTimersByTime(399) })
    expect(result.current).toBe('a')
    act(() => { vi.advanceTimersByTime(1) })
    expect(result.current).toBe('b')
})
```

## Mocking fetch and localStorage (theme tests)

```ts
vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ok: true, json: async () => mockManifest}))
afterEach(() => { vi.restoreAllMocks(); localStorage.clear() })
```

## Timezone-safe date fixtures

```ts
// ✅ safe — midday UTC is unaffected by ±12h timezone offset
formatDate('2023-12-31T12:00:00Z')

// ⚠️ risky — becomes 2023-12-30 in UTC-1 and earlier
formatDate('2023-12-31T00:00:00Z')
```

## Disambiguation when the same text appears multiple times

```tsx
// ✅ use distinct category name to avoid collision
makeQuestion({categoryName: 'MyCategory', tags: ['L2', 'Basics']})

// ✅ or use getAllByText when duplicates are intentional
expect(screen.getAllByText('OOP').length).toBeGreaterThan(0)
```
