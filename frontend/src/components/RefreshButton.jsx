// components/RefreshButton.jsx

import { useRefreshData } from '../hooks/useRefreshData';

export default function RefreshButton({ onSuccess }) {
  const { handleRefresh, refreshing, lastRefreshed, error } = useRefreshData(onSuccess);

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleRefresh}
        disabled={refreshing}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg
                   hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        {/* Spinner while loading */}
        {refreshing ? (
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10"
              stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
        ) : (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4 4v5h.582M20 20v-5h-.581M5.635 19A9 9 0 104.583 9.001" />
          </svg>
        )}
        {refreshing ? 'Refreshing...' : 'Refresh Data'}
      </button>

      {/* Last refreshed timestamp */}
      {lastRefreshed && !refreshing && (
        <span className="text-sm text-gray-400">
          Last updated: {lastRefreshed.toLocaleTimeString()}
        </span>
      )}

      {/* Error message */}
      {error && (
        <span className="text-sm text-red-400">{error}</span>
      )}
    </div>
  );
}