import { useState, memo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, BookOpen, ArrowRight, Loader2 } from 'lucide-react';

const Login = memo(() => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login, googleAuth } = useAuth();
  const navigate = useNavigate();

  const handleGoogleResponse = async (response) => {
    if (!response.credential) return;
    
    const decoded = JSON.parse(atob(response.credential.split('.')[1]));
    
    setLoading(true);
    const result = await googleAuth(
      decoded.sub,
      decoded.name,
      decoded.email,
      decoded.picture
    );
    setLoading(false);
    
    if (result.success) {
      navigate(result.user?.role === 'admin' ? '/admin' : '/courses');
    } else {
      setError(result.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result.success) {
      navigate(result.user?.role === 'admin' ? '/admin' : '/courses');
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center px-4 py-12">
      {/* Background Decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-64 h-64 bg-violet-200 dark:bg-violet-900/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-64 h-64 bg-emerald-200 dark:bg-emerald-900/20 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-3 mb-8">
          <div className="w-14 h-14 bg-gradient-to-br from-violet-600 to-violet-700 rounded-2xl flex items-center justify-center shadow-lg">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
        </Link>

        {/* Card */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700 p-8 sm:p-10">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-2">
              Welcome Back
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Sign in to continue your learning journey
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl mb-6">
              <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <span className="text-lg">⚠</span>
              </div>
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-slate-700 dark:text-slate-300 font-medium mb-2 text-sm">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-12 pr-4 py-4 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-base transition duration-200"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="password" className="block text-slate-700 dark:text-slate-300 font-medium text-sm">
                  Password
                </label>
                <Link 
                  to="/forgot-password" 
                  className="text-sm text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 font-medium transition duration-200 cursor-pointer"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-4 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-base transition duration-200"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white py-4 rounded-xl font-bold text-base transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400">Or continue with</span>
            </div>
          </div>

          {/* Google Button Placeholder */}
          <div className="text-center text-sm text-slate-500 dark:text-slate-400">
            <span>Google OAuth available</span>
          </div>

          {/* Sign Up Link */}
          <p className="text-center text-slate-600 dark:text-slate-400 mt-8">
            Don't have an account?{' '}
            <Link 
              to="/register" 
              className="text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 font-semibold transition duration-200 cursor-pointer"
            >
              Create one
            </Link>
          </p>
        </div>

        {/* Back Link */}
        <div className="text-center mt-6">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 text-sm font-medium transition duration-200 cursor-pointer"
          >
            <ArrowRight className="w-4 h-4 rotate-180" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
});

Login.displayName = 'Login';
export default Login;