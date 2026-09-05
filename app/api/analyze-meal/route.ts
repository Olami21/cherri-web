// app/api/analyze-meal/route.ts
//
// Receives a base64 photo from the client, sends it to Google Gemini's
// vision capability constrained to the actual dish names in the `foods`
// table, and returns a best-guess match + confidence for the user to
// confirm. Never writes to the database itself — the client does that
// only after the user confirms.

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;
const GEMINI_MODEL = 'gemini-2.0-flash';

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, mimeType } = await req.json();

    if (!imageBase64 || !mimeType) {
      return NextResponse.json({ error: 'Missing image data.' }, { status: 400 });
    }

    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Server is not configured for meal scanning yet.' },
        { status: 500 }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const { data: foods, error: foodsError } = await supabase
      .from('foods')
      .select('name')
      .order('name');

    if (foodsError || !foods) {
      return NextResponse.json({ error: 'Could not load the food list.' }, { status: 500 });
    }

    const foodNames = foods.map((f) => f.name);

    const prompt = `You are helping identify a Nigerian meal from a photo for a nutrition tracking app.

Here is the exact list of dishes recognized by this app:
${foodNames.map((n) => `- ${n}`).join('\n')}

Look at the photo and decide which single dish from the list above it most closely matches. If nothing on the list is a reasonable match, say so honestly rather than forcing a guess.

Respond with ONLY valid JSON, no other text, no markdown code fences, in this exact shape:
{"match": "<exact name from the list above, or null>", "confidence": <integer 0-100>, "notes": "<one short sentence describing what you see in the photo>"}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { inline_data: { mime_type: mimeType, data: imageBase64 } },
                { text: prompt },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 300,
          },
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error('Gemini API error:', errText);
      return NextResponse.json(
        { error: 'Meal analysis failed. Please try again.' },
        { status: 502 }
      );
    }

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

    let parsed: { match: string | null; confidence: number; notes: string };
    try {
      const cleaned = rawText.replace(/```json|```/g, '').trim();
      parsed = JSON.parse(cleaned);
    } catch {
      return NextResponse.json(
        { error: 'Could not understand the analysis result. Please try again.' },
        { status: 502 }
      );
    }

    return NextResponse.json(parsed);
  } catch (err) {
    console.error('analyze-meal error:', err);
    return NextResponse.json(
      { error: 'Something went wrong analyzing the photo.' },
      { status: 500 }
    );
  }
}