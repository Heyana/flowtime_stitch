/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { Timer as TimerIcon, BarChart2, Coffee, User as UserIcon, Settings as SettingsIcon } from 'lucide-react';
import { Session, RhythmSettings, UserProfile, SessionType } from './types';
import { DEFAULT_SETTINGS, DEFAULT_USER_PROFILE, INITIAL_SESSIONS } from './data';
import TimerTab from './components/TimerTab';
import HistoryTab from './components/HistoryTab';
import BreaksTab from './components/BreaksTab';
import SettingsTab from './components/SettingsTab';
import BreathingModal from './components/BreathingModal';
import {
  notifyTimerComplete,
  hapticLight,
  hapticHeavy,
  saveBackgroundCheckpoint,
  loadBackgroundCheckpoint,
  calculateAdjustedTimeLeft,
  setupBackgroundListener,
} from './capacitor-native';

export default function App() {
  // 1. Core States (loaded from localStorage or defaults)
  const [settings, setSettings] = useState<RhythmSettings>(() => {
    const saved = localStorage.getItem('flowtime_settings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('flowtime_profile');
    return saved ? JSON.parse(saved) : DEFAULT_USER_PROFILE;
  });

  const [sessions, setSessions] = useState<Session[]>(() => {
    const saved = localStorage.getItem('flowtime_sessions');
    return saved ? JSON.parse(saved) : INITIAL_SESSIONS;
  });

  // Tab Navigation State: 'timer' | 'history' | 'breaks' | 'settings'
  const [activeTab, setActiveTab] = useState<'timer' | 'history' | 'breaks' | 'settings'>('timer');

  // Mindfulness Guided Breathing Modal Overlay
  const [showBreathingModal, setShowBreathingModal] = useState(false);

  // 2. Timer-specific States (keeps running globally across tabs!)
  const [timerState, setTimerState] = useState<'idle' | 'running' | 'paused'>('idle');
  const [timerMode, setTimerMode] = useState<SessionType>('work');
  const [timeLeft, setTimeLeft] = useState(settings.workDuration * 60);
  const [totalDuration, setTotalDuration] = useState(settings.workDuration * 60);
  const [taskTitle, setTaskTitle] = useState('Deep Work');

  // Tracks the start time of the active session to log history accurately
  const sessionStartTimeRef = useRef<Date | null>(null);

  // 3. Persist core states to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('flowtime_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('flowtime_profile', JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem('flowtime_sessions', JSON.stringify(sessions));
  }, [sessions]);

  // Adjust timeLeft dynamically when settings are saved and timer is idle
  useEffect(() => {
    if (timerState === 'idle') {
      const mins = timerMode === 'work' ? settings.workDuration : settings.restDuration;
      setTimeLeft(mins * 60);
      setTotalDuration(mins * 60);
    }
  }, [settings, timerMode, timerState]);

  // Date and Time Formatter utilities
  const formatHourMinutes = (date: Date) => {
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const strMinutes = minutes < 10 ? '0' + minutes : minutes;
    return `${hours}:${strMinutes} ${ampm}`;
  };

  // 4. Background time tracking (Capacitor + Web fallback)
  useEffect(() => {
    // Capacitor app state listener (resume from background)
    let capCleanup: (() => void) | undefined;
    setupBackgroundListener((adjustedTimeLeft) => {
      if (adjustedTimeLeft > 0) {
        setTimeLeft(adjustedTimeLeft);
      } else {
        // Timer expired while in background
        handleTimerComplete();
      }
    }).then((cleanup) => {
      capCleanup = cleanup;
    });

    // Web fallback: visibilitychange
    const handleVisibility = () => {
      if (document.hidden) {
        // Going to background — save checkpoint
        if (timerState === 'running') {
          saveBackgroundCheckpoint({
            timestamp: Date.now(),
            timeLeft,
            totalDuration,
            timerMode,
            timerState,
          });
        }
      } else {
        // Coming back to foreground — calculate elapsed
        const checkpoint = loadBackgroundCheckpoint();
        if (checkpoint && checkpoint.timerState === 'running') {
          const adjusted = calculateAdjustedTimeLeft(checkpoint);
          if (adjusted > 0) {
            setTimeLeft(adjusted);
          } else {
            handleTimerComplete();
          }
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      capCleanup?.();
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [timerState, timeLeft, totalDuration, timerMode]);

  // 5. Timer Logic Loop
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (timerState === 'running') {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerState, timerMode, settings]);

  // Native notification bridge (replaces raw Web Audio)
  const triggerAlarm = useCallback((mode: SessionType) => {
    notifyTimerComplete(mode === 'work' ? 'focus' : 'rest');
  }, []);

  // Handle Timer completion and state transitions
  const handleTimerComplete = () => {
    triggerAlarm(timerMode);
    hapticHeavy();

    const endTimeObj = new Date();
    const startTimeObj = sessionStartTimeRef.current || new Date(Date.now() - totalDuration * 1000);
    
    // Log Completed Session Item
    const newSessionItem: Session = {
      id: `sess-${Date.now()}`,
      type: timerMode,
      title: timerMode === 'work' ? (taskTitle || 'Deep Work') : 'Rest Break / Recharge',
      durationMinutes: Math.round(totalDuration / 60),
      startTime: formatHourMinutes(startTimeObj),
      endTime: formatHourMinutes(endTimeObj),
      date: new Date().toISOString().split('T')[0],
    };

    setSessions((prev) => [newSessionItem, ...prev]);

    // Handle Streak Updates when a Work session completes
    if (timerMode === 'work') {
      updateStreak();
    }

    // Switch modes based on settings and triggers
    if (timerMode === 'work') {
      // Transition to Rest
      setTimerMode('rest');
      const restSecs = settings.restDuration * 60;
      setTimeLeft(restSecs);
      setTotalDuration(restSecs);
      setTimerState(settings.autoStartBreaks ? 'running' : 'idle');
      sessionStartTimeRef.current = settings.autoStartBreaks ? new Date() : null;
      
      // Auto-navigate to timer view so the user can see recommended exercises immediately
      setActiveTab('timer');
    } else {
      // Transition to Work
      setTimerMode('work');
      const workSecs = settings.workDuration * 60;
      setTimeLeft(workSecs);
      setTotalDuration(workSecs);
      setTimerState(settings.autoStartWork ? 'running' : 'idle');
      sessionStartTimeRef.current = settings.autoStartWork ? new Date() : null;
      setActiveTab('timer');
    }
  };

  // Helper to handle daily streaks
  const updateStreak = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const lastActive = userProfile.lastActiveDate;

    if (lastActive === todayStr) {
      // Already active today, streak stays the same
      return;
    }

    // Check if last active was yesterday
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    let newStreak = userProfile.streak;
    if (lastActive === yesterdayStr) {
      newStreak += 1;
    } else {
      // Streak broken, reset
      newStreak = 1;
    }

    setUserProfile((prev) => ({
      ...prev,
      streak: newStreak,
      lastActiveDate: todayStr,
    }));
  };

  // 6. Timer Control Triggers
  const startTimer = () => {
    setTimerState('running');
    sessionStartTimeRef.current = new Date();
    hapticLight();
  };

  const pauseTimer = () => {
    setTimerState('paused');
  };

  const resumeTimer = () => {
    setTimerState('running');
  };

  // Complete work early and switch to break
  const checkoutEarly = () => {
    if (timerState === 'idle') return;

    // Log the partial session
    const endTimeObj = new Date();
    const startTimeObj = sessionStartTimeRef.current || new Date();
    const elapsedMinutes = Math.max(1, Math.round((totalDuration - timeLeft) / 60));

    const newSessionItem: Session = {
      id: `sess-${Date.now()}`,
      type: 'work',
      title: taskTitle || 'Deep Work (Partial)',
      durationMinutes: elapsedMinutes,
      startTime: formatHourMinutes(startTimeObj),
      endTime: formatHourMinutes(endTimeObj),
      date: new Date().toISOString().split('T')[0],
    };

    setSessions((prev) => [newSessionItem, ...prev]);
    updateStreak();

    // Reset and transition to rest
    setTimerState('idle');
    setTimerMode('rest');
    setTimeLeft(settings.restDuration * 60);
    setTotalDuration(settings.restDuration * 60);
  };

  // Skip rest cycle and start focusing immediately
  const skipRest = () => {
    setTimerState('idle');
    setTimerMode('work');
    setTimeLeft(settings.workDuration * 60);
    setTotalDuration(settings.workDuration * 60);
  };

  // End rest and return to idle focus setup
  const endRestSession = () => {
    setTimerState('idle');
    setTimerMode('work');
    setTimeLeft(settings.workDuration * 60);
    setTotalDuration(settings.workDuration * 60);
  };

  // 6. History Actions
  const handleAddSession = (newSess: Omit<Session, 'id'>) => {
    const completedSession: Session = {
      ...newSess,
      id: `sess-${Date.now()}`,
    };
    setSessions((prev) => [completedSession, ...prev]);
    
    if (newSess.type === 'work') {
      updateStreak();
    }
  };

  const handleClearHistory = () => {
    setSessions([]);
  };

  const handleDeleteSession = (id: string) => {
    setSessions((prev) => prev.filter(s => s.id !== id));
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-on-background select-none font-sans pb-32 md:pb-12">
      
      {/* 1. Header (Responsive App Bar) */}
      <header className="w-full px-5 py-4 flex justify-between items-center max-w-7xl mx-auto z-40 bg-background sticky top-0 border-b border-surface-container-low">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-surface-container-highest shadow-soft flex items-center justify-center border-2 border-primary/10">
            <img 
              className="object-cover w-full h-full" 
              src={userProfile.avatarUrl} 
              alt={userProfile.name}
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-on-surface-variant font-medium">Hello,</span>
            <span className="text-sm font-bold text-on-surface leading-tight">{userProfile.name}</span>
          </div>
        </div>

        {/* Brand Logo Display */}
        <h1 className="font-display text-xl md:text-2xl font-extrabold text-primary tracking-tight flex items-center gap-1.5 cursor-pointer" onClick={() => setActiveTab('timer')}>
          Flowtime
        </h1>

        {/* Shortcuts: Direct navigate to settings */}
        <button 
          onClick={() => setActiveTab('settings')}
          className={`w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container transition-all active:scale-90 duration-200 cursor-pointer ${
            activeTab === 'settings' ? 'text-primary bg-primary/5 border border-primary/10' : 'text-on-surface-variant'
          }`}
          title="Open Settings"
        >
          <SettingsIcon className="w-5 h-5" />
        </button>
      </header>

      {/* 2. Main Viewport */}
      <main className="w-full max-w-5xl mx-auto px-5 pt-6 flex-grow flex flex-col justify-center">
        {activeTab === 'timer' && (
          <TimerTab
            timerState={timerState}
            timerMode={timerMode}
            timeLeft={timeLeft}
            totalDuration={totalDuration}
            taskTitle={taskTitle}
            setTaskTitle={setTaskTitle}
            onStart={startTimer}
            onPause={pauseTimer}
            onResume={resumeTimer}
            onSkipRest={skipRest}
            onEndSession={endRestSession}
            onCheckOut={checkoutEarly}
            onActivityClick={(type) => {
              if (type === 'breathe') {
                setShowBreathingModal(true);
              } else {
                setActiveTab('breaks');
              }
            }}
          />
        )}

        {activeTab === 'history' && (
          <HistoryTab
            sessions={sessions}
            streak={userProfile.streak}
            onAddSession={handleAddSession}
            onClearHistory={handleClearHistory}
            onDeleteSession={handleDeleteSession}
          />
        )}

        {activeTab === 'breaks' && (
          <BreaksTab 
            onStartBreathe={() => setShowBreathingModal(true)} 
          />
        )}

        {activeTab === 'settings' && (
          <SettingsTab
            settings={settings}
            userProfile={userProfile}
            onSaveSettings={setSettings}
            onSaveProfile={setUserProfile}
          />
        )}
      </main>

      {/* 3. Bottom Pill Navigation Bar (Fixed for thumb access) */}
      <nav className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 flex justify-around items-center px-5 py-3.5 bg-surface-container-lowest border border-surface-container/50 rounded-full w-[calc(100%-32px)] max-w-[380px] shadow-lifted">
        {/* Tab 1: Timer */}
        <button 
          onClick={() => setActiveTab('timer')}
          className={`flex items-center justify-center rounded-full w-12 h-12 transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] cursor-pointer ${
            activeTab === 'timer' 
              ? timerMode === 'work'
                ? 'bg-primary text-on-primary scale-110 shadow-soft' 
                : 'bg-secondary text-on-secondary scale-110 shadow-soft'
              : 'text-on-surface-variant hover:bg-surface-container-low'
          }`}
          title="Active Timer"
        >
          <TimerIcon className={`w-5.5 h-5.5 ${activeTab === 'timer' ? 'stroke-[2.5px]' : 'stroke-[2px]'}`} />
        </button>

        {/* Tab 2: Sessions / History */}
        <button 
          onClick={() => setActiveTab('history')}
          className={`flex items-center justify-center rounded-full w-12 h-12 transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] cursor-pointer ${
            activeTab === 'history' 
              ? 'bg-primary text-on-primary scale-110 shadow-soft' 
              : 'text-on-surface-variant hover:bg-surface-container-low'
          }`}
          title="Session History"
        >
          <BarChart2 className={`w-5.5 h-5.5 ${activeTab === 'history' ? 'stroke-[2.5px]' : 'stroke-[2px]'}`} />
        </button>

        {/* Tab 3: Mindful Breaks Catalog */}
        <button 
          onClick={() => setActiveTab('breaks')}
          className={`flex items-center justify-center rounded-full w-12 h-12 transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] cursor-pointer ${
            activeTab === 'breaks' 
              ? 'bg-secondary text-on-secondary scale-110 shadow-soft' 
              : 'text-on-surface-variant hover:bg-surface-container-low'
          }`}
          title="Mindful Breaks"
        >
          <Coffee className={`w-5.5 h-5.5 ${activeTab === 'breaks' ? 'stroke-[2.5px]' : 'stroke-[2px]'}`} />
        </button>

        {/* Tab 4: Settings / Profile */}
        <button 
          onClick={() => setActiveTab('settings')}
          className={`flex items-center justify-center rounded-full w-12 h-12 transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] cursor-pointer ${
            activeTab === 'settings' 
              ? 'bg-primary text-on-primary scale-110 shadow-soft' 
              : 'text-on-surface-variant hover:bg-surface-container-low'
          }`}
          title="Settings"
        >
          <UserIcon className={`w-5.5 h-5.5 ${activeTab === 'settings' ? 'stroke-[2.5px]' : 'stroke-[2px]'}`} />
        </button>
      </nav>

      {/* 4. Immersive Breathing visualizer modal overlay */}
      {showBreathingModal && (
        <BreathingModal onClose={() => setShowBreathingModal(false)} />
      )}

    </div>
  );
}
