import React from 'react';
import {
  Music2,
  PlusCircle,
  Library,
  Sliders,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Disc3,
  Layers,
  Activity
} from 'lucide-react';
import { ActiveTab } from '../../types/music';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  hasActiveSession: boolean;
  onNewTranscription: () => void;
  recentCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  collapsed,
  setCollapsed,
  hasActiveSession,
  onNewTranscription,
  recentCount,
}) => {
  return (
    <aside
      className={`fixed top-0 left-0 bottom-0 z-40 bg-[#12121C] border-r border-[#292938] transition-all duration-300 flex flex-col justify-between ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Top Branding & New Transcription Button */}
      <div className="p-4 flex flex-col gap-6">
        {/* Brand Lockup */}
        <div className="flex items-center justify-between">
          <div
            onClick={() => setActiveTab('workspace')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 via-purple-600 to-indigo-500 p-0.5 shadow-[0_0_15px_rgba(139,92,246,0.25)] group-hover:shadow-[0_0_20px_rgba(139,92,246,0.4)] transition-all shrink-0">
              <div className="w-full h-full bg-[#09090F] rounded-[10px] flex items-center justify-center">
                <Music2 className="w-5 h-5 text-violet-400 group-hover:scale-110 transition-transform" />
              </div>
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="font-display font-bold text-lg text-white tracking-tight flex items-center gap-1.5">
                  StaffFlow <span className="text-xs px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-300 border border-violet-500/30">AI</span>
                </span>
                <span className="text-[10px] text-slate-400 tracking-wider uppercase font-medium">Music Studio</span>
              </div>
            )}
          </div>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex w-7 h-7 items-center justify-center rounded-lg bg-[#181826] text-slate-400 hover:text-white hover:bg-[#292938] transition-colors border border-[#292938]"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Primary CTA: New Transcription */}
        <button
          onClick={onNewTranscription}
          className={`w-full py-3 px-4 rounded-xl font-medium text-sm flex items-center justify-center gap-2.5 transition-all bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white shadow-[0_0_20px_rgba(139,92,246,0.2)] hover:shadow-[0_0_25px_rgba(139,92,246,0.35)] active:scale-[0.98] ${
            collapsed ? 'px-0' : ''
          }`}
        >
          <PlusCircle className="w-4 h-4 text-violet-200 shrink-0" />
          {!collapsed && <span>New Transcription</span>}
        </button>

        {/* Navigation Section */}
        <nav className="flex flex-col gap-1 mt-2">
          {/* Workspace */}
          <button
            onClick={() => setActiveTab('workspace')}
            className={`w-full py-2.5 px-3 rounded-lg text-xs font-medium flex items-center gap-3 transition-colors ${
              activeTab === 'workspace'
                ? 'bg-violet-600/15 text-violet-300 border border-violet-500/30 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#181826]'
            }`}
          >
            <Layers className="w-4 h-4 text-slate-400 shrink-0" />
            {!collapsed && <span>Workspace</span>}
          </button>

          {/* Current Session / Editor */}
          <button
            onClick={() => setActiveTab('editor')}
            disabled={!hasActiveSession}
            className={`w-full py-2.5 px-3 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
              !hasActiveSession
                ? 'opacity-50 cursor-not-allowed text-slate-600'
                : activeTab === 'editor'
                ? 'bg-violet-600/15 text-violet-300 border border-violet-500/30 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#181826]'
            }`}
          >
            <div className="flex items-center gap-3">
              <Disc3 className={`w-4 h-4 shrink-0 ${hasActiveSession ? 'text-cyan-400 animate-spin-slow' : 'text-slate-600'}`} />
              {!collapsed && <span>DAW Studio Editor</span>}
            </div>
            {!collapsed && hasActiveSession && (
              <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#06B6D4]"></span>
            )}
          </button>

          {/* Sheet Library / Saved Scores */}
          <button
            onClick={() => setActiveTab('library')}
            className={`w-full py-2.5 px-3 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
              activeTab === 'library'
                ? 'bg-violet-600/15 text-violet-300 border border-violet-500/30 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#181826]'
            }`}
          >
            <div className="flex items-center gap-3">
              <Library className="w-4 h-4 text-slate-400 shrink-0" />
              {!collapsed && <span>Session Scores</span>}
            </div>
            {!collapsed && recentCount > 0 && (
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-[#292938] text-slate-300 font-mono-data">
                {recentCount}
              </span>
            )}
          </button>

          {/* Settings */}
          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full py-2.5 px-3 rounded-lg text-xs font-medium flex items-center gap-3 transition-colors ${
              activeTab === 'settings'
                ? 'bg-violet-600/15 text-violet-300 border border-violet-500/30 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#181826]'
            }`}
          >
            <Sliders className="w-4 h-4 text-slate-400 shrink-0" />
            {!collapsed && <span>Audio Engine</span>}
          </button>
        </nav>
      </div>

      {/* Bottom Privacy & Session Status Indicator */}
      <div className="p-4 border-t border-[#292938]">
        {!collapsed ? (
          <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-[#09090F] border border-[#292938] text-slate-400 text-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <div className="flex flex-col">
              <span className="text-[11px] font-medium text-slate-300">Private session</span>
              <span className="text-[10px] text-slate-500">No permanent storage</span>
            </div>
          </div>
        ) : (
          <div className="flex justify-center" title="Private session · No permanent storage">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          </div>
        )}
      </div>
    </aside>
  );
};
