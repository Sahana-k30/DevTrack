import Sidebar from "../components/Sidebar";

export default function LeetCodeAnalytics() {

  return (

    <div className="flex h-screen">

      <Sidebar />

      <div className="flex-1 p-8">

        <h1>LeetCode Analytics</h1>

        <p>
          Here you will see solved problems, contest rating,
          and coding activity analysis.
        </p>

      </div>

    </div>

  );
}