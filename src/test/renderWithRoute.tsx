import { render, type RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import type { ReactNode } from 'react';

function createTestClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });
}

interface ProvidersWithRouteProps {
  children: ReactNode;
  path: string;
  initialEntry: string;
}

function ProvidersWithRoute({ children, path, initialEntry }: ProvidersWithRouteProps) {
  const client = createTestClient();
  return (
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route path={path} element={children} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

// Render a component with route params support (for pages using useParams)
export function renderWithRoute(
  ui: React.ReactElement,
  options: { path: string; initialEntry: string } & Omit<RenderOptions, 'wrapper'>
) {
  const { path, initialEntry, ...rest } = options;
  return render(ui, {
    wrapper: ({ children }) => (
      <ProvidersWithRoute path={path} initialEntry={initialEntry}>
        {children}
      </ProvidersWithRoute>
    ),
    ...rest,
  });
}
