import { useState, useRef, useEffect } from 'react';
import { BiStar, BiCheckCircle, BiZoomIn } from 'react-icons/bi';
import NewsInput from '../components/NewsInput';
import ResultCard from '../components/ResultCard';
import Loader from '../components/Loader';
import { predictNews, predictNewsFromUrl } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useScrollReveal } from '../hooks/useScrollReveal';

export default function Home() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { showToast } = useToast();
  const resultRef = useRef(null);
  const [dotCount, setDotCount] = useState(0);

  // Scroll reveal effect
  useScrollReveal('.scroll-reveal');

  // Scroll to result when analysis completes
  useEffect(() => {
    if (result && !loading && resultRef.current) {
      setTimeout(() => {
        resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [result, loading]);

  // Subtle animated dots for loading messages
  useEffect(() => {
    if (!loading) {
      setDotCount(0);
      return;
    }

    const interval = setInterval(() => {
      setDotCount((prev) => (prev + 1) % 4);
    }, 450);

    return () => clearInterval(interval);
  }, [loading]);

  const handleAnalyzeText = async (text) => {
    try {
      setLoading(true);
      setError('');
      setResult(null);

      const data = await predictNews(text);
      setResult(data);
    } catch (err) {
      let errorMessage = 'Analysis failed. Please try again.';
      
      // Specific error messages
      if (err.message.includes('network') || err.message.includes('fetch')) {
        errorMessage = '🌐 Network error. Check your connection and try again.';
      } else if (err.message.includes('timeout')) {
        errorMessage = '⏱️ Request timed out. The text may be too long.';
      } else if (err.message.includes('rate limit')) {
        errorMessage = '⚠️ Too many requests. Please wait a moment.';
      } else if (err.message.includes('invalid')) {
        errorMessage = '❌ Invalid input format. Please check your text.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      showToast(errorMessage, 'error');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeUrl = async (url) => {
    try {
      setLoading(true);
      setError('');
      setResult(null);

      const data = await predictNewsFromUrl(url);
      setResult(data);
    } catch (err) {
      let errorMessage = 'Failed to analyze URL. Please try again.';
      
      // Specific error messages
      if (err.message.includes('fetch') || err.message.includes('404')) {
        errorMessage = '🔗 Unable to fetch article content. URL may be inaccessible.';
      } else if (err.message.includes('timeout')) {
        errorMessage = '⏱️ Request timed out. Try a different article.';
      } else if (err.message.includes('invalid url')) {
        errorMessage = '❌ Invalid URL format. Use http:// or https://';
      } else if (err.message.includes('blocked')) {
        errorMessage = '🚫 Access denied. Site may block automated requests.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      showToast(errorMessage, 'error');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-transition relative min-h-screen bg-[#0f172a] pt-24 pb-20 overflow-hidden">
      {/* background glow + grid */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -right-32 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="absolute top-40 -left-32 h-80 w-80 rounded-full bg-sky-500/10 blur-3xl" />
        <div className="absolute inset-x-0 top-32 h-px bg-gradient-to-r from-transparent via-slate-700/40 to-transparent" />
        <div className="absolute inset-0 opacity-[0.12] mix-blend-soft-light bg-[radial-gradient(circle_at_1px_1px,#1e293b_1px,transparent_0)] bg-[length:22px_22px]" />
      </div>

      <main className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <section className="text-center mb-12 animate-slide-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-indigo-500/40 bg-slate-900/70 backdrop-blur-xl shadow-[0_18px_60px_rgba(15,23,42,0.9)] mb-6">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-300">
              <BiStar className="text-sm" />
            </span>
            <span className="text-xs sm:text-sm uppercase tracking-[0.22em] text-indigo-200/80">
              Real-time AI misinformation detection
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight leading-tight mb-5 bg-gradient-to-r from-indigo-300 via-sky-200 to-violet-300 bg-clip-text text-transparent">
            Detect <span className="relative inline-block bg-gradient-to-r from-indigo-400 to-indigo-300 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(99,102,241,0.4)]">Fake News</span> Instantly with AI
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-6 leading-relaxed">
            Paste any headline or article and let our AI-powered engine uncover hidden patterns,
            credibility signals, and factual inconsistencies in seconds.
          </p>

          {/* Trust badges row */}
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-700/70 bg-slate-900/70 px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-slate-300">
              <BiCheckCircle className="text-xs text-[#22c55e]" />
              AI-powered reasoning
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-700/70 bg-slate-900/70 px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-slate-300">
              <BiCheckCircle className="text-xs text-amber-300" />
              Bias detection enabled
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-700/70 bg-slate-900/70 px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-slate-300">
              <BiCheckCircle className="text-xs text-sky-300" />
              Claim-level verification
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto mb-8">
            <div className="scroll-reveal flex items-center gap-3 px-4 py-3 rounded-2xl border border-slate-700/60 bg-slate-900/60 backdrop-blur-xl shadow-[0_16px_40px_rgba(15,23,42,0.85)]">
              <div className="flex items-center justify-center w-5 h-5 flex-shrink-0">
                <BiCheckCircle className="text-[#22c55e] text-xl" />
              </div>
              <div className="text-left">
                <p className="text-xs text-slate-400 uppercase tracking-wide">Model Performance</p>
                <p className="text-sm text-slate-100 font-medium">Enterprise-grade accuracy</p>
              </div>
            </div>
            <div className="scroll-reveal flex items-center gap-3 px-4 py-3 rounded-2xl border border-slate-700/60 bg-slate-900/60 backdrop-blur-xl shadow-[0_16px_40px_rgba(15,23,42,0.85)]">
              <div className="flex items-center justify-center w-5 h-5 flex-shrink-0">
                <BiZoomIn className="text-[#6366f1] text-xl" />
              </div>
              <div className="text-left">
                <p className="text-xs text-slate-400 uppercase tracking-wide">Explainability</p>
                <p className="text-sm text-slate-100 font-medium">Transparent AI reasoning</p>
              </div>
            </div>
            <div className="scroll-reveal flex items-center gap-3 px-4 py-3 rounded-2xl border border-slate-700/60 bg-slate-900/60 backdrop-blur-xl shadow-[0_16px_40px_rgba(15,23,42,0.85)]">
              <div className="flex items-center justify-center w-5 h-5 flex-shrink-0">
                <BiStar className="text-purple-400 text-xl" />
              </div>
              <div className="text-left">
                <p className="text-xs text-slate-400 uppercase tracking-wide">Speed</p>
                <p className="text-sm text-slate-100 font-medium">Sub-second analysis</p>
              </div>
            </div>
          </div>
        </section>

        {/* Main Input Section */}
        <section className="mb-12 animate-slide-up">
          <div className="rounded-3xl border border-slate-800/80 bg-slate-900/70 backdrop-blur-2xl shadow-[0_24px_80px_rgba(15,23,42,0.95)] px-4 py-6 sm:px-8 sm:py-7">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-5 gap-3">
              <div className="text-left">
                <p className="text-sm font-medium text-slate-200">
                  Paste any news article, tweet, or headline
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Our models analyze language, semantics, and contextual signals to flag potential misinformation.
                </p>
              </div>
              {error && (
                <span className="inline-flex items-center rounded-full border border-[#ef4444]/40 bg-[#ef4444]/10 px-3 py-1 text-xs font-medium text-[#fecaca]">
                  {error}
                </span>
              )}
            </div>

            <NewsInput
              onSubmitText={handleAnalyzeText}
              onSubmitUrl={handleAnalyzeUrl}
              isLoading={loading}
            />
          </div>
        </section>

        {/* Loading / Result */}
        {loading && (
          <section className="max-w-3xl mx-auto px-2 animate-fade-in">
            <div className="text-center">
              <Loader />
              <div className="mt-6 p-6 rounded-xl bg-slate-800/40 border border-slate-700/50">
                <div className="space-y-3 text-sm">
                  <p className="text-slate-300 font-medium flex items-center justify-center gap-2">
                    🔍 <span className="animate-pulse">Extracting content{'.'.repeat(dotCount)}</span>
                  </p>
                  <p className="text-slate-400 flex items-center justify-center gap-2">
                    🧠 <span className="animate-pulse" style={{animationDelay: '0.2s'}}>Running AI reasoning{'.'.repeat(dotCount)}</span>
                  </p>
                  <p className="text-slate-400 flex items-center justify-center gap-2">
                    📊 <span className="animate-pulse" style={{animationDelay: '0.4s'}}>Evaluating bias patterns{'.'.repeat(dotCount)}</span>
                  </p>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-700/30">
                  <p className="text-xs text-slate-500">This may take 5-15 seconds depending on content length</p>
                </div>
              </div>
            </div>
          </section>
        )}

        {result && !loading && (
          <section ref={resultRef} className="max-w-5xl mx-auto px-2 sm:px-0 animate-fade-in">
            <ResultCard result={result} />
          </section>
        )}

        {/* How It Works */}
        <section className="mt-20 mb-4">
          <h2 className="text-2xl sm:text-3xl font-semibold text-center text-slate-50 mb-10">
            Designed for modern AI-native teams
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { num: '1', title: 'Ingest', desc: 'Paste or stream content from any source your team monitors.' },
              { num: '2', title: 'Analyze', desc: 'Transformer-based models score content across risk dimensions.' },
              { num: '3', title: 'Explain', desc: 'Clear natural language explanations justify every prediction.' },
              { num: '4', title: 'Act', desc: 'Use the output to flag, review, or escalate high-risk content.' },
            ].map((step) => (
              <div
                key={step.num}
                className="scroll-reveal text-center p-6 rounded-2xl border border-slate-800/80 bg-slate-900/70 backdrop-blur-xl shadow-[0_20px_60px_rgba(15,23,42,0.9)] hover:border-indigo-500/60 transition-colors"
              >
                <div className="w-11 h-11 mx-auto mb-4 flex items-center justify-center rounded-2xl bg-gradient-to-br from-[#6366f1] to-indigo-600 text-white text-base font-semibold shadow-[0_16px_40px_rgba(79,70,229,0.8)]">
                  {step.num}
                </div>
                <h3 className="text-slate-100 font-semibold mb-2 text-sm sm:text-base">
                  {step.title}
                </h3>
                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
