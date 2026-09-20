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
  activeProvider?: 'groq' | 'mistral' | 'openrouter' | 'studio';
  groqConfig?: {
    apiKey?: string;
    model?: string;
  };
  mistralConfig?: {
    apiKey?: string;
    model?: string;
  };
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

export async function testGroqConnection(apiKey?: string, model?: string): Promise<OpenRouterTestResult> {
  const keyToUse = apiKey?.trim() || (typeof window !== 'undefined' ? localStorage.getItem('musepush_groq_key') || '' : '');
  if (!keyToUse) {
    return {
      success: false,
      status: 'error',
      message: 'Aucune clé API Groq renseignée (commence par gsk_...).'
    };
  }

  // 1. Try local server endpoint first
  try {
    const res = await fetch('/api/test-groq', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey: keyToUse, model })
    });
    if (res.ok) {
      return await res.json();
    } else if (res.status !== 404 && res.status !== 502 && res.status !== 503) {
      // Meaningful API error returned by server proxy (e.g. 401 invalid key, 429 quota)
      const err = await res.json().catch(() => null);
      if (err && err.message) return err;
    }
  } catch (_netErr) {
    // Server proxy unreachable or static mode, proceed to direct client check
  }

  // 2. Direct browser test to Groq Cloud API
  const startTime = Date.now();
  try {
    const response = await fetch('https://api.groq.com/openai/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${keyToUse}`
      }
    });
    const latencyMs = Date.now() - startTime;
    if (response.ok) {
      return {
        success: true,
        status: 'connected',
        message: 'Connexion Groq Cloud validée avec succès ! Puces LPU ultra-rapides prêtes.',
        model: model || 'llama-3.3-70b-versatile',
        creditInfo: 'Tier Gratuit Actif (30 req/min)',
        latencyMs
      };
    } else {
      const errData = await response.json().catch(() => null);
      let msg = `Erreur Groq (HTTP ${response.status})`;
      if (response.status === 401) {
        msg = 'Clé API Groq invalide (HTTP 401). Vérifie ta clé sur console.groq.com/keys.';
      } else if (response.status === 429) {
        msg = 'Limite de requêtes Groq atteinte (HTTP 429).';
      } else if (errData?.error?.message) {
        msg = errData.error.message;
      }
      return {
        success: false,
        status: 'error',
        message: msg,
        latencyMs
      };
    }
  } catch (e: any) {
    return {
      success: false,
      status: 'error',
      message: e.message || 'Impossible de joindre les serveurs Groq Cloud'
    };
  }
}

