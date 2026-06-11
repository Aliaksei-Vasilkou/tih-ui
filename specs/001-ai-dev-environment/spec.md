# Feature Specification: AI Development Ready Environment

**Feature Branch**: `001-ai-dev-environment`

**Created**: 2026-06-11

**Status**: Draft

**Input**: User description: "Analyze the set of agents, prompts and instructions used for the java project in `github-java` folder. Build the same agents for this repository. I want to have an AI development ready environment."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Invoke Core Agent Directly from VS Code (Priority: P1)

A developer opens VS Code and wants to invoke the React Developer, QA Engineer, Software Architect, or Code Reviewer agent directly by selecting it from the prompts panel or slash-command dropdown — optionally passing a task description upfront without being prompted interactively.

**Why this priority**: Without prompt entry-point files the agents exist only as background configuration. Developers cannot discover or invoke them through VS Code's UI, making the AI environment incomplete and unusable as a self-service workflow.

**Independent Test**: Open VS Code command palette, type the agent name — the corresponding prompt appears and is selectable. Provide a task description inline; the agent receives it without asking the user to re-type it.

**Acceptance Scenarios**:

1. **Given** the developer wants code implemented, **When** they invoke the React Developer prompt and type their task, **Then** the agent receives the task and begins implementation without an extra "what do you want me to do?" prompt.
2. **Given** the developer wants tests written, **When** they invoke the QA Engineer prompt, **Then** the agent is available from the VS Code prompt picker.
3. **Given** the developer wants a feature researched and planned, **When** they invoke the Software Architect prompt, **Then** the agent begins read-only exploration immediately.
4. **Given** the developer wants a code review, **When** they invoke the Code Reviewer prompt, **Then** the agent inspects changed files and produces a structured review.

---

### User Story 2 - Agents Enforce Project Constitution (Priority: P2)

A developer invokes any core agent (React Developer, QA Engineer, Software Architect, Code Reviewer). The agent automatically reads `.specify/memory/constitution.md` before taking action, ensuring all output respects the project's non-negotiable principles (TypeScript strictness, testing standards, performance requirements, YAGNI).

**Why this priority**: The constitution captures governance decisions that override generic best practices. Without agents reading it, they may produce code or plans that violate rules like "no `any`", "no raw Tailwind palette classes", or "chunk size threshold must not be raised", requiring manual review to catch violations that the agent should have prevented.

**Independent Test**: Invoke an agent with a task that would normally tempt a generic response (e.g., "use `any` for this prop type"). The agent declines and cites the constitution.

**Acceptance Scenarios**:

1. **Given** the React Developer agent starts an implementation task, **When** it generates code, **Then** it references TypeScript strictness and ESLint rules from the constitution rather than defaulting to generic advice.
2. **Given** the QA Engineer agent writes tests, **When** it decides on test coverage, **Then** it applies the testing standard from the constitution (every new component must have a test file).
3. **Given** the Software Architect agent produces a plan, **When** it recommends state ownership, **Then** it validates against constitution Principle V (YAGNI) and avoids over-engineering.

---

### User Story 3 - New Developer Onboards via Agent Handoff Chain (Priority: P3)

A new team member joins and needs to implement a feature. They follow the documented agent handoff chain: Software Architect → React Developer → QA Engineer → Code Reviewer, with each agent producing output and offering a handoff button to the next agent.

**Why this priority**: A complete handoff chain provides a repeatable, quality-assured development workflow. Each handoff preserves context so the next agent starts with the previous agent's output rather than requiring the developer to re-describe the task.

**Independent Test**: Invoke Software Architect with a feature description. It produces a plan. Use the "Start Implementation" handoff to React Developer, which receives the plan. React Developer hands off to QA Engineer via "Write Tests", which receives the implemented code. QA Engineer hands off to Code Reviewer via "Review Tests".

**Acceptance Scenarios**:

