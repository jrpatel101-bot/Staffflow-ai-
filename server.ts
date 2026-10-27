import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

// Increase payload limit for audio base64 strings
app.use(express.json({ limit: '50mb' }));

// Helper to initialize Gemini Client
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing from environment variables.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// Healthcheck endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'StaffFlow AI Studio Backend', timestamp: new Date().toISOString() });
});

// Transcribe API endpoint
app.post('/api/transcribe', async (req, res) => {
  try {
    const { audioBase64, mimeType, instrument, pianoCoverLevel, tempo, keySignature } = req.body;

    if (!audioBase64) {
      return res.status(400).json({ error: "No audio data provided" });
    }

    const ai = getGeminiClient();

    const systemPrompt = `You are StaffFlow AI, a premier audio-to-music transcription engine and professional musicologist.
Your task is to analyze the audio recording (instrumental melody, song snippet, piano cover, acoustic tune, or vocal performance) and transcribe it into precise, structured musical note data for digital audio workstation rendering and sheet music generation.

CRITICAL INSTRUCTIONS:
1. Detect the key signature (e.g. "C Major", "A Minor", "G Major", "F Major", "D Minor", etc.).
2. Detect the time signature (e.g. "4/4", "3/4", "6/8").
3. Determine estimated Tempo (BPM, range 60-200).
4. Provide a title or auto-generated title for the piece.
5. Provide a list of transcribed musical notes in chronological order.
   Each note MUST contain:
   - pitch: Standard note name with octave (e.g. "C4", "E4", "G4", "B4", "A3", "F#4", "Bb3")
   - midiNote: Integer standard MIDI note number (e.g., C4=60, C#4=61, D4=62, E4=64, F4=65, G4=67, A4=69, B4=71, C5=72)
   - startTime: Offset in seconds from start of audio (e.g., 0.0, 0.5, 1.0, 1.5, etc.)
   - duration: Duration in seconds (e.g., 0.5 for eighth note, 1.0 for quarter note, 2.0 for half note)
   - velocity: Midi velocity dynamics (0 to 127)
   - track: Selected instrument track name ("${instrument || 'Piano'}")
   - hand: "RH" (Treble Clef / Right Hand) or "LH" (Bass Clef / Left Hand) when applicable for Piano Cover mode (${pianoCoverLevel || 'Intermediate'})
6. Provide chord progressions if identifiable (e.g. "C", "G", "Am", "F").
7. Ensure clean, musically coherent pitch sequences.`;

    const promptText = `Transcribe this audio recording into musical notation and MIDI data. Target Instrument: ${instrument || 'Piano'}. Arrangement Level: ${pianoCoverLevel || 'Intermediate'}. Preferred Tempo: ${tempo || 120} BPM. Key Hint: ${keySignature || 'Auto-detect'}. Return complete notes JSON array.`;

    // Clean mimeType (remove parameters like ;codecs=)
    const cleanMimeType = (mimeType || 'audio/wav').split(';')[0];

    const response = await ai.models.generateContent({
      model: "gemini-3.5-transcribe",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: cleanMimeType,
              data: audioBase64,
            },
          },
          { text: promptText },
        ],
      },
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.2,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            keySignature: { type: Type.STRING },
            timeSignature: { type: Type.STRING },
            bpm: { type: Type.NUMBER },
            clef: { type: Type.STRING },
            confidenceScore: { type: Type.NUMBER },
            summary: { type: Type.STRING },
            notes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  pitch: { type: Type.STRING },
                  midiNote: { type: Type.NUMBER },
                  startTime: { type: Type.NUMBER },
                  duration: { type: Type.NUMBER },
                  velocity: { type: Type.NUMBER },
                  track: { type: Type.STRING },
                  hand: { type: Type.STRING },
                },
                required: ["pitch", "midiNote", "startTime", "duration"],
              },
            },
            chords: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  timestamp: { type: Type.NUMBER },
                },
              },
            },
          },
          required: ["title", "keySignature", "timeSignature", "bpm", "notes"],
        },
      },
    });

    const jsonText = response.text;
    if (!jsonText) {
      throw new Error("No transcription output returned by AI model.");
    }

    const transcription = JSON.parse(jsonText);
    res.json({ success: true, transcription });

  } catch (error: any) {
    console.error("Transcription error on server:", error);
    res.status(500).json({ error: error.message || "Failed to transcribe audio." });
  }
});

// Start Server with Vite Middleware
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });
    app.use(vite.middlewares);
    app.use('*', async (req, res, next) => {
      if (req.originalUrl.startsWith('/api')) return next();
      try {
        const url = req.originalUrl;
        const html = `<!doctype html>
<html lang="en" class="dark">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>StaffFlow AI — Music Transcription & DAW Studio</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  </head>
  <body class="bg-[#09090F] text-slate-100 antialiased selection:bg-violet-500/30 selection:text-violet-200 font-sans">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`;
        const template = await vite.transformIndexHtml(url, html);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e: any) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  } else {
    app.use(express.static('dist'));
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`StaffFlow AI Server running at http://localhost:${PORT}`);
  });
}

startServer();
