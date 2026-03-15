import Sidebar from "../components/Sidebar";

export default function CodeforcesAnalytics() {

  return (

    <div className="flex h-screen">

      <Sidebar />

      <div className="flex-1 p-8">

        <h1>Codeforces Analytics</h1>

        <p>
          Here you will see contest performance,
          rating trends and activity statistics.
        </p>

      </div>

    </div>

  );
}