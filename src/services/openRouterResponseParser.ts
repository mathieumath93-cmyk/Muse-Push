import { GeneratedVariation } from '../types';
import { enforceStrictVariationUniqueness } from './deduplicationGuard';

interface ParseOptions {
  isUs?: boolean;
  isPaid?: boolean;
  priceVal?: number;
  mood?: string;
  mediaNotice?: string;
  previousHistory?: string[];
}

/**
 * Universal parser for OpenRouter models and custom presets (@preset/push-bot).
 * Handles:
 * - Strict JSON objects ({ "variations": [...] })
 * - Direct JSON arrays ([{ message: ... }, ...])
 * - Markdown code blocks (```json ... ```)
 * - Numbered lists (1. ..., 2. ...)
 * - Bulleted lists (- ..., * ...)
 * - Plain text paragraphs
 */
export function parseOpenRouterPushResponse(
  rawContent: string,
  options: ParseOptions = {}
): GeneratedVariation[] | null {
  if (!rawContent || typeof rawContent !== 'string') return null;

  const isUs = Boolean(options.isUs);
  const isPaid = Boolean(options.isPaid);
  const basePrice = options.priceVal || 15;
  const raw = rawContent.trim();

  // 1. Try parsing JSON (direct or stripped of markdown fences)
  const jsonCleaned = raw
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  let parsedJson: any = null;

  try {
    parsedJson = JSON.parse(jsonCleaned);
  } catch (_e1) {
    // Try finding JSON object or array with regex
    const match = raw.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
    if (match) {
      try {
        parsedJson = JSON.parse(match[0]);
      } catch (_e2) {
        // Not valid JSON, proceed to text parsing
      }
    }
  }

  // Case A: Valid JSON with variations array
  if (parsedJson) {
    let rawList: any[] | null = null;
    if (Array.isArray(parsedJson)) {
      rawList = parsedJson;
    } else if (parsedJson && Array.isArray(parsedJson.variations)) {
      rawList = parsedJson.variations;
    }

    if (rawList && rawList.length > 0) {
      const parsedVariations: GeneratedVariation[] = rawList.map((item, idx) => {
        const msg = typeof item === 'string' 
          ? item 
          : (item.message || item.text || item.push || item.content || '');
        
        const priceOffset = [0, 2, -2, 4, 1, 3][idx % 6] || 0;
        const itemPrice = Math.max(8, basePrice + priceOffset);

        return {
          id: item.id || `openrouter-var-${idx + 1}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          angle: item.angle || `angle_${idx + 1}`,
          angleLabel: item.angleLabel || (isUs ? `Strategy Hook #${idx + 1}` : `Angle Stratégique #${idx + 1}`),
          message: msg.trim(),
          estimatedOpenRate: item.estimatedOpenRate || `${92 + ((idx * 3) % 7)}%`,
          suggestedPrice: item.suggestedPrice || (isPaid ? (isUs ? `$${itemPrice}` : `${itemPrice}€`) : 'Gratuit'),
          mediaNotice: options.mediaNotice || item.mediaNotice,
          timeContextNote: item.timeContextNote || (isUs ? 'OpenRouter preset response' : 'Généré par preset OpenRouter')
        };
      }).filter(v => v.message.length > 5);

      if (parsedVariations.length > 0) {
        return enforceStrictVariationUniqueness(parsedVariations, {
          previousHistory: options.previousHistory,
          isUs,
          isPaid,
          priceVal: basePrice,
          mood: options.mood as any,
          mediaContext: options.mediaNotice
        });
      }
    }
  }

  // Case B: Numbered list or bullet points (e.g. 1. ..., 2. ..., - ...)
  const lines = raw.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const extractedMessages: string[] = [];

  for (const line of lines) {
    // Match lines starting with 1., 1), [1], - , * , Proposition 1:, Option 1:
    const listMatch = line.match(/^(?:(?:\d+[\.\)]|\[\d+\]|[-*•])|(?:Proposition|Option|Angle|Var(?:iation)?)\s*\d+[\s:]*)\s*(.*)/i);
    if (listMatch && listMatch[1]) {
      const cleanMsg = listMatch[1]
        .replace(/^["']|["']$/g, '') // remove surrounding quotes
        .replace(/^\*\*.*?\*\*:\s*/, '') // remove bold prefixes like **Angle:**
        .trim();
      if (cleanMsg.length > 6) {
        extractedMessages.push(cleanMsg);
      }
    }
  }

  // Case C: Paragraphs separated by double newlines if no list markers found
  if (extractedMessages.length < 2) {
    const paragraphs = raw.split(/\n\s*\n/).map(p => p.trim()).filter(p => p.length > 15);
    for (const p of paragraphs) {
      if (!p.startsWith('{') && !p.startsWith('```')) {
        extractedMessages.push(p.replace(/^["']|["']$/g, '').trim());
      }
    }
  }

  if (extractedMessages.length >= 2) {
    const defaultLabelsFr = [
      'Aveu Brut & Spontané',
      'Défi Direct & Ego',
      'FOMO & Éphémère',
      'Teasing Sensoriel',
      'Exclusivité VIP',
      'Question Complice'
    ];
    const defaultLabelsUs = [
      'Raw Confession',
      'Ego & Direct Challenge',
      'FOMO Urgency',
      'Sensory Tease',
      'VIP Privilege',
      'Playful Hook'
    ];

    const variations: GeneratedVariation[] = extractedMessages.slice(0, 6).map((msg, idx) => {
      const priceOffset = [0, 2, -2, 4, 1, 3][idx % 6] || 0;
      const itemPrice = Math.max(8, basePrice + priceOffset);
      const labels = isUs ? defaultLabelsUs : defaultLabelsFr;

      let finalMsg = msg;
      if (isPaid && !finalMsg.toLowerCase().includes('débloque') && !finalMsg.toLowerCase().includes('unlock')) {
        finalMsg += isUs ? `\n\ntap to unlock` : `\n\ndébloque pour voir la suite`;
      }

      return {
        id: `openrouter-line-${idx + 1}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        angle: `openrouter_preset_hook_${idx + 1}` as any,
        angleLabel: labels[idx] || (isUs ? `Variation #${idx + 1}` : `Proposition #${idx + 1}`),
        message: finalMsg,
        estimatedOpenRate: `${92 + ((idx * 3) % 7)}%`,
        suggestedPrice: isPaid ? (isUs ? `$${itemPrice}` : `${itemPrice}€`) : 'Gratuit',
        mediaNotice: options.mediaNotice,
        timeContextNote: isUs ? 'Preset stream output' : 'Flux optimisé via preset @preset/push-bot'
      };
    });

    return enforceStrictVariationUniqueness(variations, {
      previousHistory: options.previousHistory,
      isUs,
      isPaid,
      priceVal: basePrice,
      mood: options.mood as any,
      mediaContext: options.mediaNotice
    });
  }

  return null;
}
