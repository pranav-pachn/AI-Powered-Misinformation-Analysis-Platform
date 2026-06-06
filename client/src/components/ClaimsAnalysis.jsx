import { BiCheckCircle, BiXCircle, BiError } from 'react-icons/bi';

export default function ClaimsAnalysis({ claims }) {
  if (!claims || claims.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <h3 className="text-sm font-semibold tracking-widest uppercase text-white/70 flex items-center gap-2 mb-4">
        <BiError className="text-primary text-lg" />
        Claim-by-Claim Extraction
      </h3>

      <div className="space-y-4">
        {claims.map((claim, index) => {
          const isTrue = claim.verdict === 'True';
          const isMisleading = claim.verdict === 'Misleading';
          const isFalse = claim.verdict === 'False';
          const claimText = claim.claim_text || claim.claim || '';
          const explanation = claim.explanation || 'No detailed analysis was provided for this claim.';

          let statusColor = '';
          let badgeBg = '';
          let Icon = BiCheckCircle;

          if (isTrue) {
            statusColor = 'text-green-400';
            badgeBg = 'bg-accent/10 text-green-300 border-accent/20 shadow-[0_0_10px_rgba(34,197,94,0.1)]';
            Icon = BiCheckCircle;
          } else if (isFalse) {
            statusColor = 'text-red-400';
            badgeBg = 'bg-danger/10 text-red-300 border-danger/20 shadow-[0_0_10px_rgba(239,68,68,0.1)]';
            Icon = BiXCircle;
          } else if (isMisleading) {
            statusColor = 'text-amber-400';
            badgeBg = 'bg-amber-500/10 text-amber-300 border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.1)]';
            Icon = BiError;
          }

          return (
            <div
              key={index}
              className="p-5 rounded-2xl border border-white/5 bg-black/20 hover:bg-black/40 backdrop-blur-sm transition-all duration-300 hover:border-white/10"
            >
              <div className="flex flex-col gap-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-text/50">Claim {index + 1}</span>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] uppercase tracking-wider font-bold ${badgeBg}`}>
                        <Icon className="text-sm" />
                        {claim.verdict}
                      </span>
                    </div>
                    <p className="text-sm text-white/90 leading-relaxed font-medium">"{claimText}"</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center pt-2 border-t border-white/5">
                  <div className="col-span-1 md:col-span-2 p-3 bg-black/30 rounded-xl border border-white/5">
                    <p className="text-[11px] text-text/80 leading-relaxed">
                      <span className="font-bold text-text/40 uppercase tracking-wider text-[9px] mr-2 block mb-1">Neural Analysis</span>
                      {explanation}
                    </p>
                  </div>

                  <div className="col-span-1 flex flex-col justify-center">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-text/40">Confidence</span>
                      <span className={`text-xs font-bold ${statusColor}`}>{claim.confidence}%</span>
                    </div>
                    <div className="w-full bg-black/40 rounded-full h-1.5 overflow-hidden border border-white/5">
                      <div
                        className={`h-full transition-all duration-1000 ${
                          isTrue ? 'bg-gradient-to-r from-emerald-600 to-emerald-400' : isFalse ? 'bg-gradient-to-r from-red-600 to-red-400' : 'bg-gradient-to-r from-amber-600 to-amber-400'
                        }`}
                        style={{ width: `${claim.confidence}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="mt-6 p-4 bg-black/20 rounded-xl border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 backdrop-blur-sm">
        <p className="text-xs font-medium text-text/50 uppercase tracking-wider">
          Total Extractions: <span className="text-white font-bold ml-1">{claims.length}</span>
        </p>
        <div className="flex items-center gap-4 text-xs font-bold tracking-wide">
          <span className="text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-md">
            ✓ True: {claims.filter((c) => c.verdict === 'True').length}
          </span>
          <span className="text-amber-400 bg-amber-400/10 px-2 py-1 rounded-md">
            ⚠ Mixed: {claims.filter((c) => c.verdict === 'Misleading').length}
          </span>
          <span className="text-red-400 bg-red-400/10 px-2 py-1 rounded-md">
            ✗ Fake: {claims.filter((c) => c.verdict === 'False').length}
          </span>
        </div>
      </div>
    </div>
  );
}
