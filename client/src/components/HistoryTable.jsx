import { BiCheckCircle, BiXCircle, BiRefresh, BiSearch, BiX, BiExpand, BiError, BiLoader, BiTrash } from 'react-icons/bi';
import { useState, useEffect } from 'react';
import { getHistory, clearHistory, deleteArticle } from '../services/api';
import { useToast } from '../context/ToastContext';
import Loader from './Loader';
import ClaimsAnalysis from './ClaimsAnalysis';

export default function HistoryTable() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [clearingHistory, setClearingHistory] = useState(false);
  const [deleteArticleConfirm, setDeleteArticleConfirm] = useState(null);
  const [deletingArticle, setDeletingArticle] = useState(false);
  const { showToast } = useToast();

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getHistory();
      setHistory(data || []);
    } catch (err) {
      const msg = err.message;
      setError(msg);
      showToast(msg);
      console.error('Error fetching history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleClearHistory = async () => {
    try {
      setClearingHistory(true);
      await clearHistory();
      setHistory([]);
      setShowClearConfirm(false);
      showToast('History cleared successfully!');
    } catch (err) {
      const msg = err.message;
      showToast(msg);
      console.error('Error clearing history:', err);
    } finally {
      setClearingHistory(false);
    }
  };

  const handleDeleteArticle = async () => {
    try {
      setDeletingArticle(true);
      const articleId = deleteArticleConfirm.id;
      const articleTitle = deleteArticleConfirm.title;
      await deleteArticle(articleId);
      setHistory(history.filter((item) => item.id !== articleId));
      setDeleteArticleConfirm(null);
      showToast(`"${articleTitle}" deleted successfully!`);
    } catch (err) {
      const msg = err.message;
      showToast(msg);
      console.error('Error deleting article:', err);
    } finally {
      setDeletingArticle(false);
    }
  };

  const filteredHistory = history.filter((item) => {
    const content = item.text || item.content || '';
    const url = item.source_url || '';
    const explanation = item.explanation || '';
    const searchLower = searchQuery.toLowerCase();
    return (
      content.toLowerCase().includes(searchLower) ||
      url.toLowerCase().includes(searchLower) ||
      explanation.toLowerCase().includes(searchLower) ||
      item.result.toLowerCase().includes(searchLower)
    );
  });

  if (loading) return <Loader />;

  // Details Modal Component
  const DetailsModal = ({ article, onClose }) => {
    const [claims, setClaims] = useState([]);
    const [loadingClaims, setLoadingClaims] = useState(false);

    useEffect(() => {
      if (article) {
        fetchArticleClaims();
      }
    }, [article]);

    const fetchArticleClaims = async () => {
      try {
        setLoadingClaims(true);
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/article/${article.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (response.ok && data.claims) {
          setClaims(data.claims);
        }
      } catch (error) {
        console.error('Failed to fetch claims:', error);
      } finally {
        setLoadingClaims(false);
      }
    };

    if (!article) return null;
    const isFake = article.result === 'Fake';
    const badgeBg = isFake
      ? 'bg-[#ef4444]/20 text-red-300 border-[#ef4444]/30'
      : 'bg-[#22c55e]/20 text-green-300 border-[#22c55e]/30';
    const Icon = isFake ? BiXCircle : BiCheckCircle;

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-[#1e293b] border border-slate-700/50 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
          <div className="sticky top-0 bg-[#1e293b] border-b border-slate-700/50 p-6 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-100">Article Details</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-800/50 rounded-lg transition-colors"
            >
              <BiX className="text-2xl text-slate-400" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Result Badge */}
            <div className="flex items-center gap-4">
              <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border font-semibold ${badgeBg}`}>
                <Icon className="text-xl" />
                {article.result}
              </span>
              <div className="flex items-center gap-3">
                <span className="text-slate-400">Confidence:</span>
                <span className={`font-bold text-lg ${isFake ? 'text-[#ef4444]' : 'text-[#22c55e]'}`}>
                  {article.confidence}%
                </span>
              </div>
            </div>

            {/* Confidence Bar */}
            <div>
              <p className="text-sm text-slate-400 mb-2">Confidence Level</p>
              <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full ${isFake ? 'bg-[#ef4444]' : 'bg-[#22c55e]'}`}
                  style={{ width: `${article.confidence || 0}%` }}
                />
              </div>
            </div>

            {/* Full Article Content */}
            {article.source_url && (
              <div>
                <h3 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wider">
                  Source URL
                </h3>
                <a
                  href={article.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-xs text-indigo-300 hover:text-indigo-200 break-all underline-offset-2 hover:underline"
                >
                  {article.source_url}
                </a>
              </div>
            )}

            {/* Full Article Content */}
            <div>
              <h3 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wider">Article Content</h3>
              <div className="p-4 bg-slate-800/30 border border-slate-700/30 rounded-lg">
                <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {article.text || article.content}
                </p>
              </div>
            </div>

            {/* AI Explanation */}
            <div>
              <h3 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wider">AI Analysis</h3>
              <div className="p-4 bg-slate-800/30 border border-slate-700/30 rounded-lg">
                <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {article.explanation}
                </p>
              </div>
            </div>

            {/* Claims Section */}
            {loadingClaims ? (
              <div className="flex items-center justify-center py-6">
                <BiLoader className="text-2xl text-[#6366f1] animate-spin" />
              </div>
            ) : claims.length > 0 ? (
              <ClaimsAnalysis claims={claims} />
            ) : null}

            {/* Timestamp */}
            <div className="pt-4 border-t border-slate-700/30">
              <p className="text-sm text-slate-500">
                Analyzed on{' '}
                {new Date(article.created_at || article.timestamp || Date.now()).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };
    

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {error && (
        <div className="p-6 bg-[#1e293b] border border-[#ef4444]/30 rounded-xl flex items-center justify-between">
          <p className="text-[#ef4444]">{error}</p>
          <button
            onClick={fetchHistory}
            className="px-4 py-2 bg-[#ef4444]/20 hover:bg-[#ef4444]/30 border border-[#ef4444]/30 rounded-lg transition-colors flex items-center gap-2 text-red-300"
          >
            <BiRefresh /> Retry
          </button>
        </div>
      )}

      {!error && !history.length && (
        <div className="w-full max-w-6xl mx-auto p-12 text-center bg-[#1e293b] rounded-xl border border-slate-700/50">
          <p className="text-slate-400 text-lg">No analysis history yet. Start by analyzing some news!</p>
        </div>
      )}

      {!error && history.length > 0 && (
        <>
          {/* Search Bar */}
          <div className="relative">
            <BiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500 text-lg" />
            <input
              type="text"
              placeholder="Search articles by content or explanation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-[#1e293b] border border-slate-700/50 rounded-lg text-slate-300 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#6366f1] focus:border-transparent transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
              >
                <BiX className="text-lg" />
              </button>
            )}
          </div>

          <div className="flex justify-between items-center gap-3">
            <p className="text-sm text-slate-400">
              Showing {filteredHistory.length} of {history.length} articles
            </p>
            <div className="flex gap-2">
              <button
                onClick={fetchHistory}
                disabled={loading}
                className="px-4 py-2 bg-[#6366f1]/20 hover:bg-[#6366f1]/30 border border-[#6366f1]/30 rounded-lg text-indigo-300 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <BiRefresh /> Refresh
              </button>
              <button
                onClick={() => setShowClearConfirm(true)}
                disabled={loading || history.length === 0}
                className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-red-300 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <BiTrash /> Clear History
              </button>
            </div>
          </div>

          {/* No Search Results */}
          {filteredHistory.length === 0 && (
            <div className="w-full p-12 text-center bg-[#1e293b] rounded-xl border border-slate-700/50">
              <p className="text-slate-400 text-lg">No articles match your search criteria.</p>
            </div>
          )}

          <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-700/50 bg-[#1e293b] shadow-xl">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700/50">
                  <th className="text-left py-4 px-6 text-slate-400 font-bold">Content Preview</th>
                  <th className="text-center py-4 px-6 text-slate-400 font-bold">Result</th>
                  <th className="text-center py-4 px-6 text-slate-400 font-bold">Confidence</th>
                  <th className="text-left py-4 px-6 text-slate-400 font-bold">Date</th>
                  <th className="text-center py-4 px-6 text-slate-400 font-bold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.map((item, index) => {
                  const isFake = item.result === 'Fake';
                  const statusColor = isFake ? 'text-[#ef4444]' : 'text-[#22c55e]';
                  const badgeBg = isFake
                    ? 'bg-[#ef4444]/20 text-red-300 border-[#ef4444]/30'
                    : 'bg-[#22c55e]/20 text-green-300 border-[#22c55e]/30';
                  const Icon = isFake ? BiXCircle : BiCheckCircle;

                  return (
                    <tr
                      key={item.id || index}
                      className="border-b border-slate-700/30 last:border-0 hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="py-4 px-6">
                        <p className="text-slate-300 truncate max-w-xs">
                          {item.source_url
                            ? item.source_url
                            : `${(item.text || item.content || '').substring(0, 60)}...`}
                        </p>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span
                          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border font-medium ${badgeBg}`}
                        >
                          <Icon className="text-lg" />
                          {item.result}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-3">
                          <span className={`font-bold ${statusColor}`}>{item.confidence}%</span>
                          <div className="w-16 bg-slate-700 rounded-full h-2 overflow-hidden">
                            <div
                              className={`h-full ${isFake ? 'bg-[#ef4444]' : 'bg-[#22c55e]'}`}
                              style={{ width: `${item.confidence || 0}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-slate-400 text-sm">
                        {new Date(item.created_at || item.timestamp || Date.now()).toLocaleDateString()} at{' '}
                        {new Date(item.created_at || item.timestamp || Date.now()).toLocaleTimeString()}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => setSelectedArticle(item)}
                            className="inline-flex items-center gap-2 px-3 py-1 bg-[#6366f1]/20 hover:bg-[#6366f1]/30 border border-[#6366f1]/30 rounded-lg text-indigo-300 transition-colors text-sm"
                          >
                            <BiExpand /> View
                          </button>
                          <button
                            onClick={() =>
                              setDeleteArticleConfirm({
                                id: item.id,
                                title: item.source_url
                                  ? item.source_url
                                  : `${(item.text || item.content || '').substring(0, 40)}...`,
                              })
                            }
                            className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-red-300 transition-colors text-sm"
                          >
                            <BiTrash /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="md:hidden space-y-4">
            {filteredHistory.map((item, index) => {
              const isFake = item.result === 'Fake';
              const bgColor = isFake ? 'bg-[#ef4444]/10' : 'bg-[#22c55e]/10';
              const borderColor = isFake ? 'border-[#ef4444]/30' : 'border-[#22c55e]/30';
              const badgeBg = isFake ? 'bg-[#ef4444]/20 text-red-300' : 'bg-[#22c55e]/20 text-green-300';
              const Icon = isFake ? BiXCircle : BiCheckCircle;
              const statusColor = isFake ? 'text-[#ef4444]' : 'text-[#22c55e]';

              return (
                <div
                  key={item.id || index}
                  className={`p-4 rounded-xl border bg-[#1e293b] ${bgColor} ${borderColor}`}
                >
                  <p className="text-slate-300 text-sm mb-3 line-clamp-2">
                    {item.source_url
                      ? item.source_url
                      : `${(item.text || item.content || '').substring(0, 100)}...`}
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span
                        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${badgeBg}`}
                      >
                        <Icon />
                        {item.result}
                      </span>
                      <span className={`font-bold text-sm ${statusColor}`}>{item.confidence}%</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full ${isFake ? 'bg-[#ef4444]' : 'bg-[#22c55e]'}`}
                        style={{ width: `${item.confidence || 0}%` }}
                      />
                    </div>
                    <p className="text-slate-500 text-xs">
                      {new Date(item.created_at || item.timestamp || Date.now()).toLocaleString()}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedArticle(item)}
                        className="flex-1 px-3 py-2 bg-[#6366f1]/20 hover:bg-[#6366f1]/30 border border-[#6366f1]/30 rounded-lg text-indigo-300 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                      >
                        <BiExpand /> View
                      </button>
                      <button
                        onClick={() =>
                          setDeleteArticleConfirm({
                            id: item.id,
                            title: item.source_url
                              ? item.source_url
                              : `${(item.text || item.content || '').substring(0, 40)}...`,
                          })
                        }
                        className="flex-1 px-3 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-red-300 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                      >
                        <BiTrash /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <div className="p-4 bg-[#1e293b] border border-slate-700/50 rounded-xl">
              <p className="text-slate-400 text-sm">Total Analyses</p>
              <p className="text-3xl font-bold text-[#6366f1] mt-2">{history.length}</p>
            </div>
            <div className="p-4 bg-[#1e293b] border border-slate-700/50 rounded-xl">
              <p className="text-slate-400 text-sm">Fake Detected</p>
              <p className="text-3xl font-bold text-[#ef4444] mt-2">
                {history.filter((h) => h.result === 'Fake').length}
              </p>
            </div>
            <div className="p-4 bg-[#1e293b] border border-slate-700/50 rounded-xl">
              <p className="text-slate-400 text-sm">Real Confirmed</p>
              <p className="text-3xl font-bold text-[#22c55e] mt-2">
                {history.filter((h) => h.result === 'Real').length}
              </p>
            </div>
          </div>
        </>
      )}

      {/* Details Modal */}
      <DetailsModal article={selectedArticle} onClose={() => setSelectedArticle(null)} />

      {/* Clear History Confirmation Modal */}
      {/* Clear History Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1e293b] border border-red-500/40 rounded-xl max-w-sm w-full shadow-2xl">
            <div className="p-6 space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2 mb-2">
                  <BiTrash className="text-red-400 text-2xl" />
                  Clear History?
                </h2>
                <p className="text-slate-400">
                  This will permanently delete all {history.length} analysis record{history.length !== 1 ? 's' : ''} from your account. This action cannot be undone.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  disabled={clearingHistory}
                  className="flex-1 px-4 py-2 bg-slate-700/50 hover:bg-slate-700 border border-slate-600 rounded-lg text-slate-200 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleClearHistory}
                  disabled={clearingHistory}
                  className="flex-1 px-4 py-2 bg-red-500/90 hover:bg-red-600 border border-red-600 rounded-lg text-white font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {clearingHistory ? (
                    <>
                      <BiLoader className="animate-spin" /> Clearing...
                    </>
                  ) : (
                    <>
                      <BiTrash /> Clear All
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Article Confirmation Modal */}
      {deleteArticleConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1e293b] border border-red-500/40 rounded-xl max-w-sm w-full shadow-2xl">
            <div className="p-6 space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2 mb-2">
                  <BiTrash className="text-red-400 text-2xl" />
                  Delete Article?
                </h2>
                <p className="text-slate-400 mb-3">
                  Are you sure you want to delete this article? This action cannot be undone.
                </p>
                <p className="text-slate-300 text-sm bg-slate-800/40 p-3 rounded border border-slate-700 break-words">
                  {deleteArticleConfirm.title}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteArticleConfirm(null)}
                  disabled={deletingArticle}
                  className="flex-1 px-4 py-2 bg-slate-700/50 hover:bg-slate-700 border border-slate-600 rounded-lg text-slate-200 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteArticle}
                  disabled={deletingArticle}
                  className="flex-1 px-4 py-2 bg-red-500/90 hover:bg-red-600 border border-red-600 rounded-lg text-white font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {deletingArticle ? (
                    <>
                      <BiLoader className="animate-spin" /> Deleting...
                    </>
                  ) : (
                    <>
                      <BiTrash /> Delete
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
