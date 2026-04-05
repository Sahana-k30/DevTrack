import { useEffect, useState, useCallback } from 'react';
import api from '../utils/api';
import StatCard from '../components/shared/StatCard';
import { GitCommit, Star, GitFork, RefreshCw, GitPullRequest, Flame, TrendingUp } from 'lucide-react';

export default function GitHub() {
  const [data, setData]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError]         = useState('');
  const [toast, setToast]         = useState(null); // { type: 'success'|'error', msg }

  // ── auto-dismiss toast after 4s ──
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  const fetchData = useCallback(async () => {
    try {
      const res = await api.get('/api/github/analytics');
      setData(res.data);
      setError('');
    } catch (err) {
      setError('No GitHub data found. Click Refresh to load your data.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    setError('');
    try {
      await api.post('/api/github/refresh');
      await fetchData();                         // re-fetch so UI shows fresh data
      setToast({ type: 'success', msg: '✅ GitHub data refreshed!' });
    } catch (err) {
      setToast({ type: 'error', msg: err.response?.data?.message || '❌ Refresh failed. Please try again.' });
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-700 border-t-indigo-500" />
    </div>
  );

  // Language colors for a nicer chart
  const LANG_COLORS = {
    JavaScript: '#f7df1e', TypeScript: '#3178c6', Python: '#3572A5',
    Java: '#b07219', 'C++': '#f34b7d', C: '#555555', Go: '#00ADD8',
    Rust: '#dea584', Ruby: '#701516', Swift: '#ffac45', Kotlin: '#A97BFF',
    HTML: '#e34c26', CSS: '#563d7c', Shell: '#89e051', default: '#6366f1',
  };
  const getLangColor = (lang) => LANG_COLORS[lang] || LANG_COLORS.default;

  return (
    <div className="space-y-6">

      {/* ── HEADER ── */}
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

      {/* ── ERROR BANNER ── */}
      {error && (
        <div className="bg-yellow-950 border border-yellow-800 text-yellow-400 text-sm rounded-lg p-4">
          {error}
        </div>
      )}

      {data && (
        <>
          {/* ── STAT CARDS ── */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <StatCard title="Total Commits"  value={data.totalCommits}         icon={GitCommit}    color="indigo" />
            <StatCard title="Total Stars"    value={data.totalStars}           icon={Star}         color="yellow" />
            <StatCard title="Repositories"   value={data.repos?.length}        icon={GitFork}      color="blue"   />
            <StatCard title="Total PRs"      value={data.totalPRs}             icon={GitPullRequest} color="green" />
            <StatCard title="Current Streak" value={`${data.contributionStreak?.current ?? 0}d`} icon={Flame} color="red" />
            <StatCard title="Longest Streak" value={`${data.contributionStreak?.longest ?? 0}d`} icon={TrendingUp} color="purple" />
          </div>

          {/* ── LANGUAGE DISTRIBUTION ── */}
          {data.languageDistribution && Object.keys(data.languageDistribution).length > 0 && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-4">Language Distribution</h3>
              <div className="space-y-3">
                {Object.entries(data.languageDistribution)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 8)
                  .map(([lang, count]) => {
                    const total = Object.values(data.languageDistribution).reduce((a, b) => a + b, 0);
                    const pct   = Math.round((count / total) * 100);
                    return (
                      <div key={lang}>
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                          <span className="flex items-center gap-2">
                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: getLangColor(lang), display: 'inline-block' }} />
                            {lang}
                          </span>
                          <span>{pct}% ({count} repos)</span>
                        </div>
                        <div className="h-2 bg-gray-800 rounded-full">
                          <div
                            className="h-2 rounded-full transition-all"
                            style={{ width: `${pct}%`, background: getLangColor(lang) }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* ── WEEKLY COMMITS CHART ── */}
          {data.weeklyCommits?.length > 0 && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-1">Weekly Commits</h3>
              <p className="text-xs text-gray-500 mb-4">Last {Math.min(data.weeklyCommits.length, 16)} weeks</p>
              <div className="flex items-end gap-1 h-32">
                {data.weeklyCommits.slice(-16).map((w, i) => {
                  const max = Math.max(...data.weeklyCommits.map(x => x.count), 1);
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center group relative">
                      <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-gray-700 text-xs text-white px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-10">
                        {w.count} commits
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

          {/* ── TOP REPOSITORIES ── */}
          {data.repos?.length > 0 && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-4">
                Top Repositories
                <span className="text-gray-500 font-normal ml-2">({data.repos.length} total)</span>
              </h3>
              <div className="space-y-3">
                {[...data.repos]
                  .sort((a, b) => b.stars - a.stars)  // show highest starred first
                  .slice(0, 6)
                  .map((repo) => (
                    <div key={repo.name} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg hover:bg-gray-750 transition-colors">
                      <div className="min-w-0 flex-1">
                        <a
                          href={repo.url} target="_blank" rel="noreferrer"
                          className="text-sm font-medium text-indigo-400 hover:underline"
                        >
                          {repo.name}
                        </a>
                        {repo.description && (
                          <p className="text-xs text-gray-500 mt-0.5 truncate max-w-xs">{repo.description}</p>
                        )}
                        {repo.topics?.length > 0 && (
                          <div className="flex gap-1 mt-1 flex-wrap">
                            {repo.topics.slice(0, 3).map(t => (
                              <span key={t} className="text-xs bg-indigo-950 text-indigo-400 px-1.5 py-0.5 rounded">{t}</span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-400 ml-4 shrink-0">
                        {repo.language && (
                          <span className="flex items-center gap-1">
                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: getLangColor(repo.language), display: 'inline-block' }} />
                            {repo.language}
                          </span>
                        )}
                        <span>⭐ {repo.stars}</span>
                        <span>🍴 {repo.forks}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* ── RECENT COMMITS ── */}
          {data.commits?.length > 0 && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-4">Recent Commits</h3>
              <div className="space-y-2">
                {data.commits.slice(0, 8).map((commit, i) => (
                  <div key={i} className="flex items-start justify-between p-3 bg-gray-800 rounded-lg gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-gray-300 truncate">{commit.message?.split('\n')[0]}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{commit.repo}</p>
                    </div>
                    <span className="text-xs text-gray-500 shrink-0">
                      {new Date(commit.date).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── PULL REQUESTS ── */}
          {data.pullRequests?.length > 0 && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-4">Recent Pull Requests</h3>
              <div className="space-y-2">
                {data.pullRequests.slice(0, 6).map((pr, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-gray-300 truncate">{pr.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{pr.repo}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded ml-3 shrink-0 ${
                      pr.state === 'merged'
                        ? 'bg-purple-950 text-purple-400'
                        : pr.state === 'open'
                        ? 'bg-green-950 text-green-400'
                        : 'bg-gray-700 text-gray-400'
                    }`}>
                      {pr.state}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* ── TOAST ── */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 28, right: 28, zIndex: 9999,
          padding: '12px 18px', borderRadius: 12,
          fontSize: 13, fontWeight: 600,
          boxShadow: '0 8px 28px rgba(0,0,0,0.2)',
          display: 'flex', alignItems: 'center', gap: 8,
          background: toast.type === 'success' ? '#ecfdf5' : '#fef2f2',
          color:      toast.type === 'success' ? '#065f46'  : '#991b1b',
          border:     `1px solid ${toast.type === 'success' ? '#a7f3d0' : '#fecaca'}`,
        }}>
          {toast.msg}
        </div>
      )}

    </div>
  );
}