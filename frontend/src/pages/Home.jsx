import { useSearchParams } from 'react-router-dom';

export default function Home() {
  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-950 text-white">
      <h1 className="text-5xl font-bold mb-4">DevTracker</h1>
      <p className="mb-8 text-gray-400">Track your developer analytics</p>
      <a
        href={`${import.meta.env.VITE_API_URL}/api/auth/github`}
        className="bg-white text-black px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
      >
        Continue with GitHub
      </a>
    </div>
  );
}