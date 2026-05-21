import { useEffect, useState } from 'react';
import { CONFIG_ERROR } from './config';
import { PRDashboard } from './components/PRDashboard';

type ThemeMode = 'light' | 'dark';

const THEME_STORAGE_KEY = 'prviewer_theme_mode';

function loadSavedTheme(): ThemeMode {
  try {
    const raw = localStorage.getItem(THEME_STORAGE_KEY);
    if (raw === 'light' || raw === 'dark') return raw;
  } catch {
    // ignore
  }

  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }

  return 'light';
}

function ConfigError({ message, theme, onToggleTheme }: { message: string; theme: ThemeMode; onToggleTheme: () => void }) {
  return (
    <div className="min-h-screen bg-gray-100 p-6 dark:bg-slate-950">
      <div className="mb-4 flex justify-end">
        <button
          type="button"
          onClick={onToggleTheme}
          className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
        >
          {theme === 'dark' ? 'Light mode' : 'Dark mode'}
        </button>
      </div>
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-lg items-center">
        <div className="w-full rounded-lg border border-red-300 bg-white p-8 shadow dark:border-red-500/40 dark:bg-slate-900">
          <h1 className="text-lg font-bold text-red-600 mb-3">Configuration Error</h1>
          <p className="text-sm text-gray-700 dark:text-slate-300">{message}</p>
          <pre className="mt-4 whitespace-pre-wrap rounded border border-gray-200 bg-gray-50 p-3 text-xs text-gray-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300">
            {`# .env\nVITE_ADO_ORG=your-org-name\nVITE_ADO_PAT=your-personal-access-token`}
          </pre>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [theme, setTheme] = useState<ThemeMode>(loadSavedTheme);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  function handleToggleTheme() {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }

  if (CONFIG_ERROR) return <ConfigError message={CONFIG_ERROR} theme={theme} onToggleTheme={handleToggleTheme} />;
  return <PRDashboard theme={theme} onToggleTheme={handleToggleTheme} />;
}
