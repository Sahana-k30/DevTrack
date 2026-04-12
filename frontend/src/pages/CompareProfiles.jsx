import { useMemo, useState } from 'react';

const GITHUB_METRICS = [
  { key: 'followers', label: 'Followers', lowerIsBetter: false },
  { key: 'following', label: 'Following', lowerIsBetter: false },
  { key: 'public_repos', label: 'Public Repos', lowerIsBetter: false },
  { key: 'public_gists', label: 'Public Gists', lowerIsBetter: false },
];

const LEETCODE_METRICS = [
  { key: 'totalSolved', label: 'Total Solved', lowerIsBetter: false },
  { key: 'easySolved', label: 'Easy Solved', lowerIsBetter: false },
  { key: 'mediumSolved', label: 'Medium Solved', lowerIsBetter: false },
  { key: 'hardSolved', label: 'Hard Solved', lowerIsBetter: false },
  { key: 'ranking', label: 'Ranking', lowerIsBetter: true },
];

const REQUIRED_LEETCODE_KEYS = ['totalSolved', 'easySolved', 'mediumSolved', 'hardSolved', 'ranking'];

async function safeJson(res) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

function hasLeetCodeStats(raw) {
  return REQUIRED_LEETCODE_KEYS.some((k) => raw?.[k] !== undefined && raw?.[k] !== null);
}

function toMessage(err, fallback = 'Comparison failed.') {
  if (typeof err === 'string') return err;
  if (err?.name === 'AbortError') return 'Request timed out. Please try again.';
  return err?.message || fallback;
}

function pickWinner(a, b, lowerIsBetter = false) {
  const x = Number(a ?? 0);
  const y = Number(b ?? 0);
  if (x === y) return 'tie';
  if (lowerIsBetter) return x < y ? 'a' : 'b';
  return x > y ? 'a' : 'b';
}

function getTip(platform, key, lowerIsBetter) {
  if (platform === 'github') {
    if (key === 'followers') return 'Post project updates, improve profile README, and share work regularly.';
    if (key === 'following') return 'Follow more relevant developers and engage with their repositories.';
    if (key === 'public_repos') return 'Build and publish more complete projects with clear docs.';
    if (key === 'public_gists') return 'Share useful snippets/tools as gists to increase visibility.';
    return 'Stay consistent with contributions and profile activity.';
  }

  // leetcode
  if (key === 'totalSolved') return 'Increase weekly solved count with a fixed daily target.';
  if (key === 'easySolved') return 'Use easy problems for speed and pattern reinforcement.';
  if (key === 'mediumSolved') return 'Focus on medium problems to improve interview readiness.';
  if (key === 'hardSolved') return 'Attempt 2-3 hard problems weekly and review editorials deeply.';
  if (key === 'ranking' && lowerIsBetter) return 'Improve rank by solving contests + medium/hard sets consistently.';
  return 'Practice consistently and review weak topics.';
}

function buildSuggestions(rows, who, platform) {
  const losingRows = rows
    .filter((r) => r.winner !== 'tie' && r.winner !== who)
    .map((r) => ({
      ...r,
      gap: Math.abs(Number(r.a ?? 0) - Number(r.b ?? 0)),
    }))
    .sort((x, y) => y.gap - x.gap)
    .slice(0, 3);

  if (!losingRows.length) return ['Great performance. Maintain consistency to keep the lead.'];

  return losingRows.map((r) => `${r.label}: ${getTip(platform, r.key, r.lowerIsBetter)}`);
}

