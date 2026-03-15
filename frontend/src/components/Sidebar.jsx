import { FaGithub } from "react-icons/fa";
import { SiLeetcode, SiCodeforces } from "react-icons/si";
import { Link } from "react-router-dom";

export default function Sidebar() {

  return (

    <div className="w-64 bg-gray-900 text-white p-6">

      <h2 className="text-2xl font-bold mb-8">DevTrack</h2>

      <ul>

        <Link to="/dashboard">
          <li className="mb-4 cursor-pointer">
            Dashboard
          </li>
        </Link>

        <Link to="/github-analytics">
          <li className="flex items-center gap-3 mb-4 cursor-pointer">
            <FaGithub />
            GitHub Analytics
          </li>
        </Link>

        <Link to="/leetcode-analytics">
          <li className="flex items-center gap-3 mb-4 cursor-pointer">
            <SiLeetcode />
            LeetCode Analytics
          </li>
        </Link>

        <Link to="/codeforces-analytics">
          <li className="flex items-center gap-3 mb-4 cursor-pointer">
            <SiCodeforces />
            Codeforces Analytics
          </li>
        </Link>

      </ul>

    </div>

  );
}