import { useEffect, useMemo, useState } from 'react';
import api from '../utils/api';
import { Clock, Trophy } from 'lucide-react';

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

function toValidDate(value) {
  if (!value) return null;
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value;

  if (typeof value === 'number') {
    const ms = value < 1e12 ? value * 1000 : value;
    const d = new Date(ms);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  if (typeof value === 'string' && /^\d+$/.test(value)) {
    const num = Number(value);
    const ms = num < 1e12 ? num * 1000 : num;
    const d = new Date(ms);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function dateKey(d) {
  return d.toISOString().slice(0, 10);
}

function calcLeetCodeStreakFromCalendar(submissionCalendar) {
  if (!submissionCalendar || typeof submissionCalendar !== 'object') return { longest: 0, recent: 0 };

  const activeDays = [];

  Object.entries(submissionCalendar).forEach(([ts, count]) => {
    if (Number(count) > 0) {
      const d = toValidDate(Number(ts));
      if (d) activeDays.push(dateKey(d));
    }
  });

  if (!activeDays.length) return { longest: 0, recent: 0 };

  const uniqueSorted = [...new Set(activeDays)].sort(); // yyyy-mm-dd lexical sort works
  let longest = 1;
  let run = 1;

  for (let i = 1; i < uniqueSorted.length; i += 1) {
    const prev = new Date(uniqueSorted[i - 1]);
    const curr = new Date(uniqueSorted[i]);
    const diff = (curr - prev) / (1000 * 60 * 60 * 24);
    if (diff === 1) run += 1;
    else run = 1;
    if (run > longest) longest = run;
  }

  // recent streak ending at latest active date
  let recent = 1;
  for (let i = uniqueSorted.length - 1; i > 0; i -= 1) {
    const prev = new Date(uniqueSorted[i - 1]);
    const curr = new Date(uniqueSorted[i]);
    const diff = (curr - prev) / (1000 * 60 * 60 * 24);
    if (diff === 1) recent += 1;
    else break;
  }

  return { longest, recent };
}

function extractLeetCodeSpecial(lc) {
  const list = [];
  if (!lc || typeof lc !== 'object') return list;

  const directStreakCandidates = [
    lc.currentStreak,
    lc.streak,
    lc.activeDays,
    lc.dailyStreak,
  ].filter((v) => Number.isFinite(Number(v)));

  let streak = directStreakCandidates.length ? Math.max(...directStreakCandidates.map(Number)) : 0;

  if (!streak && lc.submissionCalendar) {
    const { recent, longest } = calcLeetCodeStreakFromCalendar(lc.submissionCalendar);
    streak = Math.max(recent, longest);
  }

  if (streak >= 50) list.push(`🔥 ${streak} days of problem solving`);
  else if (streak >= 30) list.push(`🔥 ${streak} days streak`);

  const totalSolved = Number(lc.totalSolved ?? 0);
  if (totalSolved >= 1000) list.push(`✅ Solved ${totalSolved} problems`);
  else if (totalSolved >= 500) list.push(`✅ Solved ${totalSolved}+ problems`);
  else if (totalSolved >= 100) list.push(`✅ Crossed ${totalSolved} solved problems`);

  return list;
}

function extractGithubSpecial(gh) {
  const list = [];
  if (!gh || typeof gh !== 'object') return list;

  const rawBadges =
    gh.badges ||
    gh.achievements ||
    gh.profileBadges ||
    gh.githubBadges ||
    gh.trophies ||
    [];

  if (Array.isArray(rawBadges)) {
    rawBadges.forEach((b) => {
      if (typeof b === 'string') list.push(`🏅 ${b}`);
      else if (b?.title) list.push(`🏅 ${b.title}`);
      else if (b?.name) list.push(`🏅 ${b.name}`);
    });
  } else if (rawBadges && typeof rawBadges === 'object') {
    Object.entries(rawBadges).forEach(([k, v]) => {
      if (v) list.push(`🏅 ${k}`);
    });
  }

  return [...new Set(list)];
}

export default function Timeline() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [special, setSpecial] = useState({ github: [], leetcode: [] });

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const results = await Promise.allSettled([
          api.get('/api/github/analytics'),
          api.get('/api/leetcode/analytics'),
          api.get('/api/codeforces/analytics'),
        ]);

        const timeline = [];

        let ghData = null;
        let lcData = null;

        if (results[0].status === 'fulfilled') {
          const gh = results[0].value.data;
          ghData = gh;
          gh?.repos?.slice(0, 20).forEach((repo) => {
            const d = toValidDate(repo.createdAt);
            if (d) {
              timeline.push({
                date: d,
                platform: 'github',
                title: `Created repo: ${repo.name}`,
              });
            }
          });
        }

        if (results[2].status === 'fulfilled') {
          const cf = results[2].value.data;
          cf?.ratingHistory?.forEach((r) => {
            const d = toValidDate(r.date);
            if (d) {
              timeline.push({
                date: d,
                platform: 'codeforces',
                title: r.contestName || 'Contest participated',
              });
            }
          });
        }

        if (results[1].status === 'fulfilled') {
          const lc = results[1].value.data;
          lcData = lc;
          lc?.recentSubmissions?.forEach((sub) => {
            const d = toValidDate(sub.timestamp);
            if (d) {
              timeline.push({
                date: d,
                platform: 'leetcode',
                title: `Solved: ${sub.title}`,
              });
            }
          });
        }

        timeline.sort((a, b) => b.date - a.date);
        setEvents(timeline);

        setSpecial({
          github: extractGithubSpecial(ghData),
          leetcode: extractLeetCodeSpecial(lcData),
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  const monthlyAchievements = useMemo(() => {
    const map = new Map();

    events.forEach((e) => {
      if (!(e.date instanceof Date) || Number.isNaN(e.date.getTime())) return;
      const y = e.date.getFullYear();
      const m = e.date.getMonth() + 1;
      const key = `${y}-${String(m).padStart(2, '0')}`;

      if (!map.has(key)) {
        map.set(key, {
          key,
          label: e.date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
          total: 0,
          github: 0,
          leetcode: 0,
          codeforces: 0,
          highlights: [],
        });
      }

      const item = map.get(key);
      item.total += 1;
      item[e.platform] += 1;
      if (item.highlights.length < 3) item.highlights.push(e.title);
    });

    return [...map.values()].sort((a, b) => b.key.localeCompare(a.key));
  }, [events]);

  const yearlyAchievements = useMemo(() => {
    const map = new Map();

    events.forEach((e) => {
      if (!(e.date instanceof Date) || Number.isNaN(e.date.getTime())) return;
      const y = String(e.date.getFullYear());

      if (!map.has(y)) {
        map.set(y, {
          key: y,
          label: y,
          total: 0,
          github: 0,
          leetcode: 0,
          codeforces: 0,
        });
      }

      const item = map.get(y);
      item.total += 1;
      item[e.platform] += 1;
    });

    return [...map.values()].sort((a, b) => b.key.localeCompare(a.key));
  }, [events]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-700 border-t-indigo-500" />
      </div>
    );
  }

  if (!events.length && !special.github.length && !special.leetcode.length) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
        <Clock size={32} className="text-gray-600 mx-auto mb-3" />
        <p className="text-gray-400 text-sm">No timeline events yet.</p>
        <p className="text-gray-600 text-xs mt-1">Connect your accounts and refresh data to build your timeline.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-white">Achievements Timeline</h2>
        <p className="text-gray-500 text-sm mt-1">Monthly and yearly achievement summary</p>
      </div>

      {/* Special achievements */}
      <section>
        <h3 className="text-sm font-semibold text-gray-300 mb-3">Special Achievements</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Trophy size={16} className="text-yellow-400" />
              <p className="text-white font-medium">LeetCode Highlights</p>
            </div>
            {special.leetcode.length ? (
              <ul className="list-disc pl-5 text-sm text-gray-300 space-y-1">
                {special.leetcode.map((item, idx) => (
                  <li key={`lc-special-${idx}`}>{item}</li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-gray-500">No special LeetCode achievements found.</p>
            )}
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Trophy size={16} className="text-indigo-400" />
              <p className="text-white font-medium">GitHub Badges</p>
            </div>
            {special.github.length ? (
              <div className="flex flex-wrap gap-2">
                {special.github.map((badge, idx) => (
                  <span
                    key={`gh-badge-${idx}`}
                    className="px-2 py-1 rounded-full text-xs bg-indigo-900/50 text-indigo-200 border border-indigo-700"
                  >
                    {badge}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-500">No GitHub badges found from current API data.</p>
            )}
          </div>
        </div>
      </section>

      {/* Month-Year Achievements */}
      <section>
        <h3 className="text-sm font-semibold text-gray-300 mb-3">Month-Year Achievements</h3>
        <div className="space-y-3">
          {monthlyAchievements.map((m) => (
            <div key={m.key} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <p className="text-white font-medium">{m.label}</p>
                <span className="text-xs text-gray-400">{m.total} achievements</span>
              </div>

              <div className="flex gap-2 mt-2 text-xs">
                <span className={`px-2 py-0.5 rounded-full ${platformColors.github}`}>GitHub: {m.github}</span>
                <span className={`px-2 py-0.5 rounded-full ${platformColors.leetcode}`}>LeetCode: {m.leetcode}</span>
                <span className={`px-2 py-0.5 rounded-full ${platformColors.codeforces}`}>Codeforces: {m.codeforces}</span>
              </div>

              {m.highlights.length > 0 && (
                <ul className="mt-3 list-disc pl-5 text-xs text-gray-400 space-y-1">
                  {m.highlights.map((h, idx) => (
                    <li key={`${m.key}-${idx}`}>{h}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Year-wise Achievements */}
      <section>
        <h3 className="text-sm font-semibold text-gray-300 mb-3">Year-wise Achievements</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {yearlyAchievements.map((y) => (
            <div key={y.key} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <p className="text-white font-medium">{y.label}</p>
              <p className="text-xs text-gray-400 mt-1">Total: {y.total}</p>
              <div className="mt-3 space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${platformDots.github}`} />
                  <span className="text-gray-300">GitHub: {y.github}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${platformDots.leetcode}`} />
                  <span className="text-gray-300">LeetCode: {y.leetcode}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${platformDots.codeforces}`} />
                  <span className="text-gray-300">Codeforces: {y.codeforces}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}