export default function StatCard({ title, value, subtitle, icon: Icon, color = 'indigo' }) {
  const colors = {
    indigo: 'text-indigo-400 bg-indigo-400/10',
    green:  'text-green-400 bg-green-400/10',
    yellow: 'text-yellow-400 bg-yellow-400/10',
    red:    'text-red-400 bg-red-400/10',
    blue:   'text-blue-400 bg-blue-400/10',
    purple: 'text-purple-400 bg-purple-400/10',  // ← was missing
  };

  // Fallback to indigo if an unknown color is passed
  const colorClass = colors[color] ?? colors.indigo;

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex items-start gap-4">
      {Icon && (
        <div className={`p-2 rounded-lg ${colorClass}`}>
          <Icon size={20} className={colorClass.split(' ')[0]} />
        </div>
      )}
      <div>
        <p className="text-xs text-gray-500 uppercase tracking-wide">{title}</p>
        <p className="text-2xl font-bold text-white mt-1">{value ?? '—'}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
      </div>
    </div>
  );
}