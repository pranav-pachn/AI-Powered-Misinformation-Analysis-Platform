import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  BiUserPlus, BiUser, BiEnvelope, BiLock, BiLoaderAlt,
  BiCheckCircle, BiShield, BiLink,
} from 'react-icons/bi';
import { Layers } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { useUser } from '../context/UserContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';

const FEATURES = [
  { icon: BiCheckCircle, color: 'text-[#6366f1]', bg: 'bg-[#6366f1]/10', title: 'Claim Extraction', desc: 'Identify and verify key factual claims automatically' },
  { icon: BiShield,      color: 'text-[#22c55e]', bg: 'bg-[#22c55e]/10', title: 'Bias Detection',   desc: 'Quantify political, cultural, and contextual biases' },
  { icon: BiLink,        color: 'text-sky-400',   bg: 'bg-sky-400/10',   title: 'URL Verification', desc: 'Real-time verification directly from article sources' },
];

export default function Signup() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useUser();
  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post('/auth/register', { username, email, password, confirmPassword });
      const data = response.data;
      login(data.user, data.token);
      showToast('Account created successfully!');
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
      showToast('Account created with Google!');
      navigate('/app');
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { id: 'username', label: 'Username',        type: 'text',     value: username,        onChange: setUsername,        placeholder: 'Choose a username', icon: BiUser,     min: 3, max: 50 },
    { id: 'email',    label: 'Email Address',    type: 'email',    value: email,           onChange: setEmail,           placeholder: 'you@company.com',   icon: BiEnvelope                },
    { id: 'password', label: 'Password',         type: 'password', value: password,        onChange: setPassword,        placeholder: '••••••••',          icon: BiLock,     min: 6         },
    { id: 'confirm',  label: 'Confirm Password', type: 'password', value: confirmPassword, onChange: setConfirmPassword, placeholder: '••••••••',          icon: BiLock,     min: 6         },
  ];

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

            {/* LEFT — Branding panel */}
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
                Join thousands verifying<br />the world's headlines.
              </h3>
              <p className="text-slate-400 text-base mb-10 leading-relaxed max-w-md">
                Create a free account and start analyzing news with claim-level verification, bias detection, and explainable AI — in seconds.
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
                  {['#6366f1', '#22c55e', '#38bdf8'].map((c) => (
                    <div key={c} className="w-7 h-7 rounded-full border-2 border-[#020617]" style={{ background: c }} />
                  ))}
                </div>
                <p className="text-slate-400 text-xs ml-1">Trusted by 50,000+ fact-checkers worldwide</p>
              </div>
            </div>

            {/* RIGHT — Signup form card */}
            <div>
              <div className="bg-[#0d1526]/80 backdrop-blur-xl border border-white/8 rounded-2xl shadow-2xl shadow-[#6366f1]/5 p-8 lg:p-10">

                <div className="mb-7">
                  <h2 className="text-2xl font-bold text-white mb-1">Create your account</h2>
                  <p className="text-slate-400 text-sm">Free forever. No credit card required.</p>
                </div>

                {/* Google sign-up — prominent at top */}
                <div className="flex justify-center mb-5">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => showToast('Google sign-up failed', 'error')}
                    theme="filled_black"
                    shape="pill"
                    width="320"
                    text="signup_with"
                  />
                </div>

                <div className="flex items-center gap-3 mb-5">
                  <span className="h-px flex-1 bg-white/6" />
                  <span className="text-xs text-slate-600 uppercase tracking-widest">Or sign up with email</span>
                  <span className="h-px flex-1 bg-white/6" />
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {fields.map(({ id, label, type, value, onChange, placeholder, icon: Icon, min, max }) => (
                    <div key={id} className="group">
                      <label htmlFor={id} className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 group-focus-within:text-[#6366f1] transition-colors">
                        {label}
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-600 group-focus-within:text-[#6366f1] transition-colors">
                          <Icon className="text-lg" />
                        </div>
                        <input
                          id={id}
                          type={type}
                          value={value}
                          onChange={(e) => onChange(e.target.value)}
                          placeholder={placeholder}
                          required
                          minLength={min}
                          maxLength={max}
                          className="w-full pl-10 pr-4 py-3 bg-white/[0.04] border border-white/8 hover:border-white/15 focus:border-[#6366f1]/60 focus:bg-white/[0.06] rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-[#6366f1]/30 transition-all duration-200 text-sm"
                        />
                      </div>
                    </div>
                  ))}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 mt-2 rounded-xl font-bold text-sm tracking-wide text-white bg-[#6366f1] hover:bg-[#5254cc] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-[#6366f1]/20"
                  >
                    {loading
                      ? <><BiLoaderAlt className="animate-spin text-lg" /> Creating account...</>
                      : <><BiUserPlus className="text-lg" /> Create Account</>}
                  </button>
                </form>

                <p className="text-center text-slate-500 text-sm mt-6">
                  Already have an account?{' '}
                  <Link to="/login" className="text-[#6366f1] hover:text-indigo-300 font-semibold transition-colors">
                    Sign in
                  </Link>
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

