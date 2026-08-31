import React from 'react';

export function Badge({ children, variant = 'default', className = '' }) {
  const base = 'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-300';
  
  // Custom glass border and background gradients for each level
  const variants = {
    default: 'bg-slate-800/40 text-slate-300 border border-slate-700/50',
    critical: 'bg-red-500/10 text-red-400 border border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.1)]',
    high: 'bg-orange-500/10 text-orange-400 border border-orange-500/30 shadow-[0_0_10px_rgba(249,115,22,0.1)]',
    medium: 'bg-amber-500/10 text-amber-400 border border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.1)]',
    low: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.1)]',
    
    immediate: 'bg-red-500/10 text-red-400 border border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.1)]',
    short_term: 'bg-orange-500/10 text-orange-400 border border-orange-500/30 shadow-[0_0_10px_rgba(249,115,22,0.1)]',
    medium_term: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.1)]',
    
    pending: 'bg-amber-500/10 text-amber-400 border border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.1)]',
    approved: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.1)]',
    overridden: 'bg-purple-500/10 text-purple-400 border border-purple-500/30 shadow-[0_0_10px_rgba(168,85,247,0.1)]',
    rejected: 'bg-red-500/10 text-red-400 border border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.1)]',
  };

  const icons = {
    critical: (
      <svg className="h-3 w-3 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    immediate: (
      <svg className="h-3 w-3 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    rejected: (
      <svg className="h-3 w-3 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    high: (
      <svg className="h-3 w-3 text-orange-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <circle cx="12" cy="12" r="10" strokeWidth={2.5} />
        <line x1="12" y1="8" x2="12" y2="12" strokeWidth={2.5} strokeLinecap="round" />
        <line x1="12" y1="16" x2="12.01" y2="16" strokeWidth={2.5} strokeLinecap="round" />
      </svg>
    ),
    short_term: (
      <svg className="h-3 w-3 text-orange-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <circle cx="12" cy="12" r="10" strokeWidth={2.5} />
        <line x1="12" y1="8" x2="12" y2="12" strokeWidth={2.5} strokeLinecap="round" />
        <line x1="12" y1="16" x2="12.01" y2="16" strokeWidth={2.5} strokeLinecap="round" />
      </svg>
    ),
    medium: (
      <svg className="h-3 w-3 text-amber-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    pending: (
      <svg className="h-3 w-3 text-amber-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <circle cx="12" cy="12" r="10" strokeWidth={2.5} />
        <polyline points="12 6 12 12 16 14" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    low: (
      <svg className="h-3 w-3 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    approved: (
      <svg className="h-3 w-3 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    overridden: (
      <svg className="h-3 w-3 text-purple-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
      </svg>
    ),
  };

  return (
    <span className={`${base} ${variants[variant] || variants.default} ${className}`}>
      {icons[variant]}
      {children}
    </span>
  );
}

export function RiskBadge({ level }) {
  return <Badge variant={level?.toLowerCase()}>{level}</Badge>;
}

export function PriorityBadge({ level }) {
  const variant = level?.replace('_', '-').toLowerCase();
  return <Badge variant={variant}>{level?.replace('_', ' ')}</Badge>;
}

export function StatusBadge({ status }) {
  return <Badge variant={status?.toLowerCase()}>{status}</Badge>;
}