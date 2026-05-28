import type { PRViewModel } from '../types';

export type PRColumnKey = 'created' | 'inReview' | 'comments' | 'ready';

export const PR_COLUMN_LABELS: Record<PRColumnKey, string> = {
  created: 'Created',
  inReview: 'In review',
  comments: 'Comments',
  ready: 'Ready',
};

export function classifyPR(
  pr: Pick<PRViewModel, 'approvalCount' | 'hasActiveComments' | 'reviewerCount'>
): PRColumnKey {
  if (pr.hasActiveComments) return 'comments';
  if (pr.approvalCount >= 2) return 'ready';
  if (pr.reviewerCount === 0) return 'created';
  return 'inReview';
}