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

// =========================================================================
// 1. POOL SPÉCIFIQUE : POSITIONS & ANGLES HOT (positions_hot)
// Questions directes, cambrures, levrette, au-dessus, angles torrides
// =========================================================================
const POSITIONS_VIBES: CreativeVibeGenerator[] = [
  {
    id: 'pos_dilemme_lit',
    labelFr: 'Dilemme de position',
    labelUs: 'Position Dilemma',
    noteFr: 'Force le fan à choisir immédiatement entre deux positions intimes.',
    noteUs: 'Forces the fan to instantly pick between two intimate positions.',
    generateFr: ({ em1, isPaid, isOneLine }) => {
      const msg = pickRandom([
        `question très indiscrète entre nous : t'es plutôt du genre à me vouloir cambrée sur le lit ou bien au-dessus à mon rythme ? ${em1}`,
        `avoue sans réfléchir : tu préfères me prendre par surprise de dos ou me regarder dans les yeux au-dessus de toi ? ${em1}`,
        `dilemme express : levrette cambrée contre les oreillers ou missionnaire très serré ? J'attends ta réponse 🫦`
      ]);
      return isPaid ? `${msg}${isOneLine ? '' : '\n\ndébloque pour voir ma position préférée en action'}` : msg;
    },
    generateUs: ({ em1, isPaid, isOneLine }) => {
      const msg = pickRandom([
        `quick indiscreet question: would you rather have me arched over the bed or riding on top setting the pace? ${em1}`,
        `be honest right now: taken from behind by surprise, or pinned looking into each other's eyes? ${em1}`,
        `dilemma for you: arched against the pillows or pressed close together? tell me your pick 🫦`
      ]);
      return isPaid ? `${msg}${isOneLine ? '' : '\n\nunlock to see my absolute favorite position'}` : msg;
    }
  },
  {
    id: 'pos_cambrure_draps',
    labelFr: 'Cambrure sur les draps',
    labelUs: 'Arched on the Sheets',
    noteFr: 'Mise en avant visuelle d\'une cambrure provocante sur le lit.',
    noteUs: 'Visual focus on a tempting arch sprawled across the bed.',
    generateFr: ({ em1, isPaid, isOneLine }) => {
      const msg = pickRandom([
        `cette cambrure sur mes draps... je crois que c'est l'angle où je suis le plus à mon avantage, regarde ${em1}`,
        `à quatre pattes sur le matelas avec ce regard par-dessus mon épaule... impossible de ne pas craquer ${em1}`,
        `regarde cette cambrure... j'étais installée comme ça en t'attendant dans mes draps 🫦`
      ]);
      return isPaid ? `${msg}${isOneLine ? '' : '\n\nclique pour voir le mouvement complet'}` : msg;
    },
    generateUs: ({ em1, isPaid, isOneLine }) => {
      const msg = pickRandom([
        `this arch against my sheets... pretty sure this is the angle that shows off my curves best, take a look ${em1}`,
        `hands and knees on the mattress giving you that over-the-shoulder look... you wouldn't resist ${em1}`,
        `look at that arch... stretched out across the sheets thinking about you 🫦`
      ]);
      return isPaid ? `${msg}${isOneLine ? '' : '\n\ntap to watch the full movement unfold'}` : msg;
    }
  },
  {
    id: 'pos_au_dessus',
    labelFr: 'Défi au-dessus',
    labelUs: 'Riding Challenge',
    noteFr: 'Scénario dominant où la créatrice prend les rênes.',
    noteUs: 'Dominant scenario where she takes total control.',
    generateFr: ({ em1, isPaid, isOneLine }) => {
      const msg = pickRandom([
        `si j'étais au-dessus de toi maintenant avec ce regard, combien de secondes avant que tu perdes le contrôle ? ${em1}`,
        `j'aime avoir le contrôle et décider du rythme... regarde comment je m'installe au-dessus 🫦`,
        `cavalière sans pitié : dis-moi si t'arriverais à tenir plus de deux minutes face à moi ${em1}`
      ]);
      return isPaid ? `${msg}${isOneLine ? '' : '\n\ndébloque pour voir la démonstration complète'}` : msg;
    },
    generateUs: ({ em1, isPaid, isOneLine }) => {
      const msg = pickRandom([
        `if I was on top of you right now looking at you like this, how many seconds until you lose control? ${em1}`,
        `I like being on top and setting the tempo... watch how I move 🫦`,
        `riding on top with zero mercy: honestly tell me if you could last more than two minutes ${em1}`
      ]);
      return isPaid ? `${msg}${isOneLine ? '' : '\n\nunlock to see the full demo in action'}` : msg;
    }
  },
  {
    id: 'pos_prise_surprise',
    labelFr: 'Prise par surprise',
    labelUs: 'Taken from Behind',
    noteFr: 'Perspective de dos qui déclenche l\'imaginaire tactile.',
    noteUs: 'Rear-view perspective sparking tactile anticipation.',
    generateFr: ({ em1, isPaid, isOneLine }) => {
      const msg = pickRandom([
        `filmée de dos sous mon angle le plus chaud... dis-moi ce que tu ferais si tu arrivais derrière moi maintenant ${em1}`,
        `prise par surprise au bord du lit... cette vue de dos me rend complètement folle, regarde 🫦`,
        `regarde bien cet angle arrière : t'attrapes mes hanches ou mes cheveux en premier ? ${em1}`
      ]);
      return isPaid ? `${msg}${isOneLine ? '' : '\n\nclique pour débloquer la vue intégrale'}` : msg;
    },
    generateUs: ({ em1, isPaid, isOneLine }) => {
      const msg = pickRandom([
        `recorded from behind at my hottest angle... tell me what you'd do if you caught me like this right now ${em1}`,
        `bent right over the edge of the mattress... this rear view leaves zero doubt, take a look 🫦`,
        `watch this angle closely: do your hands go for my hips or my hair first? ${em1}`
      ]);
      return isPaid ? `${msg}${isOneLine ? '' : '\n\ntap below to unlock the uncropped view'}` : msg;
    }
  },
  {
    id: 'pos_angle_plongeant',
    labelFr: 'Angle plongeant torride',
    labelUs: 'Steep Top-Down Angle',
    noteFr: 'Prise de vue subjective du dessus donnant l\'impression d\'être en tête-à-tête.',
    noteUs: 'POV overhead perspective giving the sensation of being right there.',
    generateFr: ({ em1, isPaid, isOneLine }) => {
      const msg = pickRandom([
        `cet angle plongeant quand je suis à genoux sur le lit... personne d'autre ne m'a jamais vue sous cette perspective ${em1}`,
        `vue subjective directe : imagine exactement ce que tu verrais si tu te tenais debout juste devant moi 🫦`,
        `regarde d'en haut ce que ça donne quand je te regarde avec cette envie... ${em1}`
      ]);
      return isPaid ? `${msg}${isOneLine ? '' : '\n\ndébloque pour profiter du POV exclusif'}` : msg;
    },
    generateUs: ({ em1, isPaid, isOneLine }) => {
      const msg = pickRandom([
        `this steep top-down angle on my knees... nobody else gets this private perspective ${em1}`,
        `pure POV view: picture exactly what you'd see standing right in front of me 🫦`,
        `look down at what this looks like when I look up at you with this hunger... ${em1}`
      ]);
      return isPaid ? `${msg}${isOneLine ? '' : '\n\nunlock to experience the full POV clip'}` : msg;
    }
  },
  {
    id: 'pos_aveu_secret',
    labelFr: 'Aveu sur mes préférences',
    labelUs: 'My Secret Preference',
    noteFr: 'Confidence sur ce qui fait le plus gémir la créatrice.',
    noteUs: 'Intimate confession about what gets her breathing heavy.',
    generateFr: ({ em1, isPaid, isOneLine }) => {
      const msg = pickRandom([
        `je te dis ma position secrète où je ne résiste jamais plus de 30 secondes si tu me promets de ne le répéter à personne 🫦`,
        `y a une façon bien précise de me tenir qui me fait perdre tout contrôle... regarde comment je me cambre ${em1}`,
        `avoue que tu te demandes souvent comment je bouge quand la porte est fermée à double tour... la réponse ici 🫦`
      ]);
      return isPaid ? `${msg}${isOneLine ? '' : '\n\nclique pour voir la vidéo secrète'}` : msg;
    },
    generateUs: ({ em1, isPaid, isOneLine }) => {
      const msg = pickRandom([
        `I'll whisper the exact position I can never resist for more than 30 seconds if you swear not to share it 🫦`,
        `there is one specific way of gripping my hips that makes me lose all control... watch this arch ${em1}`,
        `admit you always wondered how I move once the bedroom door is locked... see the proof right here 🫦`
      ]);
      return isPaid ? `${msg}${isOneLine ? '' : '\n\ntap to play the private clip'}` : msg;
    }
  }
];

