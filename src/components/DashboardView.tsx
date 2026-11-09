/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { formatKES } from '../utils/businessMath.ts';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertTriangle,
  Receipt,
  FileText,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface DashboardViewProps {
  onNavigate: (tab: any) => void;
  onOpenAI: () => void;
}

const COLORS = ['#10b981', '#14b8a6', '#06b6d4', '#3b82f6', '#6366f1'];

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

  const { financialSummary, outstandingInvoicesTotal, lowStockCount, lowStockAlerts, recentSales, monthlySales, topProducts } = stats;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner / Welcome & Quick Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Executive Dashboard</h1>
          <p className="text-sm text-slate-400">Live operational financial summary and real-time inventory analytics</p>
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

      {/* Middle Grid: Recharts Revenue Trends & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales & Expenditure Recharts Bar Chart */}
        <div className="lg:col-span-2 p-6 rounded-xl bg-slate-900 border border-slate-800 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-semibold text-white">Revenue & Expenditure Trends</h2>
              <p className="text-xs text-slate-400">Monthly revenue vs operating costs (Recharts visualization)</p>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlySales} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(val) => `Ksh ${(val / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem', color: '#fff', fontSize: '12px' }}
                  formatter={(val: any) => [formatKES(val), '']}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="sales" name="Revenue (KES)" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" name="Expenses (KES)" fill="#f43f5e" opacity={0.8} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Performing Products Recharts */}
        <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-semibold text-white mb-1">Top Performing Products</h2>
            <p className="text-xs text-slate-400 mb-4">Highest revenue generating inventory items</p>

            {topProducts && topProducts.length > 0 ? (
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={topProducts}
                      dataKey="revenue"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={70}
                      innerRadius={35}
                      paddingAngle={4}
                      label={({ name, percent }: { name?: string; percent?: number }) => `${name ? name.substring(0, 10) : ''}... (${((percent || 0) * 100).toFixed(0)}%)`}
                      labelLine={false}
                    >
                      {topProducts.map((_: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem', color: '#fff', fontSize: '12px' }}
                      formatter={(val: any) => [formatKES(val), 'Revenue']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-slate-500 text-xs">
                No sales data recorded yet for products.
              </div>
            )}
          </div>

          <button
            onClick={() => onNavigate('inventory')}
            className="w-full mt-4 py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors text-center"
          >
            Manage Inventory Catalog →
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
