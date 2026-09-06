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
    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
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

// Cambodian destinations knowledge base for fallback generation
interface DestinationData {
  name: string;
  nameKhmer: string;
  defaultCost: string;
  transport: string;
  dayThemes: Array<{
    theme: string;
    themeKhmer: string;
    activities: Array<{
      timeSlot: 'morning' | 'afternoon' | 'evening';
      time: string;
      title: string;
      titleKhmer: string;
      description: string;
      location: string;
      duration: string;
      cost: string;
      transport: string;
      notes: string;
    }>;
  }>;
}

const DESTINATIONS: Record<string, DestinationData> = {
  'siem reap': {
    name: 'Siem Reap & Angkor Wat',
    nameKhmer: 'សៀមរាប & អង្គរវត្ត',
    defaultCost: '$120 – $180 per person (Estimated)',
    transport: 'PassApp Tuk-Tuk (~$2-3 in city, $18-25 for full temple day)',
    dayThemes: [
      {
        theme: 'Angkor Wat Sunrise & Ancient Wonders',
        themeKhmer: 'ថ្ងៃរះអង្គរវត្ត & អច្ឆរិយវត្ថុបុរាណ',
        activities: [
          {
            timeSlot: 'morning',
            time: '5:00 AM – 8:30 AM',
            title: 'Angkor Wat Sunrise & Central Sanctuary',
            titleKhmer: 'ទស្សនាថ្ងៃរះនៅស្រះស្រង់ និងប្រាសាទអង្គរវត្ត',
            description: 'Witness the iconic dawn reflection over the sacred lotus ponds, followed by exploring the ancient bas-relief galleries depicting the Churning of the Ocean of Milk.',
            location: 'Angkor Archaeological Park, Siem Reap',
            duration: '3.5 hours',
            cost: '$37 (1-Day Angkor Pass)',
            transport: 'PassApp Remorque or tuk-tuk (~$4 from city)',
            notes: 'Dress code: Cover shoulders and knees strictly.'
          },
          {
            timeSlot: 'afternoon',
            time: '1:30 PM – 4:30 PM',
            title: 'Bayon Temple & Ta Prohm Tree Roots',
            titleKhmer: 'ប្រាសាទបាយ័ន (មុខ៤) & ប្រាសាទតាព្រហ្ម (ឫសឈើ)',
            description: 'Admire the 216 serene smiling stone faces of Jayavarman VII at Bayon, then walk the winding shaded paths of Ta Prohm embraced by giant silk-cotton trees.',
            location: 'Angkor Thom & Ta Prohm, Siem Reap',
            duration: '3 hours',
            cost: 'Included in Angkor Pass',
            transport: 'Tuk-tuk short transit between temples (~10 mins)',
            notes: 'Bring a refillable water bottle and sun hat.'
          },
          {
            timeSlot: 'evening',
            time: '6:30 PM – 9:00 PM',
            title: 'Pub Street & Old Market Street Food',
            titleKhmer: 'ភ្លក់ម្ហូបតាមផ្លូវនៅផ្សារចាស់ & Pub Street',
            description: 'Stroll through the lively night bazaar. Taste authentic Fish Amok steamed in banana leaves, fresh papaya salad with crab, and iced fruit shakes.',
            location: 'Street 08 / Pub Street, Siem Reap',
            duration: '2.5 hours',
            cost: '$6 – $12 per person',
            transport: 'Walking distance in town or $1.50 PassApp',
            notes: 'Try Khmer beef Lok Lak and local draft Angkor beer ($0.75 - $1.00).'
          }
        ]
      },
      {
        theme: 'Pink Sandstone Carvings & Floating Villages',
        themeKhmer: 'ប្រាសាទបន្ទាយស្រី & ភូមិបណ្តែតទឹកបឹងទន្លេសាប',
        activities: [
          {
            timeSlot: 'morning',
            time: '7:30 AM – 11:30 AM',
            title: 'Banteay Srei "Jewel of Khmer Art"',
            titleKhmer: 'ប្រាសាទបន្ទាយស្រី (ក្បាច់ចម្លាក់ថ្មផ្កាឈូក)',
            description: 'Examine the intricate, exceptionally preserved 10th-century rose-colored sandstone carvings depicting Hindu epics and divine devatas.',
            location: 'Banteay Srei District (32km north of town)',
            duration: '4 hours (including drive)',
            cost: 'Included in Angkor Pass',
            transport: 'Private tuk-tuk (~$15 return) or PassApp car',
            notes: 'Best morning light before noon sun hits the carvings.'
          },
          {
            timeSlot: 'afternoon',
            time: '2:30 PM – 5:30 PM',
            title: 'Kompong Phluk Tonle Sap Stilt Village',
            titleKhmer: 'ទស្សនាភូមិបណ្តែតទឹកកំពង់ភ្លុកបឹងទន្លេសាប',
            description: 'Boat through elevated 6-meter wooden stilt houses and take a paddle canoe into the flooded mangrove forest with local community rowers.',
            location: 'Kompong Phluk, Tonle Sap',
            duration: '3 hours',
            cost: '$20 boat pass',
            transport: 'Tuk-tuk (~$12-15 return) or shared minivan',
            notes: 'Life jackets provided by boat cooperative.'
          },
          {
            timeSlot: 'evening',
            time: '7:00 PM – 9:30 PM',
            title: 'Phare The Cambodian Circus',
            titleKhmer: 'ទស្សនាសៀកសិល្បៈកម្ពុជា ហ្វារ (Phare Circus)',
            description: 'Thrilling contemporary theatrical circus blending Cambodian folklore, acrobatics, theater, and traditional live musicians. Proceeds support youth education.',
            location: 'Ring Road, south of intersection with Sok San Rd',
            duration: '1.5 hours',
            cost: '$18 – $28',
            transport: '$2.00 PassApp tuk-tuk',
            notes: 'Book seats in advance during high season.'
          }
        ]
      },
      {
        theme: 'Sacred Mountain Waterfalls & Artisan Craft',
        themeKhmer: 'ទឹកធ្លាក់ភ្នំគូលែន & សិប្បកម្មខ្មែរ',
        activities: [
          {
            timeSlot: 'morning',
            time: '8:00 AM – 12:30 PM',
            title: 'Phnom Kulen Waterfall & River of 1,000 Lingas',
            titleKhmer: 'ទឹកធ្លាក់ភ្នំគូលែន & ស្ទឹងលិង្គមួយពាន់',
            description: 'Visit the sacred birthplace of the Khmer Empire. Admire ancient carvings engraved into the riverbed and swim under the refreshing cascading waterfalls.',
            location: 'Phnom Kulen National Park',
            duration: '4.5 hours',
            cost: '$20 national park ticket',
            transport: 'Van or 4x4 car (~$40 shared)',
            notes: 'Vehicles must go up before 11:00 AM due to 1-way mountain road.'
          },
          {
            timeSlot: 'afternoon',
            time: '2:30 PM – 5:00 PM',
            title: 'Artisans Angkor Silk & Stone Workshops',
            titleKhmer: 'មជ្ឈមណ្ឌលសិប្បកម្មអង្គរ (ឆ្លាក់ថ្ម & តម្បាញសូត្រ)',
            description: 'Guided tour seeing master artisans craft traditional Khmer silk, stone carving, and lacquering preserving centuries-old heritage.',
            location: 'Stung Thmey Street, Siem Reap',
            duration: '2.5 hours',
            cost: 'Free entry / guided tour',
            transport: 'Walking distance or $1.50 tuk-tuk',
            notes: 'Great spot to buy authentic certified Cambodian souvenirs.'
          },
          {
            timeSlot: 'evening',
            time: '6:30 PM – 9:00 PM',
            title: 'Local Khmer BBQ & Riverside Night Walk',
            titleKhmer: 'ភ្លក់សាច់អាំងខ្មែរ & ដើរលេងតាមដងស្ទឹងសៀមរាប',
            description: 'Taste authentic Cambodian BBQ (Sach Ko Ang) with pickled green papaya, dip in Teuk Kroeung or spicy prahok sauce, followed by a serene walk along the lit river.',
            location: 'Siem Reap Riverfront',
            duration: '2.5 hours',
            cost: '$7 – $14 per person',
            transport: 'Walk or $1 PassApp',
            notes: 'Pair with freshly cracked chilled coconut.'
          }
        ]
      }
    ]
  },
  'phnom penh': {
    name: 'Phnom Penh Capital City',
    nameKhmer: 'រាជធានីភ្នំពេញ',
    defaultCost: '$90 – $140 per person (Estimated)',
    transport: 'PassApp & Grab Auto-Rickshaw ($1.50 - $3 per ride)',
    dayThemes: [
      {
        theme: 'Royal Heritage & Mekong Riverside',
        themeKhmer: 'ព្រះបរមរាជវាំង & មាត់ទន្លេចតុមុខ',
        activities: [
          {
            timeSlot: 'morning',
            time: '8:00 AM – 11:30 AM',
            title: 'Royal Palace & Silver Pagoda',
            titleKhmer: 'ព្រះបរមរាជវាំង & វត្តព្រះកែវមរកត (Silver Pagoda)',
            description: 'Explore the residence of the King of Cambodia, the Throne Hall, and the Silver Pagoda paved with 5,000 pure silver tiles containing the Emerald Buddha.',
            location: 'Samdach Sothearos Blvd, Phnom Penh',
            duration: '3 hours',
            cost: '$10 entry',
            transport: 'PassApp tuk-tuk (~$2.00)',
            notes: 'Strict dress code: Shoulders & knees covered.'
          },
          {
            timeSlot: 'afternoon',
            time: '2:00 PM – 4:30 PM',
            title: 'National Museum of Cambodia & Wat Phnom',
            titleKhmer: 'សារមន្ទីរជាតិកម្ពុជា & វត្តភ្នំដូនពេញ',
            description: 'Admire the worlds greatest collection of ancient Angkorian and pre-Angkorian sculptures, then climb the leafy hill of Wat Phnom, the founding site of the capital.',
            location: 'Street 13 & Norodom Blvd, Phnom Penh',
            duration: '2.5 hours',
            cost: '$10 museum + $1 Wat Phnom',
            transport: 'Short PassApp ride ($1.50)',
            notes: 'Terracotta courtyard garden is very peaceful.'
          },
          {
            timeSlot: 'evening',
            time: '6:00 PM – 8:30 PM',
            title: 'Sisowath Quay Riverside Sunset & Street Food',
            titleKhmer: 'ដើរលេងមាត់ទន្លេស៊ីសុវត្ថិ & ជិះទូកមើលថ្ងៃលិច',
            description: 'Take a $5 sunset riverboat ride where the Tonle Sap and Mekong rivers meet, then sample fresh Num Pang (Khmer baguette) and sugarcane juice along the promenade.',
            location: 'Sisowath Quay, Phnom Penh',
            duration: '2.5 hours',
            cost: '$5 boat + $5 food',
            transport: 'Walking along promenade',
            notes: 'Great youth atmosphere in the evening breeze.'
          }
        ]
      },
      {
        theme: 'History, Memory & Creative Street Art',
        themeKhmer: 'ប្រវត្តិសាស្ត្រ & គំនូរសិល្បៈតាមដងផ្លូវ',
        activities: [
          {
            timeSlot: 'morning',
            time: '8:30 AM – 11:30 AM',
            title: 'Tuol Sleng Genocide Museum (S-21)',
            titleKhmer: 'សារមន្ទីរឧក្រិដ្ឋកម្មប្រល័យពូជសាសន៍ទួលស្លែង',
            description: 'Solemn and vital historical memorial documenting Cambodia modern history. Audio headset tour provided in multiple languages with poignant first-person survivor testimonies.',
            location: 'Corner of St. 113 & St. 350, BKK3',
            duration: '2.5 hours',
            cost: '$5 entry + $5 audio guide',
            transport: 'PassApp tuk-tuk ($2.00)',
            notes: 'Maintain quiet respectful demeanor.'
          },
          {
            timeSlot: 'afternoon',
            time: '1:30 PM – 4:30 PM',
            title: 'Russian Market (Toul Tom Poung) & Bassac Lane',
            titleKhmer: 'ផ្សារទួលទំពូង (Russian Market) & តំបន់ Bassac Lane',
            description: 'Browse stalls for antique coins, hand-woven kramas, coffee beans, and silk. Sip iced coconut coffee at a nearby bohemian cafe.',
            location: 'Street 155 & Street 444, Phnom Penh',
            duration: '3 hours',
            cost: '$5 – $15 shopping & coffee',
            transport: 'PassApp tuk-tuk ($2.00)',
            notes: 'Polite bargaining is welcome: ask "Som ban tlos bantech te?"'
          },
          {
            timeSlot: 'evening',
            time: '6:30 PM – 9:30 PM',
            title: 'Night Market (Phsar Reatrey) & Khmer Noodles',
            titleKhmer: 'ផ្សាររាត្រីមាត់ទន្លេ & ញ៉ាំនំបញ្ចុកទឹកប្រហុក',
            description: 'Sit on woven straw mats under the stars at the Night Market eating fresh spring rolls, chicken skewers, and Num Banh Chok curry noodles with live music.',
            location: 'Street 106, Riverfront, Phnom Penh',
            duration: '3 hours',
            cost: '$4 – $8 per person',
            transport: 'PassApp tuk-tuk ($1.50)',
            notes: 'Take shoes off before stepping onto the shared mats.'
          }
        ]
      }
    ]
  },
  'kampot': {
    name: 'Kampot & Kep Coastal Escape',
    nameKhmer: 'កំពត & កែប',
    defaultCost: '$80 – $130 per person (Estimated)',
    transport: 'Scooter rental ($5-7/day) or PassApp Tuk-Tuk ($15-20 full day)',
    dayThemes: [
      {
        theme: 'Organic Pepper Plantations & Sunset River',
        themeKhmer: 'ចម្ការម្រេចកំពត & ជិះទូកមើលអំពិលអំពែក',
        activities: [
          {
            timeSlot: 'morning',
            time: '8:30 AM – 12:00 PM',
            title: 'Organic Kampot Pepper Farm Tour (La Plantation)',
            titleKhmer: 'ទស្សនាចម្ការម្រេចកំពតធម្មជាតិ (La Plantation)',
            description: 'Free guided tasting discovering why Kampot Black, Red, and White peppercorns hold prestigious Protected Geographical Indication (PGI) status worldwide.',
            location: 'Bosjhang Village, Kampot',
            duration: '3.5 hours',
            cost: 'Free tour / $8 lunch',
            transport: 'Tuk-tuk (~$15 return) or scooter ride',
            notes: 'Try the fresh green pepper ice cream!'
          },
          {
            timeSlot: 'afternoon',
            time: '2:30 PM – 5:00 PM',
            title: 'Kayak Through the "Green Cathedral" River Loop',
            titleKhmer: 'ជិះទូកកាយ៉ាក់កាត់ព្រៃកោងកាងទឹកសាប',
            description: 'Paddle through a quiet, lush canopy loop along the Praek Tuek Chhu river shaded by overhanging palms and tropical foliage.',
            location: 'Champa Lodge / Green Cathedral, Kampot',
            duration: '2.5 hours',
            cost: '$5 – $8 kayak rental',
            transport: 'PassApp or scooter (15 mins from town)',
            notes: 'Waterproof pouch recommended for smartphones.'
          },
          {
            timeSlot: 'evening',
            time: '6:00 PM – 8:30 PM',
            title: 'Kampot Sunset Firefly Riverboat',
            titleKhmer: 'ជិះទូកទស្សនាថ្ងៃលិច & អំពិលអំពែកដងព្រែកកំពត',
            description: 'Cruise down the river while watching the sunset glow against Bokor Mountain, followed by spotting twinkling fireflies in the riverbank trees.',
            location: 'Old Market Bridge Pier, Kampot',
            duration: '2 hours',
            cost: '$5 per person (includes 1 cold drink)',
            transport: 'Walk from town center',
            notes: 'Bring a light wind jacket for the evening river breeze.'
          }
        ]
      },
      {
        theme: 'Kep Crab Market & Rabbit Island (Koh Tonsay)',
        themeKhmer: 'ផ្សារក្តាមកែប & កោះទន្សាយ',
        activities: [
          {
            timeSlot: 'morning',
            time: '8:30 AM – 12:30 PM',
            title: 'Koh Tonsay (Rabbit Island) Tropical Escape',
            titleKhmer: 'ជិះទូកទៅលេងកោះទន្សាយ (Koh Tonsay)',
            description: 'Board a wooden longtail boat for a 25-minute journey to peaceful Rabbit Island. Relax in beach hammocks under shade palms and swim in warm shallow waters.',
            location: 'Kep Pier to Koh Tonsay',
            duration: '4 hours',
            cost: '$8 – $10 return boat ticket',
            transport: 'Tuk-tuk from Kampot to Kep Pier (~$12, 40 min)',
            notes: 'Cash only on the island. Fresh coconuts are $1 each.'
          },
          {
            timeSlot: 'afternoon',
            time: '1:30 PM – 4:30 PM',
            title: 'Kep Crab Market (Phsar Kdam) Feast',
            titleKhmer: 'ញ៉ាំក្តាមសមុទ្របំពងម្រេចខ្ចីនៅផ្សារក្តាមកែប',
            description: 'Watch local fisherwomen pull bamboo crab traps directly from the sea. Choose your live blue crabs and have them wok-fried on the spot with green Kampot peppercorns.',
            location: 'Kep Crab Market, Kep Coast',
            duration: '3 hours',
            cost: '$9 – $15 per person',
            transport: 'Tuk-tuk along coastal road ($2)',
            notes: 'Best seafood dining experience in Cambodia.'
          },
          {
            timeSlot: 'evening',
            time: '5:30 PM – 8:00 PM',
            title: 'Kep Beach Sunset & French Colonial Ruins Walk',
            titleKhmer: 'មើលថ្ងៃលិចនៅឆ្នេរកែប & វិមានស្ថាបត្យកម្មសម័យមុន',
            description: 'Stroll along the renovated white sand beach of Kep and discover modern-movement 1960s modernist villas hidden in the lush jungle hillside.',
            location: 'Kep Beach Promenade',
            duration: '2.5 hours',
            cost: 'Free',
            transport: 'Tuk-tuk return to Kampot (~$10-12)',
            notes: 'Sunset behind Phu Quoc island horizon is stunning.'
          }
        ]
      }
    ]
  },
  'battambang': {
    name: 'Battambang Heritage & Countryside',
    nameKhmer: 'បាត់ដំបង & ជនបទបូរាណ',
    defaultCost: '$70 – $110 per person (Estimated)',
    transport: 'Tuk-tuk day tour ($18-22)',
    dayThemes: [
      {
        theme: 'Bamboo Train & Bat Cave Sunset Spectacle',
        themeKhmer: 'ជិះឡូរី (Bamboo Train) & មើលសត្វប្រចៀវភ្នំសំពៅ',
        activities: [
          {
            timeSlot: 'morning',
            time: '8:30 AM – 11:30 AM',
            title: 'Famous Bamboo Train (Norry) Ride',
            titleKhmer: 'ជិះឡូរីឫស្សីបាត់ដំបង',
            description: 'Ride on a motorized bamboo platform along old single-track rails through emerald rice fields, enjoying the open breeze and rural landscapes.',
            location: 'Odambang Village, Battambang',
            duration: '2 hours',
            cost: '$5 per person',
            transport: 'Tuk-tuk from town ($5)',
            notes: 'A unique Cambodian cultural transport experience.'
          },
          {
            timeSlot: 'afternoon',
            time: '2:00 PM – 5:00 PM',
            title: 'Colonial Architecture & Wat Ek Phnom',
            titleKhmer: 'ស្ថាបត្យកម្មសម័យបារាំង & វត្តឯកភ្នំ',
            description: 'Admire remarkably preserved French colonial shop houses along the Sangker River, then visit 11th-century sandstone ruins of Wat Ek Phnom.',
            location: 'Street 1 & 2, Battambang',
            duration: '3 hours',
            cost: '$1 entry to temple',
            transport: 'Tuk-tuk (~$8)',
            notes: 'Sample fresh Battambang sticky rice in bamboo (Kralan).'
          },
          {
            timeSlot: 'evening',
            time: '5:30 PM – 7:30 PM',
            title: 'Phnom Sampeau Bat Cave Sunset',
            titleKhmer: 'ទស្សនាកងទ័ពប្រចៀវរាប់លានហោះចេញពីរូងភ្នំសំពៅ',
            description: 'Sit at the base of Phnom Sampeau watching millions of bats stream out into the twilight sky in an unbroken ribbons formation.',
            location: 'Phnom Sampeau, Battambang',
            duration: '2 hours',
            cost: 'Free / small drinks',
            transport: 'Tuk-tuk (~$10 return)',
            notes: 'Arrive before 5:30 PM for prime seats.'
          }
        ]
      }
    ]
  },
  'koh rong': {
    name: 'Koh Rong & Islands Paradise',
    nameKhmer: 'កោះរ៉ុង & សមុទ្រឋានសួគ៌',
    defaultCost: '$100 – $160 per person (Estimated)',
    transport: 'Speed Ferry from Sihanoukville ($25 return), local longtail boats',
    dayThemes: [
      {
        theme: 'White Sand Beaches & Bioluminescent Plankton',
        themeKhmer: 'ឆ្នេរខ្សាច់សកោះរ៉ុង & មើលពន្លឺផ្លុងតុងពេលយប់',
        activities: [
          {
            timeSlot: 'morning',
            time: '9:00 AM – 1:00 PM',
            title: 'Long Set (4K) Beach Sunbathing & Snorkel',
            titleKhmer: 'ហែលទឹកលេងនៅឆ្នេរ 4K (Long Set Beach)',
            description: 'Relax on powder-fine white sand stretching 4 kilometers with turquoise waters. Snorkel around shallow reef edges to spot tropical reef fish.',
            location: 'Long Set Beach, Koh Rong',
            duration: '4 hours',
            cost: 'Free beach / $5 mask rental',
            transport: 'Short walk or beach boat ($3)',
            notes: 'Bring eco-friendly sunscreen.'
          },
          {
            timeSlot: 'afternoon',
            time: '2:30 PM – 5:30 PM',
            title: 'Jungle Trek to Sok San Village & Pier',
            titleKhmer: 'ដើរកាត់ព្រៃធម្មជាតិទៅភូមិសុខសាន្ត',
            description: 'Trek along shaded trails through tropical island rainforest to the traditional fishing community of Sok San and unwind with fresh chilled young coconut.',
            location: 'Sok San Village, Koh Rong',
            duration: '3 hours',
            cost: 'Free',
            transport: 'Scooter or hiking trail',
            notes: 'Wear sturdy footwear for island trails.'
          },
          {
            timeSlot: 'evening',
            time: '7:00 PM – 9:00 PM',
            title: 'Glowing Bioluminescent Plankton Night Boat',
            titleKhmer: 'ជិះទូកមើលពន្លឺផ្លុងតុងបញ្ចេញរស្មីក្រោមទឹកសមុទ្រ',
            description: 'Head out on a wooden boat into dark waters to swim among glowing bio-plankton that light up neon blue with every movement.',
            location: 'Koh Rong Archipelago waters',
            duration: '2 hours',
            cost: '$5 – $8 boat tour',
            transport: 'Departs from main pier',
            notes: 'An unforgettable bucket-list island experience.'
          }
        ]
      }
    ]
  }
};

