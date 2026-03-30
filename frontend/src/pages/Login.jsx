import { useSearchParams } from 'react-router-dom';

export default function Login() {
  const [params] = useSearchParams();
  const error = params.get('error');

  const handleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/api/auth/github`;
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-10 w-full max-w-md text-center">
        <h1 className="text-3xl font-bold text-white mb-2">DevDragon</h1>
        <p className="text-gray-400 text-sm mb-8">Your unified developer analytics dashboard</p>

        <div className="space-y-3 text-left mb-8 text-sm text-gray-400">
          {[
            'GitHub commits, repos and PR analytics',
            'LeetCode problem solving insights',
            'Codeforces rating and contest history',
            'Skill gap analysis and developer timeline',
          ].map((f) => (
            <div key={f} className="flex items-center gap-2">
              <span className="text-green-400">✓</span> {f}
            </div>
          ))}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-950 border border-red-800 rounded-lg text-red-400 text-sm">
            {error === 'auth_failed'
              ? 'GitHub authentication failed. Please try again.'
              : 'Something went wrong. Please try again.'}
          </div>
        )}

        <button
          onClick={handleLogin}
          className="flex items-center justify-center gap-3 w-full bg-white text-gray-900 font-semibold py-3 rounded-xl hover:bg-gray-100 transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
          </svg>
          Continue with GitHub
        </button>

        <p className="text-gray-600 text-xs mt-6">Read-only access to your GitHub data only.</p>
      </div>
    </div>
  );
}