import { ModelProfile, MoodCategory, WinningExample } from './types';

export const INITIAL_MODELS: ModelProfile[] = [
  {
    id: 'sophia',
    name: 'Sophia',
    age: 25,
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80',
    location: 'Vit dans le 34',
    personality: 'Drôle, taquine, proche de sa communauté, aime raconter des anecdotes',
    realLifeOccupation: 'Marchand d’art / achat-revente d’œuvres',
    objective: 'Faire répondre et créer une relation',
    themes: ['France', 'Paris', 'art', 'café', 'voyages', 'sport', 'shopping', 'cuisine', 'famille', 'chiens', 'soirées', 'métro', 'quotidien'],
    tone: 'Naturel, curieux, chaleureux, léger',
    homeHabits: 'Miroir de chambre, salon lumineux (dans le 34), café du matin, livres d’art et lit défait',
    favoriteEmojis: ['✨', '☕', '🎨', '🫦', '🤍'],
    defaultLanguage: 'fr',
    preferredPlatforms: ['onlyfans', 'mym'],
    customToneNotes: 'Ton naturel, curieux, chaleureux et taquin. Objectif : faire répondre et créer une relation. Raconte des micro-anecdotes du quotidien, affirmations directes.'
  },
  {
    id: 'eden',
    name: 'Eden',
    age: 23,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    location: 'Paris',
    personality: 'Sensuelle, naturelle, coquine mais douce, style GFE très spontané.',
    realLifeOccupation: 'Étudiante en communication & passionnée de lingerie commandée en ligne',
    objective: 'Créer de l\'intimité et faire réagir avec authenticité',
    themes: ['mode', 'lingerie', 'thés & bougies', 'Paris', 'soirées'],
    tone: 'Sensuelle, complice, spontanée',
    homeHabits: 'Pieds nus sur son parquet, traîne en nuisette de soie, teste ses colis devant son grand miroir de chambre',
    favoriteEmojis: ['✨', '🙈', '🫦', '🤍', '👀'],
    defaultLanguage: 'fr',
    preferredPlatforms: ['mym', 'onlyfans'],
    customToneNotes: 'Elle parle comme à un mec qu’elle kiffe en secret, affirmations directes, anecdotes à la maison, jamais de questions télémarketing.'
  },
  {
    id: 'chloe',
    name: 'Chloé Monroe',
    age: 25,
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80',
    location: 'Miami / LA',
    personality: 'Pétillante, joueuse, teaseuse assumée, ambiance glam et ultra complice.',
    realLifeOccupation: 'Fitness & pilates girl à domicile, créatrice de contenu mode',
    objective: 'Trigger fast replies & high PPV unlock curiosity',
    themes: ['fitness', 'pilates', 'lingerie', 'sunshine', 'smoothies'],
    tone: 'Playful, bold, teasing, confident',
    homeHabits: 'S\'étire sur son tapis de salon en brassière, boit son café matinal en culotte, essaye ses bodys dentelle dans son dressing',
    favoriteEmojis: ['😈', '💦', '🍓', '🤫', '🔥'],
    defaultLanguage: 'us',
    preferredPlatforms: ['onlyfans'],
    customToneNotes: 'Energetic, uses teasing statements and home confessions (ngl, babe, lowkey), never asks needy questions.'
  },
  {
    id: 'lina',
    name: 'Lina V.',
    age: 22,
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
    location: 'Lyon',
    personality: 'Mystérieuse, tactile, aime partager ses moments privés et insolites.',
    realLifeOccupation: 'Étudiante en design d\'intérieur, vit seule dans son appartement cosy',
    objective: 'Créer un mystère nocturne exclusif',
    themes: ['design', 'déco', 'vin', 'bougies', 'nuit'],
    tone: 'Posé, intime, mystérieux',
    homeHabits: 'Bains moussants tardifs à la bougie, lit défait avec ordi portable, chemise blanche d\'homme trop large',
    favoriteEmojis: ['🥀', '🖤', '🍷', '💋', '🌙'],
    defaultLanguage: 'fr',
    preferredPlatforms: ['mym', 'onlyfans'],
    customToneNotes: 'Voix posée, affirmations tranchées, confidences intimes nocturnes dans sa chambre, pousse à réagir par curiosité.'
  }
];