1. **Given** the Software Architect produces an implementation plan, **When** the developer clicks "Start Implementation", **Then** the React Developer agent receives the plan and can begin coding without re-prompting.
2. **Given** the React Developer completes an implementation, **When** the developer clicks "Write Tests", **Then** the QA Engineer agent can see the relevant files and write tests accordingly.
3. **Given** any agent completes its task, **When** the developer clicks the review handoff, **Then** the Code Reviewer receives the changed files and produces a categorised review with file paths and line numbers.

---

### Edge Cases

- What happens when a developer invokes an agent with no task description (empty arguments)? The agent should prompt the user to describe the task interactively.
- What happens when the constitution is missing or cannot be read? The agent should log a warning and proceed using `copilot-instructions.md` as the fallback authority.
- What happens if an agent is invoked mid-task without a prior architect plan? The React Developer agent should surface a warning and ask for a plan or confirmation before proceeding.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The project MUST have prompt entry-point files for all four core agents: React Developer, QA Engineer, Software Architect, and Code Reviewer.
- **FR-002**: Each prompt entry-point MUST accept optional user-supplied task arguments (`$ARGUMENTS`) and pass them to the agent so the agent can begin work without an interactive re-prompt.
- **FR-003**: The React Developer, QA Engineer, and Software Architect agents MUST include a mandatory context step that reads `.specify/memory/constitution.md` before performing any work.
- **FR-004**: The Code Reviewer agent MUST include a reference to the constitution as the authority for convention violations (particularly TypeScript strictness and testing standards).
- **FR-005**: The Software Architect agent MUST be strictly read-only: it MUST NOT create or modify any source files, only read and produce a written plan.
- **FR-006**: The QA Engineer agent MUST produce test files that comply with the testing conventions in `.github/instructions/testing.instructions.md`.
- **FR-007**: All core agent prompt files MUST follow the same format conventions as the existing SpecKit prompt files in `.github/prompts/`.
- **FR-008**: Agent handoff labels MUST be descriptive enough that a new developer can follow the chain without reading documentation (e.g., "Start Implementation", "Write Tests", "Review Changes").

### Key Entities

- **Agent**: A named AI persona with a defined role, tool access list, handoff targets, and behavioural boundaries — stored as `<name>.agent.md` in `.github/agents/`.
- **Prompt entry-point**: A minimal file that binds a VS Code slash-command or prompt-panel entry to an agent, optionally passing `$ARGUMENTS` — stored as `<name>.prompt.md` in `.github/prompts/`.
- **Constitution**: A versioned governance document at `.specify/memory/constitution.md` that records non-negotiable principles binding all agents and developers.
- **Skill**: A structured domain knowledge document loaded on demand by agents, stored in `.github/skills/<name>/SKILL.md`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All four core agents (React Developer, QA Engineer, Software Architect, Code Reviewer) are discoverable and invokable through the VS Code prompt panel without requiring any manual file path navigation.
- **SC-002**: A developer can provide a task description at agent invocation time and the agent begins work immediately — the agent does not ask "what do you want me to do?" when a task description was supplied.
- **SC-003**: When any core agent produces output, it respects at least the non-negotiable constitution principles (TypeScript strictness, testing standards) without needing a human reviewer to catch basic violations.
- **SC-004**: A new team member can complete a full feature cycle (plan → implement → test → review) using only the agent handoff buttons, without consulting any additional documentation.
- **SC-005**: Zero new agent prompt files duplicate logic already present in the corresponding `.agent.md` file — prompts remain thin entry-point stubs.

## Assumptions

- The `.github/agents/*.agent.md` files for all four core agents already contain complete role instructions; this feature adds the missing prompt entry-points and constitution wiring, not a full rewrite of agent logic.
- The constitution at `.specify/memory/constitution.md` is considered stable and authoritative for this feature; no changes to the constitution itself are in scope.
- VS Code with the GitHub Copilot extension is the target IDE; agent prompt files follow VS Code Copilot prompt conventions (YAML front matter with `agent:` field).
- The `$ARGUMENTS` pattern used in the Java project's agent files is the agreed-upon mechanism for passing inline task descriptions and applies equally to the React/TypeScript project.
- Prompt entry-point files will be thin stubs (matching the java project pattern) — detailed instructions live exclusively in the `.agent.md` files to avoid duplication.
