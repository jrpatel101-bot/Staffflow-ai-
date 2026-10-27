import React from 'react';
import { Menu, Activity, Sparkles, Moon, Radio } from 'lucide-react';
import { ActiveTab } from '../../types/music';

interface HeaderProps {
  activeTab: ActiveTab;
  sidebarCollapsed: boolean;
  onToggleMobileMenu: () => void;
  hasActiveSession: boolean;
  currentSongTitle?: string;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  sidebarCollapsed,
  onToggleMobileMenu,
  hasActiveSession,
  currentSongTitle,
}) => {
  const getTabTitle = () => {
    switch (activeTab) {
      case 'workspace':
        return 'AI Music Studio Workspace';
      case 'editor':
        return currentSongTitle ? `DAW Editor — ${currentSongTitle}` : 'Digital Audio Workstation';
      case 'library':
        return 'Session Score Library';
      case 'settings':
        return 'Audio Engine Configuration';
      default:
        return 'StaffFlow AI';
    }
  };

  return (
    <header
      className={`sticky top-0 z-30 h-16 bg-[#09090F]/90 backdrop-blur-md border-b border-[#292938] px-4 lg:px-8 flex items-center justify-between transition-all duration-300 ${
        sidebarCollapsed ? 'lg:pl-24' : 'lg:pl-72'
      }`}
    >
      {/* Left: Mobile Menu Toggle & Title / Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileMenu}
          className="lg:hidden p-2 rounded-lg bg-[#12121C] border border-[#292938] text-slate-300 hover:text-white"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-400">StaffFlow Studio</span>
          <span className="text-slate-600">/</span>
          <h1 className="text-sm font-semibold text-white tracking-wide truncate max-w-xs md:max-w-md">
            {getTabTitle()}
          </h1>
        </div>
      </div>

      {/* Right: Engine Status & Theme Badge */}
      <div className="flex items-center gap-3">
        {/* Active Session Telemetry Indicator */}
        {hasActiveSession && (
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-950/40 border border-violet-500/30 text-violet-300 text-xs">
            <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>Active DAW Session</span>
          </div>
        )}

        {/* Midnight Dark Theme Tag */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#12121C] border border-[#292938] text-xs text-slate-300 font-medium">
          <Moon className="w-3.5 h-3.5 text-violet-400" />
          <span>Midnight DAW</span>
        </div>
      </div>
    </header>
  );
};
