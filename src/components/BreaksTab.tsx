/**
 * @license SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Footprints, Droplet, Wind, Accessibility, Plus, Minus, Check, Play, Square, Volume2 } from 'lucide-react';
import { RECOMMENDED_ACTIVITIES } from '../data';
import { t } from '../i18n';

interface BreaksTabProps {
  onStartBreathe: () => void;
}

export default function BreaksTab({ onStartBreathe }: BreaksTabProps) {
  const [waterCount, setWaterCount] = useState(() => {
    const saved = localStorage.getItem('flowtime_water_count');
    return saved ? parseInt(saved, 10) : 0;
  });
  useEffect(() => { localStorage.setItem('flowtime_water_count', waterCount.toString()); }, [waterCount]);

  const [stretchActive, setStretchActive] = useState(false);
  const [stretchIndex, setStretchIndex] = useState(0);
  const [stretchTimeLeft, setStretchTimeLeft] = useState(30);
  const [stretchComplete, setStretchComplete] = useState(false);

  const stretches = [
    { name: t('stretch.neckTilt'), desc: t('stretch.neckTiltDesc') },
    { name: t('stretch.shoulderRoll'), desc: t('stretch.shoulderRollDesc') },
    { name: t('stretch.seatedTwist'), desc: t('stretch.seatedTwistDesc') },
    { name: t('stretch.wristStretch'), desc: t('stretch.wristStretchDesc') },
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (stretchActive && stretchTimeLeft > 0) {
      interval = setInterval(() => setStretchTimeLeft((prev) => prev - 1), 1000);
    } else if (stretchActive && stretchTimeLeft === 0) {
      if (stretchIndex < stretches.length - 1) {
        setStretchIndex((prev) => prev + 1);
        setStretchTimeLeft(30);
      } else {
        setStretchActive(false);
        setStretchComplete(true);
        setStretchIndex(0);
        setStretchTimeLeft(30);
        setTimeout(() => setStretchComplete(false), 4000);
      }
    }
    return () => { if (interval) clearInterval(interval); };
  }, [stretchActive, stretchTimeLeft, stretchIndex]);

  const toggleStretch = () => setStretchActive(!stretchActive);
  const resetStretch = () => { setStretchActive(false); setStretchIndex(0); setStretchTimeLeft(30); };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-8 pb-12 animate-fade-in">
      <section className="flex flex-col gap-1.5 text-center md:text-left">
        <h2 className="font-display text-3xl md:text-4xl font-bold text-on-surface">{t('breaks.title')}</h2>
        <p className="font-sans text-sm md:text-base text-on-surface-variant">{t('breaks.subtitle')}</p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recharge Activities */}
        <div className="flex flex-col gap-4">
          <h3 className="text-xs font-semibold text-on-surface-variant tracking-wider uppercase pl-1">{t('breaks.recharge')}</h3>
          <div className="flex flex-col gap-3">
            <div className="bg-surface-container-lowest shadow-soft rounded-xl p-5 flex items-center gap-4 border border-transparent hover:border-surface-container-high transition-all">
              <Footprints className="w-5 h-5 text-secondary flex-shrink-0" />
              <div className="flex-grow">
                <h4 className="text-sm font-semibold text-on-surface">{t('breaks.outdoor')}</h4>
                <p className="text-xs text-on-surface-variant mt-0.5">{t('breaks.outdoorDesc')}</p>
              </div>
            </div>
            <div className="bg-surface-container-lowest shadow-soft rounded-xl p-5 flex items-center gap-4 border border-transparent hover:border-surface-container-high transition-all">
              <Wind className="w-5 h-5 text-secondary flex-shrink-0" />
              <div className="flex-grow">
                <h4 className="text-sm font-semibold text-on-surface">{t('breaks.guided')}</h4>
                <p className="text-xs text-on-surface-variant mt-0.5">{t('breaks.guidedDesc')}</p>
              </div>
              <button onClick={onStartBreathe}
                className="px-4 py-2 bg-secondary text-on-secondary rounded-full font-semibold text-xs active:scale-95 transition-all shadow-soft cursor-pointer"
              >{t('breaks.launch')}</button>
            </div>
          </div>
        </div>

        {/* Water Tracker */}
        <div className="bg-surface-container-lowest rounded-xl shadow-soft p-6 flex flex-col gap-5 border border-transparent hover:border-surface-container-high transition-all">
          <div className="flex items-center gap-2">
            <Droplet className="w-4 h-4 text-secondary" />
            <h3 className="text-xs font-semibold text-on-surface-variant tracking-wider uppercase">{t('breaks.water')}</h3>
          </div>
          <div className="flex flex-col items-center gap-3 py-4 bg-surface-container-low/50 rounded-xl relative overflow-hidden">
            <div className="text-center z-10 flex flex-col gap-1">
              <span className="font-display text-4xl font-bold text-secondary tabular-nums">
                {waterCount} <span className="text-base font-normal text-on-surface-variant">/ 8 {t('unit.cups')}</span>
              </span>
              <span className="text-xs font-medium text-on-surface-variant">
                {waterCount >= 8 ? t('breaks.waterHydrated') : t('breaks.waterSip')}
              </span>
            </div>
            <div className="flex gap-1.5 mt-3">
              {Array.from({ length: 8 }).map((_, idx) => (
                <div key={idx}
                  className={`w-4 h-8 rounded-full border border-secondary/30 transition-all duration-300 ${
                    idx < waterCount ? 'bg-secondary/60 scale-y-105 shadow-[0_2px_8px_rgba(0,109,62,0.2)]' : 'bg-transparent'
                  }`}
                />
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setWaterCount((prev) => Math.max(0, prev - 1))} disabled={waterCount === 0}
              className="flex-grow py-3 bg-surface-container text-on-surface rounded-full font-semibold text-xs active:scale-95 transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-40"
            ><Minus className="w-4 h-4" />{t('breaks.waterReduce')}</button>
            <button onClick={() => setWaterCount((prev) => prev + 1)}
              className="flex-grow py-3 bg-secondary text-on-secondary rounded-full font-semibold text-xs active:scale-95 transition-all flex items-center justify-center gap-1 shadow-soft cursor-pointer"
            ><Plus className="w-4 h-4" />{t('breaks.waterAdd')}</button>
          </div>
        </div>

        {/* Stretch Timer */}
        <div className="bg-surface-container-lowest rounded-xl shadow-soft p-6 flex flex-col gap-4 border border-transparent hover:border-surface-container-high transition-all md:col-span-2">
          {stretchComplete && (
            <div className="flex items-center gap-2 bg-secondary/10 text-secondary rounded-xl px-4 py-3 text-sm font-semibold">
              <Check className="w-4 h-4 flex-shrink-0" />
              {t('breaks.stretchComplete')}
            </div>
          )}
          <div className="flex items-center gap-2">
            <Accessibility className="w-4 h-4 text-primary" />
            <h3 className="text-xs font-semibold text-on-surface-variant tracking-wider uppercase">{t('breaks.deskWellness')}</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center bg-surface-container-low/30 p-5 rounded-xl">
            <div className="flex flex-col gap-2">
              {stretches.map((str, idx) => (
                <div key={idx}
                  className={`flex items-center gap-2.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    stretchIndex === idx ? 'bg-primary text-on-primary font-bold shadow-soft' : 'bg-transparent text-on-surface-variant/60'
                  }`}
                >
                  <span className="w-5 h-5 rounded-full bg-black/10 flex items-center justify-center text-[10px]">{idx + 1}</span>
                  {str.name}
                </div>
              ))}
            </div>
            <div className="flex flex-col items-center text-center px-4 py-2 border-y sm:border-y-0 sm:border-x border-surface-container">
              <span className="font-display text-4xl font-extrabold text-primary tabular-nums">{stretchTimeLeft}s</span>
              <span className="text-xs font-medium text-on-surface-variant mt-1.5">
                {stretchActive ? t('breaks.stretchActive') : t('breaks.stretchReady')}
              </span>
              <div className="w-full bg-surface-container h-1.5 rounded-full mt-3 overflow-hidden">
                <div className="bg-primary h-full transition-all duration-1000 ease-linear" style={{ width: `${(stretchTimeLeft / 30) * 100}%` }} />
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <div className="bg-surface-container-lowest p-3 rounded-lg border border-surface-container-high/50 shadow-xs">
                <h5 className="text-xs font-bold text-primary tracking-wider uppercase">{t('breaks.currentMove')}</h5>
                <h4 className="text-sm font-semibold text-on-surface mt-0.5">{stretches[stretchIndex].name}</h4>
                <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">{stretches[stretchIndex].desc}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={toggleStretch}
                  className="flex-grow py-2 bg-primary text-on-primary rounded-full font-semibold text-xs active:scale-95 transition-all flex items-center justify-center gap-1 cursor-pointer shadow-soft"
                >{stretchActive ? t('breaks.pause') : t('breaks.startStretch')}</button>
                <button onClick={resetStretch}
                  className="px-3 py-2 bg-surface-container hover:bg-surface-container-high text-on-surface-variant rounded-full font-semibold text-xs active:scale-95 transition-all flex items-center justify-center cursor-pointer"
                  title={t('stretch.reset')}
                ><RefreshCw className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function RefreshCw(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
      <path d="M16 16h5v5" />
    </svg>
  );
}
