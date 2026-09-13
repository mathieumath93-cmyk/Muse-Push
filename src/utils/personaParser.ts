import { Language } from '../types';

export interface ParsedPersonaResult {
  name: string;
  age: number;
  location?: string;
  defaultLanguage: Language;
  realLifeOccupation: string;
  personality: string;
  objective?: string;
  themes: string[];
  tone?: string;
  homeHabits: string;
  favoriteEmojis: string[];
  customToneNotes: string;
}

/**
 * Analyse intelligemment un texte brut ou des bullet points copiés-collés
 * (ex: nom, âge, métier, personnalité, objectif, thèmes, ton) et extrait
 * automatiquement tous les champs du profil modèle.
 */
export function parseModelFromRawText(rawText: string): ParsedPersonaResult {
  const lines = rawText
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(Boolean);

  let name = '';
  let age = 23;
  let location = '';
  let defaultLanguage: Language = 'fr';
  let realLifeOccupation = '';
  let personality = '';
  let objective = '';
  let themes: string[] = [];
  let tone = '';
  let homeHabits = '';
  let customToneNotes = '';

  // 1. Identify Name
  // Check if there is an explicit "Nom :" or "Prénom :" line
  for (const line of lines) {
    const clean = line.replace(/^[\*\-•–+]\s*/, '').trim();
    const nameMatch = clean.match(/^(?:nom|prénom|pseudo|name)\s*[:=–-]\s*(.+)$/i);
    if (nameMatch && nameMatch[1]) {
      name = nameMatch[1].trim();
      break;
    }
  }

  // If no explicit prefix, the first clean line without ':' is very often the name (e.g., "Sophia")
  if (!name && lines.length > 0) {
    const firstLine = lines[0].replace(/^[\*\-•–+]\s*/, '').trim();
    if (!firstLine.includes(':') && !/\b(?:ans|yo|métier|age|âge)\b/i.test(firstLine) && firstLine.split(/\s+/).length <= 4) {
      name = firstLine;
    }
  }

  // 2. Scan each line for specific attributes
  for (const line of lines) {
    const clean = line.replace(/^[\*\-•–+]\s*/, '').trim();

    // Age detection
    const ageMatch = clean.match(/\b(\d{2})\s*(?:ans|yo|years old)\b/i) || clean.match(/(?:âge|age)\s*[:=–-]?\s*(\d{2})\b/i);
    if (ageMatch && ageMatch[1]) {
      age = parseInt(ageMatch[1], 10);
    }

    // Language / Nationality detection
    if (/\b(?:française?|france|paris|lyon|marseille|montpellier|toulouse|34|75)\b/i.test(clean)) {
      defaultLanguage = 'fr';
    } else if (/\b(?:américaine?|anglaise?|american|usa?|english)\b/i.test(clean)) {
      defaultLanguage = 'us';
    }

    // Location detection (e.g., "vit dans le 34", "vit à Paris", "Localisation : Montpellier")
    const locMatch = clean.match(/(?:vit\s*(?:dans\s*le|à|en|dans)|habite\s*(?:dans\s*le|à|en|dans)|localisation\s*[:=–-]|ville\s*[:=–-]|région\s*[:=–-])\s*([^,\n\*\.]+)/i);
    if (locMatch && locMatch[1]) {
      location = locMatch[1].trim();
      // Capitalize first letter
      if (location) {
        location = location.charAt(0).toUpperCase() + location.slice(1);
      }
    }

    // Métier / Profession
    const jobMatch = clean.match(/^(?:métier|profession|travail|activité|occupation|job)\s*[:=–-]\s*(.+)$/i);
    if (jobMatch && jobMatch[1]) {
      realLifeOccupation = jobMatch[1].trim();
    }

    // Personnalité
    const persoMatch = clean.match(/^(?:personnalité|caractère|vibe|traits?)\s*[:=–-]\s*(.+)$/i);
    if (persoMatch && persoMatch[1]) {
      personality = persoMatch[1].trim();
    }

    // Objectif
    const objMatch = clean.match(/^(?:objectif|but|goal|mission)\s*[:=–-]\s*(.+)$/i);
    if (objMatch && objMatch[1]) {
      objective = objMatch[1].trim();
    }

    // Thèmes
    const themesMatch = clean.match(/^(?:thèmes?|themes?|centres d['’]intérêt|passions?|sujets?|thématiques?)\s*[:=–-]\s*(.+)$/i);
    if (themesMatch && themesMatch[1]) {
      themes = themesMatch[1]
        .split(/[,;\/]/)
        .map(t => t.trim())
        .filter(Boolean);
    }

    // Ton
    const toneMatch = clean.match(/^(?:ton|voix|voice|style|tonalité)\s*[:=–-]\s*(.+)$/i);
    if (toneMatch && toneMatch[1]) {
      tone = toneMatch[1].trim();
    }

    // Cadre maison / Habitudes
    const homeMatch = clean.match(/^(?:cadre|habitudes?|domicile|maison|cadre maison)\s*[:=–-]\s*(.+)$/i);
    if (homeMatch && homeMatch[1]) {
      homeHabits = homeMatch[1].trim();
    }
  }

  // Fallbacks & intelligent completions
  if (!name) {
    name = 'Créatrice';
  }

  if (!personality) {
    personality = tone ? `Style ${tone}` : 'Naturelle, complice et spontanée';
  }

  if (!realLifeOccupation) {
    if (themes.length > 0) {
      realLifeOccupation = `Passionnée par ${themes.slice(0, 3).join(', ')}`;
    } else {
      realLifeOccupation = 'Créatrice & passionnée de mode';
    }
  }

  if (!homeHabits) {
    const locSnippet = location ? ` chez elle (${location})` : '';
    if (themes.some(t => /art|peinture/i.test(t))) {
      homeHabits = `Miroir de chambre, salon lumineux${locSnippet}, café du matin, livres d'art et lit défait`;
    } else if (themes.some(t => /sport|fitness/i.test(t))) {
      homeHabits = `Miroir de chambre en brassière, étirements sur le tapis, douche tiède${locSnippet}`;
    } else {
      homeHabits = `Miroir de chambre, lit défait, couette, essayages et moments cosy${locSnippet}`;
    }
  }

  // Synthesize customToneNotes combining tone, objective and personality
  const toneParts: string[] = [];
  if (tone) {
    toneParts.push(`Ton : ${tone}.`);
  }
  if (objective) {
    toneParts.push(`Objectif : ${objective}.`);
  }
  if (personality) {
    toneParts.push(`Personnalité : ${personality}.`);
  }
  if (themes.length > 0) {
    toneParts.push(`Centres d'intérêt clés : ${themes.slice(0, 8).join(', ')}.`);
  }
  toneParts.push('Affirmations directes, style vrai SMS intime, zéro blabla commercial.');

  customToneNotes = toneParts.join(' ');

  // Suggest personalized emojis based on parsed profile
  const suggestedEmojis: string[] = ['✨'];
  const allText = (rawText + ' ' + themes.join(' ') + ' ' + realLifeOccupation).toLowerCase();

  if (allText.includes('art') || allText.includes('tableau')) suggestedEmojis.push('🎨');
  if (allText.includes('café') || allText.includes('coffee')) suggestedEmojis.push('☕');
  if (allText.includes('chien') || allText.includes('dog') || allText.includes('chat')) suggestedEmojis.push('🐶');
  if (allText.includes('vin') || allText.includes('soirée') || allText.includes('party')) suggestedEmojis.push('🍷');
  if (allText.includes('voyage') || allText.includes('paris') || allText.includes('plage')) suggestedEmojis.push('✈️');
  if (allText.includes('sport') || allText.includes('fitness')) suggestedEmojis.push('👟');
  if (allText.includes('shopping') || allText.includes('lingerie') || allText.includes('mode')) suggestedEmojis.push('🛍️');

  // Core sensual & connection emojis
  if (!suggestedEmojis.includes('🫦')) suggestedEmojis.push('🫦');
  if (!suggestedEmojis.includes('🤍')) suggestedEmojis.push('🤍');
  if (!suggestedEmojis.includes('🙈') && (allText.includes('drôle') || allText.includes('taquine'))) suggestedEmojis.push('🙈');

  return {
    name,
    age,
    location,
    defaultLanguage,
    realLifeOccupation,
    personality,
    objective,
    themes,
    tone,
    homeHabits,
    favoriteEmojis: suggestedEmojis.slice(0, 5),
    customToneNotes
  };
}
