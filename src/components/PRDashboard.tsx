import { useEffect, useMemo, useRef, useState } from 'react';
import { useProjects } from '../hooks/useProjects';
import { usePullRequests } from '../hooks/usePullRequests';
import type { PRViewModel } from '../types';

const PROJECT_STORAGE_KEY = 'prviewer_selected_projects';
const AUTHOR_FILTER_STORAGE_KEY = 'prviewer_selected_authors';

type ColumnKey = 'created' | 'inReview' | 'comments' | 'ready';

const COLUMN_ORDER: ColumnKey[] = ['created', 'inReview', 'comments', 'ready'];

interface FilterOption {
  id: string;
  label: string;
}

const COLUMN_CONFIG: Record<ColumnKey, { title: string; empty: string; tone: string }> = {
  created: {
    title: 'Created',
    empty: 'No PRs without reviewers.',
    tone: 'border-slate-300',
  },
  inReview: {
    title: 'In review',
    empty: 'No PRs currently under review.',
    tone: 'border-slate-300',
  },
  comments: {
    title: 'Comments',
    empty: 'No PRs with active comments.',
    tone: 'border-slate-300',
  },
  ready: {
    title: 'Ready',
    empty: 'No PRs ready.',
    tone: 'border-slate-300',
  },
};

function loadSavedSelection(storageKey: string): string[] {
  try {
    const raw = localStorage.getItem(storageKey);
    if (raw) return JSON.parse(raw) as string[];
  } catch {
    // ignore
  }
  return [];
}

function saveSelection(storageKey: string, values: string[]) {
  localStorage.setItem(storageKey, JSON.stringify(values));
}

function classifyPR(pr: PRViewModel): ColumnKey {
  if (pr.hasActiveComments) return 'comments';
  if (pr.approvalCount >= 2) return 'ready';
  if (pr.reviewerCount === 0) return 'created';
  return 'inReview';
}

function cardToneByReviewers(reviewerCount: number): string {
  if (reviewerCount === 0) return 'bg-slate-50/80 border-slate-200';
  if (reviewerCount === 1) return 'bg-cyan-50/70 border-cyan-200';
  return 'bg-amber-50/70 border-amber-200';
}

