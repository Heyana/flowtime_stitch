/**
 * DebugTab — native feature test panel
 *
 * Test buttons for: sound, notification popup, status bar countdown.
 * All features auto-detect Capacitor and fall back to web equivalents.
 *
 * @license SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from 'react';
import { Bug, Volume2, Bell, Timer } from 'lucide-react';

// ---------------------------------------------------------------------------
// Web Audio chime (same as fallback in capacitor-native.ts)
// ---------------------------------------------------------------------------
function playWebChime(): void {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, ctx.currentTime);
    osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.15);
    osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.3);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.6);
  } catch (e) {
    console.error('[Debug] Web Audio failed:', e);
  }
}

// ---------------------------------------------------------------------------
// Native notification helpers
// ---------------------------------------------------------------------------
async function isNative(): Promise<boolean> {
  try {
    const { Capacitor } = await import('@capacitor/core');
    return Capacitor.isNativePlatform();
  } catch {
    return false;
  }
}

async function showTestNotification(): Promise<void> {
  if (await isNative()) {
    try {
      const { LocalNotifications } = await import('@capacitor/local-notifications');
      await LocalNotifications.requestPermissions();
      await LocalNotifications.schedule({
        notifications: [
          {
            id: 9998,
            title: 'Flowtime Debug',
            body: 'This is a test notification popup!',
            sound: 'timer_end.wav',
            schedule: { at: new Date(Date.now() + 200) },
          },
        ],
      });
    } catch (e) {
      console.error('[Debug] Notification failed:', e);
    }
  } else {
    // Web fallback: show alert + chime
    playWebChime();
    alert('Web mode: Notification would appear here.\n\nOn Android, this shows a system notification with sound.');
  }
}

// ---------------------------------------------------------------------------
// DebugTab component
// ---------------------------------------------------------------------------
export default function DebugTab() {
  const [testResult, setTestResult] = useState('');
  const [countdownActive, setCountdownActive] = useState(false);
  const [countdownLeft, setCountdownLeft] = useState(10);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  // Countdown logic
  useEffect(() => {
    if (!countdownActive) return;

    const tick = () => {
      setCountdownLeft((prev) => {
        const next = prev - 1;
        if (next <= 0) {
          setCountdownActive(false);
          // Trigger notification when countdown ends
          triggerCountdownComplete();
          return 0;
        }
        // Update notification progress every second
        updateCountdownNotification(next);
        return next;
      });
    };

    countdownRef.current = setInterval(tick, 1000);

    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [countdownActive]);

  // Show initial countdown notification
  const startCountdown = async () => {
    setCountdownLeft(10);
    setCountdownActive(true);
    setTestResult('Countdown started — minimize app to see status bar');

    if (await isNative()) {
      try {
        const { LocalNotifications } = await import('@capacitor/local-notifications');
        await LocalNotifications.requestPermissions();
        await LocalNotifications.schedule({
          notifications: [
            {
              id: 9999,
              title: 'Flowtime Countdown',
              body: '10s remaining',
              ongoing: true,
              schedule: { at: new Date(Date.now() + 100) },
            },
          ],
        });
      } catch (e) {
        console.error('[Debug] Countdown notification failed:', e);
      }
    }

    // Auto-stop after 10s
    setTimeout(() => {
      setCountdownActive(false);
      if (countdownRef.current) clearInterval(countdownRef.current);
    }, 11000);
  };

  const updateCountdownNotification = async (remaining: number) => {
    if (!(await isNative())) return;
    try {
      const { LocalNotifications } = await import('@capacitor/local-notifications');
      // Cancel previous and reschedule with updated body
      await LocalNotifications.cancel({ notifications: [{ id: 9999 }] });
      await LocalNotifications.schedule({
        notifications: [
          {
            id: 9999,
            title: 'Flowtime Countdown',
            body: `${remaining}s remaining`,
            ongoing: true,
            schedule: { at: new Date(Date.now() + 200) },
          },
        ],
      });
    } catch {
      // silently fail on rapid updates
    }
  };

  const triggerCountdownComplete = async () => {
    setTestResult('Countdown complete — notification fired!');
    playWebChime();

    if (await isNative()) {
      try {
        const { LocalNotifications } = await import('@capacitor/local-notifications');
        await LocalNotifications.cancel({ notifications: [{ id: 9999 }] });
        await LocalNotifications.schedule({
          notifications: [
            {
              id: 9990,
              title: 'Flowtime',
              body: 'Countdown finished! Time to focus.',
              sound: 'timer_end.wav',
              schedule: { at: new Date(Date.now() + 100) },
            },
          ],
        });
      } catch {
        // ignore
      }
    }
  };

  const handleStopCountdown = async () => {
    setCountdownActive(false);
    setCountdownLeft(10);
    setTestResult('Countdown cancelled');
    if (countdownRef.current) clearInterval(countdownRef.current);

    if (await isNative()) {
      try {
        const { LocalNotifications } = await import('@capacitor/local-notifications');
        await LocalNotifications.cancel({ notifications: [{ id: 9999 }] });
      } catch {
        // ignore
      }
    }
  };

  return (
    <div className="w-full max-w-md mx-auto flex flex-col gap-6 py-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-2 px-1">
        <Bug className="w-5 h-5 text-tertiary" />
        <h2 className="font-display text-2xl font-bold text-on-surface">Debug Panel</h2>
      </div>

      <p className="text-xs text-on-surface-variant leading-relaxed">
        Test native features. On Android, these trigger real system notifications, sounds, and status bar countdowns.
        On web, they fall back to browser equivalents.
      </p>

      {/* Test Buttons Grid */}
      <div className="grid grid-cols-1 gap-3">
        {/* Test Sound */}
        <button
          onClick={() => {
            playWebChime();
            setTestResult('Sound played (C5→E5→G5 chime)');
          }}
          className="bg-surface-container-lowest shadow-soft rounded-xl p-5 flex items-center gap-4 border border-transparent hover:border-primary/20 transition-all active:scale-[0.98] cursor-pointer"
        >
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
            <Volume2 className="w-5 h-5" />
          </div>
          <div className="text-left flex-grow">
            <h4 className="text-sm font-semibold text-on-surface">Test Sound</h4>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Play timer chime via Web Audio API
            </p>
          </div>
          <span className="text-[10px] text-primary font-bold tracking-wider uppercase bg-primary/5 px-2 py-1 rounded-full">RUN</span>
        </button>

        {/* Test Popup */}
        <button
          onClick={async () => {
            await showTestNotification();
            setTestResult('Notification popup sent');
          }}
          className="bg-surface-container-lowest shadow-soft rounded-xl p-5 flex items-center gap-4 border border-transparent hover:border-secondary/20 transition-all active:scale-[0.98] cursor-pointer"
        >
          <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center text-secondary">
            <Bell className="w-5 h-5" />
          </div>
          <div className="text-left flex-grow">
            <h4 className="text-sm font-semibold text-on-surface">Test Popup</h4>
            <p className="text-xs text-on-surface-variant mt-0.5">
              System notification with sound
            </p>
          </div>
          <span className="text-[10px] text-secondary font-bold tracking-wider uppercase bg-secondary/5 px-2 py-1 rounded-full">RUN</span>
        </button>

        {/* Status Bar Countdown */}
        <div className="bg-surface-container-lowest shadow-soft rounded-xl p-5 flex flex-col gap-3 border border-transparent hover:border-primary/10 transition-all">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary flex-shrink-0">
              <Timer className="w-5 h-5" />
            </div>
            <div className="text-left flex-grow">
              <h4 className="text-sm font-semibold text-on-surface">Status Bar Countdown</h4>
              <p className="text-xs text-on-surface-variant mt-0.5">
                10-second notification in status bar
              </p>
            </div>
          </div>

          {countdownActive ? (
            <div className="flex items-center gap-3">
              <div className="flex-grow bg-surface-container rounded-full h-2 overflow-hidden">
                <div
                  className="bg-primary h-full transition-all duration-1000 ease-linear rounded-full"
                  style={{ width: `${(countdownLeft / 10) * 100}%` }}
                />
              </div>
              <span className="font-mono text-sm font-bold text-primary tabular-nums min-w-[2ch]">
                {countdownLeft}s
              </span>
              <button
                onClick={handleStopCountdown}
                className="px-3 py-1.5 bg-error/10 text-error rounded-full text-xs font-semibold active:scale-95 transition-all cursor-pointer"
              >
                Stop
              </button>
            </div>
          ) : (
            <button
              onClick={startCountdown}
              className="w-full bg-primary/10 text-primary rounded-full py-2.5 text-xs font-semibold hover:bg-primary/20 active:scale-[0.98] transition-all cursor-pointer"
            >
              Start 10s Countdown
            </button>
          )}
        </div>
      </div>

      {/* Result log */}
      {testResult && (
        <div className="bg-surface-container-lowest shadow-soft rounded-xl p-4 border border-surface-container-high">
          <p className="text-xs text-on-surface-variant font-mono">{testResult}</p>
        </div>
      )}

      {/* Platform info */}
      <div className="text-center text-[10px] text-on-surface-variant/40 font-mono mt-4">
        Capacitor native: checking on button press...
      </div>
    </div>
  );
}
