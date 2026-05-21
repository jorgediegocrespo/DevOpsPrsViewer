import type { PRViewModel } from '../types';

interface Props {
  pr: PRViewModel;
}

export function PRRow({ pr }: Props) {
  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
      {/* Project */}
      <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">{pr.project}</td>

      {/* Repo */}
      <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">{pr.repoName}</td>

      {/* PR title / link */}
      <td className="px-4 py-3 text-sm max-w-xs">
        <a
          href={pr.url}
          target="_blank"
          rel="noreferrer"
          className="text-blue-600 hover:text-blue-800 hover:underline font-medium line-clamp-2"
        >
          {pr.title}
        </a>
      </td>

      {/* Author */}
      <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">{pr.author}</td>

      {/* Required reviewers */}
      <td className="px-4 py-3 text-sm text-gray-700">
        {pr.requiredReviewers.length === 0 ? (
          <span className="text-gray-400 italic">—</span>
        ) : (
          <ul className="space-y-0.5">
            {pr.requiredReviewers.map((name) => (
              <li key={name} className="whitespace-nowrap">{name}</li>
            ))}
          </ul>
        )}
      </td>

      {/* Approvals */}
      <td className="px-4 py-3 text-sm text-center">
        <span
          className={`inline-block min-w-[1.75rem] rounded-full px-2 py-0.5 text-xs font-semibold ${
            pr.approvalCount > 0
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-100 text-gray-500'
          }`}
        >
          {pr.approvalCount}
        </span>
      </td>

      {/* Active comments */}
      <td className="px-4 py-3 text-center">
        {pr.hasActiveComments ? (
          <span
            title="Has active comments"
            className="inline-block bg-amber-100 text-amber-700 text-xs font-semibold rounded-full px-2 py-0.5"
          >
            Active
          </span>
        ) : (
          <span className="text-gray-300 text-xs">—</span>
        )}
      </td>
    </tr>
  );
}
