# Quickstart: AI Development Ready Environment

**Branch**: `001-ai-dev-environment` | **Date**: 2026-06-11

This guide explains how to use the tih-ui AI agent workflow once the feature is implemented.

---

## Agent Workflow

```
Software Architect  →  React Developer  →  QA Engineer  →  Code Reviewer
```

Use this chain for any new feature or significant change. Each agent hands off to the
next via a button in VS Code.

---

## Invoking an Agent

### With a task description (one-shot)

Open the VS Code command palette, type `>` and the agent name, or use the prompts panel.
Provide your task inline:

```
/react-developer Implement a new FilterPanel component that shows the currently selected language and category
```

The agent begins immediately — no interactive re-prompt.

### Without a task description (interactive)

Invoke without arguments:

```
/software-architect
```

The agent asks: "What feature would you like me to research and plan?"

---

## Agent Reference

### Software Architect

**When to use**: Planning a new feature, adding a route, designing state ownership, or
deciding on API shape before writing any code.

**Invoke**: `/software-architect [optional: feature description]`

**Output**: A structured implementation plan with new/modified files, types, query keys,
and implementation steps.

**Read-only**: Never creates or edits source files.

**Handoff**: Click "Start Implementation" → React Developer receives the plan.

---

### React Developer

**When to use**: Implementing a feature after the Software Architect has produced a plan.

**Invoke**: `/react-developer [optional: task or plan reference]`

**Output**: Written source files (components, hooks, API functions, store slices).

**Quality gates** run automatically before handoff:
```bash
npm run build      # must pass — zero TypeScript errors
npm run lint       # must pass — zero ESLint warnings
npm test           # must pass — no regressions
```

**Handoffs**: "Review Changes" → Code Reviewer | "Write Tests" → QA Engineer.

---

### QA Engineer

**When to use**: Writing tests after implementation is complete.

**Invoke**: `/qa-engineer [optional: component or feature to test]`

**Output**: Co-located test files (`ComponentName.test.tsx`) using Vitest + RTL.

**Conventions enforced**:
- Uses `renderWithProviders` / `renderWithRoute` (never bare `render`)
- Mocks at API module level (`vi.mock('@/api/...')`)
- Always mocks `RichTextEditor`
- Resets Zustand stores in `afterEach`

**Handoff**: "Review Tests" → Code Reviewer.

---

### Code Reviewer

**When to use**: Reviewing changed files before merging any branch.

**Invoke**: `/code-reviewer`

**Output**: Categorised findings with file path, line number, issue, and fix suggestion.
Ends with a verdict: ✅ Approved | ⚠️ Approve with minor fixes | ❌ Request changes.

**Categories checked**:
1. TypeScript strictness
2. React hooks rules
3. TanStack Query v5 compliance
4. Tailwind / theming (semantic tokens only)
5. Accessibility (ARIA, focus rings)
6. Component structure
7. State placement
8. API layer correctness
9. Performance
10. Conventional Commits

**Read-only**: Never edits source files.

**Handoff**: "Fix Issues" → React Developer receives the review report.

---

## Non-Negotiable Rules (from Constitution)

All agents enforce these automatically. Violating them causes an agent to refuse or flag:

| Principle | Rule |
|---|---|
| I. TypeScript Strictness | No `any`; `strict: true`; zero ESLint warnings |
| II. Testing Standards | Every new component/hook/page needs a test file |
| III. UX Consistency | Semantic Tailwind tokens only; ARIA on all interactive elements |
| IV. Performance | No chunk > 650 KB; pages lazy-loaded; inputs debounced ≥ 300 ms |
| V. YAGNI | Only implement what the task requires; correct state placement |

---

## SpecKit Workflow (feature development)

For larger features, use the full SpecKit pipeline:

```
/speckit.specify  →  /speckit.clarify  →  /speckit.plan  →  /speckit.tasks  →  /speckit.implement
```

Each command creates structured artifacts in `specs/<feature-number>-<name>/` and
auto-commits via the git hooks defined in `.specify/extensions.yml`.
