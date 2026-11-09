import React from 'react';
import { SaleItem, BusinessTenant } from '../types/index.ts';
import { formatKES } from '../utils/businessMath.ts';
import { Printer, CheckCircle2, X, Download } from 'lucide-react';

interface ReceiptModalProps {
  sale: SaleItem | null;
  business?: BusinessTenant;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ sale, business, onClose }) => {
  if (!sale) return null;

  let items: any[] = [];
  try {
    items = JSON.parse(sale.itemsJson || '[]');
  } catch {}

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
            <CheckCircle2 className="w-4 h-4" />
            <span>Sale Processed Successfully</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Receipt Paper */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-100 bg-slate-900" id="printable-receipt">
          {/* Header */}
          <div className="text-center space-y-1 pb-4 border-b border-slate-800">
            <div className="font-extrabold text-xl text-white tracking-tight">{business?.name || 'BiasharaOS Store'}</div>
            <div className="text-xs text-slate-400">{business?.address || 'Nairobi, Kenya'}</div>
            <div className="text-xs text-slate-400 font-mono">KRA PIN: {business?.taxPin || 'P051283921A'}</div>
            {business?.phone && <div className="text-xs text-slate-400">Tel: {business.phone}</div>}
            {business?.mpesaTill && (
              <div className="text-xs font-semibold text-emerald-400">M-Pesa Buy Goods Till: {business.mpesaTill}</div>
            )}
          </div>

          {/* Receipt Meta */}
          <div className="space-y-1 text-xs text-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-400">Receipt No:</span>
              <span className="font-mono font-bold text-white">{sale.receiptNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Date & Time:</span>
              <span>{new Date(sale.createdAt).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Cashier:</span>
              <span>{sale.cashierName || 'Attendant'}</span>
            </div>
            {sale.customerName && (
              <div className="flex justify-between">
                <span className="text-slate-400">Customer:</span>
                <span className="font-medium text-white">{sale.customerName}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-400">Payment Method:</span>
              <span className="uppercase font-semibold text-emerald-400">{sale.paymentMethod}</span>
            </div>
            {sale.mpesaReference && (
              <div className="flex justify-between bg-emerald-950/40 p-1.5 rounded border border-emerald-800/40 mt-1">
                <span className="text-emerald-300 font-medium">M-Pesa Ref:</span>
                <span className="font-mono font-bold text-emerald-300">{sale.mpesaReference}</span>
              </div>
            )}
          </div>

          {/* Line items */}
          <div className="border-t border-b border-slate-800 py-3 space-y-2">
            <div className="grid grid-cols-12 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              <span className="col-span-6">Item</span>
              <span className="col-span-2 text-center">Qty</span>
              <span className="col-span-4 text-right">Price (KES)</span>
            </div>
            {items.map((it: any, idx: number) => (
              <div key={idx} className="grid grid-cols-12 text-xs py-1 text-slate-200">
                <span className="col-span-6 truncate font-medium text-white">{it.name}</span>
                <span className="col-span-2 text-center text-slate-400">{it.quantity}</span>
                <span className="col-span-4 text-right font-mono">{formatKES(it.total || it.unitPrice * it.quantity)}</span>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Subtotal</span>
              <span className="font-mono">{formatKES(sale.subtotal)}</span>
            </div>
            {sale.discountAmount > 0 && (
              <div className="flex justify-between text-amber-400">
                <span>Discount Applied</span>
                <span className="font-mono">-{formatKES(sale.discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-bold text-white pt-2 border-t border-slate-800">
              <span>Total Paid</span>
              <span className="font-mono text-emerald-400">{formatKES(sale.totalAmount)}</span>
            </div>
          </div>

          {/* Footer Note */}
          <div className="text-center pt-2 space-y-1">
            <p className="text-[11px] text-slate-400">Thank you for shopping with us!</p>
            <p className="text-[10px] text-slate-500 font-mono">Powered by BiasharaOS · Verified Electronic Receipt</p>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex gap-3">
          <button
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition-colors shadow-lg shadow-emerald-600/20"
          >
            <Printer className="w-4 h-4" />
            <span>Print Receipt</span>
          </button>
          <button
            onClick={onClose}
            className="py-2 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
