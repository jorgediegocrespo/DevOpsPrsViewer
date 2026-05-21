import { useMemo, useState } from 'react';
import type { AzureProject } from '../types';

const STORAGE_KEY = 'prviewer_selected_projects';

function loadSaved(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return new Set(JSON.parse(raw) as string[]);
  } catch {
    // ignore corrupt storage
  }
  return new Set();
}

function saveToDisk(ids: Set<string>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
}

interface Props {
  projects: AzureProject[];
  loading: boolean;
  error: string | null;
  onApply: (selectedNames: string[]) => void;
}

export function ProjectFilter({ projects, loading, error, onApply }: Props) {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Set<string>>(loadSaved);
  const [open, setOpen] = useState(true);

  const filtered = useMemo(
    () =>
      projects.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase())
      ),
    [projects, search]
  );

  function toggle(name: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }

  function selectAll() {
    setSelected(new Set(filtered.map((p) => p.name)));
  }

  function clearAll() {
    setSelected(new Set());
  }

  function handleApply() {
    saveToDisk(selected);
    onApply([...selected]);
  }

  return (
    <aside className="w-72 shrink-0 bg-white border border-gray-200 rounded-lg flex flex-col shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-800 text-sm">Projects</span>
          {selected.size > 0 && (
            <span className="bg-blue-600 text-white text-xs font-medium rounded-full px-2 py-0.5">
              {selected.size}
            </span>
          )}
        </div>
        <button
          onClick={() => setOpen((o) => !o)}
          className="text-gray-400 hover:text-gray-600 text-xs"
          aria-label={open ? 'Collapse filter' : 'Expand filter'}
        >
          {open ? '▲' : '▼'}
        </button>
      </div>

      {open && (
        <>
          {/* Search */}
          <div className="px-3 py-2 border-b border-gray-100">
            <input
              type="search"
              placeholder="Search projects…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-sm border border-gray-300 rounded px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Select all / Clear */}
          <div className="flex gap-3 px-3 py-1.5 border-b border-gray-100">
            <button
              onClick={selectAll}
              disabled={loading}
              className="text-xs text-blue-600 hover:underline disabled:opacity-40"
            >
              Select all
            </button>
            <button
              onClick={clearAll}
              disabled={loading}
              className="text-xs text-gray-500 hover:underline disabled:opacity-40"
            >
              Clear
            </button>
          </div>

          {/* Project list */}
          <div className="flex-1 overflow-y-auto min-h-0 max-h-96">
            {loading && (
              <p className="text-xs text-gray-400 px-4 py-3">Loading projects…</p>
            )}
            {error && (
              <p className="text-xs text-red-500 px-4 py-3">{error}</p>
            )}
            {!loading && !error && filtered.length === 0 && (
              <p className="text-xs text-gray-400 px-4 py-3">No projects found.</p>
            )}
            <ul>
              {filtered.map((project) => (
                <li key={project.id}>
                  <label className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selected.has(project.name)}
                      onChange={() => toggle(project.name)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 truncate">{project.name}</span>
                  </label>
                </li>
              ))}
            </ul>
          </div>

          {/* Apply */}
          <div className="px-3 py-2 border-t border-gray-200">
            <button
              onClick={handleApply}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-sm font-medium rounded py-1.5 transition-colors"
            >
              Apply
            </button>
          </div>
        </>
      )}
    </aside>
  );
}
