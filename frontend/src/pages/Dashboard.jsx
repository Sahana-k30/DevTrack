import Sidebar from "../components/Sidebar";

export default function Dashboard() {

  const logout = async () => {

    await fetch("http://localhost:5000/auth/logout", {
      credentials: "include",
    });

    window.location.href = "/";
  };

  return (

    <div className="flex h-screen">

      <Sidebar />

      <div className="flex-1 bg-gray-100 p-8">

        <h1 className="text-3xl font-bold mb-6">
          Developer Dashboard
        </h1>

        <p className="mb-4">
          DevTrack helps developers analyze their coding activity across
          multiple platforms like GitHub, LeetCode, and Codeforces.
        </p>

        <p className="mb-4">
          Using DevTrack you can track repository growth, contributions,
          coding activity, and competitive programming performance.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">
          Advantages
        </h2>

        <ul className="list-disc ml-6 mb-6">
          <li>Track coding performance</li>
          <li>Monitor GitHub productivity</li>
          <li>Improve competitive programming stats</li>
          <li>Build strong developer portfolio</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6 mb-2">
          Platforms Supported
        </h2>

        <ul className="list-disc ml-6 mb-6">
          <li>GitHub</li>
          <li>LeetCode</li>
          <li>Codeforces</li>
        </ul>

        <button
          onClick={logout}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Sign Out
        </button>

      </div>

    </div>

  );
}