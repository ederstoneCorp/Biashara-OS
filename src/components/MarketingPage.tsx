import React from 'react';
import {
  Sparkles,
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
  Building2,
  Smartphone,
  ArrowRight,
  Layers,
  Users,
  Zap,
  Globe,
  Receipt,
  FileSpreadsheet,
} from 'lucide-react';

interface MarketingPageProps {
  onEnterApp: () => void;
  onOpenRegister?: () => void;
}

export const MarketingPage: React.FC<MarketingPageProps> = ({ onEnterApp, onOpenRegister }) => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-white">
      {/* Navigation */}
      <nav className="border-b border-slate-800/80 px-6 py-4 flex items-center justify-between max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center font-bold text-slate-950 text-base shadow-lg shadow-emerald-500/20">
            B
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-tight text-white">BiasharaOS</span>
            <span className="text-slate-500 text-xs ml-2 hidden sm:inline">Run Smarter. Grow Faster.</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {onOpenRegister && (
            <button
              onClick={onOpenRegister}
              className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-emerald-500/50 text-emerald-400 font-semibold text-xs transition-all shadow-sm"
            >
              Create Account
            </button>
          )}
          <button
            onClick={onEnterApp}
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all shadow-lg shadow-emerald-600/25 flex items-center gap-2"
          >
            <span>Launch Workspace</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-6 max-w-5xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Next-Generation African SME Operating System</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-[1.1]">
          The Intelligent Operating System for <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">Modern African Businesses</span>
        </h1>

        <p className="text-base sm:text-lg text-slate-400 max-w-3xl mx-auto leading-relaxed">
          Unify sales, inventory valuation, financial cashflow, customer loyalty, and staff commissions into a single high-performance SaaS platform. Backed by native M-Pesa Daraja payment workflows and Gemini AI database intelligence.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          {onOpenRegister && (
            <button
              onClick={onOpenRegister}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-emerald-500/50 text-emerald-400 font-bold text-sm shadow-xl transition-all flex items-center justify-center gap-2"
            >
              <span>Create Business Account</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onEnterApp}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-xl shadow-emerald-600/25 transition-all flex items-center justify-center gap-2"
          >
            <span>Open Demo Workspace</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Hero Features Bar */}
        <div className="pt-10 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-slate-400">
          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center gap-2.5">
            <Smartphone className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-white font-medium">Safaricom M-Pesa Native</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-white font-medium">Gemini 3.8 AI Assistant</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-white font-medium">6 User Roles & RBAC</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center gap-2.5">
            <Layers className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-white font-medium">PostgreSQL Isolation</span>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-16 px-6 max-w-7xl mx-auto border-t border-slate-800/80 w-full space-y-12">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Engineered for Commercial Speed & Operational Scale
          </h2>
          <p className="text-xs text-slate-400">
            From the bustling CBDs of Nairobi and Mombasa to regional trade hubs, BiasharaOS delivers enterprise-grade tooling without unnecessary friction.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <Receipt className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-white">High-Speed POS & Electronic Receipts</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Instant product lookups, barcode SKU search, discount application, and official receipts with M-Pesa transaction reference numbers and customer loyalty points tracking.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-400">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-white">Full Financial Statement (P&L)</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Automatic Cost of Goods Sold (COGS) calculation, operational overhead categorization (Rent, KPLC, Transport, Payroll), and live gross/net profit margins.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-white">Grounded Gemini AI Intelligence</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Query your business database conversationally. Gemini utilizes structured tool calling directly against PostgreSQL records to deliver verified financial answers.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 px-6 py-8 max-w-7xl mx-auto w-full flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <span className="font-bold text-white">BiasharaOS</span>
          <span>·</span>
          <span>Run Smarter. Grow Faster.</span>
        </div>
        <div>
          © 2026 BiasharaOS Technologies Ltd. All rights reserved. Built for African SMEs.
        </div>
      </footer>
    </div>
  );
};
