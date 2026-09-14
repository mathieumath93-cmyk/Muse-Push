export type TzZone = 'FR_CET' | 'US_EST' | 'US_CST' | 'US_PST' | 'LOCAL';

export interface TimeZoneInfo {
  id: TzZone;
  label: string;
  city: string;
  flag: string;
  ianaTimeZone: string;
}

export const SUPPORTED_TIMEZONES: TimeZoneInfo[] = [
  { id: 'FR_CET', label: 'France / Europe (CET / Paris)', city: 'Paris', flag: '🇫🇷', ianaTimeZone: 'Europe/Paris' },
  { id: 'LOCAL', label: 'Heure locale (Navigateur)', city: 'Mon fuseau', flag: '🌍', ianaTimeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/Paris' },
  { id: 'US_EST', label: 'US East (New York / EST)', city: 'New York', flag: '🇺🇸', ianaTimeZone: 'America/New_York' },
  { id: 'US_CST', label: 'US Central (Chicago / CST)', city: 'Chicago', flag: '🇺🇸', ianaTimeZone: 'America/Chicago' },
  { id: 'US_PST', label: 'US West (Los Angeles / PST)', city: 'Los Angeles', flag: '🇺🇸', ianaTimeZone: 'America/Los_Angeles' }
];

export type TimeOfDayPeriod = 'morning' | 'lunch' | 'afternoon' | 'evening' | 'late_night';

export interface ResolvedTimeContext {
  tzZone: TzZone;
  ianaTimeZone: string;
  hour: number;
  minute: number;
  timeString: string; // Ex: "13h15"
  period: TimeOfDayPeriod;
  periodLabelFr: string;
  periodLabelUs: string;
  forbiddenWordsFr: string[];
  forbiddenWordsUs: string[];
  contextualAtmosphereFr: string;
  contextualAtmosphereUs: string;
}

export function getResolvedTime(
  tzZone: TzZone = 'FR_CET',
  useCurrentTime: boolean = true,
  customHour?: number,
  customMinute?: number
): ResolvedTimeContext {
  const tzConfig = SUPPORTED_TIMEZONES.find(t => t.id === tzZone) || SUPPORTED_TIMEZONES[0];
  const now = new Date();

  let hour: number;
  let minute: number;

  if (useCurrentTime || customHour === undefined || customHour === null) {
    try {
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: tzConfig.ianaTimeZone,
        hour: 'numeric',
        minute: 'numeric',
        hour12: false
      });
      const parts = formatter.formatToParts(now);
      const hourVal = parts.find(p => p.type === 'hour')?.value;
      const minuteVal = parts.find(p => p.type === 'minute')?.value;
      hour = hourVal ? parseInt(hourVal, 10) : now.getHours();
      minute = minuteVal ? parseInt(minuteVal, 10) : now.getMinutes();
      if (hour === 24) hour = 0;
    } catch {
      hour = now.getHours();
      minute = now.getMinutes();
    }
  } else {
    hour = customHour;
    minute = customMinute ?? 0;
  }

  // Calculate period of the day based on hour and minute
  // 06:00 - 11:29 : Matin / Réveil
  // 11:30 - 14:29 : Midi / Pause déjeuner (13h est ici !)
  // 14:30 - 18:29 : Après-midi
  // 18:30 - 22:59 : Soirée
  // 23:00 - 05:59 : Nuit tardive / Insomnie
  const totalMinutes = hour * 60 + minute;
  let period: TimeOfDayPeriod;
  let periodLabelFr = '';
  let periodLabelUs = '';
  let forbiddenWordsFr: string[] = [];
  let forbiddenWordsUs: string[] = [];
  let contextualAtmosphereFr = '';
  let contextualAtmosphereUs = '';

  if (totalMinutes >= 360 && totalMinutes < 690) {
    // 06:00 - 11:29 -> Morning
    period = 'morning';
    periodLabelFr = 'Matinée / Réveil (Plein jour)';
    periodLabelUs = 'Morning / Wake-up (Daylight)';
    forbiddenWordsFr = ['ce soir', 'cette nuit', 'bonne nuit', 'insomnie', 'tu dors', 'obscurité', 'dans le noir', 'lampe de chevet', 'dodo', 'fin de soirée', 'sommeil'];
    forbiddenWordsUs = ['tonight', 'late night', 'insomnia', 'asleep', 'in the dark', 'bedside lamp', 'cant sleep'];
    contextualAtmosphereFr = 'Réveil sous la couette, lumière du jour par la fenêtre, café chaud, étirements, flemme de sortir du lit en nuisette.';
    contextualAtmosphereUs = 'Waking up in messy sheets, daylight streaming in, morning coffee, stretching in sheer silk.';
  } else if (totalMinutes >= 690 && totalMinutes < 840) {
    // 11:30 - 13:59 -> Lunch / Mid-day (12h - 13h)
    period = 'lunch';
    periodLabelFr = 'Midi / Pause déjeuner (Plein jour)';
    periodLabelUs = 'Lunchtime / Mid-day (Broad daylight)';
    forbiddenWordsFr = [
      'ce matin', 'au réveil', 'je me réveille', 'yeux à peine ouverts', 'au saut du lit', 'mon réveil', 'petit déj', 'petit déjeuner', 'encore endormie', 'pendant la nuit', 'bonne journée',
      'ce soir', 'cette nuit', 'bonne nuit', 'insomnie', 'tu dors', 'obscurité', 'dans le noir', 'lampe de chevet', 'dodo', 'fin de soirée', 'sommeil'
    ];
    forbiddenWordsUs = [
      'this morning', 'just woke up', 'waking up', 'morning coffee', 'messy bed waking', 'have a good day',
      'tonight', 'late night', 'insomnia', 'asleep', 'in the dark', 'bedside lamp', 'cant sleep', 'good night'
    ];
    contextualAtmosphereFr = 'Plein milieu de journée (12h-13h), lumière vive du soleil, pause déjeuner, petite déconnexion sensuelle avant de repartir, micro-pause dans la chambre.';
    contextualAtmosphereUs = 'Broad daylight, lunch hour pause, sunny room, sneaky mid-day escape in lightweight clothes.';
  } else if (totalMinutes >= 840 && totalMinutes < 1110) {
    // 14:00 - 18:29 -> Afternoon (14h is here! Broad daylight, active afternoon)
    period = 'afternoon';
    periodLabelFr = 'Après-midi (14h - Plein jour)';
    periodLabelUs = 'Afternoon (Daylight, 2 PM+)';
    forbiddenWordsFr = [
      'ce matin', 'au réveil', 'je me réveille', 'yeux à peine ouverts', 'au saut du lit', 'mon réveil', 'petit déj', 'petit déjeuner', 'encore endormie', 'pendant la nuit', 'bonne journée',
      'ce soir', 'cette nuit', 'bonne nuit', 'insomnie', 'tu dors', 'obscurité', 'dans le noir', 'lampe de chevet', 'dodo'
    ];
    forbiddenWordsUs = [
      'this morning', 'just woke up', 'waking up', 'morning coffee', 'messy bed waking', 'have a good day',
      'tonight', 'late night', 'insomnia', 'asleep', 'in the dark', 'bedside lamp', 'cant sleep'
    ];
    contextualAtmosphereFr = 'Plein après-midi ensoleillé (14h+), farniente à la maison, essayage tranquille dans le dressing, pause canapé en tenue légère, envie de déconcentrer le fan en plein milieu de sa journée.';
    contextualAtmosphereUs = 'Bright afternoon (2 PM+), relaxing at home, lazy bedroom mood, sunlight through curtains, teasing him in the middle of his workday.';
  } else if (totalMinutes >= 1110 && totalMinutes < 1380) {
    // 18:30 - 22:59 -> Evening
    period = 'evening';
    periodLabelFr = 'Soirée / Début de nuit';
    periodLabelUs = 'Evening / Unwinding';
    forbiddenWordsFr = ['bonjour', 'ce matin', 'au réveil', 'je me réveille', 'pause déjeuner', 'midi', 'bonne journée', 'plein soleil', '14h'];
    forbiddenWordsUs = ['good morning', 'this morning', 'just woke up', 'lunch break', 'broad daylight', 'afternoon sun'];
    contextualAtmosphereFr = 'Fin de journée, retour au calme, lumière tamisée, préparation de la soirée, tenue cosy et sexy pour décompresser.';
    contextualAtmosphereUs = 'Evening mood, unwinding after work, warm dim lighting, slipping into evening lingerie.';
  } else {
    // 23:00 - 05:59 -> Late Night
    period = 'late_night';
    periodLabelFr = 'Nuit tardive / Insomnie';
    periodLabelUs = 'Late Night / Insomnia';
    forbiddenWordsFr = ['bonjour', 'ce matin', 'au réveil', 'midi', 'pause déjeuner', 'après-midi', 'bonne journée', 'plein jour', 'soleil'];
    forbiddenWordsUs = ['good morning', 'this morning', 'lunch break', 'daylight', 'sunshine', 'afternoon'];
    contextualAtmosphereFr = 'Nuit avancée, insomnie dans le noir ou veilleuse, chuchotements intimes sous la couette, secrets inavouables.';
    contextualAtmosphereUs = 'Middle of the night, dark room whispers, insomnia under the sheets, private confessions.';
  }

  const timeString = `${hour.toString().padStart(2, '0')}h${minute.toString().padStart(2, '0')}`;

  return {
    tzZone,
    ianaTimeZone: tzConfig.ianaTimeZone,
    hour,
    minute,
    timeString,
    period,
    periodLabelFr,
    periodLabelUs,
    forbiddenWordsFr,
    forbiddenWordsUs,
    contextualAtmosphereFr,
    contextualAtmosphereUs
  };
}