// Curated dataset of proven high-conversion winning mass messages to train the prompt
export const DEFAULT_WINNING_EXAMPLES: WinningExample[] = [
  {
    id: 'win-fr-1',
    title: 'Sortie de douche & goutte d’eau',
    platform: 'onlyfans',
    language: 'fr',
    mood: 'shower_bath',
    revenueGenerated: '1 820 €',
    openRate: '94%',
    notes: 'Attaque directe en minuscule sans intro protocolaire. Accroche visuelle sensorielle très forte.',
    text: `tu fais quoi là ? viens m'aider un peu... 🚿\n\nje sors à peine de la douche, mes cheveux sont encore trempés et ma serviette vient de glisser toute seule sur le carrelage 🙈\n\nj'ai allumé la caméra pile au bon moment... regarde comme j'avais chaud 🫦`
  },
  {
    id: 'win-fr-2',
    title: 'GFE Nuit blanche / Pensée coquine',
    platform: 'mym',
    language: 'fr',
    mood: 'late_night',
    revenueGenerated: '2 150 €',
    openRate: '91%',
    notes: 'Formule complice façon petite amie qui ne trouve pas le sommeil. Aucun mot commercial.',
    text: `t'es encore réveillé ou tu dors déjà ? 🥺\n\nimpossible de fermer l'œil ce soir, je tourne dans mes draps et j'arrête pas de repenser à tes messages... du coup j'ai craqué et j'ai fait une petite bêtise sous ma couette ✨\n\nje te montre ? mais promets-moi que ça reste qu'entre nous 🤍`
  },
  {
    id: 'win-us-1',
    title: 'US Late Night Hotel Tease',
    platform: 'onlyfans',
    language: 'us',
    mood: 'late_night',
    revenueGenerated: '$2,840',
    openRate: '96%',
    notes: 'Short sentence rhythm, playful rhetorical question, high conversion trigger.',
    text: `be completely honest with me... would you let me walk around your room like this? 🙈\n\ni was trying on this tiny silk dress and kinda ended up taking the whole thing off on camera for you... it got so messy 🫦\n\nunlock below before i get nervous and take it down 🤫✨`
  },
  {
    id: 'win-us-2',
    title: 'US Morning Coffee & Stretch',
    platform: 'onlyfans',
    language: 'us',
    mood: 'morning',
    revenueGenerated: '$1,680',
    openRate: '89%',
    notes: 'Waking up intimate tone, zero filter, natural sleepy glow feeling.',
    text: `morning babe... still in bed with messy hair thinking about you 🤍\n\nmissed having your hands on my waist so i took this right as i woke up... no makeup, totally raw and sweet just for my favorite boy ✨\n\ncome start your day with me 🥰`
  },
  {
    id: 'win-us-3',
    title: 'US One-Line Direct PPV Punch',
    platform: 'onlyfans',
    language: 'us',
    mood: 'positions_hot',
    revenueGenerated: '$3,420',
    openRate: '97%',
    notes: 'Single punchy line with zero fluff, high curiosity and urgent unlock tension.',
    text: `did something on camera today that i promised myself i would never post publicly... unlock to see what i did 🫦`
  },
  {
    id: 'win-us-4',
    title: 'US Afternoon Spontaneous Tease (1-2 Sentences)',
    platform: 'onlyfans',
    language: 'us',
    mood: 'hot',
    revenueGenerated: '$2,190',
    openRate: '93%',
    notes: 'Short, direct, intimate texting style with instant visual trigger.',
    text: `quick break from my day in sheer lace... tell me what you would do if you walked in on me right now 🫦`
  }
];

