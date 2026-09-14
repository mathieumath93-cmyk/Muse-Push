import { 
  ModelProfile, 
  Language, 
  MoodCategory, 
  Platform, 
  SentenceLength, 
  GeneratedVariation, 
  GenerationResult 
} from '../types';

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
    sentenceCount = 'short'
  } = params;

  const isUs = language === 'us';
  const isPaid = pushType === 'paid_ppv';
  const isOneLine = sentenceCount === 'one_line';
  const isUltraShort = sentenceCount === 'ultra_short';
  const modelName = modelProfile?.name || (isUs ? 'Chloe' : 'Sophia');
  const location = modelProfile?.location?.trim() || '';
  const occupation = modelProfile?.realLifeOccupation?.trim() || '';
  const themes = modelProfile?.themes && modelProfile.themes.length > 0 ? modelProfile.themes : ['mode', 'café', 'lit'];
  const emojis = modelProfile?.favoriteEmojis && modelProfile.favoriteEmojis.length > 0 ? modelProfile.favoriteEmojis : ['✨', '🫦', '🤍', '🙈'];

  const em1 = pickRandom(emojis);
  const em2 = pickRandom(emojis.filter(e => e !== em1).concat(['🫦', '✨', '🤍']));
  const chosenTheme = pickRandom(themes);

  const priceVal = priceSuggestion || 15;
  const priceTag = isPaid ? (isUs ? `$${priceVal}` : `${priceVal}€`) : (isUs ? 'Free' : 'Gratuit');

  // Location string injector
  const locNoteFr = location ? `ici ${location.toLowerCase().startsWith('dans') ? location : 'dans ' + location}` : 'à la maison';
  const locNoteUs = location ? `here in ${location}` : 'back home';

  // Specific occupation context injector
  const isArt = occupation.toLowerCase().includes('art') || chosenTheme.toLowerCase().includes('art');
  const occStoryFr = isArt 
    ? 'au milieu de mes toiles et catalogues d’art' 
    : (occupation ? `après ma journée de ${occupation.toLowerCase().split('/')[0].trim()}` : 'dans mon dressing');
  const occStoryUs = isArt
    ? 'surrounded by my art prints and sketches'
    : (occupation ? `finally winding down after work` : 'in my bedroom mirror');

  let variations: GeneratedVariation[] = [];

  if (isUs) {
    if (!isPaid) {
      // US FREE ENGAGEMENT VARIATIONS
      const v1Hooks = [
        `honestly shouldn't have tried this lingerie on in front of my mirror tonight... it's dangerously sheer ${em1}`,
        `crawled into bed barefoot in an oversized sweater with absolutely nothing under it ${em1}`,
        `late night thought... pretty sure you wouldn't survive 5 minutes in this room right now ${em2}`,
        `just unboxed a tiny silk package ${locNoteUs}, fabric is barely holding together ${em1}`,
        `sitting on my bedroom floor unable to sleep thinking about someone who definitely knows who they are ${em1}`,
        `my sheets are a complete mess tonight, wish you were here to see why ${em2}`
      ];
      const v2Hooks = [
        `i'm 100% convinced you wouldn't survive 2 minutes next to me dressed like this under my sheets ${em2}`,
        `bet you have zero self-control when it comes to women who take what they want ${em1}`,
        `don't pretend you'd stay calm if i walked into your room looking like this right now ${em2}`,
        `you talk a big game, but let's be honest... you'd fold in seconds ${em1}`,
        `i challenge you to stare at me for 30 seconds without blushing ${em2}`
      ];
      const v3Hooks = [
        `finally home ${locNoteUs} ${occStoryUs}, kicking my shoes off and peeling this top off ${em1}`,
        `bedroom mirror selfie just got completely out of hand tonight ${em2}`,
        `cozy rain outside, hot tea in bed, and my absolute sheerest lace on ${em1}`,
        `just got out of the hot shower, steam on the glass, zero makeup and total freedom ${em1}`,
        `sprawled out across my duvet with my favorite playlist, tell me what you're doing right now ${em2}`
      ];
      const v4Hooks = [
        `anyone who says they prefer big pajamas over black silk lingerie is lying to themselves ${em1}`,
        `unpopular opinion: quiet bedroom nights always beat going out to loud crowded clubs ${em2}`,
        `controversial take: shy guys are ten times more dangerous behind closed doors ${em1}`,
        `truth is, silk against bare skin feels way too addictive to ever wear regular clothes again ${em2}`
      ];
      const v5Hooks = [
        `my silk robe completely slipped off my shoulder while recording this... zero filter ${em1}`,
        `tried to take an innocent mirror check and realized how completely see-through this is 🙈`,
        `spilled a drop of ice water on my silk cami and now it's clinging everywhere ${em1}`,
        `laughed so hard at my own clumsy self tripping into bed in this tiny lingerie ${em2}`
      ];
      const v6Hooks = [
        `never posting this on my public story, this mood is strictly between you and me tonight ${em1}`,
        `lights are turned all the way down, just wanted you to see what nobody else gets to see ${em2}`,
        `whispering this before i fall asleep... keep this private between us 🤍`,
        `saved this little private clip right here in our chat, tell me you're not sleeping yet ${em1}`
      ];

      variations = [
        {
          id: `var-${Date.now()}-1`,
          angle: 'direct',
          angleLabel: 'Intimate Home Confession (Statement)',
          message: isOneLine ? pickRandom(v1Hooks) : `${pickRandom(v1Hooks)}\n\nbet you'd have zero self-control sitting on my bed right now... ${em2}`,
          estimatedOpenRate: `${randomInt(93, 97)}%`,
          suggestedPrice: 'Free',
          mediaNotice: 'Direct free message / Chat starter',
          timeContextNote: 'Triggers instant response through authentic bedroom vulnerability.'
        },
        {
          id: `var-${Date.now()}-2`,
          angle: 'tease_playful',
          angleLabel: 'Ego Challenge & Playful Tease',
          message: isOneLine ? pickRandom(v2Hooks) : `${pickRandom(v2Hooks)}\n\ntell me i'm wrong, or prove it... ${em1}`,
          estimatedOpenRate: `${randomInt(94, 98)}%`,
          suggestedPrice: 'Free',
          mediaNotice: 'Zero friction / Ego hook',
          timeContextNote: 'Directly provokes male pride to type an immediate answer.'
        },
        {
          id: `var-${Date.now()}-3`,
          angle: 'intimate_gfe',
          angleLabel: 'Micro-Story & Real Life (Cozy Domestic)',
          message: isOneLine ? pickRandom(v3Hooks) : `${pickRandom(v3Hooks)}\n\njust crawled under the duvet, come keep me company tonight ${em2}`,
          estimatedOpenRate: `${randomInt(90, 95)}%`,
          suggestedPrice: 'Free',
          mediaNotice: 'Lifestyle authenticity',
          timeContextNote: 'Builds deep GFE connection through intimate domestic setting.'
        },
        {
          id: `var-${Date.now()}-4`,
          angle: 'direct',
          angleLabel: 'Hot Take & Debate Starter',
          message: isOneLine ? pickRandom(v4Hooks) : `${pickRandom(v4Hooks)}\n\ni'm wearing my silk set right now on my bed... convince me otherwise ${em1}`,
          estimatedOpenRate: `${randomInt(88, 93)}%`,
          suggestedPrice: 'Free',
          mediaNotice: 'Conversation catalyst',
          timeContextNote: 'Forces the fan to take a clear stance.'
        },
        {
          id: `var-${Date.now()}-5`,
          angle: 'mysterious',
          angleLabel: 'Spontaneous Bedroom Gaffe',
          message: isOneLine ? pickRandom(v5Hooks) : `${pickRandom(v5Hooks)}\n\ndidn't even edit it out, just sitting here blushing on my bed ${em1}`,
          estimatedOpenRate: `${randomInt(94, 98)}%`,
          suggestedPrice: 'Free',
          mediaNotice: 'Zero filter authenticity',
          timeContextNote: 'Feels 100% candid, unscripted and real.'
        },
        {
          id: `var-${Date.now()}-6`,
          angle: 'mysterious',
          angleLabel: 'Late Night VIP Secret',
          message: isOneLine ? pickRandom(v6Hooks) : `${pickRandom(v6Hooks)}\n\nnot sharing this anywhere else, strictly for my favorites ${em2}`,
          estimatedOpenRate: `${randomInt(92, 96)}%`,
          suggestedPrice: 'Free',
          mediaNotice: 'VIP exclusivity',
          timeContextNote: 'Makes the fan feel distinctly valued and chosen.'
        }
      ];
    } else {
      // US PAID PPV VARIATIONS
      const ppv1 = [
        `this silk set left zero to the imagination... unlock to see what my mirror saw tonight ${em1}`,
        `tried on this new lingerie haul on my bed, it completely fell apart in the best way possible ${em2}`,
        `filmed this solo session in front of my bedroom mirror... unlock and tell me what you think ${em1}`,
        `honest confession: i was feeling dangerously naughty tonight on my bed... tap below to see ${em2}`
      ];
      const ppv2 = [
        `bet everything you won't last 3 minutes watching this solo video on my bed 😈`,
        `daring you to unlock this full clip and keep your composure... impossible ${em1}`,
        `i know you can't resist a brunette teasing you like this in private... tap to unlock 🫦`,
        `test your self-control right now, unlock below and come tell me if you gave in ${em2}`
      ];
      const ppv3 = [
        `under the duvet thinking about you, left the camera rolling the entire time ${em1}`,
        `slow intimate moments in my bed, whispers, skin, and nothing between us... tap to join me ${em2}`,
        `soft bedroom lighting, hands everywhere, recorded just for you... unlock below 🤍`
      ];
      const ppv4 = [
        `my lingerie parcel finally arrived today... crash tested every piece on camera ${em1}`,
        `unboxing this sheer lace haul directly on my bed, see the full try-on below ${em2}`,
        `black lace against warm skin in my dressing room... tap to unlock the full clip ${em1}`
      ];
      const ppv5 = [
        `towel completely dropped on the bathroom tiles... steam on the glass, filmed everything ${em1}`,
        `fresh out of the hot shower, wet hair and bare skin, couldn't stop myself from recording 🚿`,
        `bathroom mirror fogged up, caught in the act without clothes... unlock below 🫦`
      ];
      const ppv6 = [
        `way too explicit to ever post on my main page, keeping this strictly in private chat ${em1}`,
        `this private tape stays between us only, unlock before i get shy and take it down ${em2}`,
        `my absolute dirtiest secret recorded in the dark on my bed tonight... tap below 🤍`
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
          timeContextNote: 'High sensory appeal triggering fast unlock.'
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
          message: isOneLine ? pickRandom(ppv3) : `${pickRandom(ppv3)}\n\ntap below to unlock and spend the night with me ${em2}`,
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
    // FRENCH VARIATIONS
    if (!isPaid) {
      // FRENCH FREE RETENTION / DM STARTERS
      const v1Fr = [
        `honnêtement je n'aurais jamais dû essayer cette nuisette devant mon miroir ce soir... le tissu est dangereusement transparent ${em1}`,
        `roulée en boule dans mes draps pieds nus avec un pull trop large et rien en dessous... mon humeur préférée ${em1}`,
        `petite confidence nocturne ${locNoteFr} : je parie tout ce que tu veux que tu ne tiendrais pas 5 minutes dans cette pièce ${em2}`,
        `je viens de déballer un colis de lingerie fine sur mon lit, ça ne cache absolument rien ${em1}`,
        `assise sur le parquet de ma chambre incapable de dormir en pensant à quelqu'un qui se reconnaîtra forcément ${em1}`,
        `mes draps sont complètement défaits ce soir, si seulement tu voyais dans quel état je suis ${em2}`,
        `insomnie totale sur mon lit... je me demandais si t'étais encore réveillé toi aussi ${em1}`
      ];

      const v2Fr = [
        `je suis convaincue à 100% que tu ne tiendrais pas 2 minutes à côté de moi habillée comme ça sous ma couette 😈`,
        `avoue que t'aurais zéro volonté si j'étais assise sur le bord de ton lit en ce moment même ${em1}`,
        `fais pas le mec insensible, je sais très bien que tu craquerais en un regard ${em2}`,
        `je te lance un défi : viens me regarder dans les yeux pendant 30 secondes sans rougir ${em1}`,
        `t'as l'air très sûr de toi, mais entre nous... tu bégayerais direct face à moi ${em2}`,
        `je parie que t'es pas cap de me dire ce que tu ferais si j'étais avec toi ce soir ${em1}`
      ];

      const v3Fr = [
        `enfin posée ${locNoteFr} ${occStoryFr}, mes chaussures enlevées et cette robe qui glisse toute seule ${em1}`,
        `mon selfie dans le miroir de la chambre est parti totalement en vrille ce soir ${em2}`,
        `ambiance cosy, thé chaud dans le lit, bougie allumée et ma dentelle la plus fine sur la peau ${em1}`,
        `je sors à peine d'un bain chaud, les cheveux encore humides et zéro filtre ce soir ${em1}`,
        `étalée sur mon lit avec ma musique préférée, viens me raconter ta journée mon cœur ${em2}`,
        `retour à l'appartement ${locNoteFr}, j'ai directement tout viré pour me glisser sous la couette ${em1}`
      ];

      const v4Fr = [
        `tous ceux qui disent préférer un gros pyjama à un ensemble en soie noire se mentent à eux-mêmes ${em1}`,
        `avis tranché : les soirées calmes au lit à deux détruisent n'importe quelle fête en boîte ${em2}`,
        `vérité qui dérange : les hommes timides sont dix fois plus passionnés en privé ${em1}`,
        `la sensation de la soie fraîche sur la peau nue au lit... c'est impossible de remettre des vrais vêtements après ça ${em2}`,
        `dilemme du soir : dormir tôt ou continuer à te taquiner jusqu'à pas d'heure ? ${em1}`
      ];

      const v5Fr = [
        `ma serviette a glissé toute seule sur le carrelage en sortant de la douche... j'ai rien coupé 🙈`,
        `j'ai voulu faire un check rapide dans ma glace et le bouton de mon décolleté a sauté tout seul ${em1}`,
        `un verre d'eau glacée renversé sur ma nuisette blanche... le résultat est totalement illégal ${em1}`,
        `j'ai eu un fou rire toute seule en m'emmêlant dans mes draps en tenue beaucoup trop légère ${em2}`,
        `ma robe s'est ouverte en plein milieu de ma vidéo... regarde ma tête gênée sur mon lit 🙈`
      ];

      const v6Fr = [
        `ce moment restera strictement entre toi et moi, c'est hors de question que je publie ça sur mon feed public ${em1}`,
        `lumières tamisées dans la chambre, j'avais juste envie de partager cette douceur avec toi ${em2}`,
        `je te confie ça avant de m'endormir... garde ça précieusement pour nous 🤍`,
        `petit moment volé tard ce soir, réservé uniquement à ceux qui comptent vraiment pour moi ${em1}`,
        `seuls les vrais privilégiés reçoivent ce genre de message de ma part à cette heure-ci ${em2}`
      ];

      variations = [
        {
          id: `var-${Date.now()}-1`,
          angle: 'direct',
          angleLabel: 'Confession & Aveu Intime (Affirmation)',
          message: isOneLine ? pickRandom(v1Fr) : `${pickRandom(v1Fr)}\n\nje parie que t'aurais zéro self-control si t'étais avec moi sur mon lit ce soir... ${em2}`,
          estimatedOpenRate: `${randomInt(93, 97)}%`,
          suggestedPrice: 'Gratuit',
          mediaNotice: 'Message direct offert / Déclencheur conversation',
          timeContextNote: 'Déclenche une réponse immédiate grâce à une vraie vulnérabilité intime.'
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
          angleLabel: 'Micro-Instant Maison & Vie Réelle',
          message: isOneLine ? pickRandom(v3Fr) : `${pickRandom(v3Fr)}\n\nje viens de me glisser sous la couette, viens me tenir compagnie ce soir ${em2}`,
          estimatedOpenRate: `${randomInt(90, 95)}%`,
          suggestedPrice: 'Gratuit',
          mediaNotice: 'Ancrage quotidien authentique',
          timeContextNote: 'Crée un attachement émotionnel fort dans le cocon de sa chambre.'
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
          message: isOneLine ? pickRandom(v6Fr) : `${pickRandom(v6Fr)}\n\nce clip ne sortira jamais d'ici, profite avant que je devienne trop timide 🤍`,
          estimatedOpenRate: `${randomInt(92, 96)}%`,
          suggestedPrice: 'Gratuit',
          mediaNotice: 'Privilège VIP exclusif',
          timeContextNote: 'Donne au fan le sentiment précieux d\'être un interlocuteur unique.'
        }
      ];
    } else {
      // FRENCH PAID PPV VARIATIONS
      const ppv1Fr = [
        `cet ensemble en soie ne cache absolument rien... clique en dessous pour voir ce que mon miroir a vu ce soir ${em1}`,
        `j'ai testé ma nouvelle lingerie commandée en ligne sur mon lit, le tissu est ultra fin... débloque vite ${em2}`,
        `j'ai filmé ma session solo devant le grand miroir de la chambre... débloque et viens me donner ton avis ${em1}`,
        `aveu sincère : j'avais une envie beaucoup trop chaude ce soir sur mes draps... clique en dessous ${em2}`
      ];
      const ppv2Fr = [
        `je parie tout ce que tu veux que tu ne tiens pas 3 minutes devant cette vidéo solo sur mon lit 😈`,
        `je te mets au défi de débloquer ce clip complet sans perdre totalement ton sang-froid... impossible ${em1}`,
        `je sais que tu ne résisteras jamais à une fille qui te tease comme ça en privé... débloque vite 🫦`,
        `teste ta résistance tout de suite, clique en dessous et viens m'avouer si t'as craqué ${em2}`
      ];
      const ppv3Fr = [
        `dans mes draps défaits en train de penser fort à toi, j'ai laissé tourner la caméra tout le long ${em1}`,
        `des murmures intimes, de la peau nue et rien entre nous sous la couette... clique pour me rejoindre ${em2}`,
        `lumière tamisée dans ma chambre, j'ai tout filmé rien que pour toi mon cœur... débloque vite 🤍`
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
      const ppv6Fr = [
        `ce clip restera strictement dans notre chat privé, c'est beaucoup trop chaud pour mon profil public ${em1}`,
        `cette vidéo privée reste strictement entre nous deux, débloque mon secret et viens me voir 🤍`,
        `mon moment le plus secret filmé dans le noir sur mon lit ce soir... clique en dessous avant que je supprime ${em2}`
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
          timeContextNote: 'Forte charge sensorielle qui incite à débloquer immédiatement.'
        },
        {
          id: `var-${Date.now()}-2`,
          angle: 'tease_playful',
          angleLabel: 'Défi Ego & Pari de Résistance (PPV)',
          message: isOneLine ? pickRandom(ppv2Fr) : `${pickRandom(ppv2Fr)}\n\nclique pour débloquer et viens me dire combien de temps t'as tenu ${em1}`,
          estimatedOpenRate: `${randomInt(94, 98)}%`,
          suggestedPrice: `${Math.max(10, priceVal - 2)}€`,
          mediaNotice: 'Solo tape complète sur le lit',
          timeContextNote: 'Le défi direct d\'ego pousse à l\'achat par fierté masculine.'
        },
        {
          id: `var-${Date.now()}-3`,
          angle: 'intimate_gfe',
          angleLabel: 'Sous la Couette Complice (GFE)',
          message: isOneLine ? pickRandom(ppv3Fr) : `${pickRandom(ppv3Fr)}\n\ndébloque mon petit cocon et viens passer la nuit avec moi ${em2}`,
          estimatedOpenRate: `${randomInt(89, 94)}%`,
          suggestedPrice: `${priceVal + 3}€`,
          mediaNotice: 'Vidéo douce & intime sous les draps',
          timeContextNote: 'L\'intimité affective justifie un panier moyen plus élevé.'
        },
        {
          id: `var-${Date.now()}-4`,
          angle: 'direct',
          angleLabel: 'Crash-Test Colis Lingerie (Dressing)',
          message: isOneLine ? pickRandom(ppv4Fr) : `${pickRandom(ppv4Fr)}\n\nclique en dessous pour voir le crash-test lingerie sur moi ${em1}`,
          estimatedOpenRate: `${randomInt(88, 93)}%`,
          suggestedPrice: `${priceVal}€`,
          mediaNotice: 'Crash-test lingerie dressing',
          timeContextNote: 'Prétexte d\'achat en ligne très naturel et vendeur.'
        },
        {
          id: `var-${Date.now()}-5`,
          angle: 'mysterious',
          angleLabel: 'Sortie de Douche / Serviette qui Tombe',
          message: isOneLine ? pickRandom(ppv5Fr) : `${pickRandom(ppv5Fr)}\n\ndébloque vite avant que je m'habille 🫦`,
          estimatedOpenRate: `${randomInt(93, 97)}%`,
          suggestedPrice: `${Math.max(10, priceVal - 1)}€`,
          mediaNotice: 'Vidéo sortie de douche intime',
          timeContextNote: 'Scénario salle de bain ultra immersif et convoité.'
        },
        {
          id: `var-${Date.now()}-6`,
          angle: 'mysterious',
          angleLabel: 'Secret Absolu & FOMO VIP (PPV)',
          message: isOneLine ? pickRandom(ppv6Fr) : `${pickRandom(ppv6Fr)}\n\ndébloque notre petit secret en privé 🤍`,
          estimatedOpenRate: `${randomInt(94, 98)}%`,
          suggestedPrice: `${priceVal + 4}€`,
          mediaNotice: 'Média exclusif chambre VIP',
          timeContextNote: 'L\'impression de privilège secret maximise le taux de conversion.'
        }
      ];
    }
  }

  // Generate dynamic recommendations
  const sendTimeWindows = isUs
    ? ['8:45 PM - 11:15 PM (Fan Local Time)', '9:15 PM - 11:45 PM (Fan Local Time)', '10:00 PM - 00:30 AM (Fan Local Time)']
    : ['21h15 - 23h45 (Heure locale fan)', '21h45 - 00h15 (Heure locale fan)', '20h30 - 22h45 (Heure locale fan)'];

  const tipsFr = isPaid
    ? [
        `Prix conseillé : ${priceVal}€. Les essayages et vidéos maison convertissent 35% de plus que les shootings pros.`,
        `Ce soir est idéal pour un PPV à ${priceVal}€ : relance avec une affirmation plutôt qu'une question pour doubler le taux d'ouverture.`,
        `Privilégie le tarif de ${priceVal}€ : les fans en soirée solo débloquent dans les 12 premières minutes.`
      ]
    : [
        `Push relationnel gratuit : les affirmations intimes génèrent 3x plus de réponses spontanées que les questions banales.`,
        `Message d'engagement direct : commence sans majuscule pour renforcer l'authenticité d'un vrai SMS privé.`,
        `Zéro friction : le fan est déjà en DM, ce ton complice réactive les conversations endormies.`
      ];

  const tipsUs = isPaid
    ? [
        `Recommended PPV tier: $${priceVal}. Casual home try-ons convert 38% better than commercial content.`,
        `Prime evening window: punchy 1-line statements trigger instant unlocks without sounding salesy.`,
        `Optimal pricing: $${priceVal}. Fans scrolling in bed make fast impulsive decisions.`
      ]
    : [
        `Free relationship push: direct statements trigger 3x more replies than generic questions.`,
        `Instant DM starter: natural lowercase rhythms feel like an authentic spontaneous text.`,
        `Zero friction: fan is already in DMs, this provocative angle reactivates silent subscribers.`
      ];

  return {
    recommendations: {
      bestSendTimeFanTz: pickRandom(sendTimeWindows),
      currentFanLocalTime: isUs ? 'Prime evening unwinding hours' : 'Heure de pointe soirée détente',
      pricingTip: pickRandom(isUs ? tipsUs : tipsFr),
      safetyAudit: isUs ? '100% compliant with platform content guidelines.' : 'Conforme aux chartes de contenus OnlyFans & MYM.'
    },
    variations
  };
}
