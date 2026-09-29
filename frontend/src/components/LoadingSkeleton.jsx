import React from 'react';
import { Inbox } from 'lucide-react';

export function LoadingSkeleton({ count = 3, type = 'card' }) {
  if (type === 'table') {
    return (
      <div className="space-y-3 animate-pulse">
        <div className="h-10 bg-slate-200 rounded-lg w-full"></div>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="h-14 bg-slate-100 rounded-lg w-full"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-32 bg-slate-200/70 rounded-xl p-5 border border-slate-200"></div>
      ))}
    </div>
  );
}

export function EmptyState({ title, message, actionText, onAction, icon: Icon = Inbox }) {
  return (
    <div className="bg-white rounded-xl border border-dashed border-slate-300 p-8 sm:p-12 text-center max-w-lg mx-auto">
      <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-base font-bold text-slate-900">{title}</h3>
      <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">{message}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="mt-5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-sm"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
