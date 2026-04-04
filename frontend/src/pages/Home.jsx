import { useEffect, useState, useRef } from 'react';
import { GitCommit, Code2, Terminal, BarChart2, Clock, TrendingUp, ArrowRight, Zap, Star, Shield, ChevronDown } from 'lucide-react';

const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:ital,wght@0,400;0,500;0,600;1,400&display=swap');

  .home-root { font-family: 'DM Sans', sans-serif; background: #fafaf8; color: #111; }
  .home-root * { box-sizing: border-box; margin: 0; padding: 0; }
  .display { font-family: 'Syne', sans-serif; }

  @keyframes floatY {
    0%,100% { transform: translateY(0px); }
    50%      { transform: translateY(-14px); }
  }
  @keyframes gradShift {
    0%,100% { background-position: 0% 50%; }
    50%     { background-position: 100% 50%; }
  }
  @keyframes fadeUp {
    from { opacity:0; transform:translateY(30px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes marquee {
    from { transform: translateX(0); }
    to   { transform: translateX(-50%); }
  }
  @keyframes blobMorph {
    0%,100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
    50%     { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; }
  }
  @keyframes pulse {
    0%,100% { opacity:1; }
    50%     { opacity:0.5; }
  }

  .a1 { animation: fadeUp 0.7s 0.0s cubic-bezier(.22,1,.36,1) both; }
  .a2 { animation: fadeUp 0.7s 0.1s cubic-bezier(.22,1,.36,1) both; }
  .a3 { animation: fadeUp 0.7s 0.2s cubic-bezier(.22,1,.36,1) both; }
  .a4 { animation: fadeUp 0.7s 0.3s cubic-bezier(.22,1,.36,1) both; }

  .grad-text {
    background: linear-gradient(120deg, #ff6b35, #f59e0b, #a855f7, #3b82f6);
    background-size: 300% 300%;
    animation: gradShift 4s ease infinite;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .blob { animation: blobMorph 9s ease-in-out infinite; }
  .blob2 { animation: blobMorph 11s 3s ease-in-out infinite; }
  .fc1 { animation: floatY 5s ease-in-out infinite; }
  .fc2 { animation: floatY 6s 1.5s ease-in-out infinite; }
  .fc3 { animation: floatY 7s 3s ease-in-out infinite; }
  .marquee-inner { animation: marquee 22s linear infinite; }
  .pulse-dot { animation: pulse 2s ease-in-out infinite; }

  .feature-card {
    background: #fff;
    border: 1.5px solid #f0f0f0;
    border-radius: 20px;
    padding: 28px;
    transition: transform 0.28s cubic-bezier(.34,1.56,.64,1), box-shadow 0.28s ease, border-color 0.28s;
    cursor: default;
  }
  .feature-card:hover {
    transform: translateY(-6px);
    box-shadow: 0 20px 48px rgba(0,0,0,0.09);
  }

  .cta-primary {
    display: inline-flex; align-items: center; gap: 12px;
    background: linear-gradient(135deg, #111 0%, #2d2d2d 100%);
    color: #fff; border: none; border-radius: 14px;
    padding: 16px 32px; font-size: 16px; font-weight: 700;
    cursor: pointer; font-family: 'DM Sans', sans-serif;
    box-shadow: 0 6px 28px rgba(0,0,0,0.22);
    transition: transform 0.2s, box-shadow 0.2s;
    text-decoration: none;
  }
  .cta-primary:hover { transform: translateY(-3px); box-shadow: 0 14px 40px rgba(0,0,0,0.3); }
  .cta-primary:active { transform: translateY(0); }

  .step-card {
    background: #fff; border: 1.5px solid #f0f0f0; border-radius: 20px; padding: 32px;
    position: relative;
    transition: box-shadow 0.3s;
  }
  .step-card:hover { box-shadow: 0 12px 36px rgba(0,0,0,0.07); }

  .nav-cta {
    display: inline-flex; align-items: center; gap: 8px;
    background: #111; color: #fff; border: none;
    border-radius: 10px; padding: 10px 20px;
    font-size: 14px; font-weight: 600; cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    transition: background 0.2s, transform 0.15s;
  }
  .nav-cta:hover { background: #333; transform: translateY(-1px); }

  .trust-chip {
    display: flex; align-items: center; gap: 9px;
    background: #fff; border: 1.5px solid #f0f0f0;
    border-radius: 100px; padding: 10px 20px;
    font-size: 13px; color: #555; font-weight: 500;
    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
    transition: box-shadow 0.2s;
  }
  .trust-chip:hover { box-shadow: 0 6px 20px rgba(0,0,0,0.09); }
`;

const GithubIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
  </svg>
);

const FloatChip = ({ icon: Icon, value, label, accent, bg, className }) => (
  <div className={className} style={{
    position: 'absolute', background: '#fff', borderRadius: 16, padding: '12px 18px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.12)', border: '1.5px solid #f0f0f0',
    display: 'flex', alignItems: 'center', gap: 12, zIndex: 2,
  }}>
    <div style={{ width: 36, height: 36, borderRadius: 10, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Icon size={18} color={accent} />
    </div>
    <div>
      <div style={{ fontSize: 18, fontWeight: 800, color: '#111', lineHeight: 1, fontFamily: 'Syne, sans-serif' }}>{value}</div>
      <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{label}</div>
    </div>
  </div>
);

export default function Home() {
  const [scrollY, setScrollY] = useState(0);
  const featuresRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/api/auth/github`;
  };

  const features = [
    { icon: GitCommit, accent: '#3b82f6', bg: '#eff6ff', border: '#bfdbfe', title: 'GitHub Analytics', desc: 'Commits, repos, pull requests, language distribution, and weekly contribution graphs — all automated.', badge: 'Auto-synced' },
    { icon: Code2, accent: '#10b981', bg: '#ecfdf5', border: '#a7f3d0', title: 'LeetCode Insights', desc: 'Track Easy / Medium / Hard progress, daily streaks, global ranking, and recent accepted submissions.', badge: 'On demand' },
    { icon: Terminal, accent: '#f97316', bg: '#fff7ed', border: '#fed7aa', title: 'Codeforces Tracker', desc: 'Rating history, contest results, verdict breakdowns, and language statistics for competitive programmers.', badge: 'Live data' },
    { icon: BarChart2, accent: '#a855f7', bg: '#faf5ff', border: '#e9d5ff', title: 'Skill Gap Analysis', desc: 'AI-powered skill radar with personalized recommendations to close gaps and accelerate your growth.', badge: 'AI-powered' },
    { icon: Clock, accent: '#ec4899', bg: '#fdf2f8', border: '#fbcfe8', title: 'Developer Timeline', desc: 'Your full coding history — repos created, contests entered, problems solved — on one unified feed.', badge: 'Cross-platform' },
    { icon: TrendingUp, accent: '#0ea5e9', bg: '#f0f9ff', border: '#bae6fd', title: 'Productivity Score', desc: 'A composite metric that reflects commit trends, problem-solving cadence, and contest activity.', badge: 'Weekly' },
  ];

  const navBg = scrollY > 50;

  return (
    <div className="home-root">
      <style>{globalStyles}</style>

      {/* NAV */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
        background: navBg ? 'rgba(250,250,248,0.92)' : 'transparent',
        backdropFilter: navBg ? 'blur(14px)' : 'none',
        borderBottom: navBg ? '1px solid #ebebeb' : '1px solid transparent',
        transition: 'all 0.3s',
      }}>
        <div style={{ maxWidth: 1120, margin: '0 auto', height: 66, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: 'linear-gradient(135deg, #f97316, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={17} color="#fff" />
            </div>
            <span className="display" style={{ fontSize: 19, fontWeight: 800, letterSpacing: '-0.02em' }}>DevDragon</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button onClick={() => featuresRef.current?.scrollIntoView({ behavior: 'smooth' })}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 500, color: '#666', padding: '8px 14px', fontFamily: 'DM Sans, sans-serif' }}>
              Features
            </button>
            <button className="nav-cta" onClick={handleLogin}>
              <GithubIcon size={15} /> Sign in
            </button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '120px 24px 80px', position: 'relative', overflow: 'hidden' }}>
        {/* Blobs */}
        <div className="blob" style={{ position: 'absolute', top: '8%', right: '3%', width: 550, height: 550, background: 'linear-gradient(135deg, rgba(249,115,22,0.11), rgba(168,85,247,0.11))', filter: 'blur(50px)', zIndex: 0 }} />
        <div className="blob2" style={{ position: 'absolute', bottom: '5%', left: '2%', width: 420, height: 420, background: 'linear-gradient(135deg, rgba(59,130,246,0.09), rgba(16,185,129,0.09))', filter: 'blur(50px)', zIndex: 0 }} />

        {/* Floating chips */}
        <FloatChip icon={GitCommit} value="2,847" label="Total commits" accent="#3b82f6" bg="#eff6ff" className="fc1" style={{ top: '24%', left: '5%' }} />
        <div className="fc1" style={{ position: 'absolute', top: '24%', left: '5%', background: '#fff', borderRadius: 16, padding: '12px 18px', boxShadow: '0 8px 32px rgba(0,0,0,0.12)', border: '1.5px solid #f0f0f0', display: 'flex', alignItems: 'center', gap: 12, zIndex: 2 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><GitCommit size={18} color="#3b82f6" /></div>
          <div><div style={{ fontSize: 18, fontWeight: 800, lineHeight: 1, fontFamily: 'Syne, sans-serif' }}>2,847</div><div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>Total commits</div></div>
        </div>
        <div className="fc2" style={{ position: 'absolute', top: '28%', right: '5%', background: '#fff', borderRadius: 16, padding: '12px 18px', boxShadow: '0 8px 32px rgba(0,0,0,0.12)', border: '1.5px solid #f0f0f0', display: 'flex', alignItems: 'center', gap: 12, zIndex: 2 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Code2 size={18} color="#10b981" /></div>
          <div><div style={{ fontSize: 18, fontWeight: 800, lineHeight: 1, fontFamily: 'Syne, sans-serif' }}>523</div><div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>LeetCode solved</div></div>
        </div>
        <div className="fc3" style={{ position: 'absolute', bottom: '26%', right: '6%', background: '#fff', borderRadius: 16, padding: '12px 18px', boxShadow: '0 8px 32px rgba(0,0,0,0.12)', border: '1.5px solid #f0f0f0', display: 'flex', alignItems: 'center', gap: 12, zIndex: 2 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Terminal size={18} color="#f97316" /></div>
          <div><div style={{ fontSize: 18, fontWeight: 800, lineHeight: 1, fontFamily: 'Syne, sans-serif' }}>1847</div><div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>CF Rating</div></div>
        </div>

        {/* Hero copy */}
        <div style={{ textAlign: 'center', maxWidth: 780, position: 'relative', zIndex: 1 }}>
          <div className="a1" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#fff', border: '1.5px solid #ebebeb', borderRadius: 100, padding: '6px 16px 6px 8px', marginBottom: 32, boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
            <span style={{ background: 'linear-gradient(135deg, #f97316, #a855f7)', borderRadius: 100, padding: '3px 10px', fontSize: 10, fontWeight: 800, color: '#fff', letterSpacing: '0.06em' }}>NEW</span>
            <span style={{ fontSize: 13, color: '#666', fontWeight: 500 }}>Unified developer analytics · Free forever</span>
            <span className="pulse-dot" style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
          </div>

          <h1 className="display a2" style={{ fontSize: 'clamp(44px, 7.5vw, 84px)', fontWeight: 800, lineHeight: 1.02, letterSpacing: '-0.04em', color: '#0d0d0d', marginBottom: 24 }}>
            All your code,<br /><span className="grad-text">one dashboard.</span>
          </h1>

          <p className="a3" style={{ fontSize: 18, color: '#666', lineHeight: 1.72, maxWidth: 560, margin: '0 auto 40px', fontWeight: 400 }}>
            DevDragon unifies <strong style={{ color: '#111' }}>GitHub</strong>, <strong style={{ color: '#111' }}>LeetCode</strong>, and <strong style={{ color: '#111' }}>Codeforces</strong> into a single beautiful hub — track your growth, find skill gaps, and grow as a developer.
          </p>

          <div className="a4" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
            <button className="cta-primary" onClick={handleLogin}>
              <GithubIcon size={20} />
              Continue with GitHub
              <ArrowRight size={16} />
            </button>
            <span style={{ fontSize: 12, color: '#bbb', letterSpacing: '0.02em' }}>Free · Read-only access · No credit card required</span>
          </div>
        </div>

        <button onClick={() => featuresRef.current?.scrollIntoView({ behavior: 'smooth' })} style={{
          position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)',
          background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
          opacity: 0.35, animation: 'floatY 2.5s ease-in-out infinite',
        }}>
          <span style={{ fontSize: 11, color: '#555', fontFamily: 'DM Sans, sans-serif', letterSpacing: '0.06em' }}>SCROLL</span>
          <ChevronDown size={18} color="#555" />
        </button>
      </section>

      {/* MARQUEE */}
      <div style={{ background: 'linear-gradient(90deg, #f97316, #ec4899, #a855f7, #3b82f6, #10b981)', padding: '13px 0', overflow: 'hidden' }}>
        <div className="marquee-inner" style={{ display: 'flex', gap: 48, width: 'max-content' }}>
          {[...Array(2)].flatMap(() => ['GitHub OAuth', 'LeetCode API', 'Codeforces API', 'Real-time Sync', 'Skill Radar', 'AI Insights', 'Timeline View', 'Streak Tracking', 'Productivity Score', 'Language Stats'].map((t, i) => (
            <div key={`${t}-${i}`} style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.92)', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap' }}>
              <Star size={11} fill="rgba(255,255,255,0.7)" color="transparent" /> {t}
            </div>
          )))}
        </div>
      </div>

      {/* STATS ROW */}
      <section style={{ background: '#fff', borderBottom: '1px solid #f0f0f0' }}>
        <div style={{ maxWidth: 960, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)' }}>
          {[
            { n: '3', unit: 'Platforms', sub: 'GitHub · LeetCode · Codeforces', c: '#f97316' },
            { n: '10+', unit: 'Metrics', sub: 'Commits, ratings, streaks & more', c: '#a855f7' },
            { n: '100%', unit: 'Read-only', sub: 'We never write to your accounts', c: '#3b82f6' },
          ].map(({ n, unit, sub, c }, i) => (
            <div key={i} style={{ padding: '52px 36px', textAlign: 'center', borderRight: i < 2 ? '1px solid #f0f0f0' : 'none' }}>
              <div className="display" style={{ fontSize: 60, fontWeight: 800, color: c, lineHeight: 1, letterSpacing: '-0.04em' }}>{n}</div>
              <div className="display" style={{ fontSize: 18, fontWeight: 700, color: '#111', marginTop: 4 }}>{unit}</div>
              <div style={{ fontSize: 13, color: '#aaa', marginTop: 8 }}>{sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section ref={featuresRef} style={{ padding: '100px 24px', background: '#fafaf8' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <div style={{ display: 'inline-block', background: '#fff0e8', border: '1px solid #fed7aa', borderRadius: 100, padding: '4px 16px', fontSize: 11, fontWeight: 800, color: '#ea580c', letterSpacing: '0.08em', marginBottom: 18 }}>FEATURES</div>
            <h2 className="display" style={{ fontSize: 'clamp(32px, 5vw, 54px)', fontWeight: 800, color: '#111', letterSpacing: '-0.03em', marginBottom: 16, lineHeight: 1.08 }}>
              Everything you need<br />to level up
            </h2>
            <p style={{ fontSize: 16, color: '#888', maxWidth: 460, margin: '0 auto', lineHeight: 1.65 }}>
              Connect your accounts once, and DevDragon keeps everything in sync automatically.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
            {features.map(({ icon: Icon, accent, bg, border, title, desc, badge }) => (
              <div key={title} className="feature-card">
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
                  <div style={{ width: 50, height: 50, borderRadius: 14, background: bg, border: `1.5px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={24} color={accent} />
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 800, color: accent, background: bg, border: `1px solid ${border}`, borderRadius: 100, padding: '4px 12px', letterSpacing: '0.05em' }}>{badge}</span>
                </div>
                <h3 className="display" style={{ fontSize: 17, fontWeight: 700, color: '#111', marginBottom: 10 }}>{title}</h3>
                <p style={{ fontSize: 14, color: '#777', lineHeight: 1.68 }}>{desc}</p>
                <div style={{ marginTop: 22, height: 3, borderRadius: 100, background: `linear-gradient(90deg, ${accent}, ${accent}44, transparent)` }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ background: '#fff', padding: '96px 24px', borderTop: '1px solid #f0f0f0' }}>
        <div style={{ maxWidth: 940, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <div style={{ display: 'inline-block', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 100, padding: '4px 16px', fontSize: 11, fontWeight: 800, color: '#16a34a', letterSpacing: '0.08em', marginBottom: 18 }}>HOW IT WORKS</div>
            <h2 className="display" style={{ fontSize: 'clamp(28px, 5vw, 50px)', fontWeight: 800, color: '#111', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
              Up in 3 steps.<br />No config needed.
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
            {[
              { n: '01', title: 'Sign in with GitHub', body: 'One-click OAuth. Your repos, commits, and PRs load automatically — no setup required.', c: '#3b82f6', bg: '#eff6ff', br: '#bfdbfe' },
              { n: '02', title: 'Add your handles', body: 'Enter your LeetCode username and Codeforces handle to unlock full cross-platform analytics.', c: '#f97316', bg: '#fff7ed', br: '#fed7aa' },
              { n: '03', title: 'Track & grow', body: 'View your unified dashboard, find skill gaps, and get AI-powered recommendations to improve.', c: '#a855f7', bg: '#faf5ff', br: '#e9d5ff' },
            ].map(({ n, title, body, c, bg, br }) => (
              <div key={n} className="step-card">
                <div style={{ width: 48, height: 48, borderRadius: 13, background: bg, border: `2px solid ${br}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 22 }}>
                  <span className="display" style={{ fontSize: 20, fontWeight: 800, color: c }}>{n}</span>
                </div>
                <h3 className="display" style={{ fontSize: 17, fontWeight: 700, color: '#111', marginBottom: 10 }}>{title}</h3>
                <p style={{ fontSize: 14, color: '#777', lineHeight: 1.65 }}>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TRUST */}
      <section style={{ padding: '60px 24px', background: '#fafaf8' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, justifyContent: 'center', maxWidth: 820, margin: '0 auto' }}>
          {[
            { icon: Shield, label: 'Read-only OAuth — we never write to your GitHub', c: '#10b981' },
            { icon: Zap, label: 'Data refreshes automatically every 6 hours', c: '#f97316' },
            { icon: Star, label: 'Zero cost — completely free to use forever', c: '#a855f7' },
          ].map(({ icon: Icon, label, c }) => (
            <div key={label} className="trust-chip">
              <Icon size={15} color={c} />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section style={{ padding: '80px 24px 100px', background: '#fff', borderTop: '1px solid #f0f0f0' }}>
        <div style={{ maxWidth: 680, margin: '0 auto', textAlign: 'center', background: 'linear-gradient(135deg, #0d0d0d 0%, #1a1a22 100%)', borderRadius: 28, padding: '72px 48px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -70, right: -70, width: 220, height: 220, borderRadius: '50%', background: 'radial-gradient(circle, rgba(249,115,22,0.28), transparent)' }} />
          <div style={{ position: 'absolute', bottom: -70, left: -70, width: 220, height: 220, borderRadius: '50%', background: 'radial-gradient(circle, rgba(168,85,247,0.28), transparent)' }} />
          <h2 className="display" style={{ fontSize: 'clamp(28px, 5vw, 44px)', fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', marginBottom: 16, lineHeight: 1.1, position: 'relative' }}>
            Start tracking your<br />growth today
          </h2>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)', marginBottom: 40, position: 'relative' }}>Join developers who use DevDragon to stay on top of their progress.</p>
          <button className="cta-primary" onClick={handleLogin} style={{ background: '#fff', color: '#111', boxShadow: '0 6px 28px rgba(0,0,0,0.3)', position: 'relative' }}>
            <GithubIcon size={18} /> Continue with GitHub — it's free
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: '#0d0d0d', padding: '28px 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <div style={{ width: 26, height: 26, borderRadius: 7, background: 'linear-gradient(135deg, #f97316, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Zap size={13} color="#fff" /></div>
          <span className="display" style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>DevDragon</span>
        </div>
        <span style={{ color: '#444', fontSize: 13 }}>· Read-only · No data sold · Built for developers</span>
      </footer>
    </div>
  );
}