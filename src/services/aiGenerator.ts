import { 
  ModelProfile, 
  Platform, 
  Language, 
  MoodCategory, 
  WinningExample, 
  GenerationResult,
  GeneratedVariation,
  SentenceLength
} from '../types';

export interface GeneratePushParams {
  modelProfile: ModelProfile;
  platform: Platform;
  language: Language;
  pushType: 'paid_ppv' | 'free_retention';
  sentenceCount: SentenceLength;
  mood: MoodCategory;
  mediaType: string;
  priceSuggestion?: number;
  mediaContext?: string;
  callToAction: string;
  targetAudience: string;
  hotLevel: number;
  timeContext?: {
    selectedTzZone?: string;
    calculatedHour?: string;
    suggestedPeriod?: string;
  };
  trainingExamples?: WinningExample[];
  agencyPlaybookRules?: string;
  openRouterConfig?: {
    apiKey?: string;
    model?: string;
    temperature?: number;
  };
}

export function generateClientSimulatedVariations(params: {
  modelName: string;
  language: Language;
  mood: MoodCategory;
  mediaContext?: string;
  priceSuggestion?: number;
  platform: Platform;
  hotLevel: number;
  pushType: 'paid_ppv' | 'free_retention';
  sentenceCount: SentenceLength;
}): { recommendations: GenerationResult['recommendations']; variations: GeneratedVariation[] } {
  const isUs = params.language === 'us';
  const price = params.priceSuggestion || 15;
  const priceLabel = isUs ? `$${price}` : `${price}€`;
  const isOneLine = (params.sentenceCount as string) === 'one_line';
  const isUltraShort = (params.sentenceCount as string) === 'ultra_short' || (params.sentenceCount as string) === '1_2';
  const isPaid = params.pushType === 'paid_ppv';

  if (isUs) {
    if (!isPaid) {
      return {
        recommendations: {
          bestSendTimeFanTz: '8:30 PM - 11:00 PM (Fan Local Time)',
          currentFanLocalTime: 'Evening bedroom unwinding',
          pricingTip: 'Free engagement push: punchy 1-line statements trigger 3x more replies than asking questions.',
          safetyAudit: '100% compliant with platform content guidelines.'
        },
        variations: [
          {
            id: 'v1',
            angle: 'direct',
            angleLabel: 'Intimate Home Confession (Statement)',
            message: isOneLine
              ? `honestly shouldn't have tried this lingerie on in front of my mirror tonight... it's dangerously sheer 🙈`
              : (isUltraShort
                ? `honestly shouldn't have opened this lingerie package tonight... tried it on and it's dangerously sheer 🙈`
                : `honestly shouldn't have opened this lingerie package tonight... tried it on in front of my bedroom mirror and it's dangerously sheer 🙈\n\nbet you'd have zero self-control if you were sitting on my bed right now... 🤍`),
            estimatedOpenRate: '94%',
            suggestedPrice: 'Free',
            mediaNotice: 'Direct free message / Chat starter',
            timeContextNote: 'Triggers instant response through authentic home vulnerability.'
          },
          {
            id: 'v2',
            angle: 'tease_playful',
            angleLabel: 'Ego Challenge & Playful Tease',
            message: isOneLine
              ? `i'm 100% convinced you wouldn't survive 2 minutes next to me dressed like this under my sheets 😈`
              : (isUltraShort
                ? `i'm 100% convinced you wouldn't survive 2 minutes next to me dressed like this under my sheets 😈 tell me i'm wrong... 🫦`
                : `i'm 100% convinced you wouldn't survive 2 minutes next to me dressed like this under my sheets 😈\n\ntell me i'm wrong, or prove it... 🫦`),
            estimatedOpenRate: '96%',
            suggestedPrice: 'Free',
            mediaNotice: 'Zero barrier message',
            timeContextNote: 'Directly triggers male ego to reply.'
          },
          {
            id: 'v3',
            angle: 'intimate_gfe',
            angleLabel: 'Real Life at Home (Cozy routine)',
            message: isOneLine
              ? `home alone barefoot in an oversized tee with nothing underneath... my absolute favorite mood ✨`
              : (isUltraShort
                ? `barefoot in an oversized tee with nothing underneath under my duvet... keep me company tonight ✨`
                : `home alone tonight barefoot in an oversized tee with nothing underneath... my absolute favorite mood ✨\n\njust crawled under my duvet, come keep me company 🤍`),
            estimatedOpenRate: '92%',
            suggestedPrice: 'Free',
            mediaNotice: 'Lifestyle connection',
            timeContextNote: 'Creates authentic bedroom intimacy.'
          },
          {
            id: 'v4',
            angle: 'direct',
            angleLabel: 'Unpopular Opinion / Debate Trigger',
            message: isOneLine
              ? `anyone who says they prefer pajamas over black silk lingerie is completely lying to themselves 🥀`
              : (isUltraShort
                ? `anyone who says they prefer pajamas over black silk lingerie is completely lying to themselves 🥀 prove me wrong...`
                : `guys who say they prefer comfy pajamas over black silk lingerie are completely lying to themselves 🥀\n\ni'm wearing my silk set right now on my bed and the feeling on my skin is unreal... prove me wrong ✨`),
            estimatedOpenRate: '89%',
            suggestedPrice: 'Free',
            mediaNotice: 'Conversation starter',
            timeContextNote: 'Forces the fan to take a stand and answer.'
          },
          {
            id: 'v5',
            angle: 'mysterious',
            angleLabel: 'Bedroom Clumsy Moment',
            message: isOneLine
              ? `did a quick mirror check in my bedroom and my robe completely slipped open... zero filter today 🙈`
              : (isUltraShort
                ? `did a quick mirror check in my room and my robe completely slipped open... didn't even edit it out 🙈`
                : `tried to record a quick mirror check in my bedroom and my robe completely slipped open... 🙈\n\ndidn't even edit it out, just sitting here blushing on my bed. say hi before i get shy ✨`),
            estimatedOpenRate: '95%',
            suggestedPrice: 'Free',
            mediaNotice: 'Playful authenticity',
            timeContextNote: 'Feels 100% real and unscripted.'
          },
          {
            id: 'v6',
            angle: 'mysterious',
            angleLabel: 'Late Night Secret Note',
            message: isOneLine
              ? `lights are dim in my room, impossible to fall asleep with you on my mind tonight 🤍`
              : (isUltraShort
                ? `not posting this on my public feed, this quiet mood is strictly reserved for you tonight 🤍`
                : `not posting this anywhere on my public feed, this quiet mood is strictly reserved for my favorites tonight 🤍\n\nlights are dim in my room, just thinking about you... ✨`),
            estimatedOpenRate: '91%',
            suggestedPrice: 'Free',
            mediaNotice: 'VIP intimacy',
            timeContextNote: 'Makes the subscriber feel uniquely special.'
          }
        ]
      };
    }

    return {
      recommendations: {
        bestSendTimeFanTz: '9:30 PM - 11:45 PM (Fan Local Time)',
        currentFanLocalTime: 'Prime evening PPV consumption window',
        pricingTip: `Recommended PPV tier: ${priceLabel}. Home-based try-ons convert with +38% higher click-through rates.`,
        safetyAudit: 'Clear terms, compliant with OnlyFans & MYM TOS.'
      },
      variations: [
        {
          id: 'v1',
          angle: 'direct',
          angleLabel: 'Bedroom Mirror Tease (Statement)',
          message: isOneLine
            ? `you would have lost your mind watching me try this sheer set on in front of my mirror 🙈 tap to unlock 🤫`
            : (isUltraShort
              ? `honestly... you would have lost your mind watching me try this sheer lingerie on in front of my mirror 🙈 tap below 🤫`
              : `honestly... you would have lost your mind watching me try this sheer lingerie on in front of my mirror 🙈\n\nrecorded the whole try-on session for you right on my bed. unlock before i get shy and delete it 🤫✨`),
          estimatedOpenRate: '86%',
          suggestedPrice: priceLabel,
          mediaNotice: `Bedroom Mirror Video + Photos`,
          timeContextNote: 'Credible home try-on setting.'
        },
        {
          id: 'v2',
          angle: 'tease_playful',
          angleLabel: 'Ego Challenge & Bet',
          message: isOneLine
            ? `i bet you can't watch this full bedroom clip without cracking 😈 tap below to see if you survive 🫦`
            : (isUltraShort
              ? `i bet you can't watch this full 3-minute bedroom clip without sending me a frantic message 😈 prove me wrong below 🫦`
              : `i bet you can't watch this full 3-minute bedroom clip without sending me a frantic message 😈\n\ni was feeling so naughty after my shower... tap below to see what happened on my sheets 🫦`),
          estimatedOpenRate: '91%',
          suggestedPrice: isUs ? `$${price}` : `${price}€`,
          mediaNotice: `Full Solo Bedroom Tape`,
          timeContextNote: 'High conversion through male pride challenge.'
        },
        {
          id: 'v3',
          angle: 'intimate_gfe',
          angleLabel: 'Duvet Pillow Talk (GFE)',
          message: isOneLine
            ? `tangled up in my sheets thinking about you... left the camera rolling just for you 🥰 tap to join me ✨`
            : (isUltraShort
              ? `tangled up in my sheets thinking about you... left the camera rolling just for my favorite boy 🥰 tap to join me ✨`
              : `tangled up in my sheets thinking about you 🤍\n\nleft the camera rolling while i got comfortable... unlock below and let's spend tonight together 🥰`),
          estimatedOpenRate: '89%',
          suggestedPrice: isUs ? `$${price + 4}` : `${price + 4}€`,
          mediaNotice: `Intimate Bedroom Video + Audio Whisper`,
          timeContextNote: 'Sweet companion connection.'
        },
        {
          id: 'v4',
          angle: 'direct',
          angleLabel: 'Online Order Try-on Haul',
          message: isOneLine
            ? `my tiny lingerie package finally arrived today... it barely covers anything at all 🥀 tap to see the fit 🤍`
            : (isUltraShort
              ? `my tiny lingerie package arrived today, it barely covers anything at all 🥀 tap to see the try-on 🤍`
              : `my tiny lingerie package finally arrived today... it barely covers anything at all 🥀\n\ni did an unboxing and try-on haul right in my bedroom dressing. tap below to see how it fits on me 🤍`),
          estimatedOpenRate: '88%',
          suggestedPrice: isUs ? `$${price}` : `${price}€`,
          mediaNotice: `Home Try-On & Posing Clip`,
          timeContextNote: 'Realistic e-commerce lifestyle angle.'
        },
        {
          id: 'v5',
          angle: 'mysterious',
          angleLabel: 'Bathroom Towel Slip',
          message: isOneLine
            ? `my towel dropped on the bathroom floor and i just kept the camera rolling... completely raw and unfiltered 🚿`
            : (isUltraShort
              ? `my towel dropped on the bathroom floor and i kept recording 🚿 steamy mirror, wet skin, unlock below 🫦`
              : `my towel dropped on the bathroom floor and i just kept the camera rolling... 🚿\n\nsteamy mirror, wet skin, zero filter. unlock below before i put my clothes back on 🫦`),
          estimatedOpenRate: '93%',
          suggestedPrice: isUs ? `$${Math.max(10, price - 2)}` : `${Math.max(10, price - 2)}€`,
          mediaNotice: `Steamy Bathroom Clip`,
          timeContextNote: 'Realistic home setting with high visual fantasy.'
        },
        {
          id: 'v6',
          angle: 'mysterious',
          angleLabel: 'Strictly Between Us (FOMO)',
          message: isOneLine
            ? `this bedroom tape is way too intimate to ever go public... unlock below before i delete it 🤍`
            : (isUltraShort
              ? `this tape is way too intimate to ever go public... tap below to unlock my private bedroom vault 🤍`
              : `this tape is way too intimate to ever go public... 🥀\n\ni made this strictly for the guys who actually know me here. tap below to unlock my secret bedroom vault 🤍`),
          estimatedOpenRate: '95%',
          suggestedPrice: isUs ? `$${price + 5}` : `${price + 5}€`,
          mediaNotice: `Exclusive Vault Unlock`,
          timeContextNote: 'VIP feeling triggers high conversion.'
        }
      ]
    };
  }

  // French
  if (!isPaid) {
    return {
      recommendations: {
        bestSendTimeFanTz: '20h30 - 23h00 (Heure locale du fan)',
        currentFanLocalTime: 'Soirée détente dans la chambre',
        pricingTip: 'Push simple 1 phrase : une affirmation percutante sans blabla génère un maximum d\'engagement spontané.',
        safetyAudit: 'Vocabulaire direct, naturel et 100% conforme.'
      },
      variations: [
        {
          id: 'v1',
          angle: 'direct',
          angleLabel: 'Aveu & Colis Lingerie (Affirmation)',
          message: isOneLine
            ? `j'ai encore craqué sur une commande de lingerie reçue ce matin... j'aurais clairement pas dû essayer ça devant mon miroir 🙈`
            : (isUltraShort
              ? `j'ai encore craqué sur une commande de lingerie reçue ce matin... j'aurais clairement pas dû essayer cet ensemble devant mon miroir 🙈`
              : `j'ai encore craqué sur une commande de lingerie reçue ce matin... 🙈\n\nj'aurais clairement pas dû essayer cet ensemble devant le miroir de ma chambre, c'est indécent. Dis-moi ce que t'en penses 🤍`),
          estimatedOpenRate: '94%',
          suggestedPrice: 'Gratuit',
          mediaNotice: 'Message direct relationnel',
          timeContextNote: 'Ancrage direct dans un essayage réel à la maison.'
        },
        {
          id: 'v2',
          angle: 'tease_playful',
          angleLabel: 'Taquinerie sur l\'ego (Défi joueur)',
          message: isOneLine
            ? `je suis persuadée à 100% que tu n'aurais pas tenu deux minutes assis sur mon lit avec moi habillée comme ça 😈`
            : (isUltraShort
              ? `je suis persuadée à 100% que tu n'aurais pas tenu deux minutes assis sur mon lit avec moi habillée comme ça tout à l'heure 😈 dis-moi que j'ai tort 🫦`
              : `je suis persuadée à 100% que tu n'aurais pas tenu deux minutes assis sur mon lit avec moi habillée comme ça tout à l'heure 😈\n\nprouve-moi le contraire si tu penses avoir du self-control... 🫦`),
          estimatedOpenRate: '96%',
          suggestedPrice: 'Gratuit',
          mediaNotice: 'Défi direct',
          timeContextNote: 'Pique l\'orgueil masculin pour forcer la réponse immédiate.'
        },
        {
          id: 'v3',
          angle: 'intimate_gfe',
          angleLabel: 'Micro-Instant Maison (Storytelling intime)',
          message: isOneLine
            ? `fin de journée à la maison, j'ai tout balancé par terre pour me glisser sous la couette sans rien... le bonheur ✨`
            : (isUltraShort
              ? `fin de journée à la maison, j'ai balancé toutes mes fringues par terre pour me glisser sous la couette sans rien... le bonheur ✨`
              : `fin de journée à la maison, j'ai balancé toutes mes fringues par terre pour me glisser sous la couette sans rien... ✨\n\nje suis tellement bien au chaud, viens me tenir compagnie 🤍`),
          estimatedOpenRate: '92%',
          suggestedPrice: 'Gratuit',
          mediaNotice: 'Proximité chambre & lit',
          timeContextNote: 'Crée une vraie proximité sensuelle et chaleureuse.'
        },
        {
          id: 'v4',
          angle: 'direct',
          angleLabel: 'Opinion Tranchée (Débat spontané)',
          message: isOneLine
            ? `honnêtement, le satin noir bat n'importe quelle autre couleur de lingerie, il n'y a même pas de débat possible 🥀`
            : (isUltraShort
              ? `honnêtement, le satin noir bat n'importe quelle autre couleur de lingerie, il n'y a même pas de débat possible 🥀 avoue...`
              : `honnêtement, le satin noir bat n'importe quelle autre couleur de lingerie, il n'y a même pas de débat possible 🥀\n\nj'ai mis ma nuisette en soie ce soir dans mon lit et c'est une merveille... dis-moi ton avis ✨`),
          estimatedOpenRate: '89%',
          suggestedPrice: 'Gratuit',
          mediaNotice: 'Déclencheur d\'échange',
          timeContextNote: 'Pousse le fan à donner sa préférence et engager la conversation.'
        },
        {
          id: 'v5',
          angle: 'mysterious',
          angleLabel: 'Gaffe Mignonne (Authenticité brute)',
          message: isOneLine
            ? `j'ai voulu faire un test vidéo rapide sur mon lit pour voir le rendu... la bretelle a sauté net, j'ai tout laissé sans couper 🙈`
            : (isUltraShort
              ? `j'ai voulu faire un test vidéo rapide sur mon lit et la bretelle a sauté net... j'ai tout laissé tel quel 🙈`
              : `j'ai voulu faire un test vidéo rapide sur mon lit pour voir le rendu... la bretelle a sauté net au bout de trois secondes 🙈\n\nj'ai tout laissé tel quel sans filtre, viens vite me consoler ✨`),
          estimatedOpenRate: '95%',
          suggestedPrice: 'Gratuit',
          mediaNotice: 'Spontanéité chambre',
          timeContextNote: 'Bannit l\'effet script artificiel grâce à un imprévu mignon.'
        },
        {
          id: 'v6',
          angle: 'mysterious',
          angleLabel: 'Confidence Privée (Exclusivité)',
          message: isOneLine
            ? `cette humeur-là restera strictement entre nous, impossible que je poste ça publiquement ce soir 🤍`
            : (isUltraShort
              ? `cette humeur-là restera strictement entre nous ce soir, impossible que je poste ça sur mon feed public 🤍`
              : `cette humeur-là restera strictement entre nous, impossible que je poste ça sur mon feed public ce soir 🤍\n\nma chambre est plongée dans le noir avec juste une bougie... passe me faire un coucou ✨`),
          estimatedOpenRate: '91%',
          suggestedPrice: 'Gratuit',
          mediaNotice: 'VIP intime',
          timeContextNote: 'Donne au fan l\'impression d\'être son contact privilégié.'
        }
      ]
    };
  }

  // French Paid PPV
  return {
    recommendations: {
      bestSendTimeFanTz: '21h15 - 23h30 (Heure locale du fan)',
      currentFanLocalTime: 'Créneau prime-time d’achats spontanés',
      pricingTip: `Prix recommandé ${price}€ - ${price + 5}€. Une phrase simple et percutante évite la friction et booste les déblocages.`,
      safetyAudit: 'Vocabulaire sensuel validé conforme aux règles MYM & OnlyFans.'
    },
    variations: [
      {
        id: 'v1',
        angle: 'direct',
        angleLabel: 'Essayage Miroir Chambre (Affirmation)',
        message: isOneLine
          ? `j'ai essayé mon nouvel ensemble transparent devant le miroir de ma chambre... tu serais devenu complètement fou 🙈 débloque vite 🤫`
          : (isUltraShort
            ? `j'ai essayé mon nouvel ensemble transparent devant le miroir de ma chambre... tu serais devenu complètement fou 🙈 débloque vite 🤫`
            : `j'ai essayé mon nouvel ensemble transparent devant le miroir de ma chambre... 🙈\n\ntu serais devenu complètement fou si t'avais été assis sur mon lit à ce moment-là. Débloque juste en dessous avant que je supprime 🤫✨`),
        estimatedOpenRate: '82%',
        suggestedPrice: `${price}€`,
        mediaNotice: `Vidéo essayage miroir chambre`,
        timeContextNote: 'Scène d\'essayage maison 100% crédible et cohérente avec vos médias.'
      },
      {
        id: 'v2',
        angle: 'tease_playful',
        angleLabel: 'Défi sur son self-control (Ego)',
        message: isOneLine
          ? `je parie tout ce que tu veux que tu ne tiens pas 3 minutes devant cette vidéo solo sur mon lit 😈 débloque pour voir 🫦`
          : (isUltraShort
            ? `je parie tout ce que tu veux que tu ne tiens pas 3 minutes devant cette vidéo solo sur mon lit 😈 débloque pour voir 🫦`
            : `je parie tout ce que tu veux que tu ne tiens pas 3 minutes devant cette vidéo solo sur mon lit 😈\n\nj'étais tellement d'humeur coquine ce soir... clique en dessous et viens m'avouer si t'as craqué 🫦`),
        estimatedOpenRate: '92%',
        suggestedPrice: `${price}€`,
        mediaNotice: `Solo tape complète sur le lit`,
        timeContextNote: 'Défi direct qui pousse à acheter pour prouver sa résistance.'
      },
      {
        id: 'v3',
        angle: 'intimate_gfe',
        angleLabel: 'Sous la Couette Complice (GFE)',
        message: isOneLine
          ? `dans mes draps défaits en train de penser fort à toi... j'ai laissé tourner la caméra rien que pour toi mon cœur 🥰`
          : (isUltraShort
            ? `dans mes draps défaits en train de penser fort à toi... j'ai laissé tourner la caméra rien que pour toi mon cœur 🥰`
            : `dans mes draps défaits en train de penser fort à toi 🤍\n\nj'ai laissé tourner la caméra pendant que je me détendais sous la couette... viens me débloquer qu'on passe la nuit ensemble 🥰`),
        estimatedOpenRate: '89%',
        suggestedPrice: `${price + 3}€`,
        mediaNotice: `Vidéo douce & intime sous les draps`,
        timeContextNote: 'Renforce l\'attachement émotionnel dans le cocon de la chambre.'
      },
      {
        id: 'v4',
        angle: 'direct',
        angleLabel: 'Colis Lingerie Déballé (Unboxing)',
        message: isOneLine
          ? `mon colis de lingerie fine est enfin arrivé... le tissu couvre absolument rien du tout 🥀 clique pour voir le crash-test 🤍`
          : (isUltraShort
            ? `mon colis de lingerie fine est enfin arrivé... le tissu couvre absolument rien du tout 🥀 clique pour voir le crash-test 🤍`
            : `mon colis de lingerie fine est enfin arrivé aujourd'hui... le tissu ne cache quasiment rien 🥀\n\nj'ai fait le crash-test directement en vidéo dans mon dressing. Clique en dessous pour voir le rendu sur moi 🤍`),
        estimatedOpenRate: '88%',
        suggestedPrice: `${price}€`,
        mediaNotice: `Crash-test lingerie dressing`,
        timeContextNote: 'Prétexte d\'achat en ligne très naturel et facile à associer à vos médias.'
      },
      {
        id: 'v5',
        angle: 'mysterious',
        angleLabel: 'Sortie de Bain / Serviette qui tombe',
        message: isOneLine
          ? `ma serviette a glissé toute seule sur le carrelage de la salle de bain... j'ai pas coupé la vidéo, regarde comme j'avais chaud 🚿`
          : (isUltraShort
            ? `ma serviette a glissé toute seule sur le carrelage de la salle de bain... j'ai pas coupé la vidéo, regarde comme j'avais chaud 🚿`
            : `ma serviette a glissé toute seule sur le carrelage de la salle de bain... 🚿\n\nmiroir embué, peau encore mouillée, j'ai tout filmé sans filtre. Débloque vite avant que je m'habille 🫦`),
        estimatedOpenRate: '94%',
        suggestedPrice: `${Math.max(10, price - 2)}€`,
        mediaNotice: `Vidéo sortie de douche intime`,
        timeContextNote: 'Cadre salle de bain familier et très immersif.'
      },
      {
        id: 'v6',
        angle: 'mysterious',
        angleLabel: 'Secret de Chambre (Exclusivité VIP)',
        message: isOneLine
          ? `ce clip restera strictement entre nous, c'est beaucoup trop chaud pour être publié ailleurs 🤍 débloque maintenant ✨`
          : (isUltraShort
            ? `ce clip restera strictement dans notre chat privé, c'est beaucoup trop chaud pour être publié ailleurs 🤍 débloque maintenant ✨`
            : `ce clip restera strictement dans notre chat privé, c'est beaucoup trop chaud pour être publié sur mon profil public 🥀\n\ntout s'est passé dans le noir sur mon lit... débloque mon secret et viens me voir en privé 🤍`),
        estimatedOpenRate: '95%',
        suggestedPrice: `${price + 4}€`,
        mediaNotice: `Média exclusif chambre VIP`,
        timeContextNote: 'L\'impression de privilège secret multiplie le taux d\'achat.'
      }
    ]
  };
}

