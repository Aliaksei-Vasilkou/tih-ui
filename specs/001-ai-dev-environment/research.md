# Research: AI Development Ready Environment

**Branch**: `001-ai-dev-environment` | **Date**: 2026-06-11

---

## Research Question 1: Prompt entry-point file format for VS Code Copilot

**Decision**: Use thin YAML-front-matter stubs with `agent: <slug>`.

**Rationale**: The existing 14 SpecKit prompt files in `.github/prompts/` all follow this
identical pattern:

```markdown
---
agent: speckit.specify
---
```

The java project's non-SpecKit prompts (`java-developer.prompt.md`, `qa-engineer.prompt.md`,
`question-bot.prompt.md`) follow the same convention. Detailed role instructions live
exclusively in the paired `.agent.md` file. Keeping prompts thin avoids duplicating
context and ensures the agent file is the single source of truth for behaviour.

**Alternatives considered**:
- Duplicate agent instructions into the prompt file — rejected; violates DRY and creates
  divergence risk (FR-005: prompts MUST NOT duplicate `.agent.md` logic).
- Use VS Code `.prompt.md` mode instructions — not applicable; the project uses the
  `agent:` front-matter convention throughout.

---

## Research Question 2: `$ARGUMENTS` pass-through mechanism

**Decision**: Add a `## User Input` section in each agent file that echoes `$ARGUMENTS`
and provides explicit fallback behaviour (ask the user) when the argument is empty.

**Rationale**: The java project's `java-developer.agent.md` demonstrates the pattern:

```markdown
## User Input

​```text
$ARGUMENTS
​```

If `$ARGUMENTS` is non-empty, treat its content as the implementation task.
If `$ARGUMENTS` is empty, ask the user to describe the feature or class to implement.
```

This is already the convention for all 14 SpecKit agents in tih-ui (they all accept
`$ARGUMENTS`). Applying it to the four core agents makes the AI environment consistent
across all entry-points.

**Alternatives considered**:
- Leave argument handling to the agent's implicit behaviour — rejected; without an explicit
  `$ARGUMENTS` block the agent may still prompt interactively even when a task was supplied
  inline, violating FR-002 and SC-002.

---

## Research Question 3: Constitution read placement in agent workflows

**Decision**: Insert the constitution read as a numbered step in the **Mandatory Context
Reads** or equivalent "before you start" section of each agent file, positioned immediately
after the `copilot-instructions.md` read.

**Rationale**: The java `java-developer.agent.md` lists both files in sequence:
1. `.github/copilot-instructions.md` — project conventions
2. `.specify/memory/constitution.md` — governance rules

All four tih-ui core agents already list `copilot-instructions.md` (implicitly or
explicitly). Adding the constitution as step 2 mirrors the java pattern and ensures
agents refuse tasks that violate non-negotiable principles.

**For Code Reviewer specifically**: The agent does not execute tasks that write code, so
it does not need a "read before coding" step. Instead, the constitution is referenced as
the authoritative source for what constitutes a violation in its review checklist.

**Alternatives considered**:
- Reference constitution only in the skill file (tester/SKILL.md, reviewer/SKILL.md) —
  rejected; skill files are demand-loaded and agents could skip them; the constitution
  reference must be unconditional.

---

## Research Question 4: Agent name slugs for prompt `agent:` field

**Decision**: Use the kebab-case filename slug (without `.agent.md`).

| Agent file | Slug |
|---|---|
| `react-developer.agent.md` | `react-developer` |
| `qa-engineer.agent.md` | `qa-engineer` |
| `software-architect.agent.md` | `software-architect` |
| `code-reviewer.agent.md` | `code-reviewer` |

**Rationale**: All 14 SpecKit prompts use the exact filename slug (e.g. `speckit.specify`,
`speckit.plan`). The 14 SpecKit agent files all use `name:` display names with spaces but
the prompts reference them by slug. VS Code Copilot resolves prompts to agents by matching
the `agent:` field to the filename-derived identifier.

---

## Research Question 5: `<!-- SPECKIT START/END -->` markers in copilot-instructions.md

**Decision**: Add the markers at the very top of `.github/copilot-instructions.md`, above
the `applyTo` front matter block's content — injecting a plan reference section.

**Rationale**: The java project's `copilot-instructions.md` uses these markers to let the
SpecKit plan agent inject a pointer to the current plan:

```markdown
<!-- SPECKIT START -->
For additional context about technologies to be used, project structure,
shell commands, and other important information, read the current plan:
specs/001-ai-dev-environment/plan.md
<!-- SPECKIT END -->
```

The tih-ui `.github/copilot-instructions.md` currently has no such markers. Adding them
unlocks automatic plan references so all agents receive plan context during implementation.

**Placement**: Immediately before the `# tih-ui — GitHub Copilot Instructions` heading so
the plan reference is the first thing agents read.

---

## Summary of Decisions

| # | Decision | Key Rationale |
|---|---|---|
| 1 | Thin `agent: <slug>` prompt stubs | Matches all 14 existing SpecKit prompts; DRY |
| 2 | `$ARGUMENTS` section in agent files | Java pattern; FR-002; SC-002 |
| 3 | Constitution read as mandatory step 2 in agents | Java pattern; governance enforcement |
| 4 | Slug = kebab-case filename | Matches SpecKit convention |
| 5 | SPECKIT markers at top of copilot-instructions.md | Unlocks plan-aware agent context |
