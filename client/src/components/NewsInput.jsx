import { useState } from 'react';
import { BiSearch, BiLinkAlt } from 'react-icons/bi';

export default function NewsInput({ onSubmit, onSubmitText, onSubmitUrl, isLoading }) {
  const [mode, setMode] = useState('text'); // 'text' | 'url'
  const [text, setText] = useState('');
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const MAX_CHARS = 15000;

  const activeTextHandler = onSubmitText || onSubmit;
  const activeUrlHandler = onSubmitUrl;

  const handleTextChange = (e) => {
    const value = e.target.value;
    if (value.length <= MAX_CHARS) {
      setText(value);
      setError('');
    }
  };

  const handleUrlChange = (e) => {
    setUrl(e.target.value);
    setError('');
  };

  const handleSubmit = () => {
    if (mode === 'text') {
      if (!text.trim()) {
        setError('📝 Please enter some text to analyze');
        return;
      }
      if (text.trim().length < 50) {
        setError('📝 Text too short. Please provide at least 50 characters for accurate analysis.');
        return;
      }
      if (text.length > MAX_CHARS) {
        setError(`📝 Input exceeds ${MAX_CHARS.toLocaleString()} character limit.`);
        return;
      }
      if (activeTextHandler) {
        activeTextHandler(text);
      }
      return;
    }

    if (!url.trim()) {
      setError('🔗 Please enter a URL to analyze');
      return;
    }

    const basicUrlPattern = /^https?:\/\/.+\..+/i;
    if (!basicUrlPattern.test(url.trim())) {
      setError('🔗 Invalid URL format. Must start with http:// or https:// and include a domain.');
      return;
    }

    if (activeUrlHandler) {
      activeUrlHandler(url.trim());
    } else if (activeTextHandler) {
      // Fallback: submit URL string as text if no URL handler is provided
      activeTextHandler(url.trim());
    }
  };

  const handleKeyDown = (e) => {
    if (mode === 'text' && e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      handleSubmit();
    }
    if (mode === 'url' && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  const charCount = text.length;

  return (
    <div className="w-full max-w-3xl mx-auto space-y-4">
      {/* Enhanced Toggle with Sliding Pill */}
      <div className="mb-4">
        <div className="relative inline-flex items-center gap-0.5 p-1 bg-slate-800/60 rounded-full border border-slate-700/70">
          {/* Sliding pill background */}
          <div
            className={`absolute h-9 rounded-full bg-gradient-to-r from-[#6366f1] to-indigo-500 shadow-lg shadow-indigo-500/40 transition-all duration-300 ease-out ${
              mode === 'text' 
                ? 'w-[76px] left-1' 
                : 'w-[64px] left-[85px]'
            }`}
          />
        
        <button
          type="button"
          onClick={() => {
            setMode('text');
            setError('');
          }}
          className={`relative inline-flex items-center gap-2 px-3 py-2 rounded-full text-xs font-medium z-10 transition-colors duration-200 ${
            mode === 'text'
              ? 'text-white'
              : 'text-slate-300 hover:text-slate-100'
          }`}
          disabled={isLoading}
        >
          <BiSearch className="text-sm" />
          Text
        </button>
        
        <button
          type="button"
          onClick={() => {
            setMode('url');
            setError('');
          }}
          className={`relative inline-flex items-center gap-2 px-3 py-2 rounded-full text-xs font-medium z-10 transition-colors duration-200 ${
            mode === 'url'
              ? 'text-white'
              : 'text-slate-300 hover:text-slate-100'
          }`}
          disabled={isLoading}
        >
          <BiLinkAlt className="text-sm" />
          URL
        </button>
        </div>
      </div>

      <div className="relative transition-all duration-300 ease-out">
        {mode === 'text' ? (
          <textarea
            value={text}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            placeholder="Paste article, headline, tweet, or statement... (Ctrl+Enter to analyze)"
            className="w-full h-48 p-4 pr-20 bg-[#1e293b] border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#6366f1] focus:ring-2 focus:ring-[#6366f1]/20 resize-none transition-all duration-300 ease-out disabled:opacity-50 disabled:cursor-not-allowed"
          />
        ) : (
          <input
            type="url"
            value={url}
            onChange={handleUrlChange}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            placeholder="Enter full article URL (https://...)"
            className="w-full p-4 bg-[#1e293b] border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#6366f1] focus:ring-2 focus:ring-[#6366f1]/20 transition-all duration-300 ease-out disabled:opacity-50 disabled:cursor-not-allowed"
          />
        )}
        
        {/* Character Counter in Bottom Right */}
        {mode === 'text' && (
          <div className="absolute bottom-3 right-3 text-xs text-slate-400 font-medium bg-slate-900/80 px-2 py-0.5 rounded">
            {text.length} / {MAX_CHARS}
          </div>
        )}
      </div>


      {error && (
        <div className="p-3 bg-[#ef4444]/10 border border-[#ef4444]/30 rounded-lg text-[#ef4444] text-sm">
          {error}
        </div>
      )}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={
          isLoading ||
          (mode === 'text' ? !text.trim() : !url.trim())
        }
        className="w-full py-3.5 px-6 bg-gradient-to-r from-[#6366f1] to-indigo-500 hover:from-[#4f46e5] hover:to-indigo-500 text-white font-bold rounded-xl transition-all duration-300 ease-out flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 transform hover:scale-[1.02] active:scale-[0.985] hover:-translate-y-0.5 animate-cta-glow focus:outline-none focus:ring-2 focus:ring-[#6366f1]/40 focus:ring-offset-2 focus:ring-offset-slate-900 text-sm sm:text-base"
      >
        <BiSearch className="text-lg" />
        <span className="relative">
          {isLoading ? (
            <>
              <span className="inline-block animate-pulse">Analyzing</span>
              <span className="inline-block animate-pulse" style={{animationDelay: '0.15s'}}>.</span>
              <span className="inline-block animate-pulse" style={{animationDelay: '0.3s'}}>.</span>
              <span className="inline-block animate-pulse" style={{animationDelay: '0.45s'}}>.</span>
            </>
          ) : (
            mode === 'text' ? 'Analyze Text' : 'Analyze URL'
          )}
        </span>
      </button>

      <p className="text-xs text-slate-400 text-center">
        {mode === 'text'
          ? "Our AI will analyze the text and determine if it's likely to be fake or real news."
          : 'We will fetch the article content from the URL and analyze it for misinformation.'}
      </p>
    </div>
  );
}
