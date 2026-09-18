import React from 'react';
import { Bot, Zap, Sparkles, Trophy, Cloud, CheckCircle2, AlertTriangle, RefreshCw, Flame, Cpu, Lock, ShieldCheck, UserCheck, Eye } from 'lucide-react';
import { Platform, Language, OpenRouterTestResult, AiProviderId, UserRole } from '../types';

interface HeaderProps {
  platform: Platform;
  language: Language;
  onSelectPlatform: (p: Platform) => void;
  onSelectLanguage: (l: Language) => void;
  onOpenSettings: () => void;
  hasApiKey: boolean;
  selectedModel: string;
  activeTab: 'generator' | 'training';
  onSelectTab: (tab: 'generator' | 'training') => void;
  trainingCount: number;
  isCloudSynced?: boolean;
  activeProvider?: AiProviderId;
  openRouterStatus?: OpenRouterTestResult | null;
  isTestingOpenRouter?: boolean;
  onTestOpenRouter?: () => void;
  userRole: UserRole;
  onToggleRole: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  platform,
  language,
  onSelectPlatform,
  onSelectLanguage,
  onOpenSettings,
  hasApiKey,
  selectedModel,
  activeTab,
  onSelectTab,
  trainingCount,
  isCloudSynced = false,
  activeProvider = 'groq',
  openRouterStatus,
  isTestingOpenRouter = false,
  onTestOpenRouter,
  userRole,
  onToggleRole
}) => {
  const isRateLimited = Boolean(
    openRouterStatus?.message?.includes('20 req/min') ||
    openRouterStatus?.message?.includes('Quota') ||
    openRouterStatus?.message?.includes('rate limit') ||
    openRouterStatus?.message?.includes('429') ||
    openRouterStatus?.message?.includes('saturé')
  );

  const isAdmin = userRole === 'admin';

  return (
    <header className="border-b border-white/10 bg-[#0b0b12]/90 backdrop-blur-2xl sticky top-0 z-30 px-4 sm:px-8 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Brand + Role Badge */}
        <div className="flex items-center gap-3.5 flex-wrap">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-500 to-pink-600 p-[1px] shadow-[0_0_20px_rgba(244,63,94,0.35)]">
              <div className="w-full h-full bg-[#0b0b12] rounded-[11px] flex items-center justify-center">
                <Zap className="w-4 h-4 text-rose-400 fill-rose-400/20" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-black tracking-tight text-white leading-tight">
                  MusePush
                </h1>
                {isAdmin ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1 shadow-xs">
                    <ShieldCheck className="w-3 h-3 text-amber-400" />
                    <span>Mode Admin</span>
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Espace Chatter</span>
                  </span>
                )}
              </div>
              <span className="text-[10px] text-zinc-400 font-medium block">
                {isAdmin ? 'Gestion agence & API' : 'Lancement de push & conversion'}
              </span>
            </div>
          </div>

          {/* Admin Tabs (Only visible in Admin Mode) */}
          {isAdmin && (
            <nav className="flex items-center bg-black/60 p-1 rounded-xl border border-white/10 text-xs shadow-inner">
              <button
                type="button"
                onClick={() => onSelectTab('generator')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'generator'
                    ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Générateur Push</span>
              </button>
              <button
                type="button"
                onClick={() => onSelectTab('training')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'training'
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                <span>Studio Playbook</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/10 text-zinc-200 font-mono">
                  {trainingCount}
                </span>
              </button>
            </nav>
          )}
        </div>

        {/* Global Controls: Platform, Language & Mode Switcher */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Platform Toggle */}
          <div className="flex items-center bg-black/50 border border-white/10 rounded-xl p-0.5 text-xs shadow-sm">
            <button
              type="button"
              onClick={() => onSelectPlatform('onlyfans')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                platform === 'onlyfans'
                  ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <span>OnlyFans</span>
            </button>
            <button
              type="button"
              onClick={() => onSelectPlatform('mym')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                platform === 'mym'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md shadow-orange-500/20'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <span>MYM</span>
            </button>
          </div>

          {/* Language Toggle (Clean text labels) */}
          <div className="flex items-center bg-black/50 border border-white/10 rounded-xl p-0.5 text-xs">
            <button
              type="button"
              onClick={() => onSelectLanguage('fr')}
              className={`px-2.5 py-1.5 rounded-lg font-bold transition flex items-center gap-1 cursor-pointer ${
                language === 'fr'
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <span>FR</span>
            </button>
            <button
              type="button"
              onClick={() => onSelectLanguage('us')}
              className={`px-2.5 py-1.5 rounded-lg font-bold transition flex items-center gap-1 cursor-pointer ${
                language === 'us'
                  ? 'bg-indigo-500 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <span>US</span>
            </button>
          </div>

          {/* Firebase Cloud Sync Status */}
          <div 
            title={isCloudSynced ? "Modèles & Playbook synchronisés avec Firebase" : "Connexion au Cloud..."}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-[11px] font-semibold transition ${
              isCloudSynced 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
                : 'bg-white/5 border-white/10 text-zinc-400'
            }`}
          >
            <Cloud className={`w-3.5 h-3.5 ${isCloudSynced ? 'text-emerald-400' : 'text-zinc-500'}`} />
            <span className="hidden sm:inline">
              {isCloudSynced ? 'Cloud Synced' : 'Sync...'}
            </span>
            <span className={`w-1.5 h-1.5 rounded-full ${isCloudSynced ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-500'}`} />
          </div>

          {/* ADMIN ONLY: AI Provider Live Status & Settings */}
          {isAdmin && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={onOpenSettings}
                title={`Moteur actif: ${activeProvider.toUpperCase()} — Cliquez pour changer ou tester les clés`}
                className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition cursor-pointer ${
                  activeProvider === 'studio'
                    ? 'bg-rose-500/15 border-rose-500/40 text-rose-200 hover:bg-rose-500/25'
                    : activeProvider === 'groq'
                    ? 'bg-amber-500/15 border-amber-500/40 text-amber-200 hover:bg-amber-500/25 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                    : activeProvider === 'mistral'
                    ? 'bg-blue-500/15 border-blue-500/40 text-blue-200 hover:bg-blue-500/25 shadow-[0_0_12px_rgba(59,130,246,0.2)]'
                    : !hasApiKey
                    ? 'bg-white/5 border-white/10 text-zinc-400 hover:text-white hover:bg-white/10'
                    : openRouterStatus?.status === 'connected'
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-200 hover:bg-emerald-500/25 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                    : isRateLimited
                    ? 'bg-amber-500/15 border-amber-500/40 text-amber-200 hover:bg-amber-500/25'
                    : openRouterStatus?.status === 'error'
                    ? 'bg-rose-500/15 border-rose-500/40 text-rose-300 hover:bg-rose-500/25'
                    : 'bg-purple-500/15 border-purple-500/40 text-purple-200 hover:bg-purple-500/25'
                }`}
              >
                {activeProvider === 'groq' ? (
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                ) : activeProvider === 'mistral' ? (
                  <Flame className="w-3.5 h-3.5 text-blue-400" />
                ) : activeProvider === 'studio' ? (
                  <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                ) : (
                  <Bot className={`w-3.5 h-3.5 ${
                    openRouterStatus?.status === 'connected'
                      ? 'text-emerald-400'
                      : isRateLimited
                      ? 'text-amber-400'
                      : openRouterStatus?.status === 'error'
                      ? 'text-rose-400'
                      : 'text-purple-400'
                  }`} />
                )}

                <div className="flex items-center gap-1.5">
                  {isTestingOpenRouter ? (
                    <>
                      <RefreshCw className="w-3 h-3 text-amber-400 animate-spin" />
                      <span className="font-mono text-[11px] text-amber-300">Test IA...</span>
                    </>
                  ) : activeProvider === 'groq' ? (
                    <>
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                      <span className="font-mono text-[11px] text-amber-200 font-bold">
                        Groq LPU
                      </span>
                    </>
                  ) : activeProvider === 'mistral' ? (
                    <>
                      <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                      <span className="font-mono text-[11px] text-blue-200 font-bold">
                        Mistral AI
                      </span>
                    </>
                  ) : activeProvider === 'studio' ? (
                    <>
                      <span className="w-2 h-2 rounded-full bg-rose-400" />
                      <span className="font-mono text-[11px] text-rose-200 font-bold">
                        Moteur Studio
                      </span>
                    </>
                  ) : !hasApiKey ? (
                    <>
                      <span className="w-2 h-2 rounded-full bg-zinc-500" />
                      <span className="font-mono text-[11px] text-zinc-300">
                        OpenRouter
                      </span>
                    </>
                  ) : openRouterStatus?.status === 'connected' ? (
                    <>
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="font-mono text-[11px] font-bold text-emerald-300">
                        API OK
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                      <span className="font-mono text-[11px] text-amber-200 font-bold">
                        Config API
                      </span>
                    </>
                  )}
                </div>
              </button>

              {/* Quick test trigger */}
              {hasApiKey && onTestOpenRouter && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onTestOpenRouter();
                  }}
                  disabled={isTestingOpenRouter}
                  title="Tester la connexion IA"
                  className="px-2 py-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white text-[11px] font-medium transition disabled:opacity-50 cursor-pointer"
                >
                  {isTestingOpenRouter ? (
                    <RefreshCw className="w-3 h-3 animate-spin text-amber-400" />
                  ) : (
                    'Test'
                  )}
                </button>
              )}
            </div>
          )}

          {/* Role Switcher: Mode Chatter vs Mode Admin */}
          {isAdmin ? (
            <button
              type="button"
              onClick={onToggleRole}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-zinc-200 hover:text-white border border-white/15 text-xs font-semibold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
              title="Basculer vers la vue Chatter (pour voir ce que voit l'équipe)"
            >
              <Eye className="w-3.5 h-3.5 text-zinc-400" />
              <span className="hidden sm:inline">Vue Chatter</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onToggleRole}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/15 to-rose-500/15 hover:from-amber-500/25 hover:to-rose-500/25 text-amber-200 hover:text-white border border-amber-500/30 text-xs font-semibold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
              title="Accès réservé aux managers et admins"
            >
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>Accès Admin</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
