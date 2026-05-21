import { CONFIG_ERROR } from './config';
import { PRDashboard } from './components/PRDashboard';

function ConfigError({ message }: { message: string }) {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="bg-white border border-red-300 rounded-lg shadow p-8 max-w-lg w-full">
        <h1 className="text-lg font-bold text-red-600 mb-3">Configuration Error</h1>
        <p className="text-sm text-gray-700">{message}</p>
        <pre className="mt-4 bg-gray-50 border border-gray-200 rounded p-3 text-xs text-gray-600 whitespace-pre-wrap">
          {`# .env\nVITE_ADO_ORG=your-org-name\nVITE_ADO_PAT=your-personal-access-token`}
        </pre>
      </div>
    </div>
  );
}

export default function App() {
  if (CONFIG_ERROR) return <ConfigError message={CONFIG_ERROR} />;
  return <PRDashboard />;
}
