'use client';

import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Image as ImageIcon,
  Download,
  Sparkles,
  Bot,
  Send,
  Wand2,
  Copy,
  CheckCircle2,
  RefreshCw,
  Palette,
  Languages,
} from 'lucide-react';

export type ImageStylePreset =
  | 'Cyberpunk Neon'
  | '3D Isometric Render'
  | 'Modern Brand Logo'
  | 'Social Media Poster'
  | 'Anime / Fantasy Art'
  | 'Minimalist Tech';

export type ImageAspectRatio = '1:1' | '16:9' | '9:16';

export interface GeneratedArtworkItem {
  id: string;
  title: string;
  caption: string;
  prompt: string;
  stylePreset: ImageStylePreset;
  aspectRatio: ImageAspectRatio;
  svgCode: string;
  colorPalette: string[];
  createdAt: string;
}

interface VoiceChatTurn {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  lang: 'bn-BD' | 'en-US';
  audioUrl?: string;
}

const STYLE_PRESETS: { id: ImageStylePreset; badge: string; colors: [string, string, string] }[] = [
  { id: 'Cyberpunk Neon', badge: 'Neon Glow', colors: ['#00D2FF', '#7C3AED', '#060B19'] },
  { id: 'Modern Brand Logo', badge: 'Vector Emblem', colors: ['#38BDF8', '#6366F1', '#0B132B'] },
  { id: '3D Isometric Render', badge: '3D Depth', colors: ['#10B981', '#0EA5E9', '#09152E'] },
  { id: 'Social Media Poster', badge: 'Typography', colors: ['#F59E0B', '#EC4899', '#111827'] },
  { id: 'Anime / Fantasy Art', badge: 'Cinematic', colors: ['#A855F7', '#EC4899', '#0F172A'] },
  { id: 'Minimalist Tech', badge: 'Clean UI', colors: ['#22D3EE', '#3B82F6', '#050B18'] },
];

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Generates a high-resolution layered SVG artwork for any user prompt & style preset.
 * Used when the user wants instant artwork or if the server API key is not configured yet.
 */
