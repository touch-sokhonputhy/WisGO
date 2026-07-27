import { Destination } from '../types';

export const CAMBODIA_DESTINATIONS: Destination[] = [
  // SIEM REAP
  {
    id: 'kh-sr-1',
    title: 'Angkor Wat Sunrise & Ancient Circuit',
    khmerName: 'ប្រាសាទអង្គរវត្ត',
    province: 'Siem Reap',
    category: 'Temple & Heritage',
    rating: 4.9,
    reviewCount: 38500,
    description: 'The world-famous 12th-century monument built by King Suryavarman II. Experience the breathtaking reflections over the lotus pond at sunrise.',
    location: {
      lat: 13.4125,
      lng: 103.8670,
      address: 'Angkor Archaeological Park, Siem Reap',
      province: 'Siem Reap'
    },
    image: 'https://images.unsplash.com/photo-1569154941061-e231b4725ef1?auto=format&fit=crop&w=1000&q=80',
    tags: ['UNESCO World Heritage', 'Sunrise View', 'Ancient Temples', 'Khmer History'],
    transportTips: 'Hire a local PassApp tuk-tuk for $15–$20 full day circuit.',
    entryFee: '$37 (1-Day Angkor Pass)'
  },
  {
    id: 'kh-sr-2',
    title: 'Ta Prohm (Tomb Raider Temple)',
    khmerName: 'ប្រាសាទតាព្រហ្ម',
    province: 'Siem Reap',
    category: 'Temple & Heritage',
    rating: 4.9,
    reviewCount: 19800,
    description: 'Atmospheric 12th-century Buddhist temple where giant banyan and silk-cotton tree roots weave dramatically through stone galleries and lichen-covered towers.',
    location: {
      lat: 13.4348,
      lng: 103.8893,
      address: 'Angkor Archaeological Park, Siem Reap',
      province: 'Siem Reap'
    },
    image: 'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?auto=format&fit=crop&w=1000&q=80',
    tags: ['Giant Banyan Roots', 'Tomb Raider', 'Photographic Spot', 'Khmer Heritage'],
    transportTips: 'Include in your Angkor Small Circuit tuk-tuk day tour.',
    entryFee: 'Included in Angkor Pass'
  },
  {
    id: 'kh-sr-3',
    title: 'Banteay Srei (Pink Sandstone Citadel of Beauty)',
    khmerName: 'ប្រាសាទបន្ទាយស្រី',
    province: 'Siem Reap',
    category: 'Temple & Heritage',
    rating: 4.8,
    reviewCount: 12400,
    description: 'Intricate 10th-century Hindu temple carved from fine pink sandstone, celebrated for the finest three-dimensional relief carvings and Devata statues in Khmer art.',
    location: {
      lat: 13.5989,
      lng: 103.9629,
      address: 'Banteay Srei District, 32km North of Siem Reap',
      province: 'Siem Reap'
    },
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1000&q=80',
    tags: ['Pink Sandstone', 'Intricate Reliefs', 'Jewel of Khmer Art', 'Devata Statues'],
    transportTips: 'Combine with Landmine Museum or Phnom Kulen trip via tuk-tuk or AC car ($25-$35).',
    entryFee: 'Included in Angkor Pass'
  },
  {
    id: 'kh-sr-4',
    title: 'Tonle Sap Floating Village of Kampong Phluk',
    khmerName: 'ភូមិបណ្តែតទឹកកំពង់ភ្លុក',
    province: 'Siem Reap',
    category: 'Nature & Culture',
    rating: 4.7,
    reviewCount: 9600,
    description: 'Discover high stilt houses rising up to 10 meters above Southeast Asia’s largest freshwater lake, plus peaceful canoe trips through the flooded mangrove forest.',
    location: {
      lat: 13.2081,
      lng: 103.9782,
      address: 'Kampong Phluk, Prasat Bakong, Siem Reap',
      province: 'Siem Reap'
    },
    image: 'https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=1000&q=80',
    tags: ['Freshwater Lake', 'Stilt Houses', 'Mangrove Forest Canoe', 'Local Fishermen'],
    transportTips: '30km drive from Siem Reap city. Boat tickets approx $20 per person.',
    entryFee: '$20 Boat Tour Ticket'
  },
  {
    id: 'kh-sr-5',
    title: 'Pub Street & Siem Reap Night Market Street Food',
    khmerName: 'ផ្លូវផាប់ស្ទ្រីត និង ផ្សាររាត្រី សៀមរាប',
    province: 'Siem Reap',
    category: 'Street Food & Dining',
    rating: 4.7,
    reviewCount: 21000,
    description: 'Vibrant night bazaar where you can taste authentic Khmer Lok Lak, Coconut Amok curry, crispy fried banana cakes, and fresh tropical fruit smoothies.',
    location: {
      lat: 13.3547,
      lng: 103.8548,
      address: 'Pub Street & Alley West, Siem Reap',
      province: 'Siem Reap'
    },
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1000&q=80',
    tags: ['Khmer Street Food', 'Fish Amok', 'Night Bazaar', 'Youth Hangout'],
    transportTips: 'Central location in Siem Reap city center. Easily walkable or $1.50 tuk-tuk.',
    entryFee: 'Free'
  },

  // PHNOM PENH
  {
    id: 'kh-pp-1',
    title: 'Phnom Penh Royal Palace & Silver Pagoda',
    khmerName: 'ព្រះបរមរាជវាំង ភ្នំពេញ',
    province: 'Phnom Penh',
    category: 'Temple & Heritage',
    rating: 4.7,
    reviewCount: 14200,
    description: 'Grand royal residence featuring classic Khmer spires and the Silver Pagoda paved with over 5,000 pure silver floor tiles and emerald Buddha statues.',
    location: {
      lat: 11.5625,
      lng: 104.9312,
      address: 'Samdach Sothearos Blvd, Phnom Penh',
      province: 'Phnom Penh'
    },
    image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=1000&q=80',
    tags: ['Royal Residence', 'Silver Floor Tiles', 'Emerald Buddha', 'Khmer Royalty'],
    transportTips: '5-min tuk-tuk ride from Riverside Sisowath Quay.',
    entryFee: '$10 entrance ticket'
  },
  {
    id: 'kh-pp-4',
    title: 'Chaktomuk Walk Street (Phnom Penh)',
    khmerName: 'ផ្លូវថ្មើរជើងចតុមុខ (Chaktomuk Walk Street)',
    province: 'Phnom Penh',
    category: 'Youth Experience',
    rating: 4.9,
    reviewCount: 18200,
    description: 'Phnom Penh’s most famous weekend pedestrian walking street along Sisowath Quay. Features glowing Cambodian archways, vibrant night markets, live acoustic music, local street food stalls, outdoor mat seating, and spectacular riverfront evening views.',
    location: {
      lat: 11.5715,
      lng: 104.9312,
      address: 'Chaktomuk Waterfront, Sisowath Quay, Phnom Penh',
      province: 'Phnom Penh'
    },
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
    tags: ['Chaktomuk Walk Street', 'Phnom Penh Night Market', 'Sisowath Quay', 'Weekend Pedestrian Zone', 'Street Food Stalls'],
    transportTips: 'Located along Sisowath Quay waterfront near Night Market. $1.50 PassApp tuk-tuk.',
    entryFee: 'Free Admission'
  },
  {
    id: 'kh-pp-5',
    title: 'Bassac Lane & Street 308 Creative Quarter',
    khmerName: 'ផ្លូវបាសាក់ឡេន (Bassac Lane)',
    province: 'Phnom Penh',
    category: 'Street Food & Dining',
    rating: 4.8,
    reviewCount: 8900,
    description: 'Trendy pedestrian alleyway neighborhood tucked inside Tonle Bassac, famous for cozy craft cocktail bars, intimate ramen shops, live acoustic music, and vibrant nightlife aesthetics.',
    location: {
      lat: 11.5512,
      lng: 104.9285,
      address: 'Street 308 & Bassac Lane, Tonle Bassac, Phnom Penh',
      province: 'Phnom Penh'
    },
    image: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1000&q=80',
    tags: ['Bassac Lane', 'Craft Cocktails', 'Creative Quarter', 'Trendy Nightlife'],
    transportTips: 'Located near Independence Monument. Easy $1.50 tuk-tuk ride.',
    entryFee: 'Free'
  },
  {
    id: 'kh-pp-6',
    title: 'Koh Pich (Diamond Island) Waterfront & Elysee Walk',
    khmerName: 'កោះពេជ្រ និង ផ្លូវដើរកម្សាន្តអេលីហ្សេ',
    province: 'Phnom Penh',
    category: 'Youth Experience',
    rating: 4.7,
    reviewCount: 12100,
    description: 'Ultra-modern urban island promenade featuring colorful fountain shows, European-inspired architecture, riverfront food trucks, outdoor cycling, and glowing evening walk street.',
    location: {
      lat: 11.5528,
      lng: 104.9412,
      address: 'Koh Pich (Diamond Island), Phnom Penh',
      province: 'Phnom Penh'
    },
    image: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1000&q=80',
    tags: ['Koh Pich Diamond Island', 'Elysee Promenade', 'Food Trucks', 'Night Stroll'],
    transportTips: 'Cross the Koh Pich bridge via tuk-tuk ($2). Great for evening strolls.',
    entryFee: 'Free'
  },
  {
    id: 'kh-pp-2',
    title: 'Central Market (Psar Thmei Art Deco Dome)',
    khmerName: 'ផ្សារធំថ្មី ភ្នំពេញ',
    province: 'Phnom Penh',
    category: 'Street Food & Dining',
    rating: 4.6,
    reviewCount: 11500,
    description: 'Iconic 1937 bright-yellow Art Deco landmark packed with traditional Khmer silver crafts, silk scarves, antique coins, and authentic street food stalls.',
    location: {
      lat: 11.5694,
      lng: 104.9213,
      address: 'Calmette St, Phnom Penh',
      province: 'Phnom Penh'
    },
    image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=1000&q=80',
    tags: ['Art Deco Architecture', 'Souvenirs & Silver', 'Khmer Silk', 'Street Snacks'],
    transportTips: 'Located in the central city core. Easily reached by PassApp ($1–$2).',
    entryFee: 'Free'
  },
  {
    id: 'kh-pp-7',
    title: 'Wat Phnom Hilltop Sanctuary & Park Walk',
    khmerName: 'វត្តភ្នំ ភ្នំពេញ',
    province: 'Phnom Penh',
    category: 'Temple & Heritage',
    rating: 4.6,
    reviewCount: 10800,
    description: 'The founding hilltop temple of Phnom Penh standing 27 meters above the city, surrounded by lush shady trees, friendly park paths, and historical shrines dedicated to Lady Penh.',
    location: {
      lat: 11.5761,
      lng: 104.9230,
      address: 'Norodom Blvd, Phnom Penh',
      province: 'Phnom Penh'
    },
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1000&q=80',
    tags: ['Founding Hill', 'Lady Penh Sanctuary', 'Shady Park Walk', 'Historic Pagoda'],
    transportTips: 'Located at the northern end of Norodom Boulevard. $1.50 tuk-tuk.',
    entryFee: '$1 entrance for foreign visitors'
  },
  {
    id: 'kh-pp-3',
    title: 'Sisowath Quay & Mekong Sunset River Cruise',
    khmerName: 'មាត់ទន្លេចតុមុខ ភ្នំពេញ',
    province: 'Phnom Penh',
    category: 'Nature & Culture',
    rating: 4.7,
    reviewCount: 8900,
    description: 'Bustling 3km waterfront promenade along the junction of the Tonle Sap and Mekong rivers. Board wooden boats for golden hour sunset cruises.',
    location: {
      lat: 11.5678,
      lng: 104.9351,
      address: 'Sisowath Quay Waterfront, Phnom Penh',
      province: 'Phnom Penh'
    },
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80',
    tags: ['Mekong Sunset Cruise', 'Waterfront Promenade', 'Four Rivers Junction', 'City Skyline'],
    transportTips: '1-hour sunset boat cruises start at $5–$8 per seat at Kantha Bopha port.',
    entryFee: 'Free promenade ($5–$8 river cruise)'
  },

  // KAMPOT
  {
    id: 'kh-kp-1',
    title: 'Kampot Riverfront & Organic Pepper Plantations',
    khmerName: 'ក្រុងកំពត និង ចម្ការម្រេច',
    province: 'Kampot',
    category: 'Nature & Adventure',
    rating: 4.8,
    reviewCount: 8200,
    description: 'Charming riverside town famed for world-class GI Kampot Pepper, kayaking down the Green Loop river, and sunsets over the Elephant Mountains.',
    location: {
      lat: 10.6104,
      lng: 104.1816,
      address: 'Kampot Riverfront & Old Town, Kampot',
      province: 'Kampot'
    },
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1000&q=80',
    tags: ['Kampot Pepper', 'River Kayaking', 'French Colonial Architecture', 'Firefly Cruise'],
    transportTips: 'Rent a motor scooter for $5/day or book a youth-guided river boat tour ($5).',
    entryFee: 'Free (Pepper farm tours usually free)'
  },
  {
    id: 'kh-kp-3',
    title: 'Bokor National Park & Le Bokor Palace Mountain',
    khmerName: 'ឧទ្យានជាតិព្រះមុនីវង្ស បូកគោ',
    province: 'Kampot',
    category: 'Nature & Adventure',
    rating: 4.8,
    reviewCount: 7400,
    description: 'High altitude mountain reserve at 1,075m above sea level. Cool misty climate featuring the colossal Lok Yeay Mao statue, historic French hill station, and Popokvil Waterfall.',
    location: {
      lat: 10.6272,
      lng: 104.0258,
      address: 'Preah Monivong Bokor National Park, Kampot',
      province: 'Kampot'
    },
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80',
    tags: ['Cool Mountain Breeze', 'Lok Yeay Mao Statue', 'Mist & Clouds', 'French Colonial Ruins'],
    transportTips: '32km scenic winding mountain road from Kampot town. Scooter or taxi tour ($25).',
    entryFee: 'Free park entry'
  },

  // KEP
  {
    id: 'kh-kep-1',
    title: 'Kep Crab Market & Fresh Seafood Stalls',
    khmerName: 'ផ្សារក្តាម កែប',
    province: 'Kep',
    category: 'Street Food & Dining',
    rating: 4.8,
    reviewCount: 6100,
    description: 'Watch local fishermen haul fresh blue swimmer crabs right out of the Gulf of Thailand. Enjoy stir-fried crab with fresh green Kampot pepper corns.',
    location: {
      lat: 10.4833,
      lng: 104.2833,
      address: 'Crab Market Road, Kep Promenade, Kep',
      province: 'Kep'
    },
    image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=1000&q=80',
    tags: ['Fresh Blue Crab', 'Kampot Pepper Crab', 'Seafood Sunset', 'Local Fishermen'],
    transportTips: '25-min drive from Kampot town ($8 tuk-tuk or scooter ride).',
    entryFee: 'Free entry (Crab meals approx $6 - $12/kg)'
  },
  {
    id: 'kh-kep-2',
    title: 'Kep National Park & Sunset Rock Trail',
    khmerName: 'ឧទ្យានជាតិកែប',
    province: 'Kep',
    category: 'Nature & Adventure',
    rating: 4.7,
    reviewCount: 3900,
    description: 'Lush coastal jungle mountain featuring an 8km shaded main loop trail with panoramic views overlooking Phu Quoc Island, Bokor Mountain, and ocean sunsets.',
    location: {
      lat: 10.4891,
      lng: 104.3012,
      address: 'Kep National Park, Kep',
      province: 'Kep'
    },
    image: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1000&q=80',
    tags: ['Jungle Hiking', 'Sunset Rock View', 'Ocean Panorama', 'Shaded Trail'],
    transportTips: 'Park entrance is near Led Zep Cafe behind Kep Beach. Scooter or foot access.',
    entryFee: '$1 Park Maintenance Ticket'
  },

  // BATTAMBANG
  {
    id: 'kh-btb-1',
    title: 'Battambang Bamboo Train & Phnom Sampov Bat Cave',
    khmerName: 'រថភ្លើងឫស្សី និង ភ្នំសំពៅ បាត់ដំបង',
    province: 'Battambang',
    category: 'Youth Experience',
    rating: 4.8,
    reviewCount: 9400,
    description: 'Ride the iconic unique "Norry" bamboo train through rice paddies, then watch millions of bats fly out of Phnom Sampov mountain at dusk.',
    location: {
      lat: 13.0957,
      lng: 103.2022,
      address: 'O Dambang Village & Phnom Sampov, Battambang',
      province: 'Battambang'
    },
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80',
    tags: ['Bamboo Train Norry', 'Millions of Bats', 'Dusk Spectacle', 'Rice Fields'],
    transportTips: 'Hire a friendly local youth guide with tuk-tuk for $15 half day.',
    entryFee: '$5 for Bamboo train ride'
  },

  // KOH RONG & SIHANOUKVILLE
  {
    id: 'kh-kr-1',
    title: 'Koh Rong Sanloem Bioluminescent Bay & Clear Beaches',
    khmerName: 'កោះរ៉ុងសន្លឹម',
    province: 'Koh Rong & Sihanoukville',
    category: 'Beach & Island',
    rating: 4.9,
    reviewCount: 11200,
    description: 'Pristine tropical island with white flour sand beaches, crystal turquoise waters, and night swimming with glowing blue bioluminescent plankton.',
    location: {
      lat: 10.5892,
      lng: 103.3088,
      address: 'Saracen Bay, Koh Rong Sanloem Island',
      province: 'Koh Rong & Sihanoukville'
    },
    image: 'https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?auto=format&fit=crop&w=1000&q=80',
    tags: ['Bioluminescent Plankton', 'White Sand Beach', 'Island Paradise', 'Snorkeling'],
    transportTips: '45-min speed ferry from Sihanoukville Autonomous Port ($25 roundtrip).',
    entryFee: 'Free island access'
  },

  // MONDULKIRI
  {
    id: 'kh-mk-1',
    title: 'Mondulkiri Elephant Valley & Bousra Waterfall',
    khmerName: 'ទឹកជ្រោះប៊ូស្រា មណ្ឌលគិរី',
    province: 'Mondulkiri',
    category: 'Nature & Adventure',
    rating: 4.9,
    reviewCount: 4300,
    description: 'Cool highland sanctuary with pine forests, indigenous Bunong culture, ethical elephant encounters, and double-tier Bousra Waterfall.',
    location: {
      lat: 12.4552,
      lng: 107.1911,
      address: 'Pech Chreada District, Mondulkiri',
      province: 'Mondulkiri'
    },
    image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1000&q=80',
    tags: ['Highland Pines', 'Bousra Waterfall', 'Ethical Elephants', 'Bunong Culture'],
    transportTips: 'Book a minivan from Phnom Penh (approx 5 hours) or local motorbike in Sen Monorom.',
    entryFee: '$2.50 entrance for Bousra Waterfall'
  },

  // PREAH VIHEAR
  {
    id: 'kh-pv-1',
    title: 'Preah Vihear Cliffside Temple Sanctuary',
    khmerName: 'ប្រាសាទព្រះវិហារ',
    province: 'Preah Vihear',
    category: 'Temple & Heritage',
    rating: 4.9,
    reviewCount: 5200,
    description: 'Majestic 11th-century mountain temple perched dramatically on a 525-meter cliff edge in the Dângrêk Mountains, offering breathtaking views into the plains.',
    location: {
      lat: 14.3912,
      lng: 104.6801,
      address: 'Choam Khsant District, Preah Vihear',
      province: 'Preah Vihear'
    },
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1000&q=80',
    tags: ['UNESCO World Heritage', 'Cliffside Views', 'Dângrêk Mountain', 'Khmer Masterpiece'],
    transportTips: '4WD mountain pickup or 1.5-hour drive from Siem Reap ($10 4WD ride to summit).',
    entryFee: '$10 ticket + local mountain transfer'
  },

  // KRATIE
  {
    id: 'kh-kt-1',
    title: 'Kratie Mekong Irrawaddy Dolphin Sanctuary & Koh Trong',
    khmerName: 'សហគមន៍ផ្សោតកាំពីរ ក្រចេះ',
    province: 'Kratie',
    category: 'Nature & Adventure',
    rating: 4.8,
    reviewCount: 3800,
    description: 'Observe rare, endangered freshwater Irrawaddy dolphins surfacing in the Mekong River at Kampi pool, followed by peaceful cycling around green Koh Trong island.',
    location: {
      lat: 12.5938,
      lng: 106.0181,
      address: 'Kampi Pool, Sambour District, Kratie',
      province: 'Kratie'
    },
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1000&q=80',
    tags: ['Mekong Dolphins', 'Irrawaddy Dolphins', 'Koh Trong Cycling', 'Eco-Tourism'],
    transportTips: '15km north of Kratie town along the Mekong river road. Boat hire $9/person.',
    entryFee: '$9 dolphin observation boat'
  },

  // KOH KONG
  {
    id: 'kh-kk-1',
    title: 'Koh Kong Tatai River & Cardamom Mountains Jungle',
    khmerName: 'ទឹកជ្រោះតាតៃ កោះកុង',
    province: 'Koh Kong',
    category: 'Nature & Adventure',
    rating: 4.9,
    reviewCount: 2900,
    description: 'Deep wilderness eco-adventure featuring floating river lodges, Tatai double-tier river waterfall, and kayaking through the pristine Cardamom Rainforest.',
    location: {
      lat: 11.5812,
      lng: 103.1124,
      address: 'Tatai River Bridge, Koh Kong',
      province: 'Koh Kong'
    },
    image: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1000&q=80',
    tags: ['Cardamom Mountains', 'Tatai River Waterfall', 'Floating Eco-Lodges', 'Jungle Kayaking'],
    transportTips: '20-min boat trip from Tatai Bridge. Easily reached via Koh Kong highway bus.',
    entryFee: '$2 local boat transfer to waterfall'
  },

  // RATANAKIRI
  {
    id: 'kh-rtk-1',
    title: 'Yeak Laom Volcanic Crater Lake (Banlung)',
    khmerName: 'បឹងយក្សឡោម រតនគិរី',
    province: 'Ratanakiri',
    category: 'Nature & Culture',
    rating: 4.9,
    reviewCount: 3100,
    description: 'Perfectly circular 700,000-year-old volcanic crater lake filled with emerald crystal-clear water, protected by sacred forests of indigenous Tampuen communities.',
    location: {
      lat: 13.7314,
      lng: 107.0142,
      address: 'Banlung Town, Ratanakiri',
      province: 'Ratanakiri'
    },
    image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1000&q=80',
    tags: ['Volcanic Crater Lake', 'Emerald Swim', 'Indigenous Tribal Culture', 'Sacred Forest'],
    transportTips: '5km east of Banlung center. Easy 10-min tuk-tuk or scooter drive.',
    entryFee: '$2 entry fee'
  },

  // PURSAT
  {
    id: 'kh-ps-1',
    title: 'Kampong Luong Floating City (Tonle Sap)',
    khmerName: 'កំពង់លួង ពោធិ៍សាត់',
    province: 'Pursat',
    category: 'Nature & Culture',
    rating: 4.7,
    reviewCount: 2100,
    description: 'A bustling, self-contained floating city of 7,000 residents complete with floating schools, ice factories, gas stations, pagodas, and floating clinics.',
    location: {
      lat: 12.5689,
      lng: 104.2056,
      address: 'Krakor District, Pursat Province',
      province: 'Pursat'
    },
    image: 'https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=1000&q=80',
    tags: ['Floating City', 'Tonle Sap Community', 'Local River Life', 'Cultural Exploration'],
    transportTips: '35km from Pursat town. Hire a wooden motorboat at Krakor pier ($12-$15).',
    entryFee: '$10 boat tour ticket'
  },

  // KANDAL / OUDONG
  {
    id: 'kh-kdl-1',
    title: 'Oudong Mountain Royal Stupas & Ancient Capital',
    khmerName: 'ភ្នំព្រះរាជទ្រព្យ (ឧដុង្គ)',
    province: 'Kandal',
    category: 'Temple & Heritage',
    rating: 4.8,
    reviewCount: 4600,
    description: 'Sacred mountain ridge featuring 500 stone steps leading to grand stupas housing ashes of ancient Khmer kings, surrounded by sweeping green palm fields.',
    location: {
      lat: 11.8123,
      lng: 104.7521,
      address: 'Ponhea Lueu District, Kandal',
      province: 'Kandal'
    },
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1000&q=80',
    tags: ['Former Royal Capital', 'King Stupas', 'Hilltop Panorama', 'Khmer Pilgrimage'],
    transportTips: '40km north of Phnom Penh. 1-hour drive via tuk-tuk or taxi ($20 roundtrip).',
    entryFee: 'Free ($1 donation for staircase upkeep)'
  }
];
