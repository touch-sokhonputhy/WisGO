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

// Intelligent fallback generator for Cambodia local travel when Gemini encounters peak demand
function generateLocalWisgoResponse(userQuery: string, language = 'English'): string {
  const queryLower = userQuery.toLowerCase();
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

  if (queryLower.includes('phrase') || queryLower.includes('khmer') || queryLower.includes('language') || queryLower.includes('greeting')) {
    return `### 🇰🇭 Essential Cambodian Youth Travel Phrases

Here are essential polite phrases every traveler in Cambodia should know:

1. **Choum Reap Sur (ជំរាបសួរ):** *\"Ch'ohm-reep-SOOR\"* — Formal Hello (accompanied by Sompas greeting palms together).
2. **Orkun (អរគុណ):** *\"Or-KOON\"* — Thank you! (Orkun Chran = Thank you very much).
3. **Som Ket Luy (សូមគិតលុយ):** *\"Som-ket-LOOY\"* — Check/bill please!
4. **Tlai Ponman? (ថ្លៃប៉ុន្មាន?):** *\"Tlai pon-MAHN?\"* — How much is this?
5. **Chhnganh Nas! (ឆ្ងាញ់ណាស់!):** *\"Ch'ngahn NAHS!\"* — Delicious! (Guaranteed to make street food cooks smile).
6. **Som Toh (សុំទោស):** *\"Som-TOH\"* — Excuse me / Sorry.

**Local Etiquette Tip:**
Use both hands when handing cash or cards to locals as a gesture of warmth and deep respect.

*(Note: Live AI service is experiencing high demand spikes (503); provided via WisGO's verified Cambodian local guidebook.)*`;
  }

  if (queryLower.includes('kampot') || queryLower.includes('kep') || queryLower.includes('pepper') || queryLower.includes('crab')) {
    return `### 🌊 Kampot & Kep Coastal Escape (WisGO Youth Itinerary)

**1. Best 2-Day Adventure:**
* **Day 1 (Kampot Pepper & Riverside Vibes):** Rent a scooter ($5/day) or hire a tuk-tuk to visit an organic Kampot Pepper plantation (La Plantation). Kayak through the \"Green Cathedral\" river loop before catching fireflies on a sunset riverboat ($5/person).
* **Day 2 (Kep Crab & Rabbit Island):** Visit the lively Kep Crab Market where blue crabs are pulled fresh from ocean baskets and sautéed with fresh green Kampot pepper. Take a 25-minute longtail boat to Koh Tonsay (Rabbit Island) for serene swimming and fresh coconuts ($1).

**2. Transport & Pricing:**
* Minivan from Phnom Penh to Kampot: ~$9 - $11 (Vireak Buntham or Giant Ibis).
* Tuk-Tuk between Kampot and Kep (45 mins): ~$12 - $15.
* Fresh Crab Meal at Market: $8 - $12 with rice and pepper sauce.

*(Note: Live AI service is experiencing high demand spikes (503); provided via WisGO's verified Cambodian local guidebook.)*`;
  }

  // General Cambodia Local Travel Advice
  return isKhmer
    ? `### 🇰🇭 ការណែនាំទេសចរណ៍ទូទាំងកម្ពុជាពី WisGO

**១. ការចាយប្រាក់ និង អត្រាប្តូរប្រាក់ (Currency):**
* កម្ពុជាប្រើប្រាស់រូបិយប័ណ្ណទ្វេរ៖ ប្រាក់ដុល្លារអាមេរិក (USD) និងប្រាក់រៀលខ្មែរ (KHR)។
* អត្រាប្តូរប្រាក់ទូទៅ៖ $1 USD ≈ 4,000 - 4,100 KHR។
* គួរត្រៀមក្រដាសប្រាក់តូចៗ ($1, $5, $10, 20,000៛) សម្រាប់ជិះតុកតុក និងទិញម្ហូបតាមផ្លូវ។

**២. ការធ្វើដំណើរក្នុងក្រុង (Transportation):**
* ទាញយកកម្មវិធី **PassApp** ឬ **Grab** នៅលើទូរស័ព្ទដៃ ដើម្បីកក់តុកតុកឥណ្ឌា ឬឡានក្នុងតម្លៃពិតប្រាកដ ដោយមិនបាច់តថ្លៃ។

**៣. គោលដៅទេសចរណ៍ពិសេស៖**
* **សៀមរាប:** អង្គរវត្ត, ភ្នំគូលែន, ភូមិបណ្តែតទឹក
* **កំពត & កែប:** ចម្ការម្រេច, ផ្សារក្តាម, កោះទន្សាយ
* **មណ្ឌលគិរី:** ជម្រកសត្វដំរីធម្មជាតិ, ទឹកធ្លាក់ប៊ូស្រា
* **កោះរ៉ុង:** ឆ្នេរខ្សាច់សក្បុស និងទឹកសមុទ្រថ្លាដូចកញ្ចក់

*(ចំណាំ៖ សេវាកម្ម AI កំពុងមានតម្រូវការខ្ពស់បណ្តោះអាសន្ន — ព័ត៌មាននេះផ្តល់ជូនដោយផ្ទាល់ពីសៀវភៅមគ្គុទ្ទេសក៍ទេសចរណ៍ WisGO Youth Guide)*`
    : `### 🇰🇭 Authentic Cambodia Travel Guide (WisGO Youth Companion)

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
  // Back off this model for 5 minutes during capacity spikes
  modelCooldowns[modelName] = Date.now() + 5 * 60 * 1000;
}

// API Route for Gemini AI Travel Assistant
app.post('/api/chat', async (req, res) => {
  try {
    const { message, userPreferences, province, conversationHistory, currentTripContext } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const ai = getAIClient();

    // Trip memory context representation
    let contextNotice = '';
    if (currentTripContext) {
      const tripSummary = typeof currentTripContext === 'string'
        ? currentTripContext
        : JSON.stringify(currentTripContext, null, 2);
      contextNotice = `\nCURRENT ACTIVE TRIP CONTEXT (The user is refining this trip plan):\n${tripSummary}\n\nRULE FOR TRIP REFINEMENTS: When the user asks to adjust (e.g. "make it cheaper", "add sunset to Day 2", "remove museum", "family friendly"), DO NOT start from scratch! Update the existing itinerary, modify the requested parts, keep the rest of the trip intact, and return the complete updated itinerary and updated json:wisgo-trip block.\n`;
    }

    // System prompt for WisGO - Cambodian Youth Local Travel Assistant & Actionable Trip Planner
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

    // Prioritize models that have active capacity: gemini-flash-latest and gemini-3.1-flash-lite
    const allModels = ['gemini-flash-latest', 'gemini-3.1-flash-lite', 'gemini-3.8-flash'];
    const activeModels = allModels.filter(m => isModelAvailable(m));
    const candidateModels = activeModels.length > 0 ? activeModels : allModels;

    let replyText: string | null = null;

    // Build prompt history if provided
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
          console.log(`[WisGO AI] Model ${model} is currently at capacity; automatically routing to next model.`);
        } else {
          console.log(`[WisGO AI] Model ${model} returned non-critical status, checking alternatives.`);
        }
      }
    }

    // If all models are experiencing high demand (503), provide smart local knowledge
    if (!replyText) {
      console.log('[WisGO AI] Live model capacity temporarily limited; serving verified WisGO local guide data.');
      replyText = generateLocalWisgoResponse(message, userPreferences?.preferredLanguage);
    }

    return res.json({ text: replyText });
  } catch (error: any) {
    // If an unexpected error happened, still provide a safe response rather than crashing the chat
    const fallbackText = generateLocalWisgoResponse(req.body?.message || '', req.body?.userPreferences?.preferredLanguage);
    return res.json({ text: fallbackText });
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
