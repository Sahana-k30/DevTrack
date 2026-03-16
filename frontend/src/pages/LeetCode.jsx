import { useEffect, useState } from 'react';
import api from '../utils/api';
import StatCard from '../components/shared/StatCard';
import { Code2, RefreshCw, Trophy, Flame } from 'lucide-react';

export default function LeetCode() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [username, setUsername] = useState('');
  const [savingUsername, setSavingUsername] = useState(false);
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      const res = await api.get('/api/leetcode/analytics');
      setData(res.data);
      setError('');
    } catch (err) {
      if (err.response?.status === 404) {
        setError('username_not_set');
      } else {
        setError('Failed to load LeetCode data.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSaveUsername = async () => {
    if (!username.trim()) return;
    setSavingUsername(true);
    setError('');
    try {
      await api.post('/api/leetcode/username', { username: username.trim() });
      await fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid username. Please check and try again.');
    } finally {
      setSavingUsername(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await api.post('/api/leetcode/refresh');
      await fetchData();
    } catch (err) {
      setError('Failed to refresh data.');
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
          <h2 className="text-xl font-semibold text-white">LeetCode Analytics</h2>
          <p className="text-gray-500 text-sm mt-1">Problem solving stats and streaks</p>
        </div>
        {data && (
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        )}
      </div>

      {/* Username input */}
      {(error === 'username_not_set' || !data) && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-white font-medium mb-2">Connect your LeetCode account</h3>
          <p className="text-gray-400 text-sm mb-4">Enter your LeetCode username to start tracking your progress.</p>
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="LeetCode username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSaveUsername()}
              className="flex-1 bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-indigo-500"
            />
            <button
              onClick={handleSaveUsername}
              disabled={savingUsername || !username.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-4 py-2 rounded-lg disabled:opacity-50"
            >
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
            <StatCard title="Total Solved" value={data.totalSolved} icon={Code2} color="indigo" />
            <StatCard title="Ranking" value={data.ranking?.toLocaleString()} icon={Trophy} color="yellow" />
            <StatCard title="Current Streak" value={`${data.streak?.current ?? 0} days`} icon={Flame} color="green" />
            <StatCard title="Longest Streak" value={`${data.streak?.longest ?? 0} days`} icon={Flame} color="red" />
          </div>

          {/* Difficulty Breakdown */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-4">Difficulty Breakdown</h3>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Easy', solved: data.easySolved, total: data.easyTotal, color: 'text-green-400', bar: 'bg-green-500' },
                { label: 'Medium', solved: data.mediumSolved, total: data.mediumTotal, color: 'text-yellow-400', bar: 'bg-yellow-500' },
                { label: 'Hard', solved: data.hardSolved, total: data.hardTotal, color: 'text-red-400', bar: 'bg-red-500' },
              ].map(({ label, solved, total, color, bar }) => (
                <div key={label} className="text-center p-4 bg-gray-800 rounded-lg">
                  <p className={`text-2xl font-bold ${color}`}>{solved}</p>
                  <p className="text-xs text-gray-400 mt-1">{label}</p>
                  <p className="text-xs text-gray-600">/ {total}</p>
                  <div className="h-1.5 bg-gray-700 rounded-full mt-2">
                    <div className={`h-1.5 rounded-full ${bar}`}
                      style={{ width: `${total ? (solved / total) * 100 : 0}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Weekly Progress */}
          {data.weeklyProgress?.length > 0 && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-4">Weekly Problems Solved</h3>
              <div className="flex items-end gap-1 h-24">
                {data.weeklyProgress.slice(-12).map((w, i) => {
                  const max = Math.max(...data.weeklyProgress.map(x => x.solved), 1);
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center group relative">
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gray-700 text-xs text-white px-1 py-0.5 rounded opacity-0 group-hover:opacity-100">
                        {w.solved}
                      </div>
                      <div
                        className="w-full bg-green-500 hover:bg-green-400 rounded-sm"
                        style={{ height: `${Math.max(4, (w.solved / max) * 80)}px` }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Recent Submissions */}
          {data.recentSubmissions?.length > 0 && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-4">Recent Accepted Submissions</h3>
              <div className="space-y-2">
                {data.recentSubmissions.slice(0, 8).map((sub, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                    <span className="text-sm text-gray-300">{sub.title}</span>
                    <span className="text-xs text-green-400 bg-green-950 px-2 py-0.5 rounded">Accepted</span>
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