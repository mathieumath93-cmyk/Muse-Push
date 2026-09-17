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
  Heart,
  RefreshCw,
  Sliders,
  CheckCircle2,
  Zap
} from 'lucide-react';

interface VariationsDisplayProps {
  result: GenerationResult | null;
  loading: boolean;
  platform: 'onlyfans' | 'mym';
  modelName: string;
  pushType?: 'paid_ppv' | 'free_retention';
  onRegenerateFresh?: () => void;
  onResetHistory?: () => void;
  historyCount?: number;
  selectedLlmModel?: string;
  onSelectLlmModel?: (modelId: string) => void;
  onOpenSettings?: () => void;
}

export const VariationsDisplay: React.FC<VariationsDisplayProps> = ({
  result,
  loading,
  platform,
  modelName,
  pushType = 'paid_ppv',
  onRegenerateFresh,
  onResetHistory,
  historyCount = 0,
  selectedLlmModel,
  onSelectLlmModel,
  onOpenSettings
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activePreviewId, setActivePreviewId] = useState<string | null>(null);
  const [rateLimitCountdown, setRateLimitCountdown] = useState<number>(20);
  const [isBannerDismissed, setIsBannerDismissed] = useState<boolean>(false);

  // Countdown timer for OpenRouter free tier rate limits (20 req/min)
  React.useEffect(() => {
    setIsBannerDismissed(false);
    const isRateLimit = result?.openRouterStatus?.error?.includes('Quota') ||
      result?.openRouterStatus?.error?.includes('rate limit') ||
      result?.openRouterStatus?.error?.includes('20 req/min');

    if (isRateLimit && result?.openRouterStatus?.attempted && !result.openRouterStatus.success) {
      setRateLimitCountdown(20);
      const interval = setInterval(() => {
        setRateLimitCountdown(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [result?.openRouterStatus?.error, result?.openRouterStatus?.attempted]);

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
            <div className="text-[11px] text-indigo-300 font-mono">
              {result.source === 'openrouter' ? '🟢 OpenRouter Actif' : '⚡ Moteur Haute Conversion'}
            </div>
          </div>
        </div>
      </div>

      {/* Proactive OpenRouter Execution Status Banner */}
      {!isBannerDismissed && result.openRouterStatus?.attempted && !result.openRouterStatus.success && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 space-y-3 text-xs text-amber-200 relative">
          <button
            type="button"
            onClick={() => setIsBannerDismissed(true)}
            className="absolute top-3 right-3 text-zinc-400 hover:text-white p-1 rounded transition"
            title="Masquer ce message"
          >
            ✕
          </button>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pr-6">
            <div className="flex items-start gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0 mt-1 animate-pulse" />
              <div className="space-y-1">
                <div className="font-semibold text-amber-300 flex items-center gap-2">
                  <span>OpenRouter : Quota gratuit temporaire (20 req/min)</span>
                  {rateLimitCountdown > 0 ? (
                    <span className="text-[10px] bg-amber-400/20 text-amber-300 font-mono px-2 py-0.5 rounded-full border border-amber-400/30">
                      Dispo dans {rateLimitCountdown}s
                    </span>
                  ) : (
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-mono px-2 py-0.5 rounded-full border border-emerald-500/30">
                      ✓ Prêt à relancer
                    </span>
                  )}
                </div>
                <p className="text-zinc-300 text-[11px] leading-relaxed">
                  OpenRouter plafonne les modèles gratuits à 20 req/min. Le <strong className="text-white">Moteur Créatif Studio</strong> a immédiatement pris le relais pour générer tes 6 propositions ci-dessous sans blocage.
                </p>
              </div>
            </div>
            <span className="text-[10px] font-mono text-amber-300 bg-black/50 px-2.5 py-1 rounded-lg border border-amber-500/20 shrink-0 self-start sm:self-auto">
              Fallback Studio Actif
            </span>
          </div>

          {/* Quick Actions Bar */}
          <div className="pt-2 border-t border-amber-500/20 flex flex-wrap items-center gap-2">
            <span className="text-[11px] text-zinc-400 font-medium">Bascule rapide sur un autre modèle Free :</span>

            <button
              type="button"
              onClick={() => {
                if (onSelectLlmModel) {
                  onSelectLlmModel('meta-llama/llama-3.3-70b-instruct:free');
                  setTimeout(() => onRegenerateFresh && onRegenerateFresh(), 100);
                }
              }}
              className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white font-medium text-[11px] border border-white/10 transition flex items-center gap-1 cursor-pointer"
            >
              <span>🦙</span>
              <span>Llama 3.3 70B Free</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (onSelectLlmModel) {
                  onSelectLlmModel('mistralai/mistral-small-24b-instruct-2501:free');
                  setTimeout(() => onRegenerateFresh && onRegenerateFresh(), 100);
                }
              }}
              className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white font-medium text-[11px] border border-white/10 transition flex items-center gap-1 cursor-pointer"
            >
              <span>🌪️</span>
              <span>Mistral Small Free</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (onSelectLlmModel) {
                  onSelectLlmModel('openrouter/free');
                  setTimeout(() => onRegenerateFresh && onRegenerateFresh(), 100);
                }
              }}
              className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white font-medium text-[11px] border border-white/10 transition flex items-center gap-1 cursor-pointer"
            >
              <span>🌐</span>
              <span>Auto Free</span>
            </button>

            {onRegenerateFresh && (
              <button
                type="button"
                onClick={onRegenerateFresh}
                className="ml-auto px-3 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 font-semibold text-[11px] border border-amber-500/30 transition flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3 text-amber-300" />
                <span>{rateLimitCountdown > 0 ? `Relancer (${rateLimitCountdown}s)` : 'Relancer maintenant'}</span>
              </button>
            )}

            {onOpenSettings && (
              <button
                type="button"
                onClick={onOpenSettings}
                className="px-2 py-1 text-[11px] text-zinc-400 hover:text-white underline cursor-pointer"
              >
                Gérer mes clés & modèles
              </button>
            )}
          </div>
        </div>
      )}

      {result.source === 'openrouter' && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-2 flex items-center justify-between text-xs text-emerald-200">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            <span>
              Génération confirmée via <strong>OpenRouter ({result.modelUsed})</strong>
              {result.openRouterStatus?.latencyMs ? ` en ${result.openRouterStatus.latencyMs}ms` : ''}.
            </span>
          </div>
          <span className="text-[10px] font-mono text-emerald-300 bg-black/40 px-2 py-0.5 rounded border border-emerald-500/20">
            OpenRouter OK
          </span>
        </div>
      )}

      {/* Anti-Repetition & Active Parameters Shield Banner */}
      <div className="bg-[#15151f] border border-rose-500/20 rounded-2xl p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-2">
                <span>Anti-Répétition & Respect Intégral des Paramètres</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  Actif
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Chaque génération applique 6 déclencheurs psychologiques uniques et bannit les formulations précédentes.
              </p>
            </div>
          </div>

          {onRegenerateFresh && (
            <button
              type="button"
              onClick={onRegenerateFresh}
              disabled={loading}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-md shadow-rose-500/20 transition shrink-0 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Forcer 6 nouvelles phrases</span>
            </button>
          )}
        </div>

        {/* Active parameter chips */}
        <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
          <span className="text-zinc-500 text-[10px] uppercase tracking-wider font-semibold mr-1">
            Paramètres pris en compte :
          </span>

          <span className="px-2 py-0.5 rounded-md bg-white/5 text-zinc-300 border border-white/10 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-rose-400" />
            Vibe : <strong className="text-white">{result.activeParametersSummary?.mood || 'Calibrée'}</strong>
          </span>

          <span className="px-2 py-0.5 rounded-md bg-white/5 text-zinc-300 border border-white/10 flex items-center gap-1">
            <Clock className="w-3 h-3 text-emerald-400" />
            {result.recommendations?.bestSendTimeFanTz || 'Heure fan synchronisée'}
          </span>

          <span className="px-2 py-0.5 rounded-md bg-white/5 text-zinc-300 border border-white/10 flex items-center gap-1">
            <Sliders className="w-3 h-3 text-amber-400" />
            {pushType === 'paid_ppv' ? 'PPV Payant (Verrouillé)' : 'Relance gratuite'}
          </span>

          {result.activeParametersSummary?.hasMediaContext && (
            <span className="px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-300 border border-rose-500/20 flex items-center gap-1">
              ✓ Cadre média intégré
            </span>
          )}

          {historyCount > 0 && (
            <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 flex items-center gap-1 font-mono">
              🛡️ {historyCount} phrases précédentes exclues
            </span>
          )}
        </div>
      </div>

      {/* Main Split: Variations List (Left/Center) + Realistic Smartphone Mockup (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column: 6 generated angles */}
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
                      Proposition #{idx + 1} • {item.angleLabel?.replace(/^Angle\s*#?\d*\s*[:•-]?\s*/i, '') || 'Libre'}
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
