import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { generateDynamicPushVariations } from './src/services/dynamicPushEngine';

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

    const systemPrompt = `Tu es une experte d'élite en copywriting et ghostwriting pour créatrices glamour & charme sur ${platform === 'onlyfans' ? 'OnlyFans' : 'MYM'}.
Ton rôle est de générer des MASS MESSAGES ultra-performants qui relancent immédiatement les discussions et l'intérêt des fans.

RÈGLES CAPITALES DE CONVERSATION & LOGISTIQUE MÉDIA :
1. LE MESSAGE EST DÉJÀ DANS LA MESSAGERIE PRIVÉE (DM) DU FAN :
   - INTERDICTION STRICTE de phrases ridicules et redondantes comme "viens me dire en DM", "réponds-moi en DM", "viens en DM", "shoot me a DM", "text me in DMs". Le fan est DÉJÀ dans son chat DM en train de lire le message ! Parler de "DM" sonne faux, amateur et cringe.
   - Parle directement comme un SMS intime ("dis-moi ce que t'en penses", "avoue", "t'en dis quoi ?", "j'attends ton avis", ou simplement l'affirmation seule sans demander la permission).

2. ULTRA-CONCIS (JUSQU'À 1 PHRASE SIMPLE) :
   - Fais court, percutant et brut. Pas de longs paragraphes ni de blabla de remplissage. Une seule phrase puissante suffit souvent à déclencher 10x plus de réponses.

3. DÉCLENCHEURS DE RÉPONSE SANS QUESTIONS BATEAUX :
   - Évite impérativement d'être toujours en mode question ("tu fais quoi ?", "tu dors ?", "t'as passé une bonne journée ?") qui sonne comme un robot télémarketing sans charme.
   - Privilégie les AFFIRMATIONS PIQUANTES, les CONFIDENCES INTIMES, les DÉFIS/TAQUINERIES sur l'ego du fan, les OPINIONS TRANCHÉES et les MICRO-ANECDOTES SPONTANÉES.
   - Les vraies femmes séduisantes affirment, confient et taquinent : c'est ce qui pousse le fan à répondre pour valider, contester, consoler ou complimenter !

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

6. VARIÉTÉ OBLIGATOIRE : GÉNÈRE STRICTEMENT 6 VARIATIONS DIFFÉRENTES (A/B Testing étendu).
${varietyLevel === 'high' ? `
7. CONTRAINTE IMPÉRATIVE DE NOUVEAUTÉ & CRÉATIVITÉ INÉDITE (OPTION VARIÉTÉ ÉLEVÉE ACTIVE) :
   - INTERDICTION FORMELLE DE RÉPÉTITIONS OU FORMULES VUES : Ne réutilise aucune tournure stéréotypée ou cliché d'accroche habituel.
   - NOUVEAUX ANGLES PSYCHOLOGIQUES : Chaque variation doit proposer un angle narratif, un rythme de phrase et un degré d'intimité radicalement distinct des 5 autres.
   - SPONTANÉITÉ & DÉTAILS INATTENDUS : Privilégie des micro-détails sensoriels originaux, des anecdotes spontanées, de la taquinerie complice et des tournures fraîches.` : (varietyLevel === 'low' ? `
7. STABILITÉ & SOBRIÉTÉ (VARIÉTÉ FAIBLE) :
   - Privilégie des formules éprouvées, sobres et prévisibles conformes au style habituel du modèle.` : `
7. VARIÉTÉ ÉQUILIBRÉE :
   - Assure un bon équilibre entre régularité du ton et fraîcheur des propositions.`)}`;

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
- Vibe / Circonstance : ${mood}
- Niveau d'audace / Hot level (1-5) : ${hotLevel}/5
- ${pushTypeDirective}
- ${lengthDirective}
- Média joint : ${mediaType} ${isPaidPush && priceSuggestion ? `(Prix suggéré PPV : ${priceSuggestion} €/$)` : (isPaidPush ? '' : '(Média offert / relance discussion)')}
- Contexte du média (ou sujet de discussion) : "${mediaContext || 'Moment intime spontané dans la chambre'}"
- Appel à l'action visé : ${isPaidPush ? callToAction : 'dm_talk (relancer la discussion en DM)'}
- Cible : ${targetAudience}
- Fuseau horaire ciblé : ${timeContext?.selectedTzZone || 'FR_CET'} (Heure locale fan : ${timeContext?.calculatedHour || 'Soirée'})
${trainingContext}
${rulesContext}

${langInstructions}

