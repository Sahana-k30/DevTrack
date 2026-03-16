import { useEffect, useState } from 'react';
import api from '../utils/api';
import StatCard from '../components/shared/StatCard';
import InsightCard from '../components/shared/InsightCard';
import { Activity, GitCommit, Code2, Terminal } from 'lucide-react';

export default function Dashboard() {
  const [github, setGithub] = useState(null);
  const [leetcode, setLeetcode] = useState(null);
  const [codeforces, setCodeforces] = useState(null);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      const results = await Promise.allSettled([
        api.get('/api/github/analytics'),
        api.get('/api/leetcode/analytics'),
        api.get('/api/codeforces/analytics'),
        api.get('/api/analytics/insights'),
      ]);

      if (results[0].status === 'fulfilled') setGithub(results[0].value.data);
      if (results[1].status === 'fulfilled') setLeetcode(results[1].value.data);
      if (results[2].status === 'fulfilled') setCodeforces(results[2].value.data);
      if (results[3].status === 'fulfilled') setInsights(results[3].value.data);
      setLoading(false);
    };
    fetchAll();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-700 border-t-indigo-500" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white">Overview</h2>
        <p className="text-gray-500 text-sm mt-1">Your cross-platform developer stats</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Commits"
          value={github?.totalCommits ?? '—'}
          icon={GitCommit}
          color="indigo"
        />
        <StatCard
          title="LeetCode Solved"
          value={leetcode?.totalSolved ?? '—'}
          icon={Code2}
          color="green"
        />
        <StatCard
          title="CF Rating"
          value={codeforces?.rating ?? '—'}
          icon={Terminal}
          color="yellow"
        />
        <StatCard
          title="GitHub Repos"
          value={github?.repos?.length ?? '—'}
          icon={Activity}
          color="blue"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LeetCode Summary */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4">LeetCode Progress</h3>
          {leetcode ? (
            <div className="space-y-3">
              {[
                { label: 'Easy', solved: leetcode.easySolved, total: leetcode.easyTotal, color: 'bg-green-500' },
                { label: 'Medium', solved: leetcode.mediumSolved, total: leetcode.mediumTotal, color: 'bg-yellow-500' },
                { label: 'Hard', solved: leetcode.hardSolved, total: leetcode.hardTotal, color: 'bg-red-500' },
              ].map(({ label, solved, total, color }) => (
                <div key={label}>
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>{label}</span>
                    <span>{solved}/{total}</span>
                  </div>
                  <div className="h-2 bg-gray-800 rounded-full">
                    <div
                      className={`h-2 rounded-full ${color}`}
                      style={{ width: `${total ? (solved / total) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">Set your LeetCode username to see progress.</p>
          )}
        </div>

        {/* Insights */}
        <InsightCard
          title="Insights & Recommendations"
          insights={insights.length > 0 ? insights : [
            'Add your LeetCode username to get problem-solving insights',
            'Add your Codeforces handle to track contest performance',
            'GitHub data refreshes every 6 hours automatically',
          ]}
        />
      </div>

      {/* GitHub Weekly Commits */}
      {github?.weeklyCommits?.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Weekly Commits (Last 12 Weeks)</h3>
          <div className="flex items-end gap-2 h-24">
            {github.weeklyCommits.slice(-12).map((w, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full bg-indigo-500 rounded-sm"
                  style={{ height: `${Math.max(4, (w.count / Math.max(...github.weeklyCommits.map(x => x.count), 1)) * 80)}px` }}
                />
                <span className="text-xs text-gray-600">W{i + 1}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}