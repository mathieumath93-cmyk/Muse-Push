import React, { useState } from 'react';
import { ModelProfile } from '../types';
import { Sparkles } from 'lucide-react';

interface AddModelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (model: ModelProfile) => void;
}

export const AddModelModal: React.FC<AddModelModalProps> = ({ isOpen, onClose, onSave }) => {
  const [newModel, setNewModel] = useState<Partial<ModelProfile>>({
    name: '',
    age: 22,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    personality: 'Sensuelle, naturelle et très complice.',
    realLifeOccupation: 'Étudiante & passionnée de lingerie/mode',
    homeHabits: 'Traîne en nuisette, teste ses colis de lingerie devant son miroir de chambre',
    favoriteEmojis: ['✨', '🫦', '🤍'],
    defaultLanguage: 'fr',
    preferredPlatforms: ['mym', 'onlyfans'],
    customToneNotes: 'Ton intime et direct, affirmations spontanées, parle comme avec son crush.'
  });

  if (!isOpen) return null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModel.name?.trim()) return;
    const created: ModelProfile = {
      id: 'model-' + Date.now(),
      name: newModel.name.trim(),
      age: Number(newModel.age) || 22,
      avatar: newModel.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      personality: newModel.personality || 'Naturelle et complice',
      realLifeOccupation: newModel.realLifeOccupation || 'Étudiante / passionnée de mode',
      homeHabits: newModel.homeHabits || 'Chambre, grand miroir, couette et lingerie maison',
      favoriteEmojis: (newModel.favoriteEmojis as string[]) || ['✨', '🫦'],
      defaultLanguage: newModel.defaultLanguage || 'fr',
      preferredPlatforms: ['onlyfans', 'mym'],
      customToneNotes: newModel.customToneNotes || 'Style spontané et authentique'
    };
    onSave(created);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-[#181822] border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-rose-400" />
          Nouveau Profil Modèle
        </h3>
        <p className="text-xs text-zinc-400 mb-4">
          Définit le ton de voix et sa vie réelle à la maison (indispensable pour des médias 100% cohérents).
        </p>

        <form onSubmit={handleCreate} className="space-y-3">
          <div>
            <label className="text-xs font-medium text-zinc-300 block mb-1">Prénom ou Pseudo</label>
            <input
              type="text"
              required
              placeholder="Ex: Emma, Eva, Chloe..."
              value={newModel.name}
              onChange={e => setNewModel({ ...newModel, name: e.target.value })}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-zinc-300 block mb-1">Âge</label>
              <input
                type="number"
                min={18}
                max={60}
                value={newModel.age}
                onChange={e => setNewModel({ ...newModel, age: parseInt(e.target.value) || 22 })}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-300 block mb-1">Langue par défaut</label>
              <select
                value={newModel.defaultLanguage}
                onChange={e => setNewModel({ ...newModel, defaultLanguage: e.target.value as any })}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
              >
                <option value="fr">Français (FR)</option>
                <option value="us">Anglais US (USA)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-zinc-300 block mb-1">Métier / Ce qu'elle fait dans la vie</label>
            <input
              type="text"
              placeholder="Ex: Étudiante en droit, coach sportive à domicile, passionnée de shopping lingerie"
              value={newModel.realLifeOccupation}
              onChange={e => setNewModel({ ...newModel, realLifeOccupation: e.target.value })}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-zinc-300 block mb-1">Habitudes réelles à la maison (Cadre média)</label>
            <input
              type="text"
              placeholder="Ex: Miroir de chambre, essaye ses colis lingerie, traîne en nuisette satinée sous la couette"
              value={newModel.homeHabits}
              onChange={e => setNewModel({ ...newModel, homeHabits: e.target.value })}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-zinc-300 block mb-1">Personnalité & Ton (résumé)</label>
            <input
              type="text"
              placeholder="Ex: Joueuse, taquine, aime faire des confidences sans poser de questions lourdes"
              value={newModel.personality}
              onChange={e => setNewModel({ ...newModel, personality: e.target.value })}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-zinc-300 block mb-1">Tics de langage / Style de phrases</label>
            <textarea
              rows={2}
              placeholder="Ex: Dit souvent 'coucou toi', phrases courtes et piquantes, affirmations directes."
              value={newModel.customToneNotes}
              onChange={e => setNewModel({ ...newModel, customToneNotes: e.target.value })}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
            />
          </div>

          <div className="flex gap-2 justify-end pt-2 border-t border-white/5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 transition"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 shadow-md shadow-rose-500/25 transition"
            >
              Créer le profil
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
