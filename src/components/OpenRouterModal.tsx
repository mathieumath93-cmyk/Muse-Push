import React, { useState } from 'react';
import { OPENROUTER_MODELS, GROQ_MODELS, MISTRAL_MODELS } from '../data';
import { 
  Key, 
  Bot, 
  Settings2, 
  Shield, 
  Check, 
  Info, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  ExternalLink, 
  Sparkles, 
  Zap,
  Cpu,
  Lock,
  Flame
} from 'lucide-react';
import { OpenRouterTestResult, AiProviderId } from '../types';

interface OpenRouterModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeProvider: AiProviderId;
  onSelectProvider: (provider: AiProviderId) => void;
  // Groq
  groqApiKey: string;
  onSaveGroqApiKey: (key: string) => void;
  groqModel: string;
  onSelectGroqModel: (model: string) => void;
  groqStatus?: OpenRouterTestResult | null;
  onTestGroq?: (key?: string) => Promise<void> | void;
  isTestingGroq?: boolean;
  // Mistral
  mistralApiKey: string;
  onSaveMistralApiKey: (key: string) => void;
  mistralModel: string;
  onSelectMistralModel: (model: string) => void;
  mistralStatus?: OpenRouterTestResult | null;
  onTestMistral?: (key?: string) => Promise<void> | void;
  isTestingMistral?: boolean;
  // OpenRouter
  apiKey: string;
  onSaveApiKey: (key: string) => void;
  selectedModel: string;
  onSelectModel: (model: string) => void;
  temperature: number;
  onSetTemperature: (val: number) => void;
  openRouterStatus?: OpenRouterTestResult | null;
  isTesting?: boolean;
  onTestConnection?: (keyToTest?: string) => Promise<void> | void;
  adminPin?: string;
  onSaveAdminPin?: (pin: string) => void;
}

