import { 
  ModelProfile, 
  Language, 
  MoodCategory, 
  Platform, 
  SentenceLength, 
  GeneratedVariation, 
  GenerationResult 
} from '../types';
import { getResolvedTime, ResolvedTimeContext, TzZone } from '../utils/timeZoneHelper';

interface DynamicEngineParams {
  modelProfile?: ModelProfile;
  language: Language;
  mood: MoodCategory;
  mediaContext?: string;
  priceSuggestion?: number;
  platform: Platform;
  hotLevel?: number;
  pushType?: 'paid_ppv' | 'free_retention';
  sentenceCount?: SentenceLength;
  timeContext?: {
    selectedTzZone?: TzZone;
    customHour?: number;
    customMinute?: number;
    useCurrentTime?: boolean;
    calculatedHour?: string;
    resolvedPeriod?: string;
  };
}

// Random picker utility
function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateDynamicPushVariations(params: DynamicEngineParams): {
  recommendations: GenerationResult['recommendations'];
  variations: GeneratedVariation[];
} {
  const {
    modelProfile,
    language = 'fr',
    mood = 'hot',
    mediaContext,
    priceSuggestion = 15,
    platform = 'onlyfans',
    pushType = 'paid_ppv',
    sentenceCount = 'short',
    timeContext
  } = params;

  // Resolve accurate time context based on user's target time zone
  const resolvedTime: ResolvedTimeContext = getResolvedTime(
    timeContext?.selectedTzZone || 'FR_CET',
    timeContext?.useCurrentTime ?? true,
    timeContext?.customHour,
    timeContext?.customMinute
  );

  const isUs = language === 'us';
  const isPaid = pushType === 'paid_ppv';
  const isOneLine = sentenceCount === 'one_line';
  const location = modelProfile?.location?.trim() || '';
  const occupation = modelProfile?.realLifeOccupation?.trim() || '';
  const themes = modelProfile?.themes && modelProfile.themes.length > 0 ? modelProfile.themes : ['mode', 'café', 'lit'];
  const emojis = modelProfile?.favoriteEmojis && modelProfile.favoriteEmojis.length > 0 ? modelProfile.favoriteEmojis : ['✨', '🫦', '🤍', '🙈'];

  const em1 = pickRandom(emojis);
  const em2 = pickRandom(emojis.filter(e => e !== em1).concat(['🫦', '✨', '🤍']));
  const chosenTheme = pickRandom(themes);

  const priceVal = priceSuggestion || 15;
  const period = resolvedTime.period; // 'morning' | 'lunch' | 'afternoon' | 'evening' | 'late_night'

  // Time-aware location / moment notes
  const locNoteFr = location ? `ici ${location.toLowerCase().startsWith('dans') ? location : 'dans ' + location}` : 'à la maison';
  const locNoteUs = location ? `here in ${location}` : 'back home';

  let variations: GeneratedVariation[] = [];

  if (isUs) {
    if (!isPaid) {
      // US FREE ENGAGEMENT VARIATIONS - TIME AWARE
      let v1Hooks: string[] = [];
      let v2Hooks: string[] = [];
      let v3Hooks: string[] = [];
      let v4Hooks: string[] = [];
      let v5Hooks: string[] = [];
      let v6Hooks: string[] = [];

      if (period === 'morning') {
        v1Hooks = [
          `woke up messy in oversized cotton and absolutely nothing underneath ${em1}`,
          `barely out of bed stretching in the morning light, thinking about you ${em2}`,
          `morning coffee in bed with this dangerously sheer lace on ${em1}`
        ];
        v3Hooks = [
          `sunlight hitting my pillows, messy hair and total freedom this morning ${em1}`,
          `still wrapped in my duvet enjoying this slow quiet morning ${em2}`
        ];
        v6Hooks = [
          `sending you a quick morning secret before my day even starts 🤍`,
          `first thought of the morning belongs strictly to you ${em1}`
        ];
      } else if (period === 'lunch') {
        // MID-DAY / LUNCH (Around 13:00 / 1 PM)
        v1Hooks = [
          `sneaked away into my room for a quick lunch break in sheer silk ${em1}`,
          `broad daylight hitting my sheets right now, couldn't resist dropping this in ${em2}`,
          `unwrapped a tiny lingerie package during my mid-day break ${em1}`,
          `quiet mid-day pause in my bedroom, thinking about someone who definitely knows who they are ${em1}`
        ];
        v3Hooks = [
          `taking a sunny lunch break sprawled on my bed, tell me what you're up to ${em2}`,
          `mid-day sunshine through the blinds and zero desire to get back to work ${em1}`,
          `barefoot on my bedroom rug during lunch, peeling this top off ${em1}`
        ];
        v6Hooks = [
          `sneaking you this private mid-day clip while everyone else is busy 🤍`,
          `a little spontaneous lunch break distraction saved just for you ${em1}`
        ];
      } else if (period === 'afternoon') {
        v1Hooks = [
          `lazy afternoon in my bedroom, natural sunlight makes this silk completely sheer ${em1}`,
          `taking a quick afternoon pause at home, outfit barely staying on ${em2}`,
          `sitting on my rug in the afternoon sun thinking about you ${em1}`
        ];
        v3Hooks = [
          `quiet afternoon at home, relaxing in soft lace with my playlist on ${em1}`,
          `afternoon light hitting my bedroom mirror just right today ${em2}`
        ];
        v6Hooks = [
          `a little afternoon secret dropped right here in our chat 🤍`,
          `taking five minutes just to send you this private vibe ${em1}`
        ];
      } else if (period === 'evening') {
        v1Hooks = [
          `finally home kicking my shoes off and slipping into something dangerously sheer ${em1}`,
          `evening unwinding in my bedroom, robe completely slipped off ${em2}`,
          `cozy evening at home, candles on and nothing to rush for ${em1}`
        ];
        v3Hooks = [
          `finally winding down after work ${occStoryUs(occupation, isArt(chosenTheme))}, tea and silk ${em1}`,
          `soft evening lights in my bedroom, tell me what you're doing right now ${em2}`
        ];
        v6Hooks = [
          `lights turned all the way down, just wanted you to see what nobody else gets to see ${em2}`,
          `quiet evening mood strictly reserved between you and me tonight 🤍`
        ];
      } else {
        // LATE NIGHT
        v1Hooks = [
          `crawled into bed unable to sleep, sheets are a complete mess tonight ${em1}`,
          `late night thoughts... pretty sure you wouldn't survive 5 minutes in this room right now ${em2}`,
          `sitting on my bedroom floor in the dark thinking about someone who knows who they are ${em1}`
        ];
        v3Hooks = [
          `dark quiet bedroom, sheets wrapped tight, whisper me something ${em1}`,
          `restless in bed tonight, tell me you're not sleeping yet ${em2}`
        ];
        v6Hooks = [
          `whispering this before i fall asleep... keep this private between us 🤍`,
          `late night mood strictly reserved for my favorite person ${em1}`
        ];
      }

      v2Hooks = [
        `i'm 100% convinced you wouldn't survive 2 minutes next to me dressed like this under my sheets ${em2}`,
        `bet you have zero self-control when it comes to women who take what they want ${em1}`,
        `don't pretend you'd stay calm if i walked into your room looking like this right now ${em2}`,
        `you talk a big game, but let's be honest... you'd fold in seconds ${em1}`
      ];

      v4Hooks = [
        `anyone who says they prefer big pajamas over sheer silk lingerie is lying to themselves ${em1}`,
        `unpopular opinion: natural messy hair and zero makeup always beats dressing up ${em2}`,
        `controversial take: shy guys are ten times more dangerous behind closed doors ${em1}`
      ];

      v5Hooks = [
        `my silk robe completely slipped off while taking this... zero filter ${em1}`,
        `tried to take a quick mirror check and realized how completely see-through this is 🙈`,
        `spilled a drop of water on my silk cami and now it's clinging everywhere ${em1}`
      ];

      variations = [
        {
          id: `var-${Date.now()}-1`,
          angle: 'direct',
          angleLabel: 'Intimate Home Confession (Statement)',
          message: isOneLine ? pickRandom(v1Hooks) : `${pickRandom(v1Hooks)}\n\nbet you'd have zero self-control right here with me... ${em2}`,
          estimatedOpenRate: `${randomInt(93, 97)}%`,
          suggestedPrice: 'Free',
          mediaNotice: 'Direct free message / Chat starter',
          timeContextNote: `Time-aligned for ${resolvedTime.timeString} (${resolvedTime.periodLabelUs}).`
        },
        {
          id: `var-${Date.now()}-2`,
          angle: 'tease_playful',
          angleLabel: 'Ego Challenge & Playful Tease',
          message: isOneLine ? pickRandom(v2Hooks) : `${pickRandom(v2Hooks)}\n\ntell me i'm wrong, or prove it... ${em1}`,
          estimatedOpenRate: `${randomInt(94, 98)}%`,
          suggestedPrice: 'Free',
          mediaNotice: 'Ego-trigger provocation',
          timeContextNote: 'Triggers masculine pride and fast conversational reply.'
        },
        {
          id: `var-${Date.now()}-3`,
          angle: 'intimate_gfe',
          angleLabel: 'Real Life at Home (Cozy routine)',
          message: isOneLine ? pickRandom(v3Hooks) : `${pickRandom(v3Hooks)}\n\ncome keep me company... 🤍`,
          estimatedOpenRate: `${randomInt(90, 95)}%`,
          suggestedPrice: 'Free',
          mediaNotice: 'Natural lifestyle glimpse',
          timeContextNote: `Reflects daytime routine without false nocturnal stereotypes.`
        },
        {
          id: `var-${Date.now()}-4`,
          angle: 'direct',
          angleLabel: 'Opinion & Debate Trigger',
          message: isOneLine ? pickRandom(v4Hooks) : `${pickRandom(v4Hooks)}\n\nprove me wrong if you can... ${em1}`,
          estimatedOpenRate: `${randomInt(88, 93)}%`,
          suggestedPrice: 'Free',
          mediaNotice: 'Debate spark',
          timeContextNote: 'Drives replies by challenging the fan to take a stand.'
        },
        {
          id: `var-${Date.now()}-5`,
          angle: 'mysterious',
          angleLabel: 'Spontaneous Unscripted Moment',
          message: isOneLine ? pickRandom(v5Hooks) : `${pickRandom(v5Hooks)}\n\ndidn't even edit it, just blushed at the mirror 🙈`,
          estimatedOpenRate: `${randomInt(93, 97)}%`,
          suggestedPrice: 'Free',
          mediaNotice: '100% natural spontaneity',
          timeContextNote: 'Raw authenticity triggers high fan affinity.'
        },
        {
          id: `var-${Date.now()}-6`,
          angle: 'mysterious',
          angleLabel: 'Private Secret (VIP)',
          message: isOneLine ? pickRandom(v6Hooks) : `${pickRandom(v6Hooks)}\n\nkeep this between us 🤍`,
          estimatedOpenRate: `${randomInt(92, 96)}%`,
          suggestedPrice: 'Free',
          mediaNotice: 'Private chat whisper',
          timeContextNote: 'Creates special exclusive intimacy in private DMs.'
        }
      ];
    } else {
      // US PAID PPV VARIATIONS - TIME AWARE
      let ppv1: string[] = [];
      let ppv3: string[] = [];
      let ppv6: string[] = [];

      if (period === 'morning') {
        ppv1 = [
          `sunlight hitting my bed this morning, tried this sheer lace set on camera ${em1}`,
          `morning bed try-on session... fabric doesn't leave anything to imagination ${em2}`
        ];
        ppv3 = [
          `slow morning wake-up under the duvet, left the camera rolling just for you ${em1}`,
          `morning stretches in sheer silk, recorded raw in daylight... unlock below 🤍`
        ];
        ppv6 = [
          `my private morning tape before starting the day... tap to unlock 🤍`,
          `secret bedroom clip recorded with the morning sun, unlock below ${em2}`
        ];
      } else if (period === 'lunch') {
        // MID-DAY / LUNCH (13h)
        ppv1 = [
          `took advantage of my lunch break to test this sheer set in bright daylight ${em1}`,
          `sneaked into my bedroom in the middle of the day, fabric is totally see-through in the sun ${em2}`,
          `broad daylight mirror check during my lunch pause... tap to unlock ${em1}`
        ];
        ppv3 = [
          `spontaneous lunch break solo on my bed, daylight streaming in... tap to join me ${em2}`,
          `quick mid-day escape under my sheets, recorded unfiltered for you... unlock below 🤍`
        ];
        ppv6 = [
          `this private mid-day clip stays strictly between us, tap to unlock before I delete 🤍`,
          `a little secret recording from my lunch hour, unlock below ${em1}`
        ];
      } else if (period === 'afternoon') {
        ppv1 = [
          `lazy afternoon unboxing in front of the mirror, fabric is dangerously sheer in the sun ${em1}`,
          `afternoon light in my room got out of hand, filmed the whole try-on ${em2}`
        ];
        ppv3 = [
          `quiet afternoon in bed, gentle whispers and skin... tap to unlock ${em2}`,
          `afternoon relaxation turned into something way too hot... unlock below 🤍`
        ];
        ppv6 = [
          `private afternoon clip reserved strictly for this chat, unlock below 🤍`,
          `exclusive footage from this afternoon on my bed, tap to unlock ${em1}`
        ];
      } else if (period === 'evening') {
        ppv1 = [
          `finally home, tried this silk set on in front of my mirror tonight ${em1}`,
          `winding down tonight in sheer black lace... tap to see the full try-on ${em2}`
        ];
        ppv3 = [
          `under the duvet thinking about you tonight, left the camera rolling the entire time ${em1}`,
          `soft bedroom lighting, hands everywhere, recorded just for you... unlock below 🤍`
        ];
        ppv6 = [
          `my absolute dirtiest secret recorded on my bed tonight... tap below 🤍`,
          `this private evening tape stays between us only, unlock below ${em2}`
        ];
      } else {
        // LATE NIGHT
        ppv1 = [
          `late night mirror check, silk completely sheer in the dark ${em1}`,
          `unable to sleep tonight, tried this set on in my dark room... unlock below ${em2}`
        ];
        ppv3 = [
          `whispering under the duvet late tonight, filmed everything just for you ${em1}`,
          `late night insomnia tape on my bed... unlock below 🤍`
        ];
        ppv6 = [
          `our midnight secret tape, tap below to unlock before I take it down 🤍`,
          `filmed in the dark on my bed tonight, unlock below ${em1}`
        ];
      }

      const ppv2 = [
        `i bet you wouldn't last 2 minutes watching this full solo clip on my bed 😈`,
        `dare you to unlock this full clip without folding... completely impossible ${em1}`,
        `challenge your self-control right now, tap below and tell me if you folded ${em2}`
      ];

      const ppv4 = [
        `my lingerie parcel finally arrived today ${locNoteUs}... crash tested every piece on camera ${em1}`,
        `unboxing this sheer lace haul directly on my bed, see the full try-on below ${em2}`,
        `silk against warm skin in my dressing room... tap to unlock the full clip ${em1}`
      ];

      const ppv5 = [
        `towel completely dropped on the bathroom tiles... steam on the glass, filmed everything ${em1}`,
        `fresh out of the shower, wet hair and bare skin, couldn't stop myself from recording 🚿`,
        `bathroom mirror fogged up, caught in the act without clothes... unlock below 🫦`
      ];

      variations = [
        {
          id: `var-${Date.now()}-1`,
          angle: 'direct',
          angleLabel: 'Sensual Bedroom Confession (PPV)',
          message: isOneLine ? pickRandom(ppv1) : `${pickRandom(ppv1)}\n\nunlock below to see the full unfiltered clip ${em2}`,
          estimatedOpenRate: `${randomInt(92, 96)}%`,
          suggestedPrice: `$${priceVal}`,
          mediaNotice: mediaContext || 'Full bedroom video clip',
          timeContextNote: `Time aligned for ${resolvedTime.timeString} (${resolvedTime.periodLabelUs}).`
        },
        {
          id: `var-${Date.now()}-2`,
          angle: 'tease_playful',
          angleLabel: 'Ego Challenge & Bet (PPV)',
          message: isOneLine ? pickRandom(ppv2) : `${pickRandom(ppv2)}\n\ntap unlock and let's see how long you survive ${em1}`,
          estimatedOpenRate: `${randomInt(94, 98)}%`,
          suggestedPrice: `$${Math.max(10, priceVal - 2)}`,
          mediaNotice: 'Full solo tape on bed',
          timeContextNote: 'Ego bet drives immediate curious unlock.'
        },
        {
          id: `var-${Date.now()}-3`,
          angle: 'intimate_gfe',
          angleLabel: 'Under The Sheets Complice (GFE)',
          message: isOneLine ? pickRandom(ppv3) : `${pickRandom(ppv3)}\n\ntap below to unlock and join me ${em2}`,
          estimatedOpenRate: `${randomInt(89, 94)}%`,
          suggestedPrice: `$${priceVal + 3}`,
          mediaNotice: 'Intimate bedroom soft tape',
          timeContextNote: 'Emotional intimacy commands premium price.'
        },
        {
          id: `var-${Date.now()}-4`,
          angle: 'direct',
          angleLabel: 'Lingerie Haul Crash-Test',
          message: isOneLine ? pickRandom(ppv4) : `${pickRandom(ppv4)}\n\ntap unlock to see how sheer this really looks on ${em1}`,
          estimatedOpenRate: `${randomInt(89, 93)}%`,
          suggestedPrice: `$${priceVal}`,
          mediaNotice: 'Try-on crash test in dressing',
          timeContextNote: 'Very organic home setting, high CTR.'
        },
        {
          id: `var-${Date.now()}-5`,
          angle: 'mysterious',
          angleLabel: 'Steamy Bathroom / Towel Drop',
          message: isOneLine ? pickRandom(ppv5) : `${pickRandom(ppv5)}\n\nunlock fast before i wrap myself up again 🫦`,
          estimatedOpenRate: `${randomInt(93, 97)}%`,
          suggestedPrice: `$${Math.max(10, priceVal - 1)}`,
          mediaNotice: 'Steamy shower exit tape',
          timeContextNote: 'High conversion visual pretext.'
        },
        {
          id: `var-${Date.now()}-6`,
          angle: 'mysterious',
          angleLabel: 'Forbidden Bedroom Secret (VIP)',
          message: isOneLine ? pickRandom(ppv6) : `${pickRandom(ppv6)}\n\ntap below to unlock our little secret 🤍`,
          estimatedOpenRate: `${randomInt(94, 98)}%`,
          suggestedPrice: `$${priceVal + 4}`,
          mediaNotice: 'VIP exclusive bedroom footage',
          timeContextNote: 'Exclusivity creates powerful fear of missing out.'
        }
      ];
    }
  } else {
    // FRENCH VARIATIONS - STRICT TIME ALIGNMENT
    if (!isPaid) {
      // FRENCH FREE RETENTION / DM STARTERS - TIME AWARE
      let v1Fr: string[] = [];
      let v3Fr: string[] = [];
      let v6Fr: string[] = [];

      if (period === 'morning') {
        v1Fr = [
          `réveil tout doux dans mes draps ce matin, pull trop large et rien en dessous... mon humeur préférée ${em1}`,
          `pas encore sortie de mon lit ce matin, la lumière traverse ma nuisette et me donne des idées ${em1}`,
          `étirements du matin en soie sur mon lit, je parie que tu tiendrais pas 5 minutes à côté de moi ${em2}`,
          `mon café fume sur la table de chevet, moi je traîne encore sous la couette en pensant à toi ${em1}`
        ];
        v3Fr = [
          `rayon de soleil direct sur mon lit ce matin, musique douce et flemme totale de me lever ${em1}`,
          `à peine réveillée, cheveux ébouriffés et zéro filtre... viens me dire bonjour mon cœur ${em2}`,
          `début de journée tout doux dans ma chambre, j'avais envie de t'écrire avant de bouger ${em1}`
        ];
        v6Fr = [
          `ma toute première pensée de la matinée est pour toi, je te confie ça avant d'entamer ma journée 🤍`,
          `petit coucou matinal réservé uniquement à toi dans notre chat privé ${em1}`
        ];
      } else if (period === 'lunch') {
        // MIDI / PAUSE DÉJEUNER (11h30 - 14h29, notamment 13h !)
        v1Fr = [
          `petite pause en plein milieu de ma journée ${locNoteFr} : je me suis isolée dans ma chambre en petite tenue ${em1}`,
          `en pleine pause de midi sur mon lit, le soleil tape sur ma nuisette et ça ne cache absolument rien ${em1}`,
          `j'ai déballé mon colis de lingerie pendant ma pause déjeuner, le tissu est dangereusement transparent ${em2}`,
          `coupure de midi sous la couette en tenue très légère, je me demandais ce que tu faisais là maintenant ${em1}`
        ];
        v3Fr = [
          `pause de midi au calme dans ma chambre, lumière du jour parfaite et aucune envie de reprendre ${em1}`,
          `échappée belle dans mon lit en plein milieu de journée, viens me distraire un peu ${em2}`,
          `soleil qui brille par la fenêtre, pause détente sur le dos en tenue légère ${em1}`
        ];
        v6Fr = [
          `petite parenthèse intime volée en plein milieu de ma journée, rien que pour toi 🤍`,
          `je profite de ma pause de midi pour t'envoyer ce petit secret en privé ${em1}`
        ];
      } else if (period === 'afternoon') {
        v1Fr = [
          `après-midi calme dans ma chambre ${locNoteFr}, la lumière du jour fait ressortir la dentelle de ma nuisette ${em1}`,
          `flemme totale cet après-midi, je traîne en sous-vêtements sur mon lit en pensant fort à toi ${em1}`,
          `petite pause canapé cet après-midi en tenue très légère, je parie que tu craquerais en un regard ${em2}`
        ];
        v3Fr = [
          `après-midi détente chez moi, volets mi-clos pour garder la fraîcheur et ma musique préférée ${em1}`,
          `pause cocooning cet après-midi sur mon lit, viens me raconter ce que tu fais ${em2}`
        ];
        v6Fr = [
          `un petit mot doux glissé cet après-midi dans notre chat, rien que pour tes yeux 🤍`,
          `moment privilégié en direct de ma chambre cet après-midi ${em1}`
        ];
      } else if (period === 'evening') {
        v1Fr = [
          `enfin posée ce soir à la maison, j'ai viré mes vêtements pour me glisser sous la couette ${em1}`,
          `honnêtement je n'aurais jamais dû essayer cette nuisette devant mon miroir ce soir... c'est ultra transparent ${em1}`,
          `mes draps sont complètement défaits ce soir, si seulement tu voyais dans quel état je suis ${em2}`
        ];
        v3Fr = [
          `enfin rentrée ${locNoteFr}, thé chaud dans le lit, bougie allumée et ma dentelle la plus fine ${em1}`,
          `soirée cocooning dans ma chambre, lumière tamisée et musique douce... viens me raconter ta journée ${em2}`
        ];
        v6Fr = [
          `lumières tamisées dans la chambre ce soir, j'avais juste envie de partager cette douceur avec toi ${em2}`,
          `ce moment de fin de journée restera strictement entre toi et moi 🤍`
        ];
      } else {
        // NUIT TARDIVE (23h - 06h)
        v1Fr = [
          `insomnie totale sur mon lit... je me demandais si t'étais encore réveillé toi aussi ${em1}`,
          `petite confidence nocturne ${locNoteFr} : je parie tout ce que tu veux que tu ne tiendrais pas 5 minutes ici ${em2}`,
          `assise sur le parquet de ma chambre incapable de dormir en pensant à quelqu'un qui se reconnaîtra ${em1}`
        ];
        v3Fr = [
          `chambre dans la pénombre, couette remontée, viens me chuchoter quelque chose ${em1}`,
          `nuit blanche en nuisette satin, raconte-moi un secret pour que je m'endorme ${em2}`
        ];
        v6Fr = [
          `je te confie ça tard cette nuit avant de m'endormir... garde ça précieusement pour nous 🤍`,
          `seuls les vrais privilégiés reçoivent ce genre de message de ma part à cette heure-ci ${em2}`
        ];
      }

      const v2Fr = [
        `je suis convaincue à 100% que tu ne tiendrais pas 2 minutes à côté de moi habillée comme ça sous ma couette 😈`,
        `avoue que t'aurais zéro volonté si j'étais assise sur le bord de ton lit en ce moment même ${em1}`,
        `fais pas le mec insensible, je sais très bien que tu craquerais en un regard ${em2}`,
        `je te lance un défi : viens me regarder dans les yeux pendant 30 secondes sans rougir ${em1}`,
        `t'as l'air très sûr de toi, mais entre nous... tu bégayerais direct face à moi ${em2}`
      ];

      const v4Fr = [
        `tous ceux qui disent préférer un gros pyjama à un ensemble en soie se mentent à eux-mêmes ${em1}`,
        `vérité qui dérange : les hommes timides sont dix fois plus passionnés en privé ${em1}`,
        `la sensation de la soie fraîche sur la peau nue... c'est impossible de remettre des vrais vêtements après ça ${em2}`
      ];

      const v5Fr = [
        `ma serviette a glissé toute seule sur le carrelage en sortant de la douche... j'ai rien coupé 🙈`,
        `j'ai voulu faire un check rapide dans ma glace et le décolleté a sauté tout seul ${em1}`,
        `un verre d'eau glacée renversé sur ma nuisette... le résultat est totalement illégal ${em1}`,
        `j'ai eu un fou rire toute seule en m'emmêlant dans mes draps en tenue beaucoup trop légère ${em2}`
      ];

      variations = [
        {
          id: `var-${Date.now()}-1`,
          angle: 'direct',
          angleLabel: 'Confession & Aveu Intime (Affirmation)',
          message: isOneLine ? pickRandom(v1Fr) : `${pickRandom(v1Fr)}\n\nje parie que t'aurais zéro self-control si t'étais avec moi sur mon lit en ce moment... ${em2}`,
          estimatedOpenRate: `${randomInt(93, 97)}%`,
          suggestedPrice: 'Gratuit',
          mediaNotice: 'Message direct offert / Déclencheur conversation',
          timeContextNote: `Cohérence temporelle garantie pour ${resolvedTime.timeString} (${resolvedTime.periodLabelFr}).`
        },
        {
          id: `var-${Date.now()}-2`,
          angle: 'tease_playful',
          angleLabel: 'Taquinerie & Pique sur son Ego',
          message: isOneLine ? pickRandom(v2Fr) : `${pickRandom(v2Fr)}\n\ndis-moi que j'ai tort, ou viens me prouver le contraire... ${em1}`,
          estimatedOpenRate: `${randomInt(94, 98)}%`,
          suggestedPrice: 'Gratuit',
          mediaNotice: 'Attaque ego sans barrière',
          timeContextNote: 'Pique directement la fierté masculine du fan pour le faire réagir.'
        },
        {
          id: `var-${Date.now()}-3`,
          angle: 'intimate_gfe',
          angleLabel: 'Micro-Instant Maison (Storytelling réel)',
          message: isOneLine ? pickRandom(v3Fr) : `${pickRandom(v3Fr)}\n\nviens me tenir compagnie... 🤍`,
          estimatedOpenRate: `${randomInt(90, 95)}%`,
          suggestedPrice: 'Gratuit',
          mediaNotice: 'Scène de vie quotidienne spontanée',
          timeContextNote: `Parfaitement synchronisé avec la lumière et l'heure (${resolvedTime.periodLabelFr}).`
        },
        {
          id: `var-${Date.now()}-4`,
          angle: 'direct',
          angleLabel: 'Opinion Tranchée & Dilemme',
          message: isOneLine ? pickRandom(v4Fr) : `${pickRandom(v4Fr)}\n\nje suis allongée sur mon lit en soie en ce moment même... fais-moi changer d'avis si tu peux ${em1}`,
          estimatedOpenRate: `${randomInt(88, 93)}%`,
          suggestedPrice: 'Gratuit',
          mediaNotice: 'Débatteur de discussion',
          timeContextNote: 'Force le fan à prendre position et à exprimer son avis.'
        },
        {
          id: `var-${Date.now()}-5`,
          angle: 'mysterious',
          angleLabel: 'Petite Bêtise / Moment Spontané',
          message: isOneLine ? pickRandom(v5Fr) : `${pickRandom(v5Fr)}\n\nj'ai même pas recoupé la séquence, je suis assise toute rouge sur mon lit ${em1}`,
          estimatedOpenRate: `${randomInt(94, 98)}%`,
          suggestedPrice: 'Gratuit',
          mediaNotice: 'Spontanéité 100% brute',
          timeContextNote: 'Paraît 100% naturel, sans script ni artifice de studio.'
        },
        {
          id: `var-${Date.now()}-6`,
          angle: 'mysterious',
          angleLabel: 'Secret VIP & Exclusivité Complice',
          message: isOneLine ? pickRandom(v6Fr) : `${pickRandom(v6Fr)}\n\nce moment ne sortira jamais d'ici, profite avant que je devienne trop timide 🤍`,
          estimatedOpenRate: `${randomInt(92, 96)}%`,
          suggestedPrice: 'Gratuit',
          mediaNotice: 'Privilège VIP exclusif',
          timeContextNote: 'Donne au fan le sentiment précieux d\'être un interlocuteur unique.'
        }
      ];
    } else {
      // FRENCH PAID PPV VARIATIONS - TIME AWARE
      let ppv1Fr: string[] = [];
      let ppv3Fr: string[] = [];
      let ppv6Fr: string[] = [];

      if (period === 'morning') {
        ppv1Fr = [
          `la lumière du matin traverse cet ensemble en soie... débloque vite pour voir le rendu sur moi ${em1}`,
          `séance essayage au réveil devant le grand miroir, le tissu ne cache absolument rien ${em2}`,
          `aveu du matin : j'étais d'humeur beaucoup trop coquine dans mes draps... clique en dessous ${em1}`
        ];
        ppv3Fr = [
          `réveil tout doux sous les draps, j'ai laissé tourner la caméra en direct du lit... clique pour me rejoindre ${em2}`,
          `étirements sensuels du matin en nuisette fine, tout est filmé en pleine lumière... débloque vite 🤍`
        ];
        ppv6Fr = [
          `mon petit clip privé du matin, clique en dessous avant que je ne le supprime 🤍`,
          `vidéo intime au réveil dans notre chat privé, débloque mon secret ${em2}`
        ];
      } else if (period === 'lunch') {
        // MIDI / 13h (LUNCHTIME - PLEIN JOUR)
        ppv1Fr = [
          `j'ai profité de ma pause midi pour tester ma nouvelle lingerie devant le miroir... clique en dessous pour voir le crash-test ${em1}`,
          `en plein milieu de ma journée, le soleil traverse le tissu et on voit absolument tout... débloque vite ${em2}`,
          `petite session solo improvisée pendant ma pause déjeuner dans ma chambre... clique pour débloquer ${em1}`,
          `aveu sincère : j'avais une envie beaucoup trop chaude en rentrant déjeuner sur mon lit... clique en dessous ${em2}`
        ];
        ppv3Fr = [
          `échappée sous la couette en pleine pause de midi, j'ai laissé tourner la caméra... clique pour me rejoindre ${em2}`,
          `soleil qui tape sur mes draps, petite pause intime improvisée rien que pour toi mon cœur... débloque vite 🤍`
        ];
        ppv6Fr = [
          `ma vidéo secrète de la pause de midi, débloque avant que je retourne à mes occupations 🤍`,
          `ce clip de mi-journée restera strictement entre nous, débloque et viens me voir ${em2}`
        ];
      } else if (period === 'afternoon') {
        ppv1Fr = [
          `la lumière de l'après-midi dans mon miroir est juste incroyable... clique pour voir ce que je portais ${em1}`,
          `j'ai testé ma nouvelle lingerie dans mon dressing cet après-midi, le tissu est ultra fin... débloque vite ${em2}`,
          `session solo en plein après-midi sur mon lit... débloque et viens me donner ton avis ${em1}`
        ];
        ppv3Fr = [
          `après-midi tranquille dans mes draps en train de penser fort à toi... clique pour me rejoindre ${em2}`,
          `ambiance douce et intime cet après-midi sur mon lit... débloque vite 🤍`
        ];
        ppv6Fr = [
          `ce clip d'après-midi restera strictement dans notre chat privé, débloque mon secret 🤍`,
          `mon moment le plus spontané filmé cet après-midi sur mon lit... clique en dessous ${em2}`
        ];
      } else if (period === 'evening') {
        ppv1Fr = [
          `cet ensemble en soie ne cache absolument rien... clique en dessous pour voir ce que mon miroir a vu ce soir ${em1}`,
          `j'ai testé ma nouvelle lingerie commandée en ligne sur mon lit, le tissu est ultra fin... débloque vite ${em2}`,
          `j'ai filmé ma session solo devant le grand miroir de la chambre ce soir... débloque et viens me donner ton avis ${em1}`
        ];
        ppv3Fr = [
          `dans mes draps défaits en train de penser fort à toi, j'ai laissé tourner la caméra tout le long ${em1}`,
          `lumière tamisée dans ma chambre ce soir, j'ai tout filmé rien que pour toi mon cœur... débloque vite 🤍`
        ];
        ppv6Fr = [
          `ce clip de ce soir restera strictement dans notre chat privé, débloque mon secret et viens me voir 🤍`,
          `mon moment le plus secret filmé sur mon lit ce soir... clique en dessous avant que je supprime ${em2}`
        ];
      } else {
        // NUIT TARDIVE
        ppv1Fr = [
          `insomnie coquine sur mon lit... clique en dessous pour voir ce que je faisais dans la pénombre ${em1}`,
          `impossible de dormir cette nuit, j'ai tout filmé sous la couette... débloque vite ${em2}`
        ];
        ppv3Fr = [
          `chambre dans le noir, chuchotements sous les draps, j'ai laissé tourner la caméra pour toi ${em1}`,
          `vidéo nocturne intime sous la couette... clique pour me rejoindre cette nuit 🤍`
        ];
        ppv6Fr = [
          `mon secret le plus brûlant filmé dans le noir sur mon lit cette nuit... clique en dessous 🤍`,
          `cette vidéo privée de nuit reste strictement entre nous deux, débloque mon secret ${em2}`
        ];
      }

      const ppv2Fr = [
        `je parie tout ce que tu veux que tu ne tiens pas 3 minutes devant cette vidéo solo sur mon lit 😈`,
        `je te mets au défi de débloquer ce clip complet sans perdre totalement ton sang-froid... impossible ${em1}`,
        `je sais que tu ne résisteras jamais à une fille qui te tease comme ça en privé... débloque vite 🫦`,
        `teste ta résistance tout de suite, clique en dessous et viens m'avouer si t'as craqué ${em2}`
      ];

      const ppv4Fr = [
        `mon colis de lingerie fine est enfin arrivé ${locNoteFr}... j'ai fait le crash-test directement en vidéo ${em1}`,
        `unboxing en direct sur mon lit, la dentelle est tellement fine qu'on voit tout à travers ${em2}`,
        `séance essayage sans tabou dans mon dressing, clique en dessous pour voir le rendu sur moi ${em1}`
      ];

      const ppv5Fr = [
        `ma serviette a glissé toute seule sur le carrelage de la salle de bain... miroir embué, j'ai tout filmé 🚿`,
        `à peine sortie de la douche bien chaude, peau mouillée et aucun filtre... regarde comme j'avais chaud 🫦`,
        `serviette tombée en plein enregistrement dans ma salle de bain... débloque avant que je m'habille 🙈`
      ];

      variations = [
        {
          id: `var-${Date.now()}-1`,
          angle: 'direct',
          angleLabel: 'Confession Sensuelle Chambre (PPV)',
          message: isOneLine ? pickRandom(ppv1Fr) : `${pickRandom(ppv1Fr)}\n\nclique en dessous pour débloquer la vidéo complète sans filtre ${em2}`,
          estimatedOpenRate: `${randomInt(92, 96)}%`,
          suggestedPrice: `${priceVal}€`,
          mediaNotice: mediaContext || 'Vidéo solo chambre complète',
          timeContextNote: `Aligné sur l'heure réelle : ${resolvedTime.timeString} (${resolvedTime.periodLabelFr}).`
        },
        {
          id: `var-${Date.now()}-2`,
          angle: 'tease_playful',
          angleLabel: 'Défi Ego & Pari de Résistance (PPV)',
          message: isOneLine ? pickRandom(ppv2Fr) : `${pickRandom(ppv2Fr)}\n\nviens tester ton self-control, clique en dessous et dis-moi si t'as tenu 🫦`,
          estimatedOpenRate: `${randomInt(94, 98)}%`,
          suggestedPrice: `${Math.max(10, priceVal - 2)}€`,
          mediaNotice: 'Solo tape complète sur le lit',
          timeContextNote: 'Défi direct qui pousse à acheter pour prouver sa résistance masculine.'
        },
        {
          id: `var-${Date.now()}-3`,
          angle: 'intimate_gfe',
          angleLabel: 'Sous la Couette Complice (GFE)',
          message: isOneLine ? pickRandom(ppv3Fr) : `${pickRandom(ppv3Fr)}\n\nclique en dessous et viens passer ce moment avec moi 🥰`,
          estimatedOpenRate: `${randomInt(89, 94)}%`,
          suggestedPrice: `${priceVal + 3}€`,
          mediaNotice: 'Vidéo intime douce sous les draps',
          timeContextNote: `Ambiance intime adaptée à la lumière du moment (${resolvedTime.periodLabelFr}).`
        },
        {
          id: `var-${Date.now()}-4`,
          angle: 'direct',
          angleLabel: 'Crash-Test Colis Lingerie (Unboxing)',
          message: isOneLine ? pickRandom(ppv4Fr) : `${pickRandom(ppv4Fr)}\n\nclique en dessous pour voir le crash-test complet sans censure 🥀`,
          estimatedOpenRate: `${randomInt(89, 93)}%`,
          suggestedPrice: `${priceVal}€`,
          mediaNotice: 'Crash-test essayage lingerie',
          timeContextNote: 'Prétexte d\'achat en ligne très naturel et facile à relier au média.'
        },
        {
          id: `var-${Date.now()}-5`,
          angle: 'mysterious',
          angleLabel: 'Sortie de Douche / Serviette qui Tombe',
          message: isOneLine ? pickRandom(ppv5Fr) : `${pickRandom(ppv5Fr)}\n\ndébloque vite avant que je me rhabille 🫦`,
          estimatedOpenRate: `${randomInt(93, 97)}%`,
          suggestedPrice: `${Math.max(10, priceVal - 1)}€`,
          mediaNotice: 'Média sortie de douche intime',
          timeContextNote: 'Cadre salle de bain familier provoquant une impulsion d\'achat forte.'
        },
        {
          id: `var-${Date.now()}-6`,
          angle: 'mysterious',
          angleLabel: 'Secret Exclusif Chambre (VIP)',
          message: isOneLine ? pickRandom(ppv6Fr) : `${pickRandom(ppv6Fr)}\n\ntout s'est passé sur mon lit... débloque mon secret et viens me voir 🤍`,
          estimatedOpenRate: `${randomInt(94, 98)}%`,
          suggestedPrice: `${priceVal + 4}€`,
          mediaNotice: 'Média exclusif chat privé',
          timeContextNote: 'L\'impression de privilège secret multiplie le taux de transformation.'
        }
      ];
    }
  }

  // Dynamic recommendations adhering to time of day
  const bestTimeWindows = isUs
    ? (period === 'lunch' ? [`${resolvedTime.timeString} (Mid-day peak, right now)`] : [`${resolvedTime.timeString} (${resolvedTime.periodLabelUs})`])
    : (period === 'lunch' ? [`${resolvedTime.timeString} (Créneau midi / pause déjeuner actuel)`] : [`${resolvedTime.timeString} (${resolvedTime.periodLabelFr})`]);

  const currentFanTimeLabel = isUs
    ? `${resolvedTime.timeString} — ${resolvedTime.periodLabelUs}`
    : `${resolvedTime.timeString} — ${resolvedTime.periodLabelFr}`;

  const tipText = isPaid
    ? (isUs
        ? `Recommended PPV tier: $${priceVal}. Daytime home clips convert +32% higher when anchored in real lunch/afternoon breaks.`
        : `Prix conseillé : ${priceVal}€. Les messages envoyés pendant la pause de midi avec un cadre naturel convertissent très fort.`)
    : (isUs
        ? `Free retention push: mid-day conversational sparks generate 3x more replies than evening cliches.`
        : `Push relationnel : les messages spontanés en milieu de journée obtiennent d'excellents retours car les fans sont sur leur téléphone.`);

  return {
    recommendations: {
      bestSendTimeFanTz: pickRandom(bestTimeWindows),
      currentFanLocalTime: currentFanTimeLabel,
      pricingTip: tipText,
      safetyAudit: isUs ? '100% compliant with OnlyFans & MYM TOS.' : 'Conforme aux chartes de contenus OnlyFans & MYM.'
    },
    variations
  };
}

// Helpers
function occStoryUs(occupation: string, isArt: boolean): string {
  if (isArt) return 'surrounded by my art prints and sketches';
  if (occupation) return 'finally taking a breather from work';
  return 'in my bedroom';
}

function isArt(theme: string): boolean {
  return theme.toLowerCase().includes('art');
}
