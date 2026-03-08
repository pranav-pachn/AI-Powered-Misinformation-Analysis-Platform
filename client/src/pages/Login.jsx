import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BiLogIn, BiEnvelope, BiLock, BiCheckCircle, BiShield, BiLink, BiLoaderAlt } from 'react-icons/bi';
import { GoogleLogin } from '@react-oauth/google';
import { useUser } from '../context/UserContext';
import { useToast } from '../context/ToastContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useUser();
  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      login(data.user, data.token);
      showToast('Login successful!');
      navigate('/');
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setLoading(true);

      const response = await fetch('http://localhost:5000/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: credentialResponse.credential }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Google login failed');
      }

      login(data.user, data.token);
      showToast('Logged in with Google!');
      navigate('/');
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-transition min-h-screen bg-[#0f172a] overflow-hidden relative">
      {/* Animated Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0f172a] via-[#1a1f3a] to-[#0f172a] opacity-60"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-l from-indigo-600/5 to-transparent rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-r from-indigo-600/5 to-transparent rounded-full blur-3xl"></div>

      {/* Content Container */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-8 lg:py-12">
        <div className="w-full max-w-7xl">
          {/* Header Logo - Mobile Only */}
          <div className="lg:hidden text-center mb-12 animate-fade-in">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-2.5 bg-gradient-to-br from-[#6366f1] to-indigo-600 rounded-lg shadow-lg shadow-indigo-600/20">
                <BiCheckCircle className="text-white text-2xl" />
              </div>
              <h1 className="text-2xl font-bold text-slate-100">AI Fact Checker</h1>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-12 items-center">
            
            {/* LEFT COLUMN - BRANDING PANEL (Desktop Only) */}
            <div className="hidden lg:flex flex-col justify-center animate-fade-in opacity-0" style={{animationDelay: '0.1s', animation: 'fadeInUp 0.8s ease-out 0.1s forwards'}}>
              {/* Premium Branding Section */}
              <div className="relative">
                {/* Glassmorphism Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-800/10 to-indigo-600/5 rounded-3xl blur-2xl opacity-50"></div>
                
                <div className="relative p-8 lg:p-0 lg:pb-12">
                  {/* App Logo & Title */}
                  <div className="flex items-start gap-4 mb-8">
                    <div className="p-4 bg-gradient-to-br from-[#6366f1] to-indigo-600 rounded-2xl shadow-2xl shadow-indigo-600/30 flex-shrink-0">
                      <BiCheckCircle className="text-white text-3xl" />
                    </div>
                    <div>
                      <h2 className="text-3xl lg:text-4xl font-black bg-gradient-to-r from-slate-100 via-indigo-200 to-indigo-400 bg-clip-text text-transparent leading-tight mb-2">
                        AI Fact Checker
                      </h2>
                      <p className="text-indigo-400 font-bold text-sm tracking-widest uppercase">Intelligent Verification</p>
                    </div>
                  </div>

                  {/* Main Headline */}
                  <h3 className="text-2xl lg:text-3xl font-bold text-slate-100 mb-4 leading-snug">
                    AI-Powered Misinformation Analysis
                  </h3>

                  {/* Description */}
                  <p className="text-slate-300 text-lg mb-12 leading-relaxed max-w-lg">
                    Claim-level verification, bias detection, and explainable AI insights.
                  </p>

                  {/* Feature Bullets */}
                  <div className="space-y-4 mb-12">
                    {/* Feature 1 */}
                    <div className="group flex items-start gap-4 p-4 rounded-xl bg-slate-800/20 hover:bg-slate-800/40 border border-slate-700/30 hover:border-indigo-500/50 transition-all duration-300 backdrop-blur-sm">
                      <div className="p-3 bg-gradient-to-br from-indigo-600/30 to-indigo-500/10 rounded-lg flex-shrink-0 group-hover:from-indigo-600/40 group-hover:to-indigo-500/20 transition-all duration-300">
                        <BiCheckCircle className="text-indigo-300 text-xl" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-100 text-sm">Claim Extraction</p>
                        <p className="text-slate-400 text-xs mt-0.5">Automatically identify and analyze key claims</p>
                      </div>
                    </div>

                    {/* Feature 2 */}
                    <div className="group flex items-start gap-4 p-4 rounded-xl bg-slate-800/20 hover:bg-slate-800/40 border border-slate-700/30 hover:border-indigo-500/50 transition-all duration-300 backdrop-blur-sm">
                      <div className="p-3 bg-gradient-to-br from-indigo-600/30 to-indigo-500/10 rounded-lg flex-shrink-0 group-hover:from-indigo-600/40 group-hover:to-indigo-500/20 transition-all duration-300">
                        <BiShield className="text-indigo-300 text-xl" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-100 text-sm">Bias Detection</p>
                        <p className="text-slate-400 text-xs mt-0.5">Detect political, cultural, and contextual biases</p>
                      </div>
                    </div>

                    {/* Feature 3 */}
                    <div className="group flex items-start gap-4 p-4 rounded-xl bg-slate-800/20 hover:bg-slate-800/40 border border-slate-700/30 hover:border-indigo-500/50 transition-all duration-300 backdrop-blur-sm">
                      <div className="p-3 bg-gradient-to-br from-indigo-600/30 to-indigo-500/10 rounded-lg flex-shrink-0 group-hover:from-indigo-600/40 group-hover:to-indigo-500/20 transition-all duration-300">
                        <BiLink className="text-indigo-300 text-xl" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-100 text-sm">URL Verification</p>
                        <p className="text-slate-400 text-xs mt-0.5">Real-time verification of article sources</p>
                      </div>
                    </div>
                  </div>

                  {/* Trust Badge */}
                  <div className="pt-8 border-t border-slate-700/50">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-2 h-2 rounded-full bg-indigo-400"></div>
                      <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold">Enterprise Grade</p>
                    </div>
                    <p className="text-slate-300 font-medium text-sm">Trusted by thousands of fact-checkers worldwide</p>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN - LOGIN CARD */}
            <div className="animate-fade-in opacity-0" style={{animationDelay: '0.2s', animation: 'fadeInUp 0.8s ease-out 0.2s forwards'}}>
              {/* Premium Login Card */}
              <div className="relative group">
                {/* Gradient Border Effect */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-600/20 to-indigo-400/10 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-500 lg:opacity-0"></div>

                {/* Main Card */}
                <div className="relative bg-[#1e293b]/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl shadow-indigo-600/10 p-8 lg:p-10">
                  
                  {/* Card Header */}
                  <div className="mb-8">
                    <h2 className="text-3xl font-bold text-slate-100 mb-2">Welcome Back</h2>
                    <p className="text-slate-400 text-sm">Sign in to access your fact-checking dashboard</p>
                  </div>

                  {/* Login Form */}
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Email Field */}
                    <div className="group">
                      <label className="block text-sm font-semibold text-slate-300 mb-2.5 group-focus-within:text-indigo-400 transition-colors">
                        Email Address
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                          <BiEnvelope className="text-lg" />
                        </div>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@company.com"
                          required
                          className="w-full pl-12 pr-4 py-3.5 bg-slate-800/40 border border-slate-700/60 hover:border-slate-600/60 focus:border-indigo-500 focus:bg-slate-800/60 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all duration-300"
                        />
                      </div>
                    </div>

                    {/* Password Field */}
                    <div className="group">
                      <div className="flex items-center justify-between mb-2.5">
                        <label className="block text-sm font-semibold text-slate-300 group-focus-within:text-indigo-400 transition-colors">
                          Password
                        </label>
                        <Link
                          to="#"
                          className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                        >
                          Forgot?
                        </Link>
                      </div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                          <BiLock className="text-lg" />
                        </div>
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          required
                          className="w-full pl-12 pr-4 py-3.5 bg-slate-800/40 border border-slate-700/60 hover:border-slate-600/60 focus:border-indigo-500 focus:bg-slate-800/60 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all duration-300"
                        />
                      </div>
                    </div>

                    {/* Sign In Button */}
                    <button
                      type="submit"
                      disabled={loading}
                      className={`w-full py-3.5 mt-8 bg-gradient-to-r from-[#6366f1] to-indigo-600 hover:from-[#6366f1]/95 hover:to-indigo-600/95 text-white font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2.5 shadow-lg shadow-indigo-600/30 hover:shadow-xl hover:shadow-indigo-600/40 ${
                        loading ? 'opacity-90' : 'hover:scale-[1.02] active:scale-[0.98]'
                      } disabled:opacity-70 disabled:cursor-not-allowed`}
                    >
                      {loading ? (
                        <>
                          <BiLoaderAlt className="text-lg animate-spin" />
                          <span>Signing in...</span>
                        </>
                      ) : (
                        <>
                          <BiLogIn className="text-lg" />
                          <span>Sign In</span>
                        </>
                      )}
                    </button>

                    {/* Trust Text */}
                    <p className="text-xs text-slate-500 text-center mt-4">
                      🔒 Secure authentication. Your data is encrypted and protected.
                    </p>
                  </form>

                  {/* Divider */}
                  <div className="flex items-center gap-3 my-7">
                    <span className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-700/50 to-transparent"></span>
                    <span className="text-xs text-slate-500 uppercase tracking-widest font-semibold">Or continue with</span>
                    <span className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-700/50 to-transparent"></span>
                  </div>

                  {/* Google Login */}
                  <div className="flex justify-center mb-8">
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={() => showToast('Google login failed', 'error')}
                      theme="outline"
                      shape="pill"
                      width="100%"
                    />
                  </div>

                  {/* Sign Up Link */}
                  <p className="text-center text-slate-400 text-sm">
                    Don't have an account?{' '}
                    <Link
                      to="/signup"
                      className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors hover:underline"
                    >
                      Create account
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fadeInUp 0.8s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