// =========================================================================
// 2. POOL SPÉCIFIQUE : CORPS & DÉTAILS SANS FILTRE (body_explicit)
// Poitrine, seins, fesses, cul moulé, dentelle transparente, peau humide
// =========================================================================
const BODY_VIBES: CreativeVibeGenerator[] = [
  {
    id: 'body_poitrine_zoom',
    labelFr: 'Zoom poitrine & décolleté',
    labelUs: 'Chest & Cleavage Focus',
    noteFr: 'Focalisation ultra-sensuelle sur les courbes de la poitrine sans pudeur.',
    noteUs: 'Sensual focus highlighting curves and cleavage with zero hesitation.',
    generateFr: ({ em1, isPaid, isOneLine }) => {
      const msg = pickRandom([
        `cette dentelle est tellement fine que mes seins débordent presque... regarde comme ils sont lourds et sensibles aujourd'hui ${em1}`,
        `zoom direct sur ma poitrine : avoue que c'est le premier endroit où tes yeux se posent quand tu me regardes 🫦`,
        `j'ai enlevé le soutien-gorge juste pour sentir l'air frais sur ma peau... regarde ce décolleté plongeant ${em1}`
      ]);
      return isPaid ? `${msg}${isOneLine ? '' : '\n\ndébloque pour le plan rapproché sans filtre'}` : msg;
    },
    generateUs: ({ em1, isPaid, isOneLine }) => {
      const msg = pickRandom([
        `this lace is so sheer my chest is basically spilling out... look how sensitive they are right now ${em1}`,
        `close-up focus on my chest: be honest, it's the exact spot your eyes land on first 🫦`,
        `took the bra completely off just to feel cool air against my skin... look at this plunge ${em1}`
      ]);
      return isPaid ? `${msg}${isOneLine ? '' : '\n\nunlock to see the unedited close-up'}` : msg;
    }
  },
  {
    id: 'body_fesses_moulees',
    labelFr: 'Cambrure & fesses moulées',
    labelUs: 'Arched Peach Curves',
    noteFr: 'Gros plan sur le fessier et le galbe des hanches.',
    noteUs: 'Tight focus on hips, waist contour, and backside curves.',
    generateFr: ({ em1, isPaid, isOneLine }) => {
      const msg = pickRandom([
        `ce bas est tellement échancré qu'on voit absolument tout mon cul... j'attendais ton avis avant de tout retirer 🫦`,
        `regarde ce galbe de dos : j'ai passé 10 minutes devant mon miroir à admirer mes fesses dans cette matière ${em1}`,
        `cambrée devant le miroir... ce shorty ne cache absolument rien, dis-moi si tu valides la vue arrière 🫦`
      ]);
      return isPaid ? `${msg}${isOneLine ? '' : '\n\nclique pour voir la cambrure en mouvement'}` : msg;
    },
    generateUs: ({ em1, isPaid, isOneLine }) => {
      const msg = pickRandom([
        `this thong is cut so high it covers basically none of my peach... wanted your opinion before peeling it off 🫦`,
        `look at this curve from behind: caught myself staring in the mirror at how tight it looks ${em1}`,
        `arched in front of the mirror... these bottoms conceal zero, tell me if you approve 🫦`
      ]);
      return isPaid ? `${msg}${isOneLine ? '' : '\n\ntap to watch the slow turn in motion'}` : msg;
    }
  },
  {
    id: 'body_dentelle_transparente',
    labelFr: 'Dentelle ultra-transparente',
    labelUs: 'Sheer See-Through Lace',
    noteFr: 'Matière suggestive où la translucidité laisse deviner chaque détail.',
    noteUs: 'Suggestive sheer texture that leaves nothing to guesswork.',
    generateFr: ({ em1, isPaid, isOneLine }) => {
      const msg = pickRandom([
        `j'ai commandé cette lingerie mais le tissu est 100% transparent sous la lumière... on voit absolument chaque détail ${em1}`,
        `regarde bien à travers le tissu : pas besoin de faire semblant, tu vois parfaitement où s'arrête la dentelle 🫦`,
        `je teste cet ensemble sans rien en dessous... la transparence est indécente mais je te la montre quand même ${em1}`
      ]);
      return isPaid ? `${msg}${isOneLine ? '' : '\n\ndébloque pour voir à travers la lumière'}` : msg;
    },
    generateUs: ({ em1, isPaid, isOneLine }) => {
      const msg = pickRandom([
        `ordered this set online but under the lamp light it is 100% see-through... every single curve shows ${em1}`,
        `look closely through the sheer mesh: zero need to guess, you can see every single detail 🫦`,
        `trying this set with absolutely nothing underneath... ridiculously revealing but I wanted to show you ${em1}`
      ]);
      return isPaid ? `${msg}${isOneLine ? '' : '\n\nunlock to catch the full transparent view'}` : msg;
    }
  },
  {
    id: 'body_peau_sensible',
    labelFr: 'Frisson sur la peau',
    labelUs: 'Goosebumps on Skin',
    noteFr: 'Détail tactile intime qui évoque le toucher et la chaleur du corps.',
    noteUs: 'Tactile detail evoking warmth, texture, and immediate touch.',
    generateFr: ({ em1, isPaid, isOneLine }) => {
      const msg = pickRandom([
        `ma peau est toute brûlante et j'ai des frissons partout... regarde ce qui arrive quand je passe ma main doucement ${em1}`,
        `regarde comme ma peau réagit dès que je caresse mes hanches... j'aimerais que ce soient tes doigts à la place 🫦`,
        `détail troublant : j'ai la chair de poule sur tout le décolleté tellement l'envie est montée d'un coup ${em1}`
      ]);
      return isPaid ? `${msg}${isOneLine ? '' : '\n\nclique pour voir le ralenti intime'}` : msg;
    },
    generateUs: ({ em1, isPaid, isOneLine }) => {
      const msg = pickRandom([
        `my skin is burning up and I've got goosebumps everywhere... watch what happens when my hand glides down ${em1}`,
        `look how my skin reacts the second I touch my hips... wish it was your hands instead 🫦`,
        `troubling detail: visible goosebumps all across my chest because the temperature spiked out of nowhere ${em1}`
      ]);
      return isPaid ? `${msg}${isOneLine ? '' : '\n\ntap to watch the slow touch up close'}` : msg;
    }
  },
  {
    id: 'body_sans_culotte',
    labelFr: 'Sans rien en dessous',
    labelUs: 'Nothing Underneath',
    noteFr: 'Révélation coquine sur l\'absence totale de sous-vêtement.',
    noteUs: 'Teasing confession revealing total absence of undergarments.',
    generateFr: ({ em1, isPaid, isOneLine }) => {
      const msg = pickRandom([
        `petite confidence : sous cette robe légère je ne porte strictement rien du tout... pas même une culotte 🫦`,
        `j'ai retiré le bas il y a dix minutes, c'est tellement plus agréable sur mes draps... regarde par toi-même ${em1}`,
        `zéro culotte, zéro barrière : j'avais juste envie d'être totalement libre et dénudée pour toi ce soir 🫦`
      ]);
      return isPaid ? `${msg}${isOneLine ? '' : '\n\ndébloque avant que je me rhabille'}` : msg;
    },
    generateUs: ({ em1, isPaid, isOneLine }) => {
      const msg = pickRandom([
        `little secret: under this loose slip dress I am wearing literally nothing... not even panties 🫦`,
        `slipped the bottoms off ten minutes ago, feels way too good against the sheets... see for yourself ${em1}`,
        `zero panties, zero barriers: just felt like being completely bare for you right now 🫦`
      ]);
      return isPaid ? `${msg}${isOneLine ? '' : '\n\ntap to see what is hidden underneath'}` : msg;
    }
  },
  {
    id: 'body_vue_sans_filtre',
    labelFr: 'Vue anatomique sans filtre',
    labelUs: 'Raw Anatomical Curves',
    noteFr: 'Déclaration directe montrant son corps sous sa forme la plus pure et torride.',
    noteUs: 'Unapologetic framing showing her body at its purest, rawest aesthetic.',
    generateFr: ({ em1, isPaid, isOneLine }) => {
      const msg = pickRandom([
        `zéro filtre, zéro retouche : juste mes courbes brutes sous la lumière tamisée de ma chambre ${em1}`,
        `regarde bien chaque centimètre de cette vidéo... c'est le contenu le plus cru et intime que j'ai fait 🫦`,
        `dis-moi quelle partie de mon corps te rend le plus fou quand tu me regardes sans aucun artifice ${em1}`
      ]);
      return isPaid ? `${msg}${isOneLine ? '' : '\n\nclique pour débloquer la vidéo sans censure'}` : msg;
    },
    generateUs: ({ em1, isPaid, isOneLine }) => {
      const msg = pickRandom([
        `zero filters, zero edits: just my raw curves in the soft light of my bedroom ${em1}`,
        `look at every single inch of this video... easily the most intimate, unfiltered clip I've captured 🫦`,
        `tell me which curve makes you lose your mind most when you look at me with zero fabric in the way ${em1}`
      ]);
      return isPaid ? `${msg}${isOneLine ? '' : '\n\nunlock to stream the uncensored clip'}` : msg;
    }
  }
];

