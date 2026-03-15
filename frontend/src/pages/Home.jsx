export default function Home() {

  const login = () => {
    window.location.href = "http://localhost:5000/auth/github";
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-900 text-white">

      <h1 className="text-5xl font-bold mb-4">DevTrack</h1>

      <p className="mb-8 text-gray-400">
        Track your developer analytics
      </p>

      <button
        onClick={login}
        className="bg-white text-black px-6 py-3 rounded-lg"
      >
        Continue with GitHub
      </button>

    </div>
  );
}