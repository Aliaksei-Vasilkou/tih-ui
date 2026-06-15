import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
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
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
  build: {
    // Raise warning threshold: react-syntax-highlighter and mermaid are intrinsically large
    // third-party libraries (~600 KB each) that cannot be split further without changing libs.
    chunkSizeWarningLimit: 650,
    rollupOptions: {
      output: {
        /**
         * Manual vendor chunks — each group is cached independently by the browser.
         * A change in app code only invalidates the app chunk, not the vendor chunks.
         *
         * Groups:
         *  react-core   — React runtime + router (rarely changes)
         *  editor       — TipTap + ProseMirror (heaviest dependency, ~350 KB minified)
         *  query        — TanStack Query + devtools
         *  utils        — small utility libraries
         */
        manualChunks: {
          'react-core': ['react', 'react-dom', 'react-router-dom'],
          editor: [
            '@tiptap/react',
            '@tiptap/starter-kit',
            '@tiptap/extension-color',
            '@tiptap/extension-highlight',
            '@tiptap/extension-text-style',
            '@tiptap/extension-underline',
            '@tiptap/extension-table',
            '@tiptap/extension-table-row',
            '@tiptap/extension-table-cell',
            '@tiptap/extension-table-header',
            '@tiptap/extension-code-block-lowlight',
            'lowlight',
            'tiptap-markdown',
          ],
          mermaid: ['mermaid'],
          'syntax-highlighter': ['react-syntax-highlighter'],
          markdown: ['react-markdown', 'remark-gfm', 'rehype-raw'],
          query: ['@tanstack/react-query', '@tanstack/react-query-devtools'],
          utils: ['axios', 'clsx', 'zustand', 'lucide-react', 'react-dropzone'],
        },
      },
    },
  },
});
