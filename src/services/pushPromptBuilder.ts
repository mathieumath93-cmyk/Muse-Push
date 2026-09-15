import { 
  ModelProfile, 
  Platform, 
  Language, 
  MoodCategory, 
  SentenceLength, 
  VarietyLevel,
  WinningExample 
} from '../types';
import { getResolvedTime, TzZone, ResolvedTimeContext } from '../utils/timeZoneHelper';
import { getMoodDetail } from '../data';

export interface PsychologicalTrigger {
  id: string;
  labelFr: string;
  labelUs: string;
  instructionFr: string;
  instructionUs: string;
}

export const PSYCHOLOGICAL_TRIGGERS: PsychologicalTrigger[] = [
  {
    id: 'aveu_brut',
    labelFr: 'Aveu brut & spontané',
    labelUs: 'Raw Spontaneous Confession',
    instructionFr: 'Pensée intime ou pulsion lâchée sans filtre ni calcul, comme un SMS impulsif.',
    instructionUs: 'Intimate unfiltered thought or sudden urge sent on impulse, like a raw late-second text.'
  },
  {
    id: 'defi_ego',
    labelFr: 'Pique d\'orgueil & Défi joueur',
    labelUs: 'Ego Tease & Playful Challenge',
    instructionFr: 'Pique taquine sur sa résistance masculine, son self-control ou sa réaction s\'il était présent.',
    instructionUs: 'Playful challenge testing his self-control, endurance, or reaction if he were right there.'
  },
  {
    id: 'detail_sensoriel',
    labelFr: 'Détail sensoriel & tactile',
    labelUs: 'Sensory & Tactile Detail',
    instructionFr: 'Zoom troublant sur une sensation physique : peau chaude, tissu transparent, frisson, parfum, eau.',
    instructionUs: 'Vivid sensory focus on physical sensation: warm skin, sheer fabric, goosebumps, scent, droplets.'
  },
  {
    id: 'pensee_impulsive',
    labelFr: 'Pensée impulsive à voix haute',
    labelUs: 'Impulsive Thought Out Loud',
    instructionFr: 'Un flash spontané partagé sur le vif sans fard, une réflexion sans retenue.',
    instructionUs: 'Unscripted spontaneous flash shared in the moment, an unfiltered realization.'
  },
  {
    id: 'dilemme_direct',
    labelFr: 'Dilemme direct & complice',
    labelUs: 'Direct Playful Dilemma',
    instructionFr: 'Forcer un choix tranché et très chaud entre deux options précises.',
    instructionUs: 'Force an instant, provocative choice between two highly specific options.'
  },
  {
    id: 'secret_murmure',
    labelFr: 'Secret intime murmuré',
    labelUs: 'Whispered Insider Secret',
    instructionFr: 'Confession feutrée d\'une chose que personne d\'autre ne sait ou n\'a vue.',
    instructionUs: 'Intimate whispered secret of something nobody else knows or has ever seen.'
  },
  {
    id: 'constat_decomplexe',
    labelFr: 'Constat décomplexé sans filtre',
    labelUs: 'Unapologetic Raw Statement',
    instructionFr: 'Affirmation audacieuse, sûre de son charme et sans chercher la validation.',
    instructionUs: 'Bold unapologetic observation, confident in her appeal with zero hesitation.'
  },
  {
    id: 'gaffe_mignonne',
    labelFr: 'Imprévu / Instant non coupé',
    labelUs: 'Unedited Slip / Behind-the-Scenes',
    instructionFr: 'Un moment authentique, une tenue qui a glissé ou un détail imprévu gardé dans la vidéo.',
    instructionUs: 'Authentic candid moment, an unexpected slip of clothing or unedited raw reaction left in.'
  },
  {
    id: 'question_troublante',
    labelFr: 'Question troublante',
    labelUs: 'Provocative Question',
    instructionFr: 'Interrogation intime qui allume immédiatement l\'imaginaire du fan.',
    instructionUs: 'Intimate question that instantly sets his imagination on fire.'
  },
  {
    id: 'provocation_douce',
    labelFr: 'Provocation douce & taquine',
    labelUs: 'Sweet Provocation & Tease',
    instructionFr: 'Morsure légère qui titille l\'envie avec un sourire en coin.',
    instructionUs: 'Sweet bite that tempts desire with a playful smirk.'
  },
  {
    id: 'exclusivite_vip',
    labelFr: 'Exclusivité confidentielle',
    labelUs: 'Confidential Exclusivity',
    instructionFr: 'Sentiment de privilège absolu, média réservé au cercle fermé.',
    instructionUs: 'High-privilege tone, content reserved exclusively for her inner circle.'
  },
  {
    id: 'injonction_complice',
    labelFr: 'Injonction complice',
    labelUs: 'Playful Command',
    instructionFr: 'Ordre doux mais ferme qui capte l\'attention dès le premier mot.',
    instructionUs: 'Gentle yet commanding instruction that demands instant attention from word one.'
  },
  {
    id: 'hypothese_chaude',
    labelFr: 'Hypothèse troublante ("Et si...")',
    labelUs: 'Tempting Hypothesis ("What if...")',
    instructionFr: 'Scénario imaginaire immédiat qui projette le fan dans la pièce avec elle.',
    instructionUs: 'Immediate mental scenario placing the fan right inside the room with her.'
  },
  {
    id: 'reaction_a_chaud',
    labelFr: 'Réaction brute à chaud',
    labelUs: 'Raw Immediate Reaction',
    instructionFr: 'Émotion immédiate et essoufflée partagée sur le vif juste après la prise de vue.',
    instructionUs: 'Breathless immediate reaction shared on the spot right after shooting.'
  },
  {
    id: 'curiosite_visuelle',
    labelFr: 'Curiosité visuelle & Teaser',
    labelUs: 'Visual Curiosity & Tease',
    instructionFr: 'Pointer un détail précis de l\'image/vidéo qui rend impossible de ne pas regarder.',
    instructionUs: 'Highlight a specific detail in the frame that makes it impossible to look away.'
  },
  {
    id: 'confidence_chambre',
    labelFr: 'Confidence sous les draps',
    labelUs: 'Pillow Talk Vulnerability',
    instructionFr: 'Proximité intimiste cocon, voix basse, comme si le fan était allongé à côté d\'elle.',
    instructionUs: 'Cozily vulnerable intimacy, soft-spoken, as if the fan were lying right beside her.'
  },
  {
    id: 'contre_pied',
    labelFr: 'Contre-pied inattendu',
    labelUs: 'Unexpected Plot Twist',
    instructionFr: 'Prendre l\'opposé d\'une phrase de charme convenue pour surprendre totalement.',
    instructionUs: 'Flip expected seduction tropes upside down to create pure surprise.'
  },
  {
    id: 'appel_regard',
    labelFr: 'Mise au défi du regard',
    labelUs: 'Direct Gaze Challenge',
    instructionFr: 'Mise au défi directe sur ce qu\'elle ose montrer ou cacher.',
    instructionUs: 'Direct challenge on what she dares to reveal or conceal.'
  }
];

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export interface BuildPushPromptsParams {
  modelProfile?: ModelProfile;
  platform: Platform;
  language: Language;
  pushType: 'paid_ppv' | 'free_retention';
  sentenceCount: SentenceLength;
  varietyLevel?: VarietyLevel;
  mood: MoodCategory;
  mediaType: string;
  priceSuggestion?: number;
  mediaContext?: string;
  callToAction: string;
  targetAudience: string;
  hotLevel: number;
  timeContext?: {
    selectedTzZone?: TzZone;
    customHour?: number;
    customMinute?: number;
    useCurrentTime?: boolean;
    calculatedHour?: string;
    resolvedPeriod?: string;
  };
  previousMessages?: string[];
  resolvedTime?: ResolvedTimeContext;
  trainingExamples?: WinningExample[];
  agencyPlaybookRules?: string;
  openRouterConfig?: {
    apiKey?: string;
    model?: string;
    temperature?: number;
  };
}

