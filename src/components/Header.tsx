/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AuthState } from '../types/index.ts';
import { getRoleLabel } from '../utils/rbac.ts';
import { Sparkles, Building2, UserCheck, ShieldCheck, Globe, LayoutDashboard, UserPlus } from 'lucide-react';

interface HeaderProps {
  authState: AuthState | null;
  onSwitchUser: (userId: number) => void;
  onOpenAI: () => void;
  viewMode: 'app' | 'marketing';
  onToggleViewMode: (mode: 'app' | 'marketing') => void;
  onOpenRegister: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  authState,
  onSwitchUser,
  onOpenAI,
  viewMode,
  onToggleViewMode,
  onOpenRegister,
}) => {
  const currentUser = authState?.user;
  const currentBusiness = authState?.business;

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-slate-800 bg-slate-950/95 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between">
      {/* Brand & Tagline */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => onToggleViewMode('marketing')}>
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-500/20 font-bold text-slate-950 text-base">
            B
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight text-white">BiasharaOS</span>
              <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/60 font-semibold">
                SME Cloud
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">Run Smarter. Grow Faster.</p>
          </div>
        </div>

        {/* Current Tenant Badge (if logged in) */}
        {currentBusiness && viewMode === 'app' && (
          <div className="hidden md:flex items-center gap-2 ml-4 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 shrink-0 whitespace-nowrap">
            <Building2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="font-medium text-white">{currentBusiness.name}</span>
            <span className="text-slate-500">·</span>
            <span className="text-emerald-400 capitalize">{currentBusiness.tier} Plan</span>
          </div>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Create Account Button */}
        <button
          onClick={onOpenRegister}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-emerald-500/40 text-emerald-400 font-semibold text-xs transition-colors shadow-sm"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Create Account</span>
        </button>

        {/* Toggle Mode: Marketing Site vs SaaS App */}
        <div className="flex items-center p-1 bg-slate-900 border border-slate-800 rounded-lg text-xs">
          <button
            onClick={() => onToggleViewMode('marketing')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors ${
              viewMode === 'marketing'
                ? 'bg-slate-800 text-emerald-400 font-medium shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Website</span>
          </button>
          <button
            onClick={() => onToggleViewMode('app')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors ${
              viewMode === 'app'
                ? 'bg-slate-800 text-emerald-400 font-medium shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Dashboard</span>
          </button>
        </div>

        {/* Gemini AI Assistant Button */}
        {viewMode === 'app' && (
          <button
            onClick={onOpenAI}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/25 transition-all"
            aria-label="Open Gemini Business Assistant"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-200 animate-pulse" />
            <span>Biashara AI</span>
          </button>
        )}

        {/* Role & Persona Switcher */}
        {authState && (
          <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
            <div className="relative">
              <label htmlFor="role-switcher" className="sr-only">Switch User Role</label>
              <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 hover:border-slate-700 px-2.5 py-1.5 rounded-lg text-xs">
                {currentUser?.role === 'super_admin' ? (
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                ) : (
                  <UserCheck className="w-4 h-4 text-emerald-400" />
                )}
                <div className="text-left hidden lg:block">
                  <div className="text-white font-medium leading-none">{currentUser?.displayName}</div>
                  <div className="text-[10px] text-slate-400">{getRoleLabel(currentUser?.role || 'business_owner')}</div>
                </div>
                <select
                  id="role-switcher"
                  className="bg-transparent text-slate-300 hover:text-white focus:outline-none cursor-pointer pl-1 text-xs"
                  value={currentUser?.id || 2}
                  onChange={(e) => onSwitchUser(parseInt(e.target.value, 10))}
                >
                  {authState.availableUsers.map((u) => (
                    <option key={u.id} value={u.id} className="bg-slate-900 text-white">
                      {u.name} — {getRoleLabel(u.role)} ({u.businessName})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
