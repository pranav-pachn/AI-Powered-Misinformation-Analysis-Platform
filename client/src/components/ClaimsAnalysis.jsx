import { BiCheckCircle, BiXCircle, BiError } from 'react-icons/bi';

export default function ClaimsAnalysis({ claims }) {
  if (!claims || claims.length === 0) {
    return null;
  }

  return (
    <div className="mt-8 space-y-4">
      <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2">
        <BiError className="text-[#6366f1]" />
        Claim-by-Claim Analysis
      </h3>

      <div className="space-y-3">
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
            statusColor = 'text-[#22c55e]';
            badgeBg = 'bg-[#22c55e]/20 text-green-300 border-[#22c55e]/30';
            Icon = BiCheckCircle;
          } else if (isFalse) {
            statusColor = 'text-[#ef4444]';
            badgeBg = 'bg-[#ef4444]/20 text-red-300 border-[#ef4444]/30';
            Icon = BiXCircle;
          } else if (isMisleading) {
            statusColor = 'text-[#f59e0b]';
            badgeBg = 'bg-[#f59e0b]/20 text-amber-300 border-[#f59e0b]/30';
            Icon = BiError;
          }

          return (
            <div
              key={index}
              className="p-4 rounded-xl border border-slate-700/50 bg-slate-800/30 hover:bg-slate-800/50 transition-all duration-300"
            >
              {/* Claim Number and Verdict */}
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium text-slate-400">Claim {index + 1}</span>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full border text-sm font-bold ${badgeBg}`}>
                      <Icon className="text-lg" />
                      {claim.verdict}
                    </span>
                  </div>
                  <p className="text-slate-200 leading-relaxed">{claimText}</p>
                </div>
              </div>

              {/* Confidence */}
              <div className="flex items-center gap-3 mb-3">
                <span className={`text-sm font-bold ${statusColor}`}>{claim.confidence}% Confidence</span>
                <div className="flex-1 bg-slate-700 rounded-full h-2 overflow-hidden max-w-xs">
                  <div
                    className={`h-full transition-all ${
                      isTrue ? 'bg-[#22c55e]' : isFalse ? 'bg-[#ef4444]' : 'bg-[#f59e0b]'
                    }`}
                    style={{ width: `${claim.confidence}%` }}
                  />
                </div>
              </div>

              {/* Explanation */}
              <div className="p-3 bg-slate-900/50 rounded-xl border border-slate-700/30">
                <p className="text-sm text-slate-300">
                  <span className="font-bold text-slate-400">Analysis: </span>
                  {explanation}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="mt-6 p-4 bg-gradient-to-r from-slate-800/40 to-slate-800/20 rounded-xl border border-slate-700/30">
        <p className="text-sm text-slate-400">
          <span className="font-bold">Total Claims Analyzed:</span> {claims.length}
        </p>
        <div className="mt-2 flex gap-4 flex-wrap">
          <span className="text-sm text-[#22c55e]">
            ✓ True: {claims.filter((c) => c.verdict === 'True').length}
          </span>
          <span className="text-sm text-[#f59e0b]">
            ⚠ Misleading: {claims.filter((c) => c.verdict === 'Misleading').length}
          </span>
          <span className="text-sm text-[#ef4444]">
            ✗ False: {claims.filter((c) => c.verdict === 'False').length}
          </span>
        </div>
      </div>
    </div>
  );
}
