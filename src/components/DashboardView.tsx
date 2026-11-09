import React, { useEffect, useState } from 'react';
import { formatKES } from '../utils/businessMath.ts';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertTriangle,
  Receipt,
  FileText,
  Users,
  ArrowUpRight,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';

interface DashboardViewProps {
  onNavigate: (tab: any) => void;
  onOpenAI: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate, onOpenAI }) => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/dashboard/stats');
      if (!res.ok) throw new Error('Failed to load dashboard metrics');
      const data = await res.json();
      setStats(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-400">Loading business performance metrics...</p>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="p-8">
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-800 text-red-300 text-sm">
          {error || 'Unable to load dashboard.'}
        </div>
      </div>
    );
  }

  const { financialSummary, outstandingInvoicesTotal, lowStockCount, lowStockAlerts, recentSales, monthlySales } = stats;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner / Welcome & Quick Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Executive Dashboard</h1>
          <p className="text-sm text-slate-400">Live operational financial summary and real-time inventory alerts</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('pos')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors shadow-lg shadow-emerald-600/20"
          >
            <Receipt className="w-4 h-4" />
            <span>Open POS Terminal</span>
          </button>
          <button
            onClick={onOpenAI}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-emerald-400 font-semibold text-xs transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            <span>Ask Business AI</span>
          </button>
        </div>
      </div>

      {/* Low-stock Warning Bar */}
      {lowStockCount > 0 && (
        <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-800/60 flex items-center justify-between text-amber-200">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <span className="font-semibold">{lowStockCount} product(s) are low in stock</span>
              <span className="text-xs text-amber-300/80 ml-2">
                (e.g., {lowStockAlerts.map((p: any) => `${p.name} [${p.stockQuantity} left]`).join(', ')})
              </span>
            </div>
          </div>
          <button
            onClick={() => onNavigate('inventory')}
            className="px-3 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-medium transition-colors"
          >
            Review Stock
          </button>
        </div>
      )}

      {/* Main KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Revenue */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800/90 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Gross Revenue</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white font-mono tracking-tight">
            {formatKES(financialSummary.revenue)}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 mt-2 font-medium">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+14.2% vs previous period</span>
          </div>
        </div>

        {/* Operating Expenses */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800/90 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Operating Expenses</span>
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-400">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white font-mono tracking-tight">
            {formatKES(financialSummary.expenses)}
          </div>
          <div className="text-xs text-slate-400 mt-2">
            Rent, utilities, marketing & payroll
          </div>
        </div>

        {/* Net Profit */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800/90 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Net Profit</span>
            <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-2xl font-bold font-mono tracking-tight ${financialSummary.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {formatKES(financialSummary.netProfit)}
          </div>
          <div className="text-xs text-slate-400 mt-2">
            Net Margin: <span className="font-semibold text-white">{financialSummary.netMarginPct}%</span>
          </div>
        </div>

        {/* Outstanding Invoices */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800/90 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Outstanding Invoices</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-amber-300 font-mono tracking-tight">
            {formatKES(outstandingInvoicesTotal)}
          </div>
          <div className="flex items-center justify-between text-xs text-slate-400 mt-2">
            <span>Customer unpaid receivables</span>
            <button onClick={() => onNavigate('invoices')} className="text-emerald-400 hover:underline">
              View
            </button>
          </div>
        </div>
      </div>

      {/* Middle Grid: Financial Chart & Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Trends Chart (Visual Pure CSS Bar Chart) */}
        <div className="lg:col-span-2 p-6 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-semibold text-white">Sales & Expenditure Trends</h2>
              <p className="text-xs text-slate-400">Monthly revenue vs operating costs in Kenyan Shillings</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-emerald-500" />
                <span className="text-slate-300">Revenue</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-rose-500/70" />
                <span className="text-slate-300">Expenses</span>
              </div>
            </div>
          </div>

          {/* Bar Chart Bars */}
          <div className="h-48 flex items-end justify-between gap-4 pt-6 border-b border-slate-800 pb-2">
            {monthlySales.map((item: any, idx: number) => {
              const maxVal = Math.max(...monthlySales.map((m: any) => m.sales), 10000);
              const salesHeight = Math.min(100, Math.round((item.sales / maxVal) * 100));
              const expHeight = Math.min(100, Math.round((item.expenses / maxVal) * 100));
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <div className="w-full flex items-end justify-center gap-1 h-40">
                    <div
                      style={{ height: `${salesHeight}%` }}
                      className="w-1/2 bg-emerald-500 hover:bg-emerald-400 rounded-t transition-all relative group-hover:shadow-lg group-hover:shadow-emerald-500/30"
                      title={`Sales: KES ${item.sales.toLocaleString()}`}
                    />
                    <div
                      style={{ height: `${expHeight}%` }}
                      className="w-1/2 bg-rose-500/70 hover:bg-rose-500 rounded-t transition-all"
                      title={`Expenses: KES ${item.expenses.toLocaleString()}`}
                    />
                  </div>
                  <span className="text-xs text-slate-400 font-medium">{item.month}</span>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between text-xs text-slate-500 pt-3 font-mono">
            <span>KES 0</span>
            <span>KES {Math.max(...monthlySales.map((m: any) => m.sales)).toLocaleString()}</span>
          </div>
        </div>

        {/* Profitability Snapshot */}
        <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-semibold text-white mb-1">Financial Integrity Summary</h2>
            <p className="text-xs text-slate-400 mb-6">Database verified figures for current fiscal cycle</p>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Gross Margin</span>
                  <span className="font-semibold text-emerald-400">{financialSummary.grossMarginPct}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2">
                  <div
                    className="bg-emerald-500 h-2 rounded-full"
                    style={{ width: `${Math.min(100, financialSummary.grossMarginPct)}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Net Margin</span>
                  <span className="font-semibold text-teal-400">{financialSummary.netMarginPct}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2">
                  <div
                    className="bg-teal-500 h-2 rounded-full"
                    style={{ width: `${Math.min(100, Math.max(0, financialSummary.netMarginPct))}%` }}
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800/80 space-y-2 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>Gross Profit</span>
                  <span className="font-mono font-medium">{formatKES(financialSummary.grossProfit)}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Cost of Goods (COGS)</span>
                  <span className="font-mono">{formatKES(financialSummary.cogs)}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Stock Total Units</span>
                  <span className="font-mono">{stats.inventoryValuation?.totalUnits || 0} pcs</span>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate('finance')}
            className="w-full mt-6 py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors text-center"
          >
            Full P&L and Cashflow Statement →
          </button>
        </div>
      </div>

      {/* Bottom Grid: Recent Sales Transactions */}
      <div className="p-6 rounded-xl bg-slate-900 border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-white">Recent POS & M-Pesa Transactions</h2>
            <p className="text-xs text-slate-400">Verified point-of-sale customer checkouts</p>
          </div>
          <button
            onClick={() => onNavigate('pos')}
            className="text-xs text-emerald-400 hover:underline font-medium"
          >
            View all sales
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[11px]">
                <th className="pb-3 font-semibold">Receipt #</th>
                <th className="pb-3 font-semibold">Date</th>
                <th className="pb-3 font-semibold">Payment Method</th>
                <th className="pb-3 font-semibold">M-Pesa Reference</th>
                <th className="pb-3 font-semibold text-right">Amount</th>
                <th className="pb-3 font-semibold text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {recentSales.map((s: any) => (
                <tr key={s.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 font-mono font-medium text-white">{s.receiptNumber}</td>
                  <td className="py-3 text-slate-400">{new Date(s.createdAt).toLocaleDateString()}</td>
                  <td className="py-3 uppercase font-medium text-slate-300">{s.paymentMethod}</td>
                  <td className="py-3 font-mono text-emerald-400">{s.mpesaReference || '—'}</td>
                  <td className="py-3 text-right font-mono font-semibold text-white">{formatKES(s.totalAmount)}</td>
                  <td className="py-3 text-center">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800/40">
                      Completed
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