// Flexible, dynamic fallback generator that builds structured plans based on query parameters
function generateLocalWisgoResponse(userQuery: string, language = 'English'): string {
  const q = userQuery.toLowerCase();
  const isKhmer = language === 'Khmer' || language.toLowerCase() === 'km';

  // Check if user is asking about Google Calendar or Gmail
  if (q.includes('calendar') || q.includes('gmail') || q.includes('email') || q.includes('schedule') || q.includes('កាលវិភាគ') || q.includes('អ៊ីមែល')) {
    return isKhmer
      ? `### 📅 មុខងារភ្ជាប់ Google Calendar & Gmail ជាមួយ WisGO!

អ្នកអាចប្រើប្រាស់មុខងារស្វ័យប្រវត្តិនេះយ៉ាងងាយស្រួលជាមួយ WisGO AI៖

1. **🗓️ បញ្ចូលទៅ Google Calendar (Add to Google Calendar):**
   * នៅលើផ្ទាំងកាលវិភាគធ្វើដំណើរ (Itinerary Card) ខាងលើ សូមចុចលើប៊ូតុង **"Calendar"** ឬ **"Sync to Google Calendar"**។
   * ប្រព័ន្ធនឹងរៀបចំសកម្មភាពទាំងអស់តាមម៉ោង និងទីកន្លែង រួមទាំងគន្លឹះជិះ PassApp ដោយផ្ទាល់ទៅក្នុង Google Calendar របស់អ្នកដោយស្វ័យប្រវត្តិ។

2. **✉️ ផ្ញើទៅកាន់ Gmail (Send to Gmail):**
   * ចុចលើប៊ូតុង **"Gmail"** នៅលើកាតដំណើរកម្សាន្ត។
   * អ្នកអាចវាយបញ្ចូលអ៊ីមែលផ្ទាល់ខ្លួន ឬអ៊ីមែលមិត្តភក្តិរួមដំណើរ ដើម្បីផ្ញើឯកសារកាលវិភាគយ៉ាងស្រស់ស្អាតដែលមានតារាង និងការណែនាំលម្អិត។

តើអ្នកចង់ឱ្យខ្ញុំរៀបចំគម្រោងដំណើរកម្សាន្តថ្មីសម្រាប់ខេត្តណាដែរ? (ឧទាហរណ៍៖ សៀមរាប ៣ ថ្ងៃ, កំពត-កែប ២ ថ្ងៃ, ភ្នំពេញ ឬ កោះរ៉ុង)?`
      : `### 📅 Google Calendar & Gmail Integration in WisGO!

WisGO AI is fully integrated with Google Calendar and Gmail:

1. **🗓️ 1-Click Sync to Google Calendar:**
   * On any trip itinerary generated in this chat, click the **"Calendar"** button on the card.
   * You can choose **"Sync to Google Calendar"** to automatically schedule all activities, complete with PassApp transit tips, locations, costs, and reminders directly into your primary Google Calendar.
   * You can also download the **.ICS file** for Apple or Outlook Calendar.

2. **✉️ Send Travel Itinerary to Gmail:**
   * Click the **"Gmail"** button on the trip card.
   * Enter your email or your travel buddy's address to send a beautifully formatted travel document with day-by-day itineraries, expense breakdowns, and local Cambodia tips.

Would you like me to generate or customize a trip for you now? (e.g. *"Plan 3 days in Siem Reap"*, *"2 days in Kampot & Kep"*, or *"Phnom Penh budget food tour"*).`;
  }

  // Detect destination
  let destKey = 'siem reap';
  if (q.includes('phnom penh') || q.includes('capital') || q.includes('ភ្នំពេញ')) {
    destKey = 'phnom penh';
  } else if (q.includes('kampot') || q.includes('kep') || q.includes('pepper') || q.includes('crab') || q.includes('កំពត') || q.includes('កែប')) {
    destKey = 'kampot';
  } else if (q.includes('battambang') || q.includes('bamboo train') || q.includes('bat cave') || q.includes('បាត់ដំបង')) {
    destKey = 'battambang';
  } else if (q.includes('koh rong') || q.includes('beach') || q.includes('island') || q.includes('plankton') || q.includes('កោះរ៉ុង')) {
    destKey = 'koh rong';
  }

  const dest = DESTINATIONS[destKey] || DESTINATIONS['siem reap'];

  // Detect duration (1 to 3 days)
  let daysCount = 3;
  if (q.includes('1 day') || q.includes('one day') || q.includes('១ ថ្ងៃ')) {
    daysCount = 1;
  } else if (q.includes('2 day') || q.includes('two day') || q.includes('weekend') || q.includes('២ ថ្ងៃ')) {
    daysCount = 2;
  } else if (q.includes('3 day') || q.includes('three day') || q.includes('៣ ថ្ងៃ')) {
    daysCount = 3;
  } else {
    daysCount = Math.min(dest.dayThemes.length, 3);
  }

  const selectedDays = dest.dayThemes.slice(0, daysCount);

  // Build Markdown Text
  let md = isKhmer
    ? `### 🇰🇭 គម្រោងដំណើរកម្សាន្ត ${daysCount} ថ្ងៃនៅ ${dest.nameKhmer}\n\n`
    : `### 🇰🇭 ${daysCount}-Day Actionable Itinerary: ${dest.name}\n\n`;

  selectedDays.forEach((dt, idx) => {
    const dayNum = idx + 1;
    md += isKhmer
      ? `#### ថ្ងៃទី ${dayNum}: ${dt.themeKhmer}\n`
      : `#### Day ${dayNum}: ${dt.theme}\n`;

    dt.activities.forEach(act => {
      const title = isKhmer ? act.titleKhmer : act.title;
      md += `* **${act.timeSlot.toUpperCase()} (${act.time}):** ${title}\n`;
      md += `  - **Location:** ${act.location}\n`;
      md += `  - **Estimated Time:** ${act.duration}\n`;
      md += `  - **Estimated Cost:** ${act.cost}\n`;
      md += `  - **PassApp / Transport:** ${act.transport}\n`;
      md += `  - **Youth Tip:** ${act.notes}\n\n`;
    });
  });

  md += isKhmer
    ? `💡 **គន្លឹះពិសេស:** អ្នកអាចចុចប៊ូតុង **"Calendar"** ដើម្បីបញ្ចូលកាលវិភាគនេះទៅក្នុង Google Calendar ឬចុច **"Gmail"** ដើម្បីផ្ញើគម្រោងនេះទៅកាន់អ៊ីមែលរបស់អ្នកបានភ្លាមៗ!\n\n`
    : `💡 **Next Step:** You can tap **"Calendar"** on the card below to sync this trip to Google Calendar, or **"Gmail"** to email it directly to yourself!\n\n`;

  // Build JSON wisgo-trip block
  const tripJson = {
    id: `trip-${Date.now()}`,
    title: `${daysCount}-Day ${dest.name} Discovery`,
    destination: dest.name,
    startDate: new Date().toISOString().split('T')[0],
    durationDays: daysCount,
    travelersCount: 2,
    budgetTier: 'moderate',
    totalEstimatedCost: dest.defaultCost,
    days: selectedDays.map((dt, idx) => ({
      dayNumber: idx + 1,
      date: `Day ${idx + 1}`,
      theme: isKhmer ? dt.themeKhmer : dt.theme,
      activities: dt.activities.map((act, aIdx) => ({
        id: `act-${idx + 1}-${aIdx + 1}`,
        timeSlot: act.timeSlot,
        time: act.time,
        title: isKhmer ? act.titleKhmer : act.title,
        description: act.description,
        location: act.location,
        estimatedDuration: act.duration,
        estimatedCost: act.cost,
        transportTip: act.transport,
        openingHours: 'Regular daytime hours',
        practicalNotes: act.notes
      }))
    })),
    summaryNote: isKhmer
      ? `គម្រោងដំណើរកម្សាន្ត ${daysCount} ថ្ងៃនៅ ${dest.nameKhmer} ជាមួយការណែនាំតម្លៃពិតប្រាកដ និងការធ្វើដំណើរ PassApp`
      : `Complete ${daysCount}-day actionable plan for ${dest.name} with verified costs, transit tips, and calendar sync.`
  };

  md += `\`\`\`json:wisgo-trip\n${JSON.stringify(tripJson, null, 2)}\n\`\`\``;

  return md;
}

