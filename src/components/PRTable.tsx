import type { PRViewModel } from '../types';
import { PRRow } from './PRRow';

interface Props {
  prs: PRViewModel[];
  loading: boolean;
}

const HEADERS = ['Project', 'Repo', 'Pull Request', 'Author', 'Required Reviewers', 'Approvals', 'Comments'];

function SkeletonRow() {
  return (
    <tr className="border-b border-gray-100 animate-pulse">
      {HEADERS.map((h) => (
        <td key={h} className="px-4 py-3">
          <div className="h-3 bg-gray-200 rounded w-3/4" />
        </td>
      ))}
    </tr>
  );
}

export function PRTable({ prs, loading }: Props) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
      <table className="min-w-full bg-white text-left">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            {HEADERS.map((h) => (
              <th
                key={h}
                className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading && prs.length === 0 ? (
            Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
          ) : prs.length === 0 ? (
            <tr>
              <td colSpan={HEADERS.length} className="px-4 py-10 text-center text-sm text-gray-400">
                No active pull requests found for the selected projects.
              </td>
            </tr>
          ) : (
            prs.map((pr) => <PRRow key={`${pr.project}-${pr.id}`} pr={pr} />)
          )}
        </tbody>
      </table>
    </div>
  );
}
