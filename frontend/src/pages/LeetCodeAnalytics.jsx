import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/shared/StatCard';
import { WeeklyBarChart } from '../components/charts/WeeklyBarChart';

export default function LeetCodeAnalytics() {
  const { user, fetchUser } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user?.leetcodeUsername) {
      axios.get('/api/leetcode/analytics')
        .then(r => setData(r.data))
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleSaveUsername = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data: res } = await axios.post('/api/leetcode/username', { username });
      setData(res.data);
      fetchUser();
    } catch (err) {
      alert('Could not fetch LeetCode data. Check the username.');
    } finally {
      setSaving(false);
    }
  };

  if (!user?.leetcodeUsername) {
    return (
      <div className="max-w-md">
        <h2 className="text-xl font-semibold text-white mb-2">LeetCode Analytics</h2>
        <p className="text-gray-400 text-sm mb-6">Enter your LeetCode username to start tracking.</p>
        <form onSubmit={handleSaveUsername} className="flex gap-2">
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder="e.g. johndoe"
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
          />
          <button type="submit" disabled={saving || !username}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50">
            {saving ? 'Saving…' : 'Connect'}
          </button>
        </form>
      </div>
    );
  }

  if (loading) return <p className="text-gray-500">Loading LeetCode data…</p>;
  if (!data) return <p className="text-gray-500">No data yet.</p>;

  const total = (data.easySolved || 0) + (data.mediumSolved || 0) + (data.hardSolved || 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">LeetCode Analytics</h2>
        <span className="text-xs text-gray-500">@{user.leetcodeUsername}</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Solved" value={data.totalSolved} />
        <StatCard label="Easy" value={data.easySolved} color="green" />
        <StatCard label="Medium" value={data.mediumSolved} color="yellow" />
        <StatCard label="Hard" value={data.hardSolved} color="red" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <StatCard label="Current Streak" value={`${data.streak?.current} days`} />
        <StatCard label="Global Ranking" value={data.ranking ? `#${data.ranking.toLocaleString()}` : 'N/A'} />
      </div>

      {/* Difficulty breakdown bar */}
      {total > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="text-sm font-medium text-gray-400 mb-3">Difficulty Breakdown</h3>
          <div className="flex h-4 rounded-full overflow-hidden gap-0.5">
            <div className="bg-green-500" style={{ width: `${(data.easySolved / total) * 100}%` }} />
            <div className="bg-yellow-500" style={{ width: `${(data.mediumSolved / total) * 100}%` }} />
            <div className="bg-red-500" style={{ width: `${(data.hardSolved / total) * 100}%` }} />
          </div>
          <div className="flex gap-4 mt-2 text-xs text-gray-500">
            <span><span className="text-green-400">■</span> Easy {Math.round((data.easySolved / total) * 100)}%</span>
            <span><span className="text-yellow-400">■</span> Medium {Math.round((data.mediumSolved / total) * 100)}%</span>
            <span><span className="text-red-400">■</span> Hard {Math.round((data.hardSolved / total) * 100)}%</span>
          </div>
        </div>
      )}

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h3 className="text-sm font-medium text-gray-400 mb-4">Weekly Progress</h3>
        <WeeklyBarChart data={data.weeklyProgress?.slice(-8)} dataKey="solved" />
      </div>

      {data.topicProgress?.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="text-sm font-medium text-gray-400 mb-4">Topic Coverage</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {data.topicProgress.slice(0, 12).map(t => (
              <div key={t.topic} className="flex items-center justify-between bg-gray-800 rounded-lg px-3 py-2">
                <span className="text-xs text-gray-300 capitalize">{t.topic}</span>
                <span className="text-xs font-medium text-white">{t.solved}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}