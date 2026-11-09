import React from 'react';
import { AuthState } from '../types/index.ts';
import {
  LayoutDashboard,
  ShoppingCart,
  Boxes,
  PieChart,
  FileText,
  Users,
  Briefcase,
  Calendar,
  CreditCard,
  ShieldCheck,
} from 'lucide-react';

export type NavTab =
  | 'dashboard'
  | 'pos'
  | 'inventory'
  | 'finance'
  | 'invoices'
  | 'customers'
  | 'employees'
  | 'appointments'
  | 'subscription'
  | 'superadmin';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  authState: AuthState | null;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab, authState }) => {
  const permissions = authState?.permissions;
  const isSuperAdmin = authState?.user?.role === 'super_admin';

  const navItems = [
    {
      id: 'dashboard' as NavTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
      visible: true,
    },
    {
      id: 'pos' as NavTab,
      label: 'Sales & POS',
      icon: ShoppingCart,
      visible: permissions?.canRecordSales ?? true,
    },
    {
      id: 'inventory' as NavTab,
      label: 'Inventory',
      icon: Boxes,
      visible: permissions?.canManageInventory || permissions?.canManageBusinessSettings || isSuperAdmin,
    },
    {
      id: 'finance' as NavTab,
      label: 'Financials & P&L',
      icon: PieChart,
      visible: permissions?.canViewFinancials || isSuperAdmin,
    },
    {
      id: 'invoices' as NavTab,
      label: 'Invoices',
      icon: FileText,
      visible: permissions?.canManageInvoices || permissions?.canManageBusinessSettings || isSuperAdmin,
    },
    {
      id: 'customers' as NavTab,
      label: 'Customers (CRM)',
      icon: Users,
      visible: true,
    },
    {
      id: 'employees' as NavTab,
      label: 'Staff & Commissions',
      icon: Briefcase,
      visible: permissions?.canManageEmployees || isSuperAdmin,
    },
    {
      id: 'appointments' as NavTab,
      label: 'Appointments',
      icon: Calendar,
      visible: permissions?.canManageAppointments || permissions?.canManageBusinessSettings || isSuperAdmin,
    },
    {
      id: 'subscription' as NavTab,
      label: 'Subscriptions',
      icon: CreditCard,
      visible: permissions?.canManageSubscription || isSuperAdmin,
    },
    {
      id: 'superadmin' as NavTab,
      label: 'Super Admin',
      icon: ShieldCheck,
      visible: isSuperAdmin,
    },
  ];

  return (
    <aside className="w-64 shrink-0 bg-slate-950 border-r border-slate-800 flex flex-col justify-between py-4">
      <div className="space-y-1 px-3">
        <div className="px-3 py-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
          Operations
        </div>
        {navItems.map((item) => {
          if (!item.visible) return null;
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left ${
                isActive
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tenant Context Footer */}
      <div className="px-4 py-3 mx-3 rounded-lg bg-slate-900/80 border border-slate-800 text-xs">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span>Active Currency</span>
          <span className="font-mono text-emerald-400 font-semibold">KES</span>
        </div>
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span>Tenant DB</span>
          <span className="text-slate-300 truncate max-w-[100px]">PostgreSQL</span>
        </div>
        <div className="flex items-center justify-between text-slate-400">
          <span>Payment Gateway</span>
          <span className="text-emerald-400 font-medium">M-Pesa Daraja</span>
        </div>
      </div>
    </aside>
  );
};
