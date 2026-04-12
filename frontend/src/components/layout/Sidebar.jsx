import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Github, Code2, Terminal, Clock, BarChart2, Scale
} from 'lucide-react';

const links = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/github', icon: Github, label: 'GitHub' },
  { to: '/leetcode', icon: Code2, label: 'LeetCode' },
  { to: '/codeforces', icon: Terminal, label: 'Codeforces' },
  { to: '/timeline', icon: Clock, label: 'Timeline' },
  { to: '/analytics', icon: BarChart2, label: 'Analytics' },
  { to: '/compare', icon: Scale, label: 'Compare' },
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-xl font-bold text-indigo-400">DevTracker</h1>
        <p className="text-xs text-gray-500 mt-1">Your dev analytics hub</p>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all
              ${isActive
                ? 'bg-indigo-600 text-white'
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}