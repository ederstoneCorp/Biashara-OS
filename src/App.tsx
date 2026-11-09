import React, { useState, useEffect } from 'react';
import { AuthState } from './types/index.ts';
import { Header } from './components/Header.tsx';
import { Sidebar, NavTab } from './components/Sidebar.tsx';
import { DashboardView } from './components/DashboardView.tsx';
import { PosView } from './components/PosView.tsx';
import { InventoryView } from './components/InventoryView.tsx';
import { FinanceView } from './components/FinanceView.tsx';
import { InvoicingView } from './components/InvoicingView.tsx';
import { CustomerView } from './components/CustomerView.tsx';
import { EmployeeView } from './components/EmployeeView.tsx';
import { AppointmentsView } from './components/AppointmentsView.tsx';
import { SubscriptionView } from './components/SubscriptionView.tsx';
import { SuperAdminView } from './components/SuperAdminView.tsx';
import { GeminiAssistantModal } from './components/GeminiAssistantModal.tsx';
import { MarketingPage } from './components/MarketingPage.tsx';

export default function App() {
  const [authState, setAuthState] = useState<AuthState | null>(null);
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [viewMode, setViewMode] = useState<'app' | 'marketing'>('app');
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadAuth = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setAuthState(data);
        // If super admin, default to superadmin tab
        if (data.user?.role === 'super_admin' && currentTab === 'dashboard') {
          setCurrentTab('superadmin');
        }
      }
    } catch (err) {
      console.error('Failed to load auth session:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAuth();
  }, []);

  const handleSwitchUser = async (userId: number) => {
    try {
      const res = await fetch('/api/auth/switch-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      if (res.ok) {
        await loadAuth();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading && !authState) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-100 font-sans">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center font-bold text-slate-950 text-xl shadow-lg shadow-emerald-500/20 animate-pulse">
            B
          </div>
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Connecting to BiasharaOS Cloud SQL cluster...</span>
          </div>
        </div>
      </div>
    );
  }

  // If in Marketing website mode
  if (viewMode === 'marketing') {
    return <MarketingPage onEnterApp={() => setViewMode('app')} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Top Header */}
      <Header
        authState={authState}
        onSwitchUser={handleSwitchUser}
        onOpenAI={() => setIsAIOpen(true)}
        viewMode={viewMode}
        onToggleViewMode={setViewMode}
      />

      {/* Main Layout Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Operational Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          authState={authState}
        />

        {/* Dynamic Content Views */}
        <main className="flex-1 overflow-y-auto bg-slate-950">
          {currentTab === 'dashboard' && (
            <DashboardView
              onNavigate={(tab) => setCurrentTab(tab)}
              onOpenAI={() => setIsAIOpen(true)}
            />
          )}

          {currentTab === 'pos' && (
            <PosView business={authState?.business} />
          )}

          {currentTab === 'inventory' && (
            <InventoryView />
          )}

          {currentTab === 'finance' && (
            <FinanceView />
          )}

          {currentTab === 'invoices' && (
            <InvoicingView business={authState?.business} />
          )}

          {currentTab === 'customers' && (
            <CustomerView />
          )}

          {currentTab === 'employees' && (
            <EmployeeView />
          )}

          {currentTab === 'appointments' && (
            <AppointmentsView />
          )}

          {currentTab === 'subscription' && (
            <SubscriptionView
              business={authState?.business}
              onRefreshAuth={loadAuth}
            />
          )}

          {currentTab === 'superadmin' && (
            <SuperAdminView />
          )}
        </main>
      </div>

      {/* Gemini AI Assistant Modal */}
      <GeminiAssistantModal
        isOpen={isAIOpen}
        onClose={() => setIsAIOpen(false)}
        businessName={authState?.business?.name}
      />
    </div>
  );
}
