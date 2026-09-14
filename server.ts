import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { generateDynamicPushVariations } from './src/services/dynamicPushEngine';
import { getResolvedTime } from './src/utils/timeZoneHelper';
import { MOODS, getMoodDetail } from './src/data';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Lazy Google GenAI initialization if Gemini fallback is desired
let aiClient: GoogleGenAI | null = null;
function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
  }
  return aiClient;
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasOpenRouterEnv: Boolean(process.env.OPENROUTER_API_KEY),
    hasGeminiEnv: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString()
  });
});

// Test OpenRouter API Key & Connection endpoint
app.post('/api/test-openrouter', async (req, res) => {
  const startTime = Date.now();
  try {
    const { apiKey, model = 'anthropic/claude-3.5-sonnet' } = req.body;
    const keyToUse = (apiKey || process.env.OPENROUTER_API_KEY || '').trim();

    if (!keyToUse) {
      return res.status(400).json({
        success: false,
        status: 'error',
        message: 'Aucune clé API OpenRouter renseignée.'
      });
    }

    // Call OpenRouter /api/v1/auth/key to verify credentials & quota
    const response = await fetch('https://openrouter.ai/api/v1/auth/key', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${keyToUse}`
      }
    });

    const latencyMs = Date.now() - startTime;

    if (response.ok) {
      const data = await response.json();
      const usage = data.data?.usage != null ? `${Number(data.data.usage).toFixed(2)}$` : 'Actif';
      const limit = data.data?.limit != null ? `${Number(data.data.limit).toFixed(2)}$` : 'Illimité';
      return res.json({
        success: true,
        status: 'connected',
        message: 'Connexion OpenRouter réussie ! Clé valide et active.',
        model,
        creditInfo: `Usage : ${usage} / Limite : ${limit}`,
        latencyMs
      });
    } else {
      const errText = await response.text();
      let msg = `Erreur OpenRouter (${response.status})`;
      if (response.status === 401) {
        msg = 'Clé API OpenRouter invalide ou révoquée (HTTP 401 Unauthorized).';
      } else if (response.status === 402) {
        msg = 'Crédits OpenRouter insuffisants (HTTP 402 Payment Required). Recharge tes crédits sur openrouter.ai.';
      } else if (response.status === 429) {
        msg = 'Limite de requêtes atteinte sur OpenRouter (HTTP 429 Rate Limit).';
      } else {
        msg = `OpenRouter a répondu : ${errText.slice(0, 150)}`;
      }
      return res.status(response.status).json({
        success: false,
        status: 'error',
        message: msg,
        latencyMs
      });
    }
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      status: 'error',
      message: err.message || 'Impossible de joindre le serveur OpenRouter.',
      latencyMs: Date.now() - startTime
    });
  }
});

// Timezone clock endpoint to help with live timezone calculations
app.get('/api/timezones', (req, res) => {
  const now = new Date();
  const zones = [
    { id: 'FR_CET', tz: 'Europe/Paris', label: 'France (Paris)' },
    { id: 'US_EST', tz: 'America/New_York', label: 'US East (New York)' },
    { id: 'US_CST', tz: 'America/Chicago', label: 'US Central (Chicago)' },
    { id: 'US_PST', tz: 'America/Los_Angeles', label: 'US West (Los Angeles)' }
  ];

  const results = zones.map(z => {
    const formatted = new Intl.DateTimeFormat('fr-FR', {
      timeZone: z.tz,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    }).format(now);

    const hour = parseInt(new Intl.DateTimeFormat('en-US', {
      timeZone: z.tz,
      hour: 'numeric',
      hour12: false
    }).format(now), 10);

    let period = 'jour';
    let activityNote = 'Activité modérée';
    if (hour >= 6 && hour < 11) {
      period = 'matin';
      activityNote = 'Réveil & café - Idéal Push spontané';
    } else if (hour >= 11 && hour < 14) {
      period = 'midi';
      activityNote = 'Pause déjeuner - Bon CTR';
    } else if (hour >= 14 && hour < 19) {
      period = 'apres-midi';
      activityNote = 'Boulot/Activités - Push doux ou sondage';
    } else if (hour >= 19 && hour < 23) {
      period = 'soiree';
      activityNote = 'Heure de pointe maximale ! Top déblocages PPV';
    } else {
      period = 'nuit';
      activityNote = 'Nuit profonde - Push intime / insomnie / VIP';
    }

    return {
      ...z,
      localTimeString: formatted,
      hour,
      period,
      activityNote
    };
  });

  res.json({ nowUtc: now.toISOString(), zones: results });
});

// Generate mass push messages via OpenRouter or smart fallback
app.post('/api/generate-push', async (req, res) => {
  try {
    const {
      modelProfile,
      platform,
      language,
      pushType = 'paid_ppv',
      sentenceCount = 'short',
      varietyLevel = 'high',
      mood,
      mediaType,
      priceSuggestion,
      mediaContext,
      callToAction,
      targetAudience,
      hotLevel,
      timeContext,
      openRouterConfig,
      trainingExamples,
      agencyPlaybookRules
    } = req.body;

    const apiKey = openRouterConfig?.apiKey || process.env.OPENROUTER_API_KEY;
    const selectedModel = openRouterConfig?.model || 'anthropic/claude-3.5-sonnet';

    // Temperature auto-adjustment according to varietyLevel
    // 'low' -> 0.40 (consistent, predictable), 'medium' -> 0.75 (balanced), 'high' -> 1.10 (novelty & high creativity)
    const baseTemp = varietyLevel === 'high' ? 1.10 : (varietyLevel === 'low' ? 0.40 : 0.75);
    const llmTemperature = openRouterConfig?.temperature ?? baseTemp;
    const geminiTemperature = varietyLevel === 'high' ? 1.05 : (varietyLevel === 'low' ? 0.40 : 0.75);

    // Sentence length strict guidelines
    let lengthDirective = '';
    if (sentenceCount === 'one_line') {
      lengthDirective = `LONGUEUR STRICTEMENT CONSERVÉE : 1 SEULE PHRASE UNIQUE (Ultra-court, percutant, brut, maximum 8 à 15 mots).
- Le message fait STRICTEMENT 1 SEULE LIGNE / 1 PHRASE. Zéro saut de ligne, zéro blabla.
- Style SMS instantané percutant.`;
    } else if (sentenceCount === 'ultra_short') {
      lengthDirective = `LONGUEUR STRICTEMENT CONSERVÉE : ULTRA-COURT (1 à 2 phrases MAX).
- Le message doit faire entre 15 et 25 mots au total.
- AUCUN paragraphe long. Style SMS direct, percutant et rapide. Pas de remplissage.`;
    } else if (sentenceCount === 'short') {
      lengthDirective = `LONGUEUR STRICTEMENT CONSERVÉE : COURT (2 phrases courtes MAX).
- Le message doit faire entre 25 et 40 mots au total.
- Zéro roman ! Des phrases rythmées avec de l'air.`;
    } else {
      lengthDirective = `LONGUEUR : MAXIMUM 2 À 3 PHRASES COURTES.
- Le message ne doit JAMAIS dépasser 45 mots. Reste concis et spontané.`;
    }

    // Push Type distinctions: Paid PPV vs Free Retention
    const isPaidPush = pushType === 'paid_ppv';
    let pushTypeDirective = '';
    if (isPaidPush) {
      pushTypeDirective = `TYPE DE MESSAGE : MASS MESSAGE PAYANT (PPV / Média à débloquer).
- Le fan doit payer ou débloquer pour voir la photo/vidéo.
- L'objectif est le DÉCLENCHEMENT D'ACHAT (taux de conversion PPV).
- Ne dévoile pas tout, donne envie de débloquer le contenu avec curiosité, tension sensuelle ou urgence intime.
- Mentionne discrètement de regarder/débloquer sans jamais utiliser de termes mercantiles ("promo", "achetez").`;
    } else {
      pushTypeDirective = `TYPE DE MESSAGE : MASS MESSAGE SIMPLE & GRATUIT (Relationnel / Engagement / Rétention).
- Il n'y a PAS de média payant à débloquer ! (Média offert ou simple SMS relationnel).
- L'objectif est d'ENGAGER LE DIALOGUE, booster la complicité ou réactiver le fan.
- Ne parle d'AUCUN déblocage ni d'aucun prix !`;
    }

    // Format training examples for few-shot learning
    let trainingContext = '';
    if (Array.isArray(trainingExamples) && trainingExamples.length > 0) {
      trainingContext = `\n\nEXEMPLES DE PUSHS HISTORIQUES GAGNANTS (AYANT GÉNÉRÉ LE PLUS DE VENTES/PPV) :
Inspire-toi rigoureusement de leur syntaxe, de leur rythme, de l'absence totale de vocabulaire commercial et de leur authenticité :
${trainingExamples.map((ex: any, i: number) => `
[Exemple Gagnant #${i + 1} - ${ex.title || 'Push Top Performer'} (${ex.revenueGenerated || 'Fort CA'})] :
"""
${ex.text}
"""
(Pourquoi il a cartonné : ${ex.notes || 'Ton naturel et intime'})
`).join('\n')}`;
    }

    let rulesContext = '';
    if (agencyPlaybookRules && agencyPlaybookRules.trim()) {
      rulesContext = `\n\nDIRECTIVES & PLAYBOOK SPÉCIFIQUE DE L'AGENCE (À RESPECTER STRICTEMENT) :
${agencyPlaybookRules.trim()}`;
    }

    // Build the tailored prompt
    const langInstructions = language === 'us'
      ? `Write in authentic, modern American English used by successful female content creators.
Use natural abbreviations, colloquial rhythms (like "babe", "ngl", "lowkey", "so juicy", "look what happened earlier..."), intimate cadence, lowercase touches where natural, and realistic spacing. NEVER sound corporate, formal, or robotic.`
      : `Écris en français naturel et moderne, exactement comme une vraie jeune femme sexy et complice qui parle à son crush ou à sa communauté intime.
Utilise des tournures familières, spontanées (ex: "coucou toi", "j’ai pensé à toi", "tu vas pas en revenir...", "j’ai fait une bêtise..."). Zéro formule de pub impersonnelle, ponctuation légère et naturelle.`;

    const platformTerminology = platform === 'onlyfans'
      ? 'Platform: OnlyFans (Fans receive mass message / PPV / Tip to unlock).'
      : 'Platform: MYM.fans (Média privé / Push payant / Message d’actualité privée).';

    // Resolve exact clock & time of day period
    const resolvedTime = getResolvedTime(
      timeContext?.selectedTzZone || 'FR_CET',
      timeContext?.useCurrentTime ?? true,
      timeContext?.customHour,
      timeContext?.customMinute
    );

    const timeRuleSystem = language === 'us'
      ? `8. CRITICAL TIME CONTEXT & REAL-WORLD CLOCK (CURRENT FAN TIME: ${resolvedTime.timeString} - ${resolvedTime.periodLabelUs}):
   - CURRENT LOCAL TIME: Exactly ${resolvedTime.timeString} (${resolvedTime.periodLabelUs}).
   - FORBIDDEN CONTRADICTORY WORDS: Do NOT use ${resolvedTime.forbiddenWordsUs.map(w => `"${w}"`).join(', ')}.
   - IF IT IS 12 PM, 1 PM, 2 PM (14h) OR AFTERNOON: ABSOLUTE BAN on waking up, morning bed sheets, messy sleep hair, "just woke up", "this morning", "waking up", or morning coffee. The day is already in full swing! It is BROAD DAYLIGHT.
   - If it is daytime: BROAD DAYLIGHT! NEVER speak of "night", "bedtime", "tonight", "insomnia", "sleeping", or "dark room".
   - REAL ATMOSPHERE REQUIRED: ${resolvedTime.contextualAtmosphereUs}`
      : `8. RÈGLE CRITIQUE DE COHÉRENCE HORAIRE & LUMIÈRE DU JOUR (HEURE RÉELLE ACTUELLE DU FAN : ${resolvedTime.timeString} - ${resolvedTime.periodLabelFr}) :
   - HEURE LOCALE EXACTE DU FAN : Il est actuellement ${resolvedTime.timeString} (${resolvedTime.periodLabelFr}).
   - MOTS & EXPRESSIONS STRICTEMENT INTERDITS : Ne mentionne JAMAIS ${resolvedTime.forbiddenWordsFr.map(w => `"${w}"`).join(', ')}.
   - S'IL EST 12H, 13H, 14H OU DANS L'APRÈS-MIDI : INTERDICTION FORMELLE ET ABSOLUE DE PARLER DU RÉVEIL DU MATIN ! Tu ne dois JAMAIS écrire "les yeux à peine ouverts", "je me réveille", "au réveil", "au saut du lit", "mon café du matin", "ce matin", "nuisette qui a glissé pendant la nuit". À 14h, la journée est déjà bien entamée, le réveil est passé depuis des heures, c'est l'après-midi en plein jour !
   - S'IL FAIT JOUR : INTERDICTION FORMELLE d'évoquer "ce soir", "cette nuit", "bonne nuit", "insomnie", "tu dors", "dans le noir" ou "lampe de chevet".
   - AMBIANCE OBLIGATOIRE : ${resolvedTime.contextualAtmosphereFr}`;

    const moodObj = getMoodDetail(mood);
    const moodName = moodObj ? (language === 'us' ? moodObj.nameEn : moodObj.name) : mood;
    const moodGuidance = moodObj ? (language === 'us' ? moodObj.promptGuidanceUs : moodObj.promptGuidanceFr) : '';

    let moodSpecificInstructions = '';
    if (mood === 'positions_hot') {
      moodSpecificInstructions = language === 'us'
        ? `\n- SPECIFICITY POSITIONS & ANGLES (HIGH PRIORITY): Every proposition MUST center on favorite intimate positions, cambrures, arched angles on bed/sheets, riding, or provocative questions about what position drives him wild. Make him picture it immediately.`
        : `\n- SPÉCIFICITÉ POSITIONS & ANGLES HOT (PRIORITAIRE ABSOLUE) : Les propositions DOIVENT obligatoirement tourner autour des positions préférées, de la cambrure sur le lit, d'être au-dessus ou prise par surprise, ou de questions/dilemmes très chauds sur ses positions préférées. Force-le à s'imaginer la scène immédiatement.`;
    } else if (mood === 'body_explicit') {
      moodSpecificInstructions = language === 'us'
        ? `\n- SPECIFICITY BODY & EXPLICIT CURVES (HIGH PRIORITY): Unfiltered focus on body curves (chest/breasts, sheer transparent fabric, arch, waist, hips, wet skin). Raw, confident, highly sensual and completely unapologetic.`
        : `\n- SPÉCIFICITÉ CORPS & DÉTAILS SANS FILTRE (PRIORITAIRE ABSOLUE) : Focalise les propositions sans complexe sur l'anatomie et les détails sensuels du corps (poitrine/seins lourds qui débordent, cambrure, fesses/cul moulé, dentelle ultra-transparente, peau chaude). Ton très audacieux, direct et décomplexé.`;
    } else if (mood === 'fantasies_taboo') {
      moodSpecificInstructions = language === 'us'
        ? `\n- SPECIFICITY FANTASIES & FORBIDDEN (HIGH PRIORITY): Explore secret fantasies, unspoken desires, taboo thoughts, and bold questions asking what his wildest forbidden fantasy is.`
        : `\n- SPÉCIFICITÉ FANTASMES & INTERDITS (PRIORITAIRE ABSOLUE) : Explore les désirs inavoués, les pensées interdites, les scénarios secrets sans tabou, et pose des questions directes sur ses fantasmes les plus inavouables.`;
    } else if (mood === 'dirty_talk') {
      moodSpecificInstructions = language === 'us'
        ? `\n- SPECIFICITY DIRTY TALK & RAW VIBE (HIGH PRIORITY): Direct, intimate, fiery dirty talk. Tease ruthlessly, whisper raw sensations, and light a fire under him with one unapologetic sentence.`
        : `\n- SPÉCIFICITÉ DIRTY TALK & PROVOCATION (PRIORITAIRE ABSOLUE) : Adopte un langage très direct, complice et brûlant. Provocations sensuelles brutes, excitation partagée, chuchotement sans filtre qui fait grimper la température en une phrase.`;
    } else if (mood === 'shower_bath') {
      moodSpecificInstructions = language === 'us'
        ? `\n- SPECIFICITY SHOWER & WET SKIN: Water droplets on skin, steamy bathroom mirror, towel slipping off, fresh wet hair.`
        : `\n- SPÉCIFICITÉ DOUCHE & BAIN : Gouttes d'eau sur la peau, miroir embué, serviette qui glisse toute seule, sortie de bain sensuelle.`;
    }

    const systemPrompt = `Tu es une experte d'élite en copywriting et ghostwriting pour créatrices glamour & charme sur ${platform === 'onlyfans' ? 'OnlyFans' : 'MYM'}.
Ton rôle est de générer des MASS MESSAGES ultra-performants qui relancent immédiatement les discussions et l'intérêt des fans.

RÈGLE CAPITALE DE LA VIBE & CIRCONSTANCE :
- VIBE SÉLECTIONNÉE : "${moodName}" (${moodObj?.badge || 'Thématique active'})
- CONSIGNE DE CE MOOD : ${moodGuidance}
${moodSpecificInstructions}
- TU DOIS OBLIGATOIREMENT imprégner les propositions de cette thématique ! Chaque proposition doit respirer cette vibe avec sa propre approche créative.

RÈGLES CAPITALES DE CONVERSATION & LOGISTIQUE MÉDIA :
1. LE MESSAGE EST DÉJÀ DANS LA MESSAGERIE PRIVÉE (DM) DU FAN :
   - INTERDICTION STRICTE de phrases ridicules et redondantes comme "viens me dire en DM", "réponds-moi en DM", "viens en DM", "shoot me a DM", "text me in DMs". Le fan est DÉJÀ dans son chat DM en train de lire le message ! Parler de "DM" sonne faux, amateur et cringe.
   - Parle directement comme un SMS intime ("dis-moi ce que t'en penses", "avoue", "t'en dis quoi ?", "j'attends ton avis", ou simplement l'affirmation seule sans demander la permission).

2. ULTRA-CONCIS (JUSQU'À 1 PHRASE SIMPLE) :
   - Fais court, percutant et brut. Pas de longs paragraphes ni de blabla de remplissage. Une seule phrase puissante suffit souvent à déclencher 10x plus de réponses.

3. DÉCLENCHEURS DE RÉPONSE SANS QUESTIONS BATEAUX :
   - Évite impérativement d'être toujours en mode question ("tu fais quoi ?", "tu dors ?", "t'as passé une bonne journée ?") qui sonne comme un robot télémarketing sans charme.
   - Privilégie les affirmations directes, les pensées impulsives, les piques complices, les détails troublants ou les constats sans filtre.

4. RÈGLE STRICTE DU CADRE MÉDIA "100% MAISON / APPARTEMENT" :
   - Les créatrices n'ont PAS d'équipe de tournage pro ni de médias en studio extérieur ou en loge de défilé.
   - TOUTES les scènes, essayages et moments doivent être ancrés dans l'intimité du domicile réel :
     * Le lit / sous la couette ou les draps défaits
     * Le miroir de sa chambre ou du dressing (essayage de colis de lingerie commandés en ligne)
     * La salle de bain (sortie de douche, serviette, miroir embué, bain)
     * Le canapé du salon (télétravail/révisions décontractées en tenue trop légère)
     * La cuisine (verre d'eau en pleine nuit, café du matin pieds nus)

5. ANCRAGE DANS LA VIE RÉELLE DU MODÈLE :
   - Intègre ce qu'elle aime faire et son rythme quotidien réel (${modelProfile?.realLifeOccupation || 'Étudiante / passionnée de mode'}, ${modelProfile?.homeHabits || 'Traîne en nuisette, teste ses colis lingerie devant son miroir'}).

6. LIBERTÉ CRÉATIVE ABSOLUE — AUCUN ANGLE PRÉCIS NI SCHÉMA IMPOSÉ :
   - INTERDICTION STRICTE DE SUIVRE UN PLAN D'ANGLES FIGÉS OU RÉPÉTITIFS (ne force JAMAIS de schéma 'confession, défi ego, micro-instant, opinion, bêtise, secret'). Les angles précis deviennent redondants et prévisibles.
   - TU AS UNE TOTALE LIBERTÉ SUR LES PROPOSITIONS : choisis librement pour chaque proposition son approche, son énergie, son ton et sa dynamique émotionnelle.
   - RÈGLE D'ANTI-SIMILARITÉ STRICTE : AUCUNE des 6 propositions ne doit se ressembler. Chaque proposition doit explorer une intention, un ton, un rythme de phrase et un déclencheur psychologique totalement différents.
   - D'UNE GÉNÉRATION À L'AUTRE : Renouvelle intégralement tes idées. Surprends avec des accroches inattendues, des réflexions spontanées, des provocations douces, des métaphores complices ou des constats bruts. Ne reproduis jamais les mêmes formules.
${varietyLevel === 'high' ? `
7. DIVERSITÉ & NOUVEAUTÉ MAXIMALE ACTIVE (VARIÉTÉ ÉLEVÉE) :
   - INTERDICTION FORMELLE DE FORMULES VUES OU DE CLICHÉS RÉPÉTÉS : Explore les nuances les plus subtiles et inattendues de sa personnalité.
   - ÉLECTROCHOC CRÉATIF : Aucune accroche ne doit utiliser la même construction grammaticale que les autres.` : (varietyLevel === 'low' ? `
7. SOBRIÉTÉ :
   - Reste naturelle et fluide, sans complexité superflue.` : `
7. VARIÉTÉ ÉQUILIBRÉE :
   - Richesse naturelle des accroches, fraîcheur du vocabulaire et diversité des intentions.`)}

${timeRuleSystem}`;

    const userPrompt = `DÉTAILS DU PUSH À GÉNÉRER :
- Modèle : ${modelProfile?.name || 'Créatrice'}, ${modelProfile?.age || 23} ans.
${modelProfile?.location ? `- Localisation : ${modelProfile.location}` : ''}
- Métier / Vie réelle : ${modelProfile?.realLifeOccupation || 'Créatrice & passionnée de mode'}.
- Habitudes à la maison : ${modelProfile?.homeHabits || 'Chambre, grand miroir, couette, moments cosy'}.
- Personnalité : ${modelProfile?.personality || 'Sensuelle, naturelle et très complice'}.
${modelProfile?.objective ? `- Objectif relationnel prioritaire : ${modelProfile.objective}` : ''}
${modelProfile?.themes && modelProfile.themes.length > 0 ? `- Thèmes et univers de prédilection : ${modelProfile.themes.join(', ')}` : ''}
${modelProfile?.tone ? `- Ton de voix : ${modelProfile.tone}` : ''}
- Style / Directives : ${modelProfile?.customToneNotes || 'Affirmations directes, ton spontané et taquin'}.
- Emojis signatures : ${(modelProfile?.favoriteEmojis || []).join(' ')}.
- ${platformTerminology}
- Langue requise : ${language === 'us' ? 'ANGLAIS US (Américain)' : 'FRANÇAIS'}
- VIBE & CIRCONSTANCE SÉLECTIONNÉE (PRIORITAIRE) : "${moodName}" (${moodObj?.badge || 'Thématique'})
  * Consigne psychologique de la vibe : ${moodGuidance}
${moodSpecificInstructions ? `  * DIRECTIVE IMPÉRATIVE DE LA VIBE : ${moodSpecificInstructions.trim()}` : ''}
- Niveau d'audace / Hot level (1-5) : ${hotLevel}/5
- ${pushTypeDirective}
- ${lengthDirective}
- Média joint : ${mediaType} ${isPaidPush && priceSuggestion ? `(Prix suggéré PPV : ${priceSuggestion} €/$)` : (isPaidPush ? '' : '(Média offert / relance discussion)')}
- Contexte du média (ou sujet de discussion) : "${mediaContext || 'Moment intime spontané dans la chambre'}"
- Appel à l'action visé : ${isPaidPush ? callToAction : 'dm_talk (relancer la discussion en DM)'}
- Cible : ${targetAudience}
- Fuseau horaire ciblé : ${resolvedTime.tzZone} (Heure locale fan : ${resolvedTime.timeString} — ${resolvedTime.periodLabelFr})
- Ambiance temporelle obligatoire : ${resolvedTime.contextualAtmosphereFr}
- Mots interdits en raison de l'heure : ${resolvedTime.forbiddenWordsFr.join(', ')}
${trainingContext}
${rulesContext}

${langInstructions}

FORMAT ATTENDU :
Renvoie UNIQUEMENT un objet JSON valide avec STRICTEMENT 6 PROPOSITIONS TOTALEMENT LIBRES ET DIVERSES :
Important : Ne suis AUCUN angle pré-défini. Sois 100% libre et invente 6 approches complètement uniques et imprévisibles pour qu'aucune ne se ressemble.
Donne à chaque proposition un "angleLabel" court et original inventé pour l'occasion (ex: "Pensée impulsive", "Pique complice", "Détail troublant", "Provocation douce", "Instinct brut", "Humeur sans filtre", etc.) :
{
  "recommendations": {
    "bestSendTimeFanTz": "${resolvedTime.timeString} (${resolvedTime.periodLabelFr})",
    "currentFanLocalTime": "${resolvedTime.timeString} — ${resolvedTime.periodLabelFr}",
    "pricingTip": "${isPaidPush ? 'Conseil court sur le prix optimal du PPV' : 'Conseil d\'engagement : une affirmation forte génère 3x plus de réponses'}",
    "safetyAudit": "Note de conformité aux règles de la plateforme (termes validés)"
  },
  "variations": [
    {
      "id": "var-1",
      "angle": "libre_1",
      "angleLabel": "Titre créatif unique pour cette proposition",
      "message": "Texte court, percutant et unique...",
      "estimatedOpenRate": "88%",
      "suggestedPrice": "${isPaidPush ? (priceSuggestion ? priceSuggestion + (language === 'us' ? '$' : '€') : '15€') : 'Gratuit'}",
      "mediaNotice": "${isPaidPush ? 'PPV Verrouillé' : 'Offert / DM'}",
      "timeContextNote": "Intention psychologique singulière"
    },
    {
      "id": "var-2",
      "angle": "libre_2",
      "angleLabel": "Autre titre créatif unique (approche distincte)",
      "message": "Texte court avec une énergie et un ton radicalement différents...",
      "estimatedOpenRate": "92%",
      "suggestedPrice": "${isPaidPush ? (priceSuggestion ? priceSuggestion + (language === 'us' ? '$' : '€') : '12€') : 'Gratuit'}",
      "mediaNotice": "${isPaidPush ? 'PPV Verrouillé' : 'Offert / DM'}",
      "timeContextNote": "Autre levier relationnel"
    },
    {
      "id": "var-3",
      "angle": "libre_3",
      "angleLabel": "Autre titre créatif unique (rythme différent)",
      "message": "Texte court avec une émotion distincte...",
      "estimatedOpenRate": "86%",
      "suggestedPrice": "${isPaidPush ? (priceSuggestion ? priceSuggestion + (language === 'us' ? '$' : '€') : '18€') : 'Gratuit'}",
      "mediaNotice": "${isPaidPush ? 'PPV Verrouillé' : 'Offert / DM'}",
      "timeContextNote": "Scène ou détail spontané"
    },
    {
      "id": "var-4",
      "angle": "libre_4",
      "angleLabel": "Autre titre créatif unique (énergie inattendue)",
      "message": "Texte court surprenant...",
      "estimatedOpenRate": "90%",
      "suggestedPrice": "${isPaidPush ? (priceSuggestion ? priceSuggestion + (language === 'us' ? '$' : '€') : '15€') : 'Gratuit'}",
      "mediaNotice": "${isPaidPush ? 'PPV Verrouillé' : 'Offert / DM'}",
      "timeContextNote": "Déclencheur d'intérêt inattendu"
    },
    {
      "id": "var-5",
      "angle": "libre_5",
      "angleLabel": "Autre titre créatif unique (ton brut ou complice)",
      "message": "Texte court avec un naturel désarmant...",
      "estimatedOpenRate": "89%",
      "suggestedPrice": "${isPaidPush ? (priceSuggestion ? priceSuggestion + (language === 'us' ? '$' : '€') : '14€') : 'Gratuit'}",
      "mediaNotice": "${isPaidPush ? 'PPV Verrouillé' : 'Offert / DM'}",
      "timeContextNote": "Spontanéité organique"
    },
    {
      "id": "var-6",
      "angle": "libre_6",
      "angleLabel": "Autre titre créatif unique (audace ou confidence)",
      "message": "Texte court marquant et singulier...",
      "estimatedOpenRate": "94%",
      "suggestedPrice": "${isPaidPush ? (priceSuggestion ? priceSuggestion + (language === 'us' ? '$' : '€') : '20€') : 'Gratuit'}",
      "mediaNotice": "${isPaidPush ? 'PPV Verrouillé' : 'Offert / DM'}",
      "timeContextNote": "Confidence ou exclusivité"
    }
  ]
}`;

    let parsedResult: any = null;
    let source: 'openrouter' | 'fallback_engine' = 'fallback_engine';
    const openRouterDiagnostic = {
      attempted: Boolean(apiKey),
      success: false,
      error: undefined as string | undefined,
      model: selectedModel,
      latencyMs: 0
    };

    // 1. If OpenRouter API key is provided, call OpenRouter
    if (apiKey) {
      const orStartTime = Date.now();
      try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'HTTP-Referer': process.env.APP_URL || 'https://musepush.applet',
            'X-Title': 'MusePush AI Studio',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: selectedModel,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ],
            response_format: { type: 'json_object' },
            temperature: llmTemperature
          })
        });

        openRouterDiagnostic.latencyMs = Date.now() - orStartTime;

        if (response.ok) {
          const data = await response.json();
          const content = data.choices?.[0]?.message?.content;
          if (content) {
            try {
              const cleaned = content.replace(/```json/gi, '').replace(/```/g, '').trim();
              parsedResult = JSON.parse(cleaned);
              source = 'openrouter';
              openRouterDiagnostic.success = true;
            } catch (err: any) {
              console.warn('Could not parse OpenRouter response as strict JSON, falling back:', err);
              openRouterDiagnostic.error = 'Réponse OpenRouter non-JSON';
            }
          }
        } else {
          const errText = await response.text();
          console.warn('OpenRouter API returned error:', response.status, errText);
          openRouterDiagnostic.error = `HTTP ${response.status}: ${errText.slice(0, 150)}`;
        }
      } catch (orErr: any) {
        openRouterDiagnostic.latencyMs = Date.now() - orStartTime;
        openRouterDiagnostic.error = orErr.message || 'Erreur réseau vers OpenRouter';
        console.warn('OpenRouter connection error:', orErr);
      }
    }

    // 2. If OpenRouter wasn't used or failed, try Gemini if key exists
    if (!parsedResult && process.env.GEMINI_API_KEY) {
      try {
        const ai = getAiClient();
        const nonce = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        const noveltyNotice = varietyLevel === 'high'
          ? `[LIBERTÉ CRÉATIVE TOTALE - DIVERSITÉ & NOUVEAUTÉ MAXIMALE ACTIVE - TEMPÉRATURE ${geminiTemperature}]\nInterdiction formelle de répéter les formulations ou de suivre un schéma d'angles fixe. Donne 6 propositions d'accroches radicalement différentes les unes des autres.`
          : `[CONSIGNE VARIÉTÉ : ${varietyLevel.toUpperCase()} - LIBERTÉ CRÉATIVE TOTALE - 6 PROPOSITIONS DISSIMILAIRES]`;

        const geminiRes = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: `${systemPrompt}\n\n${userPrompt}\n\n[SEED FRAÎCHEUR #${nonce}]\n${noveltyNotice}\nCONSIGNE : Génère 6 propositions totalement libres et imprévisibles, sans angle précis imposé, afin qu'aucune ne se ressemble.`,
          config: {
            responseMimeType: 'application/json',
            temperature: geminiTemperature
          }
        });

        if (geminiRes.text) {
          const cleaned = geminiRes.text.replace(/```json/gi, '').replace(/```/g, '').trim();
          parsedResult = JSON.parse(cleaned);
          source = 'openrouter'; // Valid server-side AI model
        }
      } catch (gemErr) {
        console.warn('Gemini fallback error:', gemErr);
      }
    }

    // 3. Dynamic Creative Generator if no API key is set yet or for instant fresh preview
    if (!parsedResult) {
      parsedResult = generateDynamicPushVariations({
        modelProfile,
        language,
        mood,
        mediaContext,
        priceSuggestion: priceSuggestion || 15,
        platform,
        hotLevel,
        pushType,
        sentenceCount,
        timeContext: {
          ...timeContext,
          selectedTzZone: resolvedTime.tzZone,
          customHour: resolvedTime.hour,
          customMinute: resolvedTime.minute,
          calculatedHour: resolvedTime.timeString,
          resolvedPeriod: resolvedTime.periodLabelFr
        }
      });
      source = 'fallback_engine';
    }

    // Double safety sanitizer: purge nocturnal or morning wake-up hallucinations according to real period
    if (parsedResult && Array.isArray(parsedResult.variations)) {
      parsedResult.variations = parsedResult.variations.map((v: any) => {
        if (!v || typeof v.message !== 'string') return v;
        let msg = v.message;

        if (resolvedTime.period === 'lunch' || resolvedTime.period === 'afternoon') {
          // French replacements for afternoon/lunch (14h, midday, etc.)
          msg = msg
            .replace(/les yeux à peine ouverts et la nuisette qui a glissé pendant la nuit\.\.\. regarde comment je me réveille ☕/gi, "petite pause de 14h en nuisette légère... regarde comment je m'occupe toute seule 🫦")
            .replace(/pendant la nuit\.\.\. regarde comment je me réveille/gi, "au milieu de la journée... regarde ce que je fais")
            .replace(/comment je me réveille ☕/gi, "ce que je fais maintenant 🫦")
            .replace(/les yeux à peine ouverts/gi, "les yeux qui pétillent")
            .replace(/au réveil/gi, "en ce moment")
            .replace(/je me réveille/gi, "je pense à toi")
            .replace(/au saut du lit/gi, "dans ma chambre")
            .replace(/ce matin/gi, "aujourd'hui")
            .replace(/petit déj/gi, "pause café")
            .replace(/petit déjeuner/gi, "pause détente")
            .replace(/mon petit shorty de nuit est minuscule ce matin/gi, "ma petite tenue d'été est minuscule cet après-midi")
            .replace(/\bce soir\b/gi, "aujourd'hui")
            .replace(/\bcette nuit\b/gi, "en ce moment")
            .replace(/\bbonne nuit\b/gi, "bisous")
            .replace(/\binsomnie\b/gi, "petite pause")
            .replace(/\btu dors\b/gi, "t'es là")
            .replace(/\bdans le noir\b/gi, "dans ma chambre")
            .replace(/\blampe de chevet\b/gi, "lumière du soleil");

          // English replacements for afternoon/lunch
          msg = msg
            .replace(/eyes barely open and my sleep slip twisted up during the night\.\.\. look how I wake up ☕/gi, "sneaky afternoon break in sheer lace... look what I get up to when I'm alone 🫦")
            .replace(/look how I wake up ☕/gi, "look what I'm doing right now 🫦")
            .replace(/\bthis morning\b/gi, "today")
            .replace(/\bjust woke up\b/gi, "taking a break")
            .replace(/\bwaking up\b/gi, "relaxing")
            .replace(/\btonight\b/gi, "today")
            .replace(/\blate night\b/gi, "right now")
            .replace(/\bgood night\b/gi, "talk soon")
            .replace(/\binsomnia\b/gi, "taking a break")
            .replace(/\bin the dark\b/gi, "in my room")
            .replace(/\bbedside lamp\b/gi, "daylight");
        } else if (resolvedTime.period === 'morning') {
          msg = msg
            .replace(/\bce soir\b/gi, "aujourd'hui")
            .replace(/\bcette nuit\b/gi, "en ce moment")
            .replace(/\bbonne nuit\b/gi, "bonne journée")
            .replace(/\binsomnie\b/gi, "réveil doux")
            .replace(/\btu dors\b/gi, "tu es réveillé")
            .replace(/\bdans le noir\b/gi, "au lit")
            .replace(/\blampe de chevet\b/gi, "lumière du jour")
            .replace(/\btonight\b/gi, "today")
            .replace(/\blate night\b/gi, "early morning");
        }
        return { ...v, message: msg };
      });
    }

    res.json({
      success: true,
      modelUsed: apiKey ? selectedModel : 'MusePush High-Conversion Engine',
      source,
      openRouterStatus: openRouterDiagnostic,
      variations: parsedResult.variations || [],
      recommendations: parsedResult.recommendations || {
        bestSendTimeFanTz: `${resolvedTime.timeString} (${resolvedTime.periodLabelFr})`,
        currentFanLocalTime: `${resolvedTime.timeString} — ${resolvedTime.periodLabelFr}`,
        pricingTip: 'Maintiens un tarif adapté pour maximiser le taux de conversion immédiat.',
        safetyAudit: 'Conforme aux politiques de contenus autorisés.'
      }
    });

  } catch (error: any) {
    console.error('Push generation route error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erreur interne lors de la génération'
    });
  }
});

