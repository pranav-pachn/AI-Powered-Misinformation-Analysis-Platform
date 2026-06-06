import { Link, NavLink, useNavigate } from 'react-router-dom';
import { BiLogOut } from 'react-icons/bi';
import { Layers } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { motion } from 'framer-motion';

export default function Navbar() {
  const { user, logout } = useUser();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const authNavLinks = [
    { name: 'Analyze', path: '/app' },
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'History', path: '/history' },
  ];

  return (
    <motion.nav
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 left-0 w-full z-50 border-b border-white/10 bg-[#020617]/80 backdrop-blur-xl"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-10 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group flex-shrink-0">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg overflow-hidden shrink-0 group-hover:opacity-80 transition-opacity">
            <img src="/favicon.png" alt="FactLens AI" className="w-full h-full object-cover" />
          </div>
          <span className="font-semibold tracking-tight text-white group-hover:text-[#6366f1] transition-colors text-sm sm:text-base">
            FactLens AI
          </span>
        </Link>

        {/* Center Nav — only shown when logged in */}
        {user && (
          <div className="hidden md:flex items-center gap-1">
            {authNavLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                className={({ isActive }) =>
                  `px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'text-white bg-white/10'
                      : 'text-[#e2e8f0]/60 hover:text-white hover:bg-white/5'
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
          </div>
        )}

        {/* Right Side */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {user ? (
            <>
              <span className="hidden sm:block text-sm font-medium text-white/70">
                {user.username}
              </span>
              <button
                onClick={handleLogout}
                title="Sign Out"
                className="flex items-center justify-center w-9 h-9 rounded-full bg-white/5 hover:bg-[#ef4444]/20 text-[#e2e8f0]/60 hover:text-[#ef4444] transition-colors"
              >
                <BiLogOut size={18} />
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-medium text-[#e2e8f0]/80 hover:text-white transition-colors px-1"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="px-5 py-2 rounded-full text-sm font-semibold border border-white/20 text-white hover:bg-white hover:text-[#020617] transition-all duration-200"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

      </div>
    </motion.nav>
  );
}
