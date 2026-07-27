import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialize Gemini client
let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not set');
    }
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

// API Route for Gemini AI Travel Assistant
app.post('/api/chat', async (req, res) => {
  try {
    const { message, userPreferences, province } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const ai = getAIClient();

    // System prompt for WisGO - Cambodian Youth Local Travel Assistant
    const systemInstruction = `You are WisGO AI, an authentic Cambodian youth local guide and travel companion.
WisGO is a youth-led local travel platform in Cambodia, connecting travelers, exchange students, and tourists with genuine Khmer experiences.

Target Focus:
- EXCLUSIVELY CAMBODIA (Siem Reap, Kampot, Kep, Battambang, Phnom Penh, Koh Rong, Mondulkiri, Preah Vihear, Kratie).
- Provide insider youth tips: hidden street food spots, local tuk-tuk routes, PassApp/Grab pricing, authentic temple etiquette, and cultural stories.
- Always include budget estimates in USD ($) and Cambodian Riel (approx 1 USD = 4,000 KHR).
- Offer polite Khmer phrase translations with English phonetic pronunciation guide (e.g., "Orkun" = Thank you, "Choum Reap Sur" = Hello).

User Context:
User Preferred Language: ${userPreferences?.preferredLanguage || 'English'}
User Interests: ${userPreferences?.interests?.join(', ') || 'Culture, Food, Nature, Local Markets'}
User Dietary Preferences: ${userPreferences?.dietaryRestrictions?.join(', ') || 'None'}
Selected Province Context: ${province || 'All Cambodia'}

Formatting Rules:
- Format response with clear markdown headings, bold key terms, and bullet points.
- Keep tone warm, passionate, welcoming, and youthfully energetic ("Som Swakum! Welcome to Cambodia").
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: [
        { role: 'user', parts: [{ text: `${systemInstruction}\n\nUser Question: ${message}` }] }
      ]
    });

    const replyText = response.text || "Orkun! I couldn't generate a recommendation right now. Please try again in a moment!";

    return res.json({ text: replyText });
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    return res.status(500).json({
      error: 'Failed to process AI travel query',
      details: error.message || String(error)
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`WisGO Cambodia Server running on http://localhost:${PORT}`);
  });
}

startServer();
