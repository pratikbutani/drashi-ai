import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// High body limit for base64 images and video frames
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Shared Gemini client with telemetry header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

interface VisionAnalysisRequest {
  image?: string; // base64 data url or raw base64
  images?: string[]; // multiple frames if video sequence
  videoData?: {
    base64: string;
    mimeType: string;
  };
  language: 'hi' | 'gu' | 'en';
  mode?: 'general' | 'text_ocr' | 'currency' | 'objects_colors' | 'question';
  userQuestion?: string;
  isContinuous?: boolean;
}

// Language names and specific instruction descriptors
const LANG_MAP: Record<'hi' | 'gu' | 'en', { name: string; scriptName: string; instructions: string }> = {
  hi: {
    name: 'Hindi (हिन्दी)',
    scriptName: 'Devanagari Hindi',
    instructions:
      'CRITICAL: You MUST respond entirely in clear, polite, natural spoken Hindi (हिन्दी भाषा). Use pure Devanagari script. Ensure the explanation is conversational, helpful, and easily understood when read aloud by text-to-speech for a visually impaired user.',
  },
  gu: {
    name: 'Gujarati (ગુજરાતી)',
    scriptName: 'Gujarati',
    instructions:
      'CRITICAL: You MUST respond entirely in clear, polite, natural spoken Gujarati (ગુજરાતી ભાષા). Use authentic Gujarati script. Ensure the explanation is conversational, helpful, and easily understood when read aloud by text-to-speech for a visually impaired user.',
  },
  en: {
    name: 'English',
    scriptName: 'English',
    instructions:
      'CRITICAL: You MUST respond entirely in clear, concise, empathetic spoken English. Ensure the tone is calm, highly descriptive, and optimized for text-to-speech for a blind or visually impaired listener.',
  },
};