// =========================================================================
// 3. POOL SPÉCIFIQUE : FANTASMES & INTERDITS (fantasies_taboo)
// Désirs inavoués, pensées interdites, scénarios tabous, confessions intimes
// =========================================================================
const FANTASIES_VIBES: CreativeVibeGenerator[] = [
  {
    id: 'fan_confession_tabou',
    labelFr: 'Confession inavouable',
    labelUs: 'Taboo Confession',
    noteFr: 'Aveu d\'un fantasme secret que personne d\'autre ne connaît.',
    noteUs: 'Confession of an unspoken fantasy nobody else knows about.',
    generateFr: ({ em1, isPaid, isOneLine }) => {
      const msg = pickRandom([
        `j'ai eu une pensée complètement interdite pour toi aujourd'hui que je n'oserais jamais dire à voix haute... ${em1}`,
        `y a un fantasme très précis qui me trotte dans la tête depuis ce matin avec toi... regarde ce que j'ai filmé en y pensant 🫦`,
        `promets-moi de garder ça strictement entre nous : voici ce que j'imagine quand je suis toute seule dans mon lit ${em1}`
      ]);
      return isPaid ? `${msg}${isOneLine ? '' : '\n\ndébloque pour entendre ma confession en entier'}` : msg;
    },
    generateUs: ({ em1, isPaid, isOneLine }) => {
      const msg = pickRandom([
        `had a completely forbidden thought about you earlier that I would never say out loud in public... ${em1}`,
        `there's one specific taboo fantasy playing on repeat in my mind with you... watch what I recorded while thinking of it 🫦`,
        `promise me this stays strictly between us: here is what plays in my head alone in bed ${em1}`
      ]);
      return isPaid ? `${msg}${isOneLine ? '' : '\n\nunlock to listen to my raw confession'}` : msg;
    }
  },
  {
    id: 'fan_scenario_seul',
    labelFr: 'Scénario porte fermée',
    labelUs: 'Locked Door Scenario',
    noteFr: 'Mise en situation immersive où rien n\'est interdit.',
    noteUs: 'Immersive private scenario where zero boundaries exist.',
    generateFr: ({ em1, isPaid, isOneLine }) => {
      const msg = pickRandom([
        `imagine une seconde : la porte de ma chambre est verrouillée, personne ne sait où on est... qu'est-ce que tu me fais en premier ? 🫦`,
        `si t'étais assis au bord de mon lit maintenant sans aucune règle... quelle est la première chose interdite que tu tentes ? ${em1}`,
        `scénario sans censure : on a 1 heure ensemble et tout est permis... dis-moi par quoi on commence 🫦`
      ]);
      return isPaid ? `${msg}${isOneLine ? '' : '\n\nclique pour voir comment la scène commence'}` : msg;
    },
    generateUs: ({ em1, isPaid, isOneLine }) => {
      const msg = pickRandom([
        `picture this: my bedroom door is locked, nobody knows where we are... what is the very first thing you do to me? 🫦`,
        `if you were sitting at the edge of my bed right now with zero rules... what forbidden thing would you try first? ${em1}`,
        `uncensored scenario: 1 full hour together and anything goes... tell me where we start 🫦`
      ]);
      return isPaid ? `${msg}${isOneLine ? '' : '\n\ntap to watch how the scenario begins'}` : msg;
    }
  },
  {
    id: 'fan_interdit_pulsion',
    labelFr: 'Pulsion interdite',
    labelUs: 'Forbidden Urge',
    noteFr: 'Impulsion soudaine capturée sur le vif.',
    noteUs: 'Sudden impulsive urge captured in real-time.',
    generateFr: ({ em1, isPaid, isOneLine }) => {
      const msg = pickRandom([
        `une pulsion complètement incontrôlable m'a traversé l'esprit... j'ai sorti la caméra avant d'avoir le temps d'hésiter ${em1}`,
        `je sais pertinemment que je ne devrais pas faire ça, mais l'interdit est ce qui m'excite le plus... regarde 🫦`,
        `c'est indécent et probablement trop osé, mais j'avais envie d'aller jusqu'au bout de mon envie ce soir ${em1}`
      ]);
      return isPaid ? `${msg}${isOneLine ? '' : '\n\ndébloque pour voir jusqu\'où je suis allée'}` : msg;
    },
    generateUs: ({ em1, isPaid, isOneLine }) => {
      const msg = pickRandom([
        `an uncontrollable forbidden urge hit me out of nowhere... turned the camera on before I could second-guess it ${em1}`,
        `I know I shouldn't be doing this, but the forbidden part is exactly what turns me on... take a look 🫦`,
        `probably way too daring, but I wanted to follow this impulse all the way to the end tonight ${em1}`
      ]);
      return isPaid ? `${msg}${isOneLine ? '' : '\n\nunlock to see just how far I went'}` : msg;
    }
  },
  {
    id: 'fan_question_indiscrete',
    labelFr: 'Question sur tes délires secrets',
    labelUs: 'Your Darkest Turn-On',
    noteFr: 'Interpellation directe sur les fantasmes secrets du fan.',
    noteUs: 'Direct probe into the fan\'s most private desires.',
    generateFr: ({ em1, isPaid, isOneLine }) => {
      const msg = pickRandom([
        `avoue-moi ton fantasme le plus tabou que tu n'as jamais osé demander à personne... je te promets zéro jugement 🫦`,
        `qu'est-ce qui te ferait craquer instantanément si je te le proposais en tête-à-tête ce soir ? Sois très honnête ${em1}`,
        `dis-moi le délire le plus sale auquel tu penses quand tu me regardes... je te dis si ça m'excite aussi 🫦`
      ]);
      return isPaid ? `${msg}${isOneLine ? '' : '\n\nclique pour voir mon propre fantasme en vidéo'}` : msg;
    },
    generateUs: ({ em1, isPaid, isOneLine }) => {
      const msg = pickRandom([
        `tell me your deepest taboo fantasy you've never dared ask anyone for... promise zero judgment from me 🫦`,
        `what would make you instantly lose your mind if I offered it to you behind closed doors? be brutally honest ${em1}`,
        `tell me the filthiest thought that crosses your head looking at me... I'll tell you if I share it 🫦`
      ]);
      return isPaid ? `${msg}${isOneLine ? '' : '\n\ntap to watch my own secret fantasy on video'}` : msg;
    }
  },
  {
    id: 'fan_jeu_de_role',
    labelFr: 'Scénario & jeu de rôle',
    labelUs: 'Roleplay Whispers',
    noteFr: 'Suggestion d\'un scénario complice où chacun joue un rôle piquant.',
    noteUs: 'Playful roleplay whisper sparking deep imagination.',
    generateFr: ({ em1, isPaid, isOneLine }) => {
      const msg = pickRandom([
        `ce soir on joue à un jeu : tu fais semblant de ne pas avoir le droit de me toucher pendant que je te provoque... regarde 🫦`,
        `règle du jeu : mains attachées ou interdiction totale de bouger pendant 5 minutes... tu tiendrais le coup ? ${em1}`,
        `un jeu de rôle improvisé dans ma chambre... regarde comment je prends l'avantage sur toi 🫦`
      ]);
      return isPaid ? `${msg}${isOneLine ? '' : '\n\ndébloque pour commencer la partie'}` : msg;
    },
    generateUs: ({ em1, isPaid, isOneLine }) => {
      const msg = pickRandom([
        `tonight we play a little game: you pretend you're not allowed to touch me while I tease you ruthlessly... watch 🫦`,
        `ground rules: hands tied or forbidden to move for 5 full minutes... honestly think you'd survive? ${em1}`,
        `improvised roleplay in my room... watch how easily I take total control over you 🫦`
      ]);
      return isPaid ? `${msg}${isOneLine ? '' : '\n\nunlock to enter the game'}` : msg;
    }
  },
  {
    id: 'fan_pensees_inavouees',
    labelFr: 'Pensée sans filtre au lit',
    labelUs: 'Raw Bed Confession',
    noteFr: 'Confidence torride murmurée dans les draps.',
    noteUs: 'Steamy confession whispered directly from the covers.',
    generateFr: ({ em1, isPaid, isOneLine }) => {
      const msg = pickRandom([
        `allongée seule dans mes draps avec des idées beaucoup trop chaudes... je te raconte exactement ce dont j'avais envie 🫦`,
        `cette vidéo contient mes confessions les plus sales... à n'ouvrir que si t'es prêt à voir mon vrai côté vicieux ${em1}`,
        `je n'ai jamais partagé ce délire avec personne d'autre... regarde ce que ça donne quand je me laisse complètement aller 🫦`
      ]);
      return isPaid ? `${msg}${isOneLine ? '' : '\n\nclique pour débloquer ma confession intime'}` : msg;
    },
    generateUs: ({ em1, isPaid, isOneLine }) => {
      const msg = pickRandom([
        `sprawled alone in my sheets having thoughts that are way too dirty... telling you exactly what I'm craving 🫦`,
        `this clip contains my most unapologetic thoughts... only unlock if you're ready for my unhinged side ${em1}`,
        `never shared this turn-on with anyone else before... see what happens when I let completely loose 🫦`
      ]);
      return isPaid ? `${msg}${isOneLine ? '' : '\n\ntap to unlock the raw confession'}` : msg;
    }
  }
];