FORMAT ATTENDU :
Renvoie UNIQUEMENT un objet JSON valide avec STRICTEMENT 6 VARIATIONS (angles variés : 1. Confession/Aveu intime, 2. Taquinerie/Défi ego, 3. Micro-instant à la maison, 4. Opinion/Dilemme tranché, 5. Gaffe/Bêtise complice, 6. Secret exclusif/FOMO) :
{
  "recommendations": {
    "bestSendTimeFanTz": "ex: 21h45 - 23h15",
    "currentFanLocalTime": "ex: Soirée détente à la maison",
    "pricingTip": "${isPaidPush ? 'Conseil court sur le prix optimal du PPV' : 'Conseil d\'engagement : une affirmation forte génère 3x plus de réponses qu\'une question banale'}",
    "safetyAudit": "Note de conformité aux règles de la plateforme (termes validés)"
  },
  "variations": [
    {
      "id": "var-1",
      "angle": "direct",
      "angleLabel": "Confession & Aveu Intime (Affirmation)",
      "message": "Texte court...",
      "estimatedOpenRate": "84%",
      "suggestedPrice": "${isPaidPush ? (priceSuggestion ? priceSuggestion + (language === 'us' ? '$' : '€') : '15€') : 'Gratuit'}",
      "mediaNotice": "${isPaidPush ? 'PPV Verrouillé' : 'Offert / DM'}",
      "timeContextNote": "Ancrage confession sincère à domicile"
    },
    {
      "id": "var-2",
      "angle": "tease_playful",
      "angleLabel": "Taquinerie & Défi (Pique son ego)",
      "message": "Texte court...",
      "estimatedOpenRate": "88%",
      "suggestedPrice": "${isPaidPush ? (priceSuggestion ? priceSuggestion + (language === 'us' ? '$' : '€') : '12€') : 'Gratuit'}",
      "mediaNotice": "${isPaidPush ? 'PPV Verrouillé' : 'Offert / DM'}",
      "timeContextNote": "Pousse à réagir par fierté masculine"
    },
    {
      "id": "var-3",
      "angle": "intimate_gfe",
      "angleLabel": "Micro-Instant Maison (Storytelling réel)",
      "message": "Texte court...",
      "estimatedOpenRate": "92%",
      "suggestedPrice": "${isPaidPush ? (priceSuggestion ? priceSuggestion + (language === 'us' ? '$' : '€') : '18€') : 'Gratuit'}",
      "mediaNotice": "${isPaidPush ? 'PPV Verrouillé' : 'Offert / DM'}",
      "timeContextNote": "Scène de vie crédible chez elle"
    },
    {
      "id": "var-4",
      "angle": "direct",
      "angleLabel": "Opinion Tranchée (Générateur de débat)",
      "message": "Texte court...",
      "estimatedOpenRate": "86%",
      "suggestedPrice": "${isPaidPush ? (priceSuggestion ? priceSuggestion + (language === 'us' ? '$' : '€') : '15€') : 'Gratuit'}",
      "mediaNotice": "${isPaidPush ? 'PPV Verrouillé' : 'Offert / DM'}",
      "timeContextNote": "Force le fan à donner son point de vue"
    },
    {
      "id": "var-5",
      "angle": "mysterious",
      "angleLabel": "Gaffe / Petite Bêtise Complice",
      "message": "Texte court...",
      "estimatedOpenRate": "90%",
      "suggestedPrice": "${isPaidPush ? (priceSuggestion ? priceSuggestion + (language === 'us' ? '$' : '€') : '14€') : 'Gratuit'}",
      "mediaNotice": "${isPaidPush ? 'PPV Verrouillé' : 'Offert / DM'}",
      "timeContextNote": "Connexion authentique sans filtre"
    },
    {
      "id": "var-6",
      "angle": "mysterious",
      "angleLabel": "Secret Absolu (FOMO & Exclusivité)",
      "message": "Texte court...",
      "estimatedOpenRate": "94%",
      "suggestedPrice": "${isPaidPush ? (priceSuggestion ? priceSuggestion + (language === 'us' ? '$' : '€') : '20€') : 'Gratuit'}",
      "mediaNotice": "${isPaidPush ? 'PPV Verrouillé' : 'Offert / DM'}",
      "timeContextNote": "Sentiment privilégié de confidence privée"
    }
  ]
}`;

    let parsedResult: any = null;
    let source: 'openrouter' | 'fallback_engine' = 'fallback_engine';

    // 1. If OpenRouter API key is provided, call OpenRouter
    if (apiKey) {
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

        if (response.ok) {
          const data = await response.json();
          const content = data.choices?.[0]?.message?.content;
          if (content) {
            try {
              const cleaned = content.replace(/```json/gi, '').replace(/```/g, '').trim();
              parsedResult = JSON.parse(cleaned);
              source = 'openrouter';
            } catch (err) {
              console.warn('Could not parse OpenRouter response as strict JSON, falling back:', err);
            }
          }
        } else {
          const errText = await response.text();
          console.warn('OpenRouter API returned error:', response.status, errText);
        }
      } catch (orErr) {
        console.warn('OpenRouter connection error:', orErr);
      }
    }

    // 2. If OpenRouter wasn't used or failed, try Gemini if key exists
    if (!parsedResult && process.env.GEMINI_API_KEY) {
      try {
        const ai = getAiClient();
        const nonce = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        const noveltyNotice = varietyLevel === 'high'
          ? `[CONTRAINTE DE NOUVEAUTÉ STRICTE & MAXIMALE ACTIVE - TEMPÉRATURE ${geminiTemperature}]\nInterdiction formelle de répéter les formulations ou angles précédents. Diversité d'accroches maximale.`
          : `[CONSIGNE VARIÉTÉ : ${varietyLevel.toUpperCase()}]`;

        const geminiRes = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: `${systemPrompt}\n\n${userPrompt}\n\n[SEED FRAÎCHEUR #${nonce}]\n${noveltyNotice}\nCONSIGNE : Génère des variations variées et percutantes conformes au JSON attendu.`,
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
        sentenceCount
      });
      source = 'fallback_engine';
    }

    res.json({
      success: true,
      modelUsed: apiKey ? selectedModel : 'MusePush High-Conversion Engine',
      source,
      variations: parsedResult.variations || [],
      recommendations: parsedResult.recommendations || {
        bestSendTimeFanTz: '21h00 - 23h30',
        currentFanLocalTime: 'Heure de pointe',
        pricingTip: 'Maintiens entre 12€ et 20€ pour maximiser le taux de conversion immédiat.',
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
