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

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

interface CreativeVibeGenerator {
  id: string;
  labelFr: string;
  labelUs: string;
  noteFr: string;
  noteUs: string;
  generateFr: (ctx: {
    em1: string;
    em2: string;
    period: string;
    locNote: string;
    isPaid: boolean;
    isOneLine: boolean;
    mediaContext?: string;
  }) => string;
  generateUs: (ctx: {
    em1: string;
    em2: string;
    period: string;
    locNote: string;
    isPaid: boolean;
    isOneLine: boolean;
    mediaContext?: string;
  }) => string;
}

// 16+ distinct creative generators to ensure total freedom and zero repetition
const CREATIVE_VIBES: CreativeVibeGenerator[] = [
  {
    id: 'pensee_impulsive',
    labelFr: 'Pensée impulsive',
    labelUs: 'Impulsive Thought',
    noteFr: 'Impulsion spontanée envoyée sur le vif sans filtre.',
    noteUs: 'Raw spontaneous thought sent on a whim without hesitation.',
    generateFr: ({ em1, period, isPaid, isOneLine }) => {
      if (period === 'morning') {
        const msg = `j'étais allongée dans mes draps et j'ai eu une pensée impulsive pour toi ${em1}`;
        return isPaid ? `${msg}${isOneLine ? '' : '\n\ndébloque pour voir ce que je portais à ce moment-là'}` : msg;
      }
      if (period === 'lunch') {
        const msg = `en plein milieu de ma journée, j'ai eu un flash soudain en repensant à toi ${em1}`;
        return isPaid ? `${msg}${isOneLine ? '' : '\n\nclique en dessous pour voir ce qui m\'a traversé l\'esprit'}` : msg;
      }
      if (period === 'afternoon') {
        const msg = `petite pensée venue de nulle part pendant que je traînais sur mon lit ${em1}`;
        return isPaid ? `${msg}${isOneLine ? '' : '\n\nj\'ai capturé l\'instant, débloque pour voir'}` : msg;
      }
      if (period === 'evening') {
        const msg = `je me suis affalée sur mon lit et ton nom est directement revenu dans ma tête ${em1}`;
        return isPaid ? `${msg}${isOneLine ? '' : '\n\nregarde dans quelle tenue je t\'écris'}` : msg;
      }
      const msg = `insomnie imprévue sous ma couette, j'avais envie de t'écrire sans réfléchir ${em1}`;
      return isPaid ? `${msg}${isOneLine ? '' : '\n\nclique pour me rejoindre sous les draps'}` : msg;
    },
    generateUs: ({ em1, period, isPaid, isOneLine }) => {
      if (period === 'morning') {
        const msg = `spontaneous morning thought while tangled up in my sheets thinking about you ${em1}`;
        return isPaid ? `${msg}${isOneLine ? '' : '\n\ntap below to see what I was wearing'}` : msg;
      }
      if (period === 'lunch') {
        const msg = `middle of the day and you randomly crossed my mind out of nowhere ${em1}`;
        return isPaid ? `${msg}${isOneLine ? '' : '\n\nunlock to see what I just recorded'}` : msg;
      }
      const msg = `sitting on my bedroom floor with a sudden urge to message you ${em1}`;
      return isPaid ? `${msg}${isOneLine ? '' : '\n\ntap to see what nobody else sees'}` : msg;
    }
  },
  {
    id: 'detail_troublant',
    labelFr: 'Détail troublant',
    labelUs: 'Sheer Detail',
    noteFr: 'Focalisation sur la transparence, le tissu ou la lumière sur la peau.',
    noteUs: 'Focusing on transparent fabric, skin texture, and soft light.',
    generateFr: ({ em1, period, isPaid, isOneLine }) => {
      if (period === 'lunch') {
        const msg = `le soleil de midi tape en plein sur mon lit et ce tissu est dangereusement transparent ${em1}`;
        return isPaid ? `${msg}${isOneLine ? '' : '\n\ndébloque pour voir le résultat en pleine lumière'}` : msg;
      }
      if (period === 'morning') {
        const msg = `la lumière du matin traverse directement ma nuisette en soie ${em1}`;
        return isPaid ? `${msg}${isOneLine ? '' : '\n\nclique pour voir le rendu sans aucun filtre'}` : msg;
      }
      const msg = `cette dentelle est tellement fine qu'elle ne cache pratiquement rien ${em1}`;
      return isPaid ? `${msg}${isOneLine ? '' : '\n\ndébloque avant que je me rhabille'}` : msg;
    },
    generateUs: ({ em1, period, isPaid, isOneLine }) => {
      if (period === 'lunch') {
        const msg = `daylight streaming through my blinds makes this lace completely see-through ${em1}`;
        return isPaid ? `${msg}${isOneLine ? '' : '\n\ntap to unlock the full daylight clip'}` : msg;
      }
      const msg = `this silk is way too sheer to be worn in polite company ${em1}`;
      return isPaid ? `${msg}${isOneLine ? '' : '\n\nunlock below to see what I mean'}` : msg;
    }
  },
  {
    id: 'pique_complice',
    labelFr: 'Pique complice',
    labelUs: 'Playful Tease',
    noteFr: 'Provocation douce et taquinerie complice qui pique l\'orgueil.',
    noteUs: 'Playful jab and light dare that challenges the fan.',
    generateFr: ({ em2, isPaid, isOneLine }) => {
      const msg = pickRandom([
        `je parie tout ce que tu veux que t'aurais zéro self-control devant moi là maintenant ${em2}`,
        `tu fais le timide mais je sais exactement ce que tu te dis en voyant ça ${em2}`,
        `sois honnête deux secondes, tu tiendrais combien de minutes avec moi dans cette pièce ? ${em2}`
      ]);
      return isPaid ? `${msg}${isOneLine ? '' : '\n\nviens tester ta résistance, débloque en dessous'}` : msg;
    },
    generateUs: ({ em2, isPaid, isOneLine }) => {
      const msg = pickRandom([
        `bet you couldn't last five minutes in this room right now without losing your composure ${em2}`,
        `admit it, you were not ready for this on your feed today ${em2}`,
        `testing your self-control right now... let's see if you can look away ${em2}`
      ]);
      return isPaid ? `${msg}${isOneLine ? '' : '\n\ntap below to test yourself'}` : msg;
    }
  },
  {
    id: 'pause_volee',
    labelFr: 'Pause volée',
    labelUs: 'Stolen Pause',
    noteFr: 'Micro-scène intimiste volée au milieu de sa journée.',
    noteUs: 'Intimate private break stolen during the day.',
    generateFr: ({ em1, period, locNote, isPaid, isOneLine }) => {
      if (period === 'lunch') {
        const msg = `pause déjeuner volée ${locNote} : j'ai fermé la porte à clé pour être tranquille en sous-vêtements ${em1}`;
        return isPaid ? `${msg}${isOneLine ? '' : '\n\nclique pour voir ce que je faisais pendant ma coupure'}` : msg;
      }
      const msg = `petite coupure bien méritée, assise par terre sur mon tapis en tenue très légère ${em1}`;
      return isPaid ? `${msg}${isOneLine ? '' : '\n\ndébloque pour partager cette pause avec moi'}` : msg;
    },
    generateUs: ({ em1, period, isPaid, isOneLine }) => {
      if (period === 'lunch') {
        const msg = `stole away into my room for a quick mid-day break with the door locked ${em1}`;
        return isPaid ? `${msg}${isOneLine ? '' : '\n\ntap to see my private lunch break view'}` : msg;
      }
      const msg = `taking five quiet minutes at home completely unwound in soft silk ${em1}`;
      return isPaid ? `${msg}${isOneLine ? '' : '\n\nunlock to join my little pause'}` : msg;
    }
  },
  {
    id: 'reflet_miroir',
    labelFr: 'Reflet complice',
    labelUs: 'Mirror Check',
    noteFr: 'Moment devant le miroir en essayant une tenue ou en observant son reflet.',
    noteUs: 'Organic glance in the bedroom mirror trying on something sheer.',
    generateFr: ({ em1, isPaid, isOneLine }) => {
      const msg = pickRandom([
        `je viens de croiser mon reflet dans le miroir en enfilant ça... j'étais obligée de te montrer ${em1}`,
        `devant mon grand miroir, j'hésite à garder cette tenue ou à la faire glisser ${em1}`,
        `coup d'œil dans le miroir de ma chambre, la coupe est encore plus indécente de dos ${em1}`
      ]);
      return isPaid ? `${msg}${isOneLine ? '' : '\n\nclique en dessous pour voir le retour miroir sans filtre'}` : msg;
    },
    generateUs: ({ em1, isPaid, isOneLine }) => {
      const msg = pickRandom([
        `caught my own reflection in the full-length mirror and immediately thought of you ${em1}`,
        `looking at myself in the mirror wondering if this is too scandalous to leave on ${em1}`,
        `mirror check from behind... this cut doesn't leave anything to the imagination ${em1}`
      ]);
      return isPaid ? `${msg}${isOneLine ? '' : '\n\ntap below to unlock the mirror clip'}` : msg;
    }
  },
  {
    id: 'confidence_sans_filtre',
    labelFr: 'Confidence sans filtre',
    labelUs: 'Unfiltered Truth',
    noteFr: 'Aveu brut, direct et authentique qui crée une proximité immédiate.',
    noteUs: 'Candid and direct confession creating immediate emotional rapport.',
    generateFr: ({ em1, isPaid, isOneLine }) => {
      const msg = pickRandom([
        `j'ai une confession : je suis d'une humeur beaucoup trop indisciplinée aujourd'hui ${em1}`,
        `entre nous, j'avais zéro intention d'être sage en me levant ce matin ${em1}`,
        `je te confie ça parce que t'es le seul à qui j'ai envie d'envoyer ça sans gêne ${em1}`
      ]);
      return isPaid ? `${msg}${isOneLine ? '' : '\n\ndébloque pour voir jusqu\'où je suis allée'}` : msg;
    },
    generateUs: ({ em1, isPaid, isOneLine }) => {
      const msg = pickRandom([
        `unfiltered truth: I woke up in an unapologetically dangerous mood today ${em1}`,
        `to be completely candid with you, I was not planning on being well-behaved today ${em1}`,
        `sharing this raw because you're the one person I don't feel like filtering myself for ${em1}`
      ]);
      return isPaid ? `${msg}${isOneLine ? '' : '\n\ntap to see how unfiltered it gets'}` : msg;
    }
  },
  {
    id: 'frisson_spontane',
    labelFr: 'Frisson spontané',
    labelUs: 'Bedroom Spark',
    noteFr: 'Énergie électrique, chair de poule ou envie soudaine de contact.',
    noteUs: 'Sensual energy and sudden goosebumps in the bedroom.',
    generateFr: ({ em2, isPaid, isOneLine }) => {
      const msg = pickRandom([
        `chair de poule soudaine sur mes épaules... il fait frais dans la chambre mais j'ai chaud ${em2}`,
        `une sensation bizarre m'a prise d'un coup, j'avais juste besoin de partager cette tension ${em2}`,
        `le tissu glisse sur ma peau et ça me donne des envies qui ne sont pas très raisonnables ${em2}`
      ]);
      return isPaid ? `${msg}${isOneLine ? '' : '\n\nclique pour ressentir l\'ambiance avec moi'}` : msg;
    },
    generateUs: ({ em2, isPaid, isOneLine }) => {
      const msg = pickRandom([
        `sudden chills down my spine... the room is cool but my skin is burning up ${em2}`,
        `feeling an electric vibe out of nowhere and had to send this directly your way ${em2}`,
        `soft silk slipping against my skin making me think dangerous thoughts ${em2}`
      ]);
      return isPaid ? `${msg}${isOneLine ? '' : '\n\ntap below to feel the energy'}` : msg;
    }
  },
  {
    id: 'humeur_insolente',
    labelFr: 'Humeur insolente',
    labelUs: 'Cheeky Mood',
    noteFr: 'Attitude assumée, séduisante et pleine d\'assurance.',
    noteUs: 'Confident, playful, unapologetic energy.',
    generateFr: ({ em1, isPaid, isOneLine }) => {
      const msg = pickRandom([
        `humeur particulièrement insolente aujourd'hui, dis-moi si t'arrives à soutenir mon regard ${em1}`,
        `je sais que je devrais pas traîner dans cette tenue, mais honnêtement j'assume à 100% ${em1}`,
        `tu pensais que j'allais être sage ? c'est mal me connaître mon cœur ${em1}`
      ]);
      return isPaid ? `${msg}${isOneLine ? '' : '\n\ndébloque pour voir ce que ça donne en vidéo'}` : msg;
    },
    generateUs: ({ em1, isPaid, isOneLine }) => {
      const msg = pickRandom([
        `unapologetically cheeky today, let's see if you can hold eye contact with me ${em1}`,
        `I know I shouldn't be wandering around my room in this, but honestly I don't care ${em1}`,
        `did you honestly think I was going to behave today? think again babe ${em1}`
      ]);
      return isPaid ? `${msg}${isOneLine ? '' : '\n\ntap to see what happens when I misbehave'}` : msg;
    }
  },
  {
    id: 'tension_tactile',
    labelFr: 'Tension tactile',
    labelUs: 'Tactile Silk',
    noteFr: 'Description sensorielle de la matière, du toucher et des draps.',
    noteUs: 'Sensory focus on silk, touch, and bedding.',
    generateFr: ({ em1, isPaid, isOneLine }) => {
      const msg = pickRandom([
        `cette matière satinée glisse toute seule dès que je bouge d'un centimètre ${em1}`,
        `peau contre soie dans mes draps défaits, le contraste est juste irrésistible ${em1}`,
        `la bretelle a encore glissé... j'ai arrêté d'essayer de la remonter ${em1}`
      ]);
      return isPaid ? `${msg}${isOneLine ? '' : '\n\nclique pour voir le mouvement complet'}` : msg;
    },
    generateUs: ({ em1, isPaid, isOneLine }) => {
      const msg = pickRandom([
        `this satin strap slides off the second I move even an inch ${em1}`,
        `bare skin against soft tangled sheets, the contrast is impossible to ignore ${em1}`,
        `the strap gave up and slid all the way down... stopped trying to fix it ${em1}`
      ]);
      return isPaid ? `${msg}${isOneLine ? '' : '\n\ntap to unlock the full movement'}` : msg;
    }
  },
  {
    id: 'chuchotement_prive',
    labelFr: 'Chuchotement discret',
    labelUs: 'Private Whisper',
    noteFr: 'Ton intime et privilégié réservé au tête-à-tête.',
    noteUs: 'Quiet whisper reserved strictly for the two of you.',
    generateFr: ({ em1, isPaid, isOneLine }) => {
      const msg = pickRandom([
        `un petit chuchotement juste pour toi, garde ça précieusement dans notre bulle 🤍`,
        `je baisse la voix et je te montre ce que personne d'autre ne verra aujourd'hui ${em1}`,
        `un petit bout de moi réservé strictement pour tes yeux 🤍`
      ]);
      return isPaid ? `${msg}${isOneLine ? '' : '\n\ndébloque pour écouter et regarder'}` : msg;
    },
    generateUs: ({ em1, isPaid, isOneLine }) => {
      const msg = pickRandom([
        `a quiet little whisper just for you, keep this tucked away in our chat 🤍`,
        `dropping my voice to show you what nobody else gets to witness today ${em1}`,
        `a little piece of my day saved strictly for your eyes only 🤍`
      ]);
      return isPaid ? `${msg}${isOneLine ? '' : '\n\ntap below to unlock this private whisper'}` : msg;
    }
  },
  {
    id: 'petit_imprevu',
    labelFr: 'Petit imprévu complice',
    labelUs: 'Little Slip-Up',
    noteFr: 'Scène spontanée, serviette qui glisse, robe dénouée sur le vif.',
    noteUs: 'Spontaneous little moment, towel slip or robe coming undone.',
    generateFr: ({ em1, isPaid, isOneLine }) => {
      const msg = pickRandom([
        `la serviette a glissé toute seule quand je me suis retournée... j'ai rougi devant la caméra 🙈`,
        `le nœud s'est défait sans prévenir en plein enregistrement... regarde ma tête ${em1}`,
        `j'ai voulu faire la fille sage et tout est parti en vrille en deux secondes 🙈`
      ]);
      return isPaid ? `${msg}${isOneLine ? '' : '\n\nclique en dessous pour voir la séquence non coupée'}` : msg;
    },
    generateUs: ({ em1, isPaid, isOneLine }) => {
      const msg = pickRandom([
        `towel completely dropped the moment I turned around... blushed at the camera 🙈`,
        `the knot slipped open out of nowhere while recording... you have to see this ${em1}`,
        `tried to act innocent and everything unravelled in two seconds 🙈`
      ]);
      return isPaid ? `${msg}${isOneLine ? '' : '\n\ntap to see the unedited footage'}` : msg;
    }
  },
  {
    id: 'regard_privilegie',
    labelFr: 'Regard indiscret',
    labelUs: 'Sneak Peek',
    noteFr: 'Offre d\'une perspective intime que personne d\'autre n\'a le droit de voir.',
    noteUs: 'Exclusive perspective into her private world.',
    generateFr: ({ em1, isPaid, isOneLine }) => {
      const msg = pickRandom([
        `personne ne me voit sous cet angle à part toi, profite de la vue mon cœur ${em1}`,
        `un point de vue indiscret que j'ai filmé spécialement pour te faire saliver ${em1}`,
        `si quelqu'un ouvrait la porte maintenant, je serais dans de beaux draps... regarde ${em1}`
      ]);
      return isPaid ? `${msg}${isOneLine ? '' : '\n\ndébloque pour avoir la vue complète'}` : msg;
    },
    generateUs: ({ em1, isPaid, isOneLine }) => {
      const msg = pickRandom([
        `nobody gets to see me from this perspective except you, enjoy the view ${em1}`,
        `a private angle I recorded just to see what you'd say ${em1}`,
        `if someone walked in right now I would be in so much trouble... take a look ${em1}`
      ]);
      return isPaid ? `${msg}${isOneLine ? '' : '\n\ntap below to get the full view'}` : msg;
    }
  },
  {
    id: 'lacher_prise',
    labelFr: 'Lâcher-prise total',
    labelUs: 'Total Abandon',
    noteFr: 'Détente complète, abandonnée sur le lit sans tension.',
    noteUs: 'Completely relaxed and sprawled out with zero tension.',
    generateFr: ({ em1, isPaid, isOneLine }) => {
      const msg = pickRandom([
        `allongée de tout mon long en étoile sur le lit, flemme totale de faire semblant ${em1}`,
        `lâcher-prise complet sur mes draps, je n'ai absolument rien remis sur moi ${em1}`,
        `détente absolue à la maison... viens t'allonger à côté de moi ${em1}`
      ]);
      return isPaid ? `${msg}${isOneLine ? '' : '\n\nclique pour voir comment je suis installée'}` : msg;
    },
    generateUs: ({ em1, isPaid, isOneLine }) => {
      const msg = pickRandom([
        `sprawled out completely across my bed with zero energy to pretend ${em1}`,
        `total relaxation in my sheets, didn't bother putting anything back on ${em1}`,
        `absolute slow cozy afternoon... wish you were sprawled next to me ${em1}`
      ]);
      return isPaid ? `${msg}${isOneLine ? '' : '\n\ntap to see how comfortable I am'}` : msg;
    }
  },
  {
    id: 'curiosite_vive',
    labelFr: 'Curiosité vive',
    labelUs: 'Bold Curiosity',
    noteFr: 'Interpellation franche sans question bateau.',
    noteUs: 'Direct observation sparking intense back-and-forth.',
    generateFr: ({ em1, isPaid, isOneLine }) => {
      const msg = pickRandom([
        `je me demande quelle tête tu ferais si j'ouvrais la porte dans cette tenue ${em1}`,
        `avoue que c'est exactement le genre de surprise que t'espérais recevoir aujourd'hui ${em1}`,
        `dis-moi tout de suite ce qui t'attire en premier quand tu regardes ça ${em1}`
      ]);
      return isPaid ? `${msg}${isOneLine ? '' : '\n\ndébloque pour voir la tenue en intégralité'}` : msg;
    },
    generateUs: ({ em1, isPaid, isOneLine }) => {
      const msg = pickRandom([
        `wondering what expression you'd make if I opened my front door wearing just this ${em1}`,
        `admit this is exactly what you were hoping would pop up on your screen today ${em1}`,
        `tell me the very first thing your eyes land on when you look at this ${em1}`
      ]);
      return isPaid ? `${msg}${isOneLine ? '' : '\n\ntap to unlock the whole outfit'}` : msg;
    }
  },
  {
    id: 'flash_sensuel',
    labelFr: 'Flash sensuel',
    labelUs: 'Sensual Flash',
    noteFr: 'Capture immédiate de l\'instant sur le coup de l\'émotion.',
    noteUs: 'Immediate snap taken on the spot in the heat of the moment.',
    generateFr: ({ em1, isPaid, isOneLine }) => {
      const msg = pickRandom([
        `un flash pris à l'instant sans poser, 100% naturel dans mon intimité ${em1}`,
        `enregistrement brut sans retouche, j'avais juste envie que tu me voies comme ça ${em1}`,
        `prise sur le fait dans ma chambre, regarde comme j'étais bien ${em1}`
      ]);
      return isPaid ? `${msg}${isOneLine ? '' : '\n\nclique pour voir le clip brut'}` : msg;
    },
    generateUs: ({ em1, isPaid, isOneLine }) => {
      const msg = pickRandom([
        `spontaneous raw flash taken right now without posing, 100% unfiltered ${em1}`,
        `unedited capture, just wanted you to see me exactly like this ${em1}`,
        `caught in the act in my bedroom, look how relaxed I feel ${em1}`
      ]);
      return isPaid ? `${msg}${isOneLine ? '' : '\n\ntap to see the raw clip'}` : msg;
    }
  },
  {
    id: 'instinct_brut',
    labelFr: 'Instinct brut',
    labelUs: 'Raw Instinct',
    noteFr: 'Message sans détour guidé par le pur instinct de séduction.',
    noteUs: 'Direct message guided by sheer playful instinct.',
    generateFr: ({ em2, isPaid, isOneLine }) => {
      const msg = pickRandom([
        `zéro filtre, zéro détours : j'avais juste envie de te faire craquer aujourd'hui ${em2}`,
        `mon instinct m'a dit de t'envoyer ça directement... et j'ai toujours raison ${em2}`,
        `je ne devrais probablement pas t'envoyer ça à cette heure-ci, mais tant pis 🫦`
      ]);
      return isPaid ? `${msg}${isOneLine ? '' : '\n\ndébloque avant que je regrette mon audace'}` : msg;
    },
    generateUs: ({ em2, isPaid, isOneLine }) => {
      const msg = pickRandom([
        `no filter, no games: I just felt like testing your resolve today ${em2}`,
        `instinct told me to send this right to you... and my gut is never wrong ${em2}`,
        `probably shouldn't be sending this right now, but too late 🫦`
      ]);
      return isPaid ? `${msg}${isOneLine ? '' : '\n\ntap before I regret being this bold'}` : msg;
    }
  }
];

