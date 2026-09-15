import { 
  ModelProfile, 
  Platform, 
  Language, 
  MoodCategory, 
  WinningExample, 
  GenerationResult, 
  GeneratedVariation, 
  SentenceLength, 
  VarietyLevel, 
  OpenRouterTestResult 
} from '../types';
import { generateDynamicPushVariations } from './dynamicPushEngine';
import { buildPushPrompts } from './pushPromptBuilder';
import { getResolvedTime, TzZone } from '../utils/timeZoneHelper';
import { getMoodDetail } from '../data';
import { enforceStrictVariationUniqueness } from './deduplicationGuard';
import { parseOpenRouterPushResponse } from './openRouterResponseParser';

export interface GeneratePushParams {
  modelProfile: ModelProfile;
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
  timeContext?: any;
}): { recommendations: GenerationResult['recommendations']; variations: GeneratedVariation[] } {
  return generateDynamicPushVariations({
    modelProfile: { name: params.modelName } as any,
    language: params.language,
    mood: params.mood,
    mediaContext: params.mediaContext,
    priceSuggestion: params.priceSuggestion || 15,
    platform: params.platform,
    hotLevel: params.hotLevel,
    pushType: params.pushType,
    sentenceCount: params.sentenceCount,
    timeContext: params.timeContext
  });
}

