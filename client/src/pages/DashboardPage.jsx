import { useEffect, useState } from 'react';
import { BiPulse, BiBarChartSquare, BiLineChart, BiPieChartAlt, BiTargetLock, BiData } from 'react-icons/bi';
import { getAnalytics } from '../services/api';
import Loader from '../components/Loader';
import { motion } from 'framer-motion';
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
  Filler
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
  Filler
);

// Custom Chart Tooltip plugin config
const chartOptions = {
  plugins: {
    legend: {
      labels: { color: 'rgba(255, 255, 255, 0.6)', font: { family: 'Inter', size: 11 } },
      position: 'bottom',
    },
    tooltip: {
      backgroundColor: 'rgba(15, 23, 42, 0.9)',
      titleColor: '#fff',
      bodyColor: 'rgba(255, 255, 255, 0.8)',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      borderWidth: 1,
      padding: 12,
      cornerRadius: 8,
      displayColors: true,
      titleFont: { family: 'Inter', size: 13, weight: 'bold' },
      bodyFont: { family: 'Inter', size: 12 },
    }
  },
  maintainAspectRatio: false,
};

export default function DashboardPage() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
      <div className="min-h-screen bg-background border-t border-white/5 pt-24 pb-16 flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background pt-24 pb-16 flex items-center justify-center px-6">
        <div className="glass-card max-w-lg p-8 border-danger/30 text-center">
          <BiPulse className="mx-auto text-4xl text-danger mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">System Error</h2>
          <p className="text-danger/80 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-background pt-24 pb-16 flex items-center justify-center px-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md text-center glass-card p-10 border-white/10"
        >
          <div className="inline-block p-4 rounded-2xl bg-primary/10 mb-6">
            <BiBarChartSquare className="text-4xl text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight mb-3">No Telemetry Yet</h2>
          <p className="text-text/60 text-sm leading-relaxed mb-8">
            Start processing articles through the reasoning engine to populate your analytics dashboard with cognitive insights and trend data.
          </p>
          <div className="pt-6 border-t border-white/5">
            <p className="text-xs text-text/40 tracking-wider uppercase font-medium">Dashboard updates in real-time</p>
          </div>
        </motion.div>
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
    labels: ['Manipulated', 'Authentic'],
    datasets: [
      {
        data: [fake_count || 0, real_count || 0],
        backgroundColor: ['rgba(239, 68, 68, 0.8)', 'rgba(34, 197, 94, 0.8)'],
        borderColor: ['rgba(239, 68, 68, 1)', 'rgba(34, 197, 94, 1)'],
        borderWidth: 1,
        hoverOffset: 4,
      },
    ],
  };

  const biasLabels = ['Left-Leaning', 'Right-Leaning', 'Neutral'];
  const biasData = {
    labels: biasLabels,
    datasets: [
      {
        label: 'Processed Articles',
        data: biasLabels.map((label) => bias_distribution?.[label] || 0),
        backgroundColor: ['rgba(96, 165, 250, 0.8)', 'rgba(251, 146, 60, 0.8)', 'rgba(167, 139, 250, 0.8)'],
        borderColor: ['rgba(96, 165, 250, 1)', 'rgba(251, 146, 60, 1)', 'rgba(167, 139, 250, 1)'],
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  const trendLabels = (daily_trend || []).map((item) => item.date);
  const trendData = {
    labels: trendLabels,
    datasets: [
      {
        label: 'Analysis Throughput',
        data: (daily_trend || []).map((item) => item.count),
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.15)',
        borderWidth: 2,
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#6366f1',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <div className="min-h-screen bg-background text-text pt-24 pb-20 relative overflow-hidden flex flex-col">
      {/* Background aesthetics */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-10 right-10 w-[600px] h-[600px] bg-sky-500/5 rounded-full blur-[150px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.015] mix-blend-overlay"></div>
      </div>

      <main className="relative z-10 max-w-7xl mx-auto px-6 w-full flex-grow flex flex-col">
        <header className="mb-12 border-b border-white/5 pb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="p-2 rounded-xl bg-primary/20 text-primary border border-primary/20">
              <BiPulse className="text-2xl" />
            </span>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              Platform Analytics
            </h1>
          </div>
          <p className="text-text/60 max-w-3xl leading-relaxed font-light">
            Monitor real-time cognitive processing metrics, track bias distributions, and analyze the flow of misinformation through your workspace. Telemetry updates automatically.
          </p>
        </header>

        <motion.div 
          className="flex-grow flex flex-col"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {/* Summary KPIs */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 w-full">
            {[
              { label: 'Total Scanned', value: total_articles || 0, icon: BiBarChartSquare, color: 'text-sky-400', bg: 'bg-sky-400/10' },
              { label: 'High Risk Flags', value: fake_count || 0, icon: BiTargetLock, color: 'text-red-400', bg: 'bg-red-400/10' },
              { label: 'Verified Authentic', value: real_count || 0, icon: BiPieChartAlt, color: 'text-green-400', bg: 'bg-green-400/10' },
              { label: 'Contexts Extracted', value: url_based_count || 0, icon: BiData, color: 'text-purple-400', bg: 'bg-purple-400/10' },
            ].map((stat, idx) => (
              <motion.div key={idx} variants={itemVariants} className="glass-card p-6 flex items-center justify-between border-white/5 group hover:border-white/10 transition-colors">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-text/40 mb-2">{stat.label}</p>
                  <p className="text-3xl font-bold text-white tracking-tight">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center border border-white/5 group-hover:scale-110 transition-transform`}>
                  <stat.icon className="text-2xl" />
                </div>
              </motion.div>
            ))}
          </section>

          {/* Core Analytics Grid */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 flex-grow">
            
            <motion.div variants={itemVariants} className="glass-card p-6 border-white/5 flex flex-col h-[400px]">
              <div className="flex items-center gap-2 mb-6">
                <span className="w-2 h-2 rounded-full bg-red-400" />
                <h2 className="text-sm font-semibold text-white tracking-wide">Risk Distribution</h2>
              </div>
              <div className="flex-1 relative pb-2 min-h-[250px]">
                <Pie data={fakeRealData} options={chartOptions} />
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="glass-card p-6 border-white/5 lg:col-span-2 flex flex-col h-[400px]">
              <div className="flex items-center gap-2 mb-6">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <h2 className="text-sm font-semibold text-white tracking-wide">Cognitive Bias Vector</h2>
              </div>
              <div className="flex-1 relative pb-2 min-h-[250px]">
                <Bar
                  data={biasData}
                  options={{
                    ...chartOptions,
                    scales: {
                      x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: 'rgba(255,255,255,0.4)', font: { family: 'Inter' } } },
                      y: { grid: { color: 'rgba(255,255,255,0.05)' }, border: { dash: [4, 4] }, ticks: { color: 'rgba(255,255,255,0.4)', font: { family: 'Inter' } } }
                    }
                  }}
                />
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="glass-card p-6 border-white/5 lg:col-span-3 flex flex-col h-[400px]">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  <h2 className="text-sm font-semibold text-white tracking-wide">Throughput Telemetry</h2>
                </div>
                <span className="text-xs text-text/40 bg-black/20 px-3 py-1 rounded-full font-mono">
                  {trendLabels.length > 0 ? `Latest: ${Math.max(...(daily_trend||[]).map(t=>t.count))} req/day` : 'Awaiting data...'}
                </span>
              </div>

              {trendLabels.length === 0 ? (
                <div className="flex-1 flex items-center justify-center border border-white/5 rounded-xl bg-black/10">
                  <p className="text-sm text-text/40 font-medium tracking-wide">Begin processing requests to generate telemetry</p>
                </div>
              ) : (
                <div className="flex-1 relative pb-2 min-h-[250px]">
                  <Line
                    data={trendData}
                    options={{
                      ...chartOptions,
                      scales: {
                        x: { grid: { display: false }, ticks: { color: 'rgba(255,255,255,0.4)', font: { family: 'Inter' } } },
                        y: { grid: { color: 'rgba(255,255,255,0.05)' }, border: { dash: [4, 4] }, ticks: { color: 'rgba(255,255,255,0.4)', font: { family: 'Inter' }, stepSize: 1 } }
                      }
                    }}
                  />
                </div>
              )}
            </motion.div>
          </section>

        </motion.div>
      </main>
    </div>
  );
}

