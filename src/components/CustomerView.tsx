import React, { useState, useEffect } from 'react';
import { CustomerProfile } from '../types/index.ts';
import { formatKES } from '../utils/businessMath.ts';
import {
  Users,
  Plus,
  Phone,
  Mail,
  MapPin,
  Award,
  AlertCircle,
  Search,
  X,
  CreditCard,
} from 'lucide-react';

export const CustomerView: React.FC = () => {
  const [customers, setCustomers] = useState<CustomerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/customers');
      const data = await res.json();
      setCustomers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, email, address, notes }),
      });
      if (!res.ok) throw new Error('Failed to create customer');
      setShowAddModal(false);
      setName('');
      setPhone('');
      setEmail('');
      setAddress('');
      setNotes('');
      loadCustomers();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.phone && c.phone.includes(search)) ||
      (c.email && c.email.toLowerCase().includes(search.toLowerCase()))
  );

  const totalDebt = customers.reduce((acc, c) => acc + c.outstandingBalance, 0);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Customer CRM & Loyalty</h1>
          <p className="text-xs text-slate-400">Customer purchase histories, loyalty point ledger, and outstanding balances</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors shadow-lg shadow-emerald-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Customer</span>
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Total Registered Customers
          </div>
          <div className="text-xl font-bold font-mono text-white">{customers.length}</div>
          <div className="text-[11px] text-slate-500 mt-1">Active client portfolio</div>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Total Outstanding Customer Debt
          </div>
          <div className="text-xl font-bold font-mono text-amber-300">{formatKES(totalDebt)}</div>
          <div className="text-[11px] text-slate-500 mt-1">
            {customers.filter((c) => c.outstandingBalance > 0).length} customers with pending balance
          </div>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Loyalty Points Issued
          </div>
          <div className="text-xl font-bold font-mono text-emerald-400">
            {customers.reduce((acc, c) => acc + c.loyaltyPoints, 0)} pts
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Redeemable on future POS purchases</div>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
        <input
          type="text"
          placeholder="Search by customer name, phone or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
        />
      </div>

      {/* Customers List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((c) => (
          <div key={c.id} className="p-5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <h2 className="font-bold text-sm text-white">{c.name}</h2>
                <div className="flex items-center gap-1 text-emerald-400 text-xs font-semibold">
                  <Award className="w-3.5 h-3.5" />
                  <span>{c.loyaltyPoints} pts</span>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-slate-400 mt-3">
                {c.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-500" />
                    <span className="font-mono text-slate-300">{c.phone}</span>
                  </div>
                )}
                {c.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-500" />
                    <span className="truncate text-slate-300">{c.email}</span>
                  </div>
                )}
                {c.address && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    <span className="truncate text-slate-300">{c.address}</span>
                  </div>
                )}
              </div>

              {c.notes && (
                <div className="p-2 rounded bg-slate-950 border border-slate-800/80 text-[11px] text-slate-400 mt-3">
                  {c.notes}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-semibold">Total Purchases</span>
                <span className="font-mono text-white font-medium">{formatKES(c.totalSpend || 0)}</span>
              </div>
              <div className="text-right">
                <span className="text-slate-500 block text-[10px] uppercase font-semibold">Outstanding Debt</span>
                <span className={`font-mono font-bold ${c.outstandingBalance > 0 ? 'text-amber-400' : 'text-slate-400'}`}>
                  {formatKES(c.outstandingBalance)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="font-bold text-base text-white">Add Customer Profile</h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-400 font-semibold">Customer Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Grace Wambui"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold">Phone (Safaricom M-Pesa)</label>
                  <input
                    type="tel"
                    placeholder="e.g. 0722123456"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold">Email Address</label>
                  <input
                    type="email"
                    placeholder="grace@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-semibold">Delivery / Physical Address</label>
                <input
                  type="text"
                  placeholder="e.g. Kilimani, Argwings Kodhek Rd, Nairobi"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-semibold">Customer Notes / Preferences</label>
                <input
                  type="text"
                  placeholder="e.g. Wholesale buyer, prefers M-Pesa statements"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 font-medium hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-500"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