// Vision analysis endpoint
app.post('/api/analyze-vision', async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      image,
      images,
      videoData,
      language = 'en',
      mode = 'general',
      userQuestion,
      isContinuous = false,
    } = req.body as VisionAnalysisRequest;

    const langConfig = LANG_MAP[language] || LANG_MAP.en;

    const parts: any[] = [];

    // Helper to strip data URL prefix if present
    const cleanBase64 = (str: string) => {
      if (str.includes(',')) {
        return str.split(',')[1];
      }
      return str;
    };

    const getMimeType = (str: string, fallback = 'image/jpeg') => {
      if (str.startsWith('data:')) {
        const matches = str.match(/^data:([^;]+);base64,/);
        if (matches && matches[1]) {
          return matches[1];
        }
      }
      return fallback;
    };

    // Add video if provided
    if (videoData && videoData.base64) {
      parts.push({
        inlineData: {
          mimeType: videoData.mimeType || 'video/mp4',
          data: cleanBase64(videoData.base64),
        },
      });
    }

    // Add multiple frames or single image
    if (images && Array.isArray(images) && images.length > 0) {
      images.forEach((imgStr, idx) => {
        parts.push({
          inlineData: {
            mimeType: getMimeType(imgStr, 'image/jpeg'),
            data: cleanBase64(imgStr),
          },
        });
      });
    } else if (image) {
      parts.push({
        inlineData: {
          mimeType: getMimeType(image, 'image/jpeg'),
          data: cleanBase64(image),
        },
      });
    }

    if (parts.length === 0) {
      res.status(400).json({ error: 'No image or video provided for analysis.' });
      return;
    }

    // Build assistive prompt tailored to user's selected mode & assistive requirements
    let promptGoal = '';
    switch (mode) {
      case 'text_ocr':
        promptGoal =
          'Focus primarily on reading all legible text, signs, labels, documents, packaging, medicine names, dates, or prices in the scene. State exact text and explain what it is.';
        break;
      case 'currency':
        promptGoal =
          'Focus on identifying any banknotes, currency notes, coins, or payment cards. Identify denomination (e.g. ₹500, ₹100, $20), currency type, and authenticity features visible.';
        break;
      case 'objects_colors':
        promptGoal =
          'Focus on identifying objects, items, their colors, textures, and relative positions using clock positions (e.g., 2 o\'clock, 10 o\'clock) and distances.';
        break;
      case 'question':
        promptGoal = `The user specifically asks: "${userQuestion || 'What is in front of me?'}". Answer their question directly and thoroughly based on the visual information.`;
        break;
      case 'general':
      default:
        promptGoal =
          'Give a complete, rich spatial and scene analysis: immediate walking safety, obstacles, steps, doorways, presence of people, and key objects.';
        break;
    }

    const systemInstruction = `You are Drishti AI, an expert, compassionate visual assistant for blind and visually impaired people.
Your primary role is to be their eyes and explain the visual world with utmost clarity, safety awareness, spatial precision, and empathy.

LANGUAGE REQUIREMENT:
${langConfig.instructions}
All text fields in your response MUST be in ${langConfig.name}. Do NOT mix other languages except for brand names, numbers, or standard universal terms.

ASSISTIVE VISION PRINCIPLES:
1. SAFETY & HAZARDS FIRST: Alert immediately to any steps (up or down), uneven ground, floor obstacles, low hanging items, open doors, hot items, wet surfaces, or traffic.
2. SPATIAL ACCURACY: Describe object locations using clock positions relative to the user ("at your 12 o'clock", "on your right at 2 o'clock", "near your hand") and estimated distances (e.g. "about 1 meter away", "within arm's reach").
3. CONVERSATIONAL SPEECH SCRIPT: Provide a "speechScript" field that sounds completely natural when read by a Text-To-Speech engine. Avoid markdown asterisks (*, **, #) in the speechScript.
4. PEOPLE & SOCIAL CONTEXT: If people are visible, mention how many, their rough position, and visible facial expressions or activities (e.g., "A person sitting at the table smiling").
5. CONTINUOUS / STREAMING CONTEXT: ${isContinuous ? 'This is continuous mode. Keep the speechScript concise (1-2 sentences) highlighting changes or immediate navigational cues.' : 'Provide a comprehensive yet scannable breakdown.'}

MODE OBJECTIVE:
${promptGoal}`;

    parts.push({
      text: `Analyze the provided image/video and return a structured JSON response describing everything for a visually impaired user. Language must be strictly ${langConfig.name}.`,
    });

    // Fallback models in case of 503 or temporary capacity spikes
    const candidateModels = ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];
    let lastError: any = null;
    let textOutput: string | undefined;

    for (const modelName of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: { parts },
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                headline: {
                  type: Type.STRING,
                  description: 'One crisp summary sentence of the scene in the selected language.',
                },
                speechScript: {
                  type: Type.STRING,
                  description:
                    'The full spoken narrative script in the selected language, designed to be read out loud smoothly via Text-To-Speech without formatting artifacts.',
                },
                safetyLevel: {
                  type: Type.STRING,
                  description: 'One of: "safe", "caution", "danger"',
                },
                hazardsAndObstacles: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'List of immediate hazards, tripping risks, steps, or obstacles.',
                },
                spatialLayout: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      position: { type: Type.STRING, description: 'e.g. 12 o\'clock, 9 o\'clock, center, floor' },
                      item: { type: Type.STRING, description: 'Name and description of object/person' },
                      distance: { type: Type.STRING, description: 'Estimated distance, e.g. within reach, 2 meters' },
                    },
                    required: ['position', 'item'],
                  },
                  description: 'Spatial map of items and people.',
                },
                detectedText: {
                  type: Type.STRING,
                  description: 'Any readable text, signboards, labels, or numbers found in the scene (or empty string if none).',
                },
                detectedCurrency: {
                  type: Type.STRING,
                  description: 'Details of any currency, banknote denominations, or payment cards recognized (or empty string if none).',
                },
                suggestedAction: {
                  type: Type.STRING,
                  description: 'Direct assistive navigation or action advice for the user in the selected language.',
                },
              },
              required: ['headline', 'speechScript', 'safetyLevel', 'hazardsAndObstacles', 'suggestedAction'],
            },
          },
        });

        textOutput = response.text;
        if (textOutput) break;
      } catch (err: any) {
        lastError = err;
        console.warn(`Model ${modelName} returned error, trying next candidate:`, err.message || err);
      }
    }

    if (!textOutput) {
      throw lastError || new Error('Empty response received from vision model');
    }

    const parsedData = JSON.parse(textOutput);
    res.json({
      success: true,
      language,
      mode,
      analysis: parsedData,
    });
  } catch (error: any) {
    console.error('Vision analysis error:', error);
    res.status(500).json({
      success: false,
      error: error?.message || 'Failed to analyze vision feed.',
    });
  }
});

// Audio Speech Generation endpoint using gemini-3.8-flash-lite-tts
app.post('/api/tts', async (req: Request, res: Response): Promise<void> => {
  try {
    const { text, language = 'en' } = req.body;
    if (!text || typeof text !== 'string') {
      res.status(400).json({ error: 'Text is required for speech synthesis' });
      return;
    }

    // Clean text of markdown symbols that might interfere with audio
    const sanitizedText = text
      .replace(/[*#_`~]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    // Select suitable voice
    let voiceName = 'Kore';
    if (language === 'hi' || language === 'gu') {
      voiceName = 'Kore'; // Clear, warm voice
    }

    const ttsResponse = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: sanitizedText,
              speechMetadata: {
                style: 'Clear, empathetic, natural assistive narrator speaking at comfortable pace',
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName },
          },
        },
      },
    });

    const base64Audio = ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      res.status(500).json({ error: 'Could not generate audio stream' });
      return;
    }

    res.json({
      success: true,
      audioData: base64Audio,
      mimeType: 'audio/wav',
    });
  } catch (error: any) {
    console.error('TTS generation error:', error);
    res.status(500).json({
      success: false,
      error: error?.message || 'Speech synthesis failed',
    });
  }
});

// Vite middleware mounting for dev mode or static serving for production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Drishti AI server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
