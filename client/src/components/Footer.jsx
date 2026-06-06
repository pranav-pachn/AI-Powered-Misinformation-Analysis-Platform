import { Link } from 'react-router-dom';
import { Layers } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="relative mt-20 border-t border-white/10 bg-background overflow-hidden z-10">
      {/* subtle top glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      
      <div className="max-w-5xl mx-auto px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 lg:gap-12">
          {/* Brand */}
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2 group w-fit" aria-label="FactLens AI home">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg overflow-hidden shrink-0 group-hover:opacity-80 transition-opacity">
                <img src="/favicon.png" alt="FactLens AI" className="w-full h-full object-cover" />
              </div>
              <span className="font-semibold tracking-tight text-white">
                FactLens AI
              </span>
            </Link>
            <p className="text-sm text-text/60 max-w-sm leading-relaxed">
              Advanced misinformation detection platform powered by explainable AI.
              Verify news, analyze bias, and extract claims instantly.
            </p>
          </div>

          {/* Navigation */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-text/40">
              Platform
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/" className="text-text/70 hover:text-white transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/app" className="text-text/70 hover:text-white transition-colors">Analyze News</Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-text/70 hover:text-white transition-colors">Dashboard</Link>
              </li>
              <li>
                <Link to="/history" className="text-text/70 hover:text-white transition-colors">History</Link>
              </li>
            </ul>
          </div>

          {/* Contact & Meta */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-text/40">
              Contact
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a href="mailto:hello@aifactchecker.app" className="text-text/70 hover:text-primary transition-colors">
                  hello@aifactchecker.app
                </a>
              </li>
            </ul>
            <div className="pt-4">
              <p className="text-xs text-text/50">
                © {new Date().getFullYear()} FactLens AI
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

