import React, { useState, useEffect } from 'react';
import { EmployeeProfile } from '../types/index.ts';
import { getRoleLabel, UserRole } from '../utils/rbac.ts';
import { formatKES } from '../utils/businessMath.ts';
import {
  Briefcase,
  Plus,
  Award,
  DollarSign,
  UserCheck,
  Mail,
  Phone,
  Shield,
  X,
  Percent,
} from 'lucide-react';

export const EmployeeView: React.FC = () => {
  const [employees, setEmployees] = useState<EmployeeProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('sales_attendant');
  const [phone, setPhone] = useState('');
  const [commissionRate, setCommissionRate] = useState('5.0');

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/employees');
      const data = await res.json();
      setEmployees(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName || !email || !role) return;

    try {
      const res = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName, email, role, phone, commissionRate }),
      });
      if (!res.ok) throw new Error('Failed to add employee');
      setShowAddModal(false);
      setDisplayName('');
      setEmail('');
      setPhone('');
      setCommissionRate('5.0');
      loadEmployees();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const totalCommissionsEarned = employees.reduce((acc, e) => acc + (e.commissionEarned || 0), 0);
  const totalStaffSales = employees.reduce((acc, e) => acc + (e.totalSalesAttributed || 0), 0);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Staff & Sales Commissions</h1>
          <p className="text-xs text-slate-400">Team permissions, role delegation, individual sales attribution, and commission compensation</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors shadow-lg shadow-emerald-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>Add Employee</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Active Staff Members
          </div>
          <div className="text-xl font-bold font-mono text-white">{employees.length}</div>
          <div className="text-[11px] text-slate-500 mt-1">Delegated operational roles</div>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Total Staff-Attributed Sales
          </div>
          <div className="text-xl font-bold font-mono text-emerald-400">{formatKES(totalStaffSales)}</div>
          <div className="text-[11px] text-slate-500 mt-1">Processed across POS terminals</div>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Total Earned Commissions
          </div>
          <div className="text-xl font-bold font-mono text-teal-300">{formatKES(totalCommissionsEarned)}</div>
          <div className="text-[11px] text-slate-500 mt-1">Calculated from individual commission rates</div>
        </div>
      </div>

      {/* Staff Roster Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {employees.map((emp) => (
          <div key={emp.id} className="p-5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center font-bold text-white text-sm">
                  {emp.displayName.slice(0, 2).toUpperCase()}
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800/40">
                  {getRoleLabel(emp.role)}
                </span>
              </div>

              <h2 className="font-bold text-sm text-white">{emp.displayName}</h2>
              <div className="text-xs text-slate-400 space-y-1 mt-2">
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  <span className="truncate">{emp.email}</span>
                </div>
                {emp.phone && (
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-500" />
                    <span className="font-mono">{emp.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5 text-slate-300 pt-1">
                  <Percent className="w-3.5 h-3.5 text-emerald-400" />
                  <span>
                    Commission Rate: <strong className="text-white font-mono">{emp.commissionRate}%</strong>
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-semibold">Sales Closed</span>
                <span className="font-mono text-white font-medium">{formatKES(emp.totalSalesAttributed || 0)}</span>
              </div>
              <div className="text-right">
                <span className="text-slate-500 block text-[10px] uppercase font-semibold">Commission Earned</span>
                <span className="font-mono font-bold text-emerald-400">
                  {formatKES(emp.commissionEarned || 0)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Employee Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="font-bold text-base text-white">Add Team Member</h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEmployee} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-400 font-semibold">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Wachira"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold">Work Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="john@business.ke"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold">Phone (Safaricom)</label>
                  <input
                    type="tel"
                    placeholder="0712345678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold">Assigned Role *</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="sales_attendant">Sales Attendant</option>
                    <option value="business_manager">Business Manager</option>
                    <option value="accountant">Accountant</option>
                    <option value="inventory_manager">Inventory Manager</option>
                    <option value="business_owner">Business Owner</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold">Commission Rate (%)</label>
                  <input
                    type="text"
                    placeholder="e.g. 5.0"
                    value={commissionRate}
                    onChange={(e) => setCommissionRate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
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
                  Create Staff Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
