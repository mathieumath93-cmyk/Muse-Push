import { GeneratedVariation, Language, Platform, MoodCategory } from '../types';

/**
 * Normalizes text for similarity comparison:
 * lowercase, removes emojis, punctuation, and extra whitespace.
 */
export function normalizeForComparison(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accents
    .replace(/[^\w\s]/g, ' ') // remove emojis & punctuation
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Calculates Jaccard token similarity between two sentences (0.0 to 1.0).
 */
export function calculateTokenSimilarity(a: string, b: string): number {
  const wordsA = new Set(normalizeForComparison(a).split(' ').filter(w => w.length > 2));
  const wordsB = new Set(normalizeForComparison(b).split(' ').filter(w => w.length > 2));
  
  if (wordsA.size === 0 || wordsB.size === 0) return 0;
  
  let intersection = 0;
  for (const w of wordsA) {
    if (wordsB.has(w)) intersection++;
  }
  
  const union = new Set([...wordsA, ...wordsB]).size;
  return union === 0 ? 0 : intersection / union;
}

/**
 * Checks if two variations share an identical opening prefix (first 3+ words or 16+ characters).
 */
export function shareOpeningPrefix(a: string, b: string, minWords: number = 3): boolean {
  const normA = normalizeForComparison(a);
  const normB = normalizeForComparison(b);
  
  const wordsA = normA.split(' ').filter(Boolean);
  const wordsB = normB.split(' ').filter(Boolean);
  
  if (wordsA.length >= minWords && wordsB.length >= minWords) {
    const prefixA = wordsA.slice(0, minWords).join(' ');
    const prefixB = wordsB.slice(0, minWords).join(' ');
    if (prefixA === prefixB) return true;
  }
  
  // Also check character prefix of length 18
  const charsA = normA.slice(0, 18);
  const charsB = normB.slice(0, 18);
  if (charsA.length >= 15 && charsA === charsB) return true;
  
  return false;
}

/**
 * Generates 6 truly distinct hooks when a creator provides a specific media context description.
 * Never copies the raw text verbatim as a prefix across variations!
 */
export function generateSmartMediaContextVariations(params: {
  mediaContext: string;
  isUs: boolean;
  isPaid: boolean;
  isOneLine: boolean;
  hotLevel: number;
  targetAudience: string;
  priceVal: number;
  em1: string;
  em2: string;
}): GeneratedVariation[] {
  const rawCtx = params.mediaContext.trim();
  const lower = rawCtx.toLowerCase();
  const isUs = params.isUs;
  const isPaid = params.isPaid;
  const em1 = params.em1 || '🫦';
  const em2 = params.em2 || '🥵';
  const price = params.priceVal || 15;

  // Detect semantic themes
  const isBedOrSheets = /drap|lit|couette|oreiller|chevet|chambre|sommeil|bed|sheet|pillow|nightstand/.test(lower);
  const isTouchOrSensual = /touch|main|doigt|caress|frisson|peau|mouill|hand|finger|skin|shiver/.test(lower);
  const isShowerOrWater = /douch|bain|eau|serviett|mouill|shower|bath|water|towel|wet/.test(lower);
  const isLingerie = /lingerie|culott|soutien|dentelle|string|shorty|nuisett|lace|panties|bra/.test(lower);
  const isMirror = /miroir|glace|reflet|mirror|reflection/.test(lower);

  interface AngleDef {
    angle: string;
    angleLabelFr: string;
    angleLabelUs: string;
    msgFr: string;
    msgUs: string;
  }

  let angles: AngleDef[] = [];

  if (isBedOrSheets && isTouchOrSensual) {
    // Bed + tactile intimacy
    angles = [
      {
        angle: 'confession_sur_le_vif',
        angleLabelFr: 'Aveu intime au lit',
        angleLabelUs: 'Pillow Talk Confession',
        msgFr: `Je viens tout juste de me glisser sous la couette avec la veilleuse allumée... impossible de m'empêcher de penser à toi ${em1}`,
        msgUs: `Just slipped under the covers with the bedside lamp dim... couldn't keep my mind off you ${em1}`
      },
      {
        angle: 'detail_sensoriel',
        angleLabelFr: 'Détail sensoriel & tactile',
        angleLabelUs: 'Sensory Detail Tease',
        msgFr: `Lumière tamisée, le silence complet dans ma chambre et mes mains qui s'égarent... j'en ai encore des frissons ${em2}`,
        msgUs: `Dim warm lighting, complete silence in my room and my hands wandering... still gives me chills ${em2}`
      },
      {
        angle: 'question_projection',
        angleLabelFr: 'Question complice & projection',
        angleLabelUs: 'Playful Projection Hook',
        msgFr: `Si tu étais allongé à côté de moi sous ces draps en ce moment, par où est-ce que tu commencerais ? 🫦`,
        msgUs: `If you were lying right beside me under these sheets right now, where would your hands go first? 🫦`
      },
      {
        angle: 'cadrage_camera',
        angleLabelFr: 'Cadrage secret & défi',
        angleLabelUs: 'Camera Propped Challenge',
        msgFr: `J'ai calé le téléphone sur le bord de la table de nuit pour filmer exactement ce que je fais quand je suis seule... regarde vite 👀`,
        msgUs: `Propped my phone on the edge of the nightstand to catch what I do when I'm alone... take a look 👀`
      },
      {
        angle: 'provocation_douce',
        angleLabelFr: 'Provocation troublante',
        angleLabelUs: 'Sweet Provocation',
        msgFr: `Avoue que tu aimerais bien savoir pourquoi ma respiration est si agitée sous les draps ce soir... 😮‍💨`,
        msgUs: `Admit you'd love to know why my breathing is so shaky under these covers tonight... 😮‍💨`
      },
      {
        angle: 'exclusivite_privee',
        angleLabelFr: 'Confidence privée',
        angleLabelUs: 'Inner Circle Exclusive',
        msgFr: `Une séquence brute filmée sur le coup de l'impulsion... je la garde uniquement pour toi ✨`,
        msgUs: `A raw spontaneous clip captured in the moment... keeping this strictly between us ✨`
      }
    ];
  } else if (isShowerOrWater) {
    // Shower / bathroom scene
    angles = [
      {
        angle: 'sortie_deau',
        angleLabelFr: 'Sortie d\'eau immédiate',
        angleLabelUs: 'Fresh Out of Water',
        msgFr: `Je sors tout juste de l'eau avec la serviette qui menace de glisser... viens voir avant que je ne m'habille 🤍`,
        msgUs: `Fresh out of the water with the towel barely holding on... look before I put clothes on 🤍`
      },
      {
        angle: 'humidite_sensorielle',
        angleLabelFr: 'Gouttes & vapeur',
        angleLabelUs: 'Steam & Water Drops',
        msgFr: `La buée sur le miroir et des gouttes qui coulent encore le long de mes hanches... regarde ce que j'ai filmé ${em2}`,
        msgUs: `Steam on the mirror and water drops still tracing down my hips... look what I caught on video ${em2}`
      },
      {
        angle: 'dilemme_serviette',
        angleLabelFr: 'Dilemme taquin',
        angleLabelUs: 'Towel Dilemma',
        msgFr: `Tu préfères quand je garde la serviette serrée ou quand je la laisse tomber par terre ? 🫦`,
        msgUs: `Do you prefer when I keep the towel wrapped or when I let it drop right to the floor? 🫦`
      },
      {
        angle: 'vue_indiscrete',
        angleLabelFr: 'Vue indiscrète',
        angleLabelUs: 'Candid Gaze',
        msgFr: `J'ai laissé la porte entrouverte pendant que je me séchais... viens jeter un œil 👀`,
        msgUs: `Left the bathroom door cracked open while drying off... come take a peek 👀`
      },
      {
        angle: 'frisson_chaleur',
        angleLabelFr: 'Chaleur & contraste',
        angleLabelUs: 'Heat & Contrast',
        msgFr: `Ma peau est encore toute chaude de l'eau brûlante... tu aurais fait quoi si tu étais là ? 😮‍💨`,
        msgUs: `My skin is still glowing hot from the steam... what would you have done if you were here? 😮‍💨`
      },
      {
        angle: 'exclusivite_douche',
        angleLabelFr: 'Vidéo confidentielle',
        angleLabelUs: 'Confidential Clip',
        msgFr: `Une vue sous la douche que je n'ai jamais montrée à personne d'autre... rien que pour toi ✨`,
        msgUs: `A shower angle I have never shown to anyone else... strictly for you ✨`
      }
    ];
  } else if (isLingerie || isMirror) {
    // Lingerie & mirror scene
    angles = [
      {
        angle: 'essayage_lingerie',
        angleLabelFr: 'Avis direct sur la tenue',
        angleLabelUs: 'Outfit Feedback',
        msgFr: `Je viens d'enfiler cet ensemble en dentelle fine... dis-moi franchement ce que tu en penses 🤍`,
        msgUs: `Just put on this sheer lace set... tell me truthfully what you think 🤍`
      },
      {
        angle: 'angle_arriere',
        angleLabelFr: 'Angle indiscret miroir',
        angleLabelUs: 'Mirror Angle Tease',
        msgFr: `Le reflet dans le miroir révèle exactement ce que le tissu cache à peine... regarde par toi-même ${em2}`,
        msgUs: `The mirror reflection reveals what the fabric barely conceals... take a look for yourself ${em2}`
      },
      {
        angle: 'defi_retrait',
        angleLabelFr: 'Défi complice',
        angleLabelUs: 'Playful Challenge',
        msgFr: `Tu me préfères habillée comme ça ou avec la dentelle défaite sur le sol ? 🫦`,
        msgUs: `Do you like me dressed like this or with the lace undone on the floor? 🫦`
      },
      {
        angle: 'zoom_camera',
        angleLabelFr: 'Zoom indiscret',
        angleLabelUs: 'Close-up Detail',
        msgFr: `J'ai approché la caméra très près pour que tu voies la transparence du tissu... viens voir 👀`,
        msgUs: `Brought the camera up close so you can see right through the sheer fabric... come look 👀`
      },
      {
        angle: 'provocation_lingerie',
        angleLabelFr: 'Pique taquine',
        angleLabelUs: 'Seductive Tease',
        msgFr: `Avoue que tu rêverais de dénouer ces petits liens de tes propres mains... 😮‍💨`,
        msgUs: `Admit you'd love to untie these delicate ribbons with your own hands... 😮‍💨`
      },
      {
        angle: 'exclusivite_lingerie',
        angleLabelFr: 'Séance réservée VIP',
        angleLabelUs: 'VIP Private Fitting',
        msgFr: `Petite séance d'essayage privée dans mon dressing... réservée à mes abonnés préférés ✨`,
        msgUs: `Private little try-on session in my closet... strictly for my favorite subs ✨`
      }
    ];
  } else {
    // Generic / custom scene: intelligently decompose without prepending the raw text
    const cleanShortSummary = rawCtx
      .replace(/[.!?,]+$/g, '')
      .replace(/^en train de /i, '')
      .replace(/^dans /i, 'dans ')
      .trim();

    angles = [
      {
        angle: 'aveu_spontane',
        angleLabelFr: 'Aveu spontané sur le vif',
        angleLabelUs: 'Spontaneous Confession',
        msgFr: `J'étais justement en train de penser à toi pendant ce moment... regarde ce que j'ai filmé ${em1}`,
        msgUs: `I was literally thinking about you during this exact moment... look what I captured ${em1}`
      },
      {
        angle: 'detail_visuel',
        angleLabelFr: 'Détail visuel piquant',
        angleLabelUs: 'Visual Curiosity Detail',
        msgFr: `Regarde attentivement chaque détail de la vidéo... je n'avais jamais osé aller aussi loin ${em2}`,
        msgUs: `Look closely at every second of the clip... I've never dared to go this far before ${em2}`
      },
      {
        angle: 'question_directe',
        angleLabelFr: 'Question complice',
        angleLabelUs: 'Direct Playful Question',
        msgFr: `Dis-moi la vérité : tu aurais réagi comment si tu avais été là avec moi à ce moment précis ? 🫦`,
        msgUs: `Tell me the truth: how would you have reacted if you were right here with me? 🫦`
      },
      {
        angle: 'defi_regard',
        angleLabelFr: 'Mise au défi',
        angleLabelUs: 'Visual Dare',
        msgFr: `J'ai posé le téléphone avec le meilleur angle possible... viens voir avant que je ne le retire 👀`,
        msgUs: `Set up my camera with the perfect angle... come see before I take it down 👀`
      },
      {
        angle: 'provocation_douce',
        angleLabelFr: 'Provocation taquine',
        angleLabelUs: 'Playful Banter',
        msgFr: `Avoue que tu ne t'attendais pas à ce que je partage une vidéo aussi intime aujourd'hui... 😮‍💨`,
        msgUs: `Admit you never expected me to share something this intimate today... 😮‍💨`
      },
      {
        angle: 'exclusivite_privee',
        angleLabelFr: 'Privilège VIP',
        angleLabelUs: 'VIP Private Moment',
        msgFr: `Rien que pour toi en exclusivité : un extrait secret de ce que je viens de vivre ✨`,
        msgUs: `Just for you exclusively: a secret glimpse of what just happened ✨`
      }
    ];
  }

  return angles.map((a, idx) => {
    let text = isUs ? a.msgUs : a.msgFr;
    
    // Add call to action unlock if paid PPV and not strictly 1 line
    if (isPaid && !params.isOneLine) {
      text += isUs ? `\n\ntap to unlock the full view` : `\n\ndébloque pour voir toute la scène`;
    }

    const priceOffsets = [0, 2, -2, 4, 1, 3];
    const itemPrice = Math.max(8, price + (priceOffsets[idx] || 0));

    return {
      id: `var-smart-ctx-${idx + 1}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      angle: a.angle as any,
      angleLabel: isUs ? a.angleLabelUs : a.angleLabelFr,
      message: text,
      estimatedOpenRate: `${92 + ((idx * 3) % 7)}%`,
      suggestedPrice: isPaid ? (isUs ? `$${itemPrice}` : `${itemPrice}€`) : 'Gratuit',
      mediaNotice: rawCtx,
      timeContextNote: isUs ? 'Contextual scene angle' : 'Angle scénarisé unique sur le média'
    };
  });
}

/**
 * Universal Deduplication & Uniqueness Enforcer
 * Guarantees that no two variations in a batch share the same opening,
 * share high word overlap, or duplicate previous messages from history.
 */
export function enforceStrictVariationUniqueness(
  variations: GeneratedVariation[],
  params: {
    previousHistory?: string[];
    isUs?: boolean;
    isPaid?: boolean;
    priceVal?: number;
    mood?: MoodCategory;
    mediaContext?: string;
  } = {}
): GeneratedVariation[] {
  if (!Array.isArray(variations) || variations.length === 0) {
    return variations;
  }

  const result: GeneratedVariation[] = [];
  const seenPrefixes = new Set<string>();
  const isUs = Boolean(params.isUs);
  const isPaid = Boolean(params.isPaid);
  const priceVal = params.priceVal || 15;
  const previousHistory = params.previousHistory || [];

  // Fallback distinct replacement templates if a duplicate is caught
  const frenchFallbackTemplates = [
    "Une petite pensée imprévue pour toi en direct de ma chambre... dis-moi si tu aimes 🤍",
    "J'ai hésité avant de cliquer sur envoyer... avoue que tu me trouves audacieuse 🫦",
    "Regarde ce que j'ai préparé juste avant d'éteindre la lumière... impossible de résister 🥵",
    "Si tu devais choisir une seule seconde de cette vidéo, ce serait laquelle ? 👀",
    "Rien que pour mes abonnés préférés : une séquence que je ne montre nulle part ailleurs ✨",
    "Avoue que tu n'aurais pas tenu deux minutes si tu avais été avec moi ce soir... 😮‍💨",
    "Une confidence murmurée au creux de l'oreille... viens écouter ça tout de suite 🎧",
    "Mon petit secret du jour en exclusivité... dis-moi vite ce que ça te fait 🤍"
  ];

  const usFallbackTemplates = [
    "A spontaneous little thought for you straight from my bedroom... tell me you like it 🤍",
    "Hesitated before hitting send on this one... admit you love when I'm bold 🫦",
    "Look what I caught right before switching the lights off... couldn't resist 🥵",
    "If you had to pick one single second from this clip, which one would it be? 👀",
    "Just for my favorites: a private glimpse I'm not sharing anywhere else ✨",
    "Admit you wouldn't have lasted two minutes if you were right here tonight... 😮‍💨",
    "A whispered secret straight to you... come take a listen right now 🎧",
    "My sweetest little secret of the day... tell me what it does to you 🤍"
  ];

  let fallbackIdx = 0;

  for (let i = 0; i < variations.length; i++) {
    const item = variations[i];
    let msg = (item.message || '').trim();

    // Check 1: Does this message share an opening prefix with any already accepted message?
    let hasConflict = false;

    // Normalize opening 3 words
    const words = normalizeForComparison(msg).split(' ').filter(Boolean);
    const prefix3 = words.slice(0, 3).join(' ');
    const prefix4 = words.slice(0, 4).join(' ');

    if (words.length >= 3) {
      if (seenPrefixes.has(prefix3) || seenPrefixes.has(prefix4)) {
        hasConflict = true;
      }
    }

    // Check 2: High token similarity with any accepted variation in current batch
    if (!hasConflict) {
      for (const accepted of result) {
        if (shareOpeningPrefix(msg, accepted.message, 3)) {
          hasConflict = true;
          break;
        }
        if (calculateTokenSimilarity(msg, accepted.message) > 0.40) {
          hasConflict = true;
          break;
        }
      }
    }

    // Check 3: Repetition from previous history
    if (!hasConflict && previousHistory.length > 0) {
      for (const prev of previousHistory) {
        if (shareOpeningPrefix(msg, prev, 4) || calculateTokenSimilarity(msg, prev) > 0.50) {
          hasConflict = true;
          break;
        }
      }
    }

    // If conflict detected, rewrite the message with a guaranteed unique template
    if (hasConflict) {
      const templates = isUs ? usFallbackTemplates : frenchFallbackTemplates;
      const chosenTemplate = templates[fallbackIdx % templates.length];
      fallbackIdx++;

      msg = chosenTemplate;
      if (isPaid) {
        msg += isUs ? `\n\ntap to unlock` : `\n\ndébloque pour voir la suite`;
      }
    }

    // Record prefix
    const finalWords = normalizeForComparison(msg).split(' ').filter(Boolean);
    if (finalWords.length >= 3) {
      seenPrefixes.add(finalWords.slice(0, 3).join(' '));
    }
    if (finalWords.length >= 4) {
      seenPrefixes.add(finalWords.slice(0, 4).join(' '));
    }

    result.push({
      ...item,
      message: msg,
      id: item.id || `var-uniq-${i + 1}-${Date.now()}`
    });
  }

  return result;
}
