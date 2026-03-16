import { useEffect, useState } from 'react';
import api from '../utils/api';
import StatCard from '../components/shared/StatCard';
import { Terminal, RefreshCw, Trophy } from 'lucide-react';

export default function Codeforces() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [username, setUsername] = useState('');
  const [savingUsername, setSavingUsername] = useState(false);
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      const res = await api.get('/api/codeforces/analytics');
      setData(res.data);
      setError('');
    } catch (err) {
      if (err.response?.status === 404) setError('username_not_set');
      else setError('Failed to load Codeforces data.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveUsername = async () => {
    if (!username.trim()) return;
    setSavingUsername(true);
    setError('');
    try {
      await api.post('/api/codeforces/username', { username: username.trim() });
      await fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid handle. Please try again.');
    } finally {
      setSavingUsername(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await api.post('/api/codeforces/refresh');
      await fetchData();
    } catch {
      setError('Failed to refresh.');
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
          <h2 className="text-xl font-semibold text-white">Codeforces Analytics</h2>
          <p className="text-gray-500 text-sm mt-1">Rating, contests, and submission stats</p>
        </div>
        {data && (
          <button onClick={handleRefresh} disabled={refreshing}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-4 py-2 rounded-lg disabled:opacity-50">
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        )}
      </div>

      {(error === 'username_not_set' || !data) && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-white font-medium mb-2">Connect your Codeforces account</h3>
          <p className="text-gray-400 text-sm mb-4">Enter your Codeforces handle to track your progress.</p>
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="e.g. tourist"
              value={username}
              onChange={e => setUsername(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSaveUsername()}
              className="flex-1 bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-indigo-500"
            />
            <button
              onClick={handleSaveUsername}
              disabled={savingUsername || !username.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-4 py-2 rounded-lg disabled:opacity-50">
              {savingUsername ? 'Saving...' : 'Save'}
            </button>
          </div>
          {error && error !== 'username_not_set' && (
            <p className="text-red-400 text-sm mt-2">{error}</p>
          )}
        </div>
      )}

      {data && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard title="Rating" value={data.rating} icon={Trophy} color="yellow" />
            <StatCard title="Max Rating" value={data.maxRating} icon={Trophy} color="indigo" />
            <StatCard title="Rank" value={data.rank} icon={Terminal} color="green" />
            <StatCard title="Problems Solved" value={data.totalSolved} icon={Terminal} color="blue" />
          </div>

          {data.ratingHistory?.length > 0 && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-4">Rating History</h3>
              <div className="flex items-end gap-1 h-32">
                {data.ratingHistory.slice(-16).map((r, i) => {
                  const ratings = data.ratingHistory.map(x => x.rating);
                  const min = Math.min(...ratings);
                  const max = Math.max(...ratings);
                  const range = max - min || 1;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center group relative">
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gray-700 text-xs text-white px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap">
                        {r.rating}
                      </div>
                      <div
                        className="w-full bg-yellow-500 hover:bg-yellow-400 rounded-sm cursor-pointer"
                        style={{ height: `${Math.max(4, ((r.rating - min) / range) * 112)}px` }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {data.verdictStats && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-4">Submission Verdicts</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(data.verdictStats).map(([verdict, count]) => (
                  <div key={verdict} className="text-center p-3 bg-gray-800 rounded-lg">
                    <p className="text-xl font-bold text-white">{count}</p>
                    <p className="text-xs text-gray-400 mt-1">{verdict}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {data.languageDistribution && Object.keys(data.languageDistribution).length > 0 && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-4">Language Distribution</h3>
              <div className="space-y-2">
                {Object.entries(data.languageDistribution)
                  .sort((a, b) => b[1] - a[1]).slice(0, 6)
                  .map(([lang, count]) => {
                    const total = Object.values(data.languageDistribution).reduce((a, b) => a + b, 0);
                    const pct = Math.round((count / total) * 100);
                    return (
                      <div key={lang}>
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                          <span>{lang}</span><span>{pct}%</span>
                        </div>
                        <div className="h-2 bg-gray-800 rounded-full">
                          <div className="h-2 bg-blue-500 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}