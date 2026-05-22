export interface AzureProject {
  id: string;
  name: string;
}

export interface Reviewer {
  id: string;
  displayName: string;
  imageUrl?: string;
  isRequired: boolean;
  vote: number; // 10=approved, 5=approved w/ suggestions, 0=no vote, -5=waiting, -10=rejected
}

export interface ReviewerPreview {
  id: string;
  name: string;
  imageUrl?: string;
}

export interface RawPullRequest {
  pullRequestId: number;
  title: string;
  createdBy: { displayName: string };
  creationDate: string;
  repository: { id: string; name: string };
  reviewers: Reviewer[];
  isDraft: boolean;
  sourceRefName: string;
  targetRefName: string;
}

export interface Thread {
  id: number;
  status: 'active' | 'fixed' | 'wontFix' | 'closed' | 'byDesign' | 'pending' | 'unknown';
  isDeleted?: boolean;
}

export interface PRViewModel {
  id: number;
  title: string;
  project: string;
  repoName: string;
  author: string;
  creationDate: string;
  sourceBranch: string;
  targetBranch: string;
  reviewers: ReviewerPreview[];
  reviewerCount: number;
  completedReviewCount: number;
  approvalCount: number;
  hasActiveComments: boolean;
  activeCommentCount: number;
  url: string;
}
