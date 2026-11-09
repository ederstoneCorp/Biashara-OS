import React, { useState, useEffect } from 'react';
import { ExpenseItem } from '../types/index.ts';
import { formatKES } from '../utils/businessMath.ts';
import {
  PieChart,
  Plus,
  TrendingDown,
  TrendingUp,
  Receipt,
  FileSpreadsheet,
  Calendar,
  X,
  CreditCard,
  Building,
} from 'lucide-react';

export const FinanceView: React.FC = () => {
  const [pnlData, setPnlData] = useState<any>(null);
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [loading, setLoading] = useState(true);

  // New Expense Modal
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [cat, setCat] = useState('Rent');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('mpesa');
  const [reference, setReference] = useState('');
  const [description, setDescription] = useState('');
  const [paidTo, setPaidTo] = useState('');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().slice(0, 10));

  const loadData = async () => {
    try {
      setLoading(true);
      const [pnlRes, expRes] = await Promise.all([
        fetch('/api/financials/pnl'),
        fetch('/api/expenses'),
      ]);
      const [pnlJson, expJson] = await Promise.all([pnlRes.json(), expRes.json()]);
      setPnlData(pnlJson);
      setExpenses(expJson);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRecordExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount) return;

    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: cat,
          amount: parseInt(amount, 10),
          paymentMethod,
          reference,
          description,
          paidTo,
          expenseDate,
        }),
      });

      if (!res.ok) throw new Error('Failed to record expense');
      setShowAddExpense(false);
      setDescription('');
      setAmount('');
      setReference('');
      setPaidTo('');
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading || !pnlData) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[350px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-400">Loading Profit & Loss statement...</p>
        </div>
      </div>
    );
  }

  const { summary, expenseBreakdown } = pnlData;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Financial Performance & P&L</h1>
          <p className="text-xs text-slate-400">Audited cashflow, revenue recognition, categorized operating expenses, and net margins</p>
        </div>
        <button
          onClick={() => setShowAddExpense(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors shadow-lg shadow-emerald-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>Record Expense</span>
        </button>
      </div>

      {/* Financial KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Total Revenue (Gross)
          </div>
          <div className="text-xl font-bold font-mono text-white">{formatKES(summary.revenue)}</div>
          <div className="text-[11px] text-slate-500 mt-1">{pnlData.salesCount} registered transactions</div>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Cost of Goods Sold (COGS)
          </div>
          <div className="text-xl font-bold font-mono text-slate-300">{formatKES(summary.cogs)}</div>
          <div className="text-[11px] text-slate-500 mt-1">Direct product inventory acquisition cost</div>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Gross Profit ({summary.grossMarginPct}%)
          </div>
          <div className="text-xl font-bold font-mono text-teal-300">{formatKES(summary.grossProfit)}</div>
          <div className="text-[11px] text-slate-500 mt-1">Revenue minus COGS</div>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Net Profit ({summary.netMarginPct}%)
          </div>
          <div className={`text-xl font-bold font-mono ${summary.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {formatKES(summary.netProfit)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Bottom line operating profit</div>
        </div>
      </div>

      {/* Two Column Grid: P&L Statement & Expense Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Full P&L Statement Table */}
        <div className="lg:col-span-7 rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h2 className="font-bold text-sm text-white">Profit & Loss Statement (Kenya Shillings)</h2>
              <p className="text-[11px] text-slate-400">Statement of Comprehensive Income</p>
            </div>
            <span className="text-xs px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/40 font-mono">
              FY 2026 YTD
            </span>
          </div>

          <div className="space-y-3 text-xs">
            {/* Sales Revenue */}
            <div className="flex justify-between items-center py-1.5 border-b border-slate-800/60 font-semibold text-white">
              <span>Gross Sales & POS Turnover</span>
              <span className="font-mono text-emerald-400">{formatKES(summary.revenue)}</span>
            </div>

            {/* COGS */}
            <div className="flex justify-between items-center py-1 text-slate-400 pl-4">
              <span>Less: Cost of Goods Sold (Inventory consumed)</span>
              <span className="font-mono text-slate-300">({formatKES(summary.cogs)})</span>
            </div>

            {/* Gross Profit */}
            <div className="flex justify-between items-center py-2 border-t border-b border-slate-800 font-bold text-teal-300 bg-slate-950/40 px-2 rounded">
              <span>GROSS PROFIT (Margin: {summary.grossMarginPct}%)</span>
              <span className="font-mono">{formatKES(summary.grossProfit)}</span>
            </div>

            {/* Operating Expenses */}
            <div className="pt-2">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 block mb-2">
                Operating Expenses (OPEX):
              </span>
              <div className="space-y-1.5 pl-4">
                {Object.entries(expenseBreakdown || {}).map(([catName, amt]: any) => (
                  <div key={catName} className="flex justify-between text-slate-400">
                    <span>{catName}</span>
                    <span className="font-mono">{formatKES(amt)}</span>
                  </div>
                ))}
                <div className="flex justify-between font-medium text-slate-300 pt-1 border-t border-slate-800/60">
                  <span>Total Operating Expenses</span>
                  <span className="font-mono text-rose-300">({formatKES(summary.expenses)})</span>
                </div>
              </div>
            </div>

            {/* Net Operating Income */}
            <div className="flex justify-between items-center py-3 border-t-2 border-slate-700 font-extrabold text-sm bg-emerald-950/20 px-3 rounded-lg border border-emerald-800/30 text-white mt-4">
              <span>NET PROFIT (Margin: {summary.netMarginPct}%)</span>
              <span className="font-mono text-emerald-400 text-base">{formatKES(summary.netProfit)}</span>
            </div>
          </div>
        </div>

        {/* Operating Expenses Breakdown Chart / List */}
        <div className="lg:col-span-5 rounded-xl border border-slate-800 bg-slate-900 p-6 flex flex-col justify-between">
          <div>
            <h2 className="font-bold text-sm text-white mb-1">Expense Distribution</h2>
            <p className="text-[11px] text-slate-400 mb-4">Capital allocation across overhead categories</p>

            <div className="space-y-3">
              {Object.entries(expenseBreakdown || {}).map(([cName, amt]: any) => {
                const pct = summary.expenses > 0 ? Math.round((amt / summary.expenses) * 100) : 0;
                return (
                  <div key={cName} className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-300 font-medium">{cName}</span>
                      <span className="font-mono text-slate-400">
                        {formatKES(amt)} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5">
                      <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 mt-6 text-xs text-slate-400">
            <span className="font-semibold text-slate-200">Compliance & KRA:</span> All sales and deductible expenses
            maintain audit trails with invoice and M-Pesa receipt linkages for straightforward tax reconciliation.
          </div>
        </div>
      </div>

      {/* Recent Expenses Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center">
          <h2 className="font-bold text-sm text-white">Expense Records Journal</h2>
          <span className="text-xs text-slate-400">{expenses.length} entries recorded</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/70 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Paid To</th>
                <th className="py-3 px-4">Method & Reference</th>
                <th className="py-3 px-4 text-right">Amount (KES)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {expenses.map((e) => (
                <tr key={e.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-4 font-mono text-slate-400">{e.expenseDate}</td>
                  <td className="py-3 px-4 font-medium text-white">{e.description}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300">
                      {e.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-400">{e.paidTo || '—'}</td>
                  <td className="py-3 px-4 font-mono text-slate-400">
                    <span className="uppercase text-emerald-400">{e.paymentMethod}</span>
                    {e.reference && <span className="text-slate-500 ml-1.5">[{e.reference}]</span>}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-semibold text-rose-400">
                    -{formatKES(e.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Expense Modal */}
      {showAddExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="font-bold text-base text-white">Record Operating Expense</h2>
              <button onClick={() => setShowAddExpense(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordExpense} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-400 font-semibold">Expense Description *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kenya Power token recharge"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold">Category *</label>
                  <select
                    value={cat}
                    onChange={(e) => setCat(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Rent">Rent</option>
                    <option value="Utilities">Utilities (KPLC, Water, Internet)</option>
                    <option value="Payroll">Staff Payroll / Wages</option>
                    <option value="Transport">Transport / Fuel / Boda</option>
                    <option value="Marketing">Marketing & Advertising</option>
                    <option value="Supplies">Office / Workshop Supplies</option>
                    <option value="Maintenance">Maintenance & Repairs</option>
                    <option value="Other">Other Expenses</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold">Amount (KES) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    placeholder="e.g. 15000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold">Payment Channel</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="mpesa">M-Pesa</option>
                    <option value="cash">Cash</option>
                    <option value="bank_transfer">Bank Transfer (EFT/RTGS)</option>
                    <option value="card">Company Card</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold">Date</label>
                  <input
                    type="date"
                    value={expenseDate}
                    onChange={(e) => setExpenseDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold">Paid To (Vendor/Entity)</label>
                  <input
                    type="text"
                    placeholder="e.g. Kenya Power, Hazina Plaza"
                    value={paidTo}
                    onChange={(e) => setPaidTo(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold">Reference / Receipt #</label>
                  <input
                    type="text"
                    placeholder="e.g. QHK819028X"
                    value={reference}
                    onChange={(e) => setReference(e.target.value.toUpperCase())}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddExpense(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 font-medium hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-500"
                >
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
