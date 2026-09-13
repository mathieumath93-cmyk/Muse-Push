import React, { useState, useEffect } from 'react';
import { Clock, Globe2, Sun, Moon, Sparkles, CheckCircle2 } from 'lucide-react';
import { TIME_ZONES } from '../data';

interface TimeZoneBarProps {
  selectedZone: string;
  onSelectZone: (zoneId: 'FR_CET' | 'US_EST' | 'US_CST' | 'US_PST') => void;
}

interface TzStatus {
  id: string;
  label: string;
  flag: string;
  localTime: string;
  hour: number;
  period: string;
  isPeakHour: boolean;
}

export const TimeZoneRadar: React.FC<TimeZoneBarProps> = ({ selectedZone, onSelectZone }) => {
  const [clockData, setClockData] = useState<TzStatus[]>([]);

  useEffect(() => {
    const updateTimes = () => {
      const now = new Date();
      const updated = TIME_ZONES.map(z => {
        const timeStr = new Intl.DateTimeFormat('fr-FR', {
          timeZone: z.tz,
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        }).format(now);

        const hour = parseInt(new Intl.DateTimeFormat('en-US', {
          timeZone: z.tz,
          hour: 'numeric',
          hour12: false
        }).format(now), 10);

        // Peak OF/MYM hours: usually 19h-01h local fan time
        const isPeakHour = hour >= 20 || hour <= 1;

        let period = 'Après-midi';
        if (hour >= 6 && hour < 12) period = 'Matinée réveil';
        else if (hour >= 12 && hour < 14) period = 'Pause déjeuner';
        else if (hour >= 14 && hour < 19) period = 'Fin de journée';
        else if (hour >= 19 && hour <= 23) period = '🔥 Heure de pointe';
        else period = '🌙 Nuit intime';

        return {
          id: z.id,
          label: z.label.split('(')[0].trim(),
          flag: z.flag,
          localTime: timeStr,
          hour,
          period,
          isPeakHour
        };
      });

      setClockData(updated);
    };

    updateTimes();
    const interval = setInterval(updateTimes, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-[#121217] border border-white/10 rounded-2xl p-4 shadow-xl mb-6 backdrop-blur-md">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs uppercase tracking-wider font-semibold text-zinc-400 flex items-center gap-1.5">
            <Globe2 className="w-3.5 h-3.5 text-emerald-400" /> Radar Fuseaux Horaires Fans
          </span>
        </div>
        <span className="text-[11px] text-zinc-400 font-mono flex items-center gap-1">
          <Clock className="w-3 h-3 text-zinc-500" /> Synchro temps réel
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        {clockData.map((tz) => {
          const isSelected = selectedZone === tz.id;
          return (
            <button
              key={tz.id}
              type="button"
              onClick={() => onSelectZone(tz.id as any)}
              className={`text-left p-3 rounded-xl transition-all duration-200 relative group overflow-hidden border ${
                isSelected
                  ? 'bg-rose-500/10 border-rose-500/60 shadow-[0_0_20px_rgba(244,63,94,0.15)] ring-1 ring-rose-500/40'
                  : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05] hover:border-white/15'
              }`}
            >
              {tz.isPeakHour && (
                <div className="absolute top-2 right-2 flex items-center gap-1 bg-amber-500/20 text-amber-300 text-[10px] px-1.5 py-0.5 rounded-full border border-amber-500/30">
                  <Sparkles className="w-2.5 h-2.5" /> Peak
                </div>
              )}

              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg leading-none">{tz.flag}</span>
                <span className={`text-xs font-medium truncate ${isSelected ? 'text-rose-200' : 'text-zinc-300'}`}>
                  {tz.label}
                </span>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold font-mono tracking-tight text-white">
                  {tz.localTime}
                </span>
                <span className="text-[11px] text-zinc-400 truncate">
                  {tz.period}
                </span>
              </div>

              {isSelected && (
                <div className="mt-1.5 flex items-center gap-1 text-[11px] text-rose-400 font-medium">
                  <CheckCircle2 className="w-3 h-3" /> Fuseau actif pour le push
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