// =========================================================================
// 4. POOL SPÉCIFIQUE : DIRTY TALK & PROVOCATION (dirty_talk)
// Langage cru, direct, brûlant, sans fausse pudeur
// =========================================================================
const DIRTY_TALK_VIBES: CreativeVibeGenerator[] = [
  {
    id: 'dt_provoc_directe',
    labelFr: 'Provocation brûlante',
    labelUs: 'Raw Provocation',
    noteFr: 'Attaque frontale qui excite immédiatement le fan.',
    noteUs: 'Direct challenge getting him heated up within seconds.',
    generateFr: ({ em1, isPaid, isOneLine }) => {
      const msg = pickRandom([
        `j'ai juste envie de te rendre complètement dingue ce soir... clique et dis-moi si t'arrives à regarder sans trembler 🫦`,
        `avoue que t'as déjà la tête qui tourne rien qu'en imaginant ce que je fais devant mon miroir... la preuve ici ${em1}`,
        `zéro filtre : j'ai une envie folle de te provoquer jusqu'à ce que tu sois incapable de penser à autre chose 🫦`
      ]);
      return isPaid ? `${msg}${isOneLine ? '' : '\n\ndébloque pour tester ta résistance'}` : msg;
    },
    generateUs: ({ em1, isPaid, isOneLine }) => {
      const msg = pickRandom([
        `I just want to drive you completely wild tonight... tap below and tell me if you can watch without losing it 🫦`,
        `admit your pulse is already racing just picturing what I'm doing in front of my mirror... proof right here ${em1}`,
        `zero filter: I crave teasing you until you can't focus on anything else today 🫦`
      ]);
      return isPaid ? `${msg}${isOneLine ? '' : '\n\nunlock to test your willpower'}` : msg;
    }
  },
  {
    id: 'dt_chuchotement_cru',
    labelFr: 'Chuchotement sans pudeur',
    labelUs: 'Spicy Whispers',
    noteFr: 'Mots crus dits à voix basse directement dans l\'oreille.',
    noteUs: 'Raw words whispered softly straight into his ear.',
    generateFr: ({ em1, isPaid, isOneLine }) => {
      const msg = pickRandom([
        `mets tes écouteurs et monte le son : j'ai enregistré mes soupirs et mes pensées les plus sales pour toi 🫦`,
        `j'étais toute seule dans le noir et ma main s'est égarée... écoute ce que je te dis en plein milieu ${em1}`,
        `un chuchotement direct à l'oreille qui va te coller des frissons partout... regarde ce que je fais en même temps 🫦`
      ]);
      return isPaid ? `${msg}${isOneLine ? '' : '\n\nclique pour écouter le vocal interdit'}` : msg;
    },
    generateUs: ({ em1, isPaid, isOneLine }) => {
      const msg = pickRandom([
        `put your headphones in and turn the volume all the way up: recorded my dirtiest whispers just for you 🫦`,
        `alone in the dark and my hand wandered where it shouldn't... listen to what I murmur halfway through ${em1}`,
        `whispering straight into your ear in a way that gives you full body chills... watch what my hands do simultaneously 🫦`
      ]);
      return isPaid ? `${msg}${isOneLine ? '' : '\n\ntap to listen with headphones on'}` : msg;
    }
  },
  {
    id: 'dt_excitation_brute',
    labelFr: 'Excitation incontrôlable',
    labelUs: 'Uncontrollable Heat',
    noteFr: 'Partage spontané d\'une montée de désir irrépressible.',
    noteUs: 'Spontaneous sharing of overwhelming sensual heat.',
    generateFr: ({ em1, isPaid, isOneLine }) => {
      const msg = pickRandom([
        `l'envie m'a prise d'un coup sans prévenir... je suis tellement mouillée que j'ai dû immortaliser ça pour toi 🫦`,
        `je n'en pouvais plus d'attendre dans ma chambre... viens voir exactement ce que j'ai fait pour me calmer ${em1}`,
        `c'est chaud, c'est direct et ça ne laisse aucune place au doute... regarde comment je me touche pour toi 🫦`
      ]);
      return isPaid ? `${msg}${isOneLine ? '' : '\n\ndébloque avant que la vidéo disparaisse'}` : msg;
    },
    generateUs: ({ em1, isPaid, isOneLine }) => {
      const msg = pickRandom([
        `the craving hit me out of nowhere... so dripping wet I literally had to capture it for you right away 🫦`,
        `couldn't hold back any longer in my bedroom... come see exactly what I did to cool myself off ${em1}`,
        `hot, raw, leaving zero room for interpretation... watch how I touch myself thinking of you 🫦`
      ]);
      return isPaid ? `${msg}${isOneLine ? '' : '\n\nunlock before this clip disappears'}` : msg;
    }
  },
  {
    id: 'dt_pique_ego',
    labelFr: 'Pique d\'ego provocatrice',
    labelUs: 'Ego Tease Challenge',
    noteFr: 'Défie la résistance et l\'endurance du fan.',
    noteUs: 'Directly dares his endurance and masculine composure.',
    generateFr: ({ em1, isPaid, isOneLine }) => {
      const msg = pickRandom([
        `t'es vraiment sûr d'être capable de regarder ça sans te toucher ? Faisons le pari 🫦`,
        `cette vidéo fait craquer 100% des mecs en moins d'une minute... dis-moi si t'es différent ou si tu cèdes comme les autres ${em1}`,
        `un défi pour toi : regarde cette minute entière les mains au-dessus de la couette si t'en as le courage 🫦`
      ]);
      return isPaid ? `${msg}${isOneLine ? '' : '\n\nclique pour relever le défi'}` : msg;
    },
    generateUs: ({ em1, isPaid, isOneLine }) => {
      const msg = pickRandom([
        `are you genuinely convinced you can watch this without touching yourself? let's make a bet 🫦`,
        `this clip breaks 100% of guys in under sixty seconds... tell me if you're built different or fold like the rest ${em1}`,
        `challenge for you: watch this full minute with your hands above the blankets if you have the discipline 🫦`
      ]);
      return isPaid ? `${msg}${isOneLine ? '' : '\n\ntap to accept the challenge'}` : msg;
    }
  },
  {
    id: 'dt_pari_indecent',
    labelFr: 'Pari indécent',
    labelUs: 'Indecent Bet',
    noteFr: 'Pari complice avec enjeu intime immédiat.',
    noteUs: 'Playful bet with high intimate stakes.',
    generateFr: ({ em1, isPaid, isOneLine }) => {
      const msg = pickRandom([
        `si tu débloques et que tu ne trouves pas que c'est ma vidéo la plus chaude, je te rembourse... mais tu sais déjà que je vais gagner 🫦`,
        `on fait un pari ? Tu m'envoies ta réaction en une seconde après avoir vu la fin de cette vidéo... prépare-toi ${em1}`,
        `j'ai misé gros sur ce clip : si tu ne perds pas tes moyens devant, c'est que tu mens 🫦`
      ]);
      return isPaid ? `${msg}${isOneLine ? '' : '\n\ndébloque pour valider le pari'}` : msg;
    },
    generateUs: ({ em1, isPaid, isOneLine }) => {
      const msg = pickRandom([
        `if you unlock this and honestly don't think it's my hottest clip ever, I'll refund you... but you already know I win 🫦`,
        `wanna place a bet? Send me your raw reaction the second you finish watching... get ready ${em1}`,
        `betting heavy on this one: if your jaw doesn't drop, you're blatantly lying 🫦`
      ]);
      return isPaid ? `${msg}${isOneLine ? '' : '\n\nunlock to seal the bet'}` : msg;
    }
  },
  {
    id: 'dt_instinct_animal',
    labelFr: 'Instinct brut sans filtre',
    labelUs: 'Unleashed Instinct',
    noteFr: 'Sensation animale et spontanée sans aucune pose.',
    noteUs: 'Unfiltered animalistic urge with zero rehearsed posing.',
    generateFr: ({ em1, isPaid, isOneLine }) => {
      const msg = pickRandom([
        `zéro manières, zéro filtre : j'avais juste une envie viscérale de te montrer ce qui se passe chez moi 🫦`,
        `mon corps réclame de l'attention et j'ai décidé que c'est toi qui allais en profiter... regarde ça tout de suite ${em1}`,
        `ce n'est pas une vidéo mignonne, c'est du pur désir brut sans compromis... à toi de voir si tu tiens le choc 🫦`
      ]);
      return isPaid ? `${msg}${isOneLine ? '' : '\n\nclique pour voir la vidéo intégrale'}` : msg;
    },
    generateUs: ({ em1, isPaid, isOneLine }) => {
      const msg = pickRandom([
        `zero manners, zero filters: just a raw primal urge to show you what goes down when I'm alone 🫦`,
        `my body is demanding attention and I decided you get full VIP access... look at this right now ${em1}`,
        `this isn't a cute little teaser, it's pure raw hunger... let's see if you can handle it 🫦`
      ]);
      return isPaid ? `${msg}${isOneLine ? '' : '\n\ntap to watch the uncut clip'}` : msg;
    }
  }
];

