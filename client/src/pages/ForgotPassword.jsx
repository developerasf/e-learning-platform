import { useState, memo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ForgotPassword = memo(() => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [success, setSuccess] = useState('');
  const { forgotPassword, resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await forgotPassword(email);
    setLoading(false);
    if (result.success) {
      setStep(2);
      setResendTimer(60);
      const timer = setInterval(() => {
        setResendTimer(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setError(result.message);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setError('');
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    setLoading(true);
    const result = await resetPassword(email, otp, newPassword);
    setLoading(false);
    if (result.success) {
      setSuccess('Password reset successfully!');
      setTimeout(() => navigate('/login'), 2000);
    } else {
      setError(result.message);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    setLoading(true);
    const result = await forgotPassword(email);
    setLoading(false);
    if (result.success) {
      setResendTimer(60);
      const timer = setInterval(() => {
        setResendTimer(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-8 sm:py-12 md:py-16">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sm:p-8 md:p-10">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8 text-gray-900 dark:text-white">
          {step === 1 ? 'Forgot Password' : 'Reset Password'}
        </h2>
        
        {success && (
          <div className="bg-green-100 dark:bg-green-900/30 border border-green-400 text-green-700 dark:text-green-300 px-4 py-3 rounded mb-4 text-sm sm:text-base">
            {success}
          </div>
        )}
        
        {error && (
          <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-4 text-sm sm:text-base">
            {error}
          </div>
        )}
        
        {step === 1 ? (
          <form onSubmit={handleSendOTP}>
            <div className="mb-6 sm:mb-8">
              <label className="block text-gray-700 dark:text-gray-300 mb-2 text-sm sm:text-base">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm sm:text-base"
                placeholder="yourname@gmail.com"
                required
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Enter your email to receive a reset code</p>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 dark:bg-blue-600 text-white py-3 sm:py-4 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-700 disabled:opacity-50 text-base sm:text-lg font-medium"
            >
              {loading ? 'Sending...' : 'Send Reset Code'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleReset}>
            <div className="mb-5 sm:mb-6">
              <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm sm:text-base">
                Enter the code sent to<br />
                <span className="font-semibold text-blue-600 dark:text-blue-400">{email}</span>
              </p>
              <label className="block text-gray-700 dark:text-gray-300 mb-2 text-sm sm:text-base">Verification Code</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full px-4 py-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-center text-xl tracking-widest font-mono text-sm sm:text-base"
                placeholder="000000"
                maxLength={6}
                required
              />
            </div>
            <div className="mb-5 sm:mb-6">
              <label className="block text-gray-700 dark:text-gray-300 mb-2 text-sm sm:text-base">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm sm:text-base"
                placeholder="Min 6 characters"
                required
                minLength={6}
              />
            </div>
            <div className="mb-6 sm:mb-8">
              <label className="block text-gray-700 dark:text-gray-300 mb-2 text-sm sm:text-base">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm sm:text-base"
                placeholder="Confirm password"
                required
                minLength={6}
              />
            </div>
            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full bg-blue-600 dark:bg-blue-600 text-white py-3 sm:py-4 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-700 disabled:opacity-50 text-base sm:text-lg font-medium"
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
            <div className="mt-5 sm:mt-6 text-center">
              {resendTimer > 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">Resend code in {resendTimer}s</p>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  className="text-blue-600 dark:text-blue-400 hover:underline text-sm sm:text-base"
                >
                  Resend Code
                </button>
              )}
            </div>
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-gray-600 dark:text-gray-400 hover:underline text-sm sm:text-base"
              >
                Change Email
              </button>
            </div>
          </form>
        )}
        
        <p className="text-center mt-6 text-gray-600 dark:text-gray-400 text-sm sm:text-base">
          Remember your password?{' '}
          <Link to="/login" className="text-blue-600 dark:text-blue-400 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
});

export default ForgotPassword;
