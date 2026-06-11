# Implementation Plan: AI Development Ready Environment

**Branch**: `001-ai-dev-environment` | **Date**: 2026-06-11 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/001-ai-dev-environment/spec.md`

## Summary

Add four missing prompt entry-points so core agents are discoverable and invokable from the
VS Code prompt panel, and wire the project constitution into each agent's mandatory context
reads so every agent enforces the project's non-negotiable governance principles before
taking action. No TypeScript source files are created or modified.

## Technical Context

**Language/Version**: Markdown + YAML (VS Code Copilot agent convention)

**Primary Dependencies**: VS Code GitHub Copilot extension (already installed)

**Storage**: N/A — configuration files on disk

**Testing**: N/A — agent configuration files are not unit-testable; verified by invocation

**Target Platform**: VS Code IDE with GitHub Copilot extension

**Project Type**: AI agent configuration (`.agent.md` + `.prompt.md` files)

**Performance Goals**: N/A

**Constraints**: Prompt stubs MUST remain thin (no duplicated logic from `.agent.md`)

**Scale/Scope**: 4 new files, 5 modified files

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Verify all five principles before implementation begins and again before merge:

| # | Principle | Status | Notes |
|---|---|---|---|
| I | Code Quality — TypeScript Strictness | ✅ N/A | No TypeScript source files modified |
| II | Testing Standards | ✅ N/A | No components, hooks, or pages created |
| III | UX Consistency | ✅ N/A | No UI components created |
| IV | Performance | ✅ N/A | No bundle changes |
| V | Simplicity / YAGNI | ✅ Pass | 4 new thin stub files; targeted wiring; no abstractions beyond scope |
| VI | Code Style | ✅ N/A | No TypeScript source files modified |

**Quality Gate checklist (must all pass before merge)**:
- [x] `npm run build` — not applicable (no source changes)
- [x] `npm run lint` — not applicable (no source changes)
- [x] `npm test` — not applicable (no source changes)
- [x] Manual: Principle V verified — no out-of-scope changes

All gates pass. No complexity justification required.

## Project Structure

### Documentation (this feature)

```text
specs/001-ai-dev-environment/
├── plan.md              ← this file
├── research.md          ← Phase 0 output
├── data-model.md        ← Phase 1 output
├── quickstart.md        ← Phase 1 output
└── tasks.md             ← Phase 2 output (/speckit.tasks — not yet created)
```

### Changed files

```text
.github/
├── agents/
│   ├── react-developer.agent.md     MODIFY — add $ARGUMENTS + constitution read
│   ├── qa-engineer.agent.md         MODIFY — add $ARGUMENTS + constitution read
│   ├── software-architect.agent.md  MODIFY — add $ARGUMENTS + constitution read
│   └── code-reviewer.agent.md       MODIFY — add constitution reference
├── prompts/
│   ├── react-developer.prompt.md    CREATE — thin stub: agent: react-developer
│   ├── qa-engineer.prompt.md        CREATE — thin stub: agent: qa-engineer
│   ├── software-architect.prompt.md CREATE — thin stub: agent: software-architect
│   └── code-reviewer.prompt.md      CREATE — thin stub: agent: code-reviewer
└── copilot-instructions.md          MODIFY — add SPECKIT START/END markers + plan pointer
```

## New Files

- `.github/prompts/react-developer.prompt.md` — VS Code entry-point binding to the React Developer agent
- `.github/prompts/qa-engineer.prompt.md` — VS Code entry-point binding to the QA Engineer agent
- `.github/prompts/software-architect.prompt.md` — VS Code entry-point binding to the Software Architect agent
- `.github/prompts/code-reviewer.prompt.md` — VS Code entry-point binding to the Code Reviewer agent

## Modified Files

- `.github/agents/react-developer.agent.md` — Insert `## User Input / $ARGUMENTS` block at top; add `.specify/memory/constitution.md` as mandatory read step 2
- `.github/agents/qa-engineer.agent.md` — Insert `## User Input / $ARGUMENTS` block at top; add `.specify/memory/constitution.md` as mandatory read step 2
- `.github/agents/software-architect.agent.md` — Insert `## User Input / $ARGUMENTS` block at top; add `.specify/memory/constitution.md` as mandatory read step 2
- `.github/agents/code-reviewer.agent.md` — Add constitution as the explicit authority reference in the review process section
- `.github/copilot-instructions.md` — Add `<!-- SPECKIT START -->` / `<!-- SPECKIT END -->` block at the top pointing to `specs/001-ai-dev-environment/plan.md`

## Implementation Steps

1. **Create `.github/prompts/react-developer.prompt.md`**
   Content: YAML front matter `agent: react-developer`, body empty.

2. **Create `.github/prompts/qa-engineer.prompt.md`**
   Content: YAML front matter `agent: qa-engineer`, body empty.

3. **Create `.github/prompts/software-architect.prompt.md`**
   Content: YAML front matter `agent: software-architect`, body empty.

4. **Create `.github/prompts/code-reviewer.prompt.md`**
   Content: YAML front matter `agent: code-reviewer`, body empty.

5. **Edit `.github/agents/react-developer.agent.md`**
   - After the front-matter block, insert a `## User Input` section with the `$ARGUMENTS` triple-backtick block and fallback instruction.
   - In the agent's workflow/process section, add `.specify/memory/constitution.md` as a mandatory read (alongside `copilot-instructions.md`) before any implementation begins.

6. **Edit `.github/agents/qa-engineer.agent.md`**
   - After the front-matter block, insert a `## User Input` section with the `$ARGUMENTS` block and fallback instruction.
   - In the "Testing process" section (Step 1 / before writing any tests), add a mandatory constitution read note: verify testing standard from Principle II.

7. **Edit `.github/agents/software-architect.agent.md`**
   - After the front-matter block, insert a `## User Input` section with the `$ARGUMENTS` block and fallback instruction.
   - In the "Planning process" section (Step 1 / before exploring), add `.specify/memory/constitution.md` as a mandatory read — noting that any plan recommendation must not violate constitution principles.

8. **Edit `.github/agents/code-reviewer.agent.md`**
   - In the "Review process" section, add a note that the constitution at `.specify/memory/constitution.md` is the authority for all convention violations — reviewers MUST flag any code that violates Principles I–V, citing the specific principle.

9. **Edit `.github/copilot-instructions.md`**
   - Insert `<!-- SPECKIT START -->` / `<!-- SPECKIT END -->` block at the very top (before the `---` front matter or the `# tih-ui` heading), containing the plan reference:
     ```
     For additional context about technologies to be used, project structure,
     shell commands, and other important information, read the current plan:
     specs/001-ai-dev-environment/plan.md
     ```

## Testing Checklist

No Vitest tests are needed (no TypeScript source changes). Manual verification:

- [ ] `/react-developer` appears in the VS Code prompt panel
- [ ] `/qa-engineer` appears in the VS Code prompt panel
- [ ] `/software-architect` appears in the VS Code prompt panel
- [ ] `/code-reviewer` appears in the VS Code prompt panel
- [ ] Invoking `/react-developer add a theme toggle button` starts implementation without asking "what should I do?"
- [ ] Invoking `/software-architect` without arguments prompts interactively
- [ ] React Developer agent mentions reading `constitution.md` before writing code
- [ ] QA Engineer agent validates against Principle II (testing standards) when deciding coverage
- [ ] Code Reviewer agent cites constitution principle when flagging a violation

## Complexity Tracking

No constitution violations. No complexity justification required.
