import React, { useState, useEffect } from 'react';
import { SubscriptionPlan, BusinessTenant } from '../types/index.ts';
import { formatKES } from '../utils/businessMath.ts';
import {
  CreditCard,
  Check,
  ShieldCheck,
  Smartphone,
  Sparkles,
  ArrowRight,
  AlertCircle,
  X,
  Clock,
  History,
} from 'lucide-react';

interface SubscriptionViewProps {
  business?: BusinessTenant;
  onRefreshAuth: () => void;
}

export const SubscriptionView: React.FC<SubscriptionViewProps> = ({ business, onRefreshAuth }) => {
  const [subscriptionData, setSubscriptionData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // STK Push Payment Modal State
  const [selectedPlanForUpgrade, setSelectedPlanForUpgrade] = useState<SubscriptionPlan | null>(null);
  const [phone, setPhone] = useState('0712345678');
  const [stkStatus, setStkStatus] = useState<'idle' | 'push_sent' | 'confirming' | 'success'>('idle');
  const [stkMessage, setStkMessage] = useState('');
  const [checkoutId, setCheckoutId] = useState('');
  const [receiptNumber, setReceiptNumber] = useState('');

  const loadSubscription = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/subscriptions');
      const data = await res.json();
      setSubscriptionData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubscription();
  }, []);

  const handleInitiateSTK = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlanForUpgrade || !phone) return;

    try {
      setStkStatus('push_sent');
      setStkMessage('Connecting to Safaricom Daraja STK Gateway...');

      const res = await fetch('/api/subscriptions/daraja-stk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone,
          planCode: selectedPlanForUpgrade.code,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to initiate STK Push');
      }

      const data = await res.json();
      setCheckoutId(data.checkoutRequestId);
      setStkMessage(data.message);
    } catch (err: any) {
      alert(err.message);
      setStkStatus('idle');
    }
  };

  const handleConfirmPayment = async () => {
    if (!selectedPlanForUpgrade) return;
    try {
      setStkStatus('confirming');

      const res = await fetch('/api/subscriptions/daraja-callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          checkoutRequestId: checkoutId,
          planCode: selectedPlanForUpgrade.code,
          mpesaReceiptNumber: receiptNumber || undefined,
        }),
      });

      if (!res.ok) throw new Error('Payment confirmation failed');
      const data = await res.json();
      setStkStatus('success');
      setStkMessage(data.message);
      loadSubscription();
      onRefreshAuth();
    } catch (err: any) {
      alert(err.message);
      setStkStatus('idle');
    }
  };

  if (loading || !subscriptionData) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[350px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-400">Loading subscription accounts...</p>
        </div>
      </div>
    );
  }

  const { currentPlan, currentTier, renewalDate, plans, history } = subscriptionData;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Subscription Plans & Billing</h1>
          <p className="text-xs text-slate-400">Scale your enterprise with native Safaricom M-Pesa Daraja payment integration</p>
        </div>
        {renewalDate && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-800/40 text-xs text-emerald-300">
            <Clock className="w-3.5 h-3.5" />
            <span>
              Next Renewal:{' '}
              <strong className="text-white font-mono">{new Date(renewalDate).toLocaleDateString()}</strong>
            </span>
          </div>
        )}
      </div>

      {/* Current Active Plan Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-900/90 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider font-bold text-emerald-400">Active Subscription</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800/60 uppercase">
              {currentTier}
            </span>
          </div>
          <div className="text-2xl font-extrabold text-white">{currentPlan.name}</div>
          <p className="text-xs text-slate-400 max-w-xl">
            Includes up to {currentPlan.usersLimit} staff members, {currentPlan.productsLimit} catalog products,{' '}
            {currentPlan.invoicesLimit} invoices per month, and real Gemini AI business advisor intelligence.
          </p>
        </div>

        <div className="text-left md:text-right shrink-0">
          <div className="text-xs text-slate-400">Subscription Rate</div>
          <div className="text-2xl font-mono font-bold text-white">
            {currentPlan.priceKES === 0 ? 'FREE' : `${formatKES(currentPlan.priceKES)} / month`}
          </div>
          <div className="text-[11px] text-emerald-400 font-medium mt-1">Paid via M-Pesa Buy Goods / Till</div>
        </div>
      </div>

      {/* Plan Tiers Grid */}
      <div>
        <h2 className="text-base font-bold text-white mb-1">Available Subscription Tiers</h2>
        <p className="text-xs text-slate-400 mb-6">Select a plan suited for your operational volume</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {plans.map((p: SubscriptionPlan) => {
            const isCurrent = p.code === currentTier;
            return (
              <div
                key={p.code}
                className={`p-5 rounded-2xl border flex flex-col justify-between transition-all ${
                  isCurrent
                    ? 'bg-slate-900/90 border-emerald-500 shadow-lg shadow-emerald-500/10'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-sm text-white">{p.name}</span>
                    {isCurrent && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500 text-slate-950">
                        Current
                      </span>
                    )}
                  </div>

                  <div className="my-3 pb-3 border-b border-slate-800">
                    <div className="font-mono font-bold text-lg text-white">
                      {p.priceKES === 0 ? 'Free' : formatKES(p.priceKES)}
                    </div>
                    <div className="text-[11px] text-slate-400">per month (KES)</div>
                  </div>

                  <ul className="space-y-2 text-xs text-slate-300">
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{p.usersLimit === 999 ? 'Unlimited' : `${p.usersLimit} Staff Accounts`}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{p.productsLimit} Products</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{p.invoicesLimit} Invoices / mo</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className={p.aiAssistant ? 'text-emerald-300 font-medium' : 'text-slate-500'}>
                        {p.aiAssistant ? 'Gemini AI Assistant' : 'No AI Assistant'}
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>M-Pesa POS & Reports</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-5 mt-4 border-t border-slate-800">
                  {isCurrent ? (
                    <button
                      disabled
                      className="w-full py-2 rounded-lg bg-slate-800 text-slate-400 text-xs font-semibold cursor-default"
                    >
                      Active Plan
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setSelectedPlanForUpgrade(p);
                        setStkStatus('idle');
                      }}
                      className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors shadow-md shadow-emerald-600/20"
                    >
                      {p.priceKES === 0 ? 'Switch to Free' : 'Upgrade via M-Pesa'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Subscription Invoices History */}
      {history && history.length > 0 && (
        <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center">
            <h2 className="font-bold text-sm text-white">Subscription Payment Ledger</h2>
            <span className="text-xs text-slate-400">{history.length} transactions</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/70 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Plan Name</th>
                  <th className="py-3 px-4">Billing Cycle</th>
                  <th className="py-3 px-4">Payment Channel</th>
                  <th className="py-3 px-4">M-Pesa Receipt #</th>
                  <th className="py-3 px-4 text-right">Amount Paid</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {history.map((h: any) => (
                  <tr key={h.id}>
                    <td className="py-3 px-4 text-slate-400">{new Date(h.createdAt).toLocaleDateString()}</td>
                    <td className="py-3 px-4 font-semibold text-white">{h.planName}</td>
                    <td className="py-3 px-4 capitalize text-slate-400">{h.billingCycle}</td>
                    <td className="py-3 px-4 font-medium text-emerald-400 uppercase">Safaricom Daraja</td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-200">{h.mpesaReceiptNumber || '—'}</td>
                    <td className="py-3 px-4 text-right font-mono font-semibold text-white">{formatKES(h.amount)}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800/40">
                        Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* M-Pesa Daraja STK Push Upgrade Modal */}
      {selectedPlanForUpgrade && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-emerald-400" />
                <h2 className="font-bold text-base text-white">Safaricom M-Pesa Daraja STK</h2>
              </div>
              <button
                onClick={() => setSelectedPlanForUpgrade(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
              <div className="flex justify-between text-slate-400">
                <span>Selected Plan:</span>
                <span className="font-bold text-white">{selectedPlanForUpgrade.name}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Subscription Amount:</span>
                <span className="font-mono font-bold text-emerald-400 text-sm">
                  {formatKES(selectedPlanForUpgrade.priceKES)} / month
                </span>
              </div>
            </div>

            {stkStatus === 'idle' && (
              <form onSubmit={handleInitiateSTK} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Enter Safaricom M-Pesa Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 0712345678 or 254712345678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
                  />
                  <p className="text-[11px] text-slate-500">
                    A prompt will appear instantly on this phone to enter your M-Pesa PIN.
                  </p>
                </div>

                <div className="pt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedPlanForUpgrade(null)}
                    className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 font-medium hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-500 shadow-lg shadow-emerald-600/20"
                  >
                    Send M-Pesa Prompt
                  </button>
                </div>
              </form>
            )}

            {stkStatus === 'push_sent' && (
              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-200 text-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                    <Smartphone className="w-5 h-5 animate-bounce" />
                  </div>
                  <div className="font-bold text-sm text-white">STK Push Sent to Phone!</div>
                  <p className="text-[11px] text-emerald-300/90">{stkMessage}</p>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold">M-Pesa Receipt Code (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. QHK82910MA"
                    value={receiptNumber}
                    onChange={(e) => setReceiptNumber(e.target.value.toUpperCase())}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono uppercase focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleConfirmPayment}
                  className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow-lg shadow-emerald-600/25"
                >
                  Verify Payment & Activate Plan
                </button>
              </div>
            )}

            {stkStatus === 'success' && (
              <div className="text-center py-4 space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <Check className="w-6 h-6" />
                </div>
                <div className="font-bold text-base text-white">Subscription Upgraded!</div>
                <p className="text-xs text-slate-300">{stkMessage}</p>
                <button
                  onClick={() => setSelectedPlanForUpgrade(null)}
                  className="px-6 py-2 rounded-lg bg-emerald-600 text-white font-semibold text-xs mt-2"
                >
                  Return to Dashboard
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
