# Prompt Templates

Use these templates to request changes from an AI assistant consistently.

## 1) Feature Request

Goal:

- Add [feature name] to [screen/component].

Requirements:

- Behavior: [expected behavior]
- UI: [states, labels, interactions]
- Data: [API fields, mapping changes]
- Constraints: [performance, compatibility, no regressions]

Acceptance Criteria:

- [criterion 1]
- [criterion 2]
- [criterion 3]

Validation:

- Run lint/build and list results.
- Mention all changed files and why each changed.

## 2) Bug Fix

Issue:

- Current behavior: [what happens]
- Expected behavior: [what should happen]
- Reproduction steps: [steps]

Scope:

- Fix only [module/file area].
- Do not change unrelated UI/logic.

Definition Of Done:

- Root cause explained.
- Minimal fix implemented.
- No regression in [list affected behavior].

## 3) Refactor

Objective:

- Improve [readability/performance/structure] in [target files].

Constraints:

- Keep behavior exactly the same.
- Keep external interfaces unchanged unless explicitly approved.

Deliverables:

- Refactored code.
- Short explanation of design choices.
- Lint/build results.

## 4) Review Mode

Task:

- Review this diff for bugs, regressions, and missing tests.

Output format:

- Findings ordered by severity.
- For each finding: file path, impact, and suggested fix.
- Then list open questions/assumptions.