export function generateDynamicPushVariations(params: DynamicEngineParams): {
  recommendations: GenerationResult['recommendations'];
  variations: GeneratedVariation[];
} {
  const {
    modelProfile,
    language = 'fr',
    mediaContext,
    priceSuggestion = 15,
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
  const emojis = modelProfile?.favoriteEmojis && modelProfile.favoriteEmojis.length > 0 
    ? modelProfile.favoriteEmojis 
    : ['✨', '🫦', '🤍', '🙈'];

  const em1 = pickRandom(emojis);
  const em2 = pickRandom(emojis.filter(e => e !== em1).concat(['🫦', '✨', '🤍']));
  const priceVal = priceSuggestion || 15;
  const period = resolvedTime.period; // 'morning' | 'lunch' | 'afternoon' | 'evening' | 'late_night'

  const locNoteFr = location ? `ici ${location.toLowerCase().startsWith('dans') ? location : 'dans ' + location}` : 'à la maison';
  const locNoteUs = location ? `here in ${location}` : 'back home';

  // 1. Shuffle creative vibes so no 2 generations are ever in the same order or feature the same rigid template
  const shuffledVibes = shuffle(CREATIVE_VIBES).slice(0, 6);

  // Price tier distribution for varied PPV options (e.g. standard, discount, premium, etc.)
  const priceOffsets = [0, -3, 2, -1, 4, 1];

  const variations: GeneratedVariation[] = shuffledVibes.map((vibe, idx) => {
    const rawMessage = isUs
      ? vibe.generateUs({
          em1,
          em2,
          period,
          locNote: locNoteUs,
          isPaid,
          isOneLine,
          mediaContext
        })
      : vibe.generateFr({
          em1,
          em2,
          period,
          locNote: locNoteFr,
          isPaid,
          isOneLine,
          mediaContext
        });

    const tierPrice = Math.max(8, priceVal + (priceOffsets[idx] || 0));
    const priceStr = isPaid ? (isUs ? `$${tierPrice}` : `${tierPrice}€`) : 'Gratuit';

    return {
      id: `var-${Date.now()}-${idx + 1}-${Math.random().toString(36).substring(2, 6)}`,
      angle: vibe.id as any,
      angleLabel: isUs ? vibe.labelUs : vibe.labelFr,
      message: rawMessage,
      estimatedOpenRate: `${randomInt(88, 97)}%`,
      suggestedPrice: priceStr,
      mediaNotice: isPaid ? (mediaContext || 'Vidéo solo chambre') : 'Offert / DM',
      timeContextNote: isUs ? vibe.noteUs : vibe.noteFr
    };
  });

  const bestTimeWindows = isUs
    ? (period === 'lunch' ? [`${resolvedTime.timeString} (Mid-day peak right now)`] : [`${resolvedTime.timeString} (${resolvedTime.periodLabelUs})`])
    : (period === 'lunch' ? [`${resolvedTime.timeString} (Créneau de midi en direct)`] : [`${resolvedTime.timeString} (${resolvedTime.periodLabelFr})`]);

  const currentFanTimeLabel = isUs
    ? `${resolvedTime.timeString} — ${resolvedTime.periodLabelUs}`
    : `${resolvedTime.timeString} — ${resolvedTime.periodLabelFr}`;

  const tipText = isPaid
    ? (isUs
        ? `Optimal PPV tier around $${priceVal}. Varied psychological triggers avoid push fatigue and boost unlock CTR.`
        : `Tarification suggérée : ${priceVal}€. Varier les propositions sans angle rigide évite la lassitude et décuple les déblocages.`)
    : (isUs
        ? `Free engagement push: organic spontaneous conversation starters spark 3x more fan replies.`
        : `Message relationnel offert : des propositions imprévisibles et spontanées déclenchent 3x plus de réponses.`);

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
