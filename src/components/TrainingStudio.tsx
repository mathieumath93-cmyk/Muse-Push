import React, { useState } from 'react';
import { WinningExample, Platform, Language, MoodCategory } from '../types';
import { Trophy, Plus, Trash2, CheckCircle, Sparkles, BookOpen, HelpCircle } from 'lucide-react';
import { MOODS } from '../data';

interface TrainingStudioProps {
  examples: WinningExample[];
  onAddExample: (example: WinningExample) => void;
  onDeleteExample: (id: string) => void;
  playbookRules: string;
  onChangePlaybookRules: (rules: string) => void;
}

export const TrainingStudio: React.FC<TrainingStudioProps> = ({
  examples,
  onAddExample,
  onDeleteExample,
  playbookRules,
  onChangePlaybookRules
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newText, setNewText] = useState('');
  const [newRevenue, setNewRevenue] = useState('');
  const [newOpenRate, setNewOpenRate] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [newLang, setNewLang] = useState<Language>('fr');
  const [newPlatform, setNewPlatform] = useState<Platform>('onlyfans');
  const [newMood, setNewMood] = useState<MoodCategory>('hot');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim()) return;

    const item: WinningExample = {
      id: 'custom-win-' + Date.now(),
      title: newTitle.trim() || 'Mon push gagnant',
      platform: newPlatform,
      language: newLang,
      mood: newMood,
      text: newText.trim(),
      revenueGenerated: newRevenue.trim() || undefined,
      openRate: newOpenRate.trim() || undefined,
      notes: newNotes.trim() || undefined,
      isCustom: true
    };

    onAddExample(item);
    setNewTitle('');
    setNewText('');
    setNewRevenue('');
    setNewOpenRate('');
    setNewNotes('');
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Intro banner */}
      <div className="bg-gradient-to-r from-purple-900/30 via-[#161622] to-rose-900/20 border border-purple-500/20 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-2xl bg-purple-500/20 text-purple-300 border border-purple-500/30 shrink-0 mt-1">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Entraînement de l'IA & Base de Données Gagnante (Few-Shot Prompting)
              </h2>
              <p className="text-xs text-zinc-300 mt-1 leading-relaxed max-w-2xl">
                Ajoute ici les messages réels de tes modèles qui ont généré le plus de ventes (PPV/Tips). 
                L'IA OpenRouter les étudiera comme modèles de référence absolus pour copier leur rythme, 
                leurs tics d'écriture et leur taux de persuasion sans jamais sonner fake.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-rose-500 hover:from-purple-600 hover:to-rose-600 text-white font-semibold text-xs shadow-md shadow-purple-500/20 flex items-center gap-2 shrink-0 self-start sm:self-auto transition"
          >
            <Plus className="w-4 h-4" />
            {showAddForm ? 'Fermer le formulaire' : 'Ajouter un Push Gagnant'}
          </button>
        </div>
      </div>

      {/* Form to add a winning push */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="bg-[#14141e] border border-purple-500/30 rounded-2xl p-5 shadow-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              Nouveau Push de Référence (Top Performer)
            </h3>
            <span className="text-[11px] text-zinc-400">
              Sera automatiquement injecté en contexte lors de la génération
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium text-zinc-300 block mb-1">Titre ou contexte du test</label>
              <input
                type="text"
                placeholder="Ex: Tease sous la douche miroir embué"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-zinc-300 block mb-1">Plateforme & Langue</label>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={newPlatform}
                  onChange={e => setNewPlatform(e.target.value as any)}
                  className="bg-black/40 border border-white/10 rounded-xl px-2 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="onlyfans">OnlyFans</option>
                  <option value="mym">MYM</option>
                </select>
                <select
                  value={newLang}
                  onChange={e => setNewLang(e.target.value as any)}
                  className="bg-black/40 border border-white/10 rounded-xl px-2 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="fr">FR (Français)</option>
                  <option value="us">US (Anglais)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-zinc-300 block mb-1">Mood / Circonstance</label>
              <select
                value={newMood}
                onChange={e => setNewMood(e.target.value as any)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
              >
                {MOODS.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-zinc-300 block mb-1">
              Texte exact du message qui a cartonné (à reproduire en esprit) *
            </label>
            <textarea
              required
              rows={4}
              placeholder="Colle ici le message exact envoyé aux fans..."
              value={newText}
              onChange={e => setNewText(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-purple-500 leading-relaxed font-mono"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium text-zinc-300 block mb-1">CA ou Tips générés (optionnel)</label>
              <input
                type="text"
                placeholder="Ex: 2 450 € ou $1,800"
                value={newRevenue}
                onChange={e => setNewRevenue(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-300 block mb-1">Taux d'ouverture / unlock (optionnel)</label>
              <input
                type="text"
                placeholder="Ex: 92%"
                value={newOpenRate}
                onChange={e => setNewOpenRate(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-300 block mb-1">Pourquoi il a marché ? (analyse)</label>
              <input
                type="text"
                placeholder="Ex: Début direct en minuscule, ton intime de copine"
                value={newNotes}
                onChange={e => setNewNotes(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 transition"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 shadow-md transition"
            >
              Enregistrer dans l'entraînement IA
            </button>
          </div>
        </form>
      )}

      {/* Rules / Playbook editor */}
      <div className="bg-[#121218] border border-white/10 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/5">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-rose-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Playbook & Directives Secrètes de ton Agence
            </h3>
          </div>
          <span className="text-[11px] text-zinc-400">
            Règles transmises au prompt système
          </span>
        </div>

        <p className="text-xs text-zinc-400 mb-2">
          Indique ici tes règles d'or (mots bannis, formats obligatoires, longueur maximale). L'IA appliquera strictement ces règles à chaque push.
        </p>

        <textarea
          rows={3}
          value={playbookRules}
          onChange={e => onChangePlaybookRules(e.target.value)}
          placeholder="Exemple : 
- Ne jamais utiliser le mot 'abonne-toi' ou 'promotion'.
- Commencer souvent la première phrase par des minuscules pour faire vrai SMS.
- Ne pas dépasser 4 phrases courtes.
- Toujours placer un emoji discret à la fin."
          className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-rose-500 font-sans leading-relaxed"
        />
      </div>

      {/* Cards list of all winning examples */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            {examples.length} Pushs Gagnants Actifs dans l'entraînement IA
          </h3>
          <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-mono">
            <CheckCircle className="w-3 h-3" /> Connectés au prompt OpenRouter
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {examples.map((item) => (
            <div
              key={item.id}
              className="bg-[#14141e] border border-white/5 hover:border-white/15 rounded-2xl p-4 shadow-lg flex flex-col justify-between transition group"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center gap-2">
                      {item.title}
                      {item.isCustom && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 font-mono">
                          Perso
                        </span>
                      )}
                    </h4>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-white/5 border border-white/5 text-zinc-400">
                        {item.platform}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/5 border border-white/5 text-zinc-400">
                        {item.language === 'us' ? '🇺🇸 US' : '🇫🇷 FR'}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/5 border border-white/5 text-zinc-400">
                        {item.mood}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {item.revenueGenerated && (
                      <span className="text-xs font-bold font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                        {item.revenueGenerated}
                      </span>
                    )}
                    {item.isCustom && (
                      <button
                        type="button"
                        onClick={() => onDeleteExample(item.id)}
                        className="p-1 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-white/5 transition"
                        title="Supprimer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-xs text-zinc-200 font-mono whitespace-pre-line leading-relaxed my-2">
                  {item.text}
                </div>
              </div>

              {item.notes && (
                <div className="text-[11px] text-zinc-400 bg-white/[0.02] p-2 rounded-lg border border-white/5 mt-1">
                  💡 <strong>Secret de conversion :</strong> {item.notes}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
