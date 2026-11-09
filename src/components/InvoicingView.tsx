import React, { useState, useEffect } from 'react';
import { InvoiceItem, CustomerProfile, BusinessTenant } from '../types/index.ts';
import { formatKES } from '../utils/businessMath.ts';
import {
  FileText,
  Plus,
  CheckCircle2,
  Clock,
  Printer,
  DollarSign,
  X,
  Search,
  Eye,
  Trash2,
} from 'lucide-react';

interface InvoicingViewProps {
  business?: BusinessTenant;
}

export const InvoicingView: React.FC<InvoicingViewProps> = ({ business }) => {
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [customers, setCustomers] = useState<CustomerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Create Invoice Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [customerId, setCustomerId] = useState<number | ''>('');
  const [dueDate, setDueDate] = useState(new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10));
  const [lineItems, setLineItems] = useState<Array<{ name: string; quantity: number; unitPrice: number }>>([
    { name: '', quantity: 1, unitPrice: 0 },
  ]);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [taxAmount, setTaxAmount] = useState<number>(0);
  const [notes, setNotes] = useState('');

  // Payment Recording Modal State
  const [selectedInvoiceForPay, setSelectedInvoiceForPay] = useState<InvoiceItem | null>(null);
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('mpesa');
  const [payReference, setPayReference] = useState('');

  // Invoice Preview Modal State
  const [previewInvoice, setPreviewInvoice] = useState<InvoiceItem | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [invRes, custRes] = await Promise.all([
        fetch('/api/invoices'),
        fetch('/api/customers'),
      ]);
      const [invData, custData] = await Promise.all([invRes.json(), custRes.json()]);
      setInvoices(invData);
      setCustomers(custData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const addLineItem = () => {
    setLineItems([...lineItems, { name: '', quantity: 1, unitPrice: 0 }]);
  };

  const removeLineItem = (index: number) => {
    if (lineItems.length === 1) return;
    setLineItems(lineItems.filter((_, idx) => idx !== index));
  };

  const updateLineItem = (index: number, field: string, value: any) => {
    const updated = [...lineItems];
    (updated[index] as any)[field] = value;
    setLineItems(updated);
  };

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId || !lineItems.length) return;

    try {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId,
          dueDate,
          items: lineItems,
          discountAmount,
          taxAmount,
          notes,
        }),
      });

      if (!res.ok) throw new Error('Failed to create invoice');
      setShowCreateModal(false);
      setLineItems([{ name: '', quantity: 1, unitPrice: 0 }]);
      setDiscountAmount(0);
      setTaxAmount(0);
      setNotes('');
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoiceForPay || !payAmount) return;

    try {
      const res = await fetch(`/api/invoices/${selectedInvoiceForPay.id}/payment`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amountPaid: parseInt(payAmount, 10),
          paymentMethod: payMethod,
          reference: payReference,
        }),
      });

      if (!res.ok) throw new Error('Failed to record payment');
      setSelectedInvoiceForPay(null);
      setPayAmount('');
      setPayReference('');
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const filteredInvoices = invoices.filter((inv) => {
    if (filterStatus === 'all') return true;
    return inv.status === filterStatus;
  });

  const totalOutstanding = invoices
    .filter((inv) => inv.status !== 'paid' && inv.status !== 'cancelled')
    .reduce((sum, inv) => sum + inv.remainingBalance, 0);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Invoices & Receivables</h1>
          <p className="text-xs text-slate-400">Issue commercial tax invoices, manage due dates, and track partial debt settlements</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors shadow-lg shadow-emerald-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>New Commercial Invoice</span>
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Total Outstanding Receivables
          </div>
          <div className="text-xl font-bold font-mono text-amber-300">{formatKES(totalOutstanding)}</div>
          <div className="text-[11px] text-slate-500 mt-1">Pending customer settlement</div>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Total Issued Invoices
          </div>
          <div className="text-xl font-bold font-mono text-white">{invoices.length}</div>
          <div className="text-[11px] text-slate-500 mt-1">
            {invoices.filter((i) => i.status === 'paid').length} fully settled
          </div>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Settlement Rate
          </div>
          <div className="text-xl font-bold font-mono text-emerald-400">
            {invoices.length > 0
              ? Math.round((invoices.filter((i) => i.status === 'paid').length / invoices.length) * 100)
              : 100}
            %
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Commercial collection efficiency</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg text-xs w-fit">
        {['all', 'sent', 'partial', 'paid'].map((st) => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            className={`px-3 py-1 rounded-md capitalize font-medium transition-colors ${
              filterStatus === st ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            {st === 'all' ? 'All Invoices' : st}
          </button>
        ))}
      </div>

      {/* Invoices Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/70 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Issue Date</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4 text-right">Total (KES)</th>
                <th className="py-3 px-4 text-right">Paid</th>
                <th className="py-3 px-4 text-right">Balance Due</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-white">{inv.invoiceNumber}</td>
                  <td className="py-3 px-4 font-medium text-slate-200">
                    <div>{inv.customerName}</div>
                    {inv.customerPhone && <div className="text-[10px] text-slate-400">{inv.customerPhone}</div>}
                  </td>
                  <td className="py-3 px-4 text-slate-400">{inv.issueDate}</td>
                  <td className="py-3 px-4 font-mono text-slate-300">{inv.dueDate}</td>
                  <td className="py-3 px-4 text-right font-mono font-semibold text-white">
                    {formatKES(inv.totalAmount)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-emerald-400">
                    {formatKES(inv.amountPaid)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-amber-300">
                    {formatKES(inv.remainingBalance)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                        inv.status === 'paid'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/40'
                          : inv.status === 'partial'
                          ? 'bg-amber-950 text-amber-400 border border-amber-800/40'
                          : 'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}
                    >
                      {inv.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setPreviewInvoice(inv)}
                        className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                        title="View / Print Invoice"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      {inv.status !== 'paid' && (
                        <button
                          onClick={() => {
                            setSelectedInvoiceForPay(inv);
                            setPayAmount(String(inv.remainingBalance));
                          }}
                          className="px-2.5 py-1 rounded bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white text-[11px] font-semibold transition-colors border border-emerald-500/30"
                        >
                          Record Payment
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Invoice Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h2 className="font-bold text-base text-white">Issue Commercial Invoice</h2>
                <p className="text-[11px] text-slate-400">Generates unique invoice number with due date and itemized totals</p>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold">Select Customer *</label>
                  <select
                    required
                    value={customerId}
                    onChange={(e) => setCustomerId(e.target.value ? parseInt(e.target.value, 10) : '')}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">Select customer...</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.phone || c.email || 'No contact'})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold">Due Date *</label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Line items section */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="flex justify-between items-center">
                  <label className="font-semibold text-slate-300">Invoice Line Items</label>
                  <button
                    type="button"
                    onClick={addLineItem}
                    className="text-emerald-400 hover:underline flex items-center gap-1 font-semibold text-[11px]"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Row
                  </button>
                </div>

                {lineItems.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-6">
                      <input
                        type="text"
                        required
                        placeholder="Item description or service..."
                        value={item.name}
                        onChange={(e) => updateLineItem(idx, 'name', e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="number"
                        min="1"
                        required
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={(e) => updateLineItem(idx, 'quantity', parseInt(e.target.value, 10) || 1)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white font-mono text-center focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div className="col-span-3">
                      <input
                        type="number"
                        min="0"
                        required
                        placeholder="Unit Price"
                        value={item.unitPrice || ''}
                        onChange={(e) => updateLineItem(idx, 'unitPrice', parseInt(e.target.value, 10) || 0)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white font-mono text-right focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div className="col-span-1 text-center">
                      <button
                        type="button"
                        onClick={() => removeLineItem(idx)}
                        className="text-slate-500 hover:text-rose-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Notes */}
              <div className="space-y-1 pt-2">
                <label className="text-slate-400 font-semibold">Payment Terms / Bank Instructions</label>
                <textarea
                  rows={2}
                  value={notes}
                  placeholder="e.g. M-Pesa Paybill 522522, Account 1234567, or NCBA Bank Swift NCBAKENA"
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 font-medium hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-500"
                >
                  Generate & Send Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {selectedInvoiceForPay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="font-bold text-base text-white">Record Invoice Payment</h2>
              <button onClick={() => setSelectedInvoiceForPay(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs space-y-1">
              <div className="text-slate-400">
                Invoice: <span className="font-mono text-white font-bold">{selectedInvoiceForPay.invoiceNumber}</span>
              </div>
              <div className="text-slate-400">
                Customer: <span className="text-white font-semibold">{selectedInvoiceForPay.customerName}</span>
              </div>
              <div className="text-slate-400">
                Remaining Balance: <span className="font-mono text-amber-300 font-bold">{formatKES(selectedInvoiceForPay.remainingBalance)}</span>
              </div>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-400 font-semibold">Payment Amount (KES) *</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono font-bold text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold">Payment Channel</label>
                  <select
                    value={payMethod}
                    onChange={(e) => setPayMethod(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="mpesa">M-Pesa</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold">M-Pesa / Bank Ref #</label>
                  <input
                    type="text"
                    placeholder="e.g. QHK82910MA"
                    value={payReference}
                    onChange={(e) => setPayReference(e.target.value.toUpperCase())}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono uppercase focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedInvoiceForPay(null)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 font-medium hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-500"
                >
                  Confirm Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Professional Invoice Preview & Print Modal */}
      {previewInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl p-8 shadow-2xl space-y-6 my-8 text-slate-100">
            {/* Top Bar with Print Button */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xs px-2.5 py-1 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/40 uppercase font-mono font-bold">
                  TAX INVOICE
                </span>
                <span className="font-mono text-slate-400 text-xs">{previewInvoice.invoiceNumber}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print / PDF</span>
                </button>
                <button onClick={() => setPreviewInvoice(null)} className="text-slate-400 hover:text-white p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Document Header */}
            <div className="grid grid-cols-2 gap-6 text-xs">
              <div>
                <div className="font-extrabold text-xl text-white tracking-tight">{business?.name || 'BiasharaOS Enterprise'}</div>
                <div className="text-slate-400 mt-1">{business?.address || 'Nairobi CBD, Kenya'}</div>
                <div className="text-slate-400 font-mono">KRA PIN: {business?.taxPin || 'P051283921A'}</div>
                <div className="text-slate-400">Tel: {business?.phone || '+254 712 345 678'}</div>
              </div>
              <div className="text-right space-y-1">
                <div className="text-slate-400 font-semibold">BILLED TO:</div>
                <div className="font-bold text-white text-sm">{previewInvoice.customerName}</div>
                {previewInvoice.customerPhone && <div className="text-slate-400">{previewInvoice.customerPhone}</div>}
                {previewInvoice.customerEmail && <div className="text-slate-400">{previewInvoice.customerEmail}</div>}
                <div className="pt-2 text-slate-400 font-mono">
                  Issue Date: <span className="text-white">{previewInvoice.issueDate}</span>
                </div>
                <div className="text-slate-400 font-mono">
                  Due Date: <span className="text-amber-400 font-bold">{previewInvoice.dueDate}</span>
                </div>
              </div>
            </div>

            {/* Itemized Table */}
            <div className="border border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Description</th>
                    <th className="py-2.5 px-3 text-center">Qty</th>
                    <th className="py-2.5 px-3 text-right">Unit Price</th>
                    <th className="py-2.5 px-3 text-right">Amount (KES)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-200">
                  {(() => {
                    try {
                      const items = JSON.parse(previewInvoice.itemsJson || '[]');
                      return items.map((it: any, i: number) => (
                        <tr key={i}>
                          <td className="py-2 px-3 font-medium text-white">{it.name}</td>
                          <td className="py-2 px-3 text-center font-mono">{it.quantity}</td>
                          <td className="py-2 px-3 text-right font-mono">{formatKES(it.unitPrice)}</td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-emerald-400">
                            {formatKES(it.total || it.unitPrice * it.quantity)}
                          </td>
                        </tr>
                      ));
                    } catch {
                      return null;
                    }
                  })()}
                </tbody>
              </table>
            </div>

            {/* Totals Summary */}
            <div className="flex justify-end text-xs">
              <div className="w-64 space-y-2">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal</span>
                  <span className="font-mono">{formatKES(previewInvoice.subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-300 font-bold border-t border-slate-800 pt-1">
                  <span>Total Due</span>
                  <span className="font-mono text-white text-sm">{formatKES(previewInvoice.totalAmount)}</span>
                </div>
                <div className="flex justify-between text-emerald-400">
                  <span>Amount Paid</span>
                  <span className="font-mono">{formatKES(previewInvoice.amountPaid)}</span>
                </div>
                <div className="flex justify-between text-amber-300 font-bold border-t border-slate-800 pt-1">
                  <span>Remaining Balance</span>
                  <span className="font-mono text-base">{formatKES(previewInvoice.remainingBalance)}</span>
                </div>
              </div>
            </div>

            {/* Payment instructions */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
              <div className="font-semibold text-white">Payment Instructions:</div>
              <p className="text-slate-400">{previewInvoice.notes}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
