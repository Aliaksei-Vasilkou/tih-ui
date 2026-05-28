# Tester — One-Time Setup

## Install dependencies

```bash
npm install -D vitest @vitest/coverage-v8 \
  @testing-library/react @testing-library/user-event @testing-library/jest-dom \
  jsdom
```

## Update `vite.config.ts`

> ⚠️ Import `defineConfig` from `vitest/config`, **not** from `vite`. The `test` block is only typed in `vitest/config`.

```ts
import {defineConfig} from 'vitest/config'
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

## Create `src/test/setup.ts`

```ts
import '@testing-library/jest-dom'
```

## Create `src/test/renderWithProviders.tsx`

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
    options?: Omit<RenderOptions, 'wrapper'> & {initialEntries?: string[]},
) {
    const {initialEntries, ...rest} = options ?? {}
    return render(ui, {
        wrapper: ({children}) => <Providers initialEntries={initialEntries}>{children}</Providers>,
        ...rest,
    })
}
```

## Create `src/test/renderWithRoute.tsx`

For **page-level components** that use `useParams` — `MemoryRouter` alone does not populate route params:

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

export function renderWithRoute(
    ui: React.ReactElement,
    options: {path: string; initialEntry: string} & Omit<RenderOptions, 'wrapper'>,
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

## Add scripts to `package.json`

```json
"test": "vitest",
"test:ui": "vitest --ui",
"test:coverage": "vitest run --coverage"
```

## Add `coverage/` to `.gitignore`

```
# Test coverage
coverage/
```

## Add vitest globals type to `tsconfig.json`

```json
{
  "compilerOptions": {
    "types": ["vitest/globals"]
  }
}
```
