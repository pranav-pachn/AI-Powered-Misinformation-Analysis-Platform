import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BiTargetLock,
  BiAnalyse,
  BiLinkAlt,
  BiCheckCircle,
  BiShield,
  BiData,
  BiSearch,
  BiArrowToRight,
} from 'react-icons/bi';
import GlobeBackground from '../components/GlobeBackground';
import { useUser } from '../context/UserContext';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] },
});

const features = [
  {
    icon: BiTargetLock,
    color: 'text-[#6366f1]',
    bg: 'bg-[#6366f1]/10',
    border: 'hover:border-[#6366f1]/40',
    title: 'Claim Extraction',
    desc: 'Automatically isolates factual assertions from rhetorical statements, directing verification where it matters most.',
  },
  {
    icon: BiShield,
    color: 'text-[#22c55e]',
    bg: 'bg-[#22c55e]/10',
    border: 'hover:border-[#22c55e]/40',
    title: 'Bias Detection',
    desc: 'Quantifies political, emotional, and cognitive framing across every sentence — with full transparency.',
  },
  {
    icon: BiLinkAlt,
    color: 'text-sky-400',
    bg: 'bg-sky-400/10',
    border: 'hover:border-sky-400/40',
    title: 'URL Verification',
    desc: 'Paste any article URL and get instant deep-context analysis: metadata, source credibility, and semantic checks.',
  },
  {
    icon: BiAnalyse,
    color: 'text-amber-400',
    bg: 'bg-amber-400/10',
    border: 'hover:border-amber-400/40',
    title: 'Explainable AI',
    desc: "Every verdict comes with reasoning. No black boxes — know exactly why a piece of news is flagged.",
  },
  {
    icon: BiData,
    color: 'text-rose-400',
    bg: 'bg-rose-400/10',
    border: 'hover:border-rose-400/40',
    title: 'Source Cross-Check',
    desc: 'Claims are verified against trusted knowledge bases and reference corpora in real time.',
  },
  {
    icon: BiSearch,
    color: 'text-purple-400',
    bg: 'bg-purple-400/10',
    border: 'hover:border-purple-400/40',
    title: 'History & Analytics',
    desc: "Track every article you've analyzed. Review trends, spot repeat offenders, and share verdicts easily.",
  },
];

const steps = [
  { num: '01', title: 'Paste or Link', desc: 'Drop in text, a headline, or a URL from any source.' },
  { num: '02', title: 'AI Processes', desc: 'Our engine extracts claims, checks bias, and queries knowledge bases.' },
  { num: '03', title: 'Get the Verdict', desc: 'Receive a confidence score, bias rating, and full explanation instantly.' },
];

