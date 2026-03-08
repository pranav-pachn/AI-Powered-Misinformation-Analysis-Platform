import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <footer className="border-t border-slate-800/60 bg-[#020617] text-slate-400">
      <div className="relative">
        {/* subtle inner gradient + glow */}
        <div className="pointer-events-none absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent opacity-80" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 lg:py-10 space-y-4">
          <p className="text-center text-[11px] sm:text-xs font-medium tracking-[0.18em] uppercase text-slate-500/80">
            Fighting misinformation with explainable AI.
          </p>
          <div
            className={[
              'rounded-3xl bg-gradient-to-tr from-slate-950/95 via-slate-900/90 to-slate-950/95',
              'backdrop-blur-md border border-slate-800/70 shadow-[0_18px_44px_rgba(15,23,42,0.85)]',
              'px-5 sm:px-7 lg:px-9 py-6 sm:py-8 lg:py-9',
              'transition-all duration-700 ease-out transform',
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4',
            ].join(' ')}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10 lg:gap-12">
              {/* Brand / Intro */}
              <div className="space-y-5">
                <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/5 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.22em] text-indigo-200/80">
                  <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-indigo-400 via-sky-400 to-purple-400 shadow-[0_0_18px_rgba(129,140,248,0.8)]" />
                  <span>AI Fact Checker</span>
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-50">
                    AI Fact Checker
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-slate-400 max-w-xs">
                    Fighting misinformation with explainable AI.
                  </p>
                </div>
                <p className="pt-1.5 text-[11px] leading-relaxed text-slate-500">
                  © 2026 AI Fact Checker. All rights reserved.
                </p>
              </div>

              {/* Navigation */}
              <div className="space-y-3.5">
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
                  Navigation
                </p>
                <ul className="space-y-1.5 text-sm">
                  <li>
                    <Link
                      to="/"
                      className="inline-flex items-center gap-1.5 text-slate-300/90 hover:text-indigo-400 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:translate-x-0.5 hover:drop-shadow-[0_0_14px_rgba(99,102,241,0.45)]"
                    >
                      <span className="h-1 w-1 rounded-full bg-slate-500/60" />
                      <span>Home</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/history"
                      className="inline-flex items-center gap-1.5 text-slate-300/90 hover:text-indigo-400 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:translate-x-0.5 hover:drop-shadow-[0_0_14px_rgba(99,102,241,0.45)]"
                    >
                      <span className="h-1 w-1 rounded-full bg-slate-500/60" />
                      <span>History</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/dashboard"
                      className="inline-flex items-center gap-1.5 text-slate-300/90 hover:text-indigo-400 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:translate-x-0.5 hover:drop-shadow-[0_0_14px_rgba(99,102,241,0.45)]"
                    >
                      <span className="h-1 w-1 rounded-full bg-slate-500/60" />
                      <span>Dashboard</span>
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Features */}
              <div className="space-y-3.5">
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
                  Features
                </p>
                <ul className="space-y-1.5 text-sm">
                  <li className="flex items-start gap-2.5 transition-all duration-200 ease-out hover:translate-x-0.5">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-gradient-to-r from-indigo-300 to-sky-300 opacity-80" />
                    <span>Claim Extraction</span>
                  </li>
                  <li className="flex items-start gap-2.5 transition-all duration-200 ease-out hover:translate-x-0.5">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-gradient-to-r from-purple-300 to-indigo-300 opacity-80" />
                    <span>Bias Detection</span>
                  </li>
                  <li className="flex items-start gap-2.5 transition-all duration-200 ease-out hover:translate-x-0.5">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-gradient-to-r from-sky-300 to-emerald-300 opacity-80" />
                    <span>Sentence Analysis</span>
                  </li>
                  <li className="flex items-start gap-2.5 transition-all duration-200 ease-out hover:translate-x-0.5">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-gradient-to-r from-amber-300 to-rose-300 opacity-80" />
                    <span>URL Verification</span>
                  </li>
                </ul>
              </div>

              {/* Meta / Contact */}
              <div className="space-y-3.5">
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
                  Meta
                </p>
                <div className="space-y-1 text-sm">
                  <p className="leading-relaxed">
                    Contact:{' '}
                    <a
                      href="mailto:contact@aifactchecker.app"
                      className="text-slate-300/90 hover:text-indigo-400 transition-all duration-200 hover:underline underline-offset-4"
                    >
                      contact@aifactchecker.app
                    </a>
                  </p>
                  <p className="text-[11px] text-slate-500/90">Version v1.0</p>
                  <div className="group inline-flex items-center gap-2.5 text-[11px] text-slate-500/90 transition-all duration-200 ease-out group-hover:-translate-y-0.5">
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500/10 border border-indigo-500/40 shadow-none transition-all duration-200 ease-out group-hover:shadow-[0_0_16px_rgba(79,70,229,0.6)]">
                      <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-tr from-indigo-400 via-sky-400 to-purple-400" />
                    </span>
                    <span className="pl-0.5">
                      Powered by{' '}
                      <span className="font-medium text-slate-100">Gemini</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

