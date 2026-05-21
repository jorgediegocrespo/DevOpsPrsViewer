import { useEffect, useState } from 'react';
import { useProjects } from '../hooks/useProjects';
import { usePullRequests } from '../hooks/usePullRequests';
import { ProjectFilter } from './ProjectFilter';
import { PRTable } from './PRTable';

const STORAGE_KEY = 'prviewer_selected_projects';

function loadSavedSelection(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as string[];
  } catch {
    // ignore
  }
  return [];
}

export function PRDashboard() {
  const { projects, loading: projectsLoading, error: projectsError } = useProjects();
  const [activeProjects, setActiveProjects] = useState<string[]>(loadSavedSelection);
  const { prs, loading: prsLoading, error: prsError, refresh } = usePullRequests(activeProjects);

  // Once projects load, auto-apply if the user had a saved selection
  useEffect(() => {
    if (!projectsLoading && projects.length > 0 && activeProjects.length === 0) {
      // nothing saved — leave filter open for the user to choose
    }
  }, [projectsLoading, projects, activeProjects]);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top bar */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm">
        <h1 className="text-lg font-bold text-gray-800">Pull Request Viewer</h1>
        <div className="flex items-center gap-3">
          {prsLoading && (
            <span className="text-xs text-gray-400 animate-pulse">Refreshing…</span>
          )}
          <button
            onClick={refresh}
            disabled={prsLoading || activeProjects.length === 0}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-sm font-medium rounded px-3 py-1.5 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582M20 20v-5h-.581M4.582 9A8 8 0 0119.418 15M19.418 15A8 8 0 014.582 9" />
            </svg>
            Refresh
          </button>
        </div>
      </header>

      <div className="flex gap-5 p-5 items-start">
        {/* Sidebar */}
        <ProjectFilter
          projects={projects}
          loading={projectsLoading}
          error={projectsError}
          onApply={setActiveProjects}
        />

        {/* Main content */}
        <main className="flex-1 min-w-0 flex flex-col gap-3">
          {/* PR fetch error */}
          {prsError && (
            <div className="bg-red-50 border border-red-300 text-red-700 text-sm rounded-lg px-4 py-3">
              <strong>Error loading pull requests:</strong> {prsError}
            </div>
          )}

          {/* Prompt to select projects */}
          {activeProjects.length === 0 && !prsLoading && (
            <div className="bg-blue-50 border border-blue-200 text-blue-700 text-sm rounded-lg px-4 py-3">
              Select one or more projects in the filter panel and click <strong>Apply</strong> to load pull requests.
            </div>
          )}

          {/* Summary bar */}
          {activeProjects.length > 0 && !prsLoading && (
            <p className="text-xs text-gray-500">
              Showing <strong>{prs.length}</strong> active PR{prs.length !== 1 ? 's' : ''} across{' '}
              <strong>{activeProjects.length}</strong> project{activeProjects.length !== 1 ? 's' : ''}
            </p>
          )}

          <PRTable prs={prs} loading={prsLoading} />
        </main>
      </div>
    </div>
  );
}
