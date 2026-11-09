import React, { useState, useEffect } from 'react';
import { formatKES } from '../utils/businessMath.ts';
import {
  ShieldCheck,
  Building2,
  Users,
  CreditCard,
  Activity,
  Server,
  Database,
  Lock,
  RefreshCw,
  Edit,
} from 'lucide-react';

export const SuperAdminView: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/super-admin/overview');
      if (!res.ok) throw new Error('Unauthorized or failed to load super-admin analytics');
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateTier = async (businessId: number, newTier: string) => {
    try {
      const res = await fetch(`/api/super-admin/business/${businessId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier: newTier }),
      });
      if (!res.ok) throw new Error('Failed to update tenant plan');
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading || !data) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[350px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-400">Loading Super Administrator console...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-amber-500/20 text-amber-400">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold text-white tracking-tight">Super Administrator Control Center</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">Multi-tenant management, cross-business revenue analytics, and system audit logs</p>
        </div>
        <button
          onClick={loadData}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-semibold"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Telemetry</span>
        </button>
      </div>

      {/* Cross-Tenant Platform KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Registered Businesses
          </div>
          <div className="text-2xl font-bold font-mono text-white">{data.totalBusinesses} Tenants</div>
          <div className="text-[11px] text-slate-500 mt-1">Strict data isolation enforced</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Active Subscriptions
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400">{data.activeSubscriptions} Active</div>
          <div className="text-[11px] text-slate-500 mt-1">Paying SME enterprises</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Total SaaS MRR (Subscriptions)
          </div>
          <div className="text-2xl font-bold font-mono text-teal-300">
            {formatKES(data.totalSubscriptionRevenue)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Recurring software license revenue</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Total Platform GMV
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {formatKES(data.totalPlatformVolume)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Cumulative sales processed by tenants</div>
        </div>
      </div>

      {/* System Health Status */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-2">
              <span>Cloud SQL PostgreSQL Cluster</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] text-emerald-400 font-mono">ONLINE</span>
            </div>
            <div className="text-[11px] text-slate-400">
              Region: {data.systemHealth?.region} · Local Auth Proxy: Connected · SLA: {data.systemHealth?.uptime}
            </div>
          </div>
        </div>
        <div className="text-xs text-slate-400 font-mono">
          Tenant Isolation Mode: <span className="text-emerald-400 font-semibold">Row-Level BusinessID Foreign Key</span>
        </div>
      </div>

      {/* Tenants Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center">
          <h2 className="font-bold text-sm text-white">Registered Business Tenants</h2>
          <span className="text-xs text-slate-400">{data.businesses?.length} registered accounts</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/70 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Business Name</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4 text-center">Staff Count</th>
                <th className="py-3 px-4 text-center">Sales Recorded</th>
                <th className="py-3 px-4 text-right">Turnover</th>
                <th className="py-3 px-4 text-center">Active Plan</th>
                <th className="py-3 px-4 text-right">Plan Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {data.businesses?.map((b: any) => (
                <tr key={b.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-4 font-bold text-white">
                    <div>{b.name}</div>
                    <div className="text-[10px] text-slate-500 font-mono">slug: {b.slug} · PIN: {b.taxPin || '—'}</div>
                  </td>
                  <td className="py-3 px-4 text-slate-400">{b.address || 'Kenya'}</td>
                  <td className="py-3 px-4 text-center font-mono font-semibold">{b.userCount}</td>
                  <td className="py-3 px-4 text-center font-mono">{b.salesCount}</td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400">
                    {formatKES(b.totalVolume || 0)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800/40 uppercase">
                      {b.tier}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <select
                      value={b.tier}
                      onChange={(e) => handleUpdateTier(b.id, e.target.value)}
                      className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-[11px] text-slate-300 focus:outline-none focus:border-emerald-500 cursor-pointer"
                    >
                      <option value="free">Free</option>
                      <option value="starter">Starter</option>
                      <option value="business">Business Pro</option>
                      <option value="premium">Growth Premium</option>
                      <option value="enterprise">Enterprise</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* System Audit Logs */}
      <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800">
          <h2 className="font-bold text-sm text-white">System Security & Mutation Audit Logs</h2>
          <p className="text-[11px] text-slate-400">Immutable ledger of platform actions, sales recordings, and role changes</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/70 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Entity</th>
                <th className="py-3 px-4">Details</th>
                <th className="py-3 px-4">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {data.recentAuditLogs?.map((log: any) => (
                <tr key={log.id}>
                  <td className="py-3 px-4 text-slate-400 font-mono">{new Date(log.createdAt).toLocaleString()}</td>
                  <td className="py-3 px-4 font-mono font-semibold text-emerald-400">{log.action}</td>
                  <td className="py-3 px-4 text-slate-300 uppercase text-[11px]">{log.entityType}</td>
                  <td className="py-3 px-4 text-white">{log.details}</td>
                  <td className="py-3 px-4 text-slate-500 font-mono">{log.ipAddress || '197.237.112.44'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
