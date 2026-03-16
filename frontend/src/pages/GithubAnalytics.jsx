import { useEffect, useState } from 'react';
import axios from 'axios';
import StatCard from '../components/shared/StatCard';
import { WeeklyBarChart } from '../components/charts/WeeklyBarChart';
import { LanguageDonut } from '../components/charts/LanguageDonut';

export default function GitHubAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/github/analytics')
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-gray-500">Loading GitHub data…</p>;
  if (!data) return <p className="text-gray-500">No GitHub data yet. Try refreshing.</p>;

  const languages = Object.entries(data.languageDistribution || {})
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-white">GitHub Analytics</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Commits" value={data.totalCommits} />
        <StatCard label="Repos" value={data.repos?.length} />
        <StatCard label="Total PRs" value={data.totalPRs} />
        <StatCard label="Total Stars" value={data.totalStars} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <StatCard label="Current Streak" value={`${data.contributionStreak?.current} days`} />
        <StatCard label="Longest Streak" value={`${data.contributionStreak?.longest} days`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="text-sm font-medium text-gray-400 mb-4">Weekly Commits (last 8 weeks)</h3>
          <WeeklyBarChart data={data.weeklyCommits?.slice(-8)} dataKey="count" />
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="text-sm font-medium text-gray-400 mb-4">Language Distribution</h3>
          <LanguageDonut data={languages} />
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h3 className="text-sm font-medium text-gray-400 mb-4">Top Repositories</h3>
        <div className="space-y-2">
          {data.repos?.slice(0, 8).map(repo => (
            <div key={repo.name} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
              <div>
                <a href={repo.url} target="_blank" rel="noopener noreferrer"
                  className="text-sm font-medium text-blue-400 hover:underline">{repo.name}</a>
                <p className="text-xs text-gray-500">{repo.description}</p>
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-500">
                {repo.language && <span className="bg-gray-800 px-2 py-0.5 rounded">{repo.language}</span>}
                <span>⭐ {repo.stars}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}