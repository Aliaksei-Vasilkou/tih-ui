# Theme Configuration

> **See also:** `vite.config.ts` → `build.rollupOptions.output.manualChunks` for bundle splitting strategy.

This folder contains all theme configuration files for the **Tech Interview Helper** application.

---

## File Structure

```
public/themes/
  _manifest.json        ← Registry of all available themes
  default-light.json    ← Built-in Light theme
  default-dark.json     ← Built-in Dark theme
  monokai.json          ← Monokai theme
  [your-theme].json     ← Add your custom themes here
```

---

## How Themes Work

Each theme is a **flat JSON file** containing a map of design token names to CSS values.  
On application launch the active theme file is fetched, and every token is applied as a  
CSS custom property (`--token-name`) on the document root (`<html>`).  
Tailwind CSS classes used throughout the application reference these variables, so the  
entire UI updates automatically when tokens change — **no rebuild required**.

---

## Adding a New Theme

### Step 1 — Create the theme file

Duplicate an existing theme as your starting point:

```bash
cp public/themes/default-light.json public/themes/my-theme.json
```

Edit `my-theme.json` and set:

- `"id"` — unique kebab-case identifier, e.g. `"my-theme"`
- `"name"` — human-readable label shown in the UI, e.g. `"My Theme"`
- `"tokens"` — adjust color values to your liking (see Token Reference below)

### Step 2 — Register in the manifest

Open `public/themes/_manifest.json` and add an entry to the `"themes"` array:

```json
{
  "id": "my-theme",
  "name": "My Theme",
  "file": "my-theme.json"
}
```

To make your theme the default on first load, change `"defaultThemeId"`:

```json
{
  "defaultThemeId": "my-theme",
  "themes": [ ... ]
}
```
}
```

### Step 3 — Done

No code changes, no rebuild needed.  
The theme will appear in the UI theme selector immediately.

---

## Token Reference

All token keys use **kebab-case** and map directly to CSS custom properties  
(e.g. `"color-primary-600"` → `--color-primary-600`).

### Surface & Background

| Token               | Purpose                                       |
|---------------------|-----------------------------------------------|
| `color-background`  | Page background                               |
| `color-surface`     | Card / panel backgrounds                      |
| `color-surface-alt` | Subtle background variant (toolbars, footers) |

### Text

| Token                        | Purpose                     |
|------------------------------|-----------------------------|
| `color-foreground`           | Primary text                |
| `color-foreground-secondary` | Labels, subheadings         |
| `color-muted`                | Secondary / hint text       |
| `color-muted-light`          | Disabled / very subtle text |
| `color-placeholder`          | Input placeholder text      |

### Primary Accent

| Token               | Purpose                           |
|---------------------|-----------------------------------|
| `color-primary-50`  | Lightest tint (hover backgrounds) |
| `color-primary-100` | Light tint                        |
| `color-primary-400` | Mid accent                        |
| `color-primary-500` | Focus rings                       |
| `color-primary-600` | Primary buttons                   |
| `color-primary-700` | Button hover state                |
| `color-primary-900` | Darkest tint                      |

### Borders

| Token                 | Purpose                           |
|-----------------------|-----------------------------------|
| `color-border`        | Default border                    |
| `color-border-strong` | Emphasized border (inputs, cards) |
| `color-border-focus`  | Focus ring border color           |

### Status Colors

| Token                  | Purpose              |
|------------------------|----------------------|
| `color-error`          | Error text / icons   |
| `color-error-light`    | Error border         |
| `color-error-bg`       | Error background     |
| `color-success`        | Success text / icons |
| `color-success-light`  | Success border       |
| `color-success-bg`     | Success background   |
| `color-warning`        | Warning text / icons |
| `color-warning-bg`     | Warning background   |
| `color-warning-border` | Warning border       |

### Language Badges

| Token                        | Purpose                           |
|------------------------------|-----------------------------------|
| `color-badge-lang-java-bg`   | Java badge background             |
| `color-badge-lang-java-text` | Java badge text                   |
| `color-badge-lang-ts-bg`     | TypeScript badge background       |
| `color-badge-lang-ts-text`   | TypeScript badge text             |
| `color-badge-default-bg`     | Default language badge background |
| `color-badge-default-text`   | Default language badge text       |
| `color-badge-category-bg`    | Category badge background         |
| `color-badge-category-text`  | Category badge text               |

> **Adding a new language badge:**  
> Add `color-badge-lang-{code}-bg` and `color-badge-lang-{code}-text` tokens to every theme file,  
> add matching entries to `tailwind.config.js`, update `src/constants/languageColors.ts`.

### Code Blocks (Rich Text Editor)

| Token                     | Purpose                |
|---------------------------|------------------------|
| `color-code-inline-bg`    | Inline code background |
| `color-code-inline-text`  | Inline code text       |
| `color-code-block-bg`     | Code fence background  |
| `color-code-block-text`   | Code fence text        |
| `color-blockquote-border` | Blockquote left border |
| `color-blockquote-text`   | Blockquote text        |
| `color-divider`           | Horizontal rule        |

### Shadows

Shadow tokens accept any valid CSS `box-shadow` value.

| Token             | Purpose                         |
|-------------------|---------------------------------|
| `color-shadow`    | Subtle elevation (cards)        |
| `color-shadow-md` | Medium elevation (hover states) |

---

## Example: Minimal Custom Theme

```json
{
  "id": "ocean",
  "name": "Ocean",
  "tokens": {
    "color-background": "#0a1628",
    "color-surface": "#0d1f3c",
    "color-surface-alt": "#112244",
    "color-foreground": "#e8f4f8",
    "color-foreground-secondary": "#b8d4e8",
    "color-muted": "#6a9ab8",
    "color-muted-light": "#4a7a98",
    "color-placeholder": "#4a7a98",
    "color-primary-50": "#051020",
    "color-primary-100": "#0a2040",
    "color-primary-400": "#4db8e8",
    "color-primary-500": "#2da8d8",
    "color-primary-600": "#1a88b8",
    "color-primary-700": "#4dc8f8",
    "color-primary-900": "#a8e0f8",
    "color-border": "#1a3a5c",
    "color-border-strong": "#2a4a6c",
    "color-border-focus": "#2da8d8",
    "color-error": "#ff6b8a",
    "color-error-light": "#5a1020",
    "color-error-bg": "#3a0810",
    "color-success": "#4de89a",
    "color-success-light": "#0a4028",
    "color-success-bg": "#052818",
    "color-warning": "#f8d060",
    "color-warning-bg": "#302800",
    "color-warning-border": "#604800",
    "color-badge-lang-java-bg": "#3a1800",
    "color-badge-lang-java-text": "#f8a040",
    "color-badge-lang-ts-bg": "#0a1840",
    "color-badge-lang-ts-text": "#60c8f8",
    "color-badge-default-bg": "#1a2a3c",
    "color-badge-default-text": "#b8c8d8",
    "color-badge-category-bg": "#1a2a3c",
    "color-badge-category-text": "#98b8c8",
    "color-code-inline-bg": "#0a1628",
    "color-code-inline-text": "#ff6b8a",
    "color-code-block-bg": "#060e1a",
    "color-code-block-text": "#e8f4f8",
    "color-blockquote-border": "#2da8d8",
    "color-blockquote-text": "#6a9ab8",
    "color-divider": "#2a4a6c",
    "color-shadow": "0 1px 2px 0 rgba(0,0,0,0.4)",
    "color-shadow-md": "0 4px 6px -1px rgba(0,0,0,0.5)"
  }
}
```