// =========================================================================
// 5. POOL SPÉCIFIQUE : DOUCHE & BAIN (shower_bath)
// =========================================================================
const SHOWER_VIBES: CreativeVibeGenerator[] = [
  {
    id: 'shw_miroir_embue',
    labelFr: 'Miroir embué & vapeur',
    labelUs: 'Steamy Mirror',
    noteFr: 'Vapeur d\'eau, condensation et reflet suggestif.',
    noteUs: 'Steam, moisture and tantalizing reflection.',
    generateFr: ({ em1, isPaid, isOneLine }) => {
      const msg = pickRandom([
        `j'ai essuyé la vapeur du miroir avec ma main... regarde ce qui est apparu dans le reflet de la salle de bain 🫧`,
        `pièce encore pleine de buée et peau toute mouillée... j'ai laissé la porte entrouverte exprès pour toi ${em1}`,
        `la vapeur commence à retomber... regarde comme les gouttes glissent sur mon corps 🫦`
      ]);
      return isPaid ? `${msg}${isOneLine ? '' : '\n\ndébloque pour voir à travers la buée'}` : msg;
    },
    generateUs: ({ em1, isPaid, isOneLine }) => {
      const msg = pickRandom([
        `wiped the steam off the bathroom mirror with my hand... look what reflection showed up 🫧`,
        `room still warm with mist and my skin completely soaked... left the door cracked just for you ${em1}`,
        `steam is slowly clearing... look at the water beads rolling down my skin 🫦`
      ]);
      return isPaid ? `${msg}${isOneLine ? '' : '\n\nunlock to see through the steam'}` : msg;
    }
  },
  {
    id: 'shw_serviette_glisse',
    labelFr: 'Serviette qui glisse',
    labelUs: 'Slipping Towel',
    noteFr: 'Moment critique où la serviette tombe toute seule.',
    noteUs: 'Suspenseful moment where the towel comes undone.',
    generateFr: ({ em1, isPaid, isOneLine }) => {
      const msg = pickRandom([
        `la serviette était mal nouée en sortant de la douche... ou peut-être que je l'ai laissée tomber exprès ? 🫦`,
        `juste une serviette blanche trempée qui tient à peine sur ma poitrine... devine ce qui se passe 10 secondes plus tard ${em1}`,
        `serviette tombée par terre, cheveux mouillés sur les épaules... viens voir ce que j'ai fait juste après 🫧`
      ]);
      return isPaid ? `${msg}${isOneLine ? '' : '\n\nclique pour voir la chute complète'}` : msg;
    },
    generateUs: ({ em1, isPaid, isOneLine }) => {
      const msg = pickRandom([
        `towel wasn't tied tight leaving the shower... or maybe I let it slip completely on purpose? 🫦`,
        `just a damp white towel barely holding around my chest... guess what happens 10 seconds later ${em1}`,
        `towel dropped straight to the tiles, wet hair against my bare shoulders... see what came next 🫧`
      ]);
      return isPaid ? `${msg}${isOneLine ? '' : '\n\ntap to watch the towel fall'}` : msg;
    }
  },
  {
    id: 'shw_bain_mousse',
    labelFr: 'Bain chaud & mousse',
    labelUs: 'Bubble Bath Soak',
    noteFr: 'Ambiance voluptueuse dans l\'eau chaude.',
    noteUs: 'Sensual warmth submerged in bubble bath.',
    generateFr: ({ em1, isPaid, isOneLine }) => {
      const msg = pickRandom([
        `immergée dans l'eau brûlante jusqu'au cou... la mousse cache à peine mes seins, regarde 🫧`,
        `eau parfumée, jambes qui dépassent de la baignoire... avoue que t'aimerais être assis juste en face de moi ${em1}`,
        `détente totale dans mon bain... regarde ce que je filme quand je soulève mes hanches hors de l'eau 🫦`
      ]);
      return isPaid ? `${msg}${isOneLine ? '' : '\n\ndébloque pour me rejoindre dans l\'eau'}` : msg;
    },
    generateUs: ({ em1, isPaid, isOneLine }) => {
      const msg = pickRandom([
        `soaked in hot water up to my neck... the bubbles barely cover my curves, look 🫧`,
        `scented warm bath, legs draped over the porcelain... admit you wish you were sitting right across from me ${em1}`,
        `pure relaxation in the tub... watch what happens when I lift my hips out of the water 🫦`
      ]);
      return isPaid ? `${msg}${isOneLine ? '' : '\n\nunlock to join me in the water'}` : msg;
    }
  },
  {
    id: 'shw_gouttes_peau',
    labelFr: 'Gouttes d\'eau sur la peau',
    labelUs: 'Water Droplets on Skin',
    noteFr: 'Détail sensoriel de l\'eau ruisselant sur le corps.',
    noteUs: 'Tactile detail of water droplets tracing curves.',
    generateFr: ({ em1, isPaid, isOneLine }) => {
      const msg = pickRandom([
        `les gouttes d'eau qui glissent lentement le long de ma cambrure... un plan très serré pour te donner chaud ${em1}`,
        `encore toute humide de la douche... regarde comment la lumière se reflète sur ma peau 🫧`,
        `peaux mouillées et frissons garantis : viens voir où coule la dernière goutte d'eau 🫦`
      ]);
      return isPaid ? `${msg}${isOneLine ? '' : '\n\nclique pour voir le plan macro'}` : msg;
    },
    generateUs: ({ em1, isPaid, isOneLine }) => {
      const msg = pickRandom([
        `water drops slowly rolling down my arched back... a tight close-up to keep you warm ${em1}`,
        `still glistening wet from the shower... look how the light bounces off my skin 🫧`,
        `damp skin and guaranteed goosebumps: come watch where the last water droplet lands 🫦`
      ]);
      return isPaid ? `${msg}${isOneLine ? '' : '\n\ntap to watch the slow drip'}` : msg;
    }
  },
  {
    id: 'shw_porte_entrouverte',
    labelFr: 'Regard indiscret sous l\'eau',
    labelUs: 'Cracked Door Peek',
    noteFr: 'Sentiment d\'indiscrétion volée sous le jet d\'eau.',
    noteUs: 'Stolen intimate peek through the steamy glass.',
    generateFr: ({ em1, isPaid, isOneLine }) => {
      const msg = pickRandom([
        `sous le jet d'eau brûlant les yeux fermés... j'ai posé le téléphone pour que tu me voies comme si tu étais entré sans frapper 🫧`,
        `à travers la paroi vitrée ruisselante... une vue indiscrète que personne d'autre n'a le droit de regarder ${em1}`,
        `savonnée de haut en bas sans aucun complexe... regarde la vidéo avant que j'éteigne l'eau 🫦`
      ]);
      return isPaid ? `${msg}${isOneLine ? '' : '\n\ndébloque pour la vue complète sous l\'eau'}` : msg;
    },
    generateUs: ({ em1, isPaid, isOneLine }) => {
      const msg = pickRandom([
        `under the hot stream with eyes closed... propped my phone up so you see me like you walked in unannounced 🫧`,
        `through the dripping glass door... a private view nobody else is allowed to witness ${em1}`,
        `lathered from head to toe with zero modesty... watch before I shut the water off 🫦`
      ]);
      return isPaid ? `${msg}${isOneLine ? '' : '\n\nunlock for the full shower perspective'}` : msg;
    }
  },
  {
    id: 'shw_peignoir_ouvert',
    labelFr: 'Peignoir entrouvert',
    labelUs: 'Open Robe Slip',
    noteFr: 'Sortie de salle de bain en soie ou coton entrouvert.',
    noteUs: 'Lounge robe loosely tied offering glimpses.',
    generateFr: ({ em1, isPaid, isOneLine }) => {
      const msg = pickRandom([
        `juste enfilé mon peignoir en soie mais la ceinture s'est desserrée dès le premier pas... regarde l'ouverture 🫦`,
        `sortie de bain pieds nus avec le peignoir qui s'ouvre sur mes cuisses mouillées... dis-moi ce que tu ferais ${em1}`,
        `fraîchement lavée et encore toute chaude... je n'ai absolument rien mis sous ce peignoir 🫧`
      ]);
      return isPaid ? `${msg}${isOneLine ? '' : '\n\nclique pour voir le peignoir tomber'}` : msg;
    },
    generateUs: ({ em1, isPaid, isOneLine }) => {
      const msg = pickRandom([
        `threw on my silk robe but the belt came undone the second I took a step... look at the opening 🫦`,
        `barefoot after the bath with my robe parting over my damp thighs... tell me your first move ${em1}`,
        `freshly rinsed and burning warm... literally nothing underneath this robe 🫧`
      ]);
      return isPaid ? `${msg}${isOneLine ? '' : '\n\ntap to watch the silk slip off'}` : msg;
    }
  }
];

