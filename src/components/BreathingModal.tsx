/**
 * @license SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { X, Play, Pause, Wind } from 'lucide-react';
import { t } from '../i18n';

interface BreathingModalProps { onClose: () => void; }
type BreathingPhase = 'inhale' | 'hold' | 'exhale' | 'rest';

export default function BreathingModal({ onClose }: BreathingModalProps) {
  const [isActive, setIsActive] = useState(true);
  const [timeLeft, setTimeLeft] = useState(120);
  const [phase, setPhase] = useState<BreathingPhase>('inhale');
  const [phaseTimeLeft, setPhaseTimeLeft] = useState(4);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
        setPhaseTimeLeft((prevPhaseTime) => {
          if (prevPhaseTime <= 1) {
            setPhase((prevPhase) => {
              switch (prevPhase) {
                case 'inhale': return 'hold';
                case 'hold': return 'exhale';
                case 'exhale': return 'rest';
                default: return 'inhale';
              }
            });
            return 4;
          }
          return prevPhaseTime - 1;
        });
      }, 1000);
    } else if (timeLeft === 0) { setIsActive(false); }
    return () => { if (timer) clearInterval(timer); };
  }, [isActive, timeLeft]);

  let circleScale = 'scale-50';
  let phaseText = t('breathing.inhale');
  let phaseBg = 'bg-secondary/10';
  let phaseTextColor = 'text-secondary';
  let ringColor = 'ring-secondary/30';

  if (phase === 'inhale') {
    circleScale = 'scale-110'; phaseText = t('breathing.inhale'); phaseBg = 'bg-secondary/15'; phaseTextColor = 'text-secondary'; ringColor = 'ring-secondary/40';
  } else if (phase === 'hold') {
    circleScale = 'scale-110 opacity-90'; phaseText = t('breathing.hold'); phaseBg = 'bg-primary/15'; phaseTextColor = 'text-primary'; ringColor = 'ring-primary/40';
  } else if (phase === 'exhale') {
    circleScale = 'scale-60'; phaseText = t('breathing.exhale'); phaseBg = 'bg-secondary-container/20'; phaseTextColor = 'text-on-secondary-container'; ringColor = 'ring-secondary-container/30';
  } else if (phase === 'rest') {
    circleScale = 'scale-50 opacity-50'; phaseText = t('breathing.rest'); phaseBg = 'bg-tertiary/10'; phaseTextColor = 'text-tertiary'; ringColor = 'ring-tertiary/20';
  }

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-surface/95 flex flex-col items-center justify-center p-6 z-50 animate-fade-in">
      <div className="absolute top-6 left-6 right-6 flex justify-between items-center max-w-2xl mx-auto">
        <div className="flex items-center gap-2 text-secondary">
          <Wind className="w-5 h-5" />
          <span className="font-display text-sm font-bold tracking-wider uppercase text-on-surface">{t('breathing.title')}</span>
        </div>
        <button onClick={onClose} className="p-2 bg-surface-container hover:bg-surface-container-high rounded-full transition-colors cursor-pointer text-on-surface-variant" title={t('tooltip.exit')}><X className="w-5 h-5" /></button>
      </div>
      <div className="flex-grow flex flex-col items-center justify-center gap-12 w-full max-w-md">
        <div className="relative w-72 h-72 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full ring-1 ring-surface-container-high" />
          <div className={`absolute -inset-4 rounded-full ring-1 ${ringColor} transition-colors duration-[3000ms]`} />
          <div className={`w-48 h-48 rounded-full flex flex-col items-center justify-center text-center transition-all duration-[4000ms] ease-in-out shadow-soft ${circleScale} ${phaseBg}`}>
            <span className={`font-display text-lg font-bold tracking-wide transition-colors duration-500 ${phaseTextColor}`}>{phaseText}</span>
            <span className={`text-2xl font-extrabold mt-1 tabular-nums ${phaseTextColor}`}>{phaseTimeLeft}s</span>
          </div>
        </div>
        <div className="flex gap-2">
          {['inhale', 'hold', 'exhale', 'rest'].map((p) => (
            <div key={p} className={`h-2 rounded-full transition-all duration-300 ${phase === p ? 'w-8 bg-secondary shadow-soft' : 'w-2 bg-surface-container-high'}`} />
          ))}
        </div>
        <div className="flex flex-col items-center gap-4 w-full">
          {timeLeft > 0 ? (
            <div className="flex items-center gap-4">
              <button onClick={() => setIsActive(!isActive)} className="w-14 h-14 bg-on-surface text-surface rounded-full flex items-center justify-center shadow-lifted hover:scale-105 active:scale-95 transition-all cursor-pointer">
                {isActive ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
              </button>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-base font-bold text-secondary">{t('breathing.complete')}</p>
              <button onClick={onClose} className="mt-3 px-6 py-2 bg-primary text-on-primary rounded-full font-semibold text-xs active:scale-95 transition-all cursor-pointer">{t('breathing.return')}</button>
            </div>
          )}
          <span className="text-xs text-on-surface-variant font-mono tracking-wider">{t('timer.timeLeft')}: <span className="font-bold text-on-surface tabular-nums">{formatTime(timeLeft)}</span></span>
        </div>
      </div>
      <p className="text-center text-xs text-on-surface-variant/70 max-w-xs leading-relaxed mb-6">{t('breathing.footer')}</p>
    </div>
  );
}