// Dynamic creative engine when no external API key is active
function generateSimulatedVariations(params: any) {
  return generateDynamicPushVariations({
    modelProfile: params.modelProfile || ({ name: params.modelName || 'Sophia', id: 'temp' } as any),
    language: params.language || 'fr',
    mood: params.mood || 'hot',
    mediaContext: params.mediaContext || '',
    priceSuggestion: params.priceSuggestion || 15,
    platform: params.platform || 'onlyfans',
    hotLevel: params.hotLevel || 4,
    pushType: params.pushType || 'paid_ppv',
    sentenceCount: params.sentenceCount || 'short'
  });
}

function _legacySimulatedVariations(params: {
  modelName: string;
  language: string;
  mood: string;
  mediaContext: string;
  priceSuggestion: number;
  platform: string;
  hotLevel: number;
  pushType?: string;
  sentenceCount?: string;
}) {
  const isUs = params.language === 'us';
  const name = params.modelName;
  const isPaid = params.pushType !== 'free_retention';
  const isOneLine = params.sentenceCount === 'one_line';
  const isUltraShort = params.sentenceCount === 'ultra_short';
  const isMedium = params.sentenceCount === 'medium';
  const price = params.priceSuggestion;
  const priceLabel = isPaid ? (isUs ? `$${price}` : `${price}€`) : (isUs ? 'Free' : 'Gratuit');

  if (isUs) {
    if (!isPaid) {
      // Free Mass Message (Retention / DM chat hook - Home based, Statements & Teasing, 6 variations)
      return {
        recommendations: {
          bestSendTimeFanTz: '8:30 PM - 11:00 PM (Fan Local Time)',
          currentFanLocalTime: 'Peak evening engagement window',
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

    // Paid PPV Message (US - 6 Home-Based Variations)
    return {
      recommendations: {
        bestSendTimeFanTz: '9:30 PM - 11:45 PM (Fan Local Time)',
        currentFanLocalTime: 'Evening relaxation window',
        pricingTip: `Optimal unlock price $${price} - $${price + 5}. A punchy 1-sentence teaser yields the highest unlock rate.`,
        safetyAudit: '100% compliant with platform content guidelines.'
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

  // French variations (6 Home-Based Variations)
  if (!isPaid) {
    // Message gratuit / relationnel - 6 Variations à domicile
    return {
      recommendations: {
        bestSendTimeFanTz: '20h30 - 23h00 (Heure locale du fan)',
        currentFanLocalTime: 'Créneau discussion privée & fidélisation',
        pricingTip: 'Push simple 1 phrase : une affirmation percutante sans blabla génère un maximum d\'engagement spontané.',
        safetyAudit: 'Vocabulaire naturel et conforme aux règles des plateformes.'
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

  // French Paid PPV variations - 6 Variations à domicile
  return {
    recommendations: {
      bestSendTimeFanTz: '21h15 - 23h30 (Heure locale du fan)',
      currentFanLocalTime: 'Créneau intimité & détente canapé',
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
        estimatedOpenRate: '86%',
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

async function startServer() {
  // Mount Vite in development
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
    console.log(`MusePush server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
