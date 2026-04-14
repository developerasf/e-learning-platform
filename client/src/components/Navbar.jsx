import { BarChart3, BookOpen, ChevronDown, LogOut, Menu, Moon, Settings, Sun, User, X } from 'lucide-react';
import { memo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Navbar = memo(() => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const { isDark, toggleTheme } = useTheme();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinkClass = "text-slate-600 dark:text-slate-300 hover:text-violet-600 dark:hover:text-violet-400 font-medium transition duration-200 text-sm";
  const mobileNavLinkClass = "block w-full text-left px-4 py-3 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-violet-50 dark:hover:bg-violet-900/30 hover:text-violet-600 dark:hover:text-violet-400 transition duration-200 cursor-pointer";

  return (
    <nav className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm border-b border-slate-200/50 dark:border-slate-800/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-3 group"
          >
            <img src="/logo.png" alt="Bipul's Classroom" className="h-10 w-auto" />

          </Link>

          {/* Mobile menu button */}
          <button
            className="md:hidden inline-flex items-center justify-center p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition focus:outline-none focus:ring-2 focus:ring-violet-500 cursor-pointer"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            aria-expanded={showMobileMenu}
            aria-label="Toggle menu"
          >
            {showMobileMenu ? (
              <X className="w-6 h-6 text-slate-600 dark:text-slate-300" />
            ) : (
              <Menu className="w-6 h-6 text-slate-600 dark:text-slate-300" />
            )}
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:gap-2">
            <Link to="/courses" className={navLinkClass}>
              Courses
            </Link>
            {user ? (
              <>
                {user.role === 'admin' && (
                  <>
                    <Link to="/admin" className={navLinkClass}>
                      Manage
                    </Link>
                    <Link to="/admin/tracking" className={navLinkClass}>
                      Tracking
                    </Link>
                    <Link to="/admin/attendance" className={navLinkClass}>
                      Attendance
                    </Link>
                    <Link to="/admin/results" className={navLinkClass}>
                      Results
                    </Link>
                  </>
                )}
                {user.role === 'student' && (
                  <>
                    <Link to="/my-courses" className={navLinkClass}>
                      My Courses
                    </Link>
                    <Link to="/profile" className={navLinkClass}>
                      Profile
                    </Link>
                  </>
                )}
                <button
                  onClick={toggleTheme}
                  className="inline-flex items-center justify-center p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition focus:outline-none focus:ring-2 focus:ring-violet-500 cursor-pointer"
                  title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                  aria-label="Toggle theme"
                >
                  {isDark ? (
                    <Sun className="w-5 h-5 text-amber-500" />
                  ) : (
                    <Moon className="w-5 h-5 text-slate-600" />
                  )}
                </button>
                <div className="relative ml-2">
                  <button
                    onClick={() => setShowUserDropdown(!showUserDropdown)}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                    aria-expanded={showUserDropdown}
                    aria-label="User menu"
                  >
                    <div className="w-9 h-9 bg-gradient-to-br from-violet-600 to-emerald-500 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-md">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden lg:inline text-slate-700 dark:text-slate-300 font-medium">{user.name}</span>
                    <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${showUserDropdown ? 'rotate-180' : ''}`} />
                  </button>

                  {showUserDropdown && (
                    <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 py-2 z-50 overflow-hidden">
                      <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                        <p className="text-sm font-semibold text-slate-800 dark:text-white">{user.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
                      </div>
                      <div className="py-2">
                        {user.role === 'admin' && (
                          <>
                            <Link
                              to="/admin"
                              className="flex items-center gap-3 px-4 py-2.5 text-slate-700 dark:text-slate-300 hover:bg-violet-50 dark:hover:bg-violet-900/30 hover:text-violet-600 dark:hover:text-violet-400 text-sm transition"
                              onClick={() => setShowUserDropdown(false)}
                            >
                              <BarChart3 className="w-4 h-4" />
                              Dashboard
                            </Link>
                            <Link 
                              to="/admin/tracking" 
                              className="flex items-center gap-3 px-4 py-2.5 text-slate-700 dark:text-slate-300 hover:bg-violet-50 dark:hover:bg-violet-900/30 hover:text-violet-600 dark:hover:text-violet-400 text-sm transition"
                              onClick={() => setShowUserDropdown(false)}
                            >
                              <BarChart3 className="w-4 h-4" />
                              Tracking
                            </Link>
                            <Link 
                              to="/admin/attendance" 
                              className="flex items-center gap-3 px-4 py-2.5 text-slate-700 dark:text-slate-300 hover:bg-violet-50 dark:hover:bg-violet-900/30 hover:text-violet-600 dark:hover:text-violet-400 text-sm transition"
                              onClick={() => setShowUserDropdown(false)}
                            >
                              <BookOpen className="w-4 h-4" />
                              Attendance
                            </Link>
                            <Link 
                              to="/admin/results" 
                              className="flex items-center gap-3 px-4 py-2.5 text-slate-700 dark:text-slate-300 hover:bg-violet-50 dark:hover:bg-violet-900/30 hover:text-violet-600 dark:hover:text-violet-400 text-sm transition"
                              onClick={() => setShowUserDropdown(false)}
                            >
                              <BookOpen className="w-4 h-4" />
                              Results
                            </Link>
                          </>
                        )}
                        {user.role === 'student' && (
                          <>
                            <Link
                              to="/my-courses"
                              className="flex items-center gap-3 px-4 py-2.5 text-slate-700 dark:text-slate-300 hover:bg-violet-50 dark:hover:bg-violet-900/30 hover:text-violet-600 dark:hover:text-violet-400 text-sm transition"
                              onClick={() => setShowUserDropdown(false)}
                            >
                              <BookOpen className="w-4 h-4" />
                              My Courses
                            </Link>
                            <Link
                              to="/profile"
                              className="flex items-center gap-3 px-4 py-2.5 text-slate-700 dark:text-slate-300 hover:bg-violet-50 dark:hover:bg-violet-900/30 hover:text-violet-600 dark:hover:text-violet-400 text-sm transition"
                              onClick={() => setShowUserDropdown(false)}
                            >
                              <User className="w-4 h-4" />
                              Profile
                            </Link>
                          </>
                        )}
                        <Link
                          to="/change-password"
                          className="flex items-center gap-3 px-4 py-2.5 text-slate-700 dark:text-slate-300 hover:bg-violet-50 dark:hover:bg-violet-900/30 hover:text-violet-600 dark:hover:text-violet-400 text-sm transition"
                          onClick={() => setShowUserDropdown(false)}
                        >
                          <Settings className="w-4 h-4" />
                          Change Password
                        </Link>
                      </div>
                      <div className="border-t border-slate-100 dark:border-slate-700 pt-2 mt-2">
                        <button
                          onClick={() => {
                            setShowUserDropdown(false);
                            handleLogout();
                          }}
                          className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 text-sm transition cursor-pointer"
                        >
                          <LogOut className="w-4 h-4" />
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3 ml-4">
                <Link to="/login" className={navLinkClass}>
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 text-sm cursor-pointer"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {showMobileMenu && (
        <div className="md:hidden bg-white dark:bg-slate-800 border-t border-slate-200/50 dark:border-slate-800/50">
          <div className="px-4 py-4 space-y-2">
            <Link to="/courses" className={mobileNavLinkClass} onClick={() => setShowMobileMenu(false)}>
              Courses
            </Link>
            {user ? (
              <>
                {user.role === 'admin' && (
                  <>
                    <Link to="/admin" className={mobileNavLinkClass} onClick={() => setShowMobileMenu(false)}>
                      Manage
                    </Link>
                    <Link to="/admin/tracking" className={mobileNavLinkClass} onClick={() => setShowMobileMenu(false)}>
                      Tracking
                    </Link>
                    <Link to="/admin/attendance" className={mobileNavLinkClass} onClick={() => setShowMobileMenu(false)}>
                      Attendance
                    </Link>
                    <Link to="/admin/results" className={mobileNavLinkClass} onClick={() => setShowMobileMenu(false)}>
                      Results
                    </Link>
                  </>
                )}
                {user.role === 'student' && (
                  <>
                    <Link to="/my-courses" className={mobileNavLinkClass} onClick={() => setShowMobileMenu(false)}>
                      My Courses
                    </Link>
                    <Link to="/profile" className={mobileNavLinkClass} onClick={() => setShowMobileMenu(false)}>
                      Profile
                    </Link>
                  </>
                )}
                <button
                  onClick={() => { toggleTheme(); setShowMobileMenu(false); }}
                  className="block w-full text-left px-4 py-3 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-violet-50 dark:hover:bg-violet-900/30 hover:text-violet-600 dark:hover:text-violet-400 transition duration-200 cursor-pointer"
                >
                  {isDark ? 'Light Mode' : 'Dark Mode'}
                </button>
                <hr className="my-3 border-slate-200 dark:border-slate-700" />
                <Link to="/change-password" className={mobileNavLinkClass} onClick={() => setShowMobileMenu(false)}>
                  Change Password
                </Link>
                <button
                  onClick={() => { setShowMobileMenu(false); handleLogout(); }}
                  className="block w-full text-left px-4 py-3 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition duration-200 font-medium cursor-pointer"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className={mobileNavLinkClass} onClick={() => setShowMobileMenu(false)}>
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block w-full text-left px-4 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold transition duration-200 cursor-pointer"
                  onClick={() => setShowMobileMenu(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
});

Navbar.displayName = 'Navbar';
export default Navbar;