export interface MoodDetail {
  id: MoodCategory;
  name: string;
  nameEn: string;
  badge: string;
  iconName: string;
  accentColor: string;
  recommendedHours: string;
  promptGuidanceFr: string;
  promptGuidanceUs: string;
}

export const MOODS: MoodDetail[] = [
  {
    id: 'gfe',
    name: 'GFE / Petite Copine',
    nameEn: 'Girlfriend Experience',
    badge: 'Tendre & Proche',
    iconName: 'Heart',
    accentColor: 'rose',
    recommendedHours: '12h00 - 15h00 ou 19h00 - 21h00',
    promptGuidanceFr: 'Parle comme une copine complice qui envoie une photo imprévue. Zéro esprit commercial, beaucoup d intimité sincère.',
    promptGuidanceUs: 'Natural sweet girlfriend vibe, casual checking in, feeling close and affectionate, teasingly vulnerable.'
  },
  {
    id: 'hot',
    name: 'Hot & Teasing Audacieux',
    nameEn: 'Sensual & Explicit Tease',
    badge: 'Forte Conversion',
    iconName: 'Flame',
    accentColor: 'amber',
    recommendedHours: '21h30 - 01h00',
    promptGuidanceFr: 'Ton torride, suggestif et direct. Elle a envie d être regardée et décrit brièvement la sensation ou ce qu elle est en train de faire.',
    promptGuidanceUs: 'Spicy teasing, high craving energy, descriptive preview of the video/photo that leaves no doubt it is unmissable.'
  },
  {
    id: 'morning',
    name: 'Réveil / Sortie du Lit',
    nameEn: 'Morning Stretch & Bed',
    badge: 'Spontané du matin',
    iconName: 'Sun',
    accentColor: 'orange',
    recommendedHours: '07h30 - 10h00',
    promptGuidanceFr: 'Encore à moitié endormie, cheveux en bataille, nuisette ou nue sous la couette. Premier réflexe de la journée.',
    promptGuidanceUs: 'Bedhead, sleepy morning stretches, waking up thinking about him, coffee and morning glow.'
  },
  {
    id: 'shower_bath',
    name: 'Douche & Sortie de Bain',
    nameEn: 'Shower & Wet Tease',
    badge: 'Sensuel Humide',
    iconName: 'Droplets',
    accentColor: 'sky',
    recommendedHours: '18h00 - 20h30 ou 22h00',
    promptGuidanceFr: 'Gouttes d eau sur la peau, serviette qui tient à peine, vapeur d eau chaude, envie de compagnie.',
    promptGuidanceUs: 'Steamy shower vibes, towel dropping, warm water, wet hair and fresh silky skin.'
  },
  {
    id: 'late_night',
    name: 'Insomnie / Nuit Tardive',
    nameEn: 'Late Night / Can’t Sleep',
    badge: 'Nocturne Secret',
    iconName: 'Moon',
    accentColor: 'indigo',
    recommendedHours: '23h30 - 03h00',
    promptGuidanceFr: 'Chambre sombre, seule dans ses draps, impossible de trouver le sommeil, recherche de chaleur.',
    promptGuidanceUs: 'Late night confessions, dark room, tossing and turning, lonely and horny thoughts.'
  },
  {
    id: 'exclusive_vip',
    name: 'VIP & Ultra Exclusif',
    nameEn: 'Rare VIP Secret Drop',
    badge: 'Panier Élevé',
    iconName: 'Crown',
    accentColor: 'purple',
    recommendedHours: '20h00 - 23h00 (Vendredi/Samedi)',
    promptGuidanceFr: 'Pour les privilégiés, média jamais posté ailleurs, limite interdit, ton confidentiel exclusif.',
    promptGuidanceUs: 'High roller treatment, restricted vault content, private and raw, high value PPV appeal.'
  },
  {
    id: 'interactive',
    name: 'Interactif & Dilemme',
    nameEn: 'Interactive Poll & Choice',
    badge: 'Fort Engagement',
    iconName: 'Sparkles',
    accentColor: 'emerald',
    recommendedHours: '16h00 - 19h00',
    promptGuidanceFr: 'Elle hésite entre 2 tenues ou 2 positions, demande l avis du fan et promet de lui montrer la suite en privé.',
    promptGuidanceUs: 'Voting game, which outfit should she wear, or what should she do next? High reply rate trigger.'
  },
  {
    id: 'flash_sale',
    name: 'Vente Flash Chrono',
    nameEn: 'Flash Deal / Countdown',
    badge: 'Urgence / FOMO',
    iconName: 'Zap',
    accentColor: 'yellow',
    recommendedHours: 'Créneau court (2h à 4h de validité)',
    promptGuidanceFr: 'Prix cassé pour les premières minutes, sentiment d urgence amical, opportunité unique.',
    promptGuidanceUs: 'Urgent price drop for the next few unlocked, spontaneous excitement, don’t miss it.'
  },
  {
    id: 'positions_hot',
    name: 'Positions & Angles Hot',
    nameEn: 'Positions & Angles',
    badge: 'Très Torride',
    iconName: 'Compass',
    accentColor: 'rose',
    recommendedHours: '21h00 - 02h00',
    promptGuidanceFr: 'Questions directes et audacieuses sur les positions préférées (cambrée sur le lit, à genoux, au-dessus, prise par surprise), dilemmes piquants pour forcer le fan à s\'imaginer avec elle et à réagir immédiatement.',
    promptGuidanceUs: 'Bold and teasing questions/dilemmas on favorite intimate positions (arched on the bed, riding, taken from behind), making the fan picture it and respond instantly.'
  },
  {
    id: 'body_explicit',
    name: 'Corps & Détails Sans Filtre',
    nameEn: 'Body & Explicit Curves',
    badge: 'Ultra Direct',
    iconName: 'Flame',
    accentColor: 'amber',
    recommendedHours: '20h00 - 03h00',
    promptGuidanceFr: 'Focalisation assumée sur les détails du corps (poitrine/seins lourds qui débordent, cambrure, fesses/cul moulé, dentelle transparente, lingerie trempée). Ton ultra-sensuel, décomplexé et sans fausse pudeur.',
    promptGuidanceUs: 'Unfiltered, sensual focus on body details (chest, sheer lace, arch, waist, hips, wet skin). Raw, confident, totally unapologetic.'
  },
  {
    id: 'fantasies_taboo',
    name: 'Fantasmes & Interdits',
    nameEn: 'Fantasies & Forbidden',
    badge: 'Secret & Tabou',
    iconName: 'Sparkles',
    accentColor: 'purple',
    recommendedHours: '22h00 - 03h30',
    promptGuidanceFr: 'Confidences intimes sur des désirs inavoués, scénarios tabous, pensées interdites et questions directes sur les délires les plus inavouables du fan.',
    promptGuidanceUs: 'Secret confessions about unspoken desires, taboo scenarios, forbidden thoughts, and direct provocative questions about his deepest fantasies.'
  },
  {
    id: 'dirty_talk',
    name: 'Dirty Talk & Provocation',
    nameEn: 'Dirty Talk & Raw Vibe',
    badge: 'Piquant & Brut',
    iconName: 'Zap',
    accentColor: 'rose',
    recommendedHours: '22h00 - 04h00',
    promptGuidanceFr: 'Langage direct, complice et cru sans vulgarité gratuite. Provocations sensuelles, excitation partagée, chuchotements brûlants qui font monter la température en une phrase.',
    promptGuidanceUs: 'Raw, playful dirty talk and unapologetic sensual provocations that push his buttons and demand immediate private response.'
  }
];

