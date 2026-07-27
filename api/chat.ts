import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS headers for Vercel deployment
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, userPreferences, province } = req.body || {};

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const ai = getAIClient();

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

    return res.status(200).json({ text: replyText });
  } catch (error: any) {
    console.error('Gemini API Error on Vercel:', error);
    return res.status(500).json({
      error: 'Failed to process AI travel query',
      details: error.message || String(error)
    });
  }
}
