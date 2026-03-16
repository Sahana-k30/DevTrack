import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-6">
      <div />
      <div className="flex items-center gap-4">
        {user && (
          <>
            <img
              src={user.githubProfile?.avatarUrl || '/default-avatar.png'}
              alt="avatar"
              className="w-8 h-8 rounded-full"
            />
            <span className="text-sm text-gray-300">{user.githubProfile?.username}</span>
            <button
              onClick={logout}
              className="text-xs text-gray-400 hover:text-red-400 transition-colors"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </header>
  );
}