import React from 'react';
import { Bot, Zap, Sparkles, Trophy, Cloud, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';
import { Platform, Language, OpenRouterTestResult } from '../types';

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
  openRouterStatus?: OpenRouterTestResult | null;
  isTestingOpenRouter?: boolean;
  onTestOpenRouter?: () => void;
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
  openRouterStatus,
  isTestingOpenRouter = false,
  onTestOpenRouter
}) => {
  return (
    <header className="border-b border-white/10 bg-[#0b0b10]/95 backdrop-blur-xl sticky top-0 z-30 px-4 sm:px-8 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Brand + Tab Selector */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-500 to-pink-600 p-[1px] shadow-[0_0_15px_rgba(244,63,94,0.3)]">
              <div className="w-full h-full bg-[#0b0b10] rounded-[11px] flex items-center justify-center">
                <Zap className="w-4 h-4 text-rose-400 fill-rose-400/20" />
              </div>
            </div>
            <div>
              <h1 className="text-sm font-extrabold tracking-tight text-white leading-tight">
                MusePush
              </h1>
              <span className="text-[10px] text-zinc-400 font-medium">
                Mass Message AI Studio
              </span>
            </div>
          </div>

          {/* Primary View Switcher: Studio Generator vs IA Training */}
          <nav className="flex items-center bg-black/50 p-1 rounded-xl border border-white/10 text-xs">
            <button
              type="button"
              onClick={() => onSelectTab('generator')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1.5 ${
                activeTab === 'generator'
                  ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Générateur</span>
            </button>
            <button
              type="button"
              onClick={() => onSelectTab('training')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1.5 ${
                activeTab === 'training'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>Entraînement IA</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/10 text-zinc-200 font-mono">
                {trainingCount}
              </span>
            </button>
          </nav>
        </div>

        {/* Global Controls: Platform, Language & OpenRouter */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Platform Toggle */}
          <div className="flex items-center bg-black/40 border border-white/10 rounded-xl p-0.5 text-xs">
            <button
              type="button"
              onClick={() => onSelectPlatform('onlyfans')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1.5 ${
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
              className={`px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1.5 ${
                platform === 'mym'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md shadow-orange-500/20'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <span>MYM.fans</span>
            </button>
          </div>

          {/* Language Toggle */}
          <div className="flex items-center bg-black/40 border border-white/10 rounded-xl p-0.5 text-xs">
            <button
              type="button"
              onClick={() => onSelectLanguage('fr')}
              className={`px-2.5 py-1.5 rounded-lg font-medium transition flex items-center gap-1 ${
                language === 'fr'
                  ? 'bg-white/15 text-white font-bold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <span>🇫🇷</span>
              <span className="hidden sm:inline">FR</span>
            </button>
            <button
              type="button"
              onClick={() => onSelectLanguage('us')}
              className={`px-2.5 py-1.5 rounded-lg font-medium transition flex items-center gap-1 ${
                language === 'us'
                  ? 'bg-white/15 text-white font-bold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <span>🇺🇸</span>
              <span className="hidden sm:inline">US</span>
            </button>
          </div>

          {/* Firebase Cloud Sync Status */}
          <div 
            title={isCloudSynced ? "Modèles & Playbook synchronisés en direct avec Firebase" : "Connexion au Cloud..."}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-[11px] font-semibold transition ${
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

          {/* OpenRouter Proactive Live Status & Settings Button */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onOpenSettings}
              title={
                !hasApiKey
                  ? 'Clique pour configurer ta clé OpenRouter (Claude, GPT, etc.)'
                  : openRouterStatus?.status === 'connected'
                  ? `OpenRouter connecté avec succès (${openRouterStatus.creditInfo || 'Actif'}) - Latence: ${openRouterStatus.latencyMs || 0}ms`
                  : openRouterStatus?.status === 'error'
                  ? `Erreur OpenRouter: ${openRouterStatus.message}`
                  : 'OpenRouter configuré (clique pour tester ou changer)'
              }
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition ${
                !hasApiKey
                  ? 'bg-white/5 border-white/10 text-zinc-400 hover:text-white hover:bg-white/10'
                  : openRouterStatus?.status === 'connected'
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-200 hover:bg-emerald-500/25 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                  : openRouterStatus?.status === 'error'
                  ? 'bg-rose-500/15 border-rose-500/40 text-rose-300 hover:bg-rose-500/25'
                  : 'bg-purple-500/15 border-purple-500/40 text-purple-200 hover:bg-purple-500/25'
              }`}
            >
              <Bot className={`w-3.5 h-3.5 ${
                openRouterStatus?.status === 'connected'
                  ? 'text-emerald-400'
                  : openRouterStatus?.status === 'error'
                  ? 'text-rose-400'
                  : 'text-purple-400'
              }`} />

              {/* Status Indicator Dot & Label */}
              <div className="flex items-center gap-1.5">
                {isTestingOpenRouter ? (
                  <>
                    <RefreshCw className="w-3 h-3 text-amber-400 animate-spin" />
                    <span className="font-mono text-[11px] text-amber-300">Test OpenRouter...</span>
                  </>
                ) : !hasApiKey ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-zinc-500" />
                    <span className="font-mono text-[11px] text-zinc-300">
                      {selectedModel === '@preset/push-bot' ? '@preset/push-bot' : 'OpenRouter'}
                    </span>
                  </>
                ) : openRouterStatus?.status === 'connected' ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                    <span className="font-mono text-[11px] font-bold text-emerald-300 flex items-center gap-1">
                      {selectedModel === '@preset/push-bot' ? 'push-bot OK' : 'OpenRouter OK'} {openRouterStatus.latencyMs ? `(${openRouterStatus.latencyMs}ms)` : ''}
                    </span>
                  </>
                ) : openRouterStatus?.status === 'error' ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                    <span className="font-mono text-[11px] font-bold text-rose-300">
                      {selectedModel === '@preset/push-bot' ? 'push-bot Erreur' : 'OpenRouter Erreur'}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="w-2 h-2 rounded-full bg-purple-400" />
                    <span className="font-mono text-[11px] text-purple-200">
                      {selectedModel === '@preset/push-bot' ? '@preset/push-bot ✓' : 'OpenRouter ✓'}
                    </span>
                  </>
                )}
              </div>
            </button>

            {/* Direct Quick Test Button if API key exists */}
            {hasApiKey && onTestOpenRouter && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onTestOpenRouter();
                }}
                disabled={isTestingOpenRouter}
                title="Tester immédiatement la connexion OpenRouter"
                className="px-2 py-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white text-[11px] font-medium transition disabled:opacity-50"
              >
                {isTestingOpenRouter ? (
                  <RefreshCw className="w-3 h-3 animate-spin text-amber-400" />
                ) : (
                  'Tester'
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