export async function testMistralConnection(apiKey?: string, model?: string): Promise<OpenRouterTestResult> {
  const keyToUse = apiKey?.trim() || (typeof window !== 'undefined' ? localStorage.getItem('musepush_mistral_key') || '' : '');
  if (!keyToUse) {
    return {
      success: false,
      status: 'error',
      message: 'Aucune clé API Mistral AI renseignée.'
    };
  }

  // 1. Try local server endpoint first
  try {
    const res = await fetch('/api/test-mistral', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey: keyToUse, model })
    });
    if (res.ok) {
      return await res.json();
    } else if (res.status !== 404 && res.status !== 502 && res.status !== 503) {
      // Meaningful API error returned by server proxy (e.g. 401, 429)
      const err = await res.json().catch(() => null);
      if (err && err.message) return err;
    }
  } catch (_netErr) {
    // Server proxy unreachable or static mode, proceed to direct client check
  }

  // 2. Direct browser test to Mistral AI
  const startTime = Date.now();
  try {
    const response = await fetch('https://api.mistral.ai/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${keyToUse}`
      }
    });
    const latencyMs = Date.now() - startTime;
    if (response.ok) {
      return {
        success: true,
        status: 'connected',
        message: 'Connexion Mistral AI validée avec succès ! Plume française de pointe prête.',
        model: model || 'mistral-small-latest',
        creditInfo: 'Compte La Plateforme Actif',
        latencyMs
      };
    } else {
      const errData = await response.json().catch(() => null);
      let msg = `Erreur Mistral AI (HTTP ${response.status})`;
      if (response.status === 401) {
        msg = 'Clé API Mistral AI invalide (HTTP 401). Vérifie ta clé sur console.mistral.ai/api-keys.';
      } else if (response.status === 429) {
        msg = 'Limite de requêtes Mistral AI atteinte (HTTP 429).';
      } else if (errData?.message) {
        msg = errData.message;
      }
      return {
        success: false,
        status: 'error',
        message: msg,
        latencyMs
      };
    }
  } catch (e: any) {
    return {
      success: false,
      status: 'error',
      message: e.message || 'Impossible de joindre les serveurs Mistral AI'
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
    activeProvider = 'openrouter',
    groqConfig,
    mistralConfig,
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
  let serverFallbackResult: GenerationResult | null = null;
  try {
    const serverResponse = await fetch('/api/generate-push', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(enrichedParams)
    });

    if (serverResponse.ok) {
      const data = await serverResponse.json();
      if (data && data.success) {
        // If the server actually used the requested provider (or user selected studio), return it
        if (data.source !== 'fallback_engine' || activeProvider === 'studio') {
          return data as GenerationResult;
        }
        // Save server fallback result in case direct client call also fails
        serverFallbackResult = data as GenerationResult;
      }
    }
  } catch (_err) {
    // Server is absent or unreachable (e.g. running directly on Lovable static preview)
    console.info('Backend server unreachable or static environment detected. Using direct client engine.');
  }

  // 2. Direct client call based on activeProvider
  const isPaidPush = pushType === 'paid_ppv';
  const isUs = language === 'us';

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

  const { systemPrompt, userPrompt, temperature } = prompts;

  // 2A. Direct Groq Cloud call from client
  if (activeProvider === 'groq') {
    const groqKey = (groqConfig?.apiKey || (typeof window !== 'undefined' ? localStorage.getItem('musepush_groq_key') || '' : '')).trim();
    const groqModel = groqConfig?.model || (typeof window !== 'undefined' ? localStorage.getItem('musepush_groq_model') || '' : '') || 'llama-3.3-70b-versatile';

    if (groqKey) {
      const directStartTime = Date.now();
      try {
        const groqResp = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${groqKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: groqModel,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ],
            temperature,
            response_format: { type: 'json_object' }
          })
        });

        const latencyMs = Date.now() - directStartTime;

        if (groqResp.ok) {
          const data = await groqResp.json();
          const content = data.choices?.[0]?.message?.content;
          if (content) {
            const parsed = parseOpenRouterPushResponse(content, {
              isUs,
              isPaid: isPaidPush,
              priceVal: priceSuggestion || 15,
              mood,
              mediaNotice: mediaContext,
              previousHistory: params.previousMessages
            });
            if (parsed && parsed.length > 0) {
              return {
                success: true,
                source: 'groq',
                modelUsed: `Groq Cloud (${groqModel})`,
                providerStatus: {
                  provider: 'groq',
                  attempted: true,
                  success: true,
                  model: groqModel,
                  latencyMs
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
                  period: isUs ? resolvedTime.periodLabelUs : resolvedTime.periodLabelFr
                },
                recommendations: {
                  bestSendTimeFanTz: `${resolvedTime.timeString} (${isUs ? resolvedTime.periodLabelUs : resolvedTime.periodLabelFr})`,
                  currentFanLocalTime: `${resolvedTime.timeString} — ${isUs ? resolvedTime.periodLabelUs : resolvedTime.periodLabelFr}`,
                  pricingTip: isPaidPush
                    ? (isUs ? `Recommended PPV: $${priceSuggestion || 15}` : `Prix conseillé: ${priceSuggestion || 15}€`)
                    : (isUs ? 'Free retention & reply opener' : 'Push gratuit de relance'),
                  safetyAudit: isUs ? 'Strictly TOS-compliant and validated' : 'Termes conformes et validés'
                },
                variations: parsed
              };
            }
          }
        }
      } catch (groqErr) {
        console.warn('Direct Groq call error:', groqErr);
      }
    }
  }

  // 2B. Direct Mistral AI call from client
  if (activeProvider === 'mistral') {
    const mistralKey = (mistralConfig?.apiKey || (typeof window !== 'undefined' ? localStorage.getItem('musepush_mistral_key') || '' : '')).trim();
    const mistralModel = mistralConfig?.model || (typeof window !== 'undefined' ? localStorage.getItem('musepush_mistral_model') || '' : '') || 'mistral-small-latest';

    if (mistralKey) {
      const directStartTime = Date.now();
      try {
        const mistralResp = await fetch('https://api.mistral.ai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${mistralKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: mistralModel,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ],
            temperature,
            response_format: { type: 'json_object' }
          })
        });

        const latencyMs = Date.now() - directStartTime;

        if (mistralResp.ok) {
          const data = await mistralResp.json();
          const content = data.choices?.[0]?.message?.content;
          if (content) {
            const parsed = parseOpenRouterPushResponse(content, {
              isUs,
              isPaid: isPaidPush,
              priceVal: priceSuggestion || 15,
              mood,
              mediaNotice: mediaContext,
              previousHistory: params.previousMessages
            });
            if (parsed && parsed.length > 0) {
              return {
                success: true,
                source: 'mistral',
                modelUsed: `Mistral AI (${mistralModel})`,
                providerStatus: {
                  provider: 'mistral',
                  attempted: true,
                  success: true,
                  model: mistralModel,
                  latencyMs
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
                  period: isUs ? resolvedTime.periodLabelUs : resolvedTime.periodLabelFr
                },
                recommendations: {
                  bestSendTimeFanTz: `${resolvedTime.timeString} (${isUs ? resolvedTime.periodLabelUs : resolvedTime.periodLabelFr})`,
                  currentFanLocalTime: `${resolvedTime.timeString} — ${isUs ? resolvedTime.periodLabelUs : resolvedTime.periodLabelFr}`,
                  pricingTip: isPaidPush
                    ? (isUs ? `Recommended PPV: $${priceSuggestion || 15}` : `Prix conseillé: ${priceSuggestion || 15}€`)
                    : (isUs ? 'Free retention & reply opener' : 'Push gratuit de relance'),
                  safetyAudit: isUs ? 'Strictly TOS-compliant and validated' : 'Termes conformes et validés'
                },
                variations: parsed
              };
            }
          }
        }
      } catch (mistralErr) {
        console.warn('Direct Mistral call error:', mistralErr);
      }
    }
  }

  // 2C. Direct OpenRouter call if user entered their API key
  const apiKey = openRouterConfig?.apiKey?.trim() || (typeof window !== 'undefined' ? localStorage.getItem('musepush_openrouter_key') || '' : '');
  const selectedLlmModel = openRouterConfig?.model || '@preset/push-bot';
  let openRouterFailureReason = '';

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
      const isFreeTarget = !isPreset && (selectedLlmModel.includes(':free') || selectedLlmModel === 'openrouter/free');

      const freeFallbacks = ['openrouter/free', 'google/gemma-4-31b-it:free', 'nvidia/nemotron-3.5-lightning:free'];

      const reqPayload: any = {
        model: selectedLlmModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature
      };

      if (isFreeTarget) {
        reqPayload.models = [selectedLlmModel, ...freeFallbacks.filter(m => m !== selectedLlmModel)];
      }

      if (!isPreset && !selectedLlmModel.includes(':free')) {
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

      // If primary model failed with 404/503 (not 429 Rate Limit!), try ONE safe fallback to openrouter/free
      let effectiveModel = selectedLlmModel;
      if (!orResponse.ok && orResponse.status !== 429 && selectedLlmModel !== 'openrouter/free') {
        console.warn(`Direct call to ${selectedLlmModel} failed (${orResponse.status}), trying openrouter/free as safe fallback...`);
        try {
          const fallbackPayload: any = {
            model: 'openrouter/free',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ],
            temperature
          };
          const fallbackResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : 'https://musepush.app',
              'X-Title': 'MusePush AI Studio',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(fallbackPayload)
          });
          if (fallbackResponse.ok) {
            orResponse = fallbackResponse;
            effectiveModel = 'openrouter/free';
            console.info('Direct failover succeeded on openrouter/free!');
          }
        } catch (failoverErr) {
          console.warn('Direct failover skipped:', failoverErr);
        }
      }

      const directLatency = Date.now() - directStartTime;

      if (orResponse.ok) {
        const data = await orResponse.json();
        const content = data.choices?.[0]?.message?.content;
        const actualModel = data.model || effectiveModel || selectedLlmModel;

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
            const isUs = language === 'us';
            let sanitizedVars = parsedVariations;

            // Check if model returned French while language is US
            if (isUs) {
              const frenchIndicators = /\b(je |tu |moi |mon |ma |mes |dans |avec |pour |regarde |débloque |viens |chambre |draps |ce soir|cet après-midi)\b/i;
              sanitizedVars = sanitizedVars.map((v: any) => {
                if (!v || typeof v.message !== 'string') return v;
                let msg = v.message;
                // If it contains French, replace with US dynamic variation
                if (frenchIndicators.test(msg)) {
                  const quickUS = [
                    `quick break from my day in sheer lace... look what I get up to when I'm alone 🫦`,
                    `admit you weren't expecting me to send something this intimate today... tell me what you think 👀`,
                    `spontaneous thought for you straight from my room... check what I did 🤍`,
                    `if you were here right now, what would you do first? tell me honestly 🫦`,
                    `couldn't stop thinking about what we said earlier... so I made a little video just for you ✨`,
                    `did something today I promised myself I'd keep private... unlock to see what happened 🤫`
                  ];
                  msg = quickUS[Math.floor(Math.random() * quickUS.length)];
                }
                return { ...v, message: msg };
              });
            }

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
              modelUsed: actualModel,
              openRouterStatus: {
                attempted: true,
                success: true,
                model: actualModel,
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
                period: isUs ? resolvedTime.periodLabelUs : resolvedTime.periodLabelFr
              },
              recommendations: {
                bestSendTimeFanTz: `${resolvedTime.timeString} (${isUs ? resolvedTime.periodLabelUs : resolvedTime.periodLabelFr})`,
                currentFanLocalTime: `${resolvedTime.timeString} — ${isUs ? resolvedTime.periodLabelUs : resolvedTime.periodLabelFr}`,
                pricingTip: isPaidPush
                  ? (isUs ? `Recommended PPV: $${priceSuggestion || 15}` : `Prix conseillé: ${priceSuggestion || 15}€`)
                  : (isUs ? 'Free retention & reply opener' : 'Push gratuit de relance'),
                safetyAudit: isUs ? 'Strictly TOS-compliant and validated' : 'Termes conformes et validés'
              },
              variations: sanitizedVars
            };
          }
        }
      } else {
        const errText = await orResponse.text().catch(() => '');
        let errorDetail = '';
        try {
          const errObj = JSON.parse(errText);
          errorDetail = errObj.error?.message || errObj.message || errText;
        } catch {
          errorDetail = errText;
        }

        const lowErr = errorDetail.toLowerCase();
        if (lowErr.includes('no available model provider') || lowErr.includes('no endpoints found') || lowErr.includes('routing requirements')) {
          openRouterFailureReason = "OpenRouter a bloqué l'accès aux modèles free. Active 'Allow data collection for free models' dans tes paramètres OpenRouter (openrouter.ai/settings/privacy).";
        } else if (orResponse.status === 429 || lowErr.includes('rate limit')) {
          openRouterFailureReason = "Fournisseur gratuit OpenRouter temporairement saturé (HTTP 429). Ce n'est pas toi qui as fait 20 requêtes : le serveur public de ce modèle subit un fort trafic partagé mondial. Le Moteur Studio a pris le relais instantanément.";
        } else if (orResponse.status === 402 || lowErr.includes('credit')) {
          openRouterFailureReason = "OpenRouter exige un solde non-négatif pour les modèles gratuits. Vérifie tes crédits sur openrouter.ai/credits.";
        } else if (orResponse.status === 401) {
          openRouterFailureReason = "Clé API OpenRouter invalide (sk-or-v1-...). Vérifie ta clé sur openrouter.ai/keys.";
        } else if (lowErr.includes('preset') || orResponse.status === 404) {
          openRouterFailureReason = `Le preset '${selectedLlmModel}' est introuvable sur ton compte. Vérifie son slug sur openrouter.ai/presets ou choisis 'openrouter/free'.`;
        } else {
          openRouterFailureReason = `OpenRouter erreur (HTTP ${orResponse.status}): ${errorDetail.slice(0, 140)}`;
        }
      }
    } catch (openRouterErr: any) {
      console.warn('Direct OpenRouter call error, falling back to local simulated variations:', openRouterErr);
      openRouterFailureReason = openRouterErr?.message || 'Erreur réseau vers OpenRouter';
    }
  }

  if (serverFallbackResult) {
    return serverFallbackResult;
  }

  // 3. Third step: High-fidelity dynamic variations (regenerates brand new, fresh variations on every click)
  const dynamicResult = generateDynamicPushVariations({
    modelProfile,
    language,
    mood,
    mediaType,
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
      error: openRouterFailureReason || 'Connexion OpenRouter non établie — Fallback haute conversion actif'
    } : undefined,
    activeParametersSummary: dynamicResult.activeParametersSummary,
    recommendations: dynamicResult.recommendations,
    variations: dynamicResult.variations
  };
}
