import { useEffect, useState } from 'react';
import api from '../utils/api';
import StatCard from '../components/shared/StatCard';
import { GitCommit, Star, GitFork, RefreshCw } from 'lucide-react';

export default function GitHub() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      const res = await api.get('/api/github/analytics');
      setData(res.data);
      setError('');
    } catch (err) {
      setError('No GitHub data found. Click refresh to load your data.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await api.post('/api/github/refresh');
      await fetchData();
    } catch (err) {
      setError('Failed to refresh. Please try again.');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-700 border-t-indigo-500" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">GitHub Analytics</h2>
          <p className="text-gray-500 text-sm mt-1">Commits, repos, and contribution insights</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
        >
          <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {error && (
        <div className="bg-yellow-950 border border-yellow-800 text-yellow-400 text-sm rounded-lg p-4">
          {error}
        </div>
      )}

      {data && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard title="Total Commits" value={data.totalCommits} icon={GitCommit} color="indigo" />
            <StatCard title="Total Stars" value={data.totalStars} icon={Star} color="yellow" />
            <StatCard title="Repositories" value={data.repos?.length} icon={GitFork} color="blue" />
            <StatCard title="Total PRs" value={data.totalPRs} icon={GitCommit} color="green" />
          </div>

          {/* Language Distribution */}
          {data.languageDistribution && Object.keys(data.languageDistribution).length > 0 && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-4">Language Distribution</h3>
              <div className="space-y-2">
                {Object.entries(data.languageDistribution)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 8)
                  .map(([lang, count]) => {
                    const total = Object.values(data.languageDistribution).reduce((a, b) => a + b, 0);
                    const pct = Math.round((count / total) * 100);
                    return (
                      <div key={lang}>
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                          <span>{lang}</span>
                          <span>{pct}%</span>
                        </div>
                        <div className="h-2 bg-gray-800 rounded-full">
                          <div className="h-2 bg-indigo-500 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Weekly Commits Chart */}
          {data.weeklyCommits?.length > 0 && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-4">Weekly Commits</h3>
              <div className="flex items-end gap-1 h-32">
                {data.weeklyCommits.slice(-16).map((w, i) => {
                  const max = Math.max(...data.weeklyCommits.map(x => x.count), 1);
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gray-700 text-xs text-white px-1 py-0.5 rounded opacity-0 group-hover:opacity-100">
                        {w.count}
                      </div>
                      <div
                        className="w-full bg-indigo-500 hover:bg-indigo-400 rounded-sm transition-colors cursor-pointer"
                        style={{ height: `${Math.max(4, (w.count / max) * 112)}px` }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Top Repos */}
          {data.repos?.length > 0 && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-4">Top Repositories</h3>
              <div className="space-y-3">
                {data.repos.slice(0, 5).map((repo) => (
                  <div key={repo.name} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                    <div>
                      <a href={repo.url} target="_blank" rel="noreferrer"
                        className="text-sm font-medium text-indigo-400 hover:underline">
                        {repo.name}
                      </a>
                      {repo.description && (
                        <p className="text-xs text-gray-500 mt-0.5 truncate max-w-xs">{repo.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      {repo.language && <span className="bg-gray-700 px-2 py-0.5 rounded">{repo.language}</span>}
                      <span>⭐ {repo.stars}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}