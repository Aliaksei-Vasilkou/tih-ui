# Data Model: AI Development Ready Environment

**Branch**: `001-ai-dev-environment` | **Date**: 2026-06-11

---

> **Note**: This feature produces VS Code Copilot configuration files (Markdown + YAML).
> There are no database entities, React state shapes, or TypeScript interfaces to define.
> This document describes the **conceptual entities** from the spec and how they map to
> files on disk.

---

## Entities

### Agent

A named AI persona that performs a specific role in the development workflow.

| Attribute | Value / Constraint |
|---|---|
| File path | `.github/agents/<slug>.agent.md` |
| Front-matter fields | `description`, `name`, `tools[]`, `handoffs[]` |
| Role boundary | Defined by Boundaries section (what to always/ask/never do) |
| Constitution awareness | Mandatory read of `.specify/memory/constitution.md` before any task |
| Task input | Accepts `$ARGUMENTS` inline; falls back to interactive prompt when empty |

**Instances in scope:**
- `react-developer` — implements React 18 + TypeScript features
- `qa-engineer` — writes Vitest + RTL tests
- `software-architect` — read-only research & planning
- `code-reviewer` — read-only review & report

---

### Prompt Entry-Point

A minimal file that binds a VS Code prompt-panel entry / slash-command to an agent.

| Attribute | Value / Constraint |
|---|---|
| File path | `.github/prompts/<slug>.prompt.md` |
| Required front-matter | `agent: <slug>` |
| Body | Empty (all logic in the agent file) |
| Naming convention | Slug matches the paired `<slug>.agent.md` filename exactly |

**Instances to create:**
- `react-developer.prompt.md`
- `qa-engineer.prompt.md`
- `software-architect.prompt.md`
- `code-reviewer.prompt.md`

---

### Constitution

A versioned governance document that records non-negotiable principles binding all agents.

| Attribute | Value / Constraint |
|---|---|
| File path | `.specify/memory/constitution.md` (single instance, pre-existing) |
| Version | 1.0.0 (current) |
| Authority | Takes precedence over generic best practices for all agents |
| Read trigger | Mandatory before any agent begins work (Steps 1-2 in agent workflows) |
| Principles | I. TypeScript Strictness, II. Testing Standards, III. UX Consistency, IV. Performance, V. Simplicity |

---

### Skill

A structured domain knowledge document loaded on demand by agents.

| Attribute | Value / Constraint |
|---|---|
| File path | `.github/skills/<name>/SKILL.md` |
| Load trigger | Referenced by agent file with relative link; agent reads it when invoked |
| Scope | Narrows agent output to project-specific patterns |

**Existing skills (not modified by this feature):**
- `architect/SKILL.md`
- `developer/SKILL.md`
- `feature-design/SKILL.md`
- `reviewer/SKILL.md`
- `tester/SKILL.md`

---

## Handoff Chain

```
Software Architect
  → "Start Implementation" → React Developer
      → "Review Changes"   → Code Reviewer
      → "Write Tests"      → QA Engineer
          → "Review Tests" → Code Reviewer
```

Each handoff is declared in the `handoffs[]` array of the originating agent's front matter:
```yaml
handoffs:
  - label: Start Implementation
    agent: React Developer
    prompt: 'Implement the plan outlined above.'
    send: false
```

All four agents already have correct handoff declarations. No changes required to handoffs.

---

## Change Surface Summary

| Entity | Action | Files |
|---|---|---|
| Prompt Entry-Point | **CREATE** 4 new files | `.github/prompts/react-developer.prompt.md`, `qa-engineer.prompt.md`, `software-architect.prompt.md`, `code-reviewer.prompt.md` |
| Agent (React Dev) | **MODIFY** — add `$ARGUMENTS` + constitution read | `.github/agents/react-developer.agent.md` |
| Agent (QA Eng) | **MODIFY** — add `$ARGUMENTS` + constitution read | `.github/agents/qa-engineer.agent.md` |
| Agent (SW Arch) | **MODIFY** — add `$ARGUMENTS` + constitution read | `.github/agents/software-architect.agent.md` |
| Agent (Reviewer) | **MODIFY** — add constitution reference | `.github/agents/code-reviewer.agent.md` |
| Agent Context | **MODIFY** — add SPECKIT markers + plan pointer | `.github/copilot-instructions.md` |