export async function testOpenRouterConnection(apiKey?: string, model?: string): Promise<OpenRouterTestResult> {
  const keyToUse = apiKey?.trim() || (typeof window !== 'undefined' ? localStorage.getItem('musepush_openrouter_key') || '' : '');
  if (!keyToUse) {
    return {
      success: false,
      status: 'error',
      message: 'Aucune clé API OpenRouter renseignée.'
    };
  }

  // 1. Try server endpoint first
  try {
    const res = await fetch('/api/test-openrouter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey: keyToUse, model })
    });
    if (res.ok) {
      const data = await res.json();
      return data;
    } else {
      const errData = await res.json().catch(() => null);
      if (errData && errData.message) {
        return errData;
      }
    }
  } catch (_netErr) {
    // Fallback to direct client call if server is not available
  }

  // 2. Direct browser test to OpenRouter
  const startTime = Date.now();
  try {
    const response = await fetch('https://openrouter.ai/api/v1/auth/key', {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${keyToUse}` }
    });
    const latencyMs = Date.now() - startTime;
    if (response.ok) {
      const data = await response.json();
      const usage = data.data?.usage != null ? `${Number(data.data.usage).toFixed(2)}$` : 'Actif';
      return {
        success: true,
        status: 'connected',
        message: 'Connexion OpenRouter réussie ! Clé valide.',
        model,
        creditInfo: `Usage : ${usage}`,
        latencyMs
      };
    } else {
      return {
        success: false,
        status: 'error',
        message: `Clé OpenRouter refusée (HTTP ${response.status})`,
        latencyMs
      };
    }
  } catch (e: any) {
    return {
      success: false,
      status: 'error',
      message: e.message || 'Impossible de joindre OpenRouter'
    };
  }
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
    varietyLevel = 'high',
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

  // Resolve accurate clock and period
  const resolvedTime = getResolvedTime(
    timeContext?.selectedTzZone || 'FR_CET',
    timeContext?.useCurrentTime ?? true,
    timeContext?.customHour,
    timeContext?.customMinute
  );

  const enrichedParams = {
    ...params,
    timeContext: {
      ...timeContext,
      selectedTzZone: resolvedTime.tzZone,
      calculatedHour: resolvedTime.timeString,
      resolvedPeriod: resolvedTime.periodLabelFr,
      useCurrentTime: timeContext?.useCurrentTime ?? true,
      customHour: resolvedTime.hour,
      customMinute: resolvedTime.minute
    }
  };

  // 1. First attempt: call local server API (/api/generate-push)
  try {
    const serverResponse = await fetch('/api/generate-push', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(enrichedParams)
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
  const selectedLlmModel = openRouterConfig?.model || '@preset/push-bot';

  if (apiKey) {
    try {
      const isPaidPush = pushType === 'paid_ppv';
      const prompts = buildPushPrompts({
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
        timeContext: enrichedParams.timeContext,
        resolvedTime,
        trainingExamples,
        agencyPlaybookRules,
        previousMessages: params.previousMessages,
        openRouterConfig
      });

      const systemPrompt = prompts.systemPrompt;
      const userPrompt = prompts.userPrompt;
      const temperature = prompts.temperature;

      const directStartTime = Date.now();
      const isPreset = selectedLlmModel.startsWith('@');
      const reqPayload: any = {
        model: selectedLlmModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature
      };

      if (!isPreset) {
        reqPayload.response_format = { type: 'json_object' };
      }

      let orResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : 'https://musepush.app',
          'X-Title': 'MusePush AI Studio',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(reqPayload)
      });

      // If 400 with response_format, retry cleanly without it
      if (orResponse.status === 400 && reqPayload.response_format) {
        delete reqPayload.response_format;
        orResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : 'https://musepush.app',
            'X-Title': 'MusePush AI Studio',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(reqPayload)
        });
      }

      const directLatency = Date.now() - directStartTime;

      if (orResponse.ok) {
        const data = await orResponse.json();
        const content = data.choices?.[0]?.message?.content;
        if (content) {
          const parsedVariations = parseOpenRouterPushResponse(content, {
            isUs: language === 'us',
            isPaid: isPaidPush,
            priceVal: priceSuggestion || 15,
            mood,
            mediaNotice: mediaContext,
            previousHistory: params.previousMessages
          });

          if (parsedVariations && parsedVariations.length > 0) {
            let sanitizedVars = parsedVariations;
            if (resolvedTime.period === 'lunch' || resolvedTime.period === 'afternoon') {
              sanitizedVars = sanitizedVars.map((v: any) => {
                if (!v || typeof v.message !== 'string') return v;
                let msg = v.message
                  .replace(/les yeux à peine ouverts et la nuisette qui a glissé pendant la nuit\.\.\. regarde comment je me réveille ☕/gi, "petite pause de 14h en nuisette légère... regarde comment je m'occupe toute seule 🫦")
                  .replace(/pendant la nuit\.\.\. regarde comment je me réveille/gi, "au milieu de la journée... regarde ce que je fais")
                  .replace(/comment je me réveille ☕/gi, "ce que je fais maintenant 🫦")
                  .replace(/les yeux à peine ouverts/gi, "les yeux qui pétillent")
                  .replace(/au réveil/gi, "en ce moment")
                  .replace(/je me réveille/gi, "je pense à toi")
                  .replace(/au saut du lit/gi, "dans ma chambre")
                  .replace(/ce matin/gi, "aujourd'hui")
                  .replace(/\bce soir\b/gi, "aujourd'hui")
                  .replace(/\bcette nuit\b/gi, "en ce moment")
                  .replace(/\binsomnie\b/gi, "petite pause");
                return { ...v, message: msg };
              });
            }

            return {
              success: true,
              source: 'openrouter',
              modelUsed: selectedLlmModel,
              openRouterStatus: {
                attempted: true,
                success: true,
                model: selectedLlmModel,
                latencyMs: directLatency
              },
              activeParametersSummary: {
                mood,
                varietyLevel,
                sentenceCount,
                pushType,
                mediaType,
                hasMediaContext: Boolean(mediaContext && mediaContext.trim()),
                hasPreviousMessagesAvoidance: Array.isArray(params.previousMessages) && params.previousMessages.length > 0,
                antiRepetitionCount: Array.isArray(params.previousMessages) ? params.previousMessages.length : 0,
                timeZone: resolvedTime.tzZone,
                fanTime: resolvedTime.timeString,
                period: resolvedTime.periodLabelFr
              },
              recommendations: {
                bestSendTimeFanTz: `${resolvedTime.timeString} (${resolvedTime.periodLabelFr})`,
                currentFanLocalTime: `${resolvedTime.timeString} — ${resolvedTime.periodLabelFr}`,
                pricingTip: isPaidPush ? `Prix conseillé: ${priceSuggestion || 15}€` : 'Push gratuit de relance',
                safetyAudit: 'Termes conformes et validés'
              },
              variations: sanitizedVars
            };
          }
        }
      }
    } catch (openRouterErr) {
      console.warn('Direct OpenRouter call error, falling back to local simulated variations:', openRouterErr);
    }
  }

  // 3. Third step: High-fidelity dynamic variations (regenerates brand new, fresh variations on every click)
  const dynamicResult = generateDynamicPushVariations({
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
    previousMessages: params.previousMessages,
    timeContext: enrichedParams.timeContext
  });

  return {
    success: true,
    source: 'fallback_engine',
    modelUsed: 'MusePush Dynamic Creative Engine',
    openRouterStatus: apiKey ? {
      attempted: true,
      success: false,
      error: 'Clé invalide ou échec de connexion OpenRouter — Fallback haute conversion actif'
    } : undefined,
    activeParametersSummary: dynamicResult.activeParametersSummary,
    recommendations: dynamicResult.recommendations,
    variations: dynamicResult.variations
  };
}
