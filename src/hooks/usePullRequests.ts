import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchProjectPRs, fetchPRThreads } from '../api/azureDevOps';
import { ORG, PAT, ADO_BASE } from '../config';
import type { PRViewModel } from '../types';
import { classifyPR, PR_COLUMN_LABELS, type PRColumnKey } from '../utils/prClassification';

interface UsePullRequestsResult {
  prs: PRViewModel[];
  loading: boolean;
  error: string | null;
  refresh: (options?: { manual?: boolean }) => void;
}

interface PRSnapshot {
  column: PRColumnKey;
  title: string;
  project: string;
  repoName: string;
}

type PRChange =
  | { kind: 'created'; current: PRSnapshot }
  | { kind: 'completed'; previous: PRSnapshot }
  | { kind: 'moved'; previous: PRSnapshot; current: PRSnapshot };

function getPRKey(project: string, repoId: string, prId: number): string {
  return `${project}::${repoId}::${prId}`;
}

function diffPRSnapshots(previous: Map<string, PRSnapshot>, current: Map<string, PRSnapshot>): PRChange[] {
  const changes: PRChange[] = [];

  for (const [key, currentSnapshot] of current.entries()) {
    const previousSnapshot = previous.get(key);
    if (!previousSnapshot) {
      changes.push({ kind: 'created', current: currentSnapshot });
      continue;
    }

    if (previousSnapshot.column !== currentSnapshot.column) {
      changes.push({ kind: 'moved', previous: previousSnapshot, current: currentSnapshot });
    }
  }

  for (const [key, previousSnapshot] of previous.entries()) {
    if (!current.has(key)) {
      changes.push({ kind: 'completed', previous: previousSnapshot });
    }
  }

  return changes;
}

function formatChange(change: PRChange): string {
  switch (change.kind) {
    case 'created':
      return `Created: ${change.current.project} / ${change.current.repoName} · ${change.current.title}`;
    case 'completed':
      return `Completed: ${change.previous.project} / ${change.previous.repoName} · ${change.previous.title}`;
    case 'moved':
      return `Moved: ${change.current.project} / ${change.current.repoName} · ${change.current.title} (${PR_COLUMN_LABELS[change.previous.column]} → ${PR_COLUMN_LABELS[change.current.column]})`;
  }
}

function buildNotificationBody(changes: PRChange[]): string {
  const counts = changes.reduce(
    (acc, change) => {
      acc[change.kind] += 1;
      return acc;
    },
    { created: 0, completed: 0, moved: 0 }
  );

  const summary = [
    counts.created > 0 ? `${counts.created} created` : null,
    counts.completed > 0 ? `${counts.completed} completed` : null,
    counts.moved > 0 ? `${counts.moved} moved` : null,
  ]
    .filter(Boolean)
    .join(', ');

  const lines = [summary, ...changes.slice(0, 3).map(formatChange)].filter(Boolean) as string[];
  if (changes.length > 3) {
    lines.push(`+${changes.length - 3} more changes`);
  }

  return lines.join('\n');
}

async function showBrowserNotification(title: string, body: string) {
  if (typeof window === 'undefined' || typeof Notification === 'undefined') return;
  if (Notification.permission !== 'granted') return;

  try {
    const notification = new Notification(title, {
      body,
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };
    return;
  } catch {
    // Some browsers/environments block Notification constructor but allow service-worker notifications.
  }

  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        await registration.showNotification(title, {
          body,
        });
      }
    } catch {
      // Ignore notification fallback errors to avoid failing the PR fetch cycle.
    }
  }
}

export async function triggerNotification(title: string, body: string) {
  await showBrowserNotification(title, body);
}

function notifyChanges(changes: PRChange[]) {
  if (changes.length === 0) return;
  void showBrowserNotification('Azure DevOps PRs updated', buildNotificationBody(changes));
}

