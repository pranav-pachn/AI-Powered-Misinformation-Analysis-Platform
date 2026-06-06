import { useState, useRef, useEffect } from 'react';
import { BiLinkAlt, BiCheckCircle, BiTargetLock, BiData, BiCubeAlt, BiAnalyse } from 'react-icons/bi';
import { motion, AnimatePresence } from 'framer-motion';
import NewsInput from '../components/NewsInput';
import ResultCard from '../components/ResultCard';
import Loader from '../components/Loader';
import GlobeBackground from '../components/GlobeBackground';
import { predictNews, predictNewsFromUrl } from '../services/api';
import { useToast } from '../context/ToastContext';

export default function Home() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { showToast } = useToast();
  const resultRef = useRef(null);

  // Scroll to result when analysis completes
  useEffect(() => {
    if (result && !loading && resultRef.current) {
      setTimeout(() => {
        resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [result, loading]);

  const handleAnalyzeText = async (text) => {
    try {
      setLoading(true);
      setError('');
      setResult(null);

      const data = await predictNews(text);
      setResult(data);
    } catch (err) {
      let errorMessage = 'Analysis failed. Please try again.';
      if (err.message.includes('network') || err.message.includes('fetch')) errorMessage = '🌐 Network error. Check your connection.';
      else if (err.message) errorMessage = err.message;
      
      setError(errorMessage);
      showToast(errorMessage, 'error');
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
      if (err.message.includes('fetch') || err.message.includes('404')) errorMessage = '🔗 Unable to fetch article content.';
      else if (err.message) errorMessage = err.message;
      
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-background text-text overflow-hidden pb-20">
      <GlobeBackground />

      <main className="relative z-10 max-w-5xl mx-auto px-6 pt-28">
        
        {/* HERO SECTION */}
        <section className="text-center mb-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 backdrop-blur-md mb-8"
          >
            <BiAnalyse className="text-primary" />
            <span className="text-xs uppercase tracking-widest text-primary font-medium">
              V 2.0 AI Reasoning Engine
            </span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-tight mb-6"
          >
            Detect Misinformation <br/>
            <span className="bg-gradient-to-r from-primary via-indigo-400 to-sky-400 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(99,102,241,0.5)]">
              with Explainable AI
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg sm:text-xl text-text/60 max-w-2xl mx-auto mb-10 leading-relaxed font-light"
          >
            Analyze news articles, tweets, and headlines using claim extraction, bias detection, and deep semantic verification instantly.
          </motion.p>
          
          <motion.div
             initial={{ opacity: 0, scale: 0.95 }}
             animate={{ opacity: 1, scale: 1 }}
             transition={{ duration: 0.5, delay: 0.3 }}
             className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <a href="#analyze" className="px-8 py-3.5 rounded-full bg-primary hover:bg-primary/90 text-white font-medium shadow-[0_0_30px_rgba(99,102,241,0.4)] transition-all flex items-center gap-2">
              <BiTargetLock size={18}/> Analyze News
            </a>
            <a href="#features" className="px-8 py-3.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium backdrop-blur-lg transition-all">
              How It Works
            </a>
          </motion.div>
        </section>

        {/* ANALYSIS INPUT */}
        <section id="analyze" className="mb-24 scroll-mt-32">
          <motion.div 
             initial={{ opacity: 0, y: 40 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true, margin: "-100px" }}
             transition={{ duration: 0.7 }}
             className="glass-card p-6 sm:p-10"
          >
            <div className="flex items-center gap-3 mb-6">
              <BiCubeAlt className="text-2xl text-primary" />
              <div>
                <h3 className="text-xl font-semibold text-white tracking-tight">Intelligence Interface</h3>
                <p className="text-sm text-text/50 mt-0.5">Input text block or URL for neuro-semantic processing</p>
              </div>
            </div>
            
            {(error) && (
              <div className="mb-6 w-full p-4 bg-danger/10 border border-danger/30 rounded-xl text-danger text-sm text-center font-medium">
                {error}
              </div>
            )}

            <NewsInput 
              onSubmitText={handleAnalyzeText}
              onSubmitUrl={handleAnalyzeUrl}
              isLoading={loading}
              error={error}
            />
          </motion.div>
        </section>

        {/* LOADING STATE */}
        <AnimatePresence>
          {loading && (
            <motion.section 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="max-w-3xl mx-auto overflow-hidden mb-12"
            >
              <div className="glass p-8 rounded-2xl text-center space-y-6">
                <Loader />
                <div className="space-y-3 text-sm font-mono tracking-wider">
                  <motion.p animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 2, repeat: Infinity, delay: 0 }} className="text-primary flex items-center justify-center gap-3">
                    <BiData size={16}/> Extracting assertions...
                  </motion.p>
                  <motion.p animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 2, repeat: Infinity, delay: 0.6 }} className="text-accent flex items-center justify-center gap-3">
                    <BiTargetLock size={16}/> Running bias detection matrix...
                  </motion.p>
                  <motion.p animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 2, repeat: Infinity, delay: 1.2 }} className="text-sky-400 flex items-center justify-center gap-3">
                    <BiCheckCircle size={16}/> Verifying against knowledge bases...
                  </motion.p>
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* RESULTS WRAPPER */}
        <AnimatePresence>
          {result && !loading && (
            <motion.section 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              ref={resultRef} 
              className="mb-24"
            >
              <ResultCard result={result} />
            </motion.section>
          )}
        </AnimatePresence>

        {/* FEATURES GRID */}
        <section id="features" className="py-12 mb-20 scroll-mt-32">
           <div className="text-center mb-12">
             <h2 className="text-3xl font-bold text-white mb-4">Enterprise-grade Analysis Pipeline</h2>
             <p className="text-text/60">Built for scale, precision, and complete transparency.</p>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="glass p-6 rounded-2xl border border-white/5 hover:border-primary/30 transition-colors">
               <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center text-primary mb-4">
                 <BiTargetLock size={20} />
               </div>
               <h3 className="text-white font-medium mb-2">Claim Extraction</h3>
               <p className="text-sm text-text/60 leading-relaxed">Isolates factual assertions from rhetorical statements instantly to focus verification efforts.</p>
             </div>
             
             <div className="glass p-6 rounded-2xl border border-white/5 hover:border-accent/30 transition-colors">
               <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center text-accent mb-4">
                 <BiAnalyse size={20} />
               </div>
               <h3 className="text-white font-medium mb-2">Bias Detection</h3>
               <p className="text-sm text-text/60 leading-relaxed">Quantifies political, emotional, and cognitive framing across sentences and paragraphs.</p>
             </div>
             
             <div className="glass p-6 rounded-2xl border border-white/5 hover:border-sky-400/30 transition-colors">
               <div className="w-10 h-10 rounded-lg bg-sky-400/20 flex items-center justify-center text-sky-400 mb-4">
                 <BiLinkAlt size={20} />
               </div>
               <h3 className="text-white font-medium mb-2">URL Verification</h3>
               <p className="text-sm text-text/60 leading-relaxed">Extracts text and metadata directly from raw URLs and processes deep context automatically.</p>
             </div>
           </div>
        </section>

      </main>
    </div>
  );
}
