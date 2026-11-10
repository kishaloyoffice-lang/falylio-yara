'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Shield, LayoutDashboard } from 'lucide-react';
import { AdminControlPanelView } from '@/components/AdminControlPanelView';

export default function AdminControlPanelPage() {
  return (
    <div className="min-h-screen bg-[#060B19] text-white flex flex-col">
      <header className="h-16 border-b border-[#16264C] bg-[#070D1F] px-4 sm:px-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl border border-[#1E3468] bg-[#0E1936] px-3.5 py-2 text-xs font-bold text-slate-200 hover:border-[#00D2FF] hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 text-[#00D2FF]" />
            <span>Back to Platform</span>
          </Link>
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[#0B193D] to-[#1D1145] border border-[#00D2FF]/75 shadow-[0_0_14px_rgba(0,210,255,0.4)] flex items-center justify-center overflow-hidden p-1 shrink-0">
              <img
                src="/assets/fy/logo-mark.png"
                alt="Falylio Yara"
                className="h-full w-full rounded-full object-contain"
              />
            </div>
            <span className="text-base font-extrabold flex items-center gap-2">
              <span>
                Falylio <span className="text-[#00D2FF]">Yara</span> Admin Center
              </span>
              <Shield className="h-4 w-4 text-amber-400" />
            </span>
          </div>
        </div>

        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 rounded-xl border border-[#00D2FF]/50 bg-[#0D1E42] px-3.5 py-2 text-xs font-bold text-[#00D2FF] hover:bg-[#0072FF] hover:text-white"
        >
          <LayoutDashboard className="h-4 w-4" />
          <span>User Dashboard</span>
        </Link>
      </header>

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-8 py-6">
        <AdminControlPanelView />
      </main>
    </div>
  );
}