// =========================================================================
// 6. POOLS POUR LES AUTRES MOODS
// =========================================================================

// Morning / Réveil
const MORNING_VIBES: CreativeVibeGenerator[] = [
  {
    id: 'mrn_reveil_lit',
    labelFr: 'Réveil dans les draps',
    labelUs: 'Morning Sheets',
    noteFr: 'Douceur du matin et paresse au saut du lit.',
    noteUs: 'Gentle morning sleepy sensual stretch.',
    generateFr: ({ em1, isPaid, isOneLine }) => {
      const msg = pickRandom([
        `encore à moitié endormie sous la couette avec les cheveux en bataille... viens te blottir contre moi ${em1}`,
        `les yeux à peine ouverts et la nuisette qui a glissé pendant la nuit... regarde comment je me réveille ☕`,
        `premier réflexe avant même le café : t'envoyer un bisou depuis mon lit encore tout chaud 🫦`
      ]);
      return isPaid ? `${msg}${isOneLine ? '' : '\n\ndébloque pour voir sous la couette'}` : msg;
    },
    generateUs: ({ em1, isPaid, isOneLine }) => {
      const msg = pickRandom([
        `still half asleep tangled in my blankets with messy bedhead... wish you were cuddled right here ${em1}`,
        `eyes barely open and my sleep slip twisted up during the night... look how I wake up ☕`,
        `first impulse before even grabbing coffee: sending you a sleepy kiss from my warm sheets 🫦`
      ]);
      return isPaid ? `${msg}${isOneLine ? '' : '\n\nunlock to peek under the duvet'}` : msg;
    }
  },
  {
    id: 'mrn_etirement',
    labelFr: 'Étirement lascif',
    labelUs: 'Morning Arch Stretch',
    noteFr: 'Courbures du corps qui s\'étire au soleil.',
    noteUs: 'Slow waking stretch highlighting curves in morning light.',
    generateFr: ({ em1, isPaid, isOneLine }) => {
      const msg = pickRandom([
        `cet étirement du matin les bras en l'air qui fait remonter le tee-shirt bien trop haut... regarde ${em1}`,
        `lumière du jour sur ma peau et réveil tout en douceur... viens voir comment je m'étire sur les draps 🫦`,
        `flemme totale de me lever aujourd'hui... reste au lit avec moi devant cette vidéo ☕`
      ]);
      return isPaid ? `${msg}${isOneLine ? '' : '\n\nclique pour voir l\'étirement complet'}` : msg;
    },
    generateUs: ({ em1, isPaid, isOneLine }) => {
      const msg = pickRandom([
        `that morning arch with arms stretched up that pulls my shirt way too high... take a look ${em1}`,
        `morning sunlight hitting my skin while I slowly wake up... see how I stretch out across the bed 🫦`,
        `zero desire to get out of bed today... stay lazy with me watching this clip ☕`
      ]);
      return isPaid ? `${msg}${isOneLine ? '' : '\n\ntap to watch the slow stretch'}` : msg;
    }
  },
  {
    id: 'mrn_pyjama_leger',
    labelFr: 'Pyjama trop court',
    labelUs: 'Tiny Sleepwear',
    noteFr: 'Tenue de nuit qui dévoile les cuisses et le décolleté.',
    noteUs: 'Minimal sleepwear showing off thighs and chest in morning calm.',
    generateFr: ({ em1, isPaid, isOneLine }) => {
      const msg = pickRandom([
        `mon petit shorty de nuit est minuscule ce matin... dis-moi si je dois le garder ou l'enlever pour la journée 🫦`,
        `pieds nus dans ma cuisine en nuisette transparente pour mon premier café... tu me rejoins ? ☕`,
        `regarde ce que je porte pour dormir... avoue que tu préférerais me voir sans rien ${em1}`
      ]);
      return isPaid ? `${msg}${isOneLine ? '' : '\n\ndébloque pour voir la tenue complète'}` : msg;
    },
    generateUs: ({ em1, isPaid, isOneLine }) => {
      const msg = pickRandom([
        `these sleep shorts are tiny this morning... tell me if I keep them on or lose them for the day 🫦`,
        `barefoot in my kitchen sipping morning coffee in a sheer nightie... wanna join me? ☕`,
        `look at what I wore to sleep... admit you'd rather see me with none of it on ${em1}`
      ]);
      return isPaid ? `${msg}${isOneLine ? '' : '\n\nunlock to see the full morning outfit'}` : msg;
    }
  }
];

