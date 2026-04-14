import { memo } from "react";
import { Link } from "react-router-dom";

const Footer = memo(() => (
  <footer className="bg-gray-900 dark:bg-black text-gray-300 dark:text-gray-400 border-t border-gray-800 dark:border-gray-700 mt-auto">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 md:py-12">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-8">
        {/* Brand */}
        <div className="col-span-1 sm:col-span-2 lg:col-span-1">
          <h3 className="text-white font-bold text-lg mb-3 flex items-center gap-3">
            <img src="/logo.png" alt="Bipul's Classroom" className="h-8 w-auto" />

          </h3>
          <p className="text-sm text-gray-400">
            Unlock your potential with expert-led video courses
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-white font-semibold text-sm mb-4">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <Link
                to="/courses"
                className="text-gray-400 hover:text-violet-400 transition duration-200"
              >
                Browse Courses
              </Link>
            </li>
            <li>
              <Link
                to="/register"
                className="text-gray-400 hover:text-violet-400 transition duration-200"
              >
                Get Started
              </Link>
            </li>
            <li>
              <Link
                to="/login"
                className="text-gray-400 hover:text-violet-400 transition duration-200"
              >
                Sign In
              </Link>
            </li>
          </ul>
        </div>

        {/* Support */}
        <div>
          <h4 className="text-white font-semibold text-sm mb-4">Support</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <Link
                to="/profile"
                className="text-gray-400 hover:text-violet-400 transition duration-200"
              >
                My Profile
              </Link>
            </li>
            <li>
              <Link
                to="/change-password"
                className="text-gray-400 hover:text-violet-400 transition duration-200"
              >
                Change Password
              </Link>
            </li>
            <li>
              <a
                href="https://github.com/developerasf"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-violet-400 transition duration-200"
              >
                GitHub
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-800 dark:border-gray-700 pt-6 sm:pt-8">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
          <p className="text-xs sm:text-sm text-gray-400">
            &copy; 2024 Bipul's Classroom. All rights reserved.
          </p>
          <p className="text-xs sm:text-sm text-gray-400">
            Developed by{" "}
            <a
              href="https://developerasf.github.io"
              target="_blank"
              rel="noopener noreferrer"
              className="text-violet-400 hover:text-violet-300 font-medium transition duration-200"
            >
              @Developerasf
            </a>
          </p>
        </div>
      </div>
    </div>
  </footer>
));

Footer.displayName = "Footer";
export default Footer;