export default function LandingPage() {
  const { user } = useUser();

  return (
    <div className="relative bg-[#020617] text-[#e2e8f0] overflow-x-hidden">
      {/* ─── HERO ──────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 text-center overflow-hidden">
        <GlobeBackground />

        <div className="relative z-10 max-w-4xl mx-auto">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#6366f1]/30 bg-[#6366f1]/10 backdrop-blur-md mb-8"
          >
            <BiAnalyse className="text-[#6366f1]" />
            <span className="text-xs uppercase tracking-widest text-[#6366f1] font-medium">
              V 2.0 · AI Reasoning Engine
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.1 }}
            className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight leading-[1.08] mb-6"
          >
            Don't Just Read.{' '}
            <span
              className="italic font-serif"
              style={{
                background: 'linear-gradient(90deg, #6366f1 0%, #818cf8 50%, #38bdf8 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Verify.
            </span>
          </motion.h1>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.2 }}
            className="text-lg sm:text-xl text-[#e2e8f0]/55 max-w-2xl mx-auto mb-4 leading-relaxed font-light"
          >
            See the truth behind the headlines.
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.25 }}
            className="text-base text-[#e2e8f0]/40 max-w-xl mx-auto mb-12 leading-relaxed"
          >
            Analyze news articles, tweets, and headlines using claim extraction, bias detection, and deep semantic verification — instantly.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.35 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              to={user ? '/app' : '/signup'}
              className="px-8 py-3.5 rounded-full bg-white text-[#020617] font-bold text-sm tracking-widest uppercase hover:bg-white/90 transition-all shadow-lg"
            >
              BEGIN ANALYSIS
            </Link>
            <Link
              to="/login"
              className="px-8 py-3.5 rounded-full border border-white/25 text-white font-bold text-sm tracking-widest uppercase hover:bg-white/5 transition-all"
            >
              {user ? 'CONTINUE JOURNEY' : 'SIGN IN'}
            </Link>
          </motion.div>
        </div>

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/30 text-xs tracking-widest uppercase"
        >
          <span>Scroll</span>
          <div className="w-px h-10 bg-gradient-to-b from-white/30 to-transparent" />
        </motion.div>
      </section>

      {/* ─── FEATURES ──────────────────────────────────────────── */}
      <section className="relative py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div {...fadeUp()} className="text-center mb-16">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#6366f1] mb-3">
              ENTERPRISE-GRADE PIPELINE
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white leading-tight">
              Everything you need to fight misinformation
            </h2>
            <p className="mt-4 text-[#e2e8f0]/50 max-w-xl mx-auto text-sm leading-relaxed">
              Built for scale, precision, and complete transparency — no black boxes.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                {...fadeUp(i * 0.07)}
                className={`p-6 rounded-2xl bg-[#0f172a]/60 border border-white/5 ${f.border} backdrop-blur-sm transition-all duration-300 hover:bg-[#0f172a]/90`}
              >
                <div className={`w-10 h-10 rounded-xl ${f.bg} flex items-center justify-center ${f.color} mb-4`}>
                  <f.icon size={20} />
                </div>
                <h3 className="font-semibold text-white mb-2 text-[0.95rem]">{f.title}</h3>
                <p className="text-sm text-[#e2e8f0]/50 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ──────────────────────────────────────── */}
      <section className="relative py-24 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <motion.div {...fadeUp()} className="text-center mb-16">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#6366f1] mb-3">
              HOW IT WORKS
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white leading-tight">
              Three steps to clarity
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <motion.div key={step.num} {...fadeUp(i * 0.12)} className="relative flex flex-col items-start">
                <span className="text-5xl font-black text-white/5 mb-4 select-none leading-none">
                  {step.num}
                </span>
                <div className="w-8 h-px bg-[#6366f1]/60 mb-4" />
                <h3 className="font-semibold text-white text-lg mb-2">{step.title}</h3>
                <p className="text-sm text-[#e2e8f0]/50 leading-relaxed">{step.desc}</p>
                {i < steps.length - 1 && (
                  <BiArrowToRight
                    className="hidden md:block absolute top-10 -right-4 text-white/10"
                    size={24}
                  />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── STATS STRIP ───────────────────────────────────────── */}
      <section className="py-16 px-6 border-t border-white/5 border-b border-white/5">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: '99.2%', label: 'Detection Accuracy' },
            { value: '<2s', label: 'Average Analysis Time' },
            { value: '50K+', label: 'Articles Analyzed' },
            { value: '12+', label: 'Bias Axes Measured' },
          ].map((stat, i) => (
            <motion.div key={stat.label} {...fadeUp(i * 0.08)}>
              <p className="text-3xl font-black text-white mb-1">{stat.value}</p>
              <p className="text-xs text-[#e2e8f0]/40 uppercase tracking-wider">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── FINAL CTA ─────────────────────────────────────────── */}
      <section className="relative py-32 px-6 overflow-hidden">
        {/* subtle glow */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[600px] h-[600px] rounded-full bg-[#6366f1]/5 blur-3xl" />
        </div>

        <motion.div {...fadeUp()} className="relative z-10 max-w-2xl mx-auto text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#6366f1] mb-4">
            RISE ABOVE MEDIOCRITY. BEYOND THE OLD SELF.
          </p>
          <h2 className="text-4xl sm:text-5xl font-black text-white leading-tight mb-4">
            <strong>FactLens AI</strong> Toward Truth.
          </h2>
          <p className="text-[#e2e8f0]/40 text-sm mb-10 leading-relaxed">
            Join thousands of fact-checkers, journalists, and curious minds who use FactLens AI every day.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to={user ? '/app' : '/signup'}
              className="px-8 py-3.5 rounded-full bg-white text-[#020617] font-bold text-sm tracking-widest uppercase hover:bg-white/90 transition-all"
            >
              BEGIN TRANSFORMATION
            </Link>
            {!user && (
              <Link
                to="/login"
                className="px-8 py-3.5 rounded-full border border-white/25 text-white font-bold text-sm tracking-widest uppercase hover:bg-white/5 transition-all"
              >
                CONTINUE JOURNEY
              </Link>
            )}
          </div>
        </motion.div>
      </section>

      {/* ─── FOOTER STRIP ──────────────────────────────────────── */}
      <div className="border-t border-white/8 py-8 px-6 text-center text-xs text-[#e2e8f0]/25 tracking-wide">
        © {new Date().getFullYear()} FactLens AI · See the truth behind the headlines.
      </div>
    </div>
  );
}