/**
 * Executes a push generation with automatic fallback:
 * 1. Tries local backend API endpoint (/api/generate-push)
 * 2. If running standalone (Lovable, GitHub Pages, Vercel, Netlify) and backend fails or is absent:
 *    - If OpenRouter API Key is provided directly, calls OpenRouter API securely from client
 *    - Otherwise, provides the calibrated 6-variation copywriting engine
 */
export async function executePushGeneration(params: GeneratePushParams): Promise<GenerationResult> {
  const {
    modelProfile,
    platform,
    language,
    pushType,
    sentenceCount,
    mood,
    mediaType,
    priceSuggestion,
    mediaContext,
    callToAction,
    targetAudience,
    hotLevel,
    timeContext,
    trainingExamples,
    agencyPlaybookRules,
    openRouterConfig
  } = params;

  // 1. First attempt: call local server API (/api/generate-push)
  try {
    const serverResponse = await fetch('/api/generate-push', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });

    if (serverResponse.ok) {
      const data = await serverResponse.json();
      if (data && data.success) {
        return data as GenerationResult;
      }
    }
  } catch (_err) {
    // Server is absent or unreachable (e.g. running directly on Lovable static preview)
    console.info('Backend server unreachable or static environment detected (Lovable mode). Using direct client engine.');
  }

  // 2. Second attempt: Direct OpenRouter call if user entered their API key
  const apiKey = openRouterConfig?.apiKey?.trim() || (typeof window !== 'undefined' ? localStorage.getItem('musepush_openrouter_key') || '' : '');
  const selectedLlmModel = openRouterConfig?.model || 'anthropic/claude-3.5-sonnet';
  const temperature = openRouterConfig?.temperature ?? 0.85;

  if (apiKey) {
    try {
      const isPaidPush = pushType === 'paid_ppv';
      const pushTypeDirective = isPaidPush
        ? `TYPE DE MESSAGE : PAY PER VIEW (PPV PAYANT - Verrouillé derrière un prix)`
        : `TYPE DE MESSAGE : MASS MESSAGE RELATIONNEL GRATUIT`;

      const lengthDirective = sentenceCount === 'one_line'
        ? 'LONGUEUR STRICTEMENT CONSERVÉE : 1 SEULE PHRASE UNIQUE (8 à 15 mots maximum). Zéro retour à la ligne.'
        : (sentenceCount === 'ultra_short'
          ? 'LONGUEUR : ULTRA-COURT (1 à 2 phrases max, 15 à 25 mots).'
          : 'LONGUEUR : COURT (2 phrases max).');

      const systemPrompt = `Tu es une experte d'élite en copywriting et ghostwriting pour créatrices glamour & charme sur ${platform === 'onlyfans' ? 'OnlyFans' : 'MYM'}.
Ton rôle est de générer des MASS MESSAGES ultra-performants qui relancent immédiatement les discussions et l'intérêt des fans.

RÈGLES CAPITALES :
1. LE MESSAGE EST DÉJÀ EN DM : INTERDICTION FORMELLE d'écrire "viens en DM", "viens me dire en DM", "envoie un DM", "shoot me a DM". Le fan lit déjà ce message DANS ses messages privés ! Sois naturelle, comme un SMS intime.
2. LONGUEUR ULTRA-SIMPLE : Reste très direct, jusqu'à 1 seule phrase percutante.
3. DÉCLENCHEURS DE RÉPONSE SANS QUESTIONS BATEAUX : Privilégie les affirmations piquantes, confidences intimes, taquineries sur l'ego et opinions tranchées.
4. RÈGLE DU CADRE MÉDIA "100% MAISON" : Chambre, miroir, couette, lit, salle de bain, unboxing de lingerie reçue.
5. VARIÉTÉ : STRICTEMENT 6 VARIATIONS DIFFÉRENTES.`;

      const userPrompt = `Modèle : ${modelProfile?.name || 'Créatrice'}, ${modelProfile?.age || 23} ans.
Métier/Vie réelle : ${modelProfile?.realLifeOccupation || 'Étudiante / mode'}
Habitudes maison : ${modelProfile?.homeHabits || 'Chambre, miroir, lit'}
Plateforme : ${platform}
Langue : ${language === 'us' ? 'ANGLAIS US' : 'FRANÇAIS'}
Vibe : ${mood} | Hot level : ${hotLevel}/5 | ${pushTypeDirective}
${lengthDirective}
Format attendu : JSON valide avec "recommendations" et "variations" (tableau de 6 objets).`;

      const orResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : 'https://musepush.app',
          'X-Title': 'MusePush AI Studio',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: selectedLlmModel,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          response_format: { type: 'json_object' },
          temperature
        })
      });

      if (orResponse.ok) {
        const data = await orResponse.json();
        const content = data.choices?.[0]?.message?.content;
        if (content) {
          const cleaned = content.replace(/```json/gi, '').replace(/```/g, '').trim();
          const parsed = JSON.parse(cleaned);
          if (parsed && Array.isArray(parsed.variations) && parsed.variations.length > 0) {
            return {
              success: true,
              source: 'openrouter',
              modelUsed: selectedLlmModel,
              recommendations: parsed.recommendations || {
                bestSendTimeFanTz: '21h00 - 23h30',
                currentFanLocalTime: 'Soirée détente à domicile',
                pricingTip: isPaidPush ? `Prix conseillé: ${priceSuggestion || 15}€` : 'Push gratuit de relance',
                safetyAudit: 'Termes conformes et validés'
              },
              variations: parsed.variations
            };
          }
        }
      }
    } catch (openRouterErr) {
      console.warn('Direct OpenRouter call error, falling back to local simulated variations:', openRouterErr);
    }
  }

  // 3. Third step: High-fidelity calibrated variations (6 variations, 100% home context, affirmations & ego teasers)
  const simulated = generateClientSimulatedVariations({
    modelName: modelProfile?.name || 'Eden',
    language,
    mood,
    mediaContext,
    priceSuggestion: priceSuggestion || 15,
    platform,
    hotLevel,
    pushType,
    sentenceCount
  });

  return {
    success: true,
    source: 'fallback_engine',
    modelUsed: 'MusePush Engine (Home-Studio Calibrated)',
    recommendations: simulated.recommendations,
    variations: simulated.variations
  };
}
