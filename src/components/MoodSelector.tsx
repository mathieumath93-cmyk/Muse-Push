import React from 'react';
import { MOODS } from '../data';
import { MoodCategory } from '../types';
import { 
  Heart, 
  Flame, 
  Sun, 
  Droplets, 
  Moon, 
  Crown, 
  Sparkles, 
  Zap,
  CheckCircle,
  HelpCircle
} from 'lucide-react';

interface MoodSelectorProps {
  selectedMood: MoodCategory;
  onSelectMood: (mood: MoodCategory) => void;
  language: 'fr' | 'us';
}

export const MoodSelector: React.FC<MoodSelectorProps> = ({
  selectedMood,
  onSelectMood,
  language
}) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Heart': return <Heart className="w-4 h-4 text-rose-400" />;
      case 'Flame': return <Flame className="w-4 h-4 text-amber-400" />;
      case 'Sun': return <Sun className="w-4 h-4 text-orange-400" />;
      case 'Droplets': return <Droplets className="w-4 h-4 text-sky-400" />;
      case 'Moon': return <Moon className="w-4 h-4 text-indigo-400" />;
      case 'Crown': return <Crown className="w-4 h-4 text-purple-400" />;
      case 'Sparkles': return <Sparkles className="w-4 h-4 text-emerald-400" />;
      case 'Zap': return <Zap className="w-4 h-4 text-yellow-400" />;
      default: return <Sparkles className="w-4 h-4" />;
    }
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-amber-400" />
          <h2 className="text-sm font-semibold tracking-wide text-zinc-200 uppercase">
            2. Vibe & Circonstance du Push
          </h2>
        </div>
        <span className="text-[11px] text-zinc-400">
          Chaque mood déclenche un copywriting psychologique distinct
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {MOODS.map((item) => {
          const isSelected = selectedMood === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectMood(item.id)}
              className={`text-left p-3 rounded-2xl border transition-all duration-200 relative group flex flex-col justify-between ${
                isSelected
                  ? 'bg-gradient-to-b from-white/[0.08] to-white/[0.03] border-amber-500/60 shadow-[0_0_20px_rgba(245,158,11,0.15)] ring-1 ring-amber-500/40'
                  : 'bg-[#121218] border-white/5 hover:border-white/15 hover:bg-white/[0.02]'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="p-2 rounded-xl bg-white/5 border border-white/5 group-hover:scale-105 transition-transform">
                  {getIcon(item.iconName)}
                </div>
                <span className="text-[9px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-white/5 border border-white/5 text-zinc-400">
                  {item.badge}
                </span>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-white group-hover:text-amber-200 transition-colors">
                  {language === 'us' ? item.nameEn : item.name}
                </h4>
                <p className="text-[10px] text-zinc-400 font-mono mt-0.5">
                  🕒 {item.recommendedHours}
                </p>
              </div>

              {isSelected && (
                <div className="absolute -top-1.5 -right-1.5 bg-amber-400 text-black rounded-full p-0.5 shadow-md">
                  <CheckCircle className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