export function getMoodDetail(mood: MoodCategory): MoodDetail | undefined {
  return MOODS.find(m => m.id === mood);
}

export const TIME_ZONES = [
  { id: 'FR_CET', label: 'France / Europe (Paris CET)', tz: 'Europe/Paris', flag: '🇫🇷', offsetHours: 1 },
  { id: 'US_EST', label: 'USA Est (New York / Miami EST)', tz: 'America/New_York', flag: '🇺🇸', offsetHours: -5 },
  { id: 'US_CST', label: 'USA Centre (Chicago / Texas CST)', tz: 'America/Chicago', flag: '🇺🇸', offsetHours: -6 },
  { id: 'US_PST', label: 'USA Ouest (Los Angeles / Vegas PST)', tz: 'America/Los_Angeles', flag: '🇺🇸', offsetHours: -8 },
] as const;

export const OPENROUTER_MODELS = [
  { id: '@preset/push-bot', name: 'Preset Bot Push (@preset/push-bot)', provider: 'OpenRouter Preset', badge: 'Ton Preset Free' },
  { id: 'openrouter/free', name: 'OpenRouter Free (Auto-routeur 100% Gratuit)', provider: 'OpenRouter', badge: '100% Gratuit' },
  { id: 'meta-llama/llama-3.3-70b-instruct:free', name: 'Llama 3.3 70B Instruct Free', provider: 'Meta (Gratuit)', badge: 'Top 70B Free' },
  { id: 'mistralai/mistral-small-24b-instruct-2501:free', name: 'Mistral Small 24B Free (Plume FR/US)', provider: 'Mistral (Gratuit)', badge: 'Top FR/US Free' },
  { id: 'google/gemma-4-31b-it:free', name: 'Gemma 4 31B Instruct Free (Google)', provider: 'Google (Gratuit)', badge: '100% Gratuit' },
  { id: 'nvidia/nemotron-3.5-lightning:free', name: 'Nemotron 3.5 Lightning Free', provider: 'Nvidia (Gratuit)', badge: '100% Gratuit' },
  { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet (Ultra Naturel & Nuancé)', provider: 'Anthropic', badge: 'Payant' },
  { id: 'openai/gpt-4o', name: 'GPT-4o (Rapide & Direct)', provider: 'OpenAI', badge: 'Payant' },
  { id: 'deepseek/deepseek-chat', name: 'DeepSeek Chat V3 (Économique & Fluide)', provider: 'DeepSeek', badge: 'Éco' },
  { id: 'mistralai/mistral-large-2411', name: 'Mistral Large 2 (Excellente plume FR)', provider: 'Mistral', badge: 'Top FR' },
];

export const GROQ_MODELS = [
  { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B Versatile (Ultra-Rapide & Puissant)', provider: 'Meta via Groq', badge: 'Recommandé Gratuit' },
  { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B (Rapide & Fluide)', provider: 'Mistral via Groq', badge: '100% Gratuit' },
  { id: 'gemma2-9b-it', name: 'Gemma 2 9B IT (Direct & Léger)', provider: 'Google via Groq', badge: '100% Gratuit' },
  { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B Instant (Ultra-Flash)', provider: 'Meta via Groq', badge: 'Flash' },
];

export const MISTRAL_MODELS = [
  { id: 'mistral-small-latest', name: 'Mistral Small (Plume Française de référence)', provider: 'Mistral AI', badge: 'Recommandé Gratuit' },
  { id: 'open-mistral-nemo', name: 'Mistral NeMo 12B (Créatif & Naturel)', provider: 'Mistral AI', badge: '100% Gratuit' },
  { id: 'ministral-8b-latest', name: 'Ministral 8B (Accroches percutantes)', provider: 'Mistral AI', badge: 'Rapide' },
  { id: 'mistral-large-latest', name: 'Mistral Large (Qualité Écriture Maximale)', provider: 'Mistral AI', badge: 'Top Plume' },
];
