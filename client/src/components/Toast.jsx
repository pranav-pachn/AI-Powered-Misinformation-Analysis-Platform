  import { BiX } from 'react-icons/bi';

export default function Toast({ message, type = 'error', onDismiss, onClose }) {
  const dismiss = onDismiss ?? onClose;
  const isError = type === 'error';

  if (!message) return null;

  return (
    <div
      role="alert"
      className={`flex items-center gap-3 p-4 rounded-xl border shadow-lg animate-slide-in-right max-w-sm ${
        isError
          ? 'bg-[#ef4444]/95 border-red-400/50 text-white'
          : 'bg-[#1e293b]/95 border-slate-600/50 text-slate-100'
      }`}
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{message}</p>
      </div>
      {dismiss && (
        <button
          onClick={dismiss}
          aria-label="Dismiss"
          className="flex-shrink-0 p-1 rounded-lg hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
        >
          <BiX className="text-lg" />
        </button>
      )}
    </div>
  );
}
