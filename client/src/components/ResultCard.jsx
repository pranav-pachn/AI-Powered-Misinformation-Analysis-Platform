import { BiCheckCircle, BiXCircle, BiError } from 'react-icons/bi';
import ClaimsAnalysis from './ClaimsAnalysis';

export default function ResultCard({ result }) {
  if (!result) return null;

  const overallResult = result.overall_result || result.result;
  const confidence = result.overall_confidence ?? result.confidence;
  const explanation = result.explanation;
  const sourceUrl = result.source_url;
  const sentenceAnalysis = result.sentence_analysis || [];
  const factCheckWarning = result.fact_check_warning;
  const claims = result.claims || [];

  const isFake = overallResult === 'Fake';
  const bgColor = isFake ? 'bg-[#ef4444]/10' : 'bg-[#22c55e]/10';
  const borderColor = isFake ? 'border-[#ef4444]/30' : 'border-[#22c55e]/30';
  const badgeColor = isFake
    ? 'bg-[#ef4444]/20 text-red-300 border-[#ef4444]/30'
    : 'bg-[#22c55e]/20 text-green-300 border-[#22c55e]/30';
  const Icon = isFake ? BiXCircle : BiCheckCircle;
  const iconColor = isFake ? 'text-[#ef4444]' : 'text-[#22c55e]';

  const confidenceValue =
    typeof confidence === 'number' && !Number.isNaN(confidence)
      ? Math.max(0, Math.min(100, confidence))
      : 0;
  
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (confidenceValue / 100) * circumference;

  const biasType = result.bias_type || 'Not detected';

  let riskLabel = 'MEDIUM RISK';
  let riskEmoji = '🟨';
  let riskChipClasses = 'bg-amber-500/10 text-amber-200 border-amber-500/40';

  if (overallResult === 'Fake') {
    if (confidenceValue >= 70) {
      riskLabel = 'HIGH RISK';
      riskEmoji = '🔴';
      riskChipClasses = 'bg-red-500/10 text-red-200 border-red-500/40';
    } else {
      riskLabel = 'ELEVATED RISK';
      riskEmoji = '🟧';
      riskChipClasses = 'bg-amber-500/10 text-amber-200 border-amber-500/40';
    }
  } else {
    if (confidenceValue >= 70) {
      riskLabel = 'LOW RISK';
      riskEmoji = '🟢';
      riskChipClasses = 'bg-emerald-500/10 text-emerald-200 border-emerald-500/40';
    } else {
      riskLabel = 'MEDIUM RISK';
      riskEmoji = '🟨';
      riskChipClasses = 'bg-amber-500/10 text-amber-200 border-amber-500/40';
    }
  }

  const emotionalTone = result.emotional_tone || 'Not analyzed';

  return (
    <div
      className={`w-full max-w-3xl mx-auto mt-8 p-6 rounded-xl border ${bgColor} ${borderColor} animate-reveal-result bg-[#1e293b] shadow-xl transition-all duration-500 ease-out transform hover:-translate-y-0.5 hover:shadow-2xl`}
    >
      {/* 🧠 Overall Verdict Section */}
      <div className="mb-8 animate-section-reveal">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">🧠</span>
          <h2 className="text-lg font-bold text-slate-100">Overall Verdict</h2>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex-1">
            <div className={`inline-flex items-center gap-3 px-5 py-3 rounded-full border font-bold text-lg animate-badge-enter ${badgeColor}`}>
              <Icon className={`text-2xl ${iconColor}`} />
              {overallResult === 'Fake' ? 'FAKE' : 'REAL'}
            </div>
            <p className="text-sm text-slate-400 mt-3">Classification confidence level</p>
          </div>

          {/* Risk Level Badge */}
          <div className={`flex flex-col items-center p-4 rounded-xl border-2 ${riskChipClasses} animate-pulse-glow`}>
            <span className="text-3xl mb-2">{riskEmoji}</span>
            <p className="font-bold text-center text-sm">{riskLabel}</p>
          </div>
        </div>
      </div>

      {/* Confidence Display Section */}
      <div className="mb-8 p-6 rounded-xl bg-gradient-to-br from-slate-800/40 to-slate-900/40 border border-slate-700/50 animate-section-reveal" style={{ animationDelay: '0.1s' }}>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">📊</span>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">Confidence Metric</h3>
        </div>
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="flex-1 space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 font-medium text-sm">Model Certainty</span>
                <span className={`text-base font-bold ${isFake ? 'text-red-400' : 'text-emerald-400'}`}>
                  {confidenceValue}%
                </span>
              </div>
              <div className="w-full bg-slate-700/50 rounded-full h-3 overflow-hidden shadow-inner">
                <div
                  className={`h-full transition-all duration-700 ease-out rounded-full ${
                    isFake ? 'bg-gradient-to-r from-red-500 to-red-400' : 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                  }`}
                  style={{ width: `${confidenceValue}%` }}
                />
              </div>
            </div>
            <p className="text-xs text-slate-500">AI model's certainty for this classification</p>
          </div>

          {/* Enhanced Circular Progress */}
          <div className="relative w-56 h-56 flex-shrink-0 animate-circular-glow">
            <svg
              className="-rotate-90 drop-shadow-lg w-full h-full"
              viewBox="0 0 160 160"
              preserveAspectRatio="xMidYMid meet"
            >
              {/* Background circle */}
              <circle
                cx="80"
                cy="80"
                r="60"
                stroke="#1e293b"
                strokeWidth="12"
                fill="transparent"
              />
              {/* Progress circle */}
              <circle
                cx="80"
                cy="80"
                r="60"
                stroke={isFake ? '#ef4444' : '#22c55e'}
                strokeWidth="12"
                fill="transparent"
                strokeLinecap="round"
                strokeDasharray={376.99}
                strokeDashoffset={376.99 - (confidenceValue / 100) * 376.99}
                style={{ 
                  transition: 'stroke-dashoffset 1s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  filter: isFake ? 'drop-shadow(0 0 8px rgba(239, 68, 68, 0.4))' : 'drop-shadow(0 0 8px rgba(34, 197, 94, 0.4))'
                }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span
                className={`text-4xl font-bold ${
                  isFake ? 'text-red-400' : 'text-emerald-400'
                }`}
              >
                {confidenceValue}%
              </span>
              <span className="text-[11px] uppercase tracking-[0.15em] text-slate-400 mt-1">
                Confidence
              </span>
            </div>
          </div>
        </div>
      </div>

      {sourceUrl && (
        <div className="mb-6 p-4 bg-slate-800/30 border border-slate-700/40 rounded-lg animate-section-reveal" style={{ animationDelay: '0.15s' }}>
          <h4 className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-2">
            Source URL
          </h4>
          <a
            href={sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-300 hover:text-indigo-200 text-sm break-all underline hover:no-underline transition-colors"
          >
            {sourceUrl}
          </a>
        </div>
      )}

      {factCheckWarning && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/40 rounded-lg flex gap-3 animate-section-reveal" style={{ animationDelay: '0.2s' }}>
          <BiError className="text-red-400 text-xl flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-red-300 mb-1">Fact-Check Alert</h4>
            <p className="text-red-200 text-sm">{factCheckWarning}</p>
            <p className="text-red-300/70 text-xs mt-2">Cross-referenced with independent fact-checkers</p>
          </div>
        </div>
      )}

      {/* 📊 Bias Analysis Section */}
      <div className="mb-8 p-6 rounded-xl bg-gradient-to-br from-slate-800/40 to-slate-900/40 border border-slate-700/50 animate-section-reveal" style={{ animationDelay: '0.25s' }}>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">📊</span>
          <h3 className="text-lg font-bold text-slate-100">Bias Analysis</h3>
        </div>
        
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-slate-900/40 border border-slate-700/30">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 mb-2">
              Detected Bias Type
            </p>
            <p className="text-base text-slate-100 font-medium">{biasType}</p>
          </div>

          <div className="p-4 rounded-lg bg-slate-900/40 border border-slate-700/30">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 mb-2">
              Emotional Tone
            </p>
            <p className="text-base text-slate-100 font-medium">{emotionalTone}</p>
          </div>

          <div className="p-4 rounded-lg bg-slate-900/40 border border-slate-700/30">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 mb-2">
              AI Reasoning
            </p>
            <p className="text-sm text-slate-300 leading-relaxed">
              {explanation ? explanation : 'No detailed explanation was provided for this analysis.'}
            </p>
          </div>
        </div>
      </div>

      {/* 📌 Claims Breakdown Section */}
      {claims && claims.length > 0 && (
        <div className="mb-8 animate-section-reveal" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">📌</span>
            <h3 className="text-lg font-bold text-slate-100">Claims Breakdown</h3>
            <span className="ml-auto text-sm text-slate-400">{claims.length} claim{claims.length !== 1 ? 's' : ''}</span>
          </div>
          <ClaimsAnalysis claims={claims} />
        </div>
      )}

      {/* ⚠ Sentence Risk Highlights Section */}
      {sentenceAnalysis.length > 0 && (
        <div className="mb-8 animate-section-reveal" style={{ animationDelay: '0.35s' }}>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">⚠</span>
            <h3 className="text-lg font-bold text-slate-100">Sentence Risk Highlights</h3>
          </div>
          <div className="space-y-3">
            {sentenceAnalysis.map((item, idx) => {
              const level = (item.risk_level || '').toUpperCase();
              let borderColor = 'border-slate-700';
              let bgColor = 'bg-slate-800/40';
              let textColor = 'text-slate-200';
              let riskIcon = '🔍';

              if (level === 'SAFE') {
                borderColor = 'border-emerald-500/40';
                bgColor = 'bg-emerald-500/10';
                textColor = 'text-emerald-200';
                riskIcon = '✓';
              } else if (level === 'MISLEADING') {
                borderColor = 'border-amber-400/50';
                bgColor = 'bg-amber-500/10';
                textColor = 'text-amber-200';
                riskIcon = '⚠';
              } else if (level === 'HIGH_RISK') {
                borderColor = 'border-red-500/50';
                bgColor = 'bg-red-500/10';
                textColor = 'text-red-200';
                riskIcon = '🔴';
              }

              return (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border-l-4 ${borderColor} ${bgColor} transition-all duration-300 hover:shadow-lg animate-section-reveal`}
                  style={{ animationDelay: `${0.35 + idx * 0.05}s` }}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-xl flex-shrink-0 mt-0.5">{riskIcon}</span>
                    <div className="flex-1">
                      <p className={`text-xs font-bold mb-2 uppercase tracking-wider ${textColor}`}>{level}</p>
                      <p className="text-sm text-slate-200 leading-relaxed">
                        {item.sentence_text}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-8 pt-6 border-t border-slate-700/50 animate-section-reveal" style={{ animationDelay: '0.4s' }}>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 mb-4">
          <div className="flex items-center gap-2">
            <span>🤖 Powered by Advanced AI Models</span>
          </div>
          <span>{new Date().toLocaleDateString()}</span>
        </div>
        
        {/* AI Disclaimer */}
        <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
          <p className="text-xs text-amber-200/80 text-center leading-relaxed">
            ⚠️ <span className="font-bold">AI-generated analysis.</span> This is an automated assessment. Always verify critical information with trusted news sources and fact-checkers before taking action.
          </p>
        </div>
      </div>
    </div>
  );
}
