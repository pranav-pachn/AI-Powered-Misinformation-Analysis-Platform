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
        <div className="relative inline-flex items-center gap-0.5 p-1 bg-white/5 rounded-full border border-white/10">
          {/* Sliding pill background */}
          <div
            className={`absolute h-9 rounded-full bg-primary shadow-[0_0_15px_rgba(99,102,241,0.5)] transition-all duration-300 ease-out ${
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
            className="w-full h-48 p-4 pr-20 bg-background/50 border border-white/10 rounded-xl text-text placeholder-text/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary backdrop-blur-sm transition-all duration-300 ease-out disabled:opacity-50 disabled:cursor-not-allowed shadow-inner"
          />
        ) : (
          <input
            type="url"
            value={url}
            onChange={handleUrlChange}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            placeholder="Enter full article URL (https://...)"
            className="w-full p-4 bg-background/50 border border-white/10 rounded-xl text-text placeholder-text/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary backdrop-blur-sm transition-all duration-300 ease-out disabled:opacity-50 disabled:cursor-not-allowed shadow-inner"
          />
        )}
        
        {/* Character Counter in Bottom Right */}
        {mode === 'text' && (
          <div className="absolute bottom-3 right-3 text-xs text-text/50 font-medium bg-black/40 px-2 py-0.5 rounded backdrop-blur-md">
            {text.length} / {MAX_CHARS}
          </div>
        )}
      </div>


      {error && (
        <div className="p-3 bg-danger/10 border border-danger/30 rounded-lg text-danger text-sm font-medium">
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
        className="w-full py-3.5 px-6 bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl transition-all duration-300 ease-out flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.01] shadow-[0_4px_20px_rgba(99,102,241,0.4)] focus:outline-none text-sm sm:text-base"
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

      <p className="text-xs text-text/40 text-center font-medium tracking-wide">
        {mode === 'text'
          ? 'Deep semantic processing on provided text context.'
          : 'Automated content extraction and semantic verification.'}
      </p>
    </div>
  );
}
