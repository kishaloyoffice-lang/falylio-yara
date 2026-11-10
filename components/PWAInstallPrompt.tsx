'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Download,
  Smartphone,
  Monitor,
  WifiOff,
  CheckCircle2,
  X,
  Share,
  PlusSquare,
  Sparkles,
} from 'lucide-react';
import { usePWAInstall } from '@/hooks/usePWAInstall';

interface PWAInstallButtonProps {
  variant?: 'header' | 'sidebar';
}

export function PWAInstallButton({ variant = 'header' }: PWAInstallButtonProps) {
  const { isInstallable, isInstalled, isIOS, swReady, install } = usePWAInstall();
  const [showGuideModal, setShowGuideModal] = useState(false);

  // Hide the install button if already running as a standalone installed app
  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      const accepted = await install();
      if (!accepted) {
        setShowGuideModal(true);
      }
      return;
    }
    setShowGuideModal(true);
  };

  return (
    <>
      {variant === 'header' ? (
        <motion.button
          type="button"
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={handleInstallClick}
          className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#00D2FF]/20 via-[#0072FF]/25 to-purple-600/25 border border-[#00D2FF]/50 hover:border-[#00D2FF] px-3 py-1.5 text-xs font-bold text-white shadow-[0_0_15px_rgba(0,210,255,0.25)] transition-colors"
          title="Install Falylio Yara App on Mobile or Desktop"
        >
          <Download className="h-3.5 w-3.5 text-[#00D2FF] animate-bounce" />
          <span className="hidden sm:inline">Install App</span>
          <span className="sm:hidden">App</span>
        </motion.button>
      ) : (
        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleInstallClick}
          className="w-full rounded-xl border border-[#00D2FF]/45 bg-gradient-to-r from-[#0D214C] via-[#132C63] to-[#261758] hover:border-[#00D2FF] p-3 text-left transition-all shadow-[0_0_20px_rgba(0,210,255,0.18)] group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-[#00D2FF]/20 border border-[#00D2FF]/40 flex items-center justify-center text-[#00D2FF] group-hover:scale-110 transition-transform">
                <Smartphone className="h-4 w-4" />
              </div>
              <div>
                <div className="text-xs font-extrabold text-white flex items-center gap-1">
                  <span>Install App</span>
                  <span className="rounded bg-emerald-500/25 border border-emerald-400/40 px-1.5 py-0.2 text-[9px] font-bold text-emerald-300">
                    PWA
                  </span>
                </div>
                <div className="text-[10px] text-slate-300">
                  {swReady ? 'Offline Ready • Mobile & PC' : 'Fast 1-Click App Install'}
                </div>
              </div>
            </div>
            <Download className="h-4 w-4 text-[#00D2FF]" />
          </div>
        </motion.button>
      )}

      {/* Interactive Guided Install Modal (iOS Safari + Desktop/Android Fallback) */}
      <AnimatePresence>
        {showGuideModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4"
            onClick={() => setShowGuideModal(false)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 16 }}
              transition={{ type: 'spring', stiffness: 320, damping: 26 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl border border-[#244285] bg-gradient-to-b from-[#0C1736] to-[#070E22] p-6 text-white shadow-[0_24px_60px_rgba(0,0,0,0.75)] space-y-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-[#00D2FF]/25 to-purple-600/30 border border-[#00D2FF]/50 flex items-center justify-center text-[#00D2FF] shadow-[0_0_20px_rgba(0,210,255,0.3)]">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-white">
                      Install Falylio Yara App
                    </h3>
                    <p className="text-xs text-slate-300">
                      Run as a standalone Mobile &amp; Desktop App with Offline Caching
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowGuideModal(false)}
                  aria-label="Close install dialog"
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {isInstallable && (
                <div className="rounded-xl border border-[#00D2FF]/40 bg-[#00D2FF]/10 p-4 space-y-3">
                  <div className="text-xs font-semibold text-sky-200">
                    Direct 1-Click Browser Installation is ready for your device:
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      const ok = await install();
                      if (ok) setShowGuideModal(false);
                    }}
                    className="w-full rounded-xl bg-gradient-to-r from-[#00A8FF] to-[#0055FF] py-2.5 text-xs font-extrabold text-white shadow-[0_0_20px_rgba(0,168,255,0.45)] flex items-center justify-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    <span>Install Falylio Yara Now</span>
                  </button>
                </div>
              )}

              <div className="space-y-3">
                {isIOS ? (
                  <div className="rounded-xl border border-[#1E366E] bg-[#0B1530] p-4 space-y-2.5">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#00D2FF]">
                      <Smartphone className="h-4 w-4" />
                      <span>Install on iPhone / iPad (Safari)</span>
                    </div>
                    <ol className="text-xs text-slate-300 space-y-2 list-decimal list-inside">
                      <li className="flex items-center gap-2">
                        <span>1. Tap the</span>
                        <span className="inline-flex items-center gap-1 rounded bg-white/10 px-2 py-0.5 font-semibold text-white">
                          <Share className="h-3 w-3 text-[#00D2FF]" /> Share
                        </span>
                        <span>button in Safari toolbar.</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span>2. Scroll down and tap</span>
                        <span className="inline-flex items-center gap-1 rounded bg-white/10 px-2 py-0.5 font-semibold text-white">
                          <PlusSquare className="h-3 w-3 text-[#00D2FF]" /> Add to Home Screen
                        </span>
                      </li>
                      <li>3. Tap &ldquo;Add&rdquo; in the top-right corner to launch full-screen!</li>
                    </ol>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    <div className="rounded-xl border border-[#1E366E] bg-[#0B1530] p-3.5 space-y-1.5">
                      <div className="flex items-center gap-2 text-xs font-bold text-[#00D2FF]">
                        <Smartphone className="h-4 w-4" />
                        <span>Android (Chrome / Edge / Brave)</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        Tap the browser menu <strong>(⋮)</strong> in the top-right corner and select{' '}
                        <strong className="text-white">&ldquo;Install app&rdquo;</strong> or{' '}
                        <strong className="text-white">&ldquo;Add to Home screen&rdquo;</strong>.
                      </p>
                    </div>

                    <div className="rounded-xl border border-[#1E366E] bg-[#0B1530] p-3.5 space-y-1.5">
                      <div className="flex items-center gap-2 text-xs font-bold text-purple-300">
                        <Monitor className="h-4 w-4" />
                        <span>Desktop PC / Laptop (Chrome / Edge)</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        Click the <strong className="text-white">Install icon (⊕)</strong> on the
                        right side of your address bar, or open menu <strong>(⋮)</strong> &rarr;{' '}
                        <strong className="text-white">Cast, save, and share &rarr; Install page as app</strong>.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#1B3164]">
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-300 font-semibold">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Offline Service Worker Active</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowGuideModal(false)}
                  className="rounded-xl bg-[#162852] hover:bg-[#1E366E] px-4 py-2 text-xs font-bold text-white transition-colors"
                >
                  Got It
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export function OfflineConnectivityIndicator() {
  const { isOnline } = usePWAInstall();

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className="fixed bottom-4 left-4 z-50 flex items-center gap-2.5 rounded-xl border border-amber-400/50 bg-[#1A1305]/95 backdrop-blur-md px-4 py-2.5 text-xs font-bold text-amber-200 shadow-[0_10px_30px_rgba(245,158,11,0.3)]"
        >
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400 animate-ping" />
          <WifiOff className="h-4 w-4 text-amber-400" />
          <span>Offline Mode — Cached Falylio Yara tools are active</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