export const OpenRouterModal: React.FC<OpenRouterModalProps> = ({
  isOpen,
  onClose,
  activeProvider,
  onSelectProvider,
  // Groq
  groqApiKey,
  onSaveGroqApiKey,
  groqModel,
  onSelectGroqModel,
  groqStatus,
  onTestGroq,
  isTestingGroq = false,
  // Mistral
  mistralApiKey,
  onSaveMistralApiKey,
  mistralModel,
  onSelectMistralModel,
  mistralStatus,
  onTestMistral,
  isTestingMistral = false,
  // OpenRouter
  apiKey,
  onSaveApiKey,
  selectedModel,
  onSelectModel,
  temperature,
  onSetTemperature,
  openRouterStatus,
  isTesting = false,
  onTestConnection,
  adminPin = '1234',
  onSaveAdminPin
}) => {
  const [currentTab, setCurrentTab] = useState<AiProviderId>(activeProvider || 'groq');
  const [tempGroqKey, setTempGroqKey] = useState(groqApiKey);
  const [tempMistralKey, setTempMistralKey] = useState(mistralApiKey);
  const [tempOrKey, setTempOrKey] = useState(apiKey);
  const [tempPin, setTempPin] = useState(adminPin);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSaveAll = (e: React.FormEvent) => {
    e.preventDefault();
    onSelectProvider(currentTab);
    onSaveGroqApiKey(tempGroqKey.trim());
    onSaveMistralApiKey(tempMistralKey.trim());
    onSaveApiKey(tempOrKey.trim());
    if (onSaveAdminPin && tempPin.trim()) {
      onSaveAdminPin(tempPin.trim());
    }
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-[#161622] border border-white/10 rounded-2xl p-5 sm:p-6 max-w-xl w-full shadow-2xl max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-3 pb-3 border-b border-white/5 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-amber-500/20 to-purple-500/20 text-amber-400 border border-white/10">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Hub Moteurs IA & Règle Anti-Saturation
              </h3>
              <p className="text-xs text-zinc-400">Groq LPU (Ultra-rapide), Mistral AI (FR) & OpenRouter</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-white text-sm px-2 py-1 rounded transition"
          >
            ✕
          </button>
        </div>

        {/* Strict Rate Limit Rule Banner */}
        <div className="mb-3 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-[11px] text-emerald-200 flex items-start gap-2 shrink-0">
          <Shield className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div className="leading-tight">
            <span className="font-semibold text-white">Règle Stricte 1 Requête Unique & Zéro Boucle de Cascade</span>
            <p className="text-zinc-300 text-[10px] mt-0.5">
              Chaque clic déclenche <strong>exactement 1 seule requête</strong>. Si un fournisseur externe sature (429), aucune boucle de requêtes en cascade n'est lancée : le <strong>Moteur Studio</strong> prend instantanément le relais sans spammer d'autres clés.
            </p>
          </div>
        </div>

        {/* Provider Tabs */}
        <div className="grid grid-cols-4 gap-1.5 p-1 bg-black/40 rounded-xl border border-white/5 mb-3 shrink-0 text-xs">
          <button
            type="button"
            onClick={() => setCurrentTab('groq')}
            className={`py-2 px-1.5 rounded-lg font-semibold transition flex flex-col items-center gap-0.5 ${
              currentTab === 'groq'
                ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-1">
              <Zap className="w-3.5 h-3.5" />
              <span>Groq</span>
            </div>
            <span className="text-[9px] opacity-80 font-normal">30 req/min Free</span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentTab('mistral')}
            className={`py-2 px-1.5 rounded-lg font-semibold transition flex flex-col items-center gap-0.5 ${
              currentTab === 'mistral'
                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-1">
              <Flame className="w-3.5 h-3.5" />
              <span>Mistral</span>
            </div>
            <span className="text-[9px] opacity-80 font-normal">Top Plume FR</span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentTab('openrouter')}
            className={`py-2 px-1.5 rounded-lg font-semibold transition flex flex-col items-center gap-0.5 ${
              currentTab === 'openrouter'
                ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-1">
              <Bot className="w-3.5 h-3.5" />
              <span>OpenRouter</span>
            </div>
            <span className="text-[9px] opacity-80 font-normal">Presets / Multi</span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentTab('studio')}
            className={`py-2 px-1.5 rounded-lg font-semibold transition flex flex-col items-center gap-0.5 ${
              currentTab === 'studio'
                ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Studio</span>
            </div>
            <span className="text-[9px] opacity-80 font-normal">100% Local</span>
          </button>
        </div>

        {/* Scrollable Tab Content */}
        <form onSubmit={handleSaveAll} className="space-y-3 overflow-y-auto pr-1 flex-1">
          {/* TAB 1: GROQ */}
          {currentTab === 'groq' && (
            <div className="space-y-3 animate-in fade-in">
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200">
                <div className="flex items-center justify-between mb-1 font-semibold text-white">
                  <span className="flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-amber-400" /> Groq Cloud LPU — Recommandé Gratuit
                  </span>
                  <a 
                    href="https://console.groq.com/keys" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-[10px] text-amber-300 hover:underline flex items-center gap-0.5"
                  >
                    Obtenir clé gratuite <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <p className="text-zinc-300 text-[11px]">
                  Processeurs LPU ultra-rapides (500 tokens/sec). Tier gratuit généreux (30 req/min) sans file d'attente saturée.
                </p>
              </div>

              {/* Diagnostic status */}
              {groqStatus && (
                <div className={`p-2.5 rounded-xl border text-xs flex items-center justify-between ${
                  groqStatus.status === 'connected'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-200'
                }`}>
                  <div className="flex items-center gap-2">
                    {groqStatus.status === 'connected' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                    )}
                    <span className="text-[11px]">{groqStatus.message}</span>
                  </div>
                  {groqStatus.latencyMs && (
                    <span className="text-[10px] font-mono opacity-75">{groqStatus.latencyMs}ms</span>
                  )}
                </div>
              )}

              {/* API Key */}
              <div>
                <label className="text-xs font-medium text-zinc-300 mb-1 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-amber-400" /> Clé API Groq (gsk_...)
                </label>
                <div className="flex gap-2">
                  <input
                    type="password"
                    placeholder="gsk_..."
                    value={tempGroqKey}
                    onChange={e => setTempGroqKey(e.target.value)}
                    className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      onSaveGroqApiKey(tempGroqKey.trim());
                      if (onTestGroq) onTestGroq(tempGroqKey.trim());
                    }}
                    disabled={isTestingGroq}
                    className="px-3 py-2 bg-white/5 hover:bg-white/10 text-zinc-200 rounded-xl text-xs font-medium border border-white/10 transition flex items-center gap-1"
                  >
                    {isTestingGroq ? <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" /> : 'Tester'}
                  </button>
                </div>
              </div>

              {/* Models */}
              <div>
                <label className="text-xs font-medium text-zinc-300 mb-1.5 block">
                  Modèle Groq sélectionné :
                </label>
                <div className="space-y-1.5">
                  {GROQ_MODELS.map((m) => {
                    const isSelected = groqModel === m.id;
                    return (
                      <div
                        key={m.id}
                        onClick={() => onSelectGroqModel(m.id)}
                        className={`cursor-pointer p-2.5 rounded-xl border text-left transition flex items-center justify-between ${
                          isSelected
                            ? 'bg-amber-500/15 border-amber-500/50 text-white'
                            : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05] text-zinc-300'
                        }`}
                      >
                        <div>
                          <div className="text-xs font-semibold flex items-center gap-2">
                            {m.name}
                            <span className="text-[9px] px-1.5 py-0.5 rounded font-mono bg-amber-500/20 text-amber-300">
                              {m.badge}
                            </span>
                          </div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-amber-400 shrink-0" />}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MISTRAL AI */}
          {currentTab === 'mistral' && (
            <div className="space-y-3 animate-in fade-in">
              <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-200">
                <div className="flex items-center justify-between mb-1 font-semibold text-white">
                  <span className="flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-blue-400" /> Mistral AI — Plume Française de Référence
                  </span>
                  <a 
                    href="https://console.mistral.ai/api-keys" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-[10px] text-blue-300 hover:underline flex items-center gap-0.5"
                  >
                    Obtenir clé gratuite <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <p className="text-zinc-300 text-[11px]">
                  Excellente compréhension des nuances, tutoiement naturel, argot et sous-entendus sans traduction littérale.
                </p>
              </div>

              {/* Diagnostic status */}
              {mistralStatus && (
                <div className={`p-2.5 rounded-xl border text-xs flex items-center justify-between ${
                  mistralStatus.status === 'connected'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-200'
                }`}>
                  <div className="flex items-center gap-2">
                    {mistralStatus.status === 'connected' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                    )}
                    <span className="text-[11px]">{mistralStatus.message}</span>
                  </div>
                  {mistralStatus.latencyMs && (
                    <span className="text-[10px] font-mono opacity-75">{mistralStatus.latencyMs}ms</span>
                  )}
                </div>
              )}

              {/* API Key */}
              <div>
                <label className="text-xs font-medium text-zinc-300 mb-1 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-blue-400" /> Clé API Mistral AI
                </label>
                <div className="flex gap-2">
                  <input
                    type="password"
                    placeholder="Clé API La Plateforme..."
                    value={tempMistralKey}
                    onChange={e => setTempMistralKey(e.target.value)}
                    className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      onSaveMistralApiKey(tempMistralKey.trim());
                      if (onTestMistral) onTestMistral(tempMistralKey.trim());
                    }}
                    disabled={isTestingMistral}
                    className="px-3 py-2 bg-white/5 hover:bg-white/10 text-zinc-200 rounded-xl text-xs font-medium border border-white/10 transition flex items-center gap-1"
                  >
                    {isTestingMistral ? <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-400" /> : 'Tester'}
                  </button>
                </div>
              </div>

              {/* Models */}
              <div>
                <label className="text-xs font-medium text-zinc-300 mb-1.5 block">
                  Modèle Mistral sélectionné :
                </label>
                <div className="space-y-1.5">
                  {MISTRAL_MODELS.map((m) => {
                    const isSelected = mistralModel === m.id;
                    return (
                      <div
                        key={m.id}
                        onClick={() => onSelectMistralModel(m.id)}
                        className={`cursor-pointer p-2.5 rounded-xl border text-left transition flex items-center justify-between ${
                          isSelected
                            ? 'bg-blue-500/15 border-blue-500/50 text-white'
                            : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05] text-zinc-300'
                        }`}
                      >
                        <div>
                          <div className="text-xs font-semibold flex items-center gap-2">
                            {m.name}
                            <span className="text-[9px] px-1.5 py-0.5 rounded font-mono bg-blue-500/20 text-blue-300">
                              {m.badge}
                            </span>
                          </div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-blue-400 shrink-0" />}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: OPENROUTER */}
          {currentTab === 'openrouter' && (
            <div className="space-y-3 animate-in fade-in">
              <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-200">
                <div className="flex items-center justify-between mb-1 font-semibold text-white">
                  <span className="flex items-center gap-1.5">
                    <Bot className="w-4 h-4 text-purple-400" /> OpenRouter — Multi-Modèles & Presets
                  </span>
                  <a 
                    href="https://openrouter.ai/keys" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-[10px] text-purple-300 hover:underline flex items-center gap-0.5"
                  >
                    openrouter.ai/keys <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <p className="text-zinc-300 text-[11px]">
                  Cible ton bot preset <code>@preset/push-bot</code> ou les modèles multi-fournisseurs.
                </p>
              </div>

              {/* Status */}
              {openRouterStatus && (
                <div className={`p-2.5 rounded-xl border text-xs flex items-center justify-between ${
                  openRouterStatus.status === 'connected'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                    : 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                }`}>
                  <div className="flex items-center gap-2">
                    {openRouterStatus.status === 'connected' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                    )}
                    <span className="text-[11px]">{openRouterStatus.message}</span>
                  </div>
                  {openRouterStatus.latencyMs && (
                    <span className="text-[10px] font-mono opacity-75">{openRouterStatus.latencyMs}ms</span>
                  )}
                </div>
              )}

              {/* API Key */}
              <div>
                <label className="text-xs font-medium text-zinc-300 mb-1 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-purple-400" /> Clé API OpenRouter (sk-or-v1-...)
                </label>
                <div className="flex gap-2">
                  <input
                    type="password"
                    placeholder="sk-or-v1-..."
                    value={tempOrKey}
                    onChange={e => setTempOrKey(e.target.value)}
                    className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      onSaveApiKey(tempOrKey.trim());
                      if (onTestConnection) onTestConnection(tempOrKey.trim());
                    }}
                    disabled={isTesting}
                    className="px-3 py-2 bg-white/5 hover:bg-white/10 text-zinc-200 rounded-xl text-xs font-medium border border-white/10 transition flex items-center gap-1"
                  >
                    {isTesting ? <RefreshCw className="w-3.5 h-3.5 animate-spin text-purple-400" /> : 'Tester'}
                  </button>
                </div>
              </div>

              {/* Models */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-zinc-300">Modèle ou Preset OpenRouter :</label>
                  {selectedModel !== '@preset/push-bot' && (
                    <button
                      type="button"
                      onClick={() => onSelectModel('@preset/push-bot')}
                      className="text-[10px] text-purple-400 hover:text-purple-300 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-lg"
                    >
                      ⚡ @preset/push-bot
                    </button>
                  )}
                </div>
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {OPENROUTER_MODELS.map((m) => {
                    const isSelected = selectedModel === m.id;
                    return (
                      <div
                        key={m.id}
                        onClick={() => onSelectModel(m.id)}
                        className={`cursor-pointer p-2.5 rounded-xl border text-left transition flex items-center justify-between ${
                          isSelected
                            ? 'bg-purple-500/15 border-purple-500/50 text-white'
                            : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05] text-zinc-300'
                        }`}
                      >
                        <div className="text-xs font-semibold flex items-center gap-2">
                          {m.name}
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${
                            m.id.startsWith('@') ? 'bg-purple-500/20 text-purple-300 font-bold' : 'bg-white/10 text-zinc-300'
                          }`}>
                            {m.badge || m.provider}
                          </span>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-purple-400 shrink-0" />}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: STUDIO */}
          {currentTab === 'studio' && (
            <div className="space-y-3 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-200 animate-in fade-in">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <Sparkles className="w-5 h-5 text-rose-400" /> Moteur Créatif Studio 100% Autonome
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Ce moteur fonctionne sans aucune clé d'API, sans aucun quota et sans latence réseau. Il applique directement les règles des meilleures agences OnlyFans / MYM :
              </p>
              <ul className="text-[11px] space-y-1 text-zinc-300 list-disc list-inside">
                <li>6 déclencheurs psychologiques distincts par tirage</li>
                <li>Filtrage temporel automatique selon le fuseau horaire de vos fans</li>
                <li>Zéro répétition avec détection des anciens messages</li>
                <li>Aucun risque de saturation 429 ou de limite de débit</li>
              </ul>
            </div>
          )}

          {/* Temperature Setting */}
          <div className="pt-2 border-t border-white/5">
            <div className="flex items-center justify-between text-xs font-medium text-zinc-300 mb-1">
              <span>Créativité / Température ({temperature})</span>
              <span className="text-[11px] text-zinc-500">
                {temperature < 0.7 ? 'Précis & Contrôlé' : 'Ultra spontané & Varié'}
              </span>
            </div>
            <input
              type="range"
              min="0.5"
              max="1.1"
              step="0.05"
              value={temperature}
              onChange={e => onSetTemperature(parseFloat(e.target.value))}
              className="w-full accent-rose-500 cursor-pointer"
            />
          </div>

          {/* Admin Access PIN code configuration */}
          {onSaveAdminPin && (
            <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-3 text-xs">
              <div>
                <label className="font-medium text-zinc-200 block">Code PIN Accès Admin</label>
                <span className="text-[11px] text-zinc-500">Code à 4 chiffres protégeant cet espace et les clés API</span>
              </div>
              <input
                type="text"
                maxLength={6}
                value={tempPin}
                onChange={e => setTempPin(e.target.value)}
                className="w-24 px-3 py-1.5 rounded-xl bg-black/50 border border-white/10 text-center font-mono font-bold text-amber-300 tracking-wider focus:border-amber-500 focus:outline-hidden text-xs"
                placeholder="1234"
              />
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-white/5 shrink-0">
            <span className="text-[11px] text-zinc-400 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              Moteur actif sélectionné : <strong className="text-white capitalize">{currentTab}</strong>
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 transition"
              >
                Fermer
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 shadow-md shadow-rose-500/25 transition flex items-center gap-1.5"
              >
                {savedSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5" /> Enregistré !
                  </>
                ) : (
                  'Activer ce moteur'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
