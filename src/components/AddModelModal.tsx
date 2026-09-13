import React, { useState, useEffect } from 'react';
import { ModelProfile, Language } from '../types';
import { Sparkles, X, Check, Camera } from 'lucide-react';

interface AddModelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (model: ModelProfile) => void;
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
    label: 'Élégante',
    url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80'
  },
  {
    label: 'Coquine Cosy',
    url: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=400&q=80'
  }
];

export const AddModelModal: React.FC<AddModelModalProps> = ({ isOpen, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [age, setAge] = useState(22);
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_PRESETS[0].url);
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');
  const [language, setLanguage] = useState<Language>('fr');
  const [personality, setPersonality] = useState('Sensuelle, naturelle et très complice.');
  const [realLifeOccupation, setRealLifeOccupation] = useState('Étudiante & passionnée de lingerie/mode');
  const [homeHabits, setHomeHabits] = useState('Traîne en nuisette, teste ses colis de lingerie devant son miroir de chambre');
  const [favoriteEmojis, setFavoriteEmojis] = useState('✨, 🫦, 🤍');
  const [customToneNotes, setCustomToneNotes] = useState('Ton intime et direct, affirmations spontanées, parle comme avec son crush.');

  // Reset form whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setName('');
      setAge(22);
      setSelectedAvatar(AVATAR_PRESETS[Math.floor(Math.random() * AVATAR_PRESETS.length)].url);
      setCustomAvatarUrl('');
      setLanguage('fr');
      setPersonality('Sensuelle, spontanée et très complice.');
      setRealLifeOccupation('Étudiante & créatrice de mode à domicile');
      setHomeHabits('Miroir de chambre, lit défait, couette, essayages de lingerie');
      setFavoriteEmojis('✨, 🫦, 🤍');
      setCustomToneNotes('Affirmations directes, style vrai SMS intime, zéro blabla télémarketing.');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const finalAvatar = customAvatarUrl.trim() || selectedAvatar;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const emojisArray = favoriteEmojis
      .split(',')
      .map(e => e.trim())
      .filter(Boolean);

    const created: ModelProfile = {
      id: 'model-' + Date.now(),
      name: name.trim(),
      age: Number(age) || 22,
      avatar: finalAvatar,
      personality: personality.trim() || 'Naturelle et complice',
      realLifeOccupation: realLifeOccupation.trim() || 'Étudiante / passionnée de mode',
      homeHabits: homeHabits.trim() || 'Chambre, grand miroir, couette et lingerie maison',
      favoriteEmojis: emojisArray.length > 0 ? emojisArray : ['✨', '🫦'],
      defaultLanguage: language,
      preferredPlatforms: ['onlyfans', 'mym'],
      customToneNotes: customToneNotes.trim() || 'Style spontané et authentique'
    };

    onSave(created);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-[#161622] border border-white/10 rounded-2xl p-6 max-w-lg w-full shadow-2xl max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Ajouter un Profil Modèle
              </h3>
              <p className="text-[11px] text-zinc-400">
                Elle apparaîtra instantanément dans le sélecteur "Modèle & Voix"
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

        <form onSubmit={handleCreate} className="space-y-4 mt-4">
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

          {/* Name & Age */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-zinc-300 block mb-1">
                Prénom / Pseudo du Modèle *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Emma, Eva, Mila..."
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
                max={50}
                value={age}
                onChange={e => setAge(parseInt(e.target.value) || 22)}
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
                Emojis favoris (séparés par virgules)
              </label>
              <input
                type="text"
                placeholder="✨, 🫦, 🤍, 🙈"
                value={favoriteEmojis}
                onChange={e => setFavoriteEmojis(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          {/* Occupation & Home Habits */}
          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-1">
              Métier réel & Contexte de vie
            </label>
            <input
              type="text"
              placeholder="Ex: Étudiante en droit, passionnée de lingerie reçue par colis"
              value={realLifeOccupation}
              onChange={e => setRealLifeOccupation(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-1">
              🏡 Cadre maison (où elle prend ses photos & vidéos)
            </label>
            <input
              type="text"
              placeholder="Ex: Miroir de chambre, lit défait, sortie de douche, couette en soie"
              value={homeHabits}
              onChange={e => setHomeHabits(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
            />
          </div>

          {/* Style & Tone */}
          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-1">
              Ton de voix & Style de SMS
            </label>
            <textarea
              rows={2}
              placeholder="Ex: Affirmations directes sans questions, parle comme à un crush intime."
              value={customToneNotes}
              onChange={e => setCustomToneNotes(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 justify-end pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 transition cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-rose-500 via-pink-600 to-purple-600 hover:from-rose-600 hover:via-pink-700 hover:to-purple-700 shadow-md shadow-rose-500/25 transition cursor-pointer flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Enregistrer & Activer</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
