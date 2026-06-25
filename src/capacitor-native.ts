/**
 * Capacitor Native Bridge
 *
 * Wraps Capacitor plugin calls with web fallbacks.
 * On web: uses Web Audio / browser APIs as before.
 * On mobile (Capacitor): uses system notifications, haptics, background tracking.
 *
 * @license SPDX-License-Identifier: Apache-2.0
 */

// ---------------------------------------------------------------------------
// Capacitor availability check
// ---------------------------------------------------------------------------

let _capChecked = false;
let _capAvailable = false;

async function isCapacitorAvailable(): Promise<boolean> {
  if (_capChecked) return _capAvailable;
  try {
    const { Capacitor } = await import('@capacitor/core');
    _capAvailable = Capacitor.isNativePlatform();
  } catch {
    _capAvailable = false;
  }
  _capChecked = true;
  return _capAvailable;
}

// ---------------------------------------------------------------------------
// Local Notifications (ring + popup)
// ---------------------------------------------------------------------------

export async function notifyTimerComplete(mode: 'focus' | 'rest'): Promise<void> {
  if (await isCapacitorAvailable()) {
    try {
      const { LocalNotifications } = await import('@capacitor/local-notifications');

      // Request permission first (iOS requires this)
      const permResult = await LocalNotifications.requestPermissions();
      if (permResult.display !== 'granted') {
        console.warn('[Flowtime] Notification permission denied, falling back to web audio');
        fallbackWebAudio();
        return;
      }

      const title =
        mode === 'focus'
          ? 'Focus Session Complete'
          : 'Rest Break Over';

      const body =
        mode === 'focus'
          ? 'Time to take a break. Stretch, hydrate, or breathe.'
          : 'Ready to start your next focus session.';

      await LocalNotifications.schedule({
        notifications: [
          {
            id: Date.now(),
            title,
            body,
            sound: 'timer_end.wav',
            smallIcon: 'ic_stat_flowtime',
            iconColor: mode === 'focus' ? '#b3272e' : '#006d3e',
            schedule: { at: new Date(Date.now() + 100) }, // fire almost immediately
          },
        ],
      });
    } catch (e) {
      console.error('[Flowtime] LocalNotifications failed:', e);
      fallbackWebAudio();
    }
  } else {
    fallbackWebAudio();
  }
}

function fallbackWebAudio(): void {
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
    console.log('[Flowtime] Web Audio fallback warning:', e);
  }
}

// ---------------------------------------------------------------------------
// Haptics
// ---------------------------------------------------------------------------

export async function hapticLight(): Promise<void> {
  if (!(await isCapacitorAvailable())) return;
  try {
    const { Haptics, ImpactStyle } = await import('@capacitor/haptics');
    await Haptics.impact({ style: ImpactStyle.Light });
  } catch {
    // silently ignore
  }
}

export async function hapticHeavy(): Promise<void> {
  if (!(await isCapacitorAvailable())) return;
  try {
    const { Haptics, ImpactStyle } = await import('@capacitor/haptics');
    await Haptics.impact({ style: ImpactStyle.Heavy });
  } catch {
    // silently ignore
  }
}

// ---------------------------------------------------------------------------
// Background time tracking
// ---------------------------------------------------------------------------

const BG_KEY = 'flowtime_bg_checkpoint';

export interface BackgroundCheckpoint {
  timestamp: number; // Date.now() when going to background
  timeLeft: number; // seconds left on timer
  totalDuration: number; // total seconds for this session
  timerMode: 'work' | 'rest';
  timerState: 'running' | 'paused' | 'idle';
}

/** Save checkpoint before app goes to background. */
export function saveBackgroundCheckpoint(checkpoint: BackgroundCheckpoint): void {
  localStorage.setItem(BG_KEY, JSON.stringify(checkpoint));
}

/** Load and clear checkpoint when app resumes. Returns null if none. */
export function loadBackgroundCheckpoint(): BackgroundCheckpoint | null {
  const raw = localStorage.getItem(BG_KEY);
  if (!raw) return null;
  localStorage.removeItem(BG_KEY);
  try {
    return JSON.parse(raw) as BackgroundCheckpoint;
  } catch {
    return null;
  }
}

/**
 * Calculate elapsed milliseconds since the checkpoint.
 * Returns the adjusted timeLeft (in seconds), clamped to >= 0.
 */
export function calculateAdjustedTimeLeft(checkpoint: BackgroundCheckpoint): number {
  const now = Date.now();
  const elapsedMs = now - checkpoint.timestamp;
  const elapsedSeconds = Math.floor(elapsedMs / 1000);
  return Math.max(0, checkpoint.timeLeft - elapsedSeconds);
}

// ---------------------------------------------------------------------------
// App state listener — call this once in App.tsx useEffect
// ---------------------------------------------------------------------------

type BackgroundResumeCallback = (adjustedTimeLeft: number) => void;

export async function setupBackgroundListener(
  onResume: BackgroundResumeCallback,
): Promise<() => void> {
  if (!(await isCapacitorAvailable())) return () => {};

  try {
    const { App } = await import('@capacitor/app');

    // Note: App.addListener returns PluginListenerHandle in Capacitor 5+
    // but the dynamic import may not carry the exact type.
    const listener = await App.addListener('appStateChange', (state: { isActive: boolean }) => {
      if (state.isActive) {
        // App came back to foreground
        const checkpoint = loadBackgroundCheckpoint();
        if (checkpoint && checkpoint.timerState === 'running') {
          const adjusted = calculateAdjustedTimeLeft(checkpoint);
          onResume(adjusted);
        }
      }
    });

    return () => {
      (listener as any).remove?.();
    };
  } catch {
    return () => {};
  }
}
