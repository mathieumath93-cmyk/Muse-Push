export type Platform = 'onlyfans' | 'mym';
export type Language = 'fr' | 'us';
export type PushType = 'paid_ppv' | 'free_retention';
export type SentenceLength = 'one_line' | 'ultra_short' | 'short' | 'medium';
export type VarietyLevel = 'low' | 'medium' | 'high'; // 'low' (faible), 'medium' (moyenne), 'high' (élevée)

export type MoodCategory = 
  | 'gfe'             // Girlfriend Experience, tendre, intime, complice
  | 'hot'             // Sexy, chaud, teasing explicite ou torride
  | 'morning'         // Réveil, lit, étirements, café, pyjama
  | 'shower_bath'     // Sortie de douche, bain moussant, serviette
  | 'late_night'      // Nuit tardive, insomnie, pensées chaudes
  | 'exclusive_vip'   // VIP restreint, contenu rare, secret
  | 'interactive'     // Question, jeu, choix de tenue/position
  | 'flash_sale'      // Offre flash chrono, promo exclusive
  | 'positions_hot'   // Questions positions intimes, cambrure sur le lit, angles torrides
  | 'body_explicit'   // Anatomie intime, seins, fesses, décolleté, courbes sensuelles & directes
  | 'fantasies_taboo' // Fantasmes secrets, pensées inavouées, scénarios interdits
  | 'dirty_talk';     // Provocations sans filtre, excitation brute, langage cru & complice

export interface ModelProfile {
  id: string;
  name: string;
  age: number;
  avatar: string;
  personality: string;
  realLifeOccupation?: string; // Ex: Marchand d'art, étudiante en droit, etc.
  homeHabits?: string; // Ex: Traîne en nuisette, miroir chambre, thés & bougies
  location?: string; // Ex: Vit dans le 34, Paris, Nice, Miami
  objective?: string; // Ex: Faire répondre et créer une relation, booster les pourboires
  themes?: string[]; // Ex: ["France", "Paris", "art", "café", "voyages", "cuisine"]
  tone?: string; // Ex: Naturel, curieux, chaleureux, léger
  favoriteEmojis: string[];
  defaultLanguage: Language;
  preferredPlatforms: Platform[];
  customToneNotes: string;
}

// Few-Shot Training Example (Winning push that generated high unlock / tips)
export interface WinningExample {
  id: string;
  title: string;
  platform: Platform;
  language: Language;
  mood: MoodCategory;
  text: string;
  revenueGenerated?: string; // ex: "1,450 $"
  openRate?: string; // ex: "92%"
  notes?: string; // ex: "L'accroche sur le miroir embué a fait x3 sur les déblocages"
  isCustom?: boolean;
}

export interface PushRequestConfig {
  modelId: string;
  platform: Platform;
  language: Language;
  pushType: PushType; // 'paid_ppv' (PPV verrouillé) vs 'free_retention' (Message direct offert/relationnel)
  sentenceCount: SentenceLength; // 'ultra_short' (1-2 phrases), 'short' (2-3 phrases), 'medium' (3-4 phrases)
  varietyLevel?: VarietyLevel; // 'low' (faible), 'medium' (moyenne), 'high' (élevée)
  mood: MoodCategory;
  mediaType: 'photo_set' | 'video_clip' | 'full_tape' | 'audio_voice' | 'exclusive_bundle' | 'none';
  priceSuggestion?: number; // in $ or €
  mediaContext: string; // Ex: "Petite robe satin qui glisse", "Sous la douche en train de me savonner", etc.
  callToAction: 'unlock_ppv' | 'tip_reply' | 'poll_answer' | 'dm_talk';
  targetAudience: 'all_subs' | 'renew_on' | 'vip_spenders' | 'inactive_subs';
  hotLevel: number; // 1 to 5
  timeContext: {
    selectedTzZone: 'FR_CET' | 'US_EST' | 'US_CST' | 'US_PST' | 'LOCAL';
    customHour?: number;
    customMinute?: number;
    useCurrentTime: boolean;
    calculatedHour?: string;
    resolvedPeriod?: string;
  };
  openRouterConfig?: {
    apiKey?: string;
    model?: string;
    temperature?: number;
  };
  // Few-shot training context passed to LLM
  trainingExamples?: WinningExample[];
  agencyPlaybookRules?: string; // Rules like "Never say subscribe", "Always use 2 lowercase words at the start", etc.
  previousMessages?: string[]; // Anti-repetition blacklist: previously generated phrases to exclude
}

export interface GeneratedVariation {
  id: string;
  angle: string;
  angleLabel: string;
  message: string;
  estimatedOpenRate: string;
  suggestedPrice?: string;
  mediaNotice?: string;
  timeContextNote: string;
}

export type AiProviderId = 'groq' | 'mistral' | 'openrouter' | 'studio';

export interface ProviderStatusInfo {
  provider: AiProviderId;
  attempted: boolean;
  success: boolean;
  error?: string;
  model?: string;
  latencyMs?: number;
  creditInfo?: string;
}

export interface OpenRouterStatusInfo {
  attempted: boolean;
  success: boolean;
  error?: string;
  model?: string;
  latencyMs?: number;
  creditInfo?: string;
}

export interface OpenRouterTestResult {
  success: boolean;
  status: 'connected' | 'error' | 'warning';
  message: string;
  model?: string;
  creditInfo?: string;
  latencyMs?: number;
  needsPrivacyAction?: boolean;
}

export interface GenerationResult {
  success: boolean;
  modelUsed: string;
  source: 'openrouter' | 'groq' | 'mistral' | 'fallback_engine' | 'gemini';
  providerStatus?: ProviderStatusInfo;
  openRouterStatus?: OpenRouterStatusInfo;
  variations: GeneratedVariation[];
  activeParametersSummary?: {
    mood: string;
    audience?: string;
    hotLevel?: number;
    mediaContext?: string;
    timeContext?: string;
    varietyLevel?: string;
    pushType?: string;
    sentenceCount?: string;
    hasMediaContext?: boolean;
    hasPreviousMessagesAvoidance?: boolean;
    antiRepetitionCount?: number;
    timeZone?: string;
    fanTime?: string;
    period?: string;
    [key: string]: any;
  };
  recommendations: {
    bestSendTimeFanTz: string;
    currentFanLocalTime: string;
    pricingTip: string;
    safetyAudit: string;
  };
}
