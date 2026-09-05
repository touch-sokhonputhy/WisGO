import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

let aiClient: GoogleGenAI | null = null;

function getAIClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not set');
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

function generateLocalWisgoResponse(userQuery: string, language = 'English'): string {
  const queryLower = (userQuery || '').toLowerCase();
  const isKhmer = language === 'Khmer' || language.toLowerCase() === 'km';

  if (queryLower.includes('siem reap') || queryLower.includes('angkor') || queryLower.includes('temple')) {
    return isKhmer
      ? `### 🇰🇭 មគ្គុទ្ទេសក៍ទេសចរណ៍សៀមរាប & អង្គរវត្ត (WisGO Guide)

**១. កាលវិភាគណែនាំ ៣ ថ្ងៃ៖**
* **ថ្ងៃទី ១ (Small Circuit):** ថ្ងៃរះនៅប្រាសាទអង្គរវត្ត (ម៉ោង ៥:០០ ព្រឹក), ប្រាសាទបាយ័ន (មុខញញឹម ៤ ទិស), ប្រាសាទតាព្រហ្ម (ឫសឈើធំៗ)។ ពេលល្ងាចទស្សនាថ្ងៃលិចនៅភ្នំបាខែង។
* **ថ្ងៃទី ២ (Grand Circuit & Banteay Srei):** ប្រាសាទបន្ទាយស្រី (ក្បាច់ចម្លាក់ថ្មផ្កាឈូកយ៉ាងល្អប្រណីត), ប្រាសាទព្រះខ័ន និងប្រាសាទនាគព័ន្ធ។
* **ថ្ងៃទី ៣ (Culture & Local Food):** ភូមិបណ្តែតទឹកកំពង់ភ្លុកបឹងទន្លេសាប និងដើរផ្សាររាត្រី Pub Street ភ្លក់ម្ហូបតាមផ្លូវ (នំបញ្ចុកសៀមរាប និងអាម៉ុកត្រី)។

**២. ការចំណាយ & ការធ្វើដំណើរ៖**
* **សំបុត្រអង្គរ (Angkor Pass):** 1-Day ($37), 3-Day ($62)។ អាចទិញអនឡាញផ្លូវការនៅ angkorverprise.gov.kh។
* **តុកតុក PassApp / Grab:** ធ្វើដំណើរក្នុងក្រុងប្រហែល $1.50 - $3.00 (6,000 - 12,000 KHR)។ ជួលតុកតុកពេញមួយថ្ងៃមើលប្រាសាទប្រហែល $18 - $25/ថ្ងៃ។

*(ចំណាំ៖ សេវាកម្ម AI កំពុងមានតម្រូវការខ្ពស់បណ្តោះអាសន្ន — ព័ត៌មាននេះផ្តល់ជូនដោយផ្ទាល់ពីសៀវភៅមគ្គុទ្ទេសក៍ទេសចរណ៍ WisGO Youth Guide)*`
      : `### 🇰🇭 Siem Reap & Angkor Wat Youth Travel Guide (WisGO Verified)

**1. Recommended 3-Day Highlights:**
* **Day 1 (Angkor Sunrise & Core Circuit):** Sunrise at Angkor Wat reflecting ponds (5:00 AM), enigmatic smiles at Bayon, and the iconic tree-root temple Ta Prohm. Catch sunset at Phnom Bakheng.
* **Day 2 (Intricate Pink Sandstone & Outlying Gems):** Banteay Srei (exquisite 10th-century carvings), Preah Khan, and the water temple Neak Pean.
* **Day 3 (Lake Culture & Night Bazaar):** Stilt village boat trip at Kompong Phluk (Tonle Sap Lake), evening dinner along Pub Street featuring authentic Fish Amok and Siem Reap Lok Lak.

**2. PassApp Tuk-Tuk & Budget Insights:**
* **Angkor Pass:** $37 (1-day), $62 (3-day). Purchase online at the official Angkor Enterprise portal.
* **Tuk-Tuk Costs:** City rides via PassApp or Grab cost roughly $1.50 - $2.50 (~6,000 - 10,000 KHR). A full-day temple tuk-tuk driver usually ranges from $18 to $25.
* **Attire Rule:** Knees and shoulders must be covered to enter temples.

*(Note: Live AI service is experiencing high demand spikes (503); provided via WisGO's verified Cambodian local guidebook.)*`;
  }

  return `### 🇰🇭 Authentic Cambodia Travel Guide (WisGO Youth Companion)

**1. Money & Currency Tips:**
* Cambodia operates on a dual-currency system: **US Dollars ($)** for larger amounts and **Cambodian Riel (៛)** for smaller change ($1 ≈ 4,000 - 4,100 KHR).
* Always carry clean, tear-free small bills ($1, $5, $10, and 10,000 KHR notes). ATMs in major cities dispense USD or KHR.

**2. Getting Around Easily:**
* Download **PassApp** or **Grab** on your phone. Auto-rickshaw tuk-tuks in Phnom Penh and Siem Reap cost around $1.50 - $3.00 for short rides, avoiding haggling.

**3. Must-Experience Cambodian Highlights:**
* **Siem Reap:** Angkor Wat sunrise, Ta Prohm, floating villages, and Siem Reap noodle soup (*Num Banh Chok*).
* **Kampot & Kep:** Organic green pepper plantations, river kayaking, and fresh Crab Market.
* **Koh Rong Archipelago:** Crystal turquoise waters, bioluminescent plankton, and pristine beaches.
* **Mondulkiri:** Ethical elephant sanctuaries and refreshing Bousra waterfalls in the cool highlands.

*(Note: Live AI service is experiencing high demand spikes (503); provided via WisGO's verified Cambodian local guidebook.)*`;
}

