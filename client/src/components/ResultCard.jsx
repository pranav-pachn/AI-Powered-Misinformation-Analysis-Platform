import { BiCheckCircle, BiXCircle, BiError, BiShieldQuarter } from 'react-icons/bi';
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
  const bgColor = isFake ? 'bg-danger/5' : 'bg-accent/5';
  const borderColor = isFake ? 'border-danger/30' : 'border-accent/30';
  const badgeColor = isFake
    ? 'bg-danger/20 text-red-300 border-danger/30'
    : 'bg-accent/20 text-green-300 border-accent/30';
  const Icon = isFake ? BiXCircle : BiCheckCircle;
  const iconColor = isFake ? 'text-danger' : 'text-accent';

  const confidenceValue =
    typeof confidence === 'number' && !Number.isNaN(confidence)
      ? Math.max(0, Math.min(100, confidence))
      : 0;

  const biasType = result.bias_type || 'Not detected';
  const emotionalTone = result.emotional_tone || 'Not analyzed';

  let riskLabel = 'MEDIUM RISK';
  let riskEmoji = '🟨';
  let riskChipClasses = 'bg-amber-500/10 text-amber-300 border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.2)]';

  if (isFake) {
    if (confidenceValue >= 70) {
      riskLabel = 'HIGH RISK';
      riskEmoji = '🔴';
      riskChipClasses = 'bg-danger/10 text-red-300 border-danger/40 shadow-[0_0_15px_rgba(239,68,68,0.2)]';
    } else {
      riskLabel = 'ELEVATED RISK';
      riskEmoji = '🟧';
      riskChipClasses = 'bg-amber-500/10 text-amber-300 border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.2)]';
    }
  } else {
    if (confidenceValue >= 70) {
      riskLabel = 'LOW RISK';
      riskEmoji = '🟢';
      riskChipClasses = 'bg-accent/10 text-green-300 border-accent/40 shadow-[0_0_15px_rgba(34,197,94,0.2)]';
    } else {
      riskLabel = 'MEDIUM RISK';
      riskEmoji = '🟨';
      riskChipClasses = 'bg-amber-500/10 text-amber-300 border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.2)]';
    }
  }

  return (
    <div className={`w-full max-w-4xl mx-auto rounded-3xl border ${borderColor} animate-reveal-result bg-card/60 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] overflow-hidden transition-all duration-500 ease-out p-1`}>
      <div className={`w-full h-full rounded-[20px] pb-10 ${bgColor}`}>
        {/* 🧠 Overall Verdict Section */}
        <div className="p-8 pb-6 border-b border-white/5">
          <div className="flex items-center gap-2 mb-6 opacity-80">
            <BiShieldQuarter className="text-xl text-primary" />
            <h2 className="text-sm font-semibold tracking-widest uppercase text-white/70">Classification Engine</h2>
          </div>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex-1">
              <div className={`inline-flex items-center gap-3 px-6 py-2.5 rounded-full border shadow-lg font-bold text-lg tracking-wide ${badgeColor}`}>
                <Icon className={`text-2xl ${iconColor}`} />
                {isFake ? 'MANIPULATED CONTENT' : 'AUTHENTIC CONTENT'}
              </div>
              <p className="text-sm text-text/50 mt-4 leading-relaxed max-w-md">Our models indicate this content exhibits strong signals associated with {isFake ? 'fabricated' : 'factual'} information.</p>
            </div>

            <div className={`flex flex-col items-center justify-center p-5 rounded-2xl border-2 min-w-[160px] ${riskChipClasses} backdrop-blur-md`}>
              <span className="text-2xl mb-2 filter drop-shadow-md">{riskEmoji}</span>
              <p className="font-bold tracking-wider text-xs">{riskLabel}</p>
            </div>
          </div>
        </div>

        <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-8 gap-y-12">
          {/* Confidence Display Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 opacity-80 mb-2">
              <span className="text-lg">📊</span>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-text/60">Confidence Metric</h3>
            </div>
            
            <div className="flex items-center gap-8">
              <div className="relative w-32 h-32 flex-shrink-0 animate-circular-glow">
                <svg className="-rotate-90 drop-shadow-lg w-full h-full" viewBox="0 0 160 160">
                  <circle cx="80" cy="80" r="60" stroke="#1e293b" strokeWidth="10" fill="transparent" />
                  <circle cx="80" cy="80" r="60" stroke={isFake ? '#ef4444' : '#22c55e'} strokeWidth="10" fill="transparent" strokeLinecap="round" strokeDasharray={376.99} strokeDashoffset={376.99 - (confidenceValue / 100) * 376.99} style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.16, 1, 0.3, 1)', filter: isFake ? 'drop-shadow(0 0 10px rgba(239, 68, 68, 0.5))' : 'drop-shadow(0 0 10px rgba(34, 197, 94, 0.5))' }} />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-3xl font-bold tracking-tight ${isFake ? 'text-red-400' : 'text-green-400'}`}>{confidenceValue}%</span>
                </div>
              </div>

              <div className="flex-1 space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-white/80 font-medium">Model Certainty</span>
                  </div>
                  <p className="text-xs text-text/40 leading-relaxed mb-3">Calculated aggregated probability across multiple transformer layers.</p>
                  <div className="w-full bg-black/40 rounded-full h-2 overflow-hidden border border-white/5">
                    <div className={`h-full transition-all duration-1000 ease-out rounded-full ${isFake ? 'bg-gradient-to-r from-red-600 to-red-400' : 'bg-gradient-to-r from-emerald-600 to-emerald-400'}`} style={{ width: `${confidenceValue}%` }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 📊 Bias Analysis Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 opacity-80 mb-2">
              <span className="text-lg">🎭</span>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-text/60">Bias & Tone Analysis</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-black/20 border border-white/5 backdrop-blur-sm">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-text/40 mb-1.5">Detected Bias</p>
                <p className="text-sm text-white font-medium">{biasType}</p>
              </div>

              <div className="p-4 rounded-xl bg-black/20 border border-white/5 backdrop-blur-sm">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-text/40 mb-1.5">Emotional Tone</p>
                <p className="text-sm text-white font-medium">{emotionalTone}</p>
              </div>
              
              <div className="col-span-2 p-4 rounded-xl bg-black/20 border border-white/5 backdrop-blur-sm">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-text/40 mb-2">AI Reasoning</p>
                <p className="text-xs text-text/70 leading-relaxed max-w-sm">
                  {explanation ? explanation : 'No detailed explanation was provided for this neural assessment.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="px-8 space-y-8">
          {factCheckWarning && (
            <div className="p-5 bg-danger/10 border border-danger/30 rounded-xl flex gap-4 backdrop-blur-md">
              <BiError className="text-danger text-2xl flex-shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-red-300 mb-1 tracking-wide uppercase">Fact-Check Database Match</h4>
                <p className="text-red-200/90 text-sm leading-relaxed">{factCheckWarning}</p>
              </div>
            </div>
          )}

          {sourceUrl && (
            <div className="p-4 bg-black/20 border border-white/5 rounded-xl flex flex-col gap-1">
              <h4 className="text-[10px] uppercase tracking-wider text-text/40 font-bold">Source Context URL</h4>
              <a href={sourceUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80 text-xs break-all truncate transition-colors">
                {sourceUrl}
              </a>
            </div>
          )}

          {claims && claims.length > 0 && (
            <div className="border-t border-white/5 pt-8">
              <ClaimsAnalysis claims={claims} />
            </div>
          )}

          {sentenceAnalysis.length > 0 && (
            <div className="border-t border-white/5 pt-8">
              <div className="flex items-center gap-2 mb-6">
                <span className="text-lg">⚠</span>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-text/60">Forensic Sentence Risk</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sentenceAnalysis.map((item, idx) => {
                  const level = (item.risk_level || '').toUpperCase();
                  let borderColor = 'border-white/10';
                  let bgColor = 'bg-black/20';
                  let textColor = 'text-white/80';
                  let riskIcon = '🔍';

                  if (level === 'SAFE') {
                    borderColor = 'border-accent/40';
                    bgColor = 'bg-accent/5';
                    textColor = 'text-green-300';
                    riskIcon = '✓';
                  } else if (level === 'MISLEADING') {
                    borderColor = 'border-amber-400/30';
                    bgColor = 'bg-amber-500/5';
                    textColor = 'text-amber-300';
                    riskIcon = '⚠';
                  } else if (level === 'HIGH_RISK') {
                    borderColor = 'border-danger/40';
                    bgColor = 'bg-danger/5';
                    textColor = 'text-red-300';
                    riskIcon = '🔴';
                  }

                  return (
                    <div key={idx} className={`p-5 rounded-xl border ${borderColor} ${bgColor} transition-all duration-300 hover:-translate-y-1 hover:shadow-lg backdrop-blur-sm`}>
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                          <span className="text-sm font-bold uppercase tracking-wider" style={{ color: textColor === "text-green-300" ? "#86efac" : textColor === "text-amber-300" ? "#fcd34d" : "#fca5a5" }}>{level}</span>
                        </div>
                        <p className="text-sm text-text/80 leading-relaxed">
                          "{item.sentence_text}"
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