export function buildProceduralStudioSvg(
  prompt: string,
  stylePreset: ImageStylePreset,
  aspectRatio: ImageAspectRatio
): GeneratedArtworkItem {
  const dims =
    aspectRatio === '16:9'
      ? { w: 1280, h: 720 }
      : aspectRatio === '9:16'
      ? { w: 720, h: 1280 }
      : { w: 1024, h: 1024 };

  const preset = STYLE_PRESETS.find((s) => s.id === stylePreset) || STYLE_PRESETS[0];
  const [c1, c2, bg] = preset.colors;
  const cleanTitle = prompt.trim().slice(0, 42) || 'Falylio Yara AI Creation';
  const safeTitle = escapeXml(cleanTitle.toUpperCase());
  const safeSub = escapeXml(`${stylePreset} • Falylio Yara AI Studio`);

  const cx = Math.round(dims.w / 2);
  const cy = Math.round(dims.h / 2);
  const rMain = Math.round(Math.min(dims.w, dims.h) * 0.27);

  const svgCode = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${dims.w} ${dims.h}" width="${dims.w}" height="${dims.h}">
  <defs>
    <linearGradient id="bgGrad" x1="0" y1="0" x2="${dims.w}" y2="${dims.h}" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="${bg}" />
      <stop offset="50%" stop-color="#0D1B3E" />
      <stop offset="100%" stop-color="#050814" />
    </linearGradient>
    <linearGradient id="neonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${c1}" />
      <stop offset="100%" stop-color="${c2}" />
    </linearGradient>
    <radialGradient id="orbGlow" cx="50%" cy="45%" r="50%">
      <stop offset="0%" stop-color="${c1}" stop-opacity="0.45" />
      <stop offset="55%" stop-color="${c2}" stop-opacity="0.18" />
      <stop offset="100%" stop-color="${bg}" stop-opacity="0" />
    </radialGradient>
    <filter id="cyberGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="12" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <rect width="${dims.w}" height="${dims.h}" fill="url(#bgGrad)" />
  <circle cx="${cx}" cy="${Math.round(cy * 0.88)}" r="${Math.round(rMain * 1.65)}" fill="url(#orbGlow)" />

  <!-- Perspective Cyber Grid -->
  <g stroke="${c1}" stroke-opacity="0.14" stroke-width="1.5">
    <line x1="0" y1="${Math.round(dims.h * 0.75)}" x2="${dims.w}" y2="${Math.round(dims.h * 0.75)}" />
    <line x1="0" y1="${Math.round(dims.h * 0.82)}" x2="${dims.w}" y2="${Math.round(dims.h * 0.82)}" />
    <line x1="0" y1="${Math.round(dims.h * 0.9)}" x2="${dims.w}" y2="${Math.round(dims.h * 0.9)}" />
    <line x1="${cx}" y1="${cy}" x2="0" y2="${dims.h}" />
    <line x1="${cx}" y1="${cy}" x2="${Math.round(dims.w * 0.25)}" y2="${dims.h}" />
    <line x1="${cx}" y1="${cy}" x2="${Math.round(dims.w * 0.5)}" y2="${dims.h}" />
    <line x1="${cx}" y1="${cy}" x2="${Math.round(dims.w * 0.75)}" y2="${dims.h}" />
    <line x1="${cx}" y1="${cy}" x2="${dims.w}" y2="${dims.h}" />
  </g>

  <!-- Central Geometric Emblem & Rings -->
  <g transform="translate(${cx}, ${Math.round(cy * 0.85)})" filter="url(#cyberGlow)">
    <circle cx="0" cy="0" r="${rMain}" fill="none" stroke="url(#neonGrad)" stroke-width="6" stroke-opacity="0.85" />
    <circle cx="0" cy="0" r="${Math.round(rMain * 0.82)}" fill="none" stroke="${c1}" stroke-width="2" stroke-dasharray="14 10" stroke-opacity="0.65" />
    <polygon points="0,-${Math.round(rMain * 0.62)} ${Math.round(rMain * 0.56)},${Math.round(rMain * 0.34)} -${Math.round(rMain * 0.56)},${Math.round(rMain * 0.34)}" fill="url(#neonGrad)" fill-opacity="0.28" stroke="url(#neonGrad)" stroke-width="4" />
    <polygon points="0,${Math.round(rMain * 0.62)} ${Math.round(rMain * 0.56)},-${Math.round(rMain * 0.34)} -${Math.round(rMain * 0.56)},-${Math.round(rMain * 0.34)}" fill="none" stroke="${c1}" stroke-width="3" stroke-opacity="0.7" />
    <circle cx="0" cy="0" r="${Math.round(rMain * 0.22)}" fill="url(#neonGrad)" />
  </g>

  <!-- Title Banner & Typography -->
  <rect x="${Math.round(dims.w * 0.1)}" y="${Math.round(dims.h * 0.74)}" width="${Math.round(dims.w * 0.8)}" height="${Math.round(dims.h * 0.16)}" rx="24" fill="#070E24" fill-opacity="0.86" stroke="url(#neonGrad)" stroke-width="2.5" />
  <text x="${cx}" y="${Math.round(dims.h * 0.815)}" text-anchor="middle" fill="#FFFFFF" font-family="sans-serif" font-weight="800" font-size="${Math.round(Math.min(dims.w, dims.h) * 0.036)}" letter-spacing="2">${safeTitle}</text>
  <text x="${cx}" y="${Math.round(dims.h * 0.86)}" text-anchor="middle" fill="${c1}" font-family="sans-serif" font-weight="600" font-size="${Math.round(Math.min(dims.w, dims.h) * 0.02)}" letter-spacing="3">${safeSub}</text>
</svg>`;

  return {
    id: `art-${Date.now()}`,
    title: cleanTitle,
    caption: `${stylePreset} digital artwork generated in ${aspectRatio} format.`,
    prompt,
    stylePreset,
    aspectRatio,
    svgCode,
    colorPalette: [c1, c2, bg, '#FFFFFF'],
    createdAt: new Date().toISOString(),
  };
}

export function YaraVoiceAndImageStudio() {
  const [activeStudioTab, setActiveStudioTab] = useState<'image' | 'voice'>('image');

  // =========================================================================
  // 1. AI IMAGE, POSTER & LOGO GENERATOR STATE
  // =========================================================================
  const [imagePrompt, setImagePrompt] = useState<string>(
    'Futuristic Cyberpunk Gaming Dragon Emblem with Neon Cyan & Purple Glow'
  );
  const [stylePreset, setStylePreset] = useState<ImageStylePreset>('Cyberpunk Neon');
  const [aspectRatio, setAspectRatio] = useState<ImageAspectRatio>('1:1');
  const [generatingImage, setGeneratingImage] = useState<boolean>(false);
  const [gallery, setGallery] = useState<GeneratedArtworkItem[]>(() => [
    buildProceduralStudioSvg(
      'Falylio Yara Cyber Crown Studio Emblem',
      'Cyberpunk Neon',
      '1:1'
    ),
  ]);
  const [selectedArtworkIndex, setSelectedArtworkIndex] = useState<number>(0);
  const [imageListening, setImageListening] = useState<boolean>(false);

  // =========================================================================
  // 2. BANGLA & ENGLISH VOICE ASSISTANT STATE
  // =========================================================================
  const [voiceLang, setVoiceLang] = useState<'bn-BD' | 'en-US'>('bn-BD');
  const [selectedVoiceName, setSelectedVoiceName] = useState<string>('Kore');
  const [autoSpeak, setAutoSpeak] = useState<boolean>(true);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [voiceInput, setVoiceInput] = useState<string>('');
  const [voiceLoading, setVoiceLoading] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [voiceHistory, setVoiceHistory] = useState<VoiceChatTurn[]>([
    {
      id: 'welcome-turn',
      role: 'assistant',
      lang: 'bn-BD',
      text: 'হ্যালো! আমি Yara Voice AI 🎙️। আপনি বাংলায় বা ইংরেজিতে মাইক্রোফোন বাটনে চাপ দিয়ে কথা বলতে পারেন অথবা যেকোনো প্রশ্ন লিখতে পারেন!',
    },
  ]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);

  const currentArtwork = gallery[selectedArtworkIndex] || gallery[0];

  // =========================================================================
  // IMAGE GENERATION HANDLERS
  // =========================================================================
  const handleGenerateArtwork = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!imagePrompt.trim() || generatingImage) return;

    setGeneratingImage(true);
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'image-svg',
          prompt: imagePrompt.trim(),
          stylePreset,
          aspectRatio,
        }),
      });
      const data = await res.json();

      if (res.ok && data.connected && data.artwork?.svgCode?.includes('<svg')) {
        const newArt: GeneratedArtworkItem = {
          id: `art-${Date.now()}`,
          title: data.artwork.title || imagePrompt.trim().slice(0, 36),
          caption: data.artwork.caption || `${stylePreset} AI Artwork`,
          prompt: imagePrompt.trim(),
          stylePreset,
          aspectRatio,
          svgCode: data.artwork.svgCode,
          colorPalette: Array.isArray(data.artwork.colorPalette)
            ? data.artwork.colorPalette
            : ['#00D2FF', '#9333EA', '#060B19'],
          createdAt: new Date().toISOString(),
        };
        setGallery((prev) => [newArt, ...prev]);
        setSelectedArtworkIndex(0);
      } else {
        // Instant procedural high-res studio artwork fallback
        const fallbackArt = buildProceduralStudioSvg(
          imagePrompt.trim(),
          stylePreset,
          aspectRatio
        );
        setGallery((prev) => [fallbackArt, ...prev]);
        setSelectedArtworkIndex(0);
      }
    } catch {
      const fallbackArt = buildProceduralStudioSvg(
        imagePrompt.trim(),
        stylePreset,
        aspectRatio
      );
      setGallery((prev) => [fallbackArt, ...prev]);
      setSelectedArtworkIndex(0);
    } finally {
      setGeneratingImage(false);
    }
  };

  const handleDownloadSvg = (art: GeneratedArtworkItem) => {
    const blob = new Blob([art.svgCode], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `falylio-yara-${art.id}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadPng = (art: GeneratedArtworkItem) => {
    const dims =
      art.aspectRatio === '16:9'
        ? { w: 1280, h: 720 }
        : art.aspectRatio === '9:16'
        ? { w: 720, h: 1280 }
        : { w: 1024, h: 1024 };

    const svgBlob = new Blob([art.svgCode], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = dims.w;
      canvas.height = dims.h;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#060B19';
        ctx.fillRect(0, 0, dims.w, dims.h);
        ctx.drawImage(img, 0, 0, dims.w, dims.h);
        const pngUrl = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = pngUrl;
        a.download = `falylio-yara-${art.id}.png`;
        a.click();
      }
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  // =========================================================================
  // SPEECH SYNTHESIS (Server Gemini TTS + Browser SpeechSynthesis Fallback)
  // =========================================================================
  const stopSpeaking = useCallback(() => {
    if (activeAudioRef.current) {
      activeAudioRef.current.pause();
      activeAudioRef.current = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, []);

  const speakTextAloud = useCallback(
    async (text: string, lang: 'bn-BD' | 'en-US') => {
      stopSpeaking();
      setIsSpeaking(true);

      try {
        const res = await fetch('/api/ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mode: 'tts',
            prompt: text,
            voiceName: selectedVoiceName,
          }),
        });
        const data = await res.json();
        if (res.ok && data.connected && data.audioDataUrl) {
          const audio = new window.Audio(data.audioDataUrl);
          activeAudioRef.current = audio;
          audio.onended = () => setIsSpeaking(false);
          audio.onerror = () => setIsSpeaking(false);
          await audio.play();
          return;
        }
      } catch {
        // Fallback to browser Web Speech API
      }

      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;
        utterance.rate = 1.0;
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utterance);
      } else {
        setIsSpeaking(false);
      }
    },
    [selectedVoiceName, stopSpeaking]
  );

  // =========================================================================
  // VOICE ASSISTANT QUESTION & ANSWER
  // =========================================================================
  const submitVoiceQuery = useCallback(
    async (rawQuery: string) => {
      const q = rawQuery.trim();
      if (!q || voiceLoading) return;

      const userTurn: VoiceChatTurn = {
        id: `u-${Date.now()}`,
        role: 'user',
        text: q,
        lang: voiceLang,
      };

      setVoiceHistory((prev) => [...prev, userTurn]);
      setVoiceInput('');
      setVoiceLoading(true);

      try {
        const systemInstruction =
          voiceLang === 'bn-BD'
            ? 'You are Yara Voice AI on the Falylio Yara platform. Respond naturally, warmly, and concisely in Bengali (বাংলা) unless the user asks for English. Keep answers clear and spoken-friendly (2-4 sentences).'
            : 'You are Yara Voice AI on the Falylio Yara platform. Respond naturally, warmly, and concisely in clear English (2-4 sentences).';

        const res = await fetch('/api/ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mode: 'text',
            prompt: q,
            systemInstruction,
            language: voiceLang,
          }),
        });

        const data = await res.json();
        let replyText = '';

        if (res.ok && data.connected && data.text) {
          replyText = data.text;
        } else {
          replyText =
            voiceLang === 'bn-BD'
              ? `আপনার প্রশ্ন "${q}" পেয়েছি! Falylio Yara প্ল্যাটফর্মে আপনি ১৭টি ক্যাটাগরির অনলাইন টুল, AI Image Studio, এবং গেমিং জোন একসাথে ব্যবহার করতে পারবেন।`
              : `I heard your request: "${q}"! On Falylio Yara, you can explore 17 utility categories, generate custom posters & logos in the AI Image Studio, and collaborate live.`;
        }

        const aiTurn: VoiceChatTurn = {
          id: `a-${Date.now()}`,
          role: 'assistant',
          text: replyText,
          lang: voiceLang,
        };

        setVoiceHistory((prev) => [...prev, aiTurn]);

        if (autoSpeak) {
          void speakTextAloud(replyText, voiceLang);
        }
      } catch {
        const fallbackTurn: VoiceChatTurn = {
          id: `a-${Date.now()}`,
          role: 'assistant',
          text:
            voiceLang === 'bn-BD'
              ? 'দুঃখিত, এই মুহূর্তে সার্ভারে সংযোগ করা যাচ্ছে না। আবার চেষ্টা করুন।'
              : 'Could not reach the voice server right now. Please try again.',
          lang: voiceLang,
        };
        setVoiceHistory((prev) => [...prev, fallbackTurn]);
      } finally {
        setVoiceLoading(false);
      }
    },
    [voiceLang, voiceLoading, autoSpeak, speakTextAloud]
  );

  // =========================================================================
  // MICROPHONE SPEECH-TO-TEXT (Bangla bn-BD & English en-US)
  // =========================================================================
  const toggleMicrophone = (target: 'voice-chat' | 'image-prompt') => {
    if (typeof window === 'undefined') return;

    // Stop if already listening
    if (isListening || imageListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      setImageListening(false);
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognitionCtor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionCtor) {
      if (target === 'voice-chat') {
        setVoiceInput(
          voiceLang === 'bn-BD'
            ? 'আমার জন্য একটি প্রফেশনাল ওয়েবসাইট আইডিয়া বলো'
            : 'Give me a creative startup idea for digital creators'
        );
      }
      return;
    }

    const recognition = new SpeechRecognitionCtor();
    recognition.lang = voiceLang;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    if (target === 'voice-chat') {
      setIsListening(true);
    } else {
      setImageListening(true);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      const transcript = event.results?.[0]?.[0]?.transcript || '';
      if (transcript) {
        if (target === 'image-prompt') {
          setImagePrompt(transcript);
        } else {
          setVoiceInput(transcript);
          void submitVoiceQuery(transcript);
        }
      }
    };

    recognition.onerror = () => {
      setIsListening(false);
      setImageListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      setImageListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  return (
    <div className="rounded-2xl border border-[#25458B] bg-gradient-to-b from-[#0B1633] via-[#09122B] to-[#070E22] p-4 sm:p-5 space-y-5 shadow-[0_14px_45px_rgba(0,0,0,0.55)]">
      {/* Studio Top Bar & Mode Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#193066] pb-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#00D2FF]">
            <Sparkles className="h-3.5 w-3.5 text-amber-300" />
            <span>Multimodal Creative Suite • Bangla &amp; English</span>
          </div>
          <h3
            className="text-lg sm:text-xl font-extrabold text-white"
            style={{ fontFamily: 'var(--font-display), sans-serif' }}
          >
            Yara AI Voice &amp; Image Studio 🎙️🎨
          </h3>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex items-center gap-2 bg-[#070E21] p-1.5 rounded-xl border border-[#1E366D]">
          <button
            type="button"
            onClick={() => setActiveStudioTab('image')}
            className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-extrabold transition-all ${
              activeStudioTab === 'image'
                ? 'bg-gradient-to-r from-[#00D2FF] to-[#0066FF] text-slate-950 shadow-[0_0_16px_rgba(0,210,255,0.45)]'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <ImageIcon className="h-4 w-4" />
            <span>AI Image, Poster &amp; Logo Studio</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveStudioTab('voice')}
            className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-extrabold transition-all ${
              activeStudioTab === 'voice'
                ? 'bg-gradient-to-r from-purple-500 to-[#00D2FF] text-slate-950 shadow-[0_0_16px_rgba(168,85,247,0.45)]'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Mic className="h-4 w-4" />
            <span>Bangla / English Voice AI</span>
          </button>
        </div>
      </div>

      {/* =====================================================================
          TAB 1: AI IMAGE, POSTER & LOGO GENERATOR STUDIO
         ===================================================================== */}
      {activeStudioTab === 'image' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Controls (5 Cols) */}
          <form
            onSubmit={handleGenerateArtwork}
            className="lg:col-span-5 space-y-4 rounded-xl border border-[#1E366D] bg-[#081026] p-4"
          >
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Wand2 className="h-3.5 w-3.5 text-[#00D2FF]" />
                  <span>Describe Your Image, Poster, or Logo</span>
                </label>
                <button
                  type="button"
                  onClick={() => toggleMicrophone('image-prompt')}
                  className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all ${
                    imageListening
                      ? 'bg-rose-500 text-white animate-pulse'
                      : 'bg-[#12234C] text-[#00D2FF] border border-[#00D2FF]/40 hover:bg-[#193066]'
                  }`}
                  title="Speak prompt in Bangla or English"
                >
                  {imageListening ? <MicOff className="h-3 w-3" /> : <Mic className="h-3 w-3" />}
                  <span>{imageListening ? 'Listening...' : 'Voice Input'}</span>
                </button>
              </div>

              <textarea
                rows={3}
                value={imagePrompt}
                onChange={(e) => setImagePrompt(e.target.value)}
                placeholder="e.g. Futuristic Esports Team Logo with Neon Blue Wolf..."
                className="w-full rounded-xl bg-[#0D1938] border border-[#244282] p-3 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:border-[#00D2FF]"
                required
              />
            </div>

            {/* Style Presets Grid */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Palette className="h-3.5 w-3.5 text-purple-400" />
                <span>Visual Style Preset</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {STYLE_PRESETS.map((st) => {
                  const active = stylePreset === st.id;
                  return (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setStylePreset(st.id)}
                      className={`rounded-xl border p-2.5 text-left transition-all ${
                        active
                          ? 'border-[#00D2FF] bg-[#122654] shadow-[0_0_12px_rgba(0,210,255,0.25)]'
                          : 'border-[#1B3266] bg-[#0B1633] hover:border-[#00D2FF]/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-white truncate">{st.id}</span>
                        <span
                          className="h-2.5 w-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: st.colors[0] }}
                        />
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{st.badge}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Aspect Ratio Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-200">Aspect Ratio &amp; Resolution</label>
              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    { id: '1:1', label: '1:1 Square', res: '1024×1024' },
                    { id: '16:9', label: '16:9 Banner', res: '1280×720' },
                    { id: '9:16', label: '9:16 Story', res: '720×1280' },
                  ] as const
                ).map((ar) => (
                  <button
                    key={ar.id}
                    type="button"
                    onClick={() => setAspectRatio(ar.id)}
                    className={`rounded-xl border py-2 px-2 text-center transition-all ${
                      aspectRatio === ar.id
                        ? 'border-[#00D2FF] bg-[#00D2FF]/20 text-white font-bold'
                        : 'border-[#1B3266] bg-[#0B1633] text-slate-300'
                    }`}
                  >
                    <div className="text-xs font-bold">{ar.label}</div>
                    <div className="text-[10px] text-slate-400">{ar.res}</div>
                  </button>
                ))}
              </div>
            </div>

            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={generatingImage}
              className="w-full rounded-xl bg-gradient-to-r from-[#00D2FF] via-[#0072FF] to-purple-600 py-3 text-xs font-extrabold text-white shadow-[0_0_24px_rgba(0,210,255,0.45)] flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {generatingImage ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Rendering High-Res Artwork...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Generate AI Image / Logo Now</span>
                </>
              )}
            </motion.button>
          </form>

          {/* Right Live Canvas Preview & Download (7 Cols) */}
          <div className="lg:col-span-7 rounded-xl border border-[#1E366D] bg-[#081026] p-4 flex flex-col justify-between gap-4">
            {currentArtwork && (
              <>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-extrabold text-white">{currentArtwork.title}</h4>
                    <p className="text-[11px] text-slate-400">{currentArtwork.caption}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => handleDownloadPng(currentArtwork)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#00A8FF] to-[#0055FF] px-3.5 py-2 text-xs font-extrabold text-white shadow-[0_0_15px_rgba(0,168,255,0.4)]"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>Download PNG (HD)</span>
                    </motion.button>
                    <button
                      type="button"
                      onClick={() => handleDownloadSvg(currentArtwork)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-[#274893] bg-[#102046] hover:border-[#00D2FF] px-3 py-2 text-xs font-bold text-slate-200"
                    >
                      <Download className="h-3.5 w-3.5 text-[#00D2FF]" />
                      <span>SVG</span>
                    </button>
                  </div>
                </div>

                {/* Artwork Viewport */}
                <div className="relative rounded-xl border border-[#223E7E] bg-[#050A18] p-3 flex items-center justify-center min-h-[300px] max-h-[380px] overflow-hidden">
                  <div
                    className="w-full h-full flex items-center justify-center [&>svg]:max-h-[340px] [&>svg]:w-auto [&>svg]:rounded-lg [&>svg]:shadow-2xl"
                    dangerouslySetInnerHTML={{ __html: currentArtwork.svgCode }}
                  />
                </div>

                {/* Recent Generated Thumbnails */}
                <div className="flex items-center justify-between gap-3 pt-1">
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {gallery.map((item, idx) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setSelectedArtworkIndex(idx)}
                        className={`px-3 py-1.5 rounded-lg text-[11px] font-bold whitespace-nowrap border transition-all ${
                          selectedArtworkIndex === idx
                            ? 'border-[#00D2FF] bg-[#122654] text-white'
                            : 'border-[#1B3266] bg-[#0B1633] text-slate-400 hover:text-white'
                        }`}
                      >
                        #{gallery.length - idx} • {item.stylePreset}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {currentArtwork.colorPalette.map((hex, i) => (
                      <span
                        key={`${hex}-${i}`}
                        className="h-4 w-4 rounded-full border border-white/20"
                        style={{ backgroundColor: hex }}
                        title={hex}
                      />
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 2: BANGLA & ENGLISH VOICE ASSISTANT (YARA VOICE AI)
         ===================================================================== */}
      {activeStudioTab === 'voice' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Voice Orb & Controls (5 Cols) */}
          <div className="lg:col-span-5 rounded-xl border border-[#1E366D] bg-[#081026] p-5 flex flex-col items-center justify-between text-center space-y-4">
            {/* Language & Voice Persona Bar */}
            <div className="w-full flex flex-wrap items-center justify-between gap-2">
              <div className="inline-flex items-center rounded-xl bg-[#0D1A3A] p-1 border border-[#223E7E]">
                <button
                  type="button"
                  onClick={() => setVoiceLang('bn-BD')}
                  className={`px-3 py-1 rounded-lg text-xs font-extrabold transition-colors ${
                    voiceLang === 'bn-BD'
                      ? 'bg-[#00D2FF] text-slate-950'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  বাংলা (Bangla)
                </button>
                <button
                  type="button"
                  onClick={() => setVoiceLang('en-US')}
                  className={`px-3 py-1 rounded-lg text-xs font-extrabold transition-colors ${
                    voiceLang === 'en-US'
                      ? 'bg-[#00D2FF] text-slate-950'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  English
                </button>
              </div>

              <select
                value={selectedVoiceName}
                onChange={(e) => setSelectedVoiceName(e.target.value)}
                aria-label="Select Gemini TTS Voice"
                className="rounded-xl bg-[#0D1A3A] border border-[#223E7E] px-2.5 py-1.5 text-xs font-bold text-[#00D2FF]"
              >
                <option value="Kore">Voice: Kore (Clear)</option>
                <option value="Puck">Voice: Puck (Energetic)</option>
                <option value="Zephyr">Voice: Zephyr (Calm)</option>
                <option value="Charon">Voice: Charon (Deep)</option>
                <option value="Fenrir">Voice: Fenrir (Bold)</option>
              </select>
            </div>

            {/* Animated Interactive Microphone Orb */}
            <div className="py-4 flex flex-col items-center justify-center space-y-3">
              <div className="relative flex items-center justify-center">
                <AnimatePresence>
                  {(isListening || isSpeaking) && (
                    <>
                      <motion.span
                        initial={{ scale: 0.9, opacity: 0.7 }}
                        animate={{ scale: 1.55, opacity: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.4, repeat: Infinity }}
                        className={`absolute h-24 w-24 rounded-full ${
                          isListening ? 'bg-rose-500/40' : 'bg-[#00D2FF]/40'
                        }`}
                      />
                      <motion.span
                        initial={{ scale: 0.9, opacity: 0.7 }}
                        animate={{ scale: 1.3, opacity: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.4, repeat: Infinity, delay: 0.4 }}
                        className={`absolute h-24 w-24 rounded-full ${
                          isListening ? 'bg-rose-500/50' : 'bg-purple-500/40'
                        }`}
                      />
                    </>
                  )}
                </AnimatePresence>

                <motion.button
                  type="button"
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => toggleMicrophone('voice-chat')}
                  className={`relative z-10 h-24 w-24 rounded-full border-2 flex items-center justify-center shadow-2xl transition-colors ${
                    isListening
                      ? 'border-rose-400 bg-gradient-to-br from-rose-500 to-amber-600 text-white shadow-[0_0_35px_rgba(244,63,94,0.65)]'
                      : 'border-[#00D2FF] bg-gradient-to-br from-[#00D2FF]/30 via-[#0066FF]/40 to-purple-600/40 text-white shadow-[0_0_30px_rgba(0,210,255,0.4)]'
                  }`}
                  aria-label="Toggle Voice Assistant Microphone"
                >
                  {isListening ? (
                    <MicOff className="h-10 w-10 animate-pulse" />
                  ) : (
                    <Mic className="h-10 w-10 text-[#00D2FF]" />
                  )}
                </motion.button>
              </div>

              <div className="space-y-1">
                <div className="text-sm font-extrabold text-white">
                  {isListening
                    ? voiceLang === 'bn-BD'
                      ? 'শুনছি... এখন বাংলায় বলুন'
                      : 'Listening... Speak now'
                    : isSpeaking
                    ? voiceLang === 'bn-BD'
                      ? 'Yara AI কথা বলছে...'
                      : 'Yara AI is speaking...'
                    : voiceLang === 'bn-BD'
                    ? 'মাইক্রোফোনে ট্যাপ করে বাংলায় কথা বলুন'
                    : 'Tap Microphone to Speak in English'}
                </div>
                <p className="text-[11px] text-slate-400">
                  Powered by Gemini 3.8 Flash &amp; Gemini TTS ({selectedVoiceName})
                </p>
              </div>
            </div>

            {/* Auto-Speak Toggle + Stop Audio Button */}
            <div className="w-full flex items-center justify-between pt-2 border-t border-[#172B5A] text-xs">
              <label className="inline-flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={autoSpeak}
                  onChange={(e) => setAutoSpeak(e.target.checked)}
                  className="rounded border-slate-600 text-[#00D2FF]"
                />
                <span>Auto-speak AI replies</span>
              </label>

              {isSpeaking && (
                <button
                  type="button"
                  onClick={stopSpeaking}
                  className="inline-flex items-center gap-1 rounded-lg bg-rose-500/20 border border-rose-400/40 px-2.5 py-1 text-[11px] font-bold text-rose-200"
                >
                  <VolumeX className="h-3.5 w-3.5" />
                  <span>Stop Audio</span>
                </button>
              )}
            </div>
          </div>

          {/* Right Conversation Stream & Quick Prompts (7 Cols) */}
          <div className="lg:col-span-7 rounded-xl border border-[#1E366D] bg-[#081026] p-4 flex flex-col justify-between gap-3">
            {/* Quick Starter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              <Languages className="h-3.5 w-3.5 text-[#00D2FF] shrink-0 mr-1" />
              {(voiceLang === 'bn-BD'
                ? [
                    'ফ্রিল্যান্সিং ও AI দিয়ে কীভাবে আয় করা যায়?',
                    'একটি ইউটিউব ভিডিওর জন্য ভাইরাল স্ক্রিপ্ট লিখে দাও',
                    'Falylio Yara-তে কী কী টুল আছে?',
                  ]
                : [
                    'How can I grow a digital brand using AI tools?',
                    'Write a high-converting landing page headline',
                    'Explain Next.js 15 App Router in simple words',
                  ]
              ).map((sample) => (
                <button
                  key={sample}
                  type="button"
                  onClick={() => void submitVoiceQuery(sample)}
                  className="px-2.5 py-1 rounded-lg bg-[#102046] border border-[#223E7E] hover:border-[#00D2FF] text-[11px] font-semibold text-slate-200 whitespace-nowrap transition-colors"
                >
                  {sample}
                </button>
              ))}
            </div>

            {/* Voice Conversation Stream */}
            <div className="h-[260px] overflow-y-auto space-y-2.5 pr-1">
              {voiceHistory.map((turn) => (
                <div
                  key={turn.id}
                  className={`rounded-xl border p-3 space-y-1.5 ${
                    turn.role === 'assistant'
                      ? 'border-[#234287] bg-[#0D1B3D]'
                      : 'border-[#00D2FF]/45 bg-[#112654]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold text-[#00D2FF] flex items-center gap-1.5">
                      {turn.role === 'assistant' ? (
                        <>
                          <Bot className="h-3.5 w-3.5" />
                          <span>Yara Voice AI</span>
                        </>
                      ) : (
                        <span>You ({turn.lang === 'bn-BD' ? 'বাংলা' : 'EN'})</span>
                      )}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => void speakTextAloud(turn.text, turn.lang)}
                        className="inline-flex items-center gap-1 rounded-lg bg-white/10 hover:bg-white/20 px-2 py-0.5 text-[10px] font-bold text-white"
                        title="Listen aloud"
                      >
                        <Volume2 className="h-3 w-3 text-[#00D2FF]" />
                        <span>Listen</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(turn.text);
                          setCopiedId(turn.id);
                          setTimeout(() => setCopiedId(null), 2000);
                        }}
                        className="p-1 rounded-lg bg-white/5 hover:bg-white/15 text-slate-300"
                        title="Copy text"
                      >
                        {copiedId === turn.id ? (
                          <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-slate-100 leading-relaxed whitespace-pre-wrap">
                    {turn.text}
                  </p>
                </div>
              ))}
              {voiceLoading && (
                <div className="rounded-xl border border-[#234287] bg-[#0D1B3D] p-3 text-xs text-[#00D2FF] flex items-center gap-2">
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  <span>
                    {voiceLang === 'bn-BD'
                      ? 'Yara AI উত্তর তৈরি করছে...'
                      : 'Yara AI is thinking...'}
                  </span>
                </div>
              )}
            </div>

            {/* Text/Voice Input Composer */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void submitVoiceQuery(voiceInput);
              }}
              className="flex items-center gap-2 pt-1"
            >
              <input
                type="text"
                value={voiceInput}
                onChange={(e) => setVoiceInput(e.target.value)}
                placeholder={
                  voiceLang === 'bn-BD'
                    ? 'বাংলায় প্রশ্ন লিখুন অথবা মাইক্রোফোনে বলুন...'
                    : 'Type or speak your question in English...'
                }
                aria-label="Ask Yara Voice AI"
                className="flex-1 h-10 rounded-xl bg-[#0D1938] border border-[#244282] px-3.5 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:border-[#00D2FF]"
              />
              <button
                type="submit"
                disabled={voiceLoading || !voiceInput.trim()}
                className="h-10 px-4 rounded-xl bg-gradient-to-r from-[#00A8FF] to-[#0055FF] text-xs font-extrabold text-white disabled:opacity-50 inline-flex items-center gap-1.5"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Ask</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