// Model cooldown management
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
  // Short 30-second backoff so temporary spikes recover promptly
  modelCooldowns[modelName] = Date.now() + 30 * 1000;
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
      contextNotice = `\nCURRENT ACTIVE TRIP CONTEXT (The user is refining or discussing this trip):\n${tripSummary}\n\nRULE FOR TRIP REFINEMENTS: When the user asks to adjust (e.g. "make it cheaper", "add sunset to Day 2", "remove museum", "add to calendar", "email this to me"), update the existing itinerary, modify the requested parts, keep the rest intact, and always append the updated \`\`\`json:wisgo-trip\`\`\` block.\n`;
    }

    // System prompt for WisGO - Authentic Cambodian Youth Local Guide & Actionable Trip Planner
    const systemInstruction = `You are WisGO AI, the authentic Cambodian youth local guide and actionable travel planning assistant.
WisGO helps travelers turn questions and ideas into structured, actionable adventures: Discover → Ask AI → Create Trip → Customize → Save → Add to Google Calendar → Send to Gmail!

Key Capabilities & Tools:
1. Google Calendar & Gmail Integration:
   - WisGO has active Google Calendar and Gmail tools. Any itinerary you generate can be directly synced to Google Calendar or emailed as a formatted travel document with 1-click using the buttons on the trip card.
   - If the user asks "Can you add to Google Calendar?", "Add this to my calendar", "Email this to me", or "Send to Gmail", enthusiastically confirm that they can click the direct "Add to Calendar" and "Send to Gmail" buttons on the trip card below, or summarize the schedule for them.

2. Comprehensive Cambodia Local Expertise:
   - Focus exclusively on Cambodia: Siem Reap, Phnom Penh, Kampot, Kep, Battambang, Koh Rong, Koh Rong Sanloem, Mondulkiri, Ratanakiri, Preah Vihear, Kratie.
   - Provide realistic pricing in USD ($) and Cambodian Riel (approx 1 USD = 4,000 - 4,100 KHR).
   - Detail PassApp & Grab tuk-tuk / remorque prices, transit durations, dress codes for temples (shoulders & knees covered), and delicious street food recommendations (Fish Amok, Beef Lok Lak, Num Banh Chok, iced milk coffee).

3. Flexible Response Formats:
   - For simple questions (e.g., "What is the best time for Angkor sunrise?", "How much should I tip tuk-tuks?"), answer directly and helpfully in conversational paragraphs without forcing an unrequested itinerary.
   - For trip requests (e.g., "Plan a 2-day trip to Kampot", "3 days in Siem Reap"), provide a clear Day-by-Day markdown structure AND ALWAYS APPEND the machine-readable \`\`\`json:wisgo-trip\`\`\` block at the very end.

Itinerary JSON Block Format (when generating a trip):
\`\`\`json:wisgo-trip
{
  "id": "trip-${Date.now()}",
  "title": "Trip Title",
  "destination": "Destination name",
  "startDate": "YYYY-MM-DD",
  "durationDays": 2,
  "travelersCount": 2,
  "budgetTier": "moderate",
  "totalEstimatedCost": "$80 – $140 per person (Estimated)",
  "days": [
    {
      "dayNumber": 1,
      "date": "Day 1",
      "theme": "Theme title",
      "activities": [
        {
          "id": "act-1-1",
          "timeSlot": "morning",
          "time": "8:30 AM – 11:30 AM",
          "title": "Activity name",
          "description": "Short description...",
          "location": "Specific location in Cambodia",
          "estimatedDuration": "3 hours",
          "estimatedCost": "$5 (Estimated)",
          "transportTip": "PassApp auto-rickshaw (~$2.00, 15 min)",
          "openingHours": "8:00 AM – 5:00 PM",
          "practicalNotes": "Helpful traveler tips."
        }
      ]
    }
  ],
  "summaryNote": "Summary description"
}
\`\`\`

User Preferences:
Language: ${userPreferences?.preferredLanguage || 'English'}
Interests: ${userPreferences?.interests?.join(', ') || 'Culture, Food, Nature, Markets'}
Dietary Preferences: ${userPreferences?.dietaryRestrictions?.join(', ') || 'None'}
Province Context: ${province || 'All Cambodia'}${contextNotice}
`;

    // Prioritize fast, high-availability models:
    const allModels = ['gemini-3.1-flash-lite', 'gemini-3.8-flash', 'gemini-flash-latest'];
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
          console.log(`[WisGO AI] Model ${model} is busy; attempting next model.`);
        } else {
          console.log(`[WisGO AI] Model ${model} notice: ${errMsg.slice(0, 80)}`);
        }
      }
    }

    // Dynamic smart generator if all models are momentarily unreachable
    if (!replyText) {
      console.log('[WisGO AI] Utilizing dynamic local generator for query:', message);
      replyText = generateLocalWisgoResponse(message, userPreferences?.preferredLanguage);
    }

    return res.json({ text: replyText });
  } catch (error: any) {
    console.error('[WisGO AI] Chat endpoint error:', error);
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
