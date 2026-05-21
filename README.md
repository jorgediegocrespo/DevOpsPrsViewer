# Pull Request Viewer

Web application to monitor Azure DevOps pull requests across multiple projects using a kanban-style dashboard.

## Features

- Multi-project kanban board grouped by project
- Collapsible project panels
- Four PR columns:
  - Created
  - In review
  - Comments
  - Ready
- Column routing rules:
  - Comments: PR has active comments
  - Ready: PR has 2 or more approvals and no active comments
  - Created: PR has no required reviewers
  - In review: everything else
- Top summary bar under filters with total counts per column
- Project filter with:
  - multi-select
  - search-as-you-type
  - select all
  - clear
  - persisted selection in localStorage
- Author filter in ignore mode:
  - selected authors are excluded
  - multi-select, search, select all, clear
  - persisted selection in localStorage
- PR cards include:
  - title and direct link to Azure DevOps PR
  - repository name
  - author
  - number of required reviewers
  - approvals count
  - active comments count (only when greater than 0)
  - first 3 required reviewer avatars in top-right (+N overflow indicator)
- Visual indicators:
  - card background tone by required reviewer count
  - approvals badge colors:
    - gray for 0 approvals
    - light blue for 1 approval
    - green for 2 or more approvals
- Sorting inside each column:
  - higher reviewer count first
  - newer PR id first as tie-breaker
- Refresh behavior:
  - manual refresh button
  - auto-refresh every 30 seconds when projects are selected
  - refresh on browser window focus
- Favicon customized with a review-themed SVG icon (free/original)
- Config validation with clear startup error message when required environment variables are missing

## Tech Stack

- React 19 + TypeScript
- Vite
- Tailwind CSS 4
- Azure DevOps REST API
- ESLint

## Prerequisites

- Node.js 18+
- npm
- Azure DevOps personal access token (PAT) with at least Code Read permissions

## Setup

1. Install dependencies

```bash
npm install
```

2. Create a .env file in the project root

```env
VITE_ADO_ORG=your-organization-name
VITE_ADO_PAT=your-personal-access-token
```

3. Start the app

```bash
npm run dev
```

Default URL: http://localhost:5173

## Scripts

- npm run dev: start development server
- npm run build: type-check and create production build
- npm run preview: preview production build
- npm run lint: run ESLint

## AI Assistant Toolkit

Use these files to speed up safe code generation and maintenance:

- AGENTS.md: quick operating guide for assistants and maintainers
- .github/copilot-instructions.md: repository-specific Copilot guidance
- docs/CODEBASE_MAP.md: architecture and extension points
- docs/CHANGE_CHECKLIST.md: pre-change and validation checklist
- docs/PROMPT_TEMPLATES.md: reusable prompts for feature, bug, refactor, and review tasks
- .env.example: required environment variable template

## How To Use

1. Select one or more projects in the Projects filter.
2. Optionally select authors to ignore in Ignore PR Authors.
3. Review the summary chips below the filters.
4. Expand/collapse each project panel as needed.
5. Open a PR by clicking its card.

## Data Notes

- The app loads active pull requests from selected projects.
- Required reviewers are used for reviewer-related card counts.
- Approval count uses all reviewers (required + optional) with vote >= 5.
- Active comments are calculated from active PR threads.

## Troubleshooting

### Missing environment variables

If startup shows configuration error, verify .env has both values:

```env
VITE_ADO_ORG=your-organization-name
VITE_ADO_PAT=your-personal-access-token
```

Then restart the dev server.

### No PRs shown

- Ensure at least one project is selected
- Check that Ignore PR Authors is not excluding expected authors
- Use Refresh button to force reload
- Confirm PAT permissions and organization name

## Project Structure

```text
src/
  api/            Azure DevOps API access
  components/     UI components (dashboard and cards)
  hooks/          Data-fetching hooks
  App.tsx         App entry logic + config error screen
  config.ts       Environment variable loading
  types.ts        Shared TypeScript models
```
