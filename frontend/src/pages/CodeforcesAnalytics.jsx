import { useEffect, useState } from 'react';
import api from '../utils/api';
import StatCard from '../components/shared/StatCard';
import { Terminal, Trophy } from 'lucide-react';

export default function CodeforcesAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/codeforces/analytics')
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-700 border-t-indigo-500" />
    </div>
  );

  if (!data) return (
    <p className="text-gray-500">No Codeforces data yet. Go to Codeforces page to connect your account.</p>
  );

  const tags = Object.entries(data.languageDistribution || {})
    .sort((a, b) => b[1] - a[1]).slice(0, 10);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Codeforces Analytics</h2>
        <span className="text-xs text-gray-500">{data.codeforcesUsername}</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Current Rating" value={data.rating} icon={Trophy} color="yellow" />
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
                <div key={i} className="flex-1 group relative">
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gray-700 text-xs text-white px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap">
                    {r.rating}
                  </div>
                  <div
                    className="w-full bg-yellow-500 hover:bg-yellow-400 rounded-sm"
                    style={{ height: `${Math.max(4, ((r.rating - min) / range) * 112)}px` }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {tags.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Language Distribution</h3>
          <div className="space-y-2">
            {tags.map(([lang, count]) => {
              const total = tags.reduce((s, [, c]) => s + c, 0);
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
    </div>
  );
}