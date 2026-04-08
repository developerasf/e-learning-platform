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

  return (
    <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm border-b border-gray-100 dark:border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4">
        <div className="flex justify-between h-14 sm:h-16 items-center">
          <Link 
            to="/" 
            className="flex items-center"
          >
            <img 
              src="/logo.png" 
              alt="Bipul's Classroom" 
              className="h-8 sm:h-10 w-auto"
            />
          </Link>
          
          <button 
            className="sm:hidden p-2"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
          >
            <svg className="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {showMobileMenu ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
          
          <div className="hidden sm:flex items-center gap-6">
            <Link 
              to="/courses" 
              className="text-gray-600 dark:text-gray-300 hover:text-violet-600 dark:hover:text-violet-400 font-medium transition text-sm sm:text-base"
            >
              Courses
            </Link>
            {user ? (
              <>
                {user.role === 'admin' && (
                  <>
                    <Link 
                      to="/admin" 
                      className="text-gray-600 dark:text-gray-300 hover:text-violet-600 dark:hover:text-violet-400 font-medium transition text-sm sm:text-base"
                    >
                      Manage
                    </Link>
                    <Link 
                      to="/admin/tracking" 
                      className="text-gray-600 dark:text-gray-300 hover:text-violet-600 dark:hover:text-violet-400 font-medium transition text-sm sm:text-base"
                    >
                      Tracking
                    </Link>
                  </>
                )}
                {user.role === 'student' && (
                  <>
                    <Link 
                      to="/my-courses" 
                      className="text-gray-600 dark:text-gray-300 hover:text-violet-600 dark:hover:text-violet-400 font-medium transition text-sm sm:text-base"
                    >
                      My Courses
                    </Link>
                    <Link 
                      to="/profile" 
                      className="text-gray-600 dark:text-gray-300 hover:text-violet-600 dark:hover:text-violet-400 font-medium transition text-sm sm:text-base"
                    >
                      Profile
                    </Link>
                  </>
                )}
                <button 
                  onClick={toggleTheme}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                  title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                  {isDark ? (
                    <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                    </svg>
                  )}
                </button>
                <div className="relative">
                  <button 
                    onClick={() => setShowUserDropdown(!showUserDropdown)}
                    className="flex items-center gap-2 sm:gap-3"
                  >
                    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-semibold text-xs sm:text-sm">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-gray-700 dark:text-gray-300 font-medium text-sm sm:text-base">{user.name}</span>
                    <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {showUserDropdown && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-100 dark:border-gray-700 py-2 z-50">
                      <Link 
                        to="/change-password" 
                        className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm"
                        onClick={() => setShowUserDropdown(false)}
                      >
                        Change Password
                      </Link>
                      <button 
                        onClick={() => {
                          setShowUserDropdown(false);
                          handleLogout();
                        }} 
                        className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 text-sm"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link 
                  to="/login" 
                  className="text-gray-600 dark:text-gray-300 hover:text-violet-600 dark:hover:text-violet-400 font-medium transition text-sm sm:text-base"
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-3 sm:px-5 py-1.5 sm:py-2 rounded-lg font-medium hover:shadow-lg hover:scale-105 transition-all text-sm sm:text-base"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {showMobileMenu && (
        <div className="sm:hidden bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
          <div className="px-3 py-2 space-y-2">
            <Link 
              to="/courses" 
              className="block py-2 text-gray-600 dark:text-gray-300 hover:text-violet-600"
              onClick={() => setShowMobileMenu(false)}
            >
              Courses
            </Link>
            {user ? (
              <>
                {user.role === 'admin' && (
                  <>
                    <Link 
                      to="/admin" 
                      className="block py-2 text-gray-600 dark:text-gray-300 hover:text-violet-600"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      Manage
                    </Link>
                    <Link 
                      to="/admin/tracking" 
                      className="block py-2 text-gray-600 dark:text-gray-300 hover:text-violet-600"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      Tracking
                    </Link>
                  </>
                )}
                {user.role === 'student' && (
                  <>
                    <Link 
                      to="/my-courses" 
                      className="block py-2 text-gray-600 dark:text-gray-300 hover:text-violet-600"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      My Courses
                    </Link>
                    <Link 
                      to="/profile" 
                      className="block py-2 text-gray-600 dark:text-gray-300 hover:text-violet-600"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      Profile
                    </Link>
                  </>
                )}
                <button 
                  onClick={() => {
                    toggleTheme();
                    setShowMobileMenu(false);
                  }}
                  className="block py-2 text-gray-600 dark:text-gray-300"
                >
                  {isDark ? 'Light Mode' : 'Dark Mode'}
                </button>
                <Link 
                  to="/change-password" 
                  className="block py-2 text-gray-600 dark:text-gray-300 hover:text-violet-600"
                  onClick={() => setShowMobileMenu(false)}
                >
                  Change Password
                </Link>
                <button 
                  onClick={() => {
                    setShowMobileMenu(false);
                    handleLogout();
                  }} 
                  className="block py-2 text-red-600"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="block py-2 text-gray-600 dark:text-gray-300 hover:text-violet-600"
                  onClick={() => setShowMobileMenu(false)}
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="block py-2 text-violet-600 dark:text-violet-400 font-medium"
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

export default Navbar;
