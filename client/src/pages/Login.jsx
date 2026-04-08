import { useState, memo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = memo(() => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
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
    <div className="max-w-lg mx-auto px-4 py-8 sm:py-12 md:py-16">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sm:p-8 md:p-10">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8 text-gray-900 dark:text-white">Login</h2>
        {error && (
          <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-5 sm:mb-6">
            <label className="block text-gray-700 dark:text-gray-300 mb-2 text-sm sm:text-base">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm sm:text-base"
              required
            />
          </div>
          <div className="mb-6 sm:mb-8">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-gray-700 dark:text-gray-300 text-sm sm:text-base">Password</label>
              <Link to="/forgot-password" className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 hover:underline">
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm sm:text-base"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 dark:bg-blue-600 text-white py-3 sm:py-4 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-700 disabled:opacity-50 text-base sm:text-lg font-medium"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        
        <p className="text-center mt-5 sm:mt-6 text-gray-600 dark:text-gray-400 text-sm sm:text-base">
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
});

export default Login;
