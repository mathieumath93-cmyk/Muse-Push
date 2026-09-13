import React, { useState } from 'react';
import { ModelProfile } from '../types';
import { Plus, Check, Sparkles, SlidersHorizontal, HeartHandshake } from 'lucide-react';

interface ModelSelectorProps {
  models: ModelProfile[];
  selectedModelId: string;
  onSelectModel: (id: string) => void;
  onAddNewModel: (model: ModelProfile) => void;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  models,
  selectedModelId,
  onSelectModel,
  onAddNewModel
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newModel, setNewModel] = useState<Partial<ModelProfile>>({
    name: '',
    age: 22,
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
    personality: 'Sensuelle, naturelle et très complice.',
    favoriteEmojis: ['✨', '🫦', '🤍'],
    defaultLanguage: 'fr',
    preferredPlatforms: ['mym', 'onlyfans'],
    customToneNotes: 'Ton intime et direct, parle comme avec un crush.'
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModel.name?.trim()) return;
    const created: ModelProfile = {
      id: 'model-' + Date.now(),
      name: newModel.name,
      age: Number(newModel.age) || 22,
      avatar: newModel.avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
      personality: newModel.personality || 'Naturelle et complice',
      favoriteEmojis: (newModel.favoriteEmojis as string[]) || ['✨', '🫦'],
      defaultLanguage: newModel.defaultLanguage || 'fr',
      preferredPlatforms: (newModel.preferredPlatforms as any) || ['onlyfans'],
      customToneNotes: newModel.customToneNotes || 'Style spontané'
    };
    onAddNewModel(created);
    onSelectModel(created.id);
    setShowAddModal(false);
    setNewModel({
      name: '',
      age: 22,
      personality: '',
      favoriteEmojis: ['✨', '🫦'],
      defaultLanguage: 'fr'
    });
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <HeartHandshake className="w-4 h-4 text-rose-400" />
          <h2 className="text-sm font-semibold tracking-wide text-zinc-200 uppercase">
            1. Profil Modèle & Persona
          </h2>
        </div>
        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="text-xs px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/10 transition-colors flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5 text-rose-400" />
          Ajouter un modèle
        </button>
      </div>

      {/* Models Cards carousel / grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {models.map((m) => {
          const isSelected = selectedModelId === m.id;
          return (
            <div
              key={m.id}
              onClick={() => onSelectModel(m.id)}
              className={`cursor-pointer rounded-2xl p-3 border transition-all duration-200 relative group flex gap-3 items-center ${
                isSelected
                  ? 'bg-gradient-to-r from-rose-500/15 to-purple-500/10 border-rose-500/50 shadow-[0_0_25px_rgba(244,63,94,0.12)]'
                  : 'bg-[#121218] border-white/5 hover:border-white/20 hover:bg-white/[0.03]'
              }`}
            >
              <div className="relative shrink-0">
                <img
                  src={m.avatar}
                  alt={m.name}
                  className="w-13 h-13 rounded-xl object-cover ring-2 ring-white/10 group-hover:ring-rose-400/40 transition"
                  referrerPolicy="no-referrer"
                />
                {isSelected && (
                  <div className="absolute -top-1 -right-1 bg-rose-500 text-white rounded-full p-0.5 shadow-md">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-semibold text-white truncate">{m.name}</h3>
                  <span className="text-xs text-zinc-400 font-mono">({m.age})</span>
                </div>
                <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                  {m.personality}
                </p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 border border-white/5 text-zinc-300 uppercase font-mono">
                    {m.defaultLanguage.toUpperCase()}
                  </span>
                  <span className="text-xs tracking-wider">
                    {m.favoriteEmojis.slice(0, 3).join('')}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Add Model */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#181822] border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-rose-400" />
              Nouveau Profil Modèle
            </h3>
            <p className="text-xs text-zinc-400 mb-4">
              Définit le ton de voix, l'âge et les expressions pour que les mass messages sonnent 100% authentiques.
            </p>

            <form onSubmit={handleCreate} className="space-y-3.5">
              <div>
                <label className="text-xs font-medium text-zinc-300 block mb-1">Prénom ou Pseudo</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Mia, Luna, Sarah..."
                  value={newModel.name}
                  onChange={e => setNewModel({ ...newModel, name: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-rose-500"
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
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-zinc-300 block mb-1">Langue Principale</label>
                  <select
                    value={newModel.defaultLanguage}
                    onChange={e => setNewModel({ ...newModel, defaultLanguage: e.target.value as any })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-rose-500"
                  >
                    <option value="fr">Français (FR)</option>
                    <option value="us">Anglais US (USA)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-300 block mb-1">Personnalité & Ton (résumé)</label>
                <input
                  type="text"
                  placeholder="Ex: Joueuse, sensuelle, rire facile, très complice"
                  value={newModel.personality}
                  onChange={e => setNewModel({ ...newModel, personality: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-300 block mb-1">Style de phrases / Tics de langage</label>
                <textarea
                  rows={2}
                  placeholder="Ex: Dit souvent 'coucou toi', utilise beaucoup de points de suspension (...), déteste le langage soutenu."
                  value={newModel.customToneNotes}
                  onChange={e => setNewModel({ ...newModel, customToneNotes: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 shadow-md shadow-rose-500/25 transition"
                >
                  Enregistrer le profil
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
