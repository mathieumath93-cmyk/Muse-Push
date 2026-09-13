import React, { useState, useEffect } from 'react';
import { ModelProfile, Language } from '../types';
import { Sparkles, X, Check, Camera, Wand2, Edit3, MapPin, Target, BookOpen, MessageSquareQuote, Palette } from 'lucide-react';
import { parseModelFromRawText } from '../utils/personaParser';

interface AddModelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (model: ModelProfile) => void;
  initialModel?: ModelProfile | null;
}

const AVATAR_PRESETS = [
  {
    label: 'Brune Glam',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
  },
  {
    label: 'Naturelle',
    url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80'
  },
  {
    label: 'Blonde Sensuelle',
    url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80'
  },
  {
    label: 'Mystérieuse',
    url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80'
  },
  {
    label: 'Élégante & Art',
    url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80'
  },
  {
    label: 'Coquine Cosy',
    url: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=400&q=80'
  }
];

export const AddModelModal: React.FC<AddModelModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave,
  initialModel 
}) => {
  const isEditing = Boolean(initialModel);

  // Quick paste text state
  const [showQuickPaste, setShowQuickPaste] = useState(false);
  const [rawPastedText, setRawPastedText] = useState('');
  const [parseSuccessMsg, setParseSuccessMsg] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [age, setAge] = useState(25);
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_PRESETS[0].url);
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');
  const [location, setLocation] = useState('');
  const [language, setLanguage] = useState<Language>('fr');
  const [realLifeOccupation, setRealLifeOccupation] = useState('');
  const [personality, setPersonality] = useState('');
  const [objective, setObjective] = useState('');
  const [themes, setThemes] = useState('');
  const [tone, setTone] = useState('');
  const [homeHabits, setHomeHabits] = useState('');
  const [favoriteEmojis, setFavoriteEmojis] = useState('✨, 🫦, 🤍');
  const [customToneNotes, setCustomToneNotes] = useState('');

  // Synchronize state on open or when initialModel changes
  useEffect(() => {
    if (isOpen) {
      if (initialModel) {
        setName(initialModel.name || '');
        setAge(initialModel.age || 23);
        setSelectedAvatar(initialModel.avatar || AVATAR_PRESETS[0].url);
        setCustomAvatarUrl(initialModel.avatar?.startsWith('http') && !AVATAR_PRESETS.some(p => p.url === initialModel.avatar) ? initialModel.avatar : '');
        setLocation(initialModel.location || '');
        setLanguage(initialModel.defaultLanguage || 'fr');
        setRealLifeOccupation(initialModel.realLifeOccupation || '');
        setPersonality(initialModel.personality || '');
        setObjective(initialModel.objective || '');
        setThemes(Array.isArray(initialModel.themes) ? initialModel.themes.join(', ') : '');
        setTone(initialModel.tone || '');
        setHomeHabits(initialModel.homeHabits || '');
        setFavoriteEmojis(Array.isArray(initialModel.favoriteEmojis) ? initialModel.favoriteEmojis.join(', ') : '✨, 🫦, 🤍');
        setCustomToneNotes(initialModel.customToneNotes || '');
        setShowQuickPaste(false);
      } else {
        // Reset for new creation
        setName('');
        setAge(25);
        setSelectedAvatar(AVATAR_PRESETS[Math.floor(Math.random() * AVATAR_PRESETS.length)].url);
        setCustomAvatarUrl('');
        setLocation('');
        setLanguage('fr');
        setRealLifeOccupation('Marchand d’art / passionnée de mode');
        setPersonality('Drôle, taquine, proche de sa communauté');
        setObjective('Faire répondre et créer une relation intime');
        setThemes('France, Paris, art, café, voyages, sport, shopping, cuisine, soirées');
        setTone('Naturel, curieux, chaleureux, léger');
        setHomeHabits('Miroir de chambre, lit défait, café du matin, retours shopping');
        setFavoriteEmojis('✨, ☕, 🎨, 🫦, 🤍');
        setCustomToneNotes('Affirmations directes, style vrai SMS intime, taquine et complice.');
        setShowQuickPaste(true); // Open quick paste by default for convenience
      }
      setRawPastedText('');
      setParseSuccessMsg(null);
    }
  }, [isOpen, initialModel]);

  if (!isOpen) return null;

  const finalAvatar = customAvatarUrl.trim() || selectedAvatar;

  // Handle parsing of pasted raw text (bullet points, bio, notes)
  const handleApplyQuickPaste = () => {
    if (!rawPastedText.trim()) return;

    const parsed = parseModelFromRawText(rawPastedText);
    setName(parsed.name);
    setAge(parsed.age);
    if (parsed.location) setLocation(parsed.location);
    if (parsed.defaultLanguage) setLanguage(parsed.defaultLanguage);
    if (parsed.realLifeOccupation) setRealLifeOccupation(parsed.realLifeOccupation);
    if (parsed.personality) setPersonality(parsed.personality);
    if (parsed.objective) setObjective(parsed.objective);
    if (parsed.themes && parsed.themes.length > 0) setThemes(parsed.themes.join(', '));
    if (parsed.tone) setTone(parsed.tone);
    if (parsed.homeHabits) setHomeHabits(parsed.homeHabits);
    if (parsed.favoriteEmojis && parsed.favoriteEmojis.length > 0) {
      setFavoriteEmojis(parsed.favoriteEmojis.join(', '));
    }
    if (parsed.customToneNotes) setCustomToneNotes(parsed.customToneNotes);

    setParseSuccessMsg(`✓ Fiche analysée avec succès pour "${parsed.name}" (${parsed.age} ans) ! Tous les champs ont été arrangés automatiquement.`);
    setShowQuickPaste(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const emojisArray = favoriteEmojis
      .split(/[,;\s]+/)
      .map(e => e.trim())
      .filter(Boolean);

    const themesArray = themes
      .split(/[,;]+/)
      .map(t => t.trim())
      .filter(Boolean);

    const modelToSave: ModelProfile = {
      id: initialModel ? initialModel.id : 'model-' + Date.now(),
      name: name.trim(),
      age: Number(age) || 25,
      avatar: finalAvatar,
      personality: personality.trim() || 'Naturelle, complice et spontanée',
      realLifeOccupation: realLifeOccupation.trim() || 'Créatrice & passionnée de mode',
      homeHabits: homeHabits.trim() || 'Chambre, miroir, lit et moments cosy à la maison',
      location: location.trim() || undefined,
      objective: objective.trim() || undefined,
      themes: themesArray.length > 0 ? themesArray : undefined,
      tone: tone.trim() || undefined,
      favoriteEmojis: emojisArray.length > 0 ? emojisArray : ['✨', '🫦'],
      defaultLanguage: language,
      preferredPlatforms: initialModel?.preferredPlatforms || ['onlyfans', 'mym'],
      customToneNotes: customToneNotes.trim() || 'Style direct et intime, affirmations spontanées.'
    };

    onSave(modelToSave);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div className="bg-[#161622] border border-white/10 rounded-2xl p-5 sm:p-6 max-w-xl w-full shadow-2xl my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl ${isEditing ? 'bg-indigo-500/20 text-indigo-400' : 'bg-rose-500/20 text-rose-400'}`}>
              {isEditing ? <Edit3 className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>{isEditing ? `Modifier le Profil : ${name || initialModel?.name}` : 'Nouveau Profil Modèle'}</span>
                {isEditing && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    Mode Édition
                  </span>
                )}
              </h3>
              <p className="text-[11px] text-zinc-400">
                Personnalisez son histoire, son ton, ses thèmes et son cadre de vie
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable form body */}
        <div className="overflow-y-auto pr-1 mt-4 space-y-4 flex-1">
          {/* Success banner if text was parsed */}
          {parseSuccessMsg && (
            <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between gap-2">
              <span className="font-medium">{parseSuccessMsg}</span>
              <button 
                type="button" 
                onClick={() => setParseSuccessMsg(null)}
                className="text-emerald-400 hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            </div>
          )}

          {/* Quick Paste & Auto-Arranging Box (Copier-Coller Intelligent) */}
          <div className="rounded-xl border border-rose-500/30 bg-gradient-to-br from-rose-500/10 via-purple-500/5 to-transparent p-3 sm:p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Wand2 className="w-4 h-4 text-rose-400" />
                <span className="text-xs font-bold text-white">
                  Collage Rapide & Rangement Automatique
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowQuickPaste(!showQuickPaste)}
                className="text-[11px] text-rose-300 hover:text-rose-200 underline cursor-pointer font-medium"
              >
                {showQuickPaste ? 'Masquer la boîte' : 'Coller des infos brutes (bullet points)'}
              </button>
            </div>

            {showQuickPaste && (
              <div className="space-y-2 mt-2 pt-2 border-t border-rose-500/20 animate-in fade-in">
                <p className="text-[11px] text-zinc-300 leading-relaxed">
                  Collez directement votre texte brut ou bullet points (ex: <span className="text-rose-300 font-mono">Sophia, 25 ans, vit dans le 34, métier, personnalité, objectif, thèmes, ton...</span>). L'IA extrait et range tout automatiquement !
                </p>
                <textarea
                  rows={4}
                  placeholder={`Exemple :\nSophia\n* 25 ans, Française, vit dans le 34\n* Métier : marchand d’art / achat-revente d’œuvres\n* Personnalité : drôle, taquine, proche de sa communauté\n* Objectif : faire répondre et créer une relation\n* Thèmes : France, Paris, art, café, voyages, sport, shopping, soirées...\n* Ton : naturel, curieux, chaleureux, léger`}
                  value={rawPastedText}
                  onChange={e => setRawPastedText(e.target.value)}
                  className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-rose-500 font-mono"
                />
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleApplyQuickPaste}
                    disabled={!rawPastedText.trim()}
                    className="px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-rose-500 hover:bg-rose-600 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-1.5 shadow-md shadow-rose-500/20 cursor-pointer"
                  >
                    <Wand2 className="w-3.5 h-3.5" />
                    <span>Ranger & Remplir automatiquement</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          <form id="model-form" onSubmit={handleSave} className="space-y-4">
            {/* Avatar selector */}
            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-2 flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-rose-400" />
                <span>Photo de profil / Avatar</span>
              </label>
              <div className="grid grid-cols-6 gap-2 mb-2">
                {AVATAR_PRESETS.map((p, idx) => {
                  const isChosen = finalAvatar === p.url;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setSelectedAvatar(p.url);
                        setCustomAvatarUrl('');
                      }}
                      className={`relative rounded-xl overflow-hidden aspect-square border-2 transition ${
                        isChosen ? 'border-rose-500 scale-105 shadow-md shadow-rose-500/30 ring-1 ring-rose-500' : 'border-white/10 hover:border-white/30 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={p.url} alt={p.label} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      {isChosen && (
                        <div className="absolute inset-0 bg-rose-500/30 flex items-center justify-center">
                          <Check className="w-3.5 h-3.5 text-white" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
              <input
                type="url"
                placeholder="Ou colle une URL d'image personnalisée (facultatif)"
                value={customAvatarUrl}
                onChange={e => setCustomAvatarUrl(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-[11px] text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:border-rose-500"
              />
            </div>

            {/* Name, Age & Location */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  Prénom ou Pseudo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Sophia, Emma..."
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  Âge
                </label>
                <input
                  type="number"
                  min={18}
                  max={60}
                  value={age}
                  onChange={e => setAge(parseInt(e.target.value) || 25)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-rose-400" />
                  <span>Localisation</span>
                </label>
                <input
                  type="text"
                  placeholder="Ex: Vit dans le 34, Paris..."
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            {/* Language & Signature Emojis */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  Langue par défaut
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setLanguage('fr')}
                    className={`py-1.5 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      language === 'fr'
                        ? 'bg-rose-500/20 border-rose-500 text-white shadow-sm'
                        : 'bg-black/30 border-white/10 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <span>🇫🇷</span>
                    <span>Français</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setLanguage('us')}
                    className={`py-1.5 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      language === 'us'
                        ? 'bg-indigo-500/20 border-indigo-500 text-white shadow-sm'
                        : 'bg-black/30 border-white/10 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <span>🇺🇸</span>
                    <span>Anglais US</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  Emojis signatures (séparés par virgules)
                </label>
                <input
                  type="text"
                  placeholder="✨, ☕, 🎨, 🫦, 🤍"
                  value={favoriteEmojis}
                  onChange={e => setFavoriteEmojis(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            {/* Occupation & Objectif */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  Métier réel / Activité
                </label>
                <input
                  type="text"
                  placeholder="Ex: Marchand d’art / achat-revente d’œuvres"
                  value={realLifeOccupation}
                  onChange={e => setRealLifeOccupation(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1 flex items-center gap-1">
                  <Target className="w-3 h-3 text-emerald-400" />
                  <span>Objectif relationnel</span>
                </label>
                <input
                  type="text"
                  placeholder="Ex: Faire répondre et créer une relation intime"
                  value={objective}
                  onChange={e => setObjective(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            {/* Personality & Tone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  Personnalité
                </label>
                <input
                  type="text"
                  placeholder="Ex: Drôle, taquine, proche de sa communauté, anecdotes"
                  value={personality}
                  onChange={e => setPersonality(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1 flex items-center gap-1">
                  <MessageSquareQuote className="w-3 h-3 text-amber-400" />
                  <span>Ton de voix</span>
                </label>
                <input
                  type="text"
                  placeholder="Ex: Naturel, curieux, chaleureux, léger"
                  value={tone}
                  onChange={e => setTone(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            {/* Thèmes récurrents */}
            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1 flex items-center gap-1">
                <Palette className="w-3 h-3 text-purple-400" />
                <span>Thèmes & Centres d'intérêt (séparés par virgules)</span>
              </label>
              <input
                type="text"
                placeholder="Ex: France, Paris, art, café, voyages, sport, shopping, cuisine, famille, chiens, soirées"
                value={themes}
                onChange={e => setThemes(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
              />
              <p className="text-[10px] text-zinc-500 mt-1">
                L'IA utilisera ces thèmes pour ancrer ses micro-anecdotes dans la vraie vie de la créatrice.
              </p>
            </div>

            {/* Home Habits & Cadre maison */}
            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">
                🏡 Cadre maison (où elle se prend en photo & vidéo)
              </label>
              <input
                type="text"
                placeholder="Ex: Miroir de chambre, lit défait, café du matin, salon lumineux"
                value={homeHabits}
                onChange={e => setHomeHabits(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
              />
            </div>

            {/* Custom Tone Notes */}
            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">
                Directives de style & SMS
              </label>
              <textarea
                rows={2}
                placeholder="Ex: Affirmations directes sans questions, parle comme avec son crush, raconte ses anecdotes."
                value={customToneNotes}
                onChange={e => setCustomToneNotes(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
              />
            </div>
          </form>
        </div>

        {/* Footer actions */}
        <div className="flex gap-2 justify-end pt-3 border-t border-white/10 shrink-0 mt-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 transition cursor-pointer"
          >
            Annuler
          </button>
          <button
            type="submit"
            form="model-form"
            className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-rose-500 via-pink-600 to-purple-600 hover:from-rose-600 hover:via-pink-700 hover:to-purple-700 shadow-md shadow-rose-500/25 transition cursor-pointer flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isEditing ? 'Mettre à jour le persona' : 'Enregistrer & Activer'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
