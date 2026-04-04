import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { GitCommit, Code2, Terminal, BarChart2, Clock, TrendingUp, ArrowRight, Zap, User, Star } from 'lucide-react';

const dashStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');

  .db-root { font-family: 'DM Sans', sans-serif; }
  .db-root * { box-sizing: border-box; }
  .db-display { font-family: 'Syne', sans-serif; }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes shimmer {
    from { background-position: -200% center; }
    to   { background-position: 200% center; }
  }
  @keyframes pulseRing {
    0%   { transform: scale(1); opacity: 1; }
    100% { transform: scale(1.6); opacity: 0; }
  }

  .db-fade-1 { animation: fadeUp 0.5s 0.0s ease both; }
  .db-fade-2 { animation: fadeUp 0.5s 0.08s ease both; }
  .db-fade-3 { animation: fadeUp 0.5s 0.16s ease both; }
  .db-fade-4 { animation: fadeUp 0.5s 0.24s ease both; }
  .db-fade-5 { animation: fadeUp 0.5s 0.32s ease both; }

  .platform-card {
    background: #fff;
    border: 1.5px solid #f0f0f0;
    border-radius: 22px;
    padding: 28px;
    display: flex;
    flex-direction: column;
    transition: transform 0.28s cubic-bezier(.34,1.56,.64,1), box-shadow 0.28s, border-color 0.28s;
    position: relative;
    overflow: hidden;
  }
  .platform-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 16px 44px rgba(0,0,0,0.09);
  }

  .go-btn {
    display: flex; align-items: center; justify-content: center; gap: 8px;
    border: none; border-radius: 11px; padding: 13px 20px;
    font-size: 14px; font-weight: 700; cursor: pointer;
    font-family: 'DM Sans', sans-serif; margin-top: auto;
    transition: transform 0.18s, box-shadow 0.18s, filter 0.18s;
  }
  .go-btn:hover { transform: translateY(-2px); filter: brightness(1.08); box-shadow: 0 8px 22px rgba(0,0,0,0.18); }
  .go-btn:active { transform: translateY(0); }

  .quick-link {
    display: flex; align-items: center; justify-content: space-between;
    padding: 14px 16px; border-radius: 12px;
    background: #fafaf8; border: 1.5px solid #f0f0f0;
    cursor: pointer; transition: background 0.2s, border-color 0.2s, transform 0.18s;
    text-align: left; font-family: 'DM Sans', sans-serif;
  }
  .quick-link:hover { background: #fff; border-color: #e0e0e0; transform: translateX(3px); }

  .tag-chip {
    display: inline-flex; align-items: center; gap: 5px;
    border-radius: 100px; padding: 4px 12px;
    font-size: 11px; font-weight: 700; letter-spacing: 0.04em;
  }

  .user-card {
    background: linear-gradient(135deg, #0d0d0d 0%, #1a1120 100%);
    border-radius: 22px;
    padding: 32px;
    position: relative;
    overflow: hidden;
    color: #fff;
  }

  .live-dot {
    width: 8px; height: 8px; border-radius: 50%; background: #10b981;
    position: relative; display: inline-block;
  }
  .live-dot::after {
    content: '';
    position: absolute; inset: 0; border-radius: 50%;
    background: #10b981;
    animation: pulseRing 1.5s ease-out infinite;
  }
`;

const GithubIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
  </svg>
);

const platforms = [
  {
    icon: GitCommit,
    path: '/github',
    accent: '#3b82f6',
    bg: '#eff6ff',
    border: '#bfdbfe',
    btnBg: 'linear-gradient(135deg, #3b82f6, #2563eb)',
    btnColor: '#fff',
    title: 'GitHub Analytics',
    subtitle: 'Commits · Repos · PRs · Stars',
    tag: 'AUTO-SYNCED',
    tagColor: '#3b82f6',
    tagBg: '#eff6ff',
    tagBorder: '#bfdbfe',
    description: 'See your full GitHub activity — commits over time, language distribution, top repositories, pull requests, and weekly contribution graphs. Your data is automatically refreshed every 6 hours.',
    highlights: ['Total commits & weekly trend', 'Language distribution', 'Top repositories with stars', 'Pull request count'],
    glow: 'rgba(59,130,246,0.12)',
  },
  {
    icon: Code2,
    path: '/leetcode',
    accent: '#10b981',
    bg: '#ecfdf5',
    border: '#a7f3d0',
    btnBg: 'linear-gradient(135deg, #10b981, #059669)',
    btnColor: '#fff',
    title: 'LeetCode Insights',
    subtitle: 'Easy · Medium · Hard · Streaks',
    tag: 'USERNAME REQUIRED',
    tagColor: '#059669',
    tagBg: '#ecfdf5',
    tagBorder: '#a7f3d0',
    description: 'Track your problem-solving progress across all difficulty levels. Monitor your daily streaks, global ranking, weekly problems solved, and see your most recent accepted submissions.',
    highlights: ['Easy / Medium / Hard breakdown', 'Daily and longest streaks', 'Global ranking', 'Recent accepted submissions'],
    glow: 'rgba(16,185,129,0.12)',
  },
  {
    icon: Terminal,
    path: '/codeforces',
    accent: '#f97316',
    bg: '#fff7ed',
    border: '#fed7aa',
    btnBg: 'linear-gradient(135deg, #f97316, #ea580c)',
    btnColor: '#fff',
    title: 'Codeforces Tracker',
    subtitle: 'Rating · Contests · Verdicts',
    tag: 'HANDLE REQUIRED',
    tagColor: '#ea580c',
    tagBg: '#fff7ed',
    tagBorder: '#fed7aa',
    description: 'Follow your competitive programming journey with rating history charts, contest participation records, verdict breakdowns (AC, WA, TLE), and language usage statistics.',
    highlights: ['Current & max rating', 'Contest history chart', 'Verdict breakdown (AC, WA…)', 'Language distribution'],
    glow: 'rgba(249,115,22,0.12)',
  },
  {
    icon: BarChart2,
    path: '/analytics',
    accent: '#a855f7',
    bg: '#faf5ff',
    border: '#e9d5ff',
    btnBg: 'linear-gradient(135deg, #a855f7, #9333ea)',
    btnColor: '#fff',
    title: 'Skill Gap Analysis',
    subtitle: 'Radar · Productivity · AI Tips',
    tag: 'AI-POWERED',
    tagColor: '#9333ea',
    tagBg: '#faf5ff',
    tagBorder: '#e9d5ff',
    description: 'Get an AI-generated skill radar showing your strengths and gaps across algorithms, data structures, problem-solving, and competitive programming — with actionable recommendations.',
    highlights: ['Skill distribution radar', 'Productivity score /100', 'Personalized recommendations', 'Skill gap alerts'],
    glow: 'rgba(168,85,247,0.12)',
  },
  {
    icon: Clock,
    path: '/timeline',
    accent: '#ec4899',
    bg: '#fdf2f8',
    border: '#fbcfe8',
    btnBg: 'linear-gradient(135deg, #ec4899, #db2777)',
    btnColor: '#fff',
    title: 'Developer Timeline',
    subtitle: 'Cross-platform activity feed',
    tag: 'CROSS-PLATFORM',
    tagColor: '#db2777',
    tagBg: '#fdf2f8',
    tagBorder: '#fbcfe8',
    description: 'Your entire coding story on one unified chronological feed. See repos you created, contests you entered, and problems you solved — all combined into a beautiful timeline.',
    highlights: ['Unified cross-platform feed', 'Repos, contests & submissions', 'Sorted chronologically', 'Color-coded by platform'],
    glow: 'rgba(236,72,153,0.12)',
  },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [githubUser, setGithubUser] = useState(null);

  useEffect(() => {
    api.get('/api/github/analytics')
      .then(r => setGithubUser(r.data))
      .catch(() => {});
  }, []);

  const displayName = user?.name || user?.login || user?.username || 'Developer';
  const avatarUrl = user?.avatarUrl || user?.avatar_url || null;
  const githubLogin = user?.login || user?.username || null;

  return (
    <div className="db-root">
      <style>{dashStyles}</style>

      <div style={{ maxWidth: 1120, margin: '0 auto', padding: '8px 0 48px' }}>

        {/* ── WELCOME HEADER ── */}
        <div className="db-fade-1" style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span className="live-dot" />
            <span style={{ fontSize: 12, fontWeight: 600, color: '#10b981', letterSpacing: '0.06em' }}>DASHBOARD</span>
          </div>
          <h1 className="db-display" style={{ fontSize: 'clamp(26px, 4vw, 38px)', fontWeight: 800, color: '#111', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
            Welcome back{displayName !== 'Developer' ? `, ${displayName.split(' ')[0]}` : ''}! 👋
          </h1>
          <p style={{ fontSize: 15, color: '#777', marginTop: 6 }}>Your developer hub — explore your analytics across all connected platforms.</p>
        </div>

        {/* ── USER CARD + QUICK LINKS ── */}
        <div className="db-fade-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 28 }}>

          {/* User card */}
          <div className="user-card">
            <div style={{ position: 'absolute', top: -50, right: -50, width: 180, height: 180, borderRadius: '50%', background: 'radial-gradient(circle, rgba(249,115,22,0.25), transparent)' }} />
            <div style={{ position: 'absolute', bottom: -40, left: -40, width: 160, height: 160, borderRadius: '50%', background: 'radial-gradient(circle, rgba(168,85,247,0.2), transparent)' }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, position: 'relative' }}>
              {avatarUrl ? (
                <img src={avatarUrl} alt="avatar" style={{ width: 60, height: 60, borderRadius: 16, border: '2px solid rgba(255,255,255,0.15)', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: 60, height: 60, borderRadius: 16, background: 'linear-gradient(135deg, #f97316, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <User size={28} color="#fff" />
                </div>
              )}
              <div>
                <div className="db-display" style={{ fontSize: 20, fontWeight: 800, color: '#fff', lineHeight: 1 }}>{displayName}</div>
                {githubLogin && <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>@{githubLogin}</div>}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
                  <GithubIcon size={12} />
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>GitHub connected</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, position: 'relative' }}>
              {[
                { label: 'Repositories', val: githubUser?.repos?.length ?? '—', c: '#3b82f6' },
                { label: 'Total Commits', val: githubUser?.totalCommits ?? '—', c: '#10b981' },
                { label: 'Total Stars', val: githubUser?.totalStars ?? '—', c: '#f97316' },
                { label: 'Total PRs', val: githubUser?.totalPRs ?? '—', c: '#a855f7' },
              ].map(({ label, val, c }) => (
                <div key={label} style={{ background: 'rgba(255,255,255,0.07)', borderRadius: 12, padding: '14px 16px', backdropFilter: 'blur(4px)' }}>
                  <div className="db-display" style={{ fontSize: 22, fontWeight: 800, color: c, lineHeight: 1 }}>{val}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 4 }}>{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* About DevDragon */}
          <div style={{ background: '#fff', border: '1.5px solid #f0f0f0', borderRadius: 22, padding: '28px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #f97316, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Zap size={18} color="#fff" />
              </div>
              <span className="db-display" style={{ fontSize: 16, fontWeight: 800, color: '#111' }}>About DevDragon</span>
            </div>

            <p style={{ fontSize: 14, color: '#666', lineHeight: 1.7, marginBottom: 18 }}>
              DevDragon is your <strong style={{ color: '#111' }}>unified developer analytics hub</strong>. It connects GitHub, LeetCode, and Codeforces into a single dashboard so you can track your entire coding journey in one place.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 18 }}>
              {[
                { label: 'GitHub', desc: 'Auto-synced every 6 hours', c: '#3b82f6', bg: '#eff6ff', bd: '#bfdbfe' },
                { label: 'LeetCode', desc: 'Add username to connect', c: '#10b981', bg: '#ecfdf5', bd: '#a7f3d0' },
                { label: 'Codeforces', desc: 'Add handle to connect', c: '#f97316', bg: '#fff7ed', bd: '#fed7aa' },
              ].map(({ label, desc, c, bg, bd }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: bg, border: `1px solid ${bd}`, borderRadius: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: c }} />
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#111' }}>{label}</span>
                  </div>
                  <span style={{ fontSize: 11, color: c, fontWeight: 600 }}>{desc}</span>
                </div>
              ))}
            </div>

            <p style={{ fontSize: 12, color: '#bbb', marginTop: 'auto', lineHeight: 1.5 }}>
              🔒 Read-only access only · Your data is never modified or shared
            </p>
          </div>
        </div>

        {/* ── PLATFORM SECTION CARDS ── */}
        <div className="db-fade-3" style={{ marginBottom: 12 }}>
          <h2 className="db-display" style={{ fontSize: 22, fontWeight: 800, color: '#111', letterSpacing: '-0.02em', marginBottom: 4 }}>Explore your analytics</h2>
          <p style={{ fontSize: 14, color: '#999' }}>Click any section to dive into the details.</p>
        </div>

        <div className="db-fade-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20, marginBottom: 28 }}>
          {platforms.map(({ icon: Icon, path, accent, bg, border, btnBg, btnColor, title, subtitle, tag, tagColor, tagBg, tagBorder, description, highlights, glow }) => (
            <div key={path} className="platform-card">
              {/* Glow blob */}
              <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: '50%', background: `radial-gradient(circle, ${glow}, transparent)`, pointerEvents: 'none' }} />

              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 18, position: 'relative' }}>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: bg, border: `1.5px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={25} color={accent} />
                </div>
                <span className="tag-chip" style={{ color: tagColor, background: tagBg, border: `1px solid ${tagBorder}` }}>{tag}</span>
              </div>

              <h3 className="db-display" style={{ fontSize: 18, fontWeight: 800, color: '#111', marginBottom: 4, position: 'relative' }}>{title}</h3>
              <p style={{ fontSize: 12, color: accent, fontWeight: 600, marginBottom: 14, letterSpacing: '0.02em' }}>{subtitle}</p>

              <p style={{ fontSize: 13.5, color: '#666', lineHeight: 1.68, marginBottom: 18, position: 'relative' }}>{description}</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 22, position: 'relative' }}>
                {highlights.map(h => (
                  <div key={h} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#555' }}>
                    <div style={{ width: 5, height: 5, borderRadius: '50%', background: accent, flexShrink: 0 }} />
                    {h}
                  </div>
                ))}
              </div>

              <button className="go-btn" onClick={() => navigate(path)} style={{ background: btnBg, color: btnColor, position: 'relative' }}>
                Open {title.split(' ')[0]} Analytics <ArrowRight size={15} />
              </button>
            </div>
          ))}
        </div>

        {/* ── QUICK LINKS BAR ── */}
        <div className="db-fade-5" style={{ background: '#fff', border: '1.5px solid #f0f0f0', borderRadius: 20, padding: '24px' }}>
          <h3 className="db-display" style={{ fontSize: 15, fontWeight: 800, color: '#111', marginBottom: 16 }}>Quick Jump</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
            {[
              { label: 'GitHub Analytics', path: '/github', accent: '#3b82f6', icon: GitCommit },
              { label: 'LeetCode Insights', path: '/leetcode', accent: '#10b981', icon: Code2 },
              { label: 'Codeforces Tracker', path: '/codeforces', accent: '#f97316', icon: Terminal },
              { label: 'Skill Analysis', path: '/analytics', accent: '#a855f7', icon: BarChart2 },
              { label: 'Dev Timeline', path: '/timeline', accent: '#ec4899', icon: Clock },
            ].map(({ label, path, accent, icon: Icon }) => (
              <button key={path} className="quick-link" onClick={() => navigate(path)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                  <Icon size={15} color={accent} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#333' }}>{label}</span>
                </div>
                <ArrowRight size={13} color="#ccc" />
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}