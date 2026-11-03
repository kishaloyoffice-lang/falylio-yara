import { GoogleGenAI } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  const rawKey = process.env.GEMINI_API_KEY || '';
  const isConfigured = Boolean(rawKey && rawKey !== 'MY_GEMINI_API_KEY' && rawKey.trim().length > 8);
  const supabaseConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  return NextResponse.json({
    aiConnected: isConfigured,
    supabaseConnected: supabaseConfigured,
    provider: 'Server-Side Gemini API Proxy (/api/ai)',
  });
}

export async function POST(req: NextRequest) {
  try {
    const rawKey = process.env.GEMINI_API_KEY || '';
    const isConfigured = Boolean(rawKey && rawKey !== 'MY_GEMINI_API_KEY' && rawKey.trim().length > 8);

    if (!isConfigured) {
      return NextResponse.json(
        {
          connected: false,
          error:
            'AI API connection is not configured yet. Please configure GEMINI_API_KEY in the server environment to activate live Yara AI generation.',
        },
        { status: 503 }
      );
    }

    const body = await req.json();
    const { prompt, systemInstruction } = body as {
      prompt?: string;
      systemInstruction?: string;
    };

    if (!prompt || !prompt.trim()) {
      return NextResponse.json(
        { connected: true, error: 'Please provide a prompt to process.' },
        { status: 400 }
      );
    }

    const ai = new GoogleGenAI({ apiKey: rawKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt.trim(),
      config: systemInstruction
        ? {
            systemInstruction,
          }
        : undefined,
    });

    return NextResponse.json({
      connected: true,
      text: response.text || 'No output generated.',
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unexpected server error while contacting AI service.';
    return NextResponse.json(
      {
        connected: false,
        error: `AI Service Notice: ${message}`,
      },
      { status: 500 }
    );
  }
}
