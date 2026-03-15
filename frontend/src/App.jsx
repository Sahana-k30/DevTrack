import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import GithubAnalytics from "./pages/GithubAnalytics";
import LeetCodeAnalytics from "./pages/LeetCodeAnalytics";
import CodeforcesAnalytics from "./pages/CodeforcesAnalytics";

function App() {
  return (
    <BrowserRouter>

      <Routes>

        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />

        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/github-analytics" element={<GithubAnalytics />} />

        <Route path="/leetcode-analytics" element={<LeetCodeAnalytics />} />

        <Route path="/codeforces-analytics" element={<CodeforcesAnalytics />} />

      </Routes>

    </BrowserRouter>
  );
}

export default App;