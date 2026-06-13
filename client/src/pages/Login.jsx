import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BiLogIn, BiEnvelope, BiLock, BiCheckCircle, BiShield, BiLink, BiLoaderAlt } from 'react-icons/bi';
import { Layers } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { useUser } from '../context/UserContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';

const FEATURES = [
  { icon: BiCheckCircle, color: 'text-[#6366f1]', bg: 'bg-[#6366f1]/10', title: 'Claim Extraction',  desc: 'Automatically identify and analyze key claims' },
  { icon: BiShield,      color: 'text-[#22c55e]', bg: 'bg-[#22c55e]/10', title: 'Bias Detection',    desc: 'Detect political, cultural, and contextual biases' },
  { icon: BiLink,        color: 'text-sky-400',   bg: 'bg-sky-400/10',   title: 'URL Verification',  desc: 'Real-time verification of article sources' },
];

export default function Login() {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
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
      const response = await api.post('/auth/login', { email, password });
      const data = response.data;
      login(data.user, data.token);
      showToast('Login successful!');
      navigate('/app');
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setLoading(true);
      const response = await api.post('/auth/google', { credential: credentialResponse.credential });
      const data = response.data;
      login(data.user, data.token);
      showToast('Logged in with Google!');
      navigate('/app');
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-transition min-h-screen bg-[#020617] overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-br from-[#020617] via-[#0d1526] to-[#020617]" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#6366f1]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#6366f1]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12 lg:py-16">
        <div className="w-full max-w-7xl">

          {/* Mobile header */}
          <div className="lg:hidden text-center mb-10">
            <div className="flex items-center justify-center gap-2.5 mb-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg overflow-hidden shrink-0">
                <img src="/favicon.png" alt="FactLens AI" className="w-full h-full object-cover" />
              </div>
              <span className="font-semibold text-white text-lg">FactLens AI</span>
            </div>
            <p className="text-sm text-slate-400">See the truth behind the headlines.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* ── LEFT — Branding panel ── */}
            <div className="hidden lg:flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-8">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl overflow-hidden shrink-0">
                  <img src="/favicon.png" alt="FactLens AI" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white leading-none">FactLens AI</h2>
                  <p className="text-[#6366f1] text-xs font-semibold uppercase tracking-widest mt-0.5">Intelligent Verification</p>
                </div>
              </div>

              <h3 className="text-3xl lg:text-4xl font-black text-white leading-tight mb-4">
                AI-Powered Misinformation<br />Analysis
              </h3>
              <p className="text-slate-400 text-base mb-10 leading-relaxed max-w-md">
                Claim-level verification, bias detection, and explainable AI insights — all in seconds.
              </p>

              <div className="space-y-3 mb-10">
                {FEATURES.map(({ icon: Icon, color, bg, title, desc }) => (
                  <div key={title} className="flex items-start gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/5 hover:border-[#6366f1]/20 transition-all duration-300">
                    <div className={`p-2.5 rounded-lg ${bg} flex-shrink-0`}>
                      <Icon className={`text-lg ${color}`} />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-100 text-sm">{title}</p>
                      <p className="text-slate-500 text-xs mt-0.5 leading-relaxed">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2 pt-6 border-t border-white/5">
                <div className="flex -space-x-2">
                  {['#6366f1','#22c55e','#38bdf8'].map((c) => (
                    <div key={c} className="w-7 h-7 rounded-full border-2 border-[#020617]" style={{ background: c }} />
                  ))}
                </div>
                <p className="text-slate-400 text-xs ml-1">Trusted by 50,000+ fact-checkers worldwide</p>
              </div>
            </div>

            {/* ── RIGHT — Login card ── */}
            <div>
              <div className="bg-[#0d1526]/80 backdrop-blur-xl border border-white/8 rounded-2xl shadow-2xl shadow-[#6366f1]/5 p-8 lg:p-10">

                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-white mb-1">Welcome back</h2>
                  <p className="text-slate-400 text-sm">Sign in to your fact-checking dashboard</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="group">
                    <label htmlFor="login-email" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 group-focus-within:text-[#6366f1] transition-colors">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-600 group-focus-within:text-[#6366f1] transition-colors">
                        <BiEnvelope className="text-lg" />
                      </div>
                      <input
                        id="login-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@company.com"
                        required
                        className="w-full pl-10 pr-4 py-3 bg-white/[0.04] border border-white/8 hover:border-white/15 focus:border-[#6366f1]/60 focus:bg-white/[0.06] rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-[#6366f1]/30 transition-all duration-200 text-sm"
                      />
                    </div>
                  </div>

                  <div className="group">
                    <div className="flex items-center justify-between mb-2">
                      <label htmlFor="login-password" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 group-focus-within:text-[#6366f1] transition-colors">
                        Password
                      </label>
                      <Link to="#" className="text-xs text-[#6366f1] hover:text-indigo-300 font-medium transition-colors">Forgot?</Link>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-600 group-focus-within:text-[#6366f1] transition-colors">
                        <BiLock className="text-lg" />
                      </div>
                      <input
                        id="login-password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="w-full pl-10 pr-4 py-3 bg-white/[0.04] border border-white/8 hover:border-white/15 focus:border-[#6366f1]/60 focus:bg-white/[0.06] rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-[#6366f1]/30 transition-all duration-200 text-sm"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 mt-2 rounded-xl font-bold text-sm tracking-wide text-white bg-[#6366f1] hover:bg-[#5254cc] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-[#6366f1]/20"
                  >
                    {loading
                      ? <><BiLoaderAlt className="animate-spin text-lg" /> Signing in...</>
                      : <><BiLogIn className="text-lg" /> Sign In</>}
                  </button>
                </form>

                <div className="flex items-center gap-3 my-6">
                  <span className="h-px flex-1 bg-white/6" />
                  <span className="text-xs text-slate-600 uppercase tracking-widest">Or continue with</span>
                  <span className="h-px flex-1 bg-white/6" />
                </div>

                {googleClientId ? (
                  <div className="flex justify-center mb-7">
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={() => showToast('Google login failed', 'error')}
                      theme="filled_black"
                      shape="pill"
                      width="320"
                    />
                  </div>
                ) : (
                  <div className="mb-7 rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3 text-center text-xs text-slate-500">
                    Google sign-in is disabled in this environment.
                  </div>
                )}

                <p className="text-center text-slate-500 text-sm">
                  Don't have an account?{' '}
                  <Link to="/signup" className="text-[#6366f1] hover:text-indigo-300 font-semibold transition-colors">Create account</Link>
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

