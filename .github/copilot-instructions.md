# Copilot Instructions For This Repository

## Intent

Build and maintain a PR review dashboard for Azure DevOps using React + TypeScript.

## Technical Constraints

- Keep code TypeScript-first and strongly typed.
- Keep API calls in src/api.
- Keep data-fetch and mapping logic in src/hooks.
- Keep rendering and interaction logic in src/components.
- Reuse shared contracts from src/types.
- Use existing Tailwind utility style and class naming tone.

## Behavior Constraints

- PR column classification must remain consistent with current business rules.
- Ignore-author filter is exclusion-based and persisted.
- Selected projects and ignored authors persist in localStorage.
- Auto-refresh runs each 30 seconds when projects are selected.

## Change Workflow

1. Read related component, hook, and types before coding.
2. Implement minimal change with clear naming.
3. Run lint and build checks.
4. Update docs if product behavior changed.

## Safety

- Never commit PAT tokens or live credentials.
- Keep configuration errors actionable for users.