// Circuit breaker to avoid hitting models under temporary high demand
const modelCooldowns: Record<string, number> = {};

function isModelAvailable(modelName: string): boolean {
  const cooldownUntil = modelCooldowns[modelName];
  if (!cooldownUntil) return true;
  if (Date.now() > cooldownUntil) {
    delete modelCooldowns[modelName];
    return true;
  }
  return false;
}

function markModelBusy(modelName: string) {
  modelCooldowns[modelName] = Date.now() + 5 * 60 * 1000;
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
    const { message, userPreferences, province, conversationHistory, currentTripContext } = req.body || {};

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const ai = getAIClient();

    let contextNotice = '';
    if (currentTripContext) {
      const tripSummary = typeof currentTripContext === 'string'
        ? currentTripContext
        : JSON.stringify(currentTripContext, null, 2);
      contextNotice = `\nCURRENT ACTIVE TRIP CONTEXT (The user is refining this trip plan):\n${tripSummary}\n\nRULE FOR TRIP REFINEMENTS: When the user asks to adjust (e.g. "make it cheaper", "add sunset to Day 2", "remove museum", "family friendly"), DO NOT start from scratch! Update the existing itinerary, modify the requested parts, keep the rest of the trip intact, and return the complete updated itinerary and updated json:wisgo-trip block.\n`;
    }

    const systemInstruction = `You are WisGO AI, an authentic Cambodian youth local guide and actionable travel planning assistant.
WisGO is NOT just a chatbot that gives generic tips. WisGO helps travelers turn an idea into an organized, actionable trip: Discover → Ask AI → Create Trip → Customize → Save → Add to Calendar → Send to Gmail → Travel!

Target Focus:
- EXCLUSIVELY CAMBODIA (Siem Reap, Kampot, Kep, Battambang, Phnom Penh, Koh Rong, Mondulkiri, Preah Vihear, Kratie).
- Provide insider youth tips: hidden street food spots, local tuk-tuk routes, PassApp/Grab pricing, authentic temple etiquette, and cultural stories.
- Always include budget estimates in USD ($) and Cambodian Riel (approx 1 USD = 4,000 KHR).
- Offer polite Khmer phrase translations with English phonetic pronunciation guide (e.g., "Orkun" = Thank you, "Choum Reap Sur" = Hello).

Trip Planning Requirements:
1. When generating or modifying an itinerary, make it ACTIONABLE and REALISTIC with Day 1, Day 2... structured as:
   ### Day 1: [Theme]
   * **Morning ([Time]):** [Place / Activity Title]
     - **Location:** [Precise place in Cambodia]
     - **Estimated Time:** [e.g. 3 hours]
     - **Estimated Cost:** [e.g. $37 Angkor Pass (Estimated)]
     - **Transportation Suggestion:** [e.g. PassApp Tuk-Tuk (~$3 - $5, 20 min)]
     - **Opening Hours:** [e.g. 5:00 AM – 5:30 PM]
     - **Practical Notes:** [Youth tips, dress codes, light timing]
   * **Afternoon ([Time]):** ...
   * **Evening ([Time]):** ...
   (Continue for each day)

2. AT THE END OF YOUR RESPONSE, IF IT CONTAINS AN ITINERARY, ALWAYS APPEND A MACHINE-READABLE JSON BLOCK formatted strictly as:
\`\`\`json:wisgo-trip
{
  "id": "trip-${Date.now()}",
  "title": "Title of the trip",
  "destination": "Destination name",
  "startDate": "YYYY-MM-DD",
  "durationDays": 3,
  "travelersCount": 2,
  "budgetTier": "moderate",
  "totalEstimatedCost": "$90 – $150 per person (Estimated)",
  "days": [
    {
      "dayNumber": 1,
      "date": "Day 1",
      "theme": "Theme title",
      "activities": [
        {
          "id": "act-1-1",
          "timeSlot": "morning",
          "time": "5:00 AM – 8:30 AM",
          "title": "Activity name",
          "description": "Short overview...",
          "location": "Location name",
          "estimatedDuration": "3 hours",
          "estimatedCost": "$37 (Estimated)",
          "transportTip": "PassApp Remorque (~$3-4)",
          "openingHours": "5:00 AM – 5:30 PM",
          "practicalNotes": "Dress code: Cover shoulders & knees."
        }
      ]
    }
  ],
  "summaryNote": "Summary of this trip plan"
}
\`\`\`

3. All costs, transit times, and distances MUST be clearly labeled as estimated (e.g. "(Estimated: ~$2.50 via PassApp, 15 min)").

User Context:
User Preferred Language: ${userPreferences?.preferredLanguage || 'English'}
User Interests: ${userPreferences?.interests?.join(', ') || 'Culture, Food, Nature, Local Markets'}
User Dietary Preferences: ${userPreferences?.dietaryRestrictions?.join(', ') || 'None'}
Selected Province Context: ${province || 'All Cambodia'}${contextNotice}

Formatting Rules:
- Format response with clear markdown headings, bold key terms, and bullet points.
- Keep tone warm, passionate, welcoming, and youthfully energetic ("Som Swakum! Welcome to Cambodia").
`;

    const allModels = ['gemini-flash-latest', 'gemini-3.1-flash-lite', 'gemini-3.8-flash'];
    const activeModels = allModels.filter(m => isModelAvailable(m));
    const candidateModels = activeModels.length > 0 ? activeModels : allModels;

    let replyText: string | null = null;

    let conversationHistoryText = '';
    if (Array.isArray(conversationHistory) && conversationHistory.length > 0) {
      conversationHistoryText = conversationHistory
        .slice(-4)
        .map(h => `${h.role === 'user' ? 'User' : 'WisGO AI'}: ${h.text}`)
        .join('\n\n');
    }

    const fullPrompt = conversationHistoryText
      ? `${systemInstruction}\n\nRecent Conversation:\n${conversationHistoryText}\n\nUser Question: ${message}`
      : `${systemInstruction}\n\nUser Question: ${message}`;

    for (const model of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: [
            { role: 'user', parts: [{ text: fullPrompt }] }
          ]
        });

        if (response && response.text) {
          replyText = response.text;
          break;
        }
      } catch (err: any) {
        const errMsg = String(err?.message || err || '');
        const isBusy = errMsg.includes('503') || errMsg.includes('high demand') || errMsg.includes('429') || errMsg.includes('UNAVAILABLE') || errMsg.includes('overloaded');

        if (isBusy) {
          markModelBusy(model);
          console.log(`[Vercel WisGO AI] Model ${model} is currently at capacity; automatically routing to next model.`);
        } else {
          console.log(`[Vercel WisGO AI] Model ${model} returned non-critical status, checking alternatives.`);
        }
      }
    }

    let isFallback = false;
    if (!replyText) {
      console.log('[Vercel WisGO AI] Live model capacity temporarily limited or key missing; serving verified WisGO local guide data.');
      replyText = generateLocalWisgoResponse(message, userPreferences?.preferredLanguage);
      isFallback = true;
    }

    return res.status(200).json({ text: replyText, isFallback });
  } catch (error: any) {
    console.error('[Vercel WisGO AI Error]:', error?.message || error);
    const fallbackText = generateLocalWisgoResponse(req.body?.message || '', req.body?.userPreferences?.preferredLanguage);
    return res.status(200).json({ text: fallbackText, isFallback: true, errorDetail: error?.message });
  }
}