// Late Night / Insomnie
const LATE_NIGHT_VIBES: CreativeVibeGenerator[] = [
  {
    id: 'ln_insomnie',
    labelFr: 'Insomnie complice',
    labelUs: 'Late Night Insomnia',
    noteFr: 'Atmosphère intime nocturne, chuchotements dans le noir.',
    noteUs: 'Intimate night atmosphere, whispers in the dark.',
    generateFr: ({ em1, isPaid, isOneLine }) => {
      const msg = pickRandom([
        `impossible de fermer l'œil ce soir... j'ai des pensées beaucoup trop brûlantes pour dormir ${em1}`,
        `il fait tout noir dans ma chambre et je suis seule sous la couette... dis-moi que tu ne dors pas encore 🫦`,
        `2h du matin et l'envie est trop forte... viens me tenir compagnie dans le noir ${em1}`
      ]);
      return isPaid ? `${msg}${isOneLine ? '' : '\n\ndébloque pour me rejoindre dans le noir'}` : msg;
    },
    generateUs: ({ em1, isPaid, isOneLine }) => {
      const msg = pickRandom([
        `tossing and turning tonight with thoughts way too hot to let me sleep ${em1}`,
        `pitch dark in my room and I'm alone under the duvet... tell me you're still awake 🫦`,
        `2 AM cravings keeping me wide awake... keep me company in the dark ${em1}`
      ]);
      return isPaid ? `${msg}${isOneLine ? '' : '\n\nunlock to join me in the dark'}` : msg;
    }
  },
  {
    id: 'ln_secret_couette',
    labelFr: 'Secret sous la couette',
    labelUs: 'Under the Covers',
    noteFr: 'Confidences murmurées la lampe de chevet éteinte.',
    noteUs: 'Whispered confessions with only phone screen glow.',
    generateFr: ({ em1, isPaid, isOneLine }) => {
      const msg = pickRandom([
        `juste la lumière de mon écran sur ma peau dénudée... regarde ce que je fais toute seule sous la couette 🫦`,
        `un chuchotement nocturne que je n'oserais jamais t'envoyer en plein jour... monte le son ${em1}`,
        `j'avais besoin de toi ce soir... regarde ce que j'ai filmé avant de m'endormir 🫦`
      ]);
      return isPaid ? `${msg}${isOneLine ? '' : '\n\nclique pour glisser sous les draps'}` : msg;
    },
    generateUs: ({ em1, isPaid, isOneLine }) => {
      const msg = pickRandom([
        `just phone screen glow illuminating my bare skin... watch what happens under the covers 🫦`,
        `a midnight whisper I would never dare send in broad daylight... headphones on ${em1}`,
        `craved your attention tonight... watch what I recorded before drifting off 🫦`
      ]);
      return isPaid ? `${msg}${isOneLine ? '' : '\n\ntap to slip under the sheets'}` : msg;
    }
  }
];

// GFE / Amoureuse complice
const GFE_VIBES: CreativeVibeGenerator[] = [
  {
    id: 'gfe_complicite',
    labelFr: 'Douceur & complicité GFE',
    labelUs: 'Sweet GFE Tease',
    noteFr: 'Petite copine câline, affectueuse et sensuelle.',
    noteUs: 'Affectionate, sweet, teasing girlfriend warmth.',
    generateFr: ({ em1, isPaid, isOneLine }) => {
      const msg = pickRandom([
        `j'ai pensé à toi toute la journée mon cœur... regarde la petite surprise que je t'ai préparée en rentrant 🤍`,
        `tu me manques tellement... j'ai mis la tenue que tu préfères chez moi rien que pour tes yeux ${em1}`,
        `un petit câlin en vidéo pour te réchauffer... avoue que tu voudrais être là avec moi 🫦`
      ]);
      return isPaid ? `${msg}${isOneLine ? '' : '\n\ndébloque pour ouvrir ton cadeau privé'}` : msg;
    },
    generateUs: ({ em1, isPaid, isOneLine }) => {
      const msg = pickRandom([
        `been on my mind all day babe... look at the private treat I made for you when I got home 🤍`,
        `missing you so much... slipped on the exact outfit you like best on me just for your eyes ${em1}`,
        `a warm sweet hug on video to brighten your day... admit you wish you were holding me 🫦`
      ]);
      return isPaid ? `${msg}${isOneLine ? '' : '\n\nunlock to open your personal treat'}` : msg;
    }
  }
];

// Interactive / Dilemme & Jeu
const INTERACTIVE_VIBES: CreativeVibeGenerator[] = [
  {
    id: 'int_vote_tenue',
    labelFr: 'Choix de tenue / Jeu de vote',
    labelUs: 'Outfit Vote Game',
    noteFr: 'Fait participer le fan avec un choix décisif.',
    noteUs: 'High reply trigger asking the fan to make a decisive pick.',
    generateFr: ({ em1, isPaid, isOneLine }) => {
      const msg = pickRandom([
        `dilemme express : ensemble rouge passion ou dentelle noire transparente ? C'est toi qui choisis ce que je porte ${em1}`,
        `j'hésite entre deux tenues très osées pour ce soir... vote en répondant A ou B et je t'envoie le résultat 🫦`,
        `un petit jeu entre nous : si tu devines ce que je cache derrière mon dos, je te l'offre ${em1}`
      ]);
      return isPaid ? `${msg}${isOneLine ? '' : '\n\ndébloque pour voir les deux options portées'}` : msg;
    },
    generateUs: ({ em1, isPaid, isOneLine }) => {
      const msg = pickRandom([
        `quick vote: red silk or sheer black lace? you decide what stays on my body tonight ${em1}`,
        `torn between two ultra daring sets... reply with A or B and I'll send you the winner 🫦`,
        `little game: guess what I'm hiding behind my back and you get to keep the clip ${em1}`
      ]);
      return isPaid ? `${msg}${isOneLine ? '' : '\n\nunlock to see both options on me'}` : msg;
    }
  }
];