export function buildPushPrompts(params: BuildPushPromptsParams): {
  systemPrompt: string;
  userPrompt: string;
  resolvedTime: ResolvedTimeContext;
  chosenTriggers: PsychologicalTrigger[];
  temperature: number;
  seedNonce: string;
} {
  const {
    modelProfile,
    platform,
    language,
    pushType,
    sentenceCount,
    varietyLevel = 'high',
    mood,
    mediaType,
    priceSuggestion,
    mediaContext = '',
    callToAction,
    targetAudience,
    hotLevel,
    timeContext,
    previousMessages = [],
    trainingExamples,
    agencyPlaybookRules
  } = params;

  const isUs = language === 'us';
  const isPaid = pushType === 'paid_ppv';

  // Resolve exact clock & time of day period
  const resolvedTime = getResolvedTime(
    timeContext?.selectedTzZone || 'FR_CET',
    timeContext?.useCurrentTime ?? true,
    timeContext?.customHour,
    timeContext?.customMinute
  );

  // Pick 6 completely distinct psychological triggers from the 18 available
  const chosenTriggers = shuffleArray(PSYCHOLOGICAL_TRIGGERS).slice(0, 6);

  // High variety temperature calculation: 1.20 for high, 0.85 for medium, 0.45 for low
  const temperature = varietyLevel === 'high' ? 1.20 : (varietyLevel === 'low' ? 0.45 : 0.85);
  const seedNonce = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

  // Mood details
  const moodObj = getMoodDetail(mood);
  const moodName = moodObj ? (isUs ? moodObj.nameEn : moodObj.name) : mood;
  const moodGuidance = moodObj ? (isUs ? moodObj.promptGuidanceUs : moodObj.promptGuidanceFr) : '';

  // Audience specific directives
  let audienceDirective = '';
  switch (targetAudience) {
    case 'vip_spenders':
      audienceDirective = isUs
        ? `TARGET AUDIENCE: VIP TOP SPENDERS (Whales / Big Tippers). Tone MUST be ultra-exclusive, deeply personal, whispered like a private confidante. Treat him like he is the only one in the world allowed into this inner sanctuary. Absolutely zero generic broadcasting.`
        : `AUDIENCE CIBLE : TOP SPENDERS / VIP (Baleines / Gros acheteurs). Le ton DOIT être ultra-exclusif, personnel et feutré, comme un secret entre amants ou privilégiés. Donne-lui l'impression absolue qu'il est le seul au monde à recevoir ce mot. Zéro tournure impersonnelle.`;
      break;
    case 'new_subs':
      audienceDirective = isUs
        ? `TARGET AUDIENCE: NEW SUBSCRIBERS. Welcoming, charmingly magnetic, intriguing first hook that breaks the ice, sets the tone of the relationship, and makes him instantly obsessed with what's to come.`
        : `AUDIENCE CIBLE : NOUVEAUX ABONNÉS. Brise-glace séducteur, piquant et mémorable. Donne le ton de votre complicité et montre-lui immédiatement pourquoi il a fait le meilleur choix en s'abonnant.`;
      break;
    case 'inactive_subs':
      audienceDirective = isUs
        ? `TARGET AUDIENCE: INACTIVE / DORMANT FANS. Electroshock wake-up call! Tease his absence ("did you forget about me?", "you've been quiet..."), playful ego challenge, and an irresistible visual reason to react immediately.`
        : `AUDIENCE CIBLE : ABONNÉS INACTIFS / DORMANTS. Électrochoc de curiosité et réveil immédiat ! Taquinerie sur son silence ("tu m'as oubliée ?", "tu te cachais où ?"), pique d'orgueil complice et visuel troublant qui force une réponse.`;
      break;
    case 'renew_on':
    case 'all_subs':
    default:
      audienceDirective = isUs
        ? `TARGET AUDIENCE: ALL ACTIVE FANS (Mass Blast). Universal magnetic intimacy, spontaneous bedroom storytelling that sparks widespread instant replies.`
        : `AUDIENCE CIBLE : TOUS LES ABONNÉS (Mass Blast). Intimité magnétique universelle, naturel désarmant et accroche spontanée qui suscite un raz-de-marée de réponses.`;
      break;
  }

  // Hot Level guidelines
  let hotLevelDirective = '';
  if (hotLevel >= 4) {
    hotLevelDirective = isUs
      ? `HOT LEVEL: ${hotLevel}/5 (VERY EXPLICIT / UNFILTERED / RAW). Direct, sensual dirty talk, physical details (arched curves, sheer transparent lace, wet skin, bare sheets, breathless intimacy). Zero shame, raw confidence.`
      : `NIVEAU D'AUDACE : ${hotLevel}/5 (TRÈS CHAUD / EXPLICITE / SANS FILTRE). Ton très sensuel, dirty talk assumé, détails intimes sans complexe (cambrure, transparence, peau chaude, draps défaits, souffle court). Décomplexée, brûlante et audacieuse.`;
  } else if (hotLevel === 3) {
    hotLevelDirective = isUs
      ? `HOT LEVEL: 3/5 (SPICY & TEASING). Confident sensual seduction, clever double entendres, playful body teases without being crass.`
      : `NIVEAU D'AUDACE : 3/5 (ÉPICÉ & TAQUIN). Séduction assumée, tension érotique élégante, sous-entendus piquants et jeu sensuel complice sans vulgarité gratuite.`;
  } else {
    hotLevelDirective = isUs
      ? `HOT LEVEL: ${hotLevel}/5 (SOFT / GLAMOUR / GENTLE). Soft, aesthetic, cozy romance, sweet affectionate teasing, romantic closeness.`
      : `NIVEAU D'AUDACE : ${hotLevel}/5 (DOUX / GLAMOUR / ÉLÉGANT). Douceur intime, charme naturel, sensualité subtile et regard complice sans mots crus.`;
  }

  // Sentence length guidelines
  let lengthDirective = '';
  if (sentenceCount === 'one_line') {
    lengthDirective = isUs
      ? `STRICT LENGTH: EXACTLY 1 SINGLE LINE (8 to 15 words max). ZERO line breaks, zero fluff. Direct text-message punch.`
      : `LONGUEUR STRICTE : EXACTEMENT 1 SEULE PHRASE UNIQUE (8 à 15 mots maximum). ZÉRO retour à la ligne, zéro blabla. Style SMS percutant en une ligne.`;
  } else if (sentenceCount === 'ultra_short') {
    lengthDirective = isUs
      ? `STRICT LENGTH: ULTRA-SHORT (1 to 2 short sentences, 15 to 25 words).`
      : `LONGUEUR STRICTE : ULTRA-COURT (1 à 2 phrases courtes, 15 à 25 mots).`;
  } else {
    lengthDirective = isUs
      ? `STRICT LENGTH: SHORT (2 short sentences, 25 to 40 words max).`
      : `LONGUEUR STRICTE : COURT (2 phrases rythmées, 25 à 40 mots max).`;
  }

  // Push Type (Paid PPV vs Free Retention)
  let pushTypeDirective = '';
  if (isPaid) {
    pushTypeDirective = isUs
      ? `PUSH TYPE: PAID PPV MESSAGE (Locked behind a price tag).
- Goal: Immediate unlock conversion.
- Irresistible visual curiosity, sensory tension, or intimate cliffhanger that compels him to tap unlock.
- Mention seeing/unlocking naturally (e.g. "take a look", "tap to see how it ends") WITHOUT using salesy or marketing words.`
      : `TYPE DE PUSH : MESSAGE PAYANT PPV (Contenu verrouillé à débloquer).
- But : Déclenchement immédiat du déblocage.
- Curiosité visuelle irrésistible, tension sensuelle ou promesse intime qui donne envie de débloquer sur-le-champ.
- Invite à regarder/débloquer de façon naturelle ("regarde comment ça se termine", "débloque pour voir") SANS aucun terme commercial ("promo", "achetez", "offre").`;
  } else {
    pushTypeDirective = isUs
      ? `PUSH TYPE: 100% FREE RELATIONSHIP MESSAGE (Retention & Discussion Opener).
- Goal: Get him to reply in DMs, build connection, spark a dialogue.
- ABSOLUTELY FORBIDDEN to mention unlocking, prices, payment, or tips! This is a free intimate gift or quick text.`
      : `TYPE DE PUSH : MESSAGE RELATIONNEL 100% GRATUIT (Rétention & Relance de conversation).
- But : Faire répondre le fan en DM, créer de la complicité et relancer la flamme.
- INTERDICTION FORMELLE d'évoquer un déblocage, un achat ou un prix ! C'est un message offert ou une pensée spontanée.`;
  }

  // Media context anchor
  let mediaContextDirective = '';
  if (mediaContext && mediaContext.trim().length > 3) {
    mediaContextDirective = isUs
      ? `\nCRITICAL MEDIA CONTEXT PROVIDED BY CREATOR (ABSOLUTE PRIORITY):
"${mediaContext.trim()}"
-> MANDATORY: Every proposition MUST directly center on, describe, or reference this exact scene, action, outfit, or moment! Do NOT make up an unrelated scene when the creator provided a specific scenario.`
      : `\nCONTEXTE PRÉCIS DU MÉDIA FOURNI PAR LA CRÉATRICE (PRIORITÉ ABSOLUE) :
"${mediaContext.trim()}"
-> OBLIGATION STRICTE : Les 6 propositions DOIVENT impérativement et directement se baser sur cette action, ces vêtements, cette tenue ou ce moment précis décrit par la créatrice ! INTERDICTION de fabriquer un scénario générique déconnecté de cette description.`;
  }

  // Anti-repetition blacklist
  let antiRepetitionDirective = '';
  if (previousMessages && previousMessages.length > 0) {
    const cleanHistory = previousMessages.slice(-12).map(m => `"${m.replace(/\n/g, ' ')}"`).join('\n');
    antiRepetitionDirective = isUs
      ? `\nSTRICT ANTI-REPETITION BLACKLIST (PREVIOUSLY GENERATED PHRASES TO AVOID):
${cleanHistory}
-> FORBIDDEN: Do NOT reuse these phrases, sentence openings, metaphors, or wordings! Do NOT just rephrase or change 2 words. Explore RADICALLY DIFFERENT angles, fresh vocabulary, unexpected triggers, and new situations!`
      : `\nLISTE NOIRE ANTI-RÉPÉTITION (PHRASES PRÉCÉDEMMENT GÉNÉRÉES À PROSCRIRE ABSOLUMENT) :
${cleanHistory}
-> INTERDICTION FORMELLE : Tu as interdiction formelle de réutiliser ces phrases, ces tournures, ces débuts de phrase ou ces métaphores ! Ne te contente JAMAIS de simplement changer 2 ou 3 mots. Tu dois inventer des angles RADICALEMENT NOUVEAUX, un vocabulaire inattendu et d'autres dynamiques psychologiques !`;
  }

  // Banned cliché list
  const bannedTropes = isUs
    ? `"just woke up", "in front of my mirror", "I made a mistake", "you won't believe this", "shoot me a DM", "text me in DM", "special offer", "buy now"`
    : `"devant mon miroir", "j'ai fait une bêtise", "tu vas pas en revenir", "je devrais pas te montrer ça", "viens en DM", "réponds en DM", "viens me consoler", "petit secret", "craqué sur un colis"`;

  const systemPrompt = isUs
    ? `You are an elite ghostwriter & copywriting strategist for top female creators on ${platform === 'onlyfans' ? 'OnlyFans' : 'MYM'}.
Your objective is to generate MASS MESSAGES that drive exceptional open rates, engagement, and PPV unlocks while sounding 100% natural, authentic, and seductive.

CORE VIBE & CIRCUMSTANCE:
- THEME: "${moodName}"
- GUIDANCE: ${moodGuidance}

NON-NEGOTIABLE COMMUNICATION RULES:
1. THE FAN IS ALREADY IN THE DM INBOX:
   - STRICTLY FORBIDDEN to say "DM me", "shoot me a DM", "in my DMs". He is ALREADY reading this inside his private messages!
2. AVOID ROBOTIC QUESTIONS:
   - Prefer confident statements, spontaneous impulses, provocative banter, or vivid sensory details over lazy questions ("what are you doing?").
3. 100% HOME REALISM:
   - Realistic home setting: bed, couch, bathroom mirror, dressing room, kitchen.
4. ABSOLUTE DIVERSITY & NOVELTY:
   - NEVER repeat the same grammar pattern. Each of the 6 proposals must have its own unique soul and rhythm.
   - BANNED CLICHÉS: ${bannedTropes}.
5. REAL-TIME CLOCK CONTEXT:
   - Local fan time is ${resolvedTime.timeString} (${resolvedTime.periodLabelUs}).
   - Atmosphere: ${resolvedTime.contextualAtmosphereUs}.
   - Forbidden words: ${resolvedTime.forbiddenWordsUs.join(', ')}.`
    : `Tu es une experte d'élite en ghostwriting et copywriting pour créatrices glamour & charme sur ${platform === 'onlyfans' ? 'OnlyFans' : 'MYM'}.
Ton objectif est de rédiger des MASS MESSAGES à fort impact qui relancent instantanément l'engagement et les déblocages PPV, avec le naturel désarmant d'un vrai SMS intime.

VIBE & CIRCONSTANCE SÉLECTIONNÉE :
- THÉMATIQUE : "${moodName}" (${moodObj?.badge || 'Vibe active'})
- CONSIGNE DE LA VIBE : ${moodGuidance}

RÈGLES D'OR DE RÉDACTION :
1. LE MESSAGE EST DÉJÀ DANS LA MESSAGERIE PRIVÉE (DM) DU FAN :
   - INTERDICTION FORMELLE d'écrire "viens en DM", "réponds en DM", "envoie un DM". Le fan est DÉJÀ dans son chat privé ! Parler de "DM" sonne faux, amateur et cringe.
2. ÉVITE LES QUESTIONS BATEAUX DE TÉLÉMARKETING :
   - Privilégie les affirmations directes, les pensées impulsives, les piques complices, les détails troublants ou les constats sans filtre plutôt que de simples questions plates ("tu fais quoi ?").
3. ANCRAGE 100% MAISON / VIE RÉELLE :
   - Chambre, lit, salle de bain, canapé, miroir, dressing. Les créatrices n'ont pas de studio pro.
4. DIVERSITÉ RADICALE & NON-RÉPÉTITION :
   - AUCUNE des 6 propositions ne doit se ressembler. Chaque proposition doit explorer une intention, une structure grammaticale et un rythme totalement différents.
   - CLICHÉS INTERDITS : ${bannedTropes}.
5. COHÉRENCE HORAIRE STRICTE :
   - Heure réelle actuelle du fan : ${resolvedTime.timeString} (${resolvedTime.periodLabelFr}).
   - Ambiance requise : ${resolvedTime.contextualAtmosphereFr}.
   - Mots formellement interdits à cette heure : ${resolvedTime.forbiddenWordsFr.join(', ')}.`;

  const userPrompt = isUs
    ? `GENERATE 6 HIGHLY DIVERSE, RADICALLY DIFFERENT PUSH PROPOSITIONS:

CREATOR PROFILE:
- Name: ${modelProfile?.name || 'Creator'}, ${modelProfile?.age || 23} years old.
- Tone: ${modelProfile?.tone || 'Spontaneous, warm, sensual'}
- Personality: ${modelProfile?.personality || 'Playful, confident, intimate'}
- Home habits: ${modelProfile?.homeHabits || 'Chilling in lace, bedroom mirror'}
- Signature Emojis: ${(modelProfile?.favoriteEmojis || ['✨', '🫦']).join(' ')}

PARAMETERS TO THOROUGHLY INTEGRATE:
- Platform: ${platform.toUpperCase()}
- Push Type: ${pushTypeDirective}
- ${lengthDirective}
- ${audienceDirective}
- ${hotLevelDirective}
- Media Type: ${mediaType} ${isPaid && priceSuggestion ? `(Suggested PPV: $${priceSuggestion})` : ''}
${mediaContextDirective}
${antiRepetitionDirective}

CHOSEN PSYCHOLOGICAL TRIGGERS FOR THE 6 PROPOSITIONS:
${chosenTriggers.map((t, i) => `Proposal #${i + 1} -> Angle: "${t.labelUs}" (${t.instructionUs})`).join('\n')}

[SEED & FRESHNESS TOKEN: ${seedNonce}]

OUTPUT FORMAT:
Return ONLY valid JSON matching this structure:
{
  "recommendations": {
    "bestSendTimeFanTz": "${resolvedTime.timeString} (${resolvedTime.periodLabelUs})",
    "currentFanLocalTime": "${resolvedTime.timeString} — ${resolvedTime.periodLabelUs}",
    "pricingTip": "${isPaid ? 'Optimal PPV pricing suggestion' : 'Free engagement strategy'}",
    "safetyAudit": "Strictly TOS-compliant"
  },
  "variations": [
    {
      "id": "var-1",
      "angle": "${chosenTriggers[0].id}",
      "angleLabel": "${chosenTriggers[0].labelUs}",
      "message": "Direct, punchy, unrepeated message applying trigger #1...",
      "estimatedOpenRate": "92%",
      "suggestedPrice": "${isPaid ? (priceSuggestion ? `$${priceSuggestion}` : '$15') : 'Free'}",
      "mediaNotice": "${isPaid ? (mediaContext || 'Exclusive PPV') : 'Free / DM'}",
      "timeContextNote": "${chosenTriggers[0].instructionUs}"
    },
    {
      "id": "var-2",
      "angle": "${chosenTriggers[1].id}",
      "angleLabel": "${chosenTriggers[1].labelUs}",
      "message": "Completely different tone and grammar applying trigger #2...",
      "estimatedOpenRate": "89%",
      "suggestedPrice": "${isPaid ? (priceSuggestion ? `$${priceSuggestion}` : '$15') : 'Free'}",
      "mediaNotice": "${isPaid ? (mediaContext || 'Exclusive PPV') : 'Free / DM'}",
      "timeContextNote": "${chosenTriggers[1].instructionUs}"
    },
    {
      "id": "var-3",
      "angle": "${chosenTriggers[2].id}",
      "angleLabel": "${chosenTriggers[2].labelUs}",
      "message": "Fresh distinct phrasing applying trigger #3...",
      "estimatedOpenRate": "94%",
      "suggestedPrice": "${isPaid ? (priceSuggestion ? `$${priceSuggestion}` : '$15') : 'Free'}",
      "mediaNotice": "${isPaid ? (mediaContext || 'Exclusive PPV') : 'Free / DM'}",
      "timeContextNote": "${chosenTriggers[2].instructionUs}"
    },
    {
      "id": "var-4",
      "angle": "${chosenTriggers[3].id}",
      "angleLabel": "${chosenTriggers[3].labelUs}",
      "message": "Surprising hook applying trigger #4...",
      "estimatedOpenRate": "91%",
      "suggestedPrice": "${isPaid ? (priceSuggestion ? `$${priceSuggestion}` : '$15') : 'Free'}",
      "mediaNotice": "${isPaid ? (mediaContext || 'Exclusive PPV') : 'Free / DM'}",
      "timeContextNote": "${chosenTriggers[3].instructionUs}"
    },
    {
      "id": "var-5",
      "angle": "${chosenTriggers[4].id}",
      "angleLabel": "${chosenTriggers[4].labelUs}",
      "message": "Intimate angle applying trigger #5...",
      "estimatedOpenRate": "88%",
      "suggestedPrice": "${isPaid ? (priceSuggestion ? `$${priceSuggestion}` : '$15') : 'Free'}",
      "mediaNotice": "${isPaid ? (mediaContext || 'Exclusive PPV') : 'Free / DM'}",
      "timeContextNote": "${chosenTriggers[4].instructionUs}"
    },
    {
      "id": "var-6",
      "angle": "${chosenTriggers[5].id}",
      "angleLabel": "${chosenTriggers[5].labelUs}",
      "message": "Bold closing proposition applying trigger #6...",
      "estimatedOpenRate": "95%",
      "suggestedPrice": "${isPaid ? (priceSuggestion ? `$${priceSuggestion}` : '$15') : 'Free'}",
      "mediaNotice": "${isPaid ? (mediaContext || 'Exclusive PPV') : 'Free / DM'}",
      "timeContextNote": "${chosenTriggers[5].instructionUs}"
    }
  ]
}`
    : `GÉNÈRE STRICTEMENT 6 PROPOSITIONS DE PUSH RADICALEMENT DIFFÉRENTES ET INÉDITES :

PROFIL DE LA CRÉATRICE :
- Nom : ${modelProfile?.name || 'Créatrice'}, ${modelProfile?.age || 23} ans.
- Ton de voix : ${modelProfile?.tone || 'Spontané, taquin, intime'}
- Personnalité : ${modelProfile?.personality || 'Sensuelle, complice, décomplexée'}
- Habitudes à la maison : ${modelProfile?.homeHabits || 'Chambre, couette, grand miroir'}
- Emojis signatures : ${(modelProfile?.favoriteEmojis || ['✨', '🫦']).join(' ')}

PARAMÈTRES DU PUSH À APPLIQUER EN PROFONDEUR :
- Plateforme : ${platform.toUpperCase()}
- Type de push : ${pushTypeDirective}
- ${lengthDirective}
- ${audienceDirective}
- ${hotLevelDirective}
- Média joint : ${mediaType} ${isPaid && priceSuggestion ? `(Prix PPV suggéré : ${priceSuggestion}€)` : ''}
${mediaContextDirective}
${antiRepetitionDirective}

DÉCLENCHEURS PSYCHOLOGIQUES ATTRIBUÉS AUX 6 PROPOSITIONS :
${chosenTriggers.map((t, i) => `Proposition #${i + 1} -> Angle : "${t.labelFr}" (${t.instructionFr})`).join('\n')}

[SEED & JETON D'ANTI-RÉPÉTITION : ${seedNonce}]

FORMAT ATTENDU :
Renvoie UNIQUEMENT un objet JSON valide avec cette structure :
{
  "recommendations": {
    "bestSendTimeFanTz": "${resolvedTime.timeString} (${resolvedTime.periodLabelFr})",
    "currentFanLocalTime": "${resolvedTime.timeString} — ${resolvedTime.periodLabelFr}",
    "pricingTip": "${isPaid ? 'Conseil tarification PPV optimisée' : 'Conseil relationnel engagement'}",
    "safetyAudit": "Conforme aux chartes de contenu"
  },
  "variations": [
    {
      "id": "var-1",
      "angle": "${chosenTriggers[0].id}",
      "angleLabel": "${chosenTriggers[0].labelFr}",
      "message": "Texte court et percutant appliquant l'angle #1...",
      "estimatedOpenRate": "92%",
      "suggestedPrice": "${isPaid ? (priceSuggestion ? `${priceSuggestion}€` : '15€') : 'Gratuit'}",
      "mediaNotice": "${isPaid ? (mediaContext || 'Média exclusif PPV') : 'Offert / DM'}",
      "timeContextNote": "${chosenTriggers[0].instructionFr}"
    },
    {
      "id": "var-2",
      "angle": "${chosenTriggers[1].id}",
      "angleLabel": "${chosenTriggers[1].labelFr}",
      "message": "Tournure et énergie totalement différentes appliquant l'angle #2...",
      "estimatedOpenRate": "89%",
      "suggestedPrice": "${isPaid ? (priceSuggestion ? `${priceSuggestion}€` : '15€') : 'Gratuit'}",
      "mediaNotice": "${isPaid ? (mediaContext || 'Média exclusif PPV') : 'Offert / DM'}",
      "timeContextNote": "${chosenTriggers[1].instructionFr}"
    },
    {
      "id": "var-3",
      "angle": "${chosenTriggers[2].id}",
      "angleLabel": "${chosenTriggers[2].labelFr}",
      "message": "Rythme inédit appliquant l'angle #3...",
      "estimatedOpenRate": "94%",
      "suggestedPrice": "${isPaid ? (priceSuggestion ? `${priceSuggestion}€` : '15€') : 'Gratuit'}",
      "mediaNotice": "${isPaid ? (mediaContext || 'Média exclusif PPV') : 'Offert / DM'}",
      "timeContextNote": "${chosenTriggers[2].instructionFr}"
    },
    {
      "id": "var-4",
      "angle": "${chosenTriggers[3].id}",
      "angleLabel": "${chosenTriggers[3].labelFr}",
      "message": "Accroche surprenante appliquant l'angle #4...",
      "estimatedOpenRate": "91%",
      "suggestedPrice": "${isPaid ? (priceSuggestion ? `${priceSuggestion}€` : '15€') : 'Gratuit'}",
      "mediaNotice": "${isPaid ? (mediaContext || 'Média exclusif PPV') : 'Offert / DM'}",
      "timeContextNote": "${chosenTriggers[3].instructionFr}"
    },
    {
      "id": "var-5",
      "angle": "${chosenTriggers[4].id}",
      "angleLabel": "${chosenTriggers[4].labelFr}",
      "message": "Angle intimiste appliquant l'angle #5...",
      "estimatedOpenRate": "88%",
      "suggestedPrice": "${isPaid ? (priceSuggestion ? `${priceSuggestion}€` : '15€') : 'Gratuit'}",
      "mediaNotice": "${isPaid ? (mediaContext || 'Média exclusif PPV') : 'Offert / DM'}",
      "timeContextNote": "${chosenTriggers[4].instructionFr}"
    },
    {
      "id": "var-6",
      "angle": "${chosenTriggers[5].id}",
      "angleLabel": "${chosenTriggers[5].labelFr}",
      "message": "Proposition audacieuse appliquant l'angle #6...",
      "estimatedOpenRate": "95%",
      "suggestedPrice": "${isPaid ? (priceSuggestion ? `${priceSuggestion}€` : '15€') : 'Gratuit'}",
      "mediaNotice": "${isPaid ? (mediaContext || 'Média exclusif PPV') : 'Offert / DM'}",
      "timeContextNote": "${chosenTriggers[5].instructionFr}"
    }
  ]
}`;

  return {
    systemPrompt,
    userPrompt,
    resolvedTime,
    chosenTriggers,
    temperature,
    seedNonce
  };
}
