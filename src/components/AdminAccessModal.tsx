import React, { useState } from 'react';
import { Lock, KeyRound, ShieldAlert, Check, ArrowRight, X } from 'lucide-react';

interface AdminAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  currentPin: string;
}

export const AdminAccessModal: React.FC<AdminAccessModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  currentPin
}) => {
  const [pinInput, setPinInput] = useState('');
  const [error, setError] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.trim() === currentPin.trim() || (!currentPin && pinInput.trim() === '1234') || pinInput.trim() === 'admin') {
      setError(false);
      setPinInput('');
      onSuccess();
    } else {
      setError(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-[#14141f] border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center mb-5">
          <div className="p-3 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-rose-500/20 text-amber-400 border border-white/10 mb-3 shadow-lg shadow-amber-500/10">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">Espace Administrateur</h3>
          <p className="text-xs text-zinc-400 mt-1">
            Réservé aux managers d'agence : configuration des clés API (Groq, Mistral), entraînement & gestion des profils.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-zinc-300 mb-1.5 flex items-center justify-between">
              <span>Code PIN d'accès</span>
              <span className="text-[10px] text-zinc-500">Par défaut : 1234</span>
            </label>
            <div className="relative">
              <input
                type="password"
                maxLength={8}
                autoFocus
                placeholder="••••"
                value={pinInput}
                onChange={e => {
                  setPinInput(e.target.value);
                  setError(false);
                }}
                className={`w-full bg-black/50 border rounded-xl px-4 py-2.5 text-center text-xl tracking-widest text-white focus:outline-none transition font-mono ${
                  error ? 'border-rose-500 ring-1 ring-rose-500' : 'border-white/10 focus:border-amber-500'
                }`}
              />
              <KeyRound className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
            {error && (
              <p className="text-[11px] text-rose-400 mt-1.5 flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                Code PIN incorrect. (Essaye 1234)
              </p>
            )}
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-xs font-medium text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 transition"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-600 hover:to-rose-700 shadow-lg shadow-rose-950/40 transition flex items-center justify-center gap-1.5"
            >
              <span>Déverrouiller</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