// Exclusive VIP
const VIP_VIBES: CreativeVibeGenerator[] = [
  {
    id: 'vip_coffre_fort',
    labelFr: 'Contenu secret du coffre',
    labelUs: 'Private Vault Drop',
    noteFr: 'Sentiment d\'accès privilégié et réservé à l\'élite.',
    noteUs: 'Exclusive vault access feeling strictly reserved.',
    generateFr: ({ em1, isPaid, isOneLine }) => {
      const msg = pickRandom([
        `ce média ne sera JAMAIS posté sur mon feed public... strictement réservé à mes fans les plus fidèles 👑`,
        `un dossier secret que j'avais gardé pour moi jusqu'à aujourd'hui... ouvre ton accès privilégié ${em1}`,
        `le contenu le plus exclusif de ma galerie perso : profite de ce privilège unique 🫦`
      ]);
      return isPaid ? `${msg}${isOneLine ? '' : '\n\ndébloque pour ouvrir le coffre-fort'}` : msg;
    },
    generateUs: ({ em1, isPaid, isOneLine }) => {
      const msg = pickRandom([
        `this will NEVER hit my public feed... strictly reserved for my closest VIP circle 👑`,
        `a private folder I kept locked away until today... unlock your privileged access ${em1}`,
        `the most exclusive cut in my entire camera roll: enjoy this one-of-a-kind privilege 🫦`
      ]);
      return isPaid ? `${msg}${isOneLine ? '' : '\n\nunlock to open the private vault'}` : msg;
    }
  }
];

// Flash Sale / Vente chrono
const FLASH_VIBES: CreativeVibeGenerator[] = [
  {
    id: 'fls_chrono',
    labelFr: 'Offre flash chrono',
    labelUs: 'Flash Countdown',
    noteFr: 'Urgence temporelle avec tarif réduit temporaire.',
    noteUs: 'Urgent price drop with countdown timer.',
    generateFr: ({ em1, isPaid, isOneLine }) => {
      const msg = pickRandom([
        `offre flash pendant seulement 2 heures : mon média le plus chaud à prix cassé avant suppression ⚡`,
        `prix d'ami exceptionnel pour les 10 premiers déblocages chrono... ne laisse pas passer ça ${em1}`,
        `compte à rebours lancé : tarif réduit temporaire pour fêter mon humeur coquine d'aujourd'hui 🫦`
      ]);
      return isPaid ? `${msg}${isOneLine ? '' : '\n\ndébloque avant la fin du chrono'}` : msg;
    },
    generateUs: ({ em1, isPaid, isOneLine }) => {
      const msg = pickRandom([
        `flash deal active for just 2 hours: my hottest PPV slashed to celebrate my spicy mood ⚡`,
        `special drop for the first 10 unlocks... don't let this slip away ${em1}`,
        `countdown started: temporary promo before this returns to standard pricing 🫦`
      ]);
      return isPaid ? `${msg}${isOneLine ? '' : '\n\nunlock before the clock expires'}` : msg;
    }
  }
];

// Général Hot Teasing (hot)
const GENERAL_HOT_VIBES: CreativeVibeGenerator[] = [
  {
    id: 'hot_tentation',
    labelFr: 'Tentation immédiate',
    labelUs: 'Instant Temptation',
    noteFr: 'Sensualité piquante et directe pour allumer la flamme.',
    noteUs: 'Direct spicy tease sparking instant curiosity.',
    generateFr: ({ em1, isPaid, isOneLine }) => {
      const msg = pickRandom([
        `j'avais une envie folle de te provoquer aujourd'hui... regarde ce que je t'ai concocté dans ma chambre 🫦`,
        `avoue que tu ne t'attendais pas à recevoir une vidéo aussi torride à cette heure-ci ${em1}`,
        `attention les yeux : cette vidéo risque de te donner très chaud pour le reste de la journée 🫦`
      ]);
      return isPaid ? `${msg}${isOneLine ? '' : '\n\ndébloque pour voir toute la surprise'}` : msg;
    },
    generateUs: ({ em1, isPaid, isOneLine }) => {
      const msg = pickRandom([
        `had an irresistible craving to tease you today... see what I cooked up in my bedroom 🫦`,
        `admit you weren't expecting something this hot to land on your screen right now ${em1}`,
        `fair warning: this video is about to raise your temperature for the rest of the day 🫦`
      ]);
      return isPaid ? `${msg}${isOneLine ? '' : '\n\ntap below to unlock the full surprise'}` : msg;
    }
  }
];

// Helper to select the pool corresponding to the user's selected mood
function getVibesForMood(mood: MoodCategory): CreativeVibeGenerator[] {
  switch (mood) {
    case 'positions_hot':
      return POSITIONS_VIBES;
    case 'body_explicit':
      return BODY_VIBES;
    case 'fantasies_taboo':
      return FANTASIES_VIBES;
    case 'dirty_talk':
      return DIRTY_TALK_VIBES;
    case 'shower_bath':
      return SHOWER_VIBES;
    case 'morning':
      return [...MORNING_VIBES, ...BODY_VIBES.slice(0, 3)];
    case 'late_night':
      return [...LATE_NIGHT_VIBES, ...DIRTY_TALK_VIBES.slice(0, 2), ...FANTASIES_VIBES.slice(0, 2)];
    case 'gfe':
      return [...GFE_VIBES, ...MORNING_VIBES.slice(0, 2), ...GENERAL_HOT_VIBES];
    case 'interactive':
      return [...INTERACTIVE_VIBES, ...POSITIONS_VIBES.slice(0, 2), ...FANTASIES_VIBES.slice(0, 2)];
    case 'exclusive_vip':
      return [...VIP_VIBES, ...BODY_VIBES.slice(0, 2), ...DIRTY_TALK_VIBES.slice(0, 2)];
    case 'flash_sale':
      return [...FLASH_VIBES, ...DIRTY_TALK_VIBES.slice(0, 2), ...POSITIONS_VIBES.slice(0, 2)];
    case 'hot':
    default:
      // Mix of high-heat sensual vibes
      return [
        ...POSITIONS_VIBES.slice(0, 2),
        ...BODY_VIBES.slice(0, 2),
        ...DIRTY_TALK_VIBES.slice(0, 2),
        ...GENERAL_HOT_VIBES
      ];
  }
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

  // 1. Get the pool specifically aligned with the selected VIBE & CIRCONSTANCE
  const moodPool = getVibesForMood(mood);

  // Guarantee at least 6 unique vibes by pulling from secondary compatible pools if necessary
  let candidateVibes = [...moodPool];
  if (candidateVibes.length < 6) {
    const backupPool = [...POSITIONS_VIBES, ...BODY_VIBES, ...DIRTY_TALK_VIBES, ...FANTASIES_VIBES];
    for (const b of backupPool) {
      if (!candidateVibes.some(c => c.id === b.id)) {
        candidateVibes.push(b);
        if (candidateVibes.length >= 6) break;
      }
    }
  }

  // Shuffle candidate vibes so every generation gives a fresh combination & order
  const shuffledVibes = shuffle(candidateVibes).slice(0, 6);

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
      mediaNotice: isPaid ? (mediaContext || 'Média exclusif chambre') : 'Offert / DM',
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