function initials(name: string): string {
  const parts = name
    .split(' ')
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function PRCard({ pr }: { pr: PRViewModel }) {
  const visibleReviewers = pr.reviewers.slice(0, 3);
  const overflowReviewers = Math.max(0, pr.reviewers.length - visibleReviewers.length);

  return (
    <a
      href={pr.url}
      target="_blank"
      rel="noreferrer"
      className={`relative block rounded-xl border p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${cardToneByReviewers(pr.reviewerCount)}`}
    >
      {visibleReviewers.length > 0 && (
        <div className="absolute right-3 top-3 flex items-center gap-1.5">
          {visibleReviewers.map((reviewer) => (
            <div key={reviewer.id} title={reviewer.name} className="h-6 w-6 overflow-hidden rounded-full border border-white shadow-sm">
              {reviewer.imageUrl ? (
                <img
                  src={reviewer.imageUrl}
                  alt={reviewer.name}
                  className="h-full w-full object-cover"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center bg-slate-200 text-[10px] font-semibold text-slate-700">
                  {initials(reviewer.name)}
                </span>
              )}
            </div>
          ))}
          {overflowReviewers > 0 && (
            <span className="ml-1 text-[10px] font-semibold text-slate-500">+{overflowReviewers}</span>
          )}
        </div>
      )}

      <p className="line-clamp-2 text-sm font-semibold text-slate-800">{pr.title}</p>
      <div className="mt-2 space-y-1 text-xs text-slate-600">
        <p>
          Repo: <span className="font-medium text-slate-700">{pr.repoName}</span>
        </p>
        <p>
          Author: <span className="font-medium text-slate-700">{pr.author}</span>
        </p>
        <p>
          Reviewers: <span className="font-medium text-slate-700">{pr.reviewerCount}</span>
        </p>
      </div>
      <div className="mt-3 flex items-center gap-2 text-[11px] font-semibold">
        <span
          className={`rounded-full px-2 py-0.5 ${
            pr.approvalCount === 0
              ? 'bg-slate-100 text-slate-600'
              : pr.approvalCount === 1
                ? 'bg-sky-100 text-sky-700'
                : 'bg-emerald-100 text-emerald-700'
          }`}
        >
          Approvals: {pr.approvalCount}
        </span>
        {pr.activeCommentCount > 0 && (
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-amber-700">
            Comments: {pr.activeCommentCount}
          </span>
        )}
      </div>
    </a>
  );
}

interface DropdownMultiSelectProps {
  label: string;
  options: FilterOption[];
  selected: string[];
  placeholder: string;
  onChange: (values: string[]) => void;
  disabled?: boolean;
}

function DropdownMultiSelect({
  label,
  options,
  selected,
  placeholder,
  onChange,
  disabled = false,
}: DropdownMultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const selectedLabel = selected.length > 0 ? selected.join(', ') : placeholder;

  const filteredOptions = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return options;
    return options.filter((option) => option.label.toLowerCase().includes(term));
  }, [options, search]);

  function toggleValue(value: string) {
    if (selected.includes(value)) {
      onChange(selected.filter((entry) => entry !== value));
      return;
    }
    onChange([...selected, value]);
  }

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (!wrapperRef.current) return;
      if (event.target instanceof Node && !wrapperRef.current.contains(event.target)) {
        setOpen(false);
        setSearch('');
      }
    }

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  function handleInputFocus() {
    if (disabled) return;
    setOpen(true);
  }

  function handleInputChange(value: string) {
    if (!open) setOpen(true);
    setSearch(value);
  }

  function clearAll() {
    onChange([]);
  }

  function selectAll() {
    onChange(options.map((option) => option.label));
  }

  return (
    <div ref={wrapperRef} className="relative">
      <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </label>
      <div className="relative">
        <input
          type="text"
          value={open ? search : selectedLabel}
          onFocus={handleInputFocus}
          onClick={handleInputFocus}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={!open}
          className="w-full truncate rounded-lg border border-slate-300 bg-white px-3 py-2 pr-9 text-sm shadow-sm focus:border-cyan-500 focus:outline-none disabled:bg-slate-100"
          title={!open ? selectedLabel : undefined}
        />
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          disabled={disabled}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-500 disabled:opacity-60"
          aria-label={open ? 'Close filter dropdown' : 'Open filter dropdown'}
        >
          {open ? '▲' : '▼'}
        </button>
      </div>

      {open && (
        <div className="absolute z-20 mt-1 w-full rounded-lg border border-slate-200 bg-white p-2 shadow-lg">
          <div className="mb-1 flex items-center justify-between px-1">
            <span className="text-xs text-slate-500">{selected.length} selected</span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={selectAll}
                className="text-xs font-medium text-cyan-700 hover:underline"
              >
                Select all
              </button>
              <button
                type="button"
                onClick={clearAll}
                className="text-xs font-medium text-cyan-700 hover:underline"
              >
                Clear
              </button>
            </div>
          </div>

          <div className="max-h-44 overflow-y-auto rounded-md border border-slate-200">
            {filteredOptions.length === 0 && (
              <p className="px-2 py-2 text-xs text-slate-500">No results.</p>
            )}

            {filteredOptions.map((option) => (
              <label
                key={option.id}
                className="flex cursor-pointer items-center gap-2 px-2 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
              >
                <input
                  type="checkbox"
                  checked={selected.includes(option.label)}
                  onChange={() => toggleValue(option.label)}
                  disabled={disabled}
                  className="rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
                />
                <span className="truncate">{option.label}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function PRDashboard() {
  const { projects, loading: projectsLoading, error: projectsError } = useProjects();
  const [activeProjects, setActiveProjects] = useState<string[]>(() => loadSavedSelection(PROJECT_STORAGE_KEY));
  const [selectedAuthors, setSelectedAuthors] = useState<string[]>(() => loadSavedSelection(AUTHOR_FILTER_STORAGE_KEY));
  const [collapsedProjects, setCollapsedProjects] = useState<Record<string, boolean>>({});
  const { prs, loading: prsLoading, error: prsError, refresh } = usePullRequests(activeProjects);

  useEffect(() => {
    if (activeProjects.length === 0) return;

    const intervalId = window.setInterval(() => {
      if (!document.hidden) refresh();
    }, 30000);

    const onFocus = () => refresh();
    window.addEventListener('focus', onFocus);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('focus', onFocus);
    };
  }, [activeProjects.length, refresh]);

  const authors = useMemo(
    () => [...new Set(prs.map((pr) => pr.author))].sort((a, b) => a.localeCompare(b)),
    [prs]
  );

  const projectOptions = useMemo<FilterOption[]>(
    () => projects.map((project) => ({ id: project.id, label: project.name })),
    [projects]
  );

  const authorOptions = useMemo<FilterOption[]>(
    () => authors.map((author) => ({ id: author, label: author })),
    [authors]
  );

  const visiblePRs = useMemo(() => {
    if (selectedAuthors.length === 0) return prs;
    return prs.filter((pr) => !selectedAuthors.includes(pr.author));
  }, [prs, selectedAuthors]);

  const summary = useMemo(() => {
    const counts: Record<ColumnKey, number> = {
      created: 0,
      inReview: 0,
      comments: 0,
      ready: 0,
    };

    for (const pr of visiblePRs) {
      counts[classifyPR(pr)] += 1;
    }

    return counts;
  }, [visiblePRs]);

  const boardByProject = useMemo(() => {
    const initial = activeProjects.reduce<Record<string, Record<ColumnKey, PRViewModel[]>>>(
      (acc, project) => {
        acc[project] = {
          created: [],
          inReview: [],
          comments: [],
          ready: [],
        };
        return acc;
      },
      {}
    );

    for (const pr of visiblePRs) {
      if (!initial[pr.project]) {
        initial[pr.project] = {
          created: [],
          inReview: [],
          comments: [],
          ready: [],
        };
      }
      initial[pr.project][classifyPR(pr)].push(pr);
    }

    for (const project of Object.keys(initial)) {
      for (const column of Object.keys(initial[project]) as ColumnKey[]) {
        initial[project][column].sort((a, b) => {
          if (b.reviewerCount !== a.reviewerCount) return b.reviewerCount - a.reviewerCount;
          return b.id - a.id;
        });
      }
    }

    return initial;
  }, [activeProjects, visiblePRs]);

  function handleProjectsChange(values: string[]) {
    setActiveProjects(values);
    saveSelection(PROJECT_STORAGE_KEY, values);
  }

  function handleSelectedAuthorsChange(values: string[]) {
    setSelectedAuthors(values);
    saveSelection(AUTHOR_FILTER_STORAGE_KEY, values);
  }

  function toggleProjectPanel(project: string) {
    setCollapsedProjects((prev) => ({
      ...prev,
      [project]: !prev[project],
    }));
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-100 via-white to-cyan-50 text-slate-800">
      <header className="border-b border-slate-200 bg-white/85 px-6 py-4 backdrop-blur-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Pull Request Kanban</h1>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500">
              Showing <strong>{visiblePRs.length}</strong> of <strong>{prs.length}</strong> PRs
            </span>

            {prsLoading && <span className="text-xs text-slate-400 animate-pulse">Refreshing…</span>}

            {!prsLoading && activeProjects.length > 0 && (
              <span className="text-xs text-slate-400">Auto-refresh: 30s</span>
            )}

            <button
              onClick={refresh}
              disabled={prsLoading || activeProjects.length === 0}
              className="rounded-md bg-cyan-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-cyan-700 disabled:opacity-40"
            >
              Refresh
            </button>
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <DropdownMultiSelect
            label="Projects"
            options={projectOptions}
            selected={activeProjects}
            placeholder="No projects selected"
            onChange={handleProjectsChange}
            disabled={projectsLoading}
          />

          <DropdownMultiSelect
            label="Ignore PR Authors"
            options={authorOptions}
            selected={selectedAuthors}
            placeholder="No ignored users"
            onChange={handleSelectedAuthorsChange}
            disabled={prsLoading && authors.length === 0}
          />
        </div>

        <div className="mt-3 rounded-lg border border-slate-200 bg-white/90 px-3 py-2">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
            <span className="font-semibold text-slate-700">Summary</span>
            <span className="rounded-full bg-slate-100 px-2 py-0.5">Created: {summary.created}</span>
            <span className="rounded-full bg-slate-100 px-2 py-0.5">In review: {summary.inReview}</span>
            <span className="rounded-full bg-slate-100 px-2 py-0.5">Comments: {summary.comments}</span>
            <span className="rounded-full bg-slate-100 px-2 py-0.5">Ready: {summary.ready}</span>
            <span className="rounded-full bg-slate-100 px-2 py-0.5">Projects: {activeProjects.length}</span>
            <span className="rounded-full bg-slate-100 px-2 py-0.5">Ignored authors: {selectedAuthors.length}</span>
          </div>
        </div>

        {projectsLoading && <p className="mt-2 text-xs text-slate-500">Loading projects…</p>}
        {projectsError && <p className="mt-2 text-sm text-red-600">{projectsError}</p>}
      </header>

      <main className="px-5 py-4">
        {prsError && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <strong>Error loading pull requests:</strong> {prsError}
          </div>
        )}

        {activeProjects.length === 0 && !prsLoading && (
          <div className="rounded-lg border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm text-cyan-800">
            Select one or more projects in the top filter to load pull requests.
          </div>
        )}

        <div className="mt-4 space-y-4">
          {activeProjects.map((project) => {
            const isCollapsed = collapsedProjects[project] ?? false;
            const projectColumns = boardByProject[project] ?? {
              created: [],
              inReview: [],
              comments: [],
              ready: [],
            };

            return (
              <section key={project} className="rounded-xl border border-slate-200 bg-white/80 shadow-sm">
                <button
                  onClick={() => toggleProjectPanel(project)}
                  className="flex w-full items-center justify-between rounded-t-xl px-4 py-3 text-left transition hover:bg-slate-50"
                >
                  <span className="font-semibold text-slate-900">{project}</span>
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {isCollapsed ? 'Expand' : 'Collapse'}
                  </span>
                </button>

                {!isCollapsed && (
                  <div className="overflow-x-auto border-t border-slate-200 px-3 py-3">
                    <div className="grid min-w-245 grid-cols-4 gap-3">
                      {COLUMN_ORDER.map((columnKey) => {
                        const cfg = COLUMN_CONFIG[columnKey];
                        const columnPRs = projectColumns[columnKey];

                        return (
                          <div key={columnKey} className={`rounded-xl border p-2 ${cfg.tone}`}>
                            <div className="mb-2 flex items-center justify-between px-1">
                              <h2 className="text-sm font-semibold text-slate-800">{cfg.title}</h2>
                              <span className="rounded-full bg-white px-2 py-0.5 text-xs font-bold text-slate-600">
                                {columnPRs.length}
                              </span>
                            </div>

                            <div className="space-y-2">
                              {columnPRs.length === 0 && (
                                <p className="rounded-lg border border-dashed border-slate-300 bg-white/70 px-2 py-3 text-center text-xs text-slate-500">
                                  {cfg.empty}
                                </p>
                              )}

                              {columnPRs.map((pr) => (
                                <PRCard key={`${pr.project}-${pr.id}`} pr={pr} />
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </section>
            );
          })}
        </div>
      </main>
    </div>
  );
}
