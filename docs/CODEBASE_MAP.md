# Codebase Map

## App Shell

- src/main.tsx: React bootstrap.
- src/App.tsx: config-error guard and main dashboard mount.
- src/index.css: global Tailwind and app-level styles.

## Configuration

- src/config.ts: reads and validates VITE_ADO_ORG and VITE_ADO_PAT.

## Domain Types

- src/types.ts:
  - AzureProject
  - RawPullRequest
  - Thread
  - PRViewModel
  - reviewer-related contracts

## Azure DevOps Integration

- src/api/azureDevOps.ts:
  - fetchAllProjects
  - fetchProjectPRs
  - fetchPRThreads

## Data Hooks

- src/hooks/useProjects.ts: loads and exposes available projects.
- src/hooks/usePullRequests.ts: loads PRs + threads and maps to PRViewModel.

## UI

- src/components/PRDashboard.tsx:
  - filters
  - localStorage persistence
  - summary chips
  - per-project kanban board
  - PR card rendering

## Key Product Rules

- Comments: PR has active comments.
- Ready: approval count >= 2 and no active comments.
- Created: reviewerCount is 0.
- In review: all other PRs.

## Extension Points

- Add a new column: update ColumnKey, classifyPR, summary counters, UI config.
- Add new API data: extend types first, then api calls, then mapping in hooks.
- Add new filter: keep persistence pattern used by project and author filters.
