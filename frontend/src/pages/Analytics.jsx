import { useEffect, useState } from 'react';
import api from '../utils/api';
import InsightCard from '../components/shared/InsightCard';
import StatCard from '../components/shared/StatCard';
import { BarChart2, TrendingUp, AlertTriangle } from 'lucide-react';

export default function Analytics() {
  const [skillRadar, setSkillRadar] = useState(null);
  const [insights, setInsights] = useState([]);
  const [productivity, setProductivity] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      const results = await Promise.allSettled([
        api.get('/api/analytics/skill-radar'),
        api.get('/api/analytics/insights'),
        api.get('/api/analytics/productivity'),
      ]);
      if (results[0].status === 'fulfilled') setSkillRadar(results[0].value.data);
      if (results[1].status === 'fulfilled') setInsights(results[1].value.data);
      if (results[2].status === 'fulfilled') setProductivity(results[2].value.data);
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
        <h2 className="text-xl font-semibold text-white">Analytics</h2>
        <p className="text-gray-500 text-sm mt-1">Skill gaps, productivity insights, and recommendations</p>
      </div>

      {productivity && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <StatCard title="Productivity Score" value={`${productivity.score}/100`} icon={TrendingUp} color="indigo" />
          <StatCard title="Commits (4 weeks)" value={productivity.recentCommits} icon={BarChart2} color="green" />
          <StatCard title="Commit Trend" value={`${productivity.commitTrend > 0 ? '+' : ''}${productivity.commitTrend}%`} icon={TrendingUp} color={productivity.commitTrend >= 0 ? 'green' : 'red'} />
        </div>
      )}

      {/* Skill Radar */}
      {skillRadar && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Skill Distribution</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Object.entries(skillRadar).map(([skill, score]) => (
              <div key={skill} className="p-3 bg-gray-800 rounded-lg">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-300 capitalize">{skill}</span>
                  <span className="text-indigo-400">{score}/100</span>
                </div>
                <div className="h-1.5 bg-gray-700 rounded-full">
                  <div className="h-1.5 bg-indigo-500 rounded-full" style={{ width: `${score}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Insights */}
      <InsightCard
        title="Recommendations"
        insights={insights.length > 0 ? insights : [
          'Connect all platforms to get personalized recommendations',
          'Solve more Hard problems on LeetCode to improve your rating',
          'Maintain consistent daily commits to improve your streak',
          'Practice Dynamic Programming — it appears in 40% of interview questions',
        ]}
      />

      {/* Skill Gaps */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle size={16} className="text-yellow-400" />
          <h3 className="text-sm font-semibold text-white">Skill Gap Analysis</h3>
        </div>
        {skillRadar ? (
          <div className="space-y-2">
            {Object.entries(skillRadar)
              .filter(([, score]) => score < 50)
              .map(([skill, score]) => (
                <div key={skill} className="flex items-center justify-between p-3 bg-yellow-950 border border-yellow-900 rounded-lg">
                  <span className="text-sm text-yellow-300 capitalize">{skill}</span>
                  <span className="text-xs text-yellow-400">Score: {score}/100 — needs improvement</span>
                </div>
              ))}
            {Object.entries(skillRadar).filter(([, score]) => score < 50).length === 0 && (
              <p className="text-gray-500 text-sm">No major skill gaps detected. Keep it up!</p>
            )}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">Connect your accounts to see skill gap analysis.</p>
        )}
      </div>
    </div>
  );
}