export function usePullRequests(selectedProjects: string[], notificationsEnabled: boolean): UsePullRequestsResult {
  const [prs, setPrs] = useState<PRViewModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshTick, setRefreshTick] = useState(0);
  const previousSnapshotRef = useRef<Map<string, PRSnapshot> | null>(null);
  const hasInitialSnapshotRef = useRef(false);
  const manualRefreshRequestedRef = useRef(false);
  const notificationsEnabledRef = useRef(notificationsEnabled);

  useEffect(() => {
    notificationsEnabledRef.current = notificationsEnabled;
  }, [notificationsEnabled]);

  const fetchAll = useCallback(async (projects: string[], signal: AbortSignal) => {
    if (projects.length === 0) {
      setPrs([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch active PRs for all selected projects in parallel
      const projectPRResults = await Promise.all(
        projects.map((project) => fetchProjectPRs(ORG, project, PAT).then((list) => ({ project, list })))
      );

      if (signal.aborted) return;

      // Flatten and fetch threads for every PR in parallel
      const allPRs = projectPRResults.flatMap(({ project, list }) =>
        list.map((pr) => ({ project, pr }))
      );

      const prResults = await Promise.all(
        allPRs.map(async ({ project, pr }) => {
          const threads = await fetchPRThreads(ORG, project, pr.repository.id, pr.pullRequestId, PAT);
          const activeCommentCount = threads.filter(
            (t) => !t.isDeleted && t.status === 'active'
          ).length;
          const hasActiveComments = activeCommentCount > 0;
          const requiredReviewers = pr.reviewers.filter((r) => r.isRequired);
          const reviewers = requiredReviewers.map((r) => ({
            id: r.id,
            name: r.displayName,
            imageUrl: r.imageUrl,
          }));
          const reviewerCount = requiredReviewers.length;
          const completedReviewCount = requiredReviewers.filter((r) => r.vote !== 0).length;
          // PR approval badge should represent total approvals on the PR,
          // regardless of required/optional reviewer status.
          // Azure DevOps uses 10=approved and 5=approved with suggestions.
          const approvalCount = pr.reviewers.filter((r) => r.vote >= 5).length;
          const url = `${ADO_BASE}/${encodeURIComponent(project)}/_git/${encodeURIComponent(pr.repository.name)}/pullrequest/${pr.pullRequestId}`;

          const sourceBranch = pr.sourceRefName.replace(/^refs\/heads\//, '');
          const targetBranch = pr.targetRefName.replace(/^refs\/heads\//, '');

          const viewModel = {
            id: pr.pullRequestId,
            title: pr.title,
            project,
            repoName: pr.repository.name,
            author: pr.createdBy.displayName,
            creationDate: pr.creationDate,
            sourceBranch,
            targetBranch,
            reviewers,
            reviewerCount,
            completedReviewCount,
            approvalCount,
            hasActiveComments,
            activeCommentCount,
            url,
          } satisfies PRViewModel;

          return {
            key: getPRKey(project, pr.repository.id, pr.pullRequestId),
            snapshot: {
              column: classifyPR(viewModel),
              title: viewModel.title,
              project: viewModel.project,
              repoName: viewModel.repoName,
            },
            viewModel,
          };
        })
      );

      if (signal.aborted) return;

      const currentSnapshot = new Map(prResults.map(({ key, snapshot }) => [key, snapshot] as const));
      const prViewModels = prResults.map(({ viewModel }) => viewModel);

      const hasPreviousSnapshot = previousSnapshotRef.current !== null;
      if (hasPreviousSnapshot && (hasInitialSnapshotRef.current || manualRefreshRequestedRef.current)) {
        const changes = diffPRSnapshots(previousSnapshotRef.current ?? new Map(), currentSnapshot);
        if (notificationsEnabledRef.current) {
          notifyChanges(changes);
        }
      } else {
        hasInitialSnapshotRef.current = true;
      }

      manualRefreshRequestedRef.current = false;

      previousSnapshotRef.current = currentSnapshot;

      // Sort: active comments first, then by project + repo
      prViewModels.sort((a, b) => {
        if (a.hasActiveComments !== b.hasActiveComments) return a.hasActiveComments ? -1 : 1;
        return a.project.localeCompare(b.project) || a.repoName.localeCompare(b.repoName);
      });

      setPrs(prViewModels);
    } catch (err: unknown) {
      if (signal.aborted) return;
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      if (!signal.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    previousSnapshotRef.current = null;
    hasInitialSnapshotRef.current = false;
    manualRefreshRequestedRef.current = false;
  }, [selectedProjects]);

  useEffect(() => {
    const controller = new AbortController();
    const timerId = window.setTimeout(() => {
      void fetchAll(selectedProjects, controller.signal);
    }, 0);

    return () => {
      window.clearTimeout(timerId);
      controller.abort();
    };
  }, [selectedProjects, refreshTick, fetchAll]);

  const refresh = useCallback((options?: { manual?: boolean }) => {
    if (options?.manual) {
      manualRefreshRequestedRef.current = true;
    }
    setRefreshTick((prev) => prev + 1);
  }, []);

  return { prs, loading, error, refresh };
}
