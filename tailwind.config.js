/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Semantic surface colors
        background: 'var(--color-background)',
        surface: 'var(--color-surface)',
        'surface-alt': 'var(--color-surface-alt)',

        // Text colors
        foreground: 'var(--color-foreground)',
        'foreground-secondary': 'var(--color-foreground-secondary)',
        muted: 'var(--color-muted)',
        'muted-light': 'var(--color-muted-light)',
        placeholder: 'var(--color-placeholder)',

        // Primary palette
        primary: {
          50: 'var(--color-primary-50)',
          100: 'var(--color-primary-100)',
          400: 'var(--color-primary-400)',
          500: 'var(--color-primary-500)',
          600: 'var(--color-primary-600)',
          700: 'var(--color-primary-700)',
          900: 'var(--color-primary-900)',
        },

        // Borders
        border: 'var(--color-border)',
        'border-strong': 'var(--color-border-strong)',
        'border-focus': 'var(--color-border-focus)',

        // Status colors
        error: 'var(--color-error)',
        'error-light': 'var(--color-error-light)',
        'error-bg': 'var(--color-error-bg)',
        success: 'var(--color-success)',
        'success-light': 'var(--color-success-light)',
        'success-bg': 'var(--color-success-bg)',
        warning: 'var(--color-warning)',
        'warning-bg': 'var(--color-warning-bg)',
        'warning-border': 'var(--color-warning-border)',

        // Badge colors
        'badge-lang-java-bg': 'var(--color-badge-lang-java-bg)',
        'badge-lang-java-text': 'var(--color-badge-lang-java-text)',
        'badge-lang-ts-bg': 'var(--color-badge-lang-ts-bg)',
        'badge-lang-ts-text': 'var(--color-badge-lang-ts-text)',
        'badge-default-bg': 'var(--color-badge-default-bg)',
        'badge-default-text': 'var(--color-badge-default-text)',
        'badge-category-bg': 'var(--color-badge-category-bg)',
        'badge-category-text': 'var(--color-badge-category-text)',

        // Code colors
        'code-inline-bg': 'var(--color-code-inline-bg)',
        'code-inline-text': 'var(--color-code-inline-text)',
        'code-block-bg': 'var(--color-code-block-bg)',
        'code-block-text': 'var(--color-code-block-text)',

        // Rich text
        'blockquote-border': 'var(--color-blockquote-border)',
        'blockquote-text': 'var(--color-blockquote-text)',
        divider: 'var(--color-divider)',

        // Tables (rich text editor & markdown viewer)
        'table-header-bg': 'var(--color-table-header-bg)',
        'table-header-text': 'var(--color-table-header-text)',
        'table-border': 'var(--color-table-border)',
        'table-row-odd': 'var(--color-table-row-odd)',
        'table-row-even': 'var(--color-table-row-even)',

        // Toolbar
        'toolbar-active-bg': 'var(--color-toolbar-active-bg)',
        'toolbar-active-text': 'var(--color-toolbar-active-text)',
        'diagram-menu-bg': 'var(--color-diagram-menu-bg)',

        // Unsaved changes indicator
        'unsaved-bg': 'var(--color-unsaved-bg)',
        'unsaved-border': 'var(--color-unsaved-border)',
        'unsaved-text': 'var(--color-unsaved-text)',
      },
      boxShadow: {
        'theme-sm': 'var(--color-shadow)',
        'theme-md': 'var(--color-shadow-md)',
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
          },
        },
      },
    },
  },
  plugins: [],
}
