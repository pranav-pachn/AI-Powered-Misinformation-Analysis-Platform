import { Link, NavLink, useNavigate } from 'react-router-dom';
import { BiStats, BiLogOut, BiUser } from 'react-icons/bi';
import { useUser } from '../context/UserContext';

export default function Navbar() {
  const { user, logout } = useUser();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-slate-800/60 bg-slate-900/70 bg-gradient-to-br from-slate-900/80 via-slate-900/60 to-slate-900/80 backdrop-blur-2xl shadow-[0_18px_60px_rgba(15,23,42,0.95)]">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* subtle bottom highlight */}
        <div className="pointer-events-none absolute inset-x-8 -bottom-px h-px bg-gradient-to-r from-transparent via-indigo-500/60 to-transparent opacity-70" />

        <div className="flex justify-between items-center h-14">
          {/* Logo & Title */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative p-[2px] rounded-xl bg-gradient-to-br from-indigo-400 via-sky-500 to-purple-500 group-hover:from-indigo-300 group-hover:via-sky-400 group-hover:to-purple-400 transition-colors duration-300">
              <div className="flex items-center justify-center h-10 w-10 rounded-[0.9rem] bg-slate-900/90 backdrop-blur-xl shadow-[0_10px_30px_rgba(15,23,42,0.9)]">
                <BiStats className="text-indigo-200 text-2xl" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-xs uppercase tracking-[0.24em] text-slate-500">
                AI-Powered
              </span>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight bg-gradient-to-r from-indigo-200 via-sky-200 to-purple-200 bg-clip-text text-transparent">
                AI Fact Checker
              </h1>
            </div>
          </Link>

          {/* Center Navigation Links */}
          {user && (
            <div className="hidden sm:flex items-center gap-2 rounded-full bg-slate-900/60 border border-slate-700/70 px-1.5 py-1 shadow-[0_12px_40px_rgba(15,23,42,0.75)] backdrop-blur-2xl">
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  [
                    'px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 relative',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900',
                    isActive
                      ? 'bg-gradient-to-r from-indigo-500 to-indigo-400 text-slate-50 shadow-[0_10px_30px_rgba(79,70,229,0.65)] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:rounded-full after:bg-gradient-to-r after:from-indigo-300 after:to-sky-300 after:shadow-[0_0_15px_rgba(99,102,241,0.8),0_0_25px_rgba(148,163,247,0.5)]'
                      : 'text-slate-300/90 hover:text-slate-100 hover:bg-slate-800/80',
                  ].join(' ')
                }
              >
                Home
              </NavLink>
              <NavLink
                to="/history"
                className={({ isActive }) =>
                  [
                    'px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 relative',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900',
                    isActive
                      ? 'bg-gradient-to-r from-indigo-500 to-indigo-400 text-slate-50 shadow-[0_10px_30px_rgba(79,70,229,0.65)] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:rounded-full after:bg-gradient-to-r after:from-indigo-300 after:to-sky-300 after:shadow-[0_0_15px_rgba(99,102,241,0.8),0_0_25px_rgba(148,163,247,0.5)]'
                      : 'text-slate-300/90 hover:text-slate-100 hover:bg-slate-800/80',
                  ].join(' ')
                }
              >
                History
              </NavLink>
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  [
                    'px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 relative',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900',
                    isActive
                      ? 'bg-gradient-to-r from-indigo-500 to-indigo-400 text-slate-50 shadow-[0_10px_30px_rgba(79,70,229,0.65)] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:rounded-full after:bg-gradient-to-r after:from-indigo-300 after:to-sky-300 after:shadow-[0_0_15px_rgba(99,102,241,0.8),0_0_25px_rgba(148,163,247,0.5)]'
                      : 'text-slate-300/90 hover:text-slate-100 hover:bg-slate-800/80',
                  ].join(' ')
                }
              >
                Dashboard
              </NavLink>
            </div>
          )}

          {/* Right Side - Auth Section */}
          <div className="flex items-center gap-4">
            {user ? (
              <>
                {/* Mobile nav labels */}
                <div className="flex sm:hidden items-center gap-3 text-xs font-medium text-slate-400">
                  <NavLink
                    to="/"
                    end
                    className={({ isActive }) =>
                      `px-2 py-1 rounded-full transition-colors ${
                        isActive ? 'bg-slate-800/80 text-slate-100' : 'text-slate-400'
                      }`
                    }
                  >
                    Home
                  </NavLink>
                  <NavLink
                    to="/history"
                    className={({ isActive }) =>
                      `px-2 py-1 rounded-full transition-colors ${
                        isActive ? 'bg-slate-800/80 text-slate-100' : 'text-slate-400'
                      }`
                    }
                  >
                    History
                  </NavLink>
                  <NavLink
                    to="/dashboard"
                    className={({ isActive }) =>
                      `px-2 py-1 rounded-full transition-colors ${
                        isActive ? 'bg-slate-800/80 text-slate-100' : 'text-slate-400'
                      }`
                    }
                  >
                    Dashboard
                  </NavLink>
                </div>

                {/* User Info & Logout */}
                <div className="flex items-center gap-3 pl-4 border-l border-slate-700/50">
                  <div className="hidden sm:flex items-center gap-2 text-right">
                    <div className="flex flex-col">
                      <p className="text-sm font-medium text-slate-100">{user.username}</p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-2 rounded-lg bg-slate-800/50 hover:bg-[#ef4444]/20 text-slate-300 hover:text-red-300 transition-colors flex items-center gap-1 text-sm"
                    title="Logout"
                  >
                    <BiLogOut className="text-lg" />
                    <span className="hidden sm:inline">Logout</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-1.5 text-sm font-medium text-indigo-300 hover:text-indigo-100 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-1.5 rounded-full text-sm font-medium bg-gradient-to-r from-indigo-500 to-indigo-400 text-slate-50 hover:from-indigo-600 hover:to-indigo-500 shadow-[0_10px_30px_rgba(79,70,229,0.65)] transition-all flex items-center gap-2"
                >
                  <BiUser /> Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
