# Change Checklist

Use this checklist for feature work, bug fixes, and refactors.

## Before Coding

- Confirm the user requirement and expected behavior.
- Read related files across components, hooks, api, and types.
- Identify whether behavior constraints will be affected.

## During Coding

- Keep edits small and targeted.
- Preserve PR classification logic unless requested.
- Keep data-access code in src/api.
- Keep data shaping in src/hooks.
- Keep UI state and rendering in src/components.
- Avoid introducing any secrets or credentials.

## Validation

- Run npm run lint.
- Run npm run build.
- Manually verify key flows:
  - project selection persistence
  - ignored author persistence
  - refresh button
  - 30-second auto-refresh with selected projects
  - column classification

## Documentation

- Update README when behavior/config changes.
- Update docs/CODEBASE_MAP.md if structure changes.
- Update AGENTS.md if workflow expectations change.
