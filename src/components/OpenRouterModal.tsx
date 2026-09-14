import React, { useState } from 'react';
import { OPENROUTER_MODELS } from '../data';
import { Key, Bot, Settings2, Shield, Check, Info, RefreshCw, CheckCircle2, AlertTriangle, ExternalLink } from 'lucide-react';
import { OpenRouterTestResult } from '../types';

interface OpenRouterModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  onSaveApiKey: (key: string) => void;
  selectedModel: string;
  onSelectModel: (model: string) => void;
  temperature: number;
  onSetTemperature: (val: number) => void;
  openRouterStatus?: OpenRouterTestResult | null;
  isTesting?: boolean;
  onTestConnection?: (keyToTest?: string) => Promise<void> | void;
}

export const OpenRouterModal: React.FC<OpenRouterModalProps> = ({
  isOpen,
  onClose,
  apiKey,
  onSaveApiKey,
  selectedModel,
  onSelectModel,
  temperature,
  onSetTemperature,
  openRouterStatus,
  isTesting = false,
  onTestConnection
}) => {
  const [tempKey, setTempKey] = useState(apiKey);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveApiKey(tempKey.trim());
    setSavedSuccess(true);
    if (onTestConnection) {
      onTestConnection(tempKey.trim());
    }
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  const handleManualTest = () => {
    if (onTestConnection) {
      onTestConnection(tempKey.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-[#161622] border border-white/10 rounded-2xl p-6 max-w-lg w-full shadow-2xl">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Connexion OpenRouter & Paramètres IA</h3>
              <p className="text-xs text-zinc-400">Pilote et teste le moteur LLM en direct</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-white text-sm px-2 py-1 rounded"
          >
            ✕
          </button>
        </div>

        {/* Live Diagnostics Card */}
        <div className={`mb-4 p-3.5 rounded-xl border text-xs transition-all ${
          isTesting
            ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
            : openRouterStatus?.status === 'connected'
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
            : openRouterStatus?.status === 'error'
            ? 'bg-rose-500/10 border-rose-500/30 text-rose-200'
            : 'bg-white/5 border-white/10 text-zinc-400'
        }`}>
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2 font-semibold">
              {isTesting ? (
                <>
                  <RefreshCw className="w-4 h-4 text-amber-400 animate-spin" />
                  <span>Test de connexion OpenRouter en cours...</span>
                </>
              ) : openRouterStatus?.status === 'connected' ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-300 font-bold">OpenRouter opérationnel et connecté</span>
                </>
              ) : openRouterStatus?.status === 'error' ? (
                <>
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  <span className="text-rose-300 font-bold">Problème détecté sur OpenRouter</span>
                </>
              ) : (
                <>
                  <Info className="w-4 h-4 text-zinc-400" />
                  <span>Statut : En attente de test ou sans clé</span>
                </>
              )}
            </div>

            {openRouterStatus?.latencyMs ? (
              <span className="text-[11px] font-mono text-zinc-400 bg-black/40 px-2 py-0.5 rounded border border-white/5">
                {openRouterStatus.latencyMs}ms
              </span>
            ) : null}
          </div>

          <p className="text-[11px] leading-relaxed">
            {openRouterStatus?.message || "Renseigne ta clé sk-or-v1-... puis clique sur 'Tester la clé' pour valider immédiatement le fonctionnement."}
          </p>

          {openRouterStatus?.creditInfo && (
            <div className="mt-2 text-[10px] font-mono text-emerald-300/80 bg-black/30 px-2 py-1 rounded inline-block">
              {openRouterStatus.creditInfo}
            </div>
          )}

          {openRouterStatus?.status === 'error' && (
            <div className="mt-2 pt-2 border-t border-rose-500/20 text-[11px] text-rose-300/90 space-y-1">
              <p>💡 Vérifie que tu as des crédits sur ton compte OpenRouter (même 1 ou 2$) ou génère une nouvelle clé sur le dashboard.</p>
              <a
                href="https://openrouter.ai/credits"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-rose-400 hover:underline font-semibold"
              >
                Vérifier mes crédits OpenRouter <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          {/* API Key Input + Test Button */}
          <div>
            <label className="text-xs font-medium text-zinc-300 block mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-amber-400" /> Clé API OpenRouter (sk-or-v1-...)
              </span>
              <div className="flex items-center gap-2">
                <a
                  href="https://openrouter.ai/keys"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-rose-400 hover:underline"
                >
                  Obtenir une clé ↗
                </a>
              </div>
            </label>
            
            <div className="flex gap-2">
              <input
                type="password"
                placeholder="sk-or-v1-xxxxxxxxxxxxxxxx..."
                value={tempKey}
                onChange={e => setTempKey(e.target.value)}
                className="flex-1 bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
              />
              <button
                type="button"
                onClick={handleManualTest}
                disabled={isTesting || !tempKey.trim()}
                className="px-3 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/15 text-white disabled:opacity-40 transition flex items-center gap-1.5 shrink-0"
              >
                {isTesting ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
                ) : (
                  'Tester la clé'
                )}
              </button>
            </div>

            <p className="text-[11px] text-zinc-500 mt-1 flex items-center gap-1">
              <Shield className="w-3 h-3 text-emerald-400" /> Clé stockée dans ton navigateur et envoyée au serveur sécurisé pour les requêtes IA.
            </p>
          </div>

          {/* Model selection */}
          <div>
            <label className="text-xs font-medium text-zinc-300 block mb-1.5 flex items-center gap-1.5">
              <Settings2 className="w-3.5 h-3.5 text-indigo-400" /> Modèle LLM Cible
            </label>
            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
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
                    <div>
                      <div className="text-xs font-semibold flex items-center gap-2">
                        {m.name}
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-white/10 text-zinc-300 font-mono">
                          {m.provider}
                        </span>
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-purple-400 shrink-0" />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Temperature */}
          <div>
            <div className="flex items-center justify-between text-xs font-medium text-zinc-300 mb-1">
              <span>Créativité / Température ({temperature})</span>
              <span className="text-[11px] text-zinc-500">
                {temperature < 0.7 ? 'Précis & Régulier' : 'Ultra spontané & Varié'}
              </span>
            </div>
            <input
              type="range"
              min="0.5"
              max="1.1"
              step="0.05"
              value={temperature}
              onChange={e => onSetTemperature(parseFloat(e.target.value))}
              className="w-full accent-purple-500 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 transition"
            >
              Fermer
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 shadow-md shadow-purple-500/25 transition flex items-center gap-1.5"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5" /> Enregistré !
                </>
              ) : (
                'Valider & Tester'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
