import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchProjectPRs, fetchPRThreads } from '../api/azureDevOps';
import { ORG, PAT, ADO_BASE } from '../config';
import type { PRViewModel } from '../types';

interface UsePullRequestsResult {
  prs: PRViewModel[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function usePullRequests(selectedProjects: string[]): UsePullRequestsResult {
  const [prs, setPrs] = useState<PRViewModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const refreshCount = useRef(0);

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

      const prViewModels = await Promise.all(
        allPRs.map(async ({ project, pr }) => {
          const threads = await fetchPRThreads(ORG, project, pr.repository.id, pr.pullRequestId, PAT);
          const hasActiveComments = threads.some(
            (t) => !t.isDeleted && t.status === 'active'
          );
          const requiredReviewers = pr.reviewers.filter((r) => r.isRequired);
          const reviewers = requiredReviewers.map((r) => r.displayName);
          const reviewerCount = requiredReviewers.length;
          const completedReviewCount = requiredReviewers.filter((r) => r.vote !== 0).length;
          const approvalCount = requiredReviewers.filter((r) => r.vote === 10).length;
          const url = `${ADO_BASE}/${encodeURIComponent(project)}/_git/${encodeURIComponent(pr.repository.name)}/pullrequest/${pr.pullRequestId}`;

          return {
            id: pr.pullRequestId,
            title: pr.title,
            project,
            repoName: pr.repository.name,
            author: pr.createdBy.displayName,
            reviewers,
            reviewerCount,
            completedReviewCount,
            approvalCount,
            hasActiveComments,
            url,
          } satisfies PRViewModel;
        })
      );

      if (signal.aborted) return;

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
    const controller = new AbortController();
    fetchAll(selectedProjects, controller.signal);
    return () => controller.abort();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProjects, refreshCount.current, fetchAll]);

  const refresh = useCallback(() => {
    refreshCount.current += 1;
    const controller = new AbortController();
    fetchAll(selectedProjects, controller.signal);
  }, [selectedProjects, fetchAll]);

  return { prs, loading, error, refresh };
}
