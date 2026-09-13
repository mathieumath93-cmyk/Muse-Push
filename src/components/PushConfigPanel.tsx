import React from 'react';
import { PushRequestConfig } from '../types';
import { Camera, DollarSign, MessageCircle, Users, Flame } from 'lucide-react';

interface PushConfigPanelProps {
  config: PushRequestConfig;
  onChange: (updated: Partial<PushRequestConfig>) => void;
}

export const PushConfigPanel: React.FC<PushConfigPanelProps> = ({ config, onChange }) => {
  return (
    <div className="bg-[#121218] border border-white/10 rounded-2xl p-4 sm:p-5 shadow-xl mb-6">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
        <h2 className="text-sm font-semibold tracking-wide text-zinc-200 uppercase flex items-center gap-2">
          <Camera className="w-4 h-4 text-purple-400" />
          3. Paramètres Média & Psychologie du Push
        </h2>
        <span className="text-xs text-zinc-400">
          Détails réalistes pour éviter les tournures impersonnelles
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Type de média */}
        <div>
          <label className="text-xs font-medium text-zinc-300 block mb-1.5 flex items-center justify-between">
            <span>Type de contenu joint</span>
            <span className="text-[10px] text-zinc-500 font-mono">Attachment</span>
          </label>
          <select
            value={config.mediaType}
            onChange={e => onChange({ mediaType: e.target.value as any })}
            className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 transition"
          >
            <option value="video_clip">Vidéo courte intime (Teaser / Preview)</option>
            <option value="full_tape">Vidéo complète / Solo tape / Sextape</option>
            <option value="photo_set">Galerie photos privées (3-8 clichés)</option>
            <option value="audio_voice">Note vocale chuchotée / Audio intime</option>
            <option value="exclusive_bundle">Pack VIP (Vidéos + Photos exclusives)</option>
            <option value="none">Simple message texte (Sans média payant)</option>
          </select>
        </div>

        {/* Prix suggéré */}
        <div>
          <label className="text-xs font-medium text-zinc-300 block mb-1.5 flex items-center justify-between">
            <span>Prix suggéré de déblocage PPV</span>
            <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-0.5">
              <DollarSign className="w-2.5 h-2.5" /> Optimal
            </span>
          </label>
          <div className="relative">
            <input
              type="number"
              min={0}
              max={150}
              step={1}
              value={config.priceSuggestion || ''}
              onChange={e => onChange({ priceSuggestion: parseFloat(e.target.value) || 0 })}
              placeholder="Ex: 15"
              className="w-full bg-black/40 border border-white/10 rounded-xl pl-8 pr-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 font-mono transition"
            />
            <span className="absolute left-3 top-2 text-xs text-zinc-500">
              {config.language === 'us' ? '$' : '€'}
            </span>
          </div>
        </div>

        {/* Cible d'audience */}
        <div>
          <label className="text-xs font-medium text-zinc-300 block mb-1.5 flex items-center justify-between">
            <span>Audience ciblée</span>
            <Users className="w-3 h-3 text-zinc-500" />
          </label>
          <select
            value={config.targetAudience}
            onChange={e => onChange({ targetAudience: e.target.value as any })}
            className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 transition"
          >
            <option value="all_subs">Tous les abonnés actifs (Mass Blast)</option>
            <option value="renew_on">Abonnés avec Renouvellement Actif</option>
            <option value="vip_spenders">Top Spenders / VIP (Paniers élevés)</option>
            <option value="inactive_subs">Abonnés inactifs (Relance douce)</option>
          </select>
        </div>
      </div>

      {/* Description du contenu réel (ce qui se passe) */}
      <div className="mb-4">
        <label className="text-xs font-medium text-zinc-300 block mb-1.5 flex items-center justify-between">
          <span>Que voit le fan sur ce média ? (Contexte visuel / Action)</span>
          <span className="text-[10px] text-zinc-400 italic">
            Permet à l'IA d'accrocher sur un détail croustillant
          </span>
        </label>
        <input
          type="text"
          value={config.mediaContext}
          onChange={e => onChange({ mediaContext: e.target.value })}
          placeholder="Ex: Petite nuisette en soie rose qui glisse sur l'épaule... ou sortie de douche avec les cheveux encore mouillés"
          className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-purple-500 transition"
        />
      </div>

      {/* Hot level slider */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-white/5">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-rose-500" />
          <span className="text-xs font-medium text-zinc-300">
            Niveau d'audace du message (Hot Scale) :
          </span>
          <span className="text-xs font-bold text-rose-400 font-mono px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/20">
            {config.hotLevel}/5
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-zinc-500">Doux/GFE</span>
          <input
            type="range"
            min={1}
            max={5}
            value={config.hotLevel}
            onChange={e => onChange({ hotLevel: parseInt(e.target.value, 10) })}
            className="w-36 accent-rose-500 cursor-pointer"
          />
          <span className="text-[11px] text-rose-400 font-semibold">Explicite/Torride</span>
        </div>
      </div>
    </div>
  );
};
