import { useEffect, useState } from 'react';
import api from '../utils/api';
import { Clock } from 'lucide-react';

const platformColors = {
  github: 'bg-gray-700 text-gray-200',
  leetcode: 'bg-yellow-900 text-yellow-300',
  codeforces: 'bg-blue-900 text-blue-300',
};

const platformDots = {
  github: 'bg-indigo-400',
  leetcode: 'bg-yellow-400',
  codeforces: 'bg-blue-400',
};

export default function Timeline() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      const results = await Promise.allSettled([
        api.get('/api/github/analytics'),
        api.get('/api/leetcode/analytics'),
        api.get('/api/codeforces/analytics'),
      ]);

      const timeline = [];

      // GitHub repos
      if (results[0].status === 'fulfilled') {
        const gh = results[0].value.data;
        gh?.repos?.slice(0, 8).forEach(repo => {
          if (repo.createdAt) {
            timeline.push({
              date: new Date(repo.createdAt),
              platform: 'github',
              title: `Created repo: ${repo.name}`,
              description: repo.description || `${repo.language || 'No language'} · ⭐ ${repo.stars}`,
            });
          }
        });
      }

      // Codeforces contests
      if (results[2].status === 'fulfilled') {
        const cf = results[2].value.data;
        cf?.ratingHistory?.forEach(r => {
          if (r.date) {
            timeline.push({
              date: new Date(r.date),
              platform: 'codeforces',
              title: r.contestName || 'Contest participated',
              description: `Rating: ${r.rating} · Rank: ${r.rank}`,
            });
          }
        });
      }

      // LeetCode recent submissions
      if (results[1].status === 'fulfilled') {
        const lc = results[1].value.data;
        lc?.recentSubmissions?.slice(0, 5).forEach(sub => {
          if (sub.timestamp) {
            timeline.push({
              date: new Date(sub.timestamp),
              platform: 'leetcode',
              title: `Solved: ${sub.title}`,
              description: 'Accepted submission',
            });
          }
        });
      }

      timeline.sort((a, b) => b.date - a.date);
      setEvents(timeline);
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
        <h2 className="text-xl font-semibold text-white">Developer Timeline</h2>
        <p className="text-gray-500 text-sm mt-1">Your journey across all platforms</p>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-gray-400">
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-indigo-400 inline-block" />GitHub</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-yellow-400 inline-block" />LeetCode</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />Codeforces</span>
      </div>

      {events.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
          <Clock size={32} className="text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">No timeline events yet.</p>
          <p className="text-gray-600 text-xs mt-1">Connect your accounts and refresh data to build your timeline.</p>
        </div>
      ) : (
        <div className="relative max-w-2xl">
          <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-800" />
          <div className="space-y-3">
            {events.map((event, i) => (
              <div key={i} className="flex gap-4 pl-10 relative">
                <div className={`absolute left-2 top-3.5 w-3 h-3 rounded-full border-2 border-gray-900 ${platformDots[event.platform]}`} />
                <div className="flex-1 bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate">{event.title}</p>
                      {event.description && (
                        <p className="text-xs text-gray-500 mt-0.5">{event.description}</p>
                      )}
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${platformColors[event.platform]}`}>
                      {event.platform}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    {event.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}