---
description: "Task list for AI Development Ready Environment"
---

# Tasks: AI Development Ready Environment

**Input**: Design documents from `specs/001-ai-dev-environment/`

**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅

**Tests**: Not requested — configuration files are not unit-testable; verified by manual invocation.

**Organization**: Tasks are grouped by user story. All tasks touch `.github/` files only — no TypeScript source changes, no build validation required.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no blocking dependency)
- **[Story]**: Which user story this task belongs to

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: One-time prerequisite already completed by the plan phase.

- [x] T001 Add `<!-- SPECKIT START/END -->` markers + plan pointer to `.github/copilot-instructions.md`

> ✅ T001 completed during `/speckit.plan` — `.github/copilot-instructions.md` already updated.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: No additional foundational work required. All four agent files already exist with complete role instructions, handoffs, and skill references. Prompt files are the only missing piece.

**Checkpoint**: Phases 3–5 can all proceed in parallel since each touches a different file.

---

## Phase 3: User Story 1 — Invoke Core Agents from VS Code (Priority: P1) 🎯 MVP

**Goal**: All four core agents discoverable and invokable through the VS Code prompt panel with optional inline task argument support.

**Independent Test**: Open VS Code prompt panel → each of the four agent names appears and is selectable. Invoke `/react-developer implement a theme toggle` → agent begins without asking "what should I do?". Invoke `/software-architect` with no argument → agent asks interactively.

### Implementation for User Story 1

- [x] T002 [P] [US1] Create prompt entry-point `.github/prompts/react-developer.prompt.md` with front matter `agent: react-developer`
- [x] T003 [P] [US1] Create prompt entry-point `.github/prompts/qa-engineer.prompt.md` with front matter `agent: qa-engineer`
- [x] T004 [P] [US1] Create prompt entry-point `.github/prompts/software-architect.prompt.md` with front matter `agent: software-architect`
- [x] T005 [P] [US1] Create prompt entry-point `.github/prompts/code-reviewer.prompt.md` with front matter `agent: code-reviewer`
- [x] T006 [US1] Add `## User Input` / `$ARGUMENTS` block to `.github/agents/react-developer.agent.md` with empty-argument fallback instruction
- [x] T007 [US1] Add `## User Input` / `$ARGUMENTS` block to `.github/agents/qa-engineer.agent.md` with empty-argument fallback instruction
- [x] T008 [US1] Add `## User Input` / `$ARGUMENTS` block to `.github/agents/software-architect.agent.md` with empty-argument fallback instruction

**Checkpoint**: At this point all four agents are invokable from VS Code and accept inline task descriptions — User Story 1 fully delivered.

---

## Phase 4: User Story 2 — Agents Enforce Project Constitution (Priority: P2)

**Goal**: Every core agent reads `.specify/memory/constitution.md` before taking action and refuses or flags tasks that violate non-negotiable principles.

**Independent Test**: Invoke any core agent. It reads the constitution before producing output. If prompted with a task that violates a principle (e.g., "use `any` for this prop"), the agent declines and cites the specific principle.

### Implementation for User Story 2

- [x] T009 [US2] Add `.specify/memory/constitution.md` as mandatory read step (after `copilot-instructions.md`) in the implementation workflow of `.github/agents/react-developer.agent.md`
- [x] T010 [US2] Add `.specify/memory/constitution.md` as mandatory read step in the testing process of `.github/agents/qa-engineer.agent.md`, anchoring coverage decisions to Principle II
- [x] T011 [US2] Add `.specify/memory/constitution.md` as mandatory read step in the planning process of `.github/agents/software-architect.agent.md`, anchoring recommendations to Principles I–V
- [x] T012 [US2] Add constitution as explicit authority in the review process of `.github/agents/code-reviewer.agent.md` — reviewers MUST cite the specific principle (I–V) for each violation they flag

**Checkpoint**: All agents now enforce governance before producing output — User Story 2 fully delivered.

---

## Phase 5: User Story 3 — Onboarding via Agent Handoff Chain (Priority: P3)

**Goal**: A new team member can follow the Software Architect → React Developer → QA Engineer → Code Reviewer chain using handoff buttons, with each agent receiving context from the previous step.

**Independent Test**: Invoke Software Architect with a feature description → produces a plan → "Start Implementation" handoff opens React Developer with the plan in context → "Write Tests" opens QA Engineer → "Review Tests" / "Review Changes" opens Code Reviewer.

**Note**: The handoff declarations (`handoffs[]` in each agent's front matter) are already correctly defined. No agent-file changes are needed for handoffs. This story is satisfied by completing Phases 3 and 4, which make every node of the chain fully functional.

### Implementation for User Story 3

- [x] T013 [US3] Verify handoff chain end-to-end: confirm all four `handoffs[]` arrays in the agent front matter are consistent with the chain described in `quickstart.md` (read-only check — no edits if already correct)

**Checkpoint**: Full agent handoff chain is operational — User Story 3 fully delivered.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [x] T014 [P] Review all four new `.prompt.md` files confirm they are thin stubs with no duplicated agent logic (SC-005 compliance check)
- [x] T015 [P] Verify `.github/copilot-instructions.md` SPECKIT markers point to the correct plan path `specs/001-ai-dev-environment/plan.md`

---

## Dependencies

```
T002, T003, T004, T005  ←  independent (parallel, US1)
T006, T007, T008        ←  independent (parallel, US1, after T002–T005 exist)
T009, T010, T011, T012  ←  depend on T006–T008 being done first (US2 requires $ARGUMENTS blocks in place)
T013                    ←  depends on T009–T012 (US3 verify chain after US2 complete)
T014, T015              ←  can run after T002–T005
```

Story completion order: **US1 → US2 → US3**

---

## Parallel Execution Examples

**Sprint 1 — US1 prompts (all parallel)**:
- T002, T003, T004, T005 simultaneously (four independent new files)
- T006, T007, T008 simultaneously (three independent agent edits)

**Sprint 2 — US2 constitution wiring (parallel within story)**:
- T009, T010, T011, T012 simultaneously (four independent agent edits)

**Sprint 3 — US3 + Polish (parallel)**:
- T013, T014, T015 simultaneously

---

## Implementation Strategy

**MVP = Phase 3 (US1)** — 7 tasks (T002–T008). Delivers all four agents discoverable and invokable from VS Code with inline argument support. Can be done and demonstrated without completing US2 or US3.

**Full delivery = Phases 3 + 4 + 5 + 6** — 14 tasks total (T002–T015, with T001 already done).
