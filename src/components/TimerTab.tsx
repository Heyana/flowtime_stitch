/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Play, Pause, Square, RefreshCw, Sparkles, Check, Footprints, Droplet, Wind, Accessibility } from 'lucide-react';
import { SessionType } from '../types';

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
  timerState,
  timerMode,
  timeLeft,
  totalDuration,
  taskTitle,
  setTaskTitle,
  onStart,
  onPause,
  onResume,
  onSkipRest,
  onEndSession,
  onCheckOut,
  onActivityClick,
}: TimerTabProps) {
  // Format seconds to MM:SS
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // SVG Progress circle calculations (Radius = 140, Circumference ≈ 880)
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
            <>Ready to Focus</>
          ) : isWork ? (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Working
            </>
          ) : (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
              Resting
            </>
          )}
        </span>
      </div>

      {/* Timer Ring Container */}
      <div className="relative flex items-center justify-center w-76 h-76 md:w-80 md:h-80 select-none">
        {/* Background Ring */}
        <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 320 320">
          <circle 
            cx="160" 
            cy="160" 
            fill="none" 
            r={radius} 
            stroke="#e8e8e8" 
            strokeWidth="12" 
          />
          {/* Progress Ring */}
          <circle 
            cx="160" 
            cy="160" 
            fill="none" 
            r={radius} 
            stroke={isWork ? '#b3272e' : '#006d3e'} 
            strokeLinecap="round" 
            strokeWidth="16"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-linear"
          />
        </svg>

        {/* Timer Text */}
        <div className="flex flex-col items-center z-10 text-center px-6">
          <span className="font-display text-5xl md:text-6xl font-bold text-on-surface tabular-nums tracking-tight">
            {formatTime(timeLeft)}
          </span>
          <span className="font-sans text-sm text-on-surface-variant mt-2 max-w-[200px] truncate font-medium">
            {timerState === 'idle' ? 'Start focus session' : isWork ? (taskTitle || 'Deep Work') : 'Take a breather'}
          </span>
        </div>
      </div>

      {/* Interactive Task Box (Only visible in Work phase or Idle) */}
      {isWork && (
        <div className="w-full bg-surface-container-lowest shadow-soft rounded-xl p-4 flex flex-col gap-2 transition-all duration-300 max-w-sm">
          <label className="text-xs text-on-surface-variant font-medium tracking-wider uppercase">Focus Target</label>
          <input
            type="text"
            placeholder="What are you working on?"
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
            disabled={timerState !== 'idle'}
            className="w-full bg-transparent border-none focus:outline-none focus:ring-0 text-base font-semibold text-on-surface placeholder:text-on-surface-variant/40 p-0"
          />
        </div>
      )}

      {/* Main Focus Control Button or Rest Options */}
      {isWork ? (
        <div className="w-full flex flex-col items-center gap-4">
          {timerState === 'idle' ? (
            <button 
              id="start-focus"
              onClick={onStart}
              className="w-full max-w-[240px] bg-primary text-on-primary font-semibold h-14 rounded-full shadow-lifted flex items-center justify-center gap-2 hover:opacity-95 active:scale-95 transition-all duration-200 cursor-pointer text-sm"
            >
              <Play className="w-5 h-5 fill-current" />
              Check-in Focus
            </button>
          ) : (
            <div className="flex items-center gap-3 w-full justify-center">
              {timerState === 'running' ? (
                <button 
                  id="pause-focus"
                  onClick={onPause}
                  className="w-[140px] bg-surface-container-high text-on-surface font-semibold h-12 rounded-full flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all duration-200 cursor-pointer text-sm"
                >
                  <Pause className="w-4 h-4 fill-current" />
                  Pause
                </button>
              ) : (
                <button 
                  id="resume-focus"
                  onClick={onResume}
                  className="w-[140px] bg-primary text-on-primary font-semibold h-12 rounded-full flex items-center justify-center gap-2 hover:opacity-95 active:scale-95 transition-all duration-200 cursor-pointer text-sm"
                >
                  <Play className="w-4 h-4 fill-current" />
                  Resume
                </button>
              )}

              <button 
                id="checkout-focus"
                onClick={onCheckOut}
                className="w-[140px] bg-primary/10 text-primary border border-primary/20 font-semibold h-12 rounded-full flex items-center justify-center gap-2 hover:bg-primary/20 active:scale-95 transition-all duration-200 cursor-pointer text-sm"
              >
                <Square className="w-4 h-4 fill-current" />
                Finish
              </button>
            </div>
          )}

          {/* Secondary Action */}
          {timerState !== 'idle' && (
            <button 
              onClick={onCheckOut}
              className="text-xs text-on-surface-variant hover:text-on-surface transition-colors pb-1 border-b border-transparent hover:border-surface-variant font-semibold mt-1"
            >
              Check-out for the day
            </button>
          )}
        </div>
      ) : (
        /* Resting State Screen recommended activity grids + Action Buttons */
        <div className="w-full flex flex-col gap-6">
          {/* Activity Bento Grid inside Resting screen */}
          <div className="w-full flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-on-surface-variant tracking-wider uppercase pl-1">Recommended</h3>
            <div className="grid grid-cols-2 gap-3">
              {/* Short Walk */}
              <button 
                onClick={() => onActivityClick('walk')}
                className="bg-surface-container-lowest hover:bg-surface-container-low active:scale-98 shadow-soft rounded-xl p-4 flex flex-col items-start gap-2.5 transition-all duration-200 text-left border border-transparent hover:border-secondary/10 cursor-pointer"
              >
                <div className="bg-secondary/10 text-secondary p-2 rounded-full flex items-center justify-center">
                  <Footprints className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-on-surface">Short Walk</h4>
                  <p className="text-xs text-on-surface-variant mt-0.5">Stretch your legs</p>
                </div>
              </button>

              {/* Hydrate */}
              <button 
                onClick={() => onActivityClick('hydrate')}
                className="bg-surface-container-lowest hover:bg-surface-container-low active:scale-98 shadow-soft rounded-xl p-4 flex flex-col items-start gap-2.5 transition-all duration-200 text-left border border-transparent hover:border-secondary/10 cursor-pointer"
              >
                <div className="bg-secondary/10 text-secondary p-2 rounded-full flex items-center justify-center">
                  <Droplet className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-on-surface">Hydrate</h4>
                  <p className="text-xs text-on-surface-variant mt-0.5">Drink some water</p>
                </div>
              </button>

              {/* Deep Breathing (Full-width card) */}
              <button 
                onClick={() => onActivityClick('breathe')}
                className="col-span-2 bg-surface-container-lowest hover:bg-surface-container-low active:scale-98 shadow-soft rounded-xl p-4 flex items-center gap-4 transition-all duration-200 text-left border border-transparent hover:border-secondary/10 cursor-pointer"
              >
                <div className="bg-secondary/10 text-secondary p-3 rounded-full flex items-center justify-center">
                  <Wind className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-on-surface">Deep Breathing</h4>
                  <p className="text-xs text-on-surface-variant mt-0.5">Guided breathing visualizer</p>
                </div>
              </button>
            </div>
          </div>

          {/* Resting Control buttons */}
          <div className="w-full flex flex-col gap-3 mt-2">
            <button 
              id="skip-rest"
              onClick={onSkipRest}
              className="w-full bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold py-3.5 rounded-full transition-all duration-200 text-sm active:scale-95 cursor-pointer text-center"
            >
              Skip Rest
            </button>
            <button 
              id="end-session"
              onClick={onEndSession}
              className="w-full bg-error text-on-error font-semibold py-3.5 rounded-full hover:opacity-95 transition-all duration-200 shadow-soft text-sm active:scale-95 cursor-pointer text-center"
            >
              End Session
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
