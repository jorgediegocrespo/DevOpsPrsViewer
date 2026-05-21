# AGENTS Guide

This file is a quick operating guide for AI coding assistants and maintainers.

## Project Summary

- Stack: React 19, TypeScript, Vite, Tailwind CSS 4.
- Purpose: Show Azure DevOps pull requests grouped by project and review state.
- Core behavior: classify PRs into Created, In review, Comments, Ready.

## Quick Commands

- Install: npm install
- Dev server: npm run dev
- Lint: npm run lint
- Build: npm run build
- Preview prod build: npm run preview

## Required Environment

Create a .env file with:

- VITE_ADO_ORG
- VITE_ADO_PAT

See .env.example for format.

## High-Value Files

- src/components/PRDashboard.tsx: main dashboard UI and PR classification rules.
- src/hooks/usePullRequests.ts: PR + thread fetching, mapping to UI model.
- src/hooks/useProjects.ts: project list loading.
- src/api/azureDevOps.ts: Azure DevOps REST wrappers.
- src/types.ts: shared domain models.
- src/config.ts: environment validation and config values.

## Data Flow

1. Load projects with useProjects.
2. User selects projects in dashboard filters.
3. usePullRequests fetches active PRs per selected project.
4. For each PR, fetch threads to derive active comment count.
5. Map into PRViewModel and render by classified column.

## Change Rules

- Keep existing UI behavior stable unless the task explicitly changes product behavior.
- Preserve TypeScript strictness and existing naming patterns.
- Prefer small, localized edits over broad rewrites.
- Keep REST/API logic in src/api and shape mapping in hooks.
- Update docs when behavior or config changes.

## Definition Of Done

- Code compiles and lint passes.
- New or changed behavior is reflected in docs.
- No secrets are committed.
- Error states remain user-readable.
