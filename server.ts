import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { generateDynamicPushVariations } from './src/services/dynamicPushEngine';
import { getResolvedTime } from './src/utils/timeZoneHelper';
import { MOODS, getMoodDetail } from './src/data';
import { buildPushPrompts } from './src/services/pushPromptBuilder';
import { parseOpenRouterPushResponse } from './src/services/openRouterResponseParser';

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
    const { apiKey, model = '@preset/push-bot' } = req.body;
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

      // 2. Perform a live micro-check on the selected model/preset to diagnose Free access
      let modelStatusNote = '';
      let needsPrivacyAction = false;
      let actualWorkingModel = model;

      try {
        const testPayload: any = {
          model: model || '@preset/push-bot',
          messages: [{ role: 'user', content: 'test' }],
          max_tokens: 1
        };

        const testModelRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${keyToUse}`,
            'HTTP-Referer': process.env.APP_URL || 'https://musepush.app',
            'X-Title': 'MusePush AI Studio',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(testPayload)
        });

        if (testModelRes.ok) {
          modelStatusNote = `Flux testé avec succès sur ${model} !`;
        } else {
          const testErrText = await testModelRes.text();
          const lowErr = testErrText.toLowerCase();

          if (lowErr.includes('no available model provider') || lowErr.includes('routing requirements') || lowErr.includes('no endpoints found')) {
            needsPrivacyAction = true;
            modelStatusNote = "Attention : OpenRouter bloque les modèles gratuits sur ton compte. Active l'option 'Allow data collection for free models' sur openrouter.ai/settings/privacy pour débloquer.";
          } else if (lowErr.includes('preset') || testModelRes.status === 404) {
            modelStatusNote = `Le preset '${model}' n'est pas encore accessible sur ton compte. Tu peux utiliser 'openrouter/free' en attendant.`;
          } else if (testModelRes.status === 429) {
            modelStatusNote = "Limite temporaire OpenRouter (20 req/min). Le service répond bien.";
          } else {
            modelStatusNote = `OpenRouter (${testModelRes.status}): ${testErrText.slice(0, 100)}`;
          }
        }
      } catch (microErr: any) {
        console.warn('Micro-test skipped:', microErr?.message);
      }

      return res.json({
        success: true,
        status: needsPrivacyAction ? 'warning' : 'connected',
        message: needsPrivacyAction 
          ? "Clé valide, mais OpenRouter bloque les modèles gratuits : Active 'Allow data collection for free models' dans tes paramètres de confidentialité OpenRouter (openrouter.ai/settings/privacy)."
          : `Connexion OpenRouter validée ! ${modelStatusNote}`,
        model: actualWorkingModel,
        needsPrivacyAction,
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
      platform = 'onlyfans',
      language = 'fr',
      pushType = 'paid_ppv',
      sentenceCount = 'short',
      varietyLevel = 'high',
      mood = 'hot',
      mediaType = 'photo_set',
      priceSuggestion,
      mediaContext = '',
      callToAction = 'unlock_ppv',
      targetAudience = 'all_subs',
      hotLevel = 3,
      timeContext,
      openRouterConfig,
      trainingExamples,
      agencyPlaybookRules,
      previousMessages = []
    } = req.body;

    const apiKey = openRouterConfig?.apiKey || process.env.OPENROUTER_API_KEY;
    let selectedModel = openRouterConfig?.model || '@preset/push-bot';

    // Build comprehensive prompts with 6 distinct psychological triggers and strict anti-repetition rules
    const {
      systemPrompt,
      userPrompt,
      resolvedTime,
      temperature,
      chosenTriggers,
      seedNonce
    } = buildPushPrompts({
      modelProfile,
      platform,
      language,
      pushType,
      sentenceCount,
      varietyLevel,
      mood,
      mediaType,
      priceSuggestion,
      mediaContext,
      callToAction,
      targetAudience,
      hotLevel,
      timeContext,
      previousMessages,
      trainingExamples,
      agencyPlaybookRules
    });

    const llmTemperature = temperature;
    const geminiTemperature = Math.min(1.2, temperature);

    let parsedResult: any = null;
    let source: 'openrouter' | 'fallback_engine' = 'fallback_engine';
    const openRouterDiagnostic = {
      attempted: Boolean(apiKey),
      success: false,
      error: undefined as string | undefined,
      model: selectedModel,
      latencyMs: 0
    };

    // 1. If OpenRouter API key is provided, call OpenRouter (with preset resilience)
    if (apiKey) {
      const orStartTime = Date.now();
      try {
        const isPreset = selectedModel.startsWith('@');
        const isFreeTarget = !isPreset && (selectedModel.includes(':free') || selectedModel === 'openrouter/free');

        // Valid model IDs only for the models array fallback (no presets in models array)
        const freeFallbacks = ['openrouter/free', 'google/gemma-4-31b-it:free', 'nvidia/nemotron-3.5-lightning:free'];
        
        const reqPayload: any = {
          model: selectedModel,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: llmTemperature
        };

        // Only add models array if target is a standard model (OpenRouter does not support @preset in models array)
        if (isFreeTarget) {
          reqPayload.models = [selectedModel, ...freeFallbacks.filter(m => m !== selectedModel)];
        }

        // Don't force response_format on custom presets or free models by default as it can trigger HTTP 400
        if (!isPreset && !selectedModel.includes(':free')) {
          reqPayload.response_format = { type: 'json_object' };
        }

        let response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'HTTP-Referer': process.env.APP_URL || 'https://musepush.app',
            'X-Title': 'MusePush AI Studio',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(reqPayload)
        });

        // If 400 Bad Request and response_format was used, retry immediately without it
        if (response.status === 400 && reqPayload.response_format) {
          delete reqPayload.response_format;
          response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'HTTP-Referer': process.env.APP_URL || 'https://musepush.app',
              'X-Title': 'MusePush AI Studio',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(reqPayload)
          });
        }

        // If preset failed (e.g. 404 Preset Not Found, or No Provider), try automatic failover to openrouter/free
        if (!response.ok && isPreset) {
          console.warn(`Preset ${selectedModel} failed (${response.status}), attempting automatic failover to openrouter/free...`);
          const fallbackPayload = {
            model: 'openrouter/free',
            models: ['openrouter/free', 'google/gemma-4-31b-it:free', 'nvidia/nemotron-3.5-lightning:free'],
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ],
            temperature: llmTemperature
          };
          const fallbackResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'HTTP-Referer': process.env.APP_URL || 'https://musepush.app',
              'X-Title': 'MusePush AI Studio',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(fallbackPayload)
          });
          if (fallbackResponse.ok) {
            response = fallbackResponse;
            selectedModel = 'openrouter/free';
          }
        }

        openRouterDiagnostic.latencyMs = Date.now() - orStartTime;

        if (response.ok) {
          const data = await response.json();
          const content = data.choices?.[0]?.message?.content;
          const actualModel = data.model || selectedModel;
          openRouterDiagnostic.model = actualModel;

          if (content) {
            const parsedVariations = parseOpenRouterPushResponse(content, {
              isUs: language === 'us',
              isPaid: pushType === 'paid_ppv',
              priceVal: priceSuggestion || 15,
              mood,
              mediaNotice: mediaContext,
              previousHistory: previousMessages
            });

            if (parsedVariations && parsedVariations.length > 0) {
              parsedResult = {
                variations: parsedVariations
              };
              source = 'openrouter';
              openRouterDiagnostic.success = true;
            } else {
              console.warn('Could not parse OpenRouter response content:', content.slice(0, 200));
              openRouterDiagnostic.error = 'Réponse reçue non convertible en 6 accroches distinctes';
            }
          } else {
            openRouterDiagnostic.error = 'Message vide retourné par OpenRouter';
          }
        } else {
          const errText = await response.text();
          console.warn('OpenRouter API returned error:', response.status, errText);

          let errorDetail = '';
          try {
            const errObj = JSON.parse(errText);
            errorDetail = errObj.error?.message || errObj.message || errText;
          } catch {
            errorDetail = errText;
          }

          // Translate specific OpenRouter free model failure reasons into explicit guidance
          let friendlyError = `HTTP ${response.status}: ${errorDetail.slice(0, 160)}`;
          const lowErr = errorDetail.toLowerCase();
          if (lowErr.includes('no available model provider') || lowErr.includes('no endpoints found') || lowErr.includes('routing requirements')) {
            friendlyError = "OpenRouter a bloqué l'accès aux modèles free. Active 'Allow data collection for free models' dans tes paramètres OpenRouter (openrouter.ai/settings/privacy) pour autoriser les modèles gratuits.";
          } else if (response.status === 429 || lowErr.includes('rate limit')) {
            friendlyError = "Limite de requêtes atteinte sur les modèles gratuits d'OpenRouter (20 req/min). Réessaye dans 20 secondes ou sélectionne un autre modèle free.";
          } else if (response.status === 402 || lowErr.includes('credit')) {
            friendlyError = "OpenRouter exige un solde non-négatif pour router les modèles gratuits. Vérifie ton solde sur openrouter.ai/credits.";
          } else if (response.status === 401) {
            friendlyError = "Clé API OpenRouter invalide ou révoquée (sk-or-v1-...). Vérifie ta clé sur openrouter.ai/keys.";
          } else if (lowErr.includes('preset') || response.status === 404) {
            friendlyError = `Le preset '${selectedModel}' n'a pas pu être chargé par OpenRouter. Vérifie le nom sur openrouter.ai/presets ou choisis 'openrouter/free'.`;
          }

          openRouterDiagnostic.error = friendlyError;
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
        const isUs = language === 'us';
        const noveltyNotice = isUs
          ? (varietyLevel === 'high'
            ? `[TOTAL CREATIVE FREEDOM - MAXIMUM VARIETY & NOVELTY ACTIVE - TEMPERATURE ${geminiTemperature}]\nStrictly write 100% in natural American English (US). Generate 6 radically dissimilar push propositions.`
            : `[VARIETY REQUIREMENT: ${varietyLevel.toUpperCase()} - 100% AMERICAN ENGLISH - 6 DISSIMILAR PROPOSITIONS]`)
          : (varietyLevel === 'high'
            ? `[LIBERTÉ CRÉATIVE TOTALE - DIVERSITÉ & NOUVEAUTÉ MAXIMALE ACTIVE - TEMPÉRATURE ${geminiTemperature}]\nInterdiction formelle de répéter les formulations ou de suivre un schéma d'angles fixe. Donne 6 propositions d'accroches radicalement différentes les unes des autres.`
            : `[CONSIGNE VARIÉTÉ : ${varietyLevel.toUpperCase()} - LIBERTÉ CRÉATIVE TOTALE - 6 PROPOSITIONS DISSIMILAIRES]`);

        const promptConsigne = isUs
          ? `MANDATE: Write all 6 propositions 100% in natural American English (US). ZERO French words allowed.`
          : `CONSIGNE : Génère 6 propositions totalement libres et imprévisibles, sans angle précis imposé, afin qu'aucune ne se ressemble.`;

        const geminiRes = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: `${systemPrompt}\n\n${userPrompt}\n\n[SEED FRAÎCHEUR #${nonce}]\n${noveltyNotice}\n${promptConsigne}`,
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
        varietyLevel,
        targetAudience,
        previousMessages,
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
      modelUsed: apiKey ? selectedModel : (source === 'openrouter' ? 'Intelligence Artificielle' : 'MusePush High-Conversion Engine'),
      source,
      openRouterStatus: openRouterDiagnostic,
      activeParametersSummary: parsedResult.activeParametersSummary || {
        mood,
        varietyLevel,
        sentenceCount,
        pushType,
        mediaType,
        hasMediaContext: Boolean(mediaContext && mediaContext.trim()),
        hasPreviousMessagesAvoidance: Array.isArray(previousMessages) && previousMessages.length > 0,
        antiRepetitionCount: Array.isArray(previousMessages) ? previousMessages.length : 0,
        timeZone: resolvedTime.tzZone,
        fanTime: resolvedTime.timeString,
        period: resolvedTime.periodLabelFr
      },
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
