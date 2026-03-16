import { Lightbulb } from 'lucide-react';

export default function InsightCard({ title, insights = [] }) {
  const normalized = insights.map(insight => {
    if (typeof insight === 'string') return insight;
    if (typeof insight === 'object' && insight !== null) {
      return insight.message || insight.title || insight.text || 'No description';
    }
    return String(insight);
  });

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb size={18} className="text-yellow-400" />
        <h3 className="text-sm font-semibold text-white">{title || 'Insights'}</h3>
      </div>
      {normalized.length === 0 ? (
        <p className="text-gray-500 text-sm">No insights available yet.</p>
      ) : (
        <ul className="space-y-2">
          {normalized.map((insight, i) => (
            <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
              <span className="text-indigo-400 mt-0.5">•</span>
              <span>{insight}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}