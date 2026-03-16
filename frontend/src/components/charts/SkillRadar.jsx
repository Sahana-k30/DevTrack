import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';

export function SkillRadar({ data }) {
  if (!data) return null;

  const chartData = [
    { subject: 'Consistency', value: data.consistency },
    { subject: 'Problem Solving', value: data.problemSolving },
    { subject: 'Algorithm Depth', value: data.algorithmDepth },
    { subject: 'Projects', value: data.projectBuilding },
    { subject: 'Competitive', value: data.competitiveProgramming },
    { subject: 'Open Source', value: data.openSourceContrib },
  ];

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <h3 className="text-sm font-medium text-gray-400 mb-2">Skill Radar</h3>
      <ResponsiveContainer width="100%" height={260}>
        <RadarChart data={chartData}>
          <PolarGrid stroke="#374151" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 11 }} />
          <Radar name="Score" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
          <Tooltip
            contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 8, fontSize: 12 }}
            formatter={(val) => [`${Math.round(val)}/100`]}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}