import React, { useState } from 'react';
import { ModelProfile, MoodCategory, PushRequestConfig, PushType, SentenceLength } from '../types';
import { MOODS } from '../data';
import { 
  Heart, 
  Flame, 
  Sun, 
  Droplets, 
  Moon, 
  Crown, 
  Sparkles, 
  Zap, 
  ChevronDown, 
  ChevronUp, 
  SlidersHorizontal,
  Check,
  Plus,
  Lock,
  MessageCircle,
  AlignLeft,
  FileText,
  Trash2,
  Globe,
  UserCheck,
  Pencil
} from 'lucide-react';

interface CleanStudioConfigProps {
  models: ModelProfile[];
  selectedModelId: string;
  onSelectModel: (id: string) => void;
  onEditModel?: (model: ModelProfile) => void;
  onDeleteModel?: (id: string) => void;
  selectedMood: MoodCategory;
  onSelectMood: (mood: MoodCategory) => void;
  config: PushRequestConfig;
  onChangeConfig: (updated: Partial<PushRequestConfig>) => void;
  language: 'fr' | 'us';
  onSelectLanguage?: (lang: 'fr' | 'us') => void;
  onOpenAddModel: () => void;
}

export const CleanStudioConfig: React.FC<CleanStudioConfigProps> = ({
  models,
  selectedModelId,
  onSelectModel,
  onEditModel,
  onDeleteModel,
  selectedMood,
  onSelectMood,
  config,
  onChangeConfig,
  language,
  onSelectLanguage,
  onOpenAddModel
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const selectedModel = models.find(m => m.id === selectedModelId) || models[0];

  const getMoodIcon = (iconName: string) => {
    switch (iconName) {
      case 'Heart': return <Heart className="w-3.5 h-3.5 text-rose-400" />;
      case 'Flame': return <Flame className="w-3.5 h-3.5 text-amber-400" />;
      case 'Sun': return <Sun className="w-3.5 h-3.5 text-orange-400" />;
      case 'Droplets': return <Droplets className="w-3.5 h-3.5 text-sky-400" />;
      case 'Moon': return <Moon className="w-3.5 h-3.5 text-indigo-400" />;
      case 'Crown': return <Crown className="w-3.5 h-3.5 text-purple-400" />;
      case 'Zap': return <Zap className="w-3.5 h-3.5 text-yellow-400" />;
      default: return <Sparkles className="w-3.5 h-3.5 text-emerald-400" />;
    }
  };

  const isPaid = config.pushType === 'paid_ppv';

  return (
    <div className="bg-[#121218] border border-white/10 rounded-2xl p-5 shadow-xl space-y-4">
      {/* 1. Type de Mass Message : Payant (PPV) vs Simple (Gratuit/Relationnel) */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-1.5">
            <span>1. Type de Mass Message</span>
          </label>
          <span className="text-[10px] text-zinc-400 font-mono">
            {isPaid ? 'Média payant à débloquer' : 'Message direct relationnel'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onChangeConfig({ 
              pushType: 'paid_ppv',
              callToAction: 'unlock_ppv',
              mediaType: config.mediaType === 'none' ? 'video_clip' : config.mediaType
            })}
            className={`p-3 rounded-xl border text-left transition flex items-start gap-2.5 ${
              isPaid
                ? 'bg-rose-500/15 border-rose-500/60 text-white shadow-sm ring-1 ring-rose-500/40'
                : 'bg-white/[0.02] border-white/5 text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
            }`}
          >
            <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
              isPaid ? 'bg-rose-500 text-white' : 'bg-black/40 text-zinc-400'
            }`}>
              <Lock className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold flex items-center gap-1">
                <span>Mass Message Payant</span>
                {isPaid && <Check className="w-3 h-3 text-rose-400" />}
              </div>
              <div className="text-[10px] text-zinc-400 mt-0.5 leading-snug">
                PPV verrouillé, média exclusif payant (Teasing d'achat & déblocage)
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onChangeConfig({ 
              pushType: 'free_retention',
              callToAction: 'dm_talk',
              priceSuggestion: 0
            })}
            className={`p-3 rounded-xl border text-left transition flex items-start gap-2.5 ${
              !isPaid
                ? 'bg-emerald-500/15 border-emerald-500/60 text-white shadow-sm ring-1 ring-emerald-500/40'
                : 'bg-white/[0.02] border-white/5 text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
            }`}
          >
            <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
              !isPaid ? 'bg-emerald-500 text-black font-bold' : 'bg-black/40 text-zinc-400'
            }`}>
              <MessageCircle className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold flex items-center gap-1">
                <span>Mass Message Simple</span>
                {!isPaid && <Check className="w-3 h-3 text-emerald-400" />}
              </div>
              <div className="text-[10px] text-zinc-400 mt-0.5 leading-snug">
                Gratuit / Rétention, relance complice ou affirmation pour engager la discussion
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* 2. Longueur & Nombre de phrases (Contrôle concision demandé par l'utilisateur) */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-1.5">
            <AlignLeft className="w-3.5 h-3.5 text-indigo-400" />
            <span>2. Longueur du message (Simple & Direct)</span>
          </label>
          <span className="text-[10px] text-emerald-400 font-medium">
            1 phrase = 0 blabla
          </span>
        </div>

        <div className="grid grid-cols-4 gap-1.5">
          <button
            type="button"
            onClick={() => onChangeConfig({ sentenceCount: 'one_line' })}
            className={`py-2 px-1.5 rounded-xl border text-center transition flex flex-col items-center justify-center ${
              config.sentenceCount === 'one_line'
                ? 'bg-emerald-500/20 border-emerald-500/60 text-white ring-1 ring-emerald-500/40'
                : 'bg-white/[0.02] border-white/5 text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
            }`}
          >
            <span className="text-xs font-bold text-emerald-300">1 phrase</span>
            <span className="text-[9px] text-zinc-400">Ultra-simple</span>
          </button>

          <button
            type="button"
            onClick={() => onChangeConfig({ sentenceCount: 'ultra_short' })}
            className={`py-2 px-1.5 rounded-xl border text-center transition flex flex-col items-center justify-center ${
              config.sentenceCount === 'ultra_short'
                ? 'bg-indigo-500/20 border-indigo-500/60 text-white ring-1 ring-indigo-500/40'
                : 'bg-white/[0.02] border-white/5 text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
            }`}
          >
            <span className="text-xs font-bold">1-2 phrases</span>
            <span className="text-[9px] text-zinc-400">SMS court</span>
          </button>

          <button
            type="button"
            onClick={() => onChangeConfig({ sentenceCount: 'short' })}
            className={`py-2 px-1.5 rounded-xl border text-center transition flex flex-col items-center justify-center ${
              config.sentenceCount === 'short'
                ? 'bg-indigo-500/20 border-indigo-500/60 text-white ring-1 ring-indigo-500/40'
                : 'bg-white/[0.02] border-white/5 text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
            }`}
          >
            <span className="text-xs font-bold">2 phrases</span>
            <span className="text-[9px] text-zinc-400">Court</span>
          </button>

          <button
            type="button"
            onClick={() => onChangeConfig({ sentenceCount: 'medium' })}
            className={`py-2 px-1.5 rounded-xl border text-center transition flex flex-col items-center justify-center ${
              config.sentenceCount === 'medium'
                ? 'bg-indigo-500/20 border-indigo-500/60 text-white ring-1 ring-indigo-500/40'
                : 'bg-white/[0.02] border-white/5 text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
            }`}
          >
            <span className="text-xs font-bold">2-3 phrases</span>
            <span className="text-[9px] text-zinc-400">Détaillé</span>
          </button>
        </div>
      </div>

      {/* 3. Modèle & Voix - Visible Card Grid & Instant Switcher */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <label className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5 text-rose-400" />
            <span>3. Modèle & Voix</span>
            <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-white/5 text-zinc-400 border border-white/5">
              {models.length} {models.length > 1 ? 'profils' : 'profil'}
            </span>
          </label>
          <button
            type="button"
            onClick={onOpenAddModel}
            className="text-[11px] font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1 transition px-2 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 cursor-pointer"
          >
            <Plus className="w-3 h-3" /> Ajouter un modèle
          </button>
        </div>

        {/* Responsive Grid: All models are directly visible and easy to switch */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {models.map(m => {
            const isSel = m.id === selectedModelId;
            const isCustom = m.id.startsWith('model-');
            return (
              <div
                key={m.id}
                onClick={() => onSelectModel(m.id)}
                className={`group relative p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                  isSel
                    ? 'bg-rose-500/15 border-rose-500/70 shadow-lg shadow-rose-500/10 ring-2 ring-rose-500/30'
                    : 'bg-white/[0.02] border-white/5 hover:border-white/20 hover:bg-white/[0.05] text-zinc-400'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="relative">
                    <img
                      src={m.avatar}
                      alt={m.name}
                      className={`w-9 h-9 rounded-xl object-cover ring-1 ${
                        isSel ? 'ring-rose-500 shadow-md' : 'ring-white/10'
                      }`}
                      referrerPolicy="no-referrer"
                    />
                    {isSel && (
                      <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-rose-500 text-white flex items-center justify-center text-[8px] font-bold shadow">
                        ✓
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/40 border border-white/5 text-zinc-300">
                      {m.defaultLanguage === 'us' ? '🇺🇸' : '🇫🇷'}
                    </span>
                    {onEditModel && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditModel(m);
                        }}
                        title="Modifier ce persona"
                        className="opacity-60 group-hover:opacity-100 p-1 rounded-md text-zinc-400 hover:text-indigo-400 hover:bg-white/10 transition cursor-pointer"
                      >
                        <Pencil className="w-3 h-3" />
                      </button>
                    )}
                    {onDeleteModel && (isCustom || models.length > 1) && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Supprimer le profil ${m.name} ?`)) {
                            onDeleteModel(m.id);
                          }
                        }}
                        title="Supprimer ce profil"
                        className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-zinc-500 hover:text-rose-400 hover:bg-white/10 transition cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold truncate ${isSel ? 'text-white' : 'text-zinc-200'}`}>
                      {m.name}
                    </span>
                    <span className="text-[10px] text-zinc-500">
                      {m.age} ans
                    </span>
                  </div>
                  <div className="text-[10px] text-zinc-400 truncate mt-0.5">
                    {m.favoriteEmojis?.slice(0, 3).join(' ')} • {m.realLifeOccupation?.split(' ')[0] || 'Modèle'}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Quick "+ Ajouter" card in grid */}
          <button
            type="button"
            onClick={onOpenAddModel}
            className="p-2.5 rounded-xl border border-dashed border-white/15 bg-white/[0.01] hover:bg-rose-500/5 hover:border-rose-500/40 text-zinc-400 hover:text-rose-300 transition flex flex-col items-center justify-center gap-1 text-center min-h-[72px] cursor-pointer"
          >
            <div className="p-1 rounded-lg bg-white/5 text-zinc-400 group-hover:text-rose-400">
              <Plus className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-medium">+ Autre Modèle</span>
          </button>
        </div>

        {/* Selected model active summary & quick language switch */}
        {selectedModel && (
          <div className="mt-2.5 p-3 rounded-xl bg-gradient-to-r from-rose-500/10 via-white/[0.02] to-transparent border border-rose-500/20 text-[11px] space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Voix active : {selectedModel.name}, {selectedModel.age} ans
                  {selectedModel.location && (
                    <span className="text-[10px] text-zinc-400 font-normal">({selectedModel.location})</span>
                  )}
                </span>
                <span className="text-zinc-400">({selectedModel.favoriteEmojis?.join('')})</span>
              </div>

              <div className="flex items-center gap-2">
                {onEditModel && (
                  <button
                    type="button"
                    onClick={() => onEditModel(selectedModel)}
                    className="px-2 py-0.5 rounded-lg bg-white/10 hover:bg-white/20 text-zinc-200 hover:text-white transition flex items-center gap-1 text-[10px] font-semibold cursor-pointer"
                  >
                    <Pencil className="w-2.5 h-2.5 text-rose-400" />
                    <span>Modifier ce persona</span>
                  </button>
                )}

                {/* Instant Language Switcher for current model */}
                {onSelectLanguage && (
                  <div className="flex items-center gap-1 bg-black/40 p-0.5 rounded-lg border border-white/10 text-[10px]">
                    <button
                      type="button"
                      onClick={() => onSelectLanguage('fr')}
                      className={`px-1.5 py-0.5 rounded font-bold transition cursor-pointer ${
                        language === 'fr'
                          ? 'bg-rose-500 text-white shadow-xs'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      🇫🇷 FR
                    </button>
                    <button
                      type="button"
                      onClick={() => onSelectLanguage('us')}
                      className={`px-1.5 py-0.5 rounded font-bold transition cursor-pointer ${
                        language === 'us'
                          ? 'bg-indigo-500 text-white shadow-xs'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      🇺🇸 US
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-zinc-300 pt-1.5 border-t border-white/5">
              <div>
                <span className="text-zinc-500 font-medium">Vie réelle : </span>
                <span>{selectedModel.realLifeOccupation || 'Créatrice & passionnée de mode'}</span>
              </div>
              <div>
                <span className="text-rose-400/90 font-medium">🏡 Cadre maison : </span>
                <span className="text-zinc-300 truncate">{selectedModel.homeHabits || 'Chambre, miroir, lit et moments cosy'}</span>
              </div>
              {selectedModel.objective && (
                <div className="sm:col-span-2">
                  <span className="text-emerald-400/90 font-medium">🎯 Objectif : </span>
                  <span className="text-zinc-300">{selectedModel.objective}</span>
                </div>
              )}
              {selectedModel.tone && (
                <div>
                  <span className="text-amber-400/90 font-medium">🎙️ Ton : </span>
                  <span className="text-zinc-300">{selectedModel.tone}</span>
                </div>
              )}
              {selectedModel.themes && selectedModel.themes.length > 0 && (
                <div>
                  <span className="text-purple-400/90 font-medium">🎨 Thèmes : </span>
                  <span className="text-zinc-300 truncate">{selectedModel.themes.join(', ')}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 4. Mood & Vibe */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
            4. Vibe & Circonstance
          </label>
          <span className="text-[10px] text-zinc-500 font-mono">
            Adapte la tonalité intime
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {MOODS.map(item => {
            const isSel = selectedMood === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectMood(item.id)}
                className={`p-2 rounded-xl border text-left transition flex items-center gap-2 ${
                  isSel
                    ? 'bg-gradient-to-r from-amber-500/15 to-orange-500/10 border-amber-500/60 text-white shadow-sm ring-1 ring-amber-500/30'
                    : 'bg-white/[0.02] border-white/5 text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
                }`}
              >
                <div className="p-1 rounded-lg bg-black/40 border border-white/5 shrink-0">
                  {getMoodIcon(item.iconName)}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold truncate">
                    {language === 'us' ? item.nameEn : item.name}
                  </div>
                  <div className="text-[10px] text-zinc-400 truncate">
                    {item.badge}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. Essential Media & Pitch */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
            {isPaid ? '5. Ce qui se passe sur le média (Description)' : '5. Sujet ou Contexte du message'}
          </label>
          <span className="text-[10px] text-rose-400 font-medium">
            Clé d'un push 100% humain
          </span>
        </div>
        <input
          type="text"
          value={config.mediaContext}
          onChange={e => onChangeConfig({ mediaContext: e.target.value })}
          placeholder={
            isPaid 
              ? "Ex: Nuisette en satin rose qui glisse sur mes épaules... ou sortie de douche avec mes cheveux trempés"
              : "Ex: Je m'ennuie sous ma couette, j'ai envie de papoter un peu avec mon fan favori"
          }
          className="w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-rose-500 transition shadow-inner"
        />
      </div>

      {/* 6. Quick essentials: Media Format & Price (Only for Paid PPV) */}
      {isPaid ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div>
            <label className="text-[11px] font-medium text-zinc-400 block mb-1">
              Format média joint
            </label>
            <select
              value={config.mediaType}
              onChange={e => onChangeConfig({ mediaType: e.target.value as any })}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
            >
              <option value="video_clip">Vidéo courte intime (Teaser/Clip)</option>
              <option value="full_tape">Vidéo complète / Solo tape / Sextape</option>
              <option value="photo_set">Galerie photos privées (3-8 clichés)</option>
              <option value="audio_voice">Note vocale chuchotée / Audio intime</option>
              <option value="exclusive_bundle">Pack VIP (Vidéos + Photos)</option>
              <option value="none">Simple message texte</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-medium text-zinc-400 block mb-1">
              Prix suggéré de déblocage PPV
            </label>
            <div className="relative">
              <input
                type="number"
                min={0}
                max={150}
                value={config.priceSuggestion || ''}
                onChange={e => onChangeConfig({ priceSuggestion: parseFloat(e.target.value) || 0 })}
                placeholder="15"
                className="w-full bg-black/40 border border-white/10 rounded-xl pl-8 pr-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500 font-mono"
              />
              <span className="absolute left-3 top-2 text-xs text-zinc-500 font-bold">
                {language === 'us' ? '$' : '€'}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span><strong>Mass Message Gratuit :</strong> Zéro barrière de prix. L'IA génère des accroches concises orientées conversation DM.</span>
          </div>
        </div>
      )}

      {/* Collapsible Advanced Settings */}
      <div className="pt-2 border-t border-white/5">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full flex items-center justify-between text-xs text-zinc-400 hover:text-zinc-200 py-1 transition cursor-pointer"
        >
          <span className="flex items-center gap-1.5 font-medium">
            <SlidersHorizontal className="w-3.5 h-3.5 text-zinc-500" />
            Paramètres avancés (Audience, Niveau Hot : {config.hotLevel}/5)
          </span>
          {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showAdvanced && (
          <div className="mt-3 pt-3 border-t border-white/5 space-y-3 animate-in fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">Cible d'abonnés</label>
                <select
                  value={config.targetAudience}
                  onChange={e => onChangeConfig({ targetAudience: e.target.value as any })}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-rose-500"
                >
                  <option value="all_subs">Tous les abonnés actifs</option>
                  <option value="renew_on">Renouvellement automatique actif</option>
                  <option value="vip_spenders">Top Spenders / VIP</option>
                  <option value="inactive_subs">Abonnés inactifs (relance)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">
                  Intensité coquine / Hot Level ({config.hotLevel}/5)
                </label>
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[10px] text-zinc-500">GFE</span>
                  <input
                    type="range"
                    min={1}
                    max={5}
                    value={config.hotLevel}
                    onChange={e => onChangeConfig({ hotLevel: parseInt(e.target.value, 10) })}
                    className="flex-1 accent-rose-500 cursor-pointer"
                  />
                  <span className="text-[10px] text-rose-400 font-semibold">Explicite</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
