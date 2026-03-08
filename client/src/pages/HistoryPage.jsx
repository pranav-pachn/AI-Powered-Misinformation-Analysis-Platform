import { BiHistory } from 'react-icons/bi';
import HistoryTable from '../components/HistoryTable';

export default function HistoryPage() {
  return (
    <div className="page-transition min-h-screen bg-[#0f172a] pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-gradient-to-br from-[#6366f1] to-indigo-600 rounded-lg shadow-lg">
            <BiHistory className="text-white text-2xl" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-slate-100">Analysis History</h1>
            <p className="text-slate-400 mt-2">
              Review all your previous news analyses and detection results
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <HistoryTable />
      </div>
    </div>
  );
}
