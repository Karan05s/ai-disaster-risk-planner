import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function AccessDeniedScreen() {
  const { logout, user } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-md w-full text-center relative z-10">
        <div className="glass-panel p-8 shadow-md border border-red-500/20 shadow-red-500/5">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-500/10 border border-red-500/20 shadow-inner mb-6">
            <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
            Security Restriction
          </h1>
          <p className="mt-4 text-sm text-slate-400 leading-relaxed">
            Your identity card (<strong>{user?.role}</strong>) does not hold the clearance required to operate this panel.
            Only accounts with <code className="text-red-400 bg-red-500/5 px-1.5 py-0.5 rounded border border-red-500/10 text-xs">ADMIN</code> or <code className="text-red-400 bg-red-500/5 px-1.5 py-0.5 rounded border border-red-500/10 text-xs">AUTHORITY</code> clearance can proceed.
          </p>

          <div className="mt-8 space-y-3">
            <Link
              to="/login"
              onClick={logout}
              className="w-full block py-2.5 px-4 bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 text-white font-bold uppercase tracking-wider rounded-lg text-xs shadow-md shadow-red-500/10 hover:shadow-red-500/20 transition-all duration-200"
            >
              Log into Clearance Account
            </Link>
            
            <button
              onClick={logout}
              className="w-full py-2 px-4 bg-slate-900/60 hover:bg-slate-800 border border-slate-700/60 rounded-lg text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-slate-200 transition-all"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}