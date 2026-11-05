'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { createSafeBrowserClient } from '@/utils/supabase/client';
import { validateAuthInput } from '@/lib/account-sync';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);

    const validation = validateAuthInput({
      mode: 'reset',
      password,
      confirmPassword,
    });

    if (!validation.valid) {
      setStatus({ type: 'err', text: validation.error || 'Invalid password.' });
      return;
    }

    const supabase = createSafeBrowserClient();
    if (!supabase) {
      setStatus({
        type: 'err',
        text: 'Supabase is not configured. Please add NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY to .env.local.',
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        setStatus({ type: 'err', text: error.message });
      } else {
        setStatus({
          type: 'ok',
          text: 'Your password has been reset! You can now continue to your dashboard.',
        });
        setPassword('');
        setConfirmPassword('');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#060B19] text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-[#1E3468] bg-[#0A1329] p-6 space-y-5 shadow-2xl">
        <div className="flex items-center gap-3">
          <img
            src="/assets/fy/logo-mark.png"
            alt="Falylio Yara"
            className="h-10 w-auto object-contain"
          />
          <div>
            <h1 className="text-lg font-extrabold text-white">Reset Your Password</h1>
            <p className="text-xs text-slate-400">Falylio Yara Account Security</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">New Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full rounded-xl border border-[#243E7A] bg-[#081024] px-3.5 py-2.5 text-sm text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full rounded-xl border border-[#243E7A] bg-[#081024] px-3.5 py-2.5 text-sm text-white"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-[#00A8FF] to-[#7C3AED] py-2.5 text-xs font-bold text-white"
          >
            {loading ? 'Updating Password...' : 'Save New Password'}
          </button>

          {status && (
            <div
              className={`rounded-xl border p-3 text-xs ${
                status.type === 'ok'
                  ? 'border-emerald-500/40 bg-emerald-950/50 text-emerald-200'
                  : 'border-rose-500/40 bg-rose-950/50 text-rose-200'
              }`}
            >
              {status.text}
            </div>
          )}
        </form>

        <div className="pt-2 border-t border-[#162852] flex items-center justify-between text-xs">
          <Link href="/dashboard" className="text-[#00D2FF] hover:underline">
            Go to Dashboard →
          </Link>
          <Link href="/" className="text-slate-400 hover:text-white">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
