import { GoogleGenAI, Type } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';

function getAiClient(apiKey: string) {
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

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
    models: {
      text: 'gemini-3.8-flash',
      tts: 'gemini-3.8-flash-lite-tts',
      transcribe: 'gemini-3.5-transcribe',
    },
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
            'GEMINI_API_KEY is not configured on the server yet. Using interactive Studio Engine fallback.',
        },
        { status: 503 }
      );
    }

    const body = await req.json();
    const {
      mode = 'text',
      prompt,
      systemInstruction,
      language = 'bn-BD',
      voiceName = 'Kore',
      audioBase64,
      audioMimeType = 'audio/webm',
      stylePreset = 'Cyberpunk Neon',
      aspectRatio = '1:1',
    } = body as {
      mode?: 'text' | 'tts' | 'transcribe' | 'image-svg';
      prompt?: string;
      systemInstruction?: string;
      language?: string;
      voiceName?: string;
      audioBase64?: string;
      audioMimeType?: string;
      stylePreset?: string;
      aspectRatio?: '1:1' | '16:9' | '9:16';
    };

    const ai = getAiClient(rawKey);

    // 1. AUDIO TRANSCRIPTION (gemini-3.5-transcribe)
    if (mode === 'transcribe') {
      if (!audioBase64) {
        return NextResponse.json(
          { connected: true, error: 'No audio data provided for transcription.' },
          { status: 400 }
        );
      }
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-transcribe',
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: audioMimeType,
                data: audioBase64,
              },
            },
            {
              text:
                language === 'bn-BD'
                  ? 'Transcribe this speech accurately in Bengali (বাংলা) or English as spoken.'
                  : 'Transcribe this speech accurately.',
            },
          ],
        },
      });
      return NextResponse.json({
        connected: true,
        transcript: response.text || '',
      });
    }

    // 2. TEXT-TO-SPEECH (gemini-3.8-flash-lite-tts)
    if (mode === 'tts') {
      if (!prompt || !prompt.trim()) {
        return NextResponse.json(
          { connected: true, error: 'Please provide text for speech generation.' },
          { status: 400 }
        );
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash-lite-tts',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: prompt.trim().slice(0, 1200),
              },
            ],
          },
        ],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: voiceName || 'Kore',
              },
            },
          },
        },
      });

      const base64Audio =
        response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

      if (!base64Audio) {
        return NextResponse.json(
          { connected: true, error: 'No audio stream returned by TTS model.' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        connected: true,
        audioDataUrl: `data:audio/wav;base64,${base64Audio}`,
      });
    }

    // 3. AI IMAGE / POSTER / LOGO STUDIO (gemini-3.8-flash structured SVG artwork)
    if (mode === 'image-svg') {
      if (!prompt || !prompt.trim()) {
        return NextResponse.json(
          { connected: true, error: 'Please provide an image/poster/logo prompt.' },
          { status: 400 }
        );
      }

      const dimensions =
        aspectRatio === '16:9'
          ? { w: 1280, h: 720 }
          : aspectRatio === '9:16'
          ? { w: 720, h: 1280 }
          : { w: 1024, h: 1024 };

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `Create a breathtaking, ultra-detailed, layered SVG digital illustration / poster / logo for the prompt: "${prompt.trim()}".
Style preset: ${stylePreset}.
Target viewBox: "0 0 ${dimensions.w} ${dimensions.h}" (width="${dimensions.w}" height="${dimensions.h}").
Include rich <defs> with linearGradient, radialGradient, glow filters, geometric/organic layers, lighting effects, and crisp artistic composition.`,
        config: {
          systemInstruction:
            'You are a master digital illustrator and vector artist for Falylio Yara Studio. Return valid, self-contained, richly detailed SVG code in the JSON schema.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: {
                type: Type.STRING,
                description: 'Short artistic title of the generated artwork.',
              },
              caption: {
                type: Type.STRING,
                description: '1-sentence description of the visual design and mood.',
              },
              svgCode: {
                type: Type.STRING,
                description: 'Complete valid <svg xmlns="http://www.w3.org/2000/svg" ...>...</svg> markup.',
              },
              colorPalette: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Array of 4 hex color codes used in the artwork.',
              },
            },
            required: ['title', 'caption', 'svgCode', 'colorPalette'],
          },
        },
      });

      const parsed = JSON.parse((response.text ?? '{}').trim());
      return NextResponse.json({
        connected: true,
        artwork: parsed,
      });
    }

    // 4. STANDARD TEXT / VOICE ASSISTANT RESPONSE (gemini-3.8-flash)
    if (!prompt || !prompt.trim()) {
      return NextResponse.json(
        { connected: true, error: 'Please provide a prompt to process.' },
        { status: 400 }
      );
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
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
    const message =
      err instanceof Error ? err.message : 'Unexpected server error while contacting AI service.';
    return NextResponse.json(
      {
        connected: false,
        error: `AI Service Notice: ${message}`,
      },
      { status: 500 }
    );
  }
}
