/**
 * @license SPDX-License-Identifier: Apache-2.0
 */

import { Play, Pause, Square, RefreshCw, Sparkles, Check, Footprints, Droplet, Wind, Accessibility } from 'lucide-react';
import { SessionType } from '../types';
import { t } from '../i18n';

interface TimerTabProps {
  timerState: 'idle' | 'running' | 'paused';
  timerMode: SessionType;
  timeLeft: number;
  totalDuration: number;
  taskTitle: string;
  setTaskTitle: (val: string) => void;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onSkipRest: () => void;
  onEndSession: () => void;
  onCheckOut: () => void;
  onActivityClick: (type: 'walk' | 'hydrate' | 'breathe' | 'stretch') => void;
}

export default function TimerTab({
  timerState, timerMode, timeLeft, totalDuration, taskTitle, setTaskTitle,
  onStart, onPause, onResume, onSkipRest, onEndSession, onCheckOut, onActivityClick,
}: TimerTabProps) {
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const radius = 140;
  const circumference = 2 * Math.PI * radius;
  const progress = totalDuration > 0 ? (totalDuration - timeLeft) / totalDuration : 0;
  const strokeDashoffset = circumference * (1 - progress);
  const isWork = timerMode === 'work';

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center gap-8 py-4 animate-fade-in">
      {/* Dynamic State Badge */}
      <div
        className={`px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider shadow-soft transition-all duration-300 ${
          timerState === 'idle'
            ? 'bg-surface-container text-on-surface-variant'
            : isWork
            ? 'bg-primary-container text-on-primary-container'
            : 'bg-secondary-container text-on-secondary-container'
        }`}
      >
        <span className="flex items-center gap-1.5">
          {timerState === 'idle' ? (
            <>{t('timer.readyFocus')}</>
          ) : isWork ? (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              {t('timer.working')}
            </>
          ) : (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
              {t('timer.resting')}
            </>
          )}
        </span>
      </div>

      {/* Timer Ring */}
      <div className="relative flex items-center justify-center w-76 h-76 md:w-80 md:h-80 select-none">
        <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 320 320">
          <circle cx="160" cy="160" fill="none" r={radius} stroke="#e8e8e8" strokeWidth="12" />
          <circle cx="160" cy="160" fill="none" r={radius}
            stroke={isWork ? '#b3272e' : '#006d3e'} strokeLinecap="round" strokeWidth="16"
            strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-linear"
          />
        </svg>
        <div className="flex flex-col items-center z-10 text-center px-6">
          <span className="font-display text-5xl md:text-6xl font-bold text-on-surface tabular-nums tracking-tight">
            {formatTime(timeLeft)}
          </span>
          <span className="font-sans text-sm text-on-surface-variant mt-2 max-w-[200px] truncate font-medium">
            {timerState === 'idle' ? t('timer.startFocus') : isWork ? (taskTitle || 'Deep Work') : t('timer.focusPlaceholder')}
          </span>
        </div>
      </div>

      {/* Focus Target */}
      {isWork && (
        <div className="w-full bg-surface-container-lowest shadow-soft rounded-xl p-4 flex flex-col gap-2 transition-all duration-300 max-w-sm">
          <label className="text-xs text-on-surface-variant font-medium tracking-wider uppercase">{t('timer.focusTarget')}</label>
          <input type="text" placeholder={t('timer.focusPlaceholder')}
            value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)}
            disabled={timerState !== 'idle'}
            className="w-full bg-transparent border-none focus:outline-none focus:ring-0 text-base font-semibold text-on-surface placeholder:text-on-surface-variant/40 p-0"
          />
        </div>
      )}

      {/* Controls */}
      {isWork ? (
        <div className="w-full flex flex-col items-center gap-4">
          {timerState === 'idle' ? (
            <button id="start-focus" onClick={onStart}
              className="w-full max-w-[240px] bg-primary text-on-primary font-semibold h-14 rounded-full shadow-lifted flex items-center justify-center gap-2 hover:opacity-95 active:scale-95 transition-all duration-200 cursor-pointer text-sm"
            >
              <Play className="w-5 h-5 fill-current" />
              {t('timer.checkinFocus')}
            </button>
          ) : (
            <div className="flex items-center gap-3 w-full justify-center">
              {timerState === 'running' ? (
                <button id="pause-focus" onClick={onPause}
                  className="w-[140px] bg-surface-container-high text-on-surface font-semibold h-12 rounded-full flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all duration-200 cursor-pointer text-sm"
                ><Pause className="w-4 h-4 fill-current" />{t('timer.pause')}</button>
              ) : (
                <button id="resume-focus" onClick={onResume}
                  className="w-[140px] bg-primary text-on-primary font-semibold h-12 rounded-full flex items-center justify-center gap-2 hover:opacity-95 active:scale-95 transition-all duration-200 cursor-pointer text-sm"
                ><Play className="w-4 h-4 fill-current" />{t('timer.resume')}</button>
              )}
              <button id="checkout-focus" onClick={onCheckOut}
                className="w-[140px] bg-primary/10 text-primary border border-primary/20 font-semibold h-12 rounded-full flex items-center justify-center gap-2 hover:bg-primary/20 active:scale-95 transition-all duration-200 cursor-pointer text-sm"
              ><Square className="w-4 h-4 fill-current" />{t('timer.finish')}</button>
            </div>
          )}
          {timerState !== 'idle' && (
            <button onClick={onCheckOut}
              className="text-xs text-on-surface-variant hover:text-on-surface transition-colors pb-1 border-b border-transparent hover:border-surface-variant font-semibold mt-1"
            >{t('timer.checkoutDay')}</button>
          )}
        </div>
      ) : (
        /* Rest Screen */
        <div className="w-full flex flex-col gap-6">
          <div className="w-full flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-on-surface-variant tracking-wider uppercase pl-1">{t('timer.recommended')}</h3>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => onActivityClick('walk')}
                className="bg-surface-container-lowest hover:bg-surface-container-low active:scale-98 shadow-soft rounded-xl p-4 flex flex-col items-start gap-2.5 transition-all duration-200 text-left border border-transparent hover:border-secondary/10 cursor-pointer"
              >
                <div className="bg-secondary/10 text-secondary p-2 rounded-full flex items-center justify-center"><Footprints className="w-5 h-5" /></div>
                <div><h4 className="text-sm font-semibold text-on-surface">{t('timer.shortWalk')}</h4><p className="text-xs text-on-surface-variant mt-0.5">{t('timer.stretchLegs')}</p></div>
              </button>
              <button onClick={() => onActivityClick('hydrate')}
                className="bg-surface-container-lowest hover:bg-surface-container-low active:scale-98 shadow-soft rounded-xl p-4 flex flex-col items-start gap-2.5 transition-all duration-200 text-left border border-transparent hover:border-secondary/10 cursor-pointer"
              >
                <div className="bg-secondary/10 text-secondary p-2 rounded-full flex items-center justify-center"><Droplet className="w-5 h-5" /></div>
                <div><h4 className="text-sm font-semibold text-on-surface">{t('timer.hydrate')}</h4><p className="text-xs text-on-surface-variant mt-0.5">{t('timer.drinkWater')}</p></div>
              </button>
              <button onClick={() => onActivityClick('breathe')}
                className="col-span-2 bg-surface-container-lowest hover:bg-surface-container-low active:scale-98 shadow-soft rounded-xl p-4 flex items-center gap-4 transition-all duration-200 text-left border border-transparent hover:border-secondary/10 cursor-pointer"
              >
                <div className="bg-secondary/10 text-secondary p-3 rounded-full flex items-center justify-center"><Wind className="w-5 h-5 animate-pulse" /></div>
                <div><h4 className="text-sm font-semibold text-on-surface">{t('timer.deepBreathing')}</h4><p className="text-xs text-on-surface-variant mt-0.5">{t('timer.breathingGuide')}</p></div>
              </button>
            </div>
          </div>
          <div className="w-full flex flex-col gap-3 mt-2">
            <button id="skip-rest" onClick={onSkipRest}
              className="w-full bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold py-3.5 rounded-full transition-all duration-200 text-sm active:scale-95 cursor-pointer text-center"
            >{t('timer.skipRest')}</button>
            <button id="end-session" onClick={onEndSession}
              className="w-full bg-error text-on-error font-semibold py-3.5 rounded-full hover:opacity-95 transition-all duration-200 shadow-soft text-sm active:scale-95 cursor-pointer text-center"
            >{t('timer.endSession')}</button>
          </div>
        </div>
      )}
    </div>
  );
}
