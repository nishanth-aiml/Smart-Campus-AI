import React from 'react';
import { Menu, Calendar, Clock, Bell, Sparkles } from 'lucide-react';

export default function Header({ setIsSidebarOpen, onNewRequestClick, activeTabTitle }) {
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between">
      <div className="flex items-center gap-3 sm:gap-4">
        <button
          id="btn-sidebar-toggle"
          onClick={() => setIsSidebarOpen(prev => !prev)}
          className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 lg:hidden focus:outline-none"
          aria-label="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">{activeTabTitle}</h2>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>{currentDate}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          id="btn-header-new-request"
          onClick={onNewRequestClick}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-sm shadow-indigo-200 transition-all active:scale-[0.98]"
        >
          <Sparkles className="w-4 h-4" />
          <span className="hidden sm:inline">New Allocation Request</span>
          <span className="sm:hidden">New Request</span>
        </button>
      </div>
    </header>
  );
}
