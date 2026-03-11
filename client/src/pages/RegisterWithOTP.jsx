import { useState, memo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RegisterWithOTP = memo(() => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const { sendRegisterOTP, registerWithOTP, googleAuth } = useAuth();
  const navigate = useNavigate();

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await sendRegisterOTP(name, email, password);
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

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await registerWithOTP(name, email, password, otp);
    setLoading(false);
    if (result.success) {
      navigate('/courses');
    } else {
      setError(result.message);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    setLoading(true);
    const result = await sendRegisterOTP(name, email, password);
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

  const handleGoogleLogin = async (response) => {
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

  return (
    <div className="max-w-md mx-auto px-4 py-8 sm:py-16">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 sm:p-8">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-white">
          {step === 1 ? 'Create Account' : 'Verify Email'}
        </h2>
        {error && (
          <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-4 text-sm sm:text-base">
            {error}
          </div>
        )}
        
        {step === 1 ? (
          <form onSubmit={handleSendOTP}>
            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 mb-2 text-sm sm:text-base">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm sm:text-base"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 mb-2 text-sm sm:text-base">Gmail Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm sm:text-base"
                placeholder="yourname@gmail.com"
                required
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Only Gmail addresses are allowed</p>
            </div>
            <div className="mb-6">
              <label className="block text-gray-700 dark:text-gray-300 mb-2 text-sm sm:text-base">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm sm:text-base"
                required
                minLength={6}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 sm:py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm sm:text-base"
            >
              {loading ? 'Sending OTP...' : 'Send Verification Code'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerify}>
            <div className="mb-4">
              <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm sm:text-base">
                We've sent a 6-digit verification code to<br />
                <span className="font-semibold text-blue-600 dark:text-blue-400">{email}</span>
              </p>
              <label className="block text-gray-700 dark:text-gray-300 mb-2 text-sm sm:text-base">Verification Code</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-center text-xl tracking-widest font-mono text-sm sm:text-base"
                placeholder="000000"
                maxLength={6}
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full bg-blue-600 text-white py-2 sm:py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm sm:text-base"
            >
              {loading ? 'Verifying...' : 'Verify & Create Account'}
            </button>
            <div className="mt-4 text-center">
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
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 dark:text-blue-400 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
});

export default RegisterWithOTP;