export default function CompareProfiles() {
  const [platform, setPlatform] = useState('github');
  const [userA, setUserA] = useState('');
  const [userB, setUserB] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dataA, setDataA] = useState(null);
  const [dataB, setDataB] = useState(null);

  const metrics = useMemo(
    () => (platform === 'github' ? GITHUB_METRICS : LEETCODE_METRICS),
    [platform]
  );

  const fetchGithub = async (username) => {
    const clean = username.trim();
    const res = await fetch(`https://api.github.com/users/${encodeURIComponent(clean)}`);
    const raw = await safeJson(res);

    if (res.status === 404 || raw?.message === 'Not Found') {
      throw new Error(`Wrong GitHub username "${clean}". Please check and try again.`);
    }
    if (res.status === 403) {
      throw new Error('GitHub API rate limit reached. Please try again later.');
    }
    if (!res.ok) {
      throw new Error(`GitHub request failed (${res.status}).`);
    }
    return raw;
  };

  const fetchLeetCode = async (username) => {
    const clean = username.trim();

    let res;
    try {
      res = await fetch(`https://alfa-leetcode-api.onrender.com/${encodeURIComponent(clean)}`);
    } catch {
      throw new Error('Unable to reach LeetCode service. Check internet/server and try again.');
    }

    const raw = await safeJson(res);

    if (res.status === 404) {
      throw new Error(`Wrong LeetCode username "${clean}". Please check and try again.`);
    }
    if (res.status >= 500) {
      throw new Error('LeetCode service is temporarily unavailable. Try again later.');
    }
    if (!res.ok) {
      throw new Error(`LeetCode request failed (${res.status}).`);
    }

    const apiMessage =
      raw?.message ||
      raw?.error ||
      (Array.isArray(raw?.errors) ? raw.errors.join(', ') : '');

    const explicitNotFound =
      raw?.status === 'error' ||
      raw?.success === false ||
      /not\s*found|does\s*not\s*exist|invalid\s*user/i.test(String(apiMessage));

    if (explicitNotFound) {
      throw new Error(`Wrong LeetCode username "${clean}". Please check and try again.`);
    }

    if (!raw || typeof raw !== 'object' || !hasLeetCodeStats(raw)) {
      throw new Error(
        `Wrong LeetCode username "${clean}" or profile data is unavailable. Please verify the username.`
      );
    }

    return raw;
  };

  const onCompare = async (e) => {
    e.preventDefault();
    setError('');
    setDataA(null);
    setDataB(null);

    const aName = userA.trim();
    const bName = userB.trim();

    if (!aName || !bName) {
      setError('Please enter both usernames.');
      return;
    }

    if (aName.toLowerCase() === bName.toLowerCase()) {
      setError('Please enter two different usernames.');
      return;
    }

    try {
      setLoading(true);
      const fetcher = platform === 'github' ? fetchGithub : fetchLeetCode;
      const [a, b] = await Promise.all([fetcher(aName), fetcher(bName)]);
      setDataA(a);
      setDataB(b);
    } catch (err) {
      setError(toMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const displayName = (d, fallback) => d?.name || d?.username || d?.userName || fallback;
  const avatar = (d) => d?.avatar_url || d?.avatar || 'https://via.placeholder.com/64?text=User';

  const rows = useMemo(() => {
    if (!dataA || !dataB) return [];
    return metrics.map((m) => {
      const a = dataA?.[m.key] ?? 0;
      const b = dataB?.[m.key] ?? 0;
      const winner = pickWinner(a, b, m.lowerIsBetter);
      return { ...m, a, b, winner };
    });
  }, [metrics, dataA, dataB]);

  const summary = useMemo(() => {
    const winsA = rows.filter((r) => r.winner === 'a').length;
    const winsB = rows.filter((r) => r.winner === 'b').length;
    const ties = rows.filter((r) => r.winner === 'tie').length;
    const overall = winsA === winsB ? 'tie' : winsA > winsB ? 'a' : 'b';
    return { winsA, winsB, ties, overall };
  }, [rows]);

  const tipsA = useMemo(() => buildSuggestions(rows, 'a', platform), [rows, platform]);
  const tipsB = useMemo(() => buildSuggestions(rows, 'b', platform), [rows, platform]);

  return (
    <div className="p-6 md:p-8 text-gray-100">
      <h2 className="text-2xl font-bold mb-1">Profile Comparison</h2>
      <p className="text-sm text-gray-400 mb-6">
        Compare two GitHub or LeetCode profiles side by side.
      </p>

      <form
        onSubmit={onCompare}
        className="bg-gray-900 border border-gray-800 rounded-xl p-4 md:p-6 space-y-4"
      >
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setPlatform('github')}
            className={`px-4 py-2 rounded-lg text-sm ${
              platform === 'github'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-800 text-gray-300'
            }`}
          >
            Compare GitHub
          </button>
          <button
            type="button"
            onClick={() => setPlatform('leetcode')}
            className={`px-4 py-2 rounded-lg text-sm ${
              platform === 'leetcode'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-800 text-gray-300'
            }`}
          >
            Compare LeetCode
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            value={userA}
            onChange={(e) => setUserA(e.target.value)}
            placeholder={`${platform === 'github' ? 'GitHub' : 'LeetCode'} username 1`}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 outline-none focus:border-indigo-500"
          />
          <input
            value={userB}
            onChange={(e) => setUserB(e.target.value)}
            placeholder={`${platform === 'github' ? 'GitHub' : 'LeetCode'} username 2`}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 outline-none focus:border-indigo-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 px-4 py-2 rounded-lg text-sm"
        >
          {loading ? 'Comparing...' : 'Compare'}
        </button>

        {error && <p className="text-red-400 text-sm">{error}</p>}
      </form>

      {dataA && dataB && (
        <div className="mt-6 bg-gray-900 border border-gray-800 rounded-xl p-4 md:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="flex items-center gap-3 bg-gray-800 rounded-lg p-3">
              <img src={avatar(dataA)} alt="user A" className="w-12 h-12 rounded-full" />
              <div>
                <p className="font-semibold">{displayName(dataA, userA)}</p>
                <p className="text-xs text-gray-400">@{userA}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-gray-800 rounded-lg p-3">
              <img src={avatar(dataB)} alt="user B" className="w-12 h-12 rounded-full" />
              <div>
                <p className="font-semibold">{displayName(dataB, userB)}</p>
                <p className="text-xs text-gray-400">@{userB}</p>
              </div>
            </div>
          </div>

          {/* Winner summary card */}
          <div className="mb-6 bg-gray-800 rounded-lg p-4">
            <p className="text-sm text-gray-300 mb-2">Result Summary</p>
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div className="bg-gray-900 rounded p-3">
                <p className="text-gray-400">User 1 Wins</p>
                <p className="text-lg font-semibold">{summary.winsA}</p>
              </div>
              <div className="bg-gray-900 rounded p-3">
                <p className="text-gray-400">User 2 Wins</p>
                <p className="text-lg font-semibold">{summary.winsB}</p>
              </div>
              <div className="bg-gray-900 rounded p-3">
                <p className="text-gray-400">Ties</p>
                <p className="text-lg font-semibold">{summary.ties}</p>
              </div>
            </div>
            <p className="mt-3 text-sm">
              Overall Winner:{' '}
              <span className="font-semibold text-indigo-300">
                {summary.overall === 'tie'
                  ? 'Tie'
                  : summary.overall === 'a'
                  ? displayName(dataA, userA)
                  : displayName(dataB, userB)}
              </span>
            </p>
          </div>

          <div className="overflow-x-auto mb-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-400 border-b border-gray-800">
                  <th className="text-left py-2">Metric</th>
                  <th className="text-left py-2">User 1</th>
                  <th className="text-left py-2">User 2</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.key} className="border-b border-gray-800">
                    <td className="py-2">{r.label}</td>
                    <td className={`py-2 ${r.winner === 'a' ? 'text-green-400 font-semibold' : ''}`}>{r.a}</td>
                    <td className={`py-2 ${r.winner === 'b' ? 'text-green-400 font-semibold' : ''}`}>{r.b}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Improvement suggestions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-800 rounded-lg p-4">
              <p className="font-semibold mb-2">How @{userA} can improve</p>
              <ul className="list-disc pl-5 space-y-1 text-sm text-gray-300">
                {tipsA.map((tip, idx) => <li key={`a-tip-${idx}`}>{tip}</li>)}
              </ul>
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <p className="font-semibold mb-2">How @{userB} can improve</p>
              <ul className="list-disc pl-5 space-y-1 text-sm text-gray-300">
                {tipsB.map((tip, idx) => <li key={`b-tip-${idx}`}>{tip}</li>)}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}