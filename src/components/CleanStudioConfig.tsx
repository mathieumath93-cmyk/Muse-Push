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
  FileText
} from 'lucide-react';

interface CleanStudioConfigProps {
  models: ModelProfile[];
  selectedModelId: string;
  onSelectModel: (id: string) => void;
  selectedMood: MoodCategory;
  onSelectMood: (mood: MoodCategory) => void;
  config: PushRequestConfig;
  onChangeConfig: (updated: Partial<PushRequestConfig>) => void;
  language: 'fr' | 'us';
  onOpenAddModel: () => void;
}

export const CleanStudioConfig: React.FC<CleanStudioConfigProps> = ({
  models,
  selectedModelId,
  onSelectModel,
  selectedMood,
  onSelectMood,
  config,
  onChangeConfig,
  language,
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

      {/* 3. Model chips bar */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
            <span>3. Modèle & Voix</span>
          </label>
          <button
            type="button"
            onClick={onOpenAddModel}
            className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1 transition cursor-pointer"
          >
            <Plus className="w-3 h-3" /> Nouveau profil
          </button>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {models.map(m => {
            const isSel = m.id === selectedModelId;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => onSelectModel(m.id)}
                className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl border text-left transition shrink-0 ${
                  isSel
                    ? 'bg-rose-500/15 border-rose-500/60 shadow-sm ring-1 ring-rose-500/40 text-white'
                    : 'bg-white/[0.03] border-white/5 text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.06]'
                }`}
              >
                <img
                  src={m.avatar}
                  alt={m.name}
                  className="w-7 h-7 rounded-lg object-cover ring-1 ring-white/10"
                  referrerPolicy="no-referrer"
                />
                <div className="leading-tight">
                  <div className="text-xs font-bold flex items-center gap-1">
                    {m.name}
                    {isSel && <Check className="w-3 h-3 text-rose-400" />}
                  </div>
                  <div className="text-[10px] text-zinc-400 font-mono">
                    {m.favoriteEmojis.slice(0, 2).join('')} • {m.age} ans
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected model lifestyle & home context info */}
        {selectedModel && (
          <div className="mt-2 p-2.5 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px]">
            <div className="flex items-center gap-2">
              <span className="text-zinc-500 font-medium shrink-0">Vie réelle :</span>
              <span className="text-zinc-200 font-semibold">{selectedModel.realLifeOccupation || 'Créatrice glamour & mode'}</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-400">
              <span className="text-rose-400/80 font-medium shrink-0">🏡 Cadre maison :</span>
              <span className="text-zinc-300 truncate max-w-xs">{selectedModel.homeHabits || 'Chambre, miroir, colis lingerie'}</span>
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
