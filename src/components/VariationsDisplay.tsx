import React, { useState } from 'react';
import { GeneratedVariation, GenerationResult } from '../types';
import { 
  Copy, 
  Check, 
  Sparkles, 
  Smartphone, 
  TrendingUp, 
  ShieldCheck, 
  Clock, 
  Share2,
  DollarSign,
  Heart
} from 'lucide-react';

interface VariationsDisplayProps {
  result: GenerationResult | null;
  loading: boolean;
  platform: 'onlyfans' | 'mym';
  modelName: string;
  pushType?: 'paid_ppv' | 'free_retention';
}

export const VariationsDisplay: React.FC<VariationsDisplayProps> = ({
  result,
  loading,
  platform,
  modelName,
  pushType = 'paid_ppv'
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activePreviewId, setActivePreviewId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  if (loading) {
    return (
      <div className="bg-[#121218] border border-white/10 rounded-2xl p-12 text-center shadow-xl">
        <div className="w-12 h-12 rounded-full border-2 border-rose-500 border-t-transparent animate-spin mx-auto mb-4" />
        <h3 className="text-base font-semibold text-white mb-1 flex items-center justify-center gap-2">
          <Sparkles className="w-4 h-4 text-rose-400 animate-pulse" />
          Rédaction IA en cours via OpenRouter...
        </h3>
        <p className="text-xs text-zinc-400 max-w-sm mx-auto">
          Calibrage du persona féminin, optimisation psychologique de l'accroche et ajustement selon le fuseau horaire.
        </p>
      </div>
    );
  }

  if (!result || !result.variations.length) {
    return (
      <div className="bg-[#121218] border border-dashed border-white/10 rounded-2xl p-10 text-center">
        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-3 text-zinc-500">
          <Sparkles className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-semibold text-zinc-300 mb-1">
          Aucun push généré pour le moment
        </h3>
        <p className="text-xs text-zinc-500 max-w-md mx-auto">
          Choisis ton modèle, le mood souhaité et clique sur <strong>"Générer les variations de Mass Push"</strong> pour obtenir 6 propositions d'accroches variées prêtes à l'envoi.
        </p>
      </div>
    );
  }

  const previewItem = result.variations.find(v => v.id === activePreviewId) || result.variations[0];

  return (
    <div className="space-y-6">
      {/* Top Strategic Advisory Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-[#15151e] border border-white/5 rounded-xl p-3.5 flex items-start gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">Créneau optimal fans</div>
            <div className="text-xs font-bold text-white mt-0.5">{result.recommendations.bestSendTimeFanTz}</div>
            <div className="text-[11px] text-zinc-500">{result.recommendations.currentFanLocalTime}</div>
          </div>
        </div>

        <div className="bg-[#15151e] border border-white/5 rounded-xl p-3.5 flex items-start gap-3">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 shrink-0">
            <DollarSign className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">Conseil Prix PPV</div>
            <div className="text-xs font-bold text-white mt-0.5">{result.recommendations.pricingTip}</div>
          </div>
        </div>

        <div className="bg-[#15151e] border border-white/5 rounded-xl p-3.5 flex items-start gap-3">
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">Audit Sécurité & CGU</div>
            <div className="text-xs font-bold text-white mt-0.5">{result.recommendations.safetyAudit}</div>
            <div className="text-[11px] text-indigo-300 font-mono">Source: {result.source === 'openrouter' ? 'OpenRouter Live' : 'Moteur Studio'}</div>
          </div>
        </div>
      </div>

      {/* Main Split: Variations List (Left/Center) + Realistic Smartphone Mockup (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column: 3 generated angles */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-rose-400" />
              <span>{result.variations.length} Variations Disponibles</span>
              <span className="text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded-full font-bold uppercase">
                A/B Testing 6+
              </span>
            </h3>
            <span className="text-xs text-zinc-500 font-mono">
              Modèle utilisé: {result.modelUsed}
            </span>
          </div>

          {result.variations.map((item, idx) => {
            const isCopied = copiedId === item.id;
            const isPreviewed = previewItem.id === item.id;

            return (
              <div
                key={item.id}
                className={`rounded-2xl p-4 border transition-all duration-200 relative group ${
                  isPreviewed
                    ? 'bg-white/[0.04] border-rose-500/50 shadow-[0_0_20px_rgba(244,63,94,0.1)] ring-1 ring-rose-500/30'
                    : 'bg-[#121218] border-white/5 hover:border-white/15'
                }`}
              >
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/25">
                      Angle #{idx + 1} • {item.angleLabel}
                    </span>
                    <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" /> {item.estimatedOpenRate} estimé
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setActivePreviewId(item.id)}
                      className="text-[11px] px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 flex items-center gap-1 transition"
                      title="Aperçu sur smartphone"
                    >
                      <Smartphone className="w-3 h-3 text-zinc-400" /> Aperçu
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCopy(item.message, item.id)}
                      className={`text-[11px] px-3 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition ${
                        isCopied
                          ? 'bg-emerald-500 text-black'
                          : 'bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white shadow-sm'
                      }`}
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5 stroke-[3]" /> Copié !
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" /> Copier
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Message preview block */}
                <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 font-sans text-sm text-zinc-100 whitespace-pre-line leading-relaxed selection:bg-rose-500 selection:text-white">
                  {item.message}
                </div>

                <div className="mt-2.5 flex items-center justify-between text-[11px] text-zinc-400">
                  <span className="truncate max-w-[280px]">
                    💡 {item.timeContextNote}
                  </span>
                  {item.suggestedPrice && (
                    <span className="font-mono text-amber-300 font-semibold shrink-0">
                      PPV: {item.suggestedPrice}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right column: Realistic In-App Smartphone View */}
        <div className="lg:col-span-5">
          <div className="sticky top-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase tracking-wider font-semibold text-zinc-400 flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-rose-400" /> Aperçu Réaliste Fan ({platform === 'onlyfans' ? 'OnlyFans' : 'MYM'})
              </span>
              <span className="text-[10px] text-zinc-500">Live Render</span>
            </div>

            {/* Phone container */}
            <div className="w-full max-w-[320px] mx-auto rounded-[36px] bg-[#0c0c12] border-4 border-[#22222e] shadow-2xl p-3 relative overflow-hidden">
              {/* Dynamic Island / Speaker */}
              <div className="w-24 h-4 bg-black rounded-full mx-auto mb-3" />

              {/* In-app header */}
              <div className="flex items-center justify-between pb-2 border-b border-white/5 px-1 mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-rose-500 flex items-center justify-center text-white font-bold text-xs">
                    {modelName.charAt(0)}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-1">
                      {modelName}
                      <span className="text-[9px] text-blue-400">✓</span>
                    </div>
                    <div className="text-[10px] text-emerald-400 font-mono">En ligne maintenant</div>
                  </div>
                </div>
                <div className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-zinc-300 font-mono uppercase">
                  {platform}
                </div>
              </div>

              {/* Chat Bubble Simulation */}
              <div className="space-y-2 py-2">
                <div className="flex items-end gap-1.5">
                  <div className="w-6 h-6 rounded-full bg-rose-500/30 flex items-center justify-center text-[10px] text-rose-300 shrink-0">
                    {modelName.charAt(0)}
                  </div>
                  <div className="bg-[#1e1e2d] border border-white/10 rounded-2xl rounded-bl-sm p-3 max-w-[85%] text-xs text-zinc-100 whitespace-pre-line leading-relaxed shadow-lg">
                    {previewItem.message}

                    {/* Fake Media Lock Attachment (Only for Paid PPV) */}
                    {pushType === 'paid_ppv' ? (
                      <div className="mt-2.5 p-2 rounded-xl bg-black/60 border border-white/10 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-rose-500/20 flex items-center justify-center text-rose-400">
                            🔒
                          </div>
                          <div>
                            <div className="text-[11px] font-semibold text-white">Média Exclusif</div>
                            <div className="text-[9px] text-zinc-400">Déverrouillage instantané</div>
                          </div>
                        </div>
                        <div className="px-2.5 py-1 rounded-lg bg-rose-500 text-white font-bold text-xs shadow">
                          {previewItem.suggestedPrice || '15€'}
                        </div>
                      </div>
                    ) : (
                      <div className="mt-2 p-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
                        <span className="text-[10px] text-emerald-300 font-medium flex items-center gap-1">
                          ✨ Message offert / Réponse en DM
                        </span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                          Gratuit
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-[9px] text-right text-zinc-500 font-mono pr-2">
                  Vu à l'instant
                </div>
              </div>

              {/* Input field fake */}
              <div className="mt-4 pt-2 border-t border-white/5 flex items-center gap-2">
                <div className="flex-1 bg-white/5 rounded-full px-3 py-1.5 text-[11px] text-zinc-500">
                  Envoyer un message ou un pourboire...
                </div>
                <div className="w-7 h-7 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center text-xs">
                  <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
