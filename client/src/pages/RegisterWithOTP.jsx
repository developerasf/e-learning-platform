import { useState, memo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, Eye, EyeOff, BookOpen, ArrowRight, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';

const RegisterWithOTP = memo(() => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center px-4 py-12">
      {/* Background Decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -right-32 w-64 h-64 bg-violet-200 dark:bg-violet-900/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -left-32 w-64 h-64 bg-emerald-200 dark:bg-emerald-900/20 rounded-full blur-3xl" />
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
              {step === 1 ? 'Create Account' : 'Verify Email'}
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              {step === 1 ? 'Start your learning journey today' : 'Enter the code sent to your email'}
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${step >= 1 ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400' : 'bg-slate-100 dark:bg-slate-700 text-slate-400'}`}>
              <span className="w-6 h-6 rounded-full bg-violet-600 text-white text-xs flex items-center justify-center font-bold">1</span>
              <span className="text-sm font-medium">Details</span>
            </div>
            <div className="w-8 h-0.5 bg-slate-200 dark:bg-slate-600" />
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${step >= 2 ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-700 text-slate-400'}`}>
              <span className="w-6 h-6 rounded-full bg-emerald-500 text-white text-xs flex items-center justify-center font-bold">2</span>
              <span className="text-sm font-medium">Verify</span>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl mb-6">
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}
          
          {step === 1 ? (
            <form onSubmit={handleSendOTP} className="space-y-5">
              {/* Name Field */}
              <div>
                <label htmlFor="name" className="block text-slate-700 dark:text-slate-300 font-medium mb-2 text-sm">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full pl-12 pr-4 py-4 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-base transition duration-200"
                    required
                  />
                </div>
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-slate-700 dark:text-slate-300 font-medium mb-2 text-sm">
                  Gmail Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="yourname@gmail.com"
                    className="w-full pl-12 pr-4 py-4 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-base transition duration-200"
                    required
                  />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Only Gmail addresses are allowed</p>
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-slate-700 dark:text-slate-300 font-medium mb-2 text-sm">
                  Password
                </label>
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
                    minLength={6}
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
                    Sending Code...
                  </>
                ) : (
                  <>
                    Send Verification Code
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerify} className="space-y-6">
              {/* Email Info */}
              <div className="flex items-center gap-3 p-4 bg-violet-50 dark:bg-violet-900/20 rounded-xl border border-violet-200 dark:border-violet-800">
                <CheckCircle className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                <span className="text-sm text-violet-700 dark:text-violet-300">
                  Code sent to <span className="font-semibold">{email}</span>
                </span>
              </div>

              {/* OTP Field */}
              <div>
                <label htmlFor="otp" className="block text-slate-700 dark:text-slate-300 font-medium mb-2 text-sm text-center">
                  6-Digit Verification Code
                </label>
                <input
                  id="otp"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full px-4 py-5 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-center text-2xl tracking-[0.5em] font-mono transition duration-200"
                  placeholder="000000"
                  maxLength={6}
                  required
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white py-4 rounded-xl font-bold text-base transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    Verify & Create Account
                    <CheckCircle className="w-5 h-5" />
                  </>
                )}
              </button>

              {/* Resend & Change Email */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                {resendTimer > 0 ? (
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    Resend code in <span className="font-semibold text-violet-600 dark:text-violet-400">{resendTimer}s</span>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={loading}
                    className="text-sm text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 font-medium transition cursor-pointer"
                  >
                    Resend Code
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition cursor-pointer"
                >
                  Change Email
                </button>
              </div>
            </form>
          )}
          
          {/* Login Link */}
          <p className="text-center text-slate-600 dark:text-slate-400 mt-8">
            Already have an account?{' '}
            <Link to="/login" className="text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 font-semibold transition duration-200 cursor-pointer">
              Sign in
            </Link>
          </p>
        </div>

        {/* Back Link */}
        <div className="text-center mt-6">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 text-sm font-medium transition duration-200 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
});

RegisterWithOTP.displayName = 'RegisterWithOTP';
export default RegisterWithOTP;