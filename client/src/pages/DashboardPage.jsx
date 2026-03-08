import { useEffect, useState } from 'react';
import { BiPulse, BiBarChartSquare, BiLineChart, BiPieChartAlt } from 'react-icons/bi';
import { getAnalytics } from '../services/api';
import Loader from '../components/Loader';
import { useScrollReveal } from '../hooks/useScrollReveal';
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  LineElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  PointElement,
} from 'chart.js';
import { Pie, Bar, Line } from 'react-chartjs-2';

ChartJS.register(
  ArcElement,
  BarElement,
  LineElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  PointElement,
);

export default function DashboardPage() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Scroll reveal effect
  useScrollReveal('.scroll-reveal');

  useEffect(() => {
    async function loadAnalytics() {
      try {
        setLoading(true);
        setError('');
        const data = await getAnalytics();
        setAnalytics(data);
      } catch (err) {
        setError(err.message || 'Failed to load analytics.');
      } finally {
        setLoading(false);
      }
    }

    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] pt-24 flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0f172a] pt-24 flex items-center justify-center">
        <div className="bg-[#1e293b] border border-red-500/40 rounded-xl p-6 text-red-200">
          {error}
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-[#0f172a] pt-24 pb-16 flex items-center justify-center px-4">
        <div className="max-w-md text-center p-8 rounded-2xl border border-slate-700/50 bg-gradient-to-br from-slate-800/40 to-slate-900/40 shadow-xl">
          <div className="text-6xl mb-4">📊</div>
          <h2 className="text-2xl font-bold text-slate-100 mb-3">No Analyses Yet</h2>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Start by analyzing your first article to see detailed statistics, bias distribution, and trends on your dashboard.
          </p>
          <div className="pt-6 border-t border-slate-700/50">
            <p className="text-xs text-slate-500">✨ Dashboard updates automatically as you analyze articles</p>
          </div>
        </div>
      </div>
    );
  }

  const {
    total_articles,
    fake_count,
    real_count,
    url_based_count,
    bias_distribution,
    daily_trend,
  } = analytics;

  const fakeRealData = {
    labels: ['Fake', 'Real'],
    datasets: [
      {
        label: 'Articles',
        data: [fake_count || 0, real_count || 0],
        backgroundColor: ['#ef4444', '#22c55e'],
        borderColor: ['#fecaca', '#bbf7d0'],
        borderWidth: 1,
      },
    ],
  };

  const biasLabels = ['Left-Leaning', 'Right-Leaning', 'Neutral'];
  const biasData = {
    labels: biasLabels,
    datasets: [
      {
        label: 'Articles',
        data: biasLabels.map((label) => bias_distribution?.[label] || 0),
        backgroundColor: ['#60a5fa', '#f97316', '#a855f7'],
      },
    ],
  };

  const trendLabels = (daily_trend || []).map((item) => item.date);
  const trendData = {
    labels: trendLabels,
    datasets: [
      {
        label: 'Articles per day',
        data: (daily_trend || []).map((item) => item.count),
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.25)',
        tension: 0.3,
        fill: true,
      },
    ],
  };

  return (
    <div className="page-transition min-h-screen bg-[#0f172a] pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-12">
          <div className="flex items-center gap-3 mb-3">
            <BiPulse className="text-2xl text-[#22c55e]" />
            <h1 className="text-3xl sm:text-4xl font-semibold text-slate-50">
              Analytics Dashboard
            </h1>
          </div>
          <p className="text-sm sm:text-base text-slate-400 max-w-2xl leading-relaxed">
            Track how misinformation flows through your workspace with high-level stats, bias distribution, and daily detection trends. All insights update in real-time as you analyze articles.
          </p>
        </header>

        {/* Summary cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="scroll-reveal rounded-2xl border border-slate-700/60 bg-gradient-to-br from-slate-800/50 to-slate-900/40 p-6 shadow-lg shadow-slate-950/50 transition-all duration-300 hover:shadow-xl hover:shadow-slate-950/60 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs uppercase tracking-wider font-medium text-slate-400">Total Articles</span>
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-300 text-lg">
                <BiBarChartSquare />
              </span>
            </div>
            <p className="text-4xl font-bold text-slate-50">{total_articles || 0}</p>
          </div>

          <div className="scroll-reveal rounded-2xl border border-slate-700/60 bg-gradient-to-br from-slate-800/50 to-slate-900/40 p-6 shadow-lg shadow-slate-950/50 transition-all duration-300 hover:shadow-xl hover:shadow-slate-950/60 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs uppercase tracking-wider font-medium text-slate-400">Fake Articles</span>
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/20 text-red-300 text-lg">
                <BiPieChartAlt />
              </span>
            </div>
            <p className="text-4xl font-bold text-red-300">{fake_count || 0}</p>
          </div>

          <div className="scroll-reveal rounded-2xl border border-slate-700/60 bg-gradient-to-br from-slate-800/50 to-slate-900/40 p-6 shadow-lg shadow-slate-950/50 transition-all duration-300 hover:shadow-xl hover:shadow-slate-950/60 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs uppercase tracking-wider font-medium text-slate-400">Real Articles</span>
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-300 text-lg">
                <BiLineChart />
              </span>
            </div>
            <p className="text-4xl font-bold text-emerald-300">{real_count || 0}</p>
          </div>

          <div className="scroll-reveal rounded-2xl border border-slate-700/60 bg-gradient-to-br from-slate-800/50 to-slate-900/40 p-6 shadow-lg shadow-slate-950/50 transition-all duration-300 hover:shadow-xl hover:shadow-slate-950/60 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs uppercase tracking-wider font-medium text-slate-400">URL-Based Analyses</span>
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/20 text-violet-300 text-lg">
                <BiPulse />
              </span>
            </div>
            <p className="text-4xl font-bold text-violet-300">{url_based_count || 0}</p>
          </div>
        </section>

        {/* Charts */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          <div className="scroll-reveal rounded-2xl border border-slate-700/60 bg-gradient-to-br from-slate-800/50 to-slate-900/40 p-6 shadow-lg shadow-slate-950/50 transition-all duration-300 hover:shadow-xl hover:shadow-slate-950/60 hover:-translate-y-1">
            <h2 className="text-sm font-semibold text-slate-200 mb-1 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-gradient-to-r from-red-400 to-emerald-400" />
              Fake vs Real Distribution
            </h2>
            <p className="text-xs text-slate-500 mb-5">
              {real_count && total_articles ? `Fake content comprises ${Math.round((fake_count / total_articles) * 100)}% of analyzed articles` : 'Analyze articles to see distribution'}
            </p>
            <div className="h-48">
              <Pie
                data={fakeRealData}
                options={{
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      labels: { color: '#cbd5f5' },
                    },
                  },
                }}
              />
            </div>
          </div>

          <div className="scroll-reveal rounded-2xl border border-slate-700/60 bg-gradient-to-br from-slate-800/50 to-slate-900/40 p-6 shadow-lg shadow-slate-950/50 transition-all duration-300 hover:shadow-xl hover:shadow-slate-950/60 hover:-translate-y-1">
            <h2 className="text-sm font-semibold text-slate-200 mb-1 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-gradient-to-r from-sky-400 to-purple-400" />
              Bias Distribution Analysis
            </h2>
            <p className="text-xs text-slate-500 mb-5">
              {bias_distribution && bias_distribution['Right-Leaning'] ? `Right-leaning bias dominates ${Math.round((bias_distribution['Right-Leaning'] / total_articles) * 100)}% of content` : 'Analyze articles to see bias patterns'}
            </p>
            <div className="h-48">
              <Bar
                data={biasData}
                options={{
                  maintainAspectRatio: false,
                  scales: {
                    x: {
                      ticks: { color: '#9ca3af' },
                      grid: { color: 'rgba(55, 65, 81, 0.7)' },
                    },
                    y: {
                      ticks: { color: '#9ca3af' },
                      grid: { color: 'rgba(55, 65, 81, 0.7)' },
                    },
                  },
                  plugins: {
                    legend: {
                      labels: { color: '#cbd5f5' },
                    },
                  },
                }}
              />
            </div>
          </div>
        </section>

        <section className="scroll-reveal rounded-2xl border border-slate-700/60 bg-gradient-to-br from-slate-800/50 to-slate-900/40 p-6 shadow-lg shadow-slate-950/50 transition-all duration-300 hover:shadow-xl hover:shadow-slate-950/60 hover:-translate-y-1">
          <h2 className="text-sm font-semibold text-slate-200 mb-1 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-gradient-to-r from-indigo-400 to-sky-400" />
            Daily Analysis Trend
          </h2>
          <p className="text-xs text-slate-500 mb-5">
            {trendLabels.length > 0 
              ? `Peak activity on ${trendLabels[trendLabels.length - 1] || 'recent days'}`
              : 'Run analyses to track daily trends'
            }
          </p>
          {trendLabels.length === 0 ? (
            <div className="h-64 flex items-center justify-center rounded-lg bg-slate-800/30 border border-slate-700/30">
              <p className="text-sm text-slate-500 text-center">Begin analyzing articles to see your activity trends</p>
            </div>
          ) : (
            <div className="h-64">
              <Line
                data={trendData}
                options={{
                  maintainAspectRatio: false,
                  scales: {
                    x: {
                      ticks: { color: '#9ca3af' },
                      grid: { color: 'rgba(55, 65, 81, 0.5)' },
                    },
                    y: {
                      ticks: { color: '#9ca3af' },
                      grid: { color: 'rgba(55, 65, 81, 0.5)' },
                    },
                  },
                  plugins: {
                    legend: {
                      labels: { color: '#cbd5f5' },
                    },
                  },
                }}
              />
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